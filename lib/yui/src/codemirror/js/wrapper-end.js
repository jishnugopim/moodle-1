// Actually define beautify in our namespace.
M.core = M.core || {};
M.core.codemirror = CodeMirror;

// Restore the original CodeMirror in case one existed.
window.CodeMirror = _codeMirror;
