/**
 * debounceFetch
 *
 * Utility function that debounces async fetch operations.
 * Prevents excessive API calls when state changes frequently.
 *
 * @param callback - Async function to debounce
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns A debounced function that cancels previous timeouts
 */
export function createDebounceFetch<T extends any[], R>(
  callback: (...args: T) => Promise<R>,
  delay: number = 500
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function debouncedFetch(...args: T): Promise<R> {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await callback(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

/**
 * Usage example:
 *
 * const debouncedFetch = createDebounceFetch(
 *   async (params: URLSearchParams) => {
 *     const response = await fetch(`/api/exams?${params}`)
 *     return response.json()
 *   },
 *   500  // default delay
 * )
 *
 * // In your component
 * const result = await debouncedFetch(params)
 */
