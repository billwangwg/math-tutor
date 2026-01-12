
import { Analytics } from "@vercel/analytics/react"
import Script from 'next/script';
import './globals.css';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#ffffff',
};

export const metadata = {
    title: '家长急救包 | 智能初中数学辅导',
    description: '基于 Google Gemini 的智能数学解题助手。拍照上传，即刻获得波利亚式解题引导、知识点诊脉与变式练习，帮助家长轻松辅导孩子。',
    keywords: ['初中数学', '家长辅导', 'AI解题', '波利亚解题法', '数学思维', 'Gemini', 'Google Generative AI'],
    authors: [{ name: 'Math Tutor Team' }],
    openGraph: {
        title: '家长急救包 - 爸妈的数学辅导神器',
        description: '拍照即解，深度剖析。不只是给答案，更是教会解题思维。',
        type: 'website',
    },
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
                    src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-svg.js"
                />

                {children}

                <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-100 mt-12 bg-gray-50/50">
                    <div className="flex flex-col gap-1">
                        <p>家长急救包 · Math Tutor</p>
                        <p className="font-mono text-xs opacity-70">
                            v0.1.0 • Build 2026-01-11
                        </p>
                    </div>
                </footer>

                <Analytics />
            </body>
        </html>
    );
}
