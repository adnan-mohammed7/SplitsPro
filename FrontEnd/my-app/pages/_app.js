import Layout from "@/components/Layout";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import RouteGuard from "@/components/RouteGuard";


export default function App({ Component, pageProps }) {
  return (
    <RouteGuard><Layout>
      <Component {...pageProps} />
    </Layout></RouteGuard>

  );
}
