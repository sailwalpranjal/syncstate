export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">SyncState</span>
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400">
          Offline-first collaborative document editor powered by CRDTs
        </p>
      </div>
    </main>
  );
}
