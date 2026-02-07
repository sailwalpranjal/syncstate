'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
          <span className="text-5xl font-bold text-white">404</span>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
