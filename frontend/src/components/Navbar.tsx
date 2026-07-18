"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, CircleUserRound, Globe, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-hairline">
      <div className="max-w-[1760px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        <Link href="/" className="flex items-center gap-2 text-rausch font-bold text-2xl tracking-tight shrink-0">
          <Home size={28} strokeWidth={2.4} />
          <span className="hidden sm:inline">airbnb</span>
        </Link>

        <nav className="flex items-center gap-3 shrink-0">
          <Link
            href="/host"
            className="hidden md:inline text-sm font-medium text-ink px-4 py-3 rounded-full hover:bg-gray-100"
          >
            Airbnb your home
          </Link>
          <button
            aria-label="Language"
            className="hidden sm:flex p-3 rounded-full hover:bg-gray-100 text-ink"
          >
            <Globe size={18} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-3 border border-hairline rounded-full pl-3 pr-2 py-2 hover:shadow-soft transition-shadow"
            >
              <Menu size={16} />
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <CircleUserRound size={26} className="text-graytext" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-hairline rounded-xl shadow-card py-2 text-sm">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-hairline mb-1">
                      <p className="font-medium text-ink truncate">{user.name}</p>
                      <p className="text-graytext text-xs truncate">{user.email}</p>
                    </div>
                    <MenuLink href="/trips" onClick={() => setMenuOpen(false)}>My trips</MenuLink>
                    <MenuLink href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</MenuLink>
                    <MenuLink href="/host" onClick={() => setMenuOpen(false)}>Host dashboard</MenuLink>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        router.push("/");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-ink font-medium"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <MenuLink href="/login" onClick={() => setMenuOpen(false)}>Log in</MenuLink>
                    <MenuLink href="/signup" onClick={() => setMenuOpen(false)}>Sign up</MenuLink>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-4 py-2 hover:bg-gray-100 text-ink">
      {children}
    </Link>
  );
}
