import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/page.module.css";


export default function Home(){

  const id = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`;
  const githubURL = `https://github.com/login/oauth/authorize?client_id=${id}&scope=repo,read:user,user:email,admin:repo_hook&redirect_uri=${encodeURIComponent(callbackUrl)}`;
  return(
    <div className={styles.container}>
    <Navbar />
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Code Critiq</h1>
        <p className={styles.subtitle}>Automated Pull request feedback</p>
        <a href={githubURL} className={styles.githubbtn}>
          <Image src="/github.svg" width={20} height={20} alt="github" className={styles.icon}/> 
          Continue with Github
        </a>
        
        <p className={styles.footer}>Powered by LLM and AWS</p>
      </div>
    </div>
    <Footer />
    </div>
  )
}
