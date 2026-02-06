'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { FileText, Users, Wifi, Cloud, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SyncState
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by CRDTs & WebRTC</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Collaborate
              </span>
              <br />
              <span className="text-white">Without Limits</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto animate-slide-up delay-100">
              Real-time document editing that works <span className="text-blue-400 font-semibold">even offline</span>.
              No conflicts, no waiting, no limits.
            </p>

            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up delay-200">
              Built with cutting-edge CRDT technology for seamless collaboration across teams, devices, and continents.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Open Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Free
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white/20 hover:border-white/40 text-white hover:bg-white/5 transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-20 animate-slide-up delay-400">
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Works Offline</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">20+ Concurrent Users</span>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Rich Text Editor</h3>
                <p className="text-gray-400 leading-relaxed">
                  Professional editor with formatting, markdown support, and real-time preview
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-Time Collaboration</h3>
                <p className="text-gray-400 leading-relaxed">
                  See cursors, edits, and presence of other users instantly across devices
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
                  <Wifi className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Offline-First</h3>
                <p className="text-gray-400 leading-relaxed">
                  Keep working without internet. Changes sync automatically when reconnected
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-white/10 backdrop-blur-sm hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/50 group-hover:scale-110 transition-transform duration-300">
                  <Cloud className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">CRDT-Powered</h3>
                <p className="text-gray-400 leading-relaxed">
                  Automatic conflict resolution with Yjs ensures perfect data consistency
                </p>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mt-32 pt-16 border-t border-white/10">
              <p className="text-sm uppercase tracking-wider text-gray-500 mb-8">
                Built with cutting-edge technology
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
                <span className="font-semibold text-white">Next.js 15</span>
                <span>•</span>
                <span className="font-semibold text-white">Yjs CRDTs</span>
                <span>•</span>
                <span className="font-semibold text-white">WebRTC P2P</span>
                <span>•</span>
                <span className="font-semibold text-white">Three.js</span>
                <span>•</span>
                <span className="font-semibold text-white">TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </main>
  );
}
