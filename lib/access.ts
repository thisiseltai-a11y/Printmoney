// Emails that always have full free access regardless of subscription status
export const FREE_ACCESS_EMAILS = new Set([
  'kevinschulman0@gmail.com',
])

export function hasFreeAccess(email: string | null | undefined): boolean {
  if (!email) return false
  return FREE_ACCESS_EMAILS.has(email.toLowerCase().trim())
}
