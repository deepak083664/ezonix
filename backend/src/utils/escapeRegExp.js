/**
 * Safely escapes regular expression metacharacters from a string.
 * Helps prevent RegExp Injection crashes when parsing user inputs.
 */
module.exports = (string) => {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
