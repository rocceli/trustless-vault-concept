import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-50">
      <div className="relative flex flex-1 items-center justify-center px-6 py-16 sm:px-8">
        <div className="absolute inset-0 bg-grid-slate-200/40 dark:bg-grid-slate-800/30" aria-hidden />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Compass className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-300">
              404
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Page not found
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              The route you’re looking for doesn’t live here yet. Check the URL or head back to the dashboards to keep exploring the protocol.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Open dashboards
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

