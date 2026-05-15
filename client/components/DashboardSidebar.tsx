"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/DashboardSidebar.module.css";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Repositories", href: "/dashboard/repositories" },
  { label: "Reviews", href: "/dashboard/reviews" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon} />
        <span className={styles.logoText}>Code-Critiq</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${pathname === item.href ? styles.active : ""}`}
          >
            <span className={styles.navIcon} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
