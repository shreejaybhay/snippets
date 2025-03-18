document.addEventListener('DOMContentLoaded', (event) => {
  // Initialize highlight.js
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
});