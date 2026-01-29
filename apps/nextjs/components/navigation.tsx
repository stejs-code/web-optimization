import Link from "next/link";

export function Navigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-10 border-b border-solid border-b-slate-800 bg-black/30 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center">
          <Link href="/" className="font-bold py-2 hover:text-purple-400 transition-colors">
            stejs.cz
          </Link>
          <nav className="ml-auto flex gap-x-4">
            <Link href="/" className="block py-2 text-sm hover:underline transition-all">
              Home
            </Link>
            <Link href="/links" className="block py-2 text-sm hover:underline transition-all">
              Links
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
