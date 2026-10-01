import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <div className="ambient-glow" />
        <div className="relative">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
