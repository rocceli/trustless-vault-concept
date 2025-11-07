import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./SideBar";
import { cn } from "@/lib/utils";

type DashboardLayoutProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export const DashboardLayout = ({
  title,
  description,
  actions,
  children,
}: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar variant="desktop" />
      <Sidebar
        variant="mobile"
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 shadow-sm dark:border-gray-800 md:hidden">
          <button
            className="rounded-md border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          {title && (
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </span>
          )}
          <div className="w-6" />
        </div>

        <main className="flex-1 space-y-6 px-4 py-6 md:px-10 md:py-8">
          {(title || description || actions) && (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                {title && (
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                )}
              </div>
              {actions && (
                <div className={cn("flex flex-col gap-3 md:flex-row md:items-center")}>{actions}</div>
              )}
            </div>
          )}

          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
