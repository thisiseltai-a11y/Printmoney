// VIN format + check-digit validation (ISO 3779 / NHTSA check-digit algorithm,
// position 9). This is the "standard VIN checksum" referenced across the app.

const TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
}
for (let d = 0; d <= 9; d++) TRANSLITERATION[String(d)] = d

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

export function normalizeVin(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

export function isValidVinFormat(vin: string): boolean {
  // 17 chars, no I/O/Q (excluded to avoid confusion with 1/0)
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin)
}

export function passesVinChecksum(vin: string): boolean {
  if (!isValidVinFormat(vin)) return false
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const value = TRANSLITERATION[vin[i]]
    if (value === undefined) return false
    sum += value * WEIGHTS[i]
  }
  const remainder = sum % 11
  const expected = remainder === 10 ? 'X' : String(remainder)
  return vin[8] === expected
}

export interface VinValidationResult {
  valid: boolean
  vin: string
  reason?: string
}

export function validateVin(raw: string): VinValidationResult {
  const vin = normalizeVin(raw)
  if (vin.length !== 17) {
    return { valid: false, vin, reason: 'VIN must be exactly 17 characters.' }
  }
  if (!isValidVinFormat(vin)) {
    return { valid: false, vin, reason: 'VIN contains invalid characters (no I, O, or Q).' }
  }
  if (!passesVinChecksum(vin)) {
    return { valid: false, vin, reason: 'VIN failed check-digit validation. Double-check for typos.' }
  }
  return { valid: true, vin }
}
