import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <LoginForm />
      </main>
      <Footer />
    </div>
  )
}
