import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";

// Lazy-loaded pages
const Index = lazy(() => import("@/pages/index"));
// const NotFound = lazy(() => import("@/pages/NotFound"));

// Full-page Tailwind fallback
function FullPageFallback() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Loading
        </p>
        <div className="relative w-64 h-2 bg-muted/20 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/40 to-purple-400/20 animate-[shimmer_1.5s_infinite]" />
        </div>

        <style>
          {`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}
        </style>
      </div>
    </>
  );
}

export function Router() {
  const element = useRoutes([
    // { index: true, element: <CryptoExchangeHomepage /> },
    // { path: "*", element: <NotFound /> },
    { index: true, element: <Index />}
  ]);

  // Wrap the routes in Suspense so lazy pages show a fallback
  return <Suspense fallback={<FullPageFallback />}>{element}</Suspense>;
}