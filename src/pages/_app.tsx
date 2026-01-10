
import type { AppProps } from 'next/app';
 
// This is a compatibility fallback for Next.js.
// In a pure App Router setup, this file might not be strictly necessary,
// but it can help stabilize error handling for edge cases where Next.js
// might fall back to the pages router behavior for rendering errors.
// It doesn't interfere with the App Router's normal operation.
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
