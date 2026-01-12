/**
 * Compresses an image file iteratively until it fits under the target size (approx 3MB safe for Vercel).
 * @param {File} file - The uploaded image file.
 * @param {Function} onProgress - Callback for status updates (e.g. "Compressing attempt 2...").
 * @returns {Promise<{fullDataUrl: string, base64Body: string}>}
 */
export const compressImage = async (file, onProgress = () => { }) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = async () => {
                // Target: Vercel 4.5MB limit. 
                // Base64 adds 33%. Safe binary limit ~3MB.
                // Safe Base64 length ~ 4,000,000 chars.
                const MAX_BASE64_LENGTH = 4 * 1024 * 1024;

                let width = img.width;
                let height = img.height;
                let quality = 0.9;
                let attempt = 1;

                // Initial Resize Logic
                let maxDim = 2000;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');

                const tryCompress = () => {
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const base64Body = dataUrl.split(',')[1];
                    const currentLength = base64Body.length;

                    if (currentLength < MAX_BASE64_LENGTH || attempt >= 5) {
                        resolve({ fullDataUrl: dataUrl, base64Body });
                    } else {
                        // Too big, aggressive reduce
                        attempt++;
                        if (onProgress) {
                            onProgress(currentLength, attempt);
                        }

                        // Reduce dimensions by 20%
                        width = Math.floor(width * 0.8);
                        height = Math.floor(height * 0.8);
                        // Reduce quality
                        quality = Math.max(0.5, quality - 0.1);

                        // Slight delay to allow UI to update (handled by caller usually, but good for async loop)
                        setTimeout(tryCompress, 50);
                    }
                };

                tryCompress();
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

/**
 * Robustly parses JSON from potentially messy AI output.
 * Handles extensive LaTeX backslash cleanup and markdown code block stripping.
 * @param {string} text - The raw text from the AI stream.
 * @returns {object} - The parsed JSON object.
 * @throws {Error} - If parsing fails even after repair.
 */
export const robustJsonParse = (text) => {
    let sanitized = text;

    // 1. Extract JSON block if Markdown code blocks are present
    const codeBlockRegex = /```(?:json)?([\s\S]*?)```/g;
    const matches = [...text.matchAll(codeBlockRegex)];
    if (matches.length > 0) {
        // Use the last code block found (often the final answer)
        sanitized = matches[matches.length - 1][1];
    } else {
        // Fallback: Try to find the first '{' and last '}'
        const firstParen = text.indexOf('{');
        const lastParen = text.lastIndexOf('}');
        if (firstParen !== -1 && lastParen !== -1) {
            sanitized = text.substring(firstParen, lastParen + 1);
        }
    }

    // 0. Pre-process: REMOVED aggressive global newline escaping as it breaks JSON structure
    // We will handle specific invalid chars later or rely on the regex

    sanitized = sanitized.trim();

    // 2. Fix Trailing Commas (Common AI Error)
    sanitized = sanitized.replace(/,(\s*[\]}])/g, '$1');

    // 3. Escape Backslashes (LaTeX Safety)
    // First, temporarily protect double backslashes which are valid JSON escapes
    sanitized = sanitized.replace(/\\\\/g, '____DOUBLE_BACKSLASH____');

    // Now look for single backslashes that precedes something that isn't a control char
    // (We assume all valid JSON control chars like \n \t \" are already correct if AI generated them)
    // But LaTeX commands like \frac need escaping
    // FIX: Use a callback to handle ALL backslashes safely
    // Match backslash followed by ANY character (including newlines)
    // IMPROVEMENT: Special handling for Unicode escapes \uXXXX which should be preserved!
    // Regex logic: 
    // Group 1: Matches \u followed by 4 hex digits (Valid Unicode)
    // Group 2: Matches any other backslash sequence
    sanitized = sanitized.replace(/(\\u[0-9a-fA-F]{4})|\\([\s\S])/g, (match, unicodeGroup, charGroup) => {
        // Case 1: Valid Unicode Escape (e.g. \u4f60) -> Preserve it exactly
        if (unicodeGroup) {
            return unicodeGroup;
        }

        // Case 2: Other Backslash sequence -> Double escape it
        const char = charGroup;

        // Keep valid JSON escapes: \" \\ \/ \b \f \n \r \t
        // But usually AI outputs literal \n for newlines, so we only strictly need to keep punctuation escapes needed for structure
        if (char === '"' || char === '\\' || char === '/') {
            return match;
        }

        // Fix: Explicitly unescape \$ to $ because MathJax needs raw $, otherwise \$ renders as literal dollar sign
        if (char === '$') {
            return '$';
        }

        // Also keep standard control chars if by chance they appear? 
        // No, usually we want to double escape them if they are part of text (like \n in LaTeX)
        // If the AI outputs literal \n (char 10) it's invalid JSON anyway, but handled later?
        // Let's safe-guard standard JSON whitespace escapes too just in case
        if (['b', 'f', 'n', 'r', 't'].includes(char)) {
            // If we have \n, it becomes a newline in the string.
            // If we double escape it \\n, it becomes literal \n char in the string.
            // LaTeX uses \n for... nothing? but \t is tab.
            // Best to double escape standard chars too if they are being used as text (like \tan)
            // \tan -> \t is tab? No.
            // JSON string "\tan" -> TAB + "an". This is valid JSON but WRONG content for LaTeX.
            // We want "\tan" string. So we need "\\tan".
            // So we SHOULD double escape \t, \n etc.
            return '\\\\' + char;
        }
        return '\\\\' + char;
    });

    // Restore double backslashes
    sanitized = sanitized.replace(/____DOUBLE_BACKSLASH____/g, '\\\\');

    // 4. Specific Repairs REMOVED (Conflicted with main regex)
    // The main regex now properly handles these cases by escaping the backslash.

    try {
        return JSON.parse(sanitized);
    } catch (e) {
        let errorMsg = e.message;
        // Parse error usually contains position, e.g. "at position 123"
        const matchPos = errorMsg.match(/position (\d+)/);
        let context = "";
        if (matchPos) {
            const pos = parseInt(matchPos[1], 10);
            const start = Math.max(0, pos - 50);
            const end = Math.min(sanitized.length, pos + 50);
            context = `Context at ${pos}: "${sanitized.substring(start, end).replace(/\n/g, '\\n')}"`;
        } else {
            context = `Full Sanitized (first 200): "${sanitized.substring(0, 200)}..."`;
        }
        throw new Error(`JSON Parse Failed: ${errorMsg}. ${context}`);
    }
};


/**
 * Triggers MathJax rendering with a robust polling mechanism.
 * Solves race conditions where MathJax might not be loaded yet.
 * Uses a global promise chain to prevent collisions.
 *
 * @deprecated Use <MathText /> component instead, which handles this queue internally.
 */
// export const renderMath = ... (Removed to enforce usage of MathText)
