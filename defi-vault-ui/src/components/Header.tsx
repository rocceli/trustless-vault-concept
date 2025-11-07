// header.tsx
import { useState } from "react";
import { MenuIcon, XIcon, CoinsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ui/toggletheme";
import { WalletButton } from "./WalletConnectBtn";

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Vault", href: "/dashboard/vault" },
    { label: "Liquidity", href: "/dashboard/liquidity" },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="bg-white/95 dark:bg-gray-900/95 shadow-md border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-2">
              <CoinsIcon className="h-6 w-6 md:h-7 md:w-7 text-indigo-600" />
              <span className="text-lg font-display font-semibold text-gray-900 dark:text-gray-100">
                SatoshiLend
              </span>
            </div>

            {/* Center - Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center gap-2 md:gap-3">
                <ThemeToggle />
                <WalletButton />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {menuOpen ? (
                  <XIcon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
                ) : (
                  <MenuIcon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="flex flex-col items-center py-4 space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="w-full px-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <WalletButton />
                  <ThemeToggle />
                </div>
              </div>
            </motion.nav>
          )}
        </header>
      </div>
    </div>
  );
};