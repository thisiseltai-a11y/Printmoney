// Free NHTSA vPIC decode — no API key required.
// https://vpic.nhtsa.dot.gov/api/

export interface DecodedVehicle {
  year: string
  make: string
  model: string
  trim: string
  bodyType: string
  engine: string
  driveType: string
  fuelType: string
  transmission: string
  plant: string
  errorCode: string
  errorText: string
}

interface NhtsaResult {
  Variable: string
  Value: string | null
}

function pick(results: NhtsaResult[], name: string): string {
  return results.find((r) => r.Variable === name)?.Value?.trim() || ''
}

export async function decodeVin(vin: string): Promise<DecodedVehicle> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(
    vin
  )}?format=json`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) {
    throw new Error(`NHTSA decode failed with status ${res.status}`)
  }
  const data = await res.json()
  const row = data?.Results?.[0]
  if (!row) throw new Error('NHTSA returned no decode results.')

  // decodevinvalues returns one flat object rather than the Variable/Value
  // array shape of decodevin — normalize both just in case.
  const flat = row as Record<string, string>
  const asPairs: NhtsaResult[] = Object.keys(flat).map((k) => ({ Variable: k, Value: flat[k] }))

  const engineCyl = flat.EngineCylinders
  const engineDisp = flat.DisplacementL
  const engine = [engineDisp ? `${parseFloat(engineDisp).toFixed(1)}L` : '', engineCyl ? `${engineCyl}-cyl` : '']
    .filter(Boolean)
    .join(' ')

  return {
    year: flat.ModelYear || '',
    make: flat.Make || '',
    model: flat.Model || '',
    trim: flat.Trim || flat.Series || '',
    bodyType: flat.BodyClass || '',
    engine: engine || pick(asPairs, 'Engine Configuration'),
    driveType: flat.DriveType || '',
    fuelType: flat.FuelTypePrimary || '',
    transmission: flat.TransmissionStyle || '',
    plant: [flat.PlantCity, flat.PlantCountry].filter(Boolean).join(', '),
    errorCode: flat.ErrorCode || '',
    errorText: flat.ErrorText || '',
  }
}
