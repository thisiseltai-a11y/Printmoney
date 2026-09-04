import VinInput from './VinInput'

export default function FinalCTA() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-grotesk text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Check a VIN before you sign anything.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted">Free decode + value estimate. Takes seconds.</p>
        <div className="mt-8 flex justify-center">
          <VinInput />
        </div>
      </div>
    </section>
  )
}
