"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "@/styles/DashboardSidebar.module.css";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: "Repositories",
    href: "/dashboard/repositories",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4a1 1 0 011-1h3.5l2 2H14a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="1" width="10" height="14" rx="1.5" />
        <line x1="5.5" y1="5" x2="10.5" y2="5" />
        <line x1="5.5" y1="8" x2="10.5" y2="8" />
        <line x1="5.5" y1="11" x2="9" y2="11" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="9" width="3.5" height="6" rx="0.5" />
        <rect x="6.25" y="5" width="3.5" height="10" rx="0.5" />
        <rect x="11.5" y="2" width="3.5" height="13" rx="0.5" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M12.6 3.4l-1.06 1.06M4.46 11.54l-1.06 1.06" />
      </svg>
    ),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Image src="/CC-logo-transparent.png" alt="Code Critiq" width={200} height={35} priority className={styles.logoImage} />
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
