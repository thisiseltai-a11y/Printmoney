import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NewListingForm from './NewListingForm'

export default function NewListingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="mb-6 font-grotesk text-2xl font-semibold text-ink">List your car</h1>
        <NewListingForm />
      </main>
      <Footer />
    </div>
  )
}
