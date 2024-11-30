import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-green-500 text-white">
      <header className="w-full text-center py-8 bg-opacity-90 backdrop-blur-md bg-black/30">
        <h1 className="text-4xl font-extrabold sm:text-6xl">Welcome to Life Organizer</h1>
        <p className="mt-4 text-lg sm:text-xl">
          Streamline your life with AI-powered organization.
        </p>
        <Link href="/get-started">
          <div className="mt-6 inline-block px-8 py-3 bg-white text-black rounded-lg shadow-lg font-semibold text-lg hover:bg-gray-200 transition">
            Get Started
          </div>
        </Link>
      </header>
      <section className="flex flex-col items-center px-8 py-16 text-center space-y-8 max-w-4xl">
        <h2 className="text-3xl font-semibold sm:text-4xl">Features</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="p-6 bg-white text-black rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold">File Explorer View</h3>
            <p className="mt-2">Navigate through your life’s moments with a structured UI.</p>
          </div>
          <div className="p-6 bg-white text-black rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold">AI Summaries</h3>
            <p className="mt-2">Get key takeaways from conversations instantly.</p>
          </div>
          <div className="p-6 bg-white text-black rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold">Task Manager</h3>
            <p className="mt-2">Track your commitments with ease.</p>
          </div>
          <div className="p-6 bg-white text-black rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold">Privacy First</h3>
            <p className="mt-2">Your data is secure and encrypted, always.</p>
          </div>
        </div>
      </section>
      <footer className="w-full py-4 bg-black text-center text-white">
        <p>&copy; {new Date().getFullYear()} Life Organizer. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
