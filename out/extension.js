"use strict";
/**
 * Copy Pytest Reference Extension for VS Code
 *
 * Provides JetBrains-style "Copy Reference" functionality that allows users to
 * right-click on any symbol and copy its full dot notation path (formatted for pytest) to the clipboard.
 *
 * Supports Python only
 *
 * @author Clara Yip
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
/**
 * Activates the extension and registers the copy reference command
 * @param context - The extension context
 */
function activate(context) {
    const disposable = vscode.commands.registerCommand('copyReference.copyPath.pytest', async () => {
        await handleCopyReference();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
/**
 * Handles the copy reference command execution
 */
async function handleCopyReference() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }
    const document = editor.document;
    const position = editor.selection.active;
    // Only support Python for now
    if (document.languageId !== 'python') {
        vscode.window.showWarningMessage('Only Python is supported by this command');
        return;
    }
    try {
        const reference = await generateFullReference(document, position);
        if (reference) {
            await vscode.env.clipboard.writeText(reference);
            vscode.window.showInformationMessage(`Copied: ${reference}`);
        }
        else {
            // Enhanced fallback for diff views and special contexts
            const wordRange = document.getWordRangeAtPosition(position);
            if (wordRange) {
                const word = document.getText(wordRange);
                const fallbackRef = buildSimpleFallbackReference(document, word);
                if (fallbackRef) {
                    await vscode.env.clipboard.writeText(fallbackRef);
                    vscode.window.showInformationMessage(`Copied (fallback): ${fallbackRef}`);
                    return;
                }
            }
            vscode.window.showWarningMessage('Could not determine reference path for this symbol');
        }
    }
    catch (error) {
        console.error('Error generating reference:', error);
        vscode.window.showErrorMessage('Failed to copy reference. Please try again.');
    }
}
/**
 * Generates the full reference path for a symbol at the given position
 * @param document - The text document
 * @param position - The cursor position
 * @returns The full reference path or null if unable to determine
 */
async function generateFullReference(document, position) {
    // Validate that we have a word at the cursor position
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
        return null;
    }
    const word = document.getText(wordRange);
    // Get document symbols to build the hierarchy
    const symbols = await getDocumentSymbols(document);
    if (!symbols || symbols.length === 0) {
        // Fallback: just return the word with file context
        return buildFallbackReference(document, word);
    }
    // Find the symbol hierarchy path
    const symbolPath = findSymbolHierarchy(symbols, position);
    if (symbolPath.length === 0) {
        // Try to find any symbol path that matches the word at cursor (preserves parents like classes)
        const matchingPath = findSymbolPathByName(symbols, word);
        if (matchingPath) {
            return buildCompleteReference(document, matchingPath);
        }
        // Final fallback: just the word with namespace
        return buildFallbackReference(document, word);
    }
    // Build and return the complete reference
    return buildCompleteReference(document, symbolPath);
}
/**
 * Retrieves document symbols using VS Code's symbol provider
 * @param document - The text document
 * @returns Array of document symbols or null if unavailable
 */
async function getDocumentSymbols(document) {
    try {
        const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri);
        return symbols || null;
    }
    catch (error) {
        console.error('Failed to get document symbols:', error);
        return null;
    }
}
/**
 * Finds the hierarchy of symbols containing the given position
 * @param symbols - Array of document symbols
 * @param position - The target position
 * @returns Array of symbols from outermost to innermost
 */
function findSymbolHierarchy(symbols, position) {
    const hierarchy = [];
    /**
     * Recursively searches through symbol tree
     * @param symbolList - Current list of symbols to search
     * @returns true if position was found within any symbol
     */
    function searchSymbols(symbolList) {
        for (const symbol of symbolList) {
            if (symbol.range.contains(position)) {
                hierarchy.push(symbol);
                // Search children for more specific symbols
                if (symbol.children && symbol.children.length > 0) {
                    searchSymbols(symbol.children);
                }
                return true;
            }
        }
        return false;
    }
    searchSymbols(symbols);
    return hierarchy;
}
/**
 * Finds a symbol by name in the symbol tree
 * @param symbols - Array of document symbols
 * @param name - The symbol name to find
 * @returns The matching symbol or null
 */
function findSymbolByName(symbols, name) {
    for (const symbol of symbols) {
        if (symbol.name === name) {
            return symbol;
        }
        // Search children recursively
        if (symbol.children && symbol.children.length > 0) {
            const childMatch = findSymbolByName(symbol.children, name);
            if (childMatch) {
                return childMatch;
            }
        }
    }
    return null;
}
/**
 * Finds the path (outermost → innermost) to the first symbol matching `name`.
 * @param symbols - Array of document symbols
 * @param name - The symbol name to find
 * @returns Array of symbols from outermost to the matching symbol, or null
 */
function findSymbolPathByName(symbols, name) {
    for (const symbol of symbols) {
        if (symbol.name === name) {
            return [symbol];
        }
        if (symbol.children && symbol.children.length > 0) {
            const childPath = findSymbolPathByName(symbol.children, name);
            if (childPath) {
                return [symbol, ...childPath];
            }
        }
    }
    return null;
}
/**
 * Builds the complete reference string from document and symbol hierarchy
 * @param document - The text document
 * @param symbolPath - Array of symbols from outermost to innermost
 * @returns The complete reference string
 */
function buildCompleteReference(document, symbolPath) {
    const namespacePrefix = extractNamespacePrefix(document);
    const symbolNames = symbolPath.map(s => s.name);
    // Build parts once (namespace + symbols)
    const parts = [];
    if (namespacePrefix) {
        parts.push(namespacePrefix);
    }
    parts.push(...symbolNames);
    const separator = '::';
    return parts.join(separator);
}
/**
 * Extracts namespace, module, or package information from the document
 * @param document - The text document
 * @returns The namespace prefix or null if none found
 */
function extractNamespacePrefix(document) {
    const fileName = getFileNameWithoutExtension(document.uri);
    return buildPythonModulePath(document, fileName);
}
/**
 * Builds Python module path from file location
 * @param document - The text document
 * @param fileName - The base file name
 * @returns The Python module path
 */
function buildPythonModulePath(document, fileName) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (workspaceFolder) {
        let relativePath = vscode.workspace.asRelativePath(document.uri);
        // If this is an __init__.py, use the package directory as the module path
        relativePath = relativePath.replace(/\/?__init\.py$/, '');
        if (relativePath === '') {
            // Fallback to filename without extension if we removed everything
            return fileName;
        }
        return relativePath;
    }
    return fileName;
}
/**
 * Gets the filename without extension
 * @param uri - The file URI
 * @returns The filename without extension
 */
function getFileNameWithoutExtension(uri) {
    const fileName = uri.path.split('/').pop() || '';
    return fileName.replace(/\.[^/.]+$/, '');
}
/**
 * Builds a simple fallback reference for diff views and special contexts
 * @param document - The text document
 * @param word - The word at cursor position
 * @returns Simple reference or null
 */
function buildSimpleFallbackReference(document, word) {
    if (!word || word.trim().length === 0) {
        return null;
    }
    const pythonPath = buildPythonModulePath(document, getFileNameWithoutExtension(document.uri));
    return `${pythonPath}::${word}`;
}
/**
 * Builds a fallback reference when symbols aren't available
 * @param document - The text document
 * @param word - The word at cursor position
 * @returns Fallback reference string
 */
function buildFallbackReference(document, word) {
    const fileName = getFileNameWithoutExtension(document.uri);
    const pythonPath = buildPythonModulePath(document, fileName);
    return `${pythonPath}::${word}`;
}
/**
 * Deactivates the extension
 */
function deactivate() {
    // Extension cleanup if needed
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map