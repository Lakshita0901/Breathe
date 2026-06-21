/**
 * Sanitizes user input to prevent XSS injection and enforce input restrictions.
 * Trims leading/trailing whitespace, limits string length to 500 characters,
 * and strips HTML tags using a regular expression.
 * 
 * @param input - Raw user input string from chatbot input fields
 * @returns Sanitized, safe string limited to 500 characters
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 500)
    .replace(/<[^>]*>/g, '');
}

/**
 * Validates Gemini API key format, presence, and default placeholders.
 * Checks that the key is a string, has a length of at least 10 characters,
 * and is not the default boilerplate text ('your_key_here').
 * 
 * @param key - API key string to validate
 * @returns True if the API key format is valid, false otherwise
 */
export function validateApiKey(key: string): boolean {
  return typeof key === 'string' && key.length >= 10 && key !== 'your_key_here';
}
