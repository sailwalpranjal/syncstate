import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Users, Wifi, Cloud } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              SyncState
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Offline-First Collaborative Document Editor
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Write together in real-time, even offline. Powered by CRDTs for
            conflict-free collaboration that just works.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Rich Text Editor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Full-featured editor with formatting, lists, and more
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-Time Collab</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See cursors and edits from other users instantly
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Offline-First</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keep working without internet, sync when back online
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Cloud className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">CRDT-Powered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic conflict resolution with Yjs CRDTs
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-20 pt-10 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Built with modern technologies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Next.js 15</span>
              <span>•</span>
              <span className="font-medium">Yjs CRDTs</span>
              <span>•</span>
              <span className="font-medium">WebRTC</span>
              <span>•</span>
              <span className="font-medium">TipTap Editor</span>
              <span>•</span>
              <span className="font-medium">TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
