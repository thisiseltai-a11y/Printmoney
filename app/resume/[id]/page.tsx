import { getSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ResumeView from './ResumeView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Resume',
  robots: { index: false, follow: false },
}

export default async function ResumePage({ params }: { params: { id: string } }) {
  const { data, error } = await getSupabase()
    .from('resumes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) notFound()

  return <ResumeView record={data} />
}
