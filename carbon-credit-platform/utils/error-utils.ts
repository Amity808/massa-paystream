// utils/error-utils.ts
export const setError = (message: string) => {
  console.error("Error:", message)
  // In a real app, you might want to use a toast notification system here
  // For now, we'll just log the error
}
