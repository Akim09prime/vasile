
import { Html, Head, Main, NextScript } from 'next/document';
 
// This is a compatibility fallback for Next.js.
// In a pure App Router setup, this file might not be strictly necessary,
// but it can help stabilize error handling for edge cases where Next.js
// might fall back to the pages router behavior for rendering errors.
// It doesn't interfere with the App Router's normal operation.
export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
