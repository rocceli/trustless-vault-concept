import ProtectedRoute from "@/lib/protected";
import { lazy, Suspense } from "react";
import { Outlet, useRoutes } from "react-router-dom";

// Lazy-loaded pages
const Index = lazy(() => import("@/pages/index"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const VaultDashboard = lazy(() => import("@/pages/vault-dashboard"));
const LiquidityDashboard = lazy(() => import("@/pages/liquidity-dashboard"));
const NotFound = lazy(() => import("@/pages/notfound"));

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
  return useRoutes([
    {
      element: (
        <Suspense fallback={<FullPageFallback />}>
          <Outlet />
        </Suspense>
      ),
      children: [
        // Public routes
        { index: true, element: <Index /> },

        // Protected dashboard section
        {
          element: <ProtectedRoute />,
          children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "dashboard/vault", element: <VaultDashboard /> },
            { path: "dashboard/liquidity", element: <LiquidityDashboard /> },
          ],
        },

        // 404
        { path: "*", element: <NotFound /> }
      ],
    },
  ]);
}
