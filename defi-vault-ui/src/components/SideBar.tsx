import { useState } from "react";
import { Home, Coins, Lock, Menu, X, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type SidebarProps = {
  variant?: "desktop" | "mobile";
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
};

const navItems = [
  { name: "Overview", path: "/dashboard", icon: <Home size={18} /> },
  { name: "Vault", path: "/dashboard/vault", icon: <Lock size={18} /> },
  { name: "Liquidity", path: "/dashboard/liquidity", icon: <Coins size={18} /> },
];

export const Sidebar = ({
  variant = "desktop",
  isOpen = true,
  onClose,
  onNavigate,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const handleNavigate = () => {
    onNavigate?.();
    onClose?.();
  };

  const content = (
    <>
      <div
        className={cn(
          "flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-800",
          collapsed && variant === "desktop" ? "md:px-3" : ""
        )}
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
            <Sparkles size={18} />
          </div>
          <span
            className={cn(
              "text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100",
              collapsed && variant === "desktop" ? "hidden" : "block"
            )}
          >
            Trustless Vault
          </span>
        </div>
        {variant === "desktop" ? (
          <button
            className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        ) : (
          <button
            className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition",
                "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600",
                "dark:text-gray-300 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300",
                isActive &&
                  "bg-indigo-500/10 text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-500/20 dark:text-indigo-300"
              )}
            >
              <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                {item.icon}
              </span>
              <span
                className={cn(
                  "truncate",
                  collapsed && variant === "desktop" ? "hidden" : "inline"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex md:hidden",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />
        <aside
          className={cn(
            "relative h-full w-72 max-w-[80%] translate-x-0 transform bg-white shadow-xl transition-transform dark:bg-gray-950",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {content}
        </aside>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-gray-200 bg-white text-gray-900 dark:border-gray-900/60 dark:bg-gray-950 dark:text-gray-100 md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {content}
    </aside>
  );
};
