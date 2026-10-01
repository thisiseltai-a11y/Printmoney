import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <div className="ambient-glow" />
        <div className="relative">
          <SignupForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
