import {
  getListing,
  getOffer,
  createOffer,
  updateOffer,
  updateListingStatus,
  insertOfferEvent,
  createNotification,
  listPendingOffersForListing,
  type Offer,
  type Listing,
} from './db'
import { centsToDisplay } from './money'

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

// ─── Buyer submits a new offer ─────────────────────────────────────────
// Offers below the listing's minimum are auto-declined immediately rather
// than bothering the seller with them — the minimum is shown to buyers on
// the listing page too, so this should only trigger if someone bypasses
// the form's own validation.
export async function submitOffer(input: { listingId: number; buyerId: string; amountCents: number }) {
  const listing = await getListing(input.listingId)
  if (!listing) throw new OfferError('Listing not found.', 404)
  if (listing.status !== 'active') throw new OfferError('This listing is no longer active.', 409)
  if (listing.seller_id === input.buyerId) throw new OfferError("You can't make an offer on your own listing.", 400)
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new OfferError('Enter a valid offer amount.', 400)
  }

  const belowMinimum = input.amountCents < listing.minimum_offer

  const offer = await createOffer({
    listing_id: listing.id,
    buyer_id: input.buyerId,
    amount: input.amountCents,
    status: belowMinimum ? 'auto_declined' : 'pending_seller',
  })

  await insertOfferEvent({
    offer_id: offer.id,
    actor_id: input.buyerId,
    action: belowMinimum ? 'auto_decline' : 'offer',
    amount: input.amountCents,
  })

  if (belowMinimum) {
    return { offer, belowMinimum: true, minimum: listing.minimum_offer }
  }

  await createNotification({
    user_id: listing.seller_id,
    type: 'new_offer',
    title: `New offer on your ${carLabel(listing)}`,
    body: `${centsToDisplay(input.amountCents)} offered.`,
    link: '/dashboard',
  })

  return { offer, belowMinimum: false }
}

type RespondAction = 'accept' | 'counter' | 'decline' | 'withdraw'

export async function respondToOffer(input: {
  offerId: number
  actorId: string
  action: RespondAction
  counterAmountCents?: number
}) {
  const offer = await getOffer(input.offerId)
  if (!offer) throw new OfferError('Offer not found.', 404)
  const listing = await getListing(offer.listing_id)
  if (!listing) throw new OfferError('Listing not found.', 404)

  const isSeller = listing.seller_id === input.actorId
  const isBuyer = offer.buyer_id === input.actorId
  if (!isSeller && !isBuyer) throw new OfferError('Not authorized.', 403)

  if (input.action === 'withdraw') {
    if (!isBuyer) throw new OfferError('Only the buyer can withdraw an offer.', 403)
    if (offer.status !== 'pending_seller' && offer.status !== 'pending_buyer') {
      throw new OfferError('This offer is no longer open.', 409)
    }
    await updateOffer(offer.id, { status: 'withdrawn' })
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'withdraw' })
    await createNotification({
      user_id: listing.seller_id,
      type: 'offer_withdrawn',
      title: `An offer on your ${carLabel(listing)} was withdrawn`,
      link: '/dashboard',
    })
    return { offer: { ...offer, status: 'withdrawn' as const } }
  }

  // accept/counter/decline — must be whoever's turn it is
  const expectedTurn = isSeller ? 'pending_seller' : 'pending_buyer'
  if (offer.status !== expectedTurn) {
    throw new OfferError('This offer is not waiting on your response.', 409)
  }

  if (input.action === 'accept') {
    await updateOffer(offer.id, { status: 'accepted' })
    await insertOfferEvent({ offer_id: offer.id, actor_id: input.actorId, action: 'accept' })
    await updateListingStatus(listing.id, 'sold')

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
      await updateOffer(other.id, { status: 'auto_declined' })
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
    await updateOffer(offer.id, { status: 'declined' })
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
    await updateOffer(offer.id, { amount, status: nextStatus })
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
