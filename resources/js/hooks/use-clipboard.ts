// Credit: https://usehooks-ts.com/
import { useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

export async function copyTextToClipboard(text: string): Promise<boolean> {
    if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('navigator.clipboard copy failed, trying fallback:', error);
        }
    }

    // Fallback for non-secure contexts (e.g. http://0.0.0.0, http://192.168.x.x)
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (error) {
        console.error('Fallback copy failed:', error);
        return false;
    }
}

export function useClipboard(): UseClipboardReturn {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = async (text) => {
        const success = await copyTextToClipboard(text);
        if (success) {
            setCopiedText(text);
        } else {
            setCopiedText(null);
        }
        return success;
    };

    return [copiedText, copy];
}

