import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, Video, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/connectx-landing.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/connectx-logo.png"
                alt="ConnectX logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
              <span className="text-xl font-bold text-foreground">ConnectX</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-foreground hover:bg-muted">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                <span className="text-balance">
                  Connect with <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">authentic</span> people
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                A safe, inclusive platform for meaningful connections—whether you're looking for dating, hookups, relationships, or BDSM experiences. Identity verified and moderated for your peace of mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                  Create Your Profile
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                { icon: Shield, label: 'Verified Profiles' },
                { icon: MessageCircle, label: 'Real-time Chat' },
                { icon: Video, label: 'Live Streams' },
                { icon: Users, label: 'Smart Matching' },
              ].map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
            <div className="relative aspect-square rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 flex items-center justify-center">
              <Image
                src="/connectx-landing.png"
                alt="ConnectX Dating and Social Platform"
                width={1200}
                height={900}
                className="h-full w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-border">
        <div className="space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Choose Connect?</h2>
            <p className="text-lg text-muted-foreground">
              Built for diverse communities with safety, authenticity, and genuine connection at our core.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Identity Verified',
                description: "Photo and ID verification ensures you're connecting with real people",
                icon: '🔐',
              },
              {
                title: 'Advanced Matching',
                description: 'Our algorithm matches you based on interests, preferences, and compatibility',
                icon: '✨',
              },
              {
                title: 'Inclusive Community',
                description: 'Safe space for dating, hookups, relationships, BDSM, and everything in between',
                icon: '🌈',
              },
              {
                title: 'Real-Time Chat',
                description: 'Seamless messaging with typing indicators, read receipts, and media sharing',
                icon: '💬',
              },
              {
                title: 'Live Streaming',
                description: 'Go live and connect with viewers in your community instantly',
                icon: '📹',
              },
              {
                title: 'Content Moderation',
                description: 'NSFW tags, content filtering, and community guidelines keep everyone safe',
                icon: '👁️',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:bg-card/50 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to find your connection?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of authentic people looking for meaningful connections. Your journey starts here.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8">
              Start Connecting Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">ConnectX</h3>
              <p className="text-sm text-muted-foreground">
                A safe, inclusive platform for meaningful connections.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Safety', 'How it works'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Safety Guidelines'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2026 Connect. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition">Twitter</a>
              <a href="#" className="hover:text-foreground transition">Instagram</a>
              <a href="#" className="hover:text-foreground transition">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
