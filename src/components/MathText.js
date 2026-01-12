import React, { useEffect, useRef, useState } from 'react';

/**
 * A robust component for rendering text containing LaTeX math formulas.
 * Features:
 * 1. Scoped Typesetting: Only processes itself, avoiding global conflicts.
 * 2. Anti-Jitter: Hides content until MathJax finishes rendering, then fades in.
 * 3. React-Friendly: Handles updates correctly by re-triggering typesetting.
 */
let mathJaxChain = Promise.resolve();

export default function MathText({ content, className = '', block = false }) {
    const containerRef = useRef(null);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        setIsRendered(false);
        let cancelled = false;

        // Queue this render task
        // We wrap the operation in a new promise appended to the global chain
        // This ensures Option A finishes before Option B starts
        mathJaxChain = mathJaxChain.then(async () => {
            if (cancelled) return;
            if (!containerRef.current || !window.MathJax) {
                if (!cancelled) setIsRendered(true);
                return;
            }

            try {
                // Ensure startup is done
                if (window.MathJax.startup && window.MathJax.startup.promise) {
                    await window.MathJax.startup.promise;
                }

                if (cancelled) return;

                console.log("[MathText] Active Config:", JSON.stringify(window.MathJax.config?.tex?.inlineMath));
                console.log("[MathText] DOM innerHTML:", containerRef.current.innerHTML);

                // Render specific node
                if (window.MathJax.typesetPromise) {
                    await window.MathJax.typesetPromise([containerRef.current]);
                    console.log("[MathText] Render Success. New innerHTML len:", containerRef.current.innerHTML.length);
                } else {
                    console.warn("[MathText] MathJax.typesetPromise missing");
                }

                if (!cancelled) setIsRendered(true);
            } catch (err) {
                // ... (keep existing catch)
                if (!err.message?.includes('in progress')) {
                    console.warn("MathText Render Error:", err);
                }
                if (!cancelled) setIsRendered(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [content]);

    const Tag = block ? 'div' : 'span';

    // Helper: Auto-fix missing delimiters for common Math cases
    const autoFixMath = (text, isBlock) => {
        if (!text) return '';

        // 0. Aggressively unescape \$ to $ to prevent literal dollar signs
        // This fixes cases where the parser or AI output includes escaped dollars
        let fixed = text.replace(/\\\$/g, '$');

        // Remove literal \n or \\n which can render as red error text in MathJax
        fixed = fixed.replace(/(\\n|\n)/g, ' ');

        // 1. Block Mode: Ensure clean wrapping
        if (isBlock) {
            let content = fixed.trim();

            // Remove existing outer display delimiters if present
            if (content.startsWith('$$') && content.endsWith('$$')) {
                content = content.slice(2, -2);
            } else if (content.startsWith('\\[') && content.endsWith('\\]')) {
                content = content.slice(2, -2);
            } else if (content.startsWith('$') && content.endsWith('$')) {
                // Also strip single $ if in block mode, to promote to $$
                content = content.slice(1, -1);
            }

            return `$$${content}$$`;
        }

        // 2. Inline Mode: Heuristic to wrap "naked" LaTeX commands in $...$
        // We look for common math commands that are NOT already inside $...$
        // To do this safely, we split by dollar signs to isolate non-math text segments.
        const segments = fixed.split(/(\$[^$]+\$)/g);

        const mathKeywords = [
            'angle', 'triangle', 'frac', 'sqrt', 'cdot', 'times',
            'circ', 'deg', 'alpha', 'beta', 'pi', 'sigma', 'theta', 'omega', 'infty',
            'approx', 'neq', 'leq', 'geq', 'pm'
        ];
        // Regex to find \command that is NOT escaped (\\command)
        // We look for backslash + keyword + optional params
        // Example: \angle AOB
        const keywordPattern = new RegExp(`\\\\(${mathKeywords.join('|')})`, 'g');

        return segments.map((seg, i) => {
            // Even index = text outside $...$, Odd index = inside $...$ (keep as is)
            if (i % 2 === 1) return seg;

            // In text segment, find naked LaTeX.
            // A simple heuristic: if we see a math command, we wrap the immediate context? 
            // Too hard to determine context boundaries (e.g. \angle AOB = 90).
            // BETTER: If a text segment contains ANY math keywords, and is not just whitespace, 
            // treat the WHOLE segment as potential math? 
            // No, "The value of \angle AOB is..." -> "$The value of \angle AOB is...$" (Italicizes everything, bad).

            // "Smart" Replacement: 
            // We replace `\command ...` with `$\command ...$` ? 
            // It's very risky to guess where the math ends.
            // BUT, for the specific user complaint (Challenge section), the pattern is usually:
            // "当 \angle AOB = 90^\circ 时"
            // We can look for continuous sequences of [MathChars] starting with a \Command?

            // Compromise: 
            // Minimal fix for the most screaming issues (Geometry symbols).
            // We replace `\angle\s+[A-Za-z]+` with `$\0$`.

            let processed = seg;

            // Fix \angle ABC
            processed = processed.replace(/\\angle\s+[A-Za-z0-9']+/g, (match) => `$${match}$`);

            // Fix \sqrt{...} (assuming no nested braces for simplicity, or just one level)
            processed = processed.replace(/\\sqrt\{[^}]+\}/g, (match) => `$${match}$`);

            // Fix \frac{...}{...}
            processed = processed.replace(/\\frac\{[^}]+\}\{[^}]+\}/g, (match) => `$${match}$`);

            // Fix 90^\circ or just ^\circ
            processed = processed.replace(/\d*\^\\circ/g, (match) => `$${match}$`);

            return processed;
        }).join('');
    };

    // Auto-fix the content before rendering
    const safeContent = React.useMemo(() => autoFixMath(content, block), [content, block]);

    // Memoize the HTML object to prevent React from resetting the DOM when other state changes
    const htmlObj = React.useMemo(() => ({ __html: safeContent }), [safeContent]);

    return (
        <Tag
            ref={containerRef}
            style={{ display: block ? 'block' : 'inline', whiteSpace: 'normal' }}
            className={`${className} tex2jax_process transition-opacity duration-200 ${isRendered ? 'opacity-100' : 'opacity-0'}`}
            dangerouslySetInnerHTML={htmlObj}
        />
    );
}
