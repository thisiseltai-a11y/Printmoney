import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/supabase/server'
import {
  getListing,
  createMessage,
  listMessagesForThread,
  listNewMessages,
  hasMessageRelationship,
  createNotification,
  type Listing,
} from '@/lib/db'

function carLabel(l: Listing) {
  return [l.year, l.make, l.model].filter(Boolean).join(' ')
}

// GET /api/messages?listingId=&buyerId=&afterId= — afterId is optional and
// scopes this to a poll ("what's new since the last message I have")
// rather than refetching the whole thread every time.
export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const listingId = Number(searchParams.get('listingId'))
  const buyerId = searchParams.get('buyerId')
  const afterId = searchParams.get('afterId')
  if (!Number.isFinite(listingId) || !buyerId) {
    return NextResponse.json({ error: 'Missing listingId or buyerId.' }, { status: 400 })
  }

  const listing = await getListing(listingId)
  if (!listing) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
  if (user.id !== buyerId && user.id !== listing.seller_id) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }

  const messages = afterId
    ? await listNewMessages(listingId, buyerId, Number(afterId))
    : await listMessagesForThread(listingId, buyerId)

  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 })

  const body = await req.json()
  const listingId = Number(body.listingId)
  const text = String(body.body || '').trim()
  if (!Number.isFinite(listingId)) return NextResponse.json({ error: 'Missing listing.' }, { status: 400 })
  if (!text) return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 })
  if (text.length > 2000) return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })

  const listing = await getListing(listingId)
  if (!listing) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })

  const isSeller = listing.seller_id === user.id
  const buyerId = isSeller ? String(body.buyerId || '') : user.id
  if (!buyerId) return NextResponse.json({ error: 'Missing buyer.' }, { status: 400 })
  if (buyerId === listing.seller_id) {
    return NextResponse.json({ error: "You can't message yourself about your own listing." }, { status: 400 })
  }
  if (!isSeller && buyerId !== user.id) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  }

  // Messaging is gated behind an offer, on both sides — a buyer can't open
  // a thread until they've made one, and a seller can only reply into a
  // thread that means the buyer already has.
  const hasOffer = await hasMessageRelationship(listingId, buyerId)
  if (!hasOffer) {
    return NextResponse.json(
      { error: 'Make an offer on this listing before messaging the seller.' },
      { status: 403 }
    )
  }

  const message = await createMessage({ listing_id: listingId, buyer_id: buyerId, sender_id: user.id, body: text })

  const recipientId = isSeller ? buyerId : listing.seller_id
  await createNotification({
    user_id: recipientId,
    type: 'new_message',
    title: `New message about the ${carLabel(listing)}`,
    body: text.length > 140 ? `${text.slice(0, 140)}…` : text,
    link: `/messages/${listingId}/${buyerId}`,
  })

  return NextResponse.json({ message })
}
