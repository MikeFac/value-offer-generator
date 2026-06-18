import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">OfferFu</span>
            <span className="text-sm text-zinc-400">by salesfu.ai</span>
          </div>
          <nav className="flex gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/terms-conditions" className="hover:text-zinc-900 dark:hover:text-zinc-100">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">Privacy Policy</Link>
          </nav>
        </div>
        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} SalesFu AI Pty Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}