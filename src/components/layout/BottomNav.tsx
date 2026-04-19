"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    id: "hq",
    label: "HQ",
    href: "/hq",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "train",
    label: "TRAIN",
    href: "/train",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 10H4M16 10H18M4 10V8M4 10V12M16 10V8M16 10V12M6 8H14M6 12H14M6 8V12M14 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "chow",
    label: "CHOW",
    href: "/chow",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3V9C6 11.2 7.8 13 10 13C12.2 13 14 11.2 14 9V3M10 13V17M7 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "range",
    label: "RANGE",
    href: "/range",
    locked: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 3V5M10 15V17M3 10H5M15 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "log",
    label: "LOG",
    href: "/log",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="12" height="14" rx="0" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 7H13M7 10H13M7 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "admin",
    label: "ADMIN",
    href: "/admin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 3V5M10 15V17M3 10H5M15 10H17M4.93 4.93L6.34 6.34M13.66 13.66L15.07 15.07M4.93 15.07L6.34 13.66M13.66 6.34L15.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/callback")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-ets-surface border-t border-ets-border z-50">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isLocked = item.locked;

          if (isLocked) {
            return (
              <div
                key={item.id}
                className="flex-1 flex flex-col items-center justify-center gap-1 opacity-20 pointer-events-none select-none"
              >
                <span className="text-ets-text-low">{item.icon}</span>
                <span className="font-display text-[9px] tracking-widest text-ets-text-low">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1"
            >
              <span className={isActive ? "text-ets-accent" : "text-ets-text-low"}>
                {item.icon}
              </span>
              <span
                className={`font-display text-[9px] tracking-widest ${
                  isActive ? "text-ets-accent" : "text-ets-text-low"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-[2px] bg-ets-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
