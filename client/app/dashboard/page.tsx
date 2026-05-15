import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/Dashboard.module.css";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/");

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; username: string; avatarUrl: string };
  } catch {
    redirect("/");
  }
}

export default async function Dashboard() {
  const user = await getUser();

  return (
    <div className={styles.container}>
      <div className={styles.profile}>
        <Image
          src={user.avatarUrl}
          alt={user.username}
          width={80}
          height={80}
          className={styles.avatar}
        />
        <h2 className={styles.username}>@{user.username}</h2>
      </div>
    </div>
  );
}
