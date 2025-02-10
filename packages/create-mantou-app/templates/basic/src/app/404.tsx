import type { CSSProperties } from "react";

const ErrorPage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.number} data-count="404">
        404
      </div>
      <div style={styles.text}>
        Page not found. <a href="/">Go back to home</a>
      </div>
    </div>
  );
};

export default ErrorPage;

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
  },
  number: {
    fontSize: "10rem",
    fontWeight: "bold",
    color: "#333",
  },
  text: {
    fontSize: "1rem",
    color: "#333",
  },
} as { [key: string]: CSSProperties };
