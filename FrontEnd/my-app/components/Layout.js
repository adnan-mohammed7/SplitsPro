export default function Layout(props) {
    return (
      <>
        <h1>Pages / Routing in Next.js</h1>
        <a href="/">Home</a> | <a href="/login">Login</a>
        <hr />
        <br />
        {props.children}
        <br />
      </>
    );
  }