/**
 * Normalize an error string for search/matching by stripping:
 * - Line numbers (e.g. ":42", " at line 123")
 * - File paths (absolute/relative, with drive letters on Windows)
 * - Memory addresses (e.g. "0x7fff...", "0x00007f...")
 * - Repeated whitespace
 */

const LINE_NUMBER_PATTERNS = [
  /:\s*\d+\s*$/gm,                    // :42 at end of line
  /:\d+:\d+/g,                         // :line:column
  /\s+at\s+line\s+\d+/gi,
  /\(.*?:\d+:\d+\)/g,                  // (file:line:col)
  /:\d+\s*\)/g,                        // :42)
]

const FILE_PATH_PATTERN = /(?:[A-Za-z]:)?[\\/](?:[\w.-]+[\\/])*[\w.-]+\.(?:js|jsx|ts|tsx|py|css|html|json|mjs|cjs)(?::\d+)?(?::\d+)?/g

const MEMORY_ADDRESS_PATTERN = /0x[0-9a-fA-F]+/g

const MULTI_SPACE = /\s+/g

/**
 * Strip line numbers from a string.
 * @param {string} str
 * @returns {string}
 */
function stripLineNumbers(str) {
  let out = str
  for (const re of LINE_NUMBER_PATTERNS) {
    out = out.replace(re, ' ')
  }
  return out
}

/**
 * Strip file paths from a string.
 * @param {string} str
 * @returns {string}
 */
function stripPaths(str) {
  return str.replace(FILE_PATH_PATTERN, ' ')
}

/**
 * Strip memory addresses from a string.
 * @param {string} str
 * @returns {string}
 */
function stripAddresses(str) {
  return str.replace(MEMORY_ADDRESS_PATTERN, ' ')
}

/**
 * Collapse repeated whitespace and trim.
 * @param {string} str
 * @returns {string}
 */
function normalizeWhitespace(str) {
  return str.replace(MULTI_SPACE, ' ').trim()
}

/**
 * Create a normalized search pattern from an error string.
 * Use this when storing a fingerprint or when searching so that
 * "Error in foo.js:42" and "Error in bar.js:99" match the same pattern.
 *
 * @param {string} errorMessage - Raw error text
 * @returns {string} Normalized string for matching/search
 */
export function fingerprint(errorMessage) {
  if (typeof errorMessage !== 'string') return ''
  let out = errorMessage
  out = stripLineNumbers(out)
  out = stripPaths(out)
  out = stripAddresses(out)
  out = normalizeWhitespace(out)
  return out
}
