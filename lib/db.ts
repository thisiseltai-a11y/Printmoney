import { getSupabase } from './supabase'

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
  status: 'active' | 'sold' | 'cancelled'
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
}

// ─── Offers ────────────────────────────────────────────────────────────

export type OfferStatus =
  | 'pending_seller'
  | 'pending_buyer'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'auto_declined'

export interface Offer {
  id: number
  listing_id: number
  buyer_id: string
  amount: number
  status: OfferStatus
  created_at: string
  updated_at: string
}

export async function createOffer(input: {
  listing_id: number
  buyer_id: string
  amount: number
  status: OfferStatus
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

export async function updateOffer(id: number, patch: Partial<Pick<Offer, 'amount' | 'status'>>) {
  requireDb()
  const supabase = getSupabase()
  await supabase
    .from('offers')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
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
// the seller side of the dashboard
export async function listOffersForSeller(sellerId: string): Promise<(Offer & { listing: Listing })[]> {
  if (!dbConfigured()) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from('offers')
    .select('*, listing:listings!inner(*)')
    .eq('listing.seller_id', sellerId)
    .order('updated_at', { ascending: false })
  return (data as any) ?? []
}

export type OfferAction = 'offer' | 'counter' | 'accept' | 'decline' | 'withdraw' | 'auto_decline'

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
