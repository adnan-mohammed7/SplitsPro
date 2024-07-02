import styles from '@/styles/Layout.module.css'
import Link from 'next/link';
import { readToken, removeToken } from '@/lib/authenticate';
import { useRouter } from 'next/router';

export default function Layout(props) {
  let token = readToken();
  const router = useRouter();

  function logout() {
    removeToken();
    router.push('/login');
  }
  return (
    <>
      <div className={styles.layoutBody}>
        <h1 id={styles.heading}>SplitsPro</h1>
        <div className={styles.links}>
          {!token && <Link className={styles.hyperlinks} href="/">Homepage</Link>}{!token && <p> | </p>}{!token&&<Link className={styles.hyperlinks} href="/login">Login</Link>}{!token && <p> | </p>}{!token && <Link className={styles.hyperlinks} href="/signup">Signup</Link>} {token && <Link className={styles.hyperlinks} href="/login" onClick={logout}>Logout</Link>}
        </div>
      </div>
      <br />
      {props.children}
      <br />
    </>

  );
}