export function assert<T>(condition: T, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed")
  }
}
