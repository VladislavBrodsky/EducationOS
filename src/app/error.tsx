'use client';
import Link from 'next/link';
export default function ErrorBoundary({reset}:{error:Error & {digest?:string};reset:()=>void}){return <main id="main-content" className="container error-page"><h1>Something interrupted the experiment.</h1><p>Your local demo work may still be in this tab. Try again or return home.</p><button onClick={reset} className="button button-dark">Try again</button><Link href="/" className="text-link mt-6 justify-self-center">Return home</Link></main>}
