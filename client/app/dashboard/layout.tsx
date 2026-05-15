import DashboardSidebar from "@/components/DashboardSidebar";
import styles from "@/styles/DashboardLayout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <DashboardSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
