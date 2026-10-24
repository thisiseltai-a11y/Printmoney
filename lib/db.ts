import { revalidatePath } from 'next/cache'
import { getSupabase } from './supabase'
import { sendNotificationEmail } from './email'

export function dbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function requireDb() {
  if (!dbConfigured()) {
    throw new Error('Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }
}

// ─── Listings ──────────────────────────────────────────────────────────

export interface Listing {
  id: number
  seller_id: string
  year: number | null
  make: string
  model: string
  trim: string | null
  mileage: number | null
  vin: string | null
  description: string | null
  photos: string[]
  asking_price: number
  minimum_offer: number
  status: 'active' | 'sold' | 'cancelled' | 'pending_sale'
  engine: string | null
  transmission: string | null
  drive_type: string | null
  fuel_type: string | null
  body_type: string | null
  exterior_color: string | null
  interior_color: string | null
  city_mpg: number | null
  highway_mpg: number | null
  created_at: string
}

export type NewListing = Omit<Listing, 'id' | 'created_at' | 'status'>

export async function createListing(input: NewListing): Promise<Listing> {
  requireDb()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('listings').insert(input).select().single()
  if (error) throw error
  return data as Listing
}

// Soft-fails (returns null) rather than throwing — this is read directly by
// the listing detail page, and "not configured" should render as a normal
// not-found page rather than crash the request.
export async function getListing(id: number): Promise<Listing | null> {
  if (!dbConfigured()) return null
  const supabase = getSupabase()
  const { data } = await supabase.from('listings').select().eq('id', id).maybeSingle()
  return (data as Listing) ?? null
}

export async function listActiveListings(): Promise<Listing[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('listings')
    .select()
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  return (data as Listing[]) ?? []
}

export async function listListingsBySeller(sellerId: string): Promise<Listing[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('listings')
    .select()
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
  return (data as Listing[]) ?? []
}

export async function updateListingStatus(id: number, status: Listing['status']) {
  requireDb()
  const supabase = getSupabase()
  await supabase.from('listings').update({ status }).eq('id', id)
  // Any status change can add/remove the listing from the homepage's active
  // list — revalidate so the client router cache doesn't keep serving a
  // stale '/' after a cancel, sale, or offer acceptance.
  revalidatePath('/')
}

// Same make, active, not the listing itself — a simple stand-in for a real
// "similar vehicles" recommendation until there's enough inventory to do
// anything fancier with it.
export async function listSimilarListings(listing: Listing, limit = 4): Promise<Listing[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('listings')
    .select()
    .eq('status', 'active')
    .eq('make', listing.make)
    .neq('id', listing.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as Listing[]) ?? []
}

// ─── Saved listings ─────────────────────────────────────────────────────

export async function isListingSaved(userId: string, listingId: number): Promise<boolean> {
  if (!dbConfigured()) return false
  const supabase = getSupabase()
  const { data } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle()
  return !!data
}

export async function saveListing(userId: string, listingId: number) {
  requireDb()
  const supabase = getSupabase()
  const { error } = await supabase
    .from('saved_listings')
    .upsert({ user_id: userId, listing_id: listingId }, { onConflict: 'user_id,listing_id', ignoreDuplicates: true })
  if (error) throw error
}

export async function unsaveListing(userId: string, listingId: number) {
  requireDb()
  const supabase = getSupabase()
  await supabase.from('saved_listings').delete().eq('user_id', userId).eq('listing_id', listingId)
}

export async function listSavedListings(userId: string): Promise<Listing[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('saved_listings')
    .select('created_at, listing:listings!inner(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return ((data as any) ?? []).map((row: any) => row.listing) as Listing[]
}

// ─── Offers ────────────────────────────────────────────────────────────

export type OfferStatus =
  | 'pending_seller'
  | 'pending_buyer'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'auto_declined'
  | 'expired'
  | 'backup'
  | 'fell_through'
  | 'sold'

export interface Offer {
  id: number
  listing_id: number
  buyer_id: string
  amount: number
  status: OfferStatus
  expires_at: string | null
  reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

export async function createOffer(input: {
  listing_id: number
  buyer_id: string
  amount: number
  status: OfferStatus
  expires_at?: string | null
}): Promise<Offer> {
  requireDb()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('offers').insert(input).select().single()
  if (error) throw error
  return data as Offer
}

export async function getOffer(id: number): Promise<Offer | null> {
  requireDb()
  const supabase = getSupabase()
  const { data } = await supabase.from('offers').select().eq('id', id).maybeSingle()
  return (data as Offer) ?? null
}

// `expectedStatus` makes this an atomic compare-and-swap: the update only
// applies if the row is still in that status when the write lands, so two
// concurrent responses to the same offer (e.g. a double-tap) can't both
// succeed — the loser gets `false` back and should treat that as a 409
// rather than running any side effects (notifications, listing status, etc).
export async function updateOffer(
  id: number,
  patch: Partial<Pick<Offer, 'amount' | 'status' | 'expires_at' | 'reminder_sent_at'>>,
  expectedStatus?: OfferStatus | OfferStatus[]
): Promise<boolean> {
  requireDb()
  const supabase = getSupabase()
  let query = supabase
    .from('offers')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (expectedStatus) {
    query = Array.isArray(expectedStatus) ? query.in('status', expectedStatus) : query.eq('status', expectedStatus)
  }
  const { data, error } = await query.select('id')
  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function listOffersForListing(listingId: number): Promise<Offer[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('offers')
    .select()
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
  return (data as Offer[]) ?? []
}

export async function listPendingOffersForListing(listingId: number): Promise<Offer[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('offers')
    .select()
    .eq('listing_id', listingId)
    .in('status', ['pending_seller', 'pending_buyer'])
  return (data as Offer[]) ?? []
}

export async function listOffersForBuyer(buyerId: string): Promise<(Offer & { listing: Listing })[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('offers')
    .select('*, listing:listings!inner(*)')
    .eq('buyer_id', buyerId)
    .order('updated_at', { ascending: false })
  return (data as any) ?? []
}

// listings the current user is selling, joined with their offers — used by
// the seller side of the dashboard. Excludes 'backup' offers: those were
// submitted while the listing had an accepted deal pending, and the seller
// isn't shown them (or notified) unless that deal falls through — see
// listBackupOffersForListing() and the 'fall_through' handling in
// lib/offers.ts.
export async function listOffersForSeller(sellerId: string): Promise<(Offer & { listing: Listing })[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('offers')
    .select('*, listing:listings!inner(*)')
    .eq('listing.seller_id', sellerId)
    .neq('status', 'backup')
    .order('updated_at', { ascending: false })
  return (data as any) ?? []
}

export async function listBackupOffersForListing(listingId: number): Promise<Offer[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase.from('offers').select().eq('listing_id', listingId).eq('status', 'backup')
  return (data as Offer[]) ?? []
}

// Offers with less than 24h left on their 48h clock that haven't had a
// reminder sent yet — used by the scheduled /api/cron/offer-reminders job
// (see lib/offers.ts's sendPendingReminders). Already-expired offers are
// excluded; those are handled by the lazy expireIfOverdue() path instead.
export async function listOffersNeedingReminder(): Promise<(Offer & { listing: Listing })[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const { data } = await supabase
    .from('offers')
    .select('*, listing:listings!inner(*)')
    .in('status', ['pending_seller', 'pending_buyer'])
    .is('reminder_sent_at', null)
    .gt('expires_at', now.toISOString())
    .lte('expires_at', in24h.toISOString())
  return (data as any) ?? []
}

export async function markReminderSent(id: number) {
  requireDb()
  const supabase = getSupabase()
  await supabase.from('offers').update({ reminder_sent_at: new Date().toISOString() }).eq('id', id)
}

export type OfferAction =
  | 'offer'
  | 'counter'
  | 'accept'
  | 'decline'
  | 'withdraw'
  | 'auto_decline'
  | 'expire'
  | 'fall_through'
  | 'reactivate'
  | 'mark_sold'

export async function insertOfferEvent(input: {
  offer_id: number
  actor_id: string
  action: OfferAction
  amount?: number | null
}) {
  requireDb()
  const supabase = getSupabase()
  await supabase.from('offer_events').insert(input)
}

export async function listOfferEvents(offerId: number) {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('offer_events')
    .select()
    .eq('offer_id', offerId)
    .order('created_at', { ascending: true })
  return data ?? []
}

// ─── Notifications ─────────────────────────────────────────────────────

export async function createNotification(input: {
  user_id: string
  type: string
  title: string
  body?: string
  link?: string
}) {
  if (!dbConfigured()) return
  try {
    const supabase = getSupabase()
    await supabase.from('notifications').insert(input)
  } catch (err) {
    console.error('createNotification failed:', err)
  }
  // Mirrors every notification as an email, if RESEND_API_KEY is set — see
  // lib/email.ts. No-ops (and never throws) when it isn't configured.
  await sendNotificationEmail(input)
}

export async function listNotifications(userId: string, limit = 20) {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('notifications')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  if (!dbConfigured()) return 0
  const supabase = getSupabase()
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  return count ?? 0
}

export async function markNotificationsRead(userId: string, ids?: number[]) {
  if (!dbConfigured()) return
  const supabase = getSupabase()
  let query = supabase.from('notifications').update({ read: true }).eq('user_id', userId)
  if (ids && ids.length) query = query.in('id', ids)
  await query
}

// ─── Messages ────────────────────────────────────────────────────────────
// A thread is identified by (listing_id, buyer_id) — the seller is always
// that listing's seller_id, so there's exactly one thread per buyer per
// listing, no matter which side is currently talking.

export interface Message {
  id: number
  listing_id: number
  buyer_id: string
  sender_id: string
  body: string
  created_at: string
}

export interface MessageThread {
  listing_id: number
  buyer_id: string
  listing: Listing
  last_message: Message
}

export async function createMessage(input: {
  listing_id: number
  buyer_id: string
  sender_id: string
  body: string
}): Promise<Message> {
  requireDb()
  const supabase = getSupabase()
  const { data, error } = await supabase.from('messages').insert(input).select().single()
  if (error) throw error
  return data as Message
}

export async function listMessagesForThread(listingId: number, buyerId: string): Promise<Message[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('messages')
    .select()
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: true })
  return (data as Message[]) ?? []
}

// New messages since `afterId` — used by the thread page's poll, so it
// only ever fetches what it doesn't already have.
export async function listNewMessages(listingId: number, buyerId: string, afterId: number): Promise<Message[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('messages')
    .select()
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .gt('id', afterId)
    .order('created_at', { ascending: true })
  return (data as Message[]) ?? []
}

// Messaging is gated behind having made an offer — on either side. A buyer
// can't open a thread until they've put a real number down (which already
// has to clear the seller's minimum or it auto-declines), and a seller can
// only reply into a thread that means the same thing. This is the
// "serious buyers, not time-wasters" filter — no separate hold/deposit
// needed, the offer itself is the commitment.
export async function hasMessageRelationship(listingId: number, buyerId: string): Promise<boolean> {
  if (!dbConfigured()) return false
  const supabase = getSupabase()
  const { count } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
  return (count ?? 0) > 0
}

// Every thread a user is party to, as either the buyer or the seller of
// the listing, deduped down to each thread's latest message and sorted by
// most recent activity — used by the dashboard's Messages section.
export async function listMessageThreadsForUser(userId: string): Promise<MessageThread[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const [asBuyer, asSeller] = await Promise.all([
    supabase.from('messages').select('*, listing:listings!inner(*)').eq('buyer_id', userId),
    supabase.from('messages').select('*, listing:listings!inner(*)').eq('listing.seller_id', userId),
  ])
  const all = [...((asBuyer.data as any) ?? []), ...((asSeller.data as any) ?? [])] as (Message & {
    listing: Listing
  })[]

  const latest = new Map<string, Message & { listing: Listing }>()
  for (const m of all) {
    const key = `${m.listing_id}:${m.buyer_id}`
    const existing = latest.get(key)
    if (!existing || m.created_at > existing.created_at) latest.set(key, m)
  }

  return Array.from(latest.values())
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((m) => ({ listing_id: m.listing_id, buyer_id: m.buyer_id, listing: m.listing, last_message: m }))
}
