// All prices/offers are stored in cents in the DB — these are the only two
// places that should convert to/from dollars.

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function centsToDisplay(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`
}
