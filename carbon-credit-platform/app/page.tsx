// app/page.tsx
"use client"
import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Leaf, BarChart, ShieldCheck, Wallet } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
export default function LandingPage() {
  const { connect, isConnecting, isConnected } = useWallet()
  const [error, setError] = useState<string | null>(null)


  const handleConnect = async () => {
    try {
      setError(null)
      await connect()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm">
        <Link href="#" className="flex items-center gap-2 font-bold text-green-500 text-lg">
          <Leaf className="h-6 w-6" />
          <span>CarbonCredit.io</span>
        </Link>
        <nav className="hidden md:flex gap-4 sm:gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
          >
            Features
          </Link>
          <Link
            href="#stats"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
          >
            Statistics
          </Link>
          <Link
            href="/marketplace"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
          >
            Marketplace
          </Link>
          <Link
            href="/dashboard/company"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
          >
            Dashboard
          </Link>
        </nav>
        {/* <Link href="/(auth)"> */}
          {isConnected ? (
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-green-500 hover:bg-green-600 text-white">
             <Wallet className="h-4 w-4 mr-2" /> Connected
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-green-500 hover:bg-green-600 text-white">
              {isConnecting ? "Connecting..." : <Wallet className="h-4 w-4 mr-2" />} Connect Wallet
            </Button>
          )}
          {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
        {/* </Link> */}
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Accelerate Your Carbon Neutral Journey
                </h1>
                <p className="max-w-[600px] text-gray-100 md:text-xl">
                  Empowering businesses to track emissions, purchase verified carbon credits, and achieve ESG compliance
                  with blockchain transparency.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/(auth)">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-700 disabled:pointer-events-none disabled:opacity-50">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-white bg-transparent px-8 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white hover:text-green-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <Image
              src="/placeholder.svg?height=400&width=600"
              width="600"
              height="400"
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-800 dark:text-gray-100">
                Comprehensive Carbon Management
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform provides all the tools you need to manage your environmental impact.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Leaf className="h-12 w-12 text-green-500 mb-4" />
              <CardTitle className="text-xl font-bold mb-2">Emissions Tracking</CardTitle>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Accurately record and analyze your Scope 1, 2, and 3 emissions.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <BarChart className="h-12 w-12 text-blue-500 mb-4" />
              <CardTitle className="text-xl font-bold mb-2">Carbon Marketplace</CardTitle>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Browse and purchase high-quality, verified carbon credits from global projects.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ShieldCheck className="h-12 w-12 text-orange-500 mb-4" />
              <CardTitle className="text-xl font-bold mb-2">ESG Compliance</CardTitle>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Track your progress towards sustainability targets and generate compliance reports.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Platform Statistics */}
      <section id="stats" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-800 dark:text-gray-100">
                Platform at a Glance
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Real-time insights into our growing impact.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="flex flex-col items-center p-6 text-center shadow-lg">
              <div className="text-5xl font-bold text-green-500 mb-2">1.2M+</div>
              <CardTitle className="text-xl font-bold mb-2">Credits Transacted</CardTitle>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Total carbon credits bought and sold.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center shadow-lg">
              <div className="text-5xl font-bold text-blue-500 mb-2">500+</div>
              <CardTitle className="text-xl font-bold mb-2">Verified Projects</CardTitle>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Diverse projects contributing to global sustainability.
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center shadow-lg">
              <div className="text-5xl font-bold text-orange-500 mb-2">1500+</div>
              <CardTitle className="text-xl font-bold mb-2">Companies Onboard</CardTitle>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Businesses actively managing their carbon footprint.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-500 text-white text-center">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Ready to Make an Impact?</h2>
          <p className="max-w-[800px] mx-auto text-gray-100 md:text-xl mb-8">
            Join our platform today and start your journey towards a sustainable future.
          </p>
          <Link href="/(auth)">
            <Button className="inline-flex h-12 items-center justify-center rounded-md bg-orange-500 px-10 text-lg font-medium text-white shadow transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-700 disabled:pointer-events-none disabled:opacity-50">
              Connect Your Wallet
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <p className="text-xs">&copy; 2024 CarbonCredit.io. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
