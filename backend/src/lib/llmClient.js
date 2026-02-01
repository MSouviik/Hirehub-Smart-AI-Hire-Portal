import fetch from 'node-fetch';

const LLM_URL = 'http://127.0.0.1:11434/api/chat';

/**
 * Sends a prompt to the LLM and retrieves the response.
 * @param {string} prompt - The prompt to send to the LLM.
 * @returns {Promise<Object>} - The response from the LLM.
 */
export async function sendToLLM(prompt) {
    const response = await fetch(LLM_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'qwen2.5-coder:1.5b',
            messages: [
                { "role": "user", "content": prompt }
            ],
            stream: false
        }),
    });

    const data = await response.json();
    return data;
}