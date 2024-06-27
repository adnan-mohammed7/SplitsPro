import styles from '@/styles/Layout.module.css'
import Link from 'next/link';

export default function Layout(props) {
    return (
      <>
      <div className={styles.layoutBody}>
        <h1 id={styles.heading}>SplitsPro</h1>
        <div className={styles.links}>
        <Link className={styles.hyperlinks}  href="/">Home</Link> | <Link className={styles.hyperlinks} href="/login">Login</Link>
        </div>
    </div>
        <br />
        {props.children}
        <br />
      </>
      
    );
  }