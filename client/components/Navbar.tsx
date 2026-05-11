import Image from "next/image";
import styles from "@/styles/Navbar.module.css"

export default function Navbar(){
    const id = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const githubURL = `https://github.com/login/oauth/authorize?client_id=${id}&scope=user:email`;
    return(
        <>
        <div className={styles.navbar}>
            <Image src="/CC-logo-transparent.png" width={200} height={35} alt="logo" className={styles.logo} loading="eager"/>
            <div className={styles.navlinks}>
                <ul className={styles.navlist}>
                    <li>Home</li>
                    <li>Services</li>
                    <li>About</li>
                    <li>Docs</li>
                </ul>
            </div>
            <a href={githubURL} className={styles.githubbtn}>
                <Image src="/github.svg" width={20} height={20} alt="github" className={styles.icon}/> 
                Get Started
            </a>
        </div>
        </>
    )
}