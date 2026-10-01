import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <SignupForm />
      </main>
      <Footer />
    </div>
  )
}
