import {
  getListing,
  getOffer,
  createOffer,
  updateOffer,
  updateListingStatus,
  insertOfferEvent,
  createNotification,
  listPendingOffersForListing,
  listBackupOffersForListing,
  listOffersNeedingReminder,
  markReminderSent,
  type Offer,
  type Listing,
} from './db'
import { centsToDisplay } from './money'
import { offerDeadline, isPastDeadline } from './time'

export class OfferError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function carLabel(l: Listing) {
  return [l.year, l.make, l.model].filter(Boolean).join(' ')
}

// There's no background job to sweep for overdue offers — this runs lazily
// whenever an offer is fetched for display or about to be acted on, and
// flips it to 'expired' right then if its 48-hour window has passed.
// Whoever's turn it was (the one who let it lapse) gets logged as the
// event's actor; the other side gets notified their offer expired.
async function expireIfOverdue<T extends Offer>(offer: T): Promise<T> {
  if (offer.status !== 'pending_seller' && offer.status !== 'pending_buyer') return offer
  if (!isPastDeadline(offer.expires_at)) return offer

  const applied = await updateOffer(offer.id, { status: 'expired' }, offer.status)
  if (!applied) {
    // Someone else's action (or expiry) landed first — return the
    // authoritative row rather than assuming ours won.
    const fresh = await getOffer(offer.id)
    return (fresh as T) ?? ({ ...offer, status: 'expired' } as T)
  }

  const listing = await getListing(offer.listing_id)
  if (listing) {
    const responsibleId = offer.status === 'pending_seller' ? listing.seller_id : offer.buyer_id
    const notifiedId = offer.status === 'pending_seller' ? offer.buyer_id : listing.seller_id
    await insertOfferEvent({ offer_id: offer.id, actor_id: responsibleId, action: 'expire' })
    await createNotification({
      user_id: notifiedId,
      type: 'offer_expired',
      title: `An offer on the ${carLabel(listing)} expired`,
      body: '48 hours passed with no response — it was automatically closed.',
      link: '/dashboard',
    })
    await createNotification({
      user_id: responsibleId,
      type: 'offer_expired',
      title: `You missed the 48-hour window on the ${carLabel(listing)}`,
      body: 'The offer was automatically closed.',
      link: '/dashboard',
    })
  }

  return { ...offer, status: 'expired' } as T
}

// Dashboard-facing: sweep a batch of offers, expiring any that are overdue,
// so the page never shows a stale "Awaiting seller" past the deadline.
export async function expireOverdueOffers<T extends Offer>(offers: T[]): Promise<T[]> {
  return Promise.all(offers.map(expireIfOverdue))
}

// Called by the scheduled /api/cron/offer-reminders job (there's no way to
// do this lazily — nobody has to visit the site for a reminder to be due).
// Sends a "time's running out" notification/email to whoever still owes a
// response on an offer with under 24h left on its 48h clock, once per
// window. Returns how many were sent, for the route to report back.
export async function sendPendingReminders(): Promise<number> {
  const offers = await listOffersNeedingReminder()
  let sent = 0
  for (const offer of offers) {
    const listing = offer.listing
    const responsibleId = offer.status === 'pending_seller' ? listing.seller_id : offer.buyer_id
    await createNotification({
      user_id: responsibleId,
      type: 'offer_reminder',
      title: `Respond soon: your window on the ${carLabel(listing)} closes in under 24h`,
      body: `${centsToDisplay(offer.amount)} — reply before the 48-hour window closes or the offer auto-closes.`,
      link: '/dashboard',
    })
    await markReminderSent(offer.id)
    sent++
  }
  return sent
}

// ─── Buyer submits a new offer ─────────────────────────────────────────
// Offers below the listing's minimum are auto-declined immediately rather
// than bothering the seller with them — the minimum is shown to buyers on
// the listing page too, so this should only trigger if someone bypasses
// the form's own validation.
export async function submitOffer(input: { listingId: number; buyerId: string; amountCents: number }) {
  const listing = await getListing(input.listingId)
  if (!listing) throw new OfferError('Listing not found.', 404)
  if (listing.status !== 'active' && listing.status !== 'pending_sale') {
    throw new OfferError('This listing is no longer active.', 409)
  }
  if (listing.seller_id === input.buyerId) throw new OfferError("You can't make an offer on your own listing.", 400)
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new OfferError('Enter a valid offer amount.', 400)
  }

  const belowMinimum = input.amountCents < listing.minimum_offer
  // A listing with an accepted-but-not-closed deal still takes offers, but
  // they're held back as backups — not shown or notified to the seller —
  // until that deal falls through. See the 'fall_through' handling below.
  const isBackup = !belowMinimum && listing.status === 'pending_sale'

  const offer = await createOffer({
    listing_id: listing.id,
    buyer_id: input.buyerId,
    amount: input.amountCents,
    status: belowMinimum ? 'auto_declined' : isBackup ? 'backup' : 'pending_seller',
    expires_at: !belowMinimum && !isBackup ? offerDeadline() : null,
  })

  await insertOfferEvent({
    offer_id: offer.id,
    actor_id: input.buyerId,
    action: belowMinimum ? 'auto_decline' : 'offer',
    amount: input.amountCents,
  })

  if (belowMinimum) {
    return { offer, belowMinimum: true, backup: false, minimum: listing.minimum_offer }
  }

  if (isBackup) {
    // Deliberately no notification to the seller — that's the whole point.
    return { offer, belowMinimum: false, backup: true }
  }

  await createNotification({
    user_id: listing.seller_id,
    type: 'new_offer',
    title: `New offer on your ${carLabel(listing)}`,
    body: `${centsToDisplay(input.amountCents)} offered.`,
    link: '/dashboard',
  })

  return { offer, belowMinimum: false, backup: false }
}

type RespondAction = 'accept' | 'counter' | 'decline' | 'withdraw' | 'fall_through' | 'mark_sold'

export async function respondToOffer(input: {
  offerId: number
  actorId: string
  action: RespondAction
  counterAmountCents?: number
}) {
  let offer = await getOffer(input.offerId)
  if (!offer) throw new OfferError('Offer not found.', 404)
  offer = await expireIfOverdue(offer)
  if (offer.status === 'expired') {
    throw new OfferError('This offer expired — 48 hours passed with no response.', 409)
  }
  const listing = await getListing(offer.listing_id)
  if (!listing) throw new OfferError('Listing not found.', 404)

  const isSeller = listing.seller_id === input.actorId
  const isBuyer = offer.buyer_id === input.actorId
  if (!isSeller && !isBuyer) throw new OfferError('Not authorized.', 403)

  if (input.action === 'withdraw') {
    if (!isBuyer) throw new OfferError('Only the buyer can withdraw an offer.', 403)
    const withdrawable: Offer['status'][] = ['pending_seller', 'pending_buyer', 'backup']
    if (!withdrawable.includes(offer.status)) {
      throw new OfferError('This offer is no longer open.', 409)
    }
    const wasBackup = offer.status === 'backup'
    const applied = await updateOffer(offer.id, { status: 'withdrawn' }, offer.status)
    if (!applied) throw new OfferError('This offer is no longer open.', 409)
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'withdraw' })
    // The seller was never shown this offer — don't tip them off that it
    // existed just because it was withdrawn.
    if (!wasBackup) {
      await createNotification({
        user_id: listing.seller_id,
        type: 'offer_withdrawn',
        title: `An offer on your ${carLabel(listing)} was withdrawn`,
        link: '/dashboard',
      })
    }
    return { offer: { ...offer, status: 'withdrawn' as const } }
  }

  if (input.action === 'fall_through') {
    if (offer.status !== 'accepted') throw new OfferError('This offer is not an active deal.', 409)
    const applied = await updateOffer(offer.id, { status: 'fell_through' }, 'accepted')
    if (!applied) throw new OfferError('This offer is not an active deal.', 409)
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'fall_through' })

    const counterpartyId = isSeller ? offer.buyer_id : listing.seller_id
    await createNotification({
      user_id: counterpartyId,
      type: 'deal_fell_through',
      title: `The deal on the ${carLabel(listing)} fell through`,
      link: '/dashboard',
    })

    // Promote any backup offers that piled up while this deal was pending
    // — now it's the seller's turn to look at them, each with a fresh
    // 48-hour window, same as a brand-new offer.
    const backups = await listBackupOffersForListing(listing.id)
    for (const backup of backups) {
      const promoted = await updateOffer(
        backup.id,
        { status: 'pending_seller', expires_at: offerDeadline(), reminder_sent_at: null },
        'backup'
      )
      if (!promoted) continue
      await insertOfferEvent({ offer_id: backup.id, actor_id: listing.seller_id, action: 'reactivate' })
      await createNotification({
        user_id: backup.buyer_id,
        type: 'backup_offer_active',
        title: `Your backup offer on the ${carLabel(listing)} is now active`,
        body: 'The original deal fell through — the seller is reviewing your offer.',
        link: '/dashboard',
      })
    }
    if (backups.length > 0) {
      await createNotification({
        user_id: listing.seller_id,
        type: 'backup_offers_ready',
        title: `${backups.length} backup offer${backups.length > 1 ? 's' : ''} ready to review on the ${carLabel(listing)}`,
        link: '/dashboard',
      })
    }

    await updateListingStatus(listing.id, 'active')
    return { offer: { ...offer, status: 'fell_through' as const } }
  }

  if (input.action === 'mark_sold') {
    if (!isSeller) throw new OfferError('Only the seller can mark a deal as sold.', 403)
    if (offer.status !== 'accepted') throw new OfferError('This offer is not an active deal.', 409)
    const applied = await updateOffer(offer.id, { status: 'sold' }, 'accepted')
    if (!applied) throw new OfferError('This offer is not an active deal.', 409)
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'mark_sold' })
    await updateListingStatus(listing.id, 'sold')

    await createNotification({
      user_id: offer.buyer_id,
      type: 'deal_closed',
      title: `Marked sold: the ${carLabel(listing)}`,
      body: `${centsToDisplay(offer.amount)} — the sale is complete.`,
      link: '/dashboard',
    })

    // Any backup offers that piled up are moot now — the car's gone.
    const backups = await listBackupOffersForListing(listing.id)
    for (const backup of backups) {
      const declined = await updateOffer(backup.id, { status: 'auto_declined' }, 'backup')
      if (!declined) continue
      await insertOfferEvent({ offer_id: backup.id, actor_id: listing.seller_id, action: 'auto_decline' })
      await createNotification({
        user_id: backup.buyer_id,
        type: 'listing_sold',
        title: `The ${carLabel(listing)} was sold to another buyer`,
        link: '/dashboard',
      })
    }

    return { offer: { ...offer, status: 'sold' as const } }
  }

  // accept/counter/decline — must be whoever's turn it is
  const expectedTurn = isSeller ? 'pending_seller' : 'pending_buyer'
  if (offer.status !== expectedTurn) {
    throw new OfferError('This offer is not waiting on your response.', 409)
  }

  if (input.action === 'accept') {
    const applied = await updateOffer(offer.id, { status: 'accepted' }, expectedTurn)
    if (!applied) throw new OfferError('This offer is not waiting on your response.', 409)
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'accept' })
    // Not 'sold' yet — pending_sale, so the deal can still fall through.
    // Other buyers can keep making offers in the meantime; see
    // submitOffer()'s 'backup' handling.
    await updateListingStatus(listing.id, 'pending_sale')

    const counterpartyId = isSeller ? offer.buyer_id : listing.seller_id
    await createNotification({
      user_id: counterpartyId,
      type: 'offer_accepted',
      title: `Offer accepted on the ${carLabel(listing)}`,
      body: `${centsToDisplay(offer.amount)} — deal!`,
      link: '/dashboard',
    })

    // Any other still-open offers on this listing are moot now.
    const others = (await listPendingOffersForListing(listing.id)).filter((o) => o.id !== offer.id)
    for (const other of others) {
      const otherApplied = await updateOffer(other.id, { status: 'auto_declined' }, ['pending_seller', 'pending_buyer'])
      if (!otherApplied) continue
      await insertOfferEvent({ offer_id: other.id, actor_id: listing.seller_id, action: 'auto_decline' })
      await createNotification({
        user_id: other.buyer_id,
        type: 'listing_sold',
        title: `The ${carLabel(listing)} was sold to another buyer`,
        link: '/dashboard',
      })
    }

    return { offer: { ...offer, status: 'accepted' as const } }
  }

  if (input.action === 'decline') {
    const applied = await updateOffer(offer.id, { status: 'declined' }, expectedTurn)
    if (!applied) throw new OfferError('This offer is not waiting on your response.', 409)
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'decline' })
    const counterpartyId = isSeller ? offer.buyer_id : listing.seller_id
    await createNotification({
      user_id: counterpartyId,
      type: 'offer_declined',
      title: `Your offer on the ${carLabel(listing)} was declined`,
      link: '/dashboard',
    })
    return { offer: { ...offer, status: 'declined' as const } }
  }

  if (input.action === 'counter') {
    const amount = input.counterAmountCents
    if (!Number.isFinite(amount) || !amount || amount <= 0) {
      throw new OfferError('Enter a valid counter amount.', 400)
    }
    if (isSeller && amount < listing.minimum_offer) {
      // Not a hard business rule, just avoids a seller accidentally
      // countering below their own stated floor.
      throw new OfferError(`Counter must be at least ${centsToDisplay(listing.minimum_offer)} (your stated minimum).`, 400)
    }
    const nextStatus = isSeller ? 'pending_buyer' : 'pending_seller'
    const applied = await updateOffer(
      offer.id,
      { amount, status: nextStatus, expires_at: offerDeadline(), reminder_sent_at: null },
      expectedTurn
    )
    if (!applied) throw new OfferError('This offer is not waiting on your response.', 409)
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'counter', amount })

    const counterpartyId = isSeller ? offer.buyer_id : listing.seller_id
    await createNotification({
      user_id: counterpartyId,
      type: 'offer_countered',
      title: `New counter on the ${carLabel(listing)}: ${centsToDisplay(amount)}`,
      link: '/dashboard',
    })

    return { offer: { ...offer, amount, status: nextStatus } }
  }

  throw new OfferError('Unknown action.', 400)
}
