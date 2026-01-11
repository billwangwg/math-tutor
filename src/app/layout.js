
import { Analytics } from "@vercel/analytics/react"
import Script from 'next/script';
import './globals.css';

export const metadata = {
    title: '家长急救包',
    description: 'Intelligent, adaptive math tutoring with Gemini',
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <head />
            <body>
                <Script id="mathjax-config" strategy="beforeInteractive">
                    {`
                        window.MathJax = {
                            tex: { 
                                inlineMath: [['$', '$'], ['\\(', '\\)']],
                                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                                processEscapes: true,
                                packages: {'[+]': ['noerrors', 'noundefined']}
                            },
                            chtml: {
                                break: { automatic: true } // Enable automatic line breaking
                            },
                            options: {
                                ignoreHtmlClass: 'tex2jax_ignore',
                                processHtmlClass: 'tex2jax_process'
                            },
                            startup: {
                                typeset: false // We control this in React components
                            },
                            svg: {
                                fontCache: 'global'
                            }
                        };
                    `}
                </Script>
                <Script
                    id="mathjax-loader"
                    strategy="afterInteractive"
                    src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
                />

                {children}
                <Analytics />
            </body>
        </html>
    );
}
