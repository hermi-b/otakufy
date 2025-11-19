// Content script for Spotify lyrics furigana extension
// This script assumes `kuromoji.js` (browser build) is injected before it via the manifest.
// It uses chrome.runtime.getURL to point kuromoji at the extension's `dict/` folder so fetches work.

function addFuriganaToLyricsFromTokens(tokens) {
    let html = '';
    tokens.forEach(token => {
        try {
            const surface = token.surface_form || '';
            const reading = token.reading || '';
            // If surface contains Kanji characters and we have a different reading, add ruby
            if (/\p{Script=Han}/u.test(surface) && reading && surface !== reading) {
                // Convert katakana reading to hiragana for nicer display if needed
                const hiragana = katakanaToHiragana(reading);
                html += `<ruby><rb>${escapeHtml(surface)}</rb><rt>${escapeHtml(hiragana)}</rt></ruby>`;
            } else {
                html += escapeHtml(surface);
            }
        } catch (e) {
            console.error('Token processing error', e, token);
            html += escapeHtml(token.surface_form || '');
        }
    });
    return html;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>\"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

function katakanaToHiragana(kata) {
    // Katakana Unicode block to Hiragana: subtract 0x60 from code points in range
    return kata.replace(/[\u30A1-\u30F6]/g, function(ch) {
        return String.fromCharCode(ch.charCodeAt(0) - 0x60);
    });
}

function containsJapanese(text) {
    return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text);
}

function replaceTextNodeWithFragment(textNode, fragment) {
    const range = document.createRange();
    range.selectNodeContents(textNode);
    range.deleteContents();
    range.insertNode(fragment);
}

function annotateSpanSafely(span, tokenizer) {
    if (!span || span.dataset.furiganaProcessed) return;
    // Only operate on elements that contain visible text
    const text = span.innerText || span.textContent || '';
    if (!text.trim() || !containsJapanese(text)) return;

    // If the span contains child elements, skip to avoid breaking nested structure
    const hasElementChildren = Array.from(span.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
    if (hasElementChildren) {
        // Fall back to a non-destructive approach: don't modify complex nodes
        return;
    }

    let tokens = [];
    try {
        tokens = tokenizer.tokenize(text);
    } catch (e) {
        console.error('Tokenization failed', e);
        return;
    }

    // Build fragment from tokens
    const frag = document.createDocumentFragment();
    tokens.forEach(token => {
        try {
            const surface = token.surface_form || '';
            const reading = token.reading || '';
            if (/\p{Script=Han}/u.test(surface) && reading && surface !== reading) {
                const ruby = document.createElement('ruby');
                const rb = document.createElement('rb'); rb.textContent = surface;
                const rt = document.createElement('rt'); rt.textContent = katakanaToHiragana(reading);
                ruby.appendChild(rb);
                ruby.appendChild(rt);
                frag.appendChild(ruby);
            } else {
                frag.appendChild(document.createTextNode(surface));
            }
        } catch (e) {
            console.error('Token processing error', e, token);
            frag.appendChild(document.createTextNode(token.surface_form || ''));
        }
    });

    // Find first text node to replace
    const textNode = Array.from(span.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
        replaceTextNodeWithFragment(textNode, frag);
        span.dataset.furiganaProcessed = '1';
    } else {
        // If no text node (unlikely after hasElementChildren check), append fragment
        span.appendChild(frag);
        span.dataset.furiganaProcessed = '1';
    }
}

function findLyricsContainers() {
    // Spotify DOM may change; check a few reasonable selectors
    const selectors = [
        '[data-testid="lyrics-container"]',
        '.lyrics-lyrics-content',
        '.lyrics',
        '[data-testid="lyrics"]'
    ];
    const found = [];
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => found.push(el));
    });
    return found;
}

function initKuromojiAndStart() {
    if (typeof kuromoji === 'undefined') {
        console.error('kuromoji is not available in the page context');
        return;
    }

    // Prefer the extension's dict path so the browser can fetch the resources from the extension
    let dicPath = 'dict/';
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            dicPath = chrome.runtime.getURL('dict/') ;
        }
    } catch (e) {
        console.warn('Could not get chrome.runtime URL for dict, using relative path', e);
    }

    kuromoji.builder({ dicPath: dicPath }).build(function(err, tokenizer) {
        if (err) {
            console.error('Kuromoji error:', err);
            return;
        }

        // Process any existing lyric line spans (Spotify class may change)
        const lyricClass = 'MmIREVIj8A2aFVvBZ2Ev';
        const existingSpans = document.getElementsByClassName(lyricClass);
        Array.from(existingSpans).forEach(span => annotateSpanSafely(span, tokenizer));

        // Observe the page for added lyric spans and process them
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                if (m.addedNodes && m.addedNodes.length) {
                    m.addedNodes.forEach(node => {
                        if (node.nodeType !== 1) return;
                        // If the added node itself is a lyric span
                        if (node.classList && node.classList.contains(lyricClass)) {
                            annotateSpanSafely(node, tokenizer);
                        }
                        // Or if it contains lyric spans as descendants
                        const descendants = node.getElementsByClassName ? node.getElementsByClassName(lyricClass) : [];
                        Array.from(descendants).forEach(d => annotateSpanSafely(d, tokenizer));
                    });
                }
                // If character data changed inside an existing lyric span, try to re-annotate its parent
                if (m.type === 'characterData' && m.target && m.target.parentElement) {
                    const p = m.target.parentElement.closest && m.target.parentElement.closest('.' + lyricClass);
                    if (p) annotateSpanSafely(p, tokenizer);
                }
            });
        });

        observer.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });
}

// Wait until document is ready enough
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKuromojiAndStart);
} else {
    // DOM already loaded
    setTimeout(initKuromojiAndStart, 0);
}
