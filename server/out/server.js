"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
connection.onInitialize(() => {
    return {
        capabilities: {
            completionProvider: {},
            definitionProvider: true,
            documentHighlightProvider: true,
            hoverProvider: true,
            referencesProvider: true,
            renameProvider: true,
            documentLinkProvider: {
                resolveProvider: true
            },
            signatureHelpProvider: {
                triggerCharacters: [' ']
            },
            textDocumentSync: {
                change: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
                openClose: true
            }
        }
    };
});
//# sourceMappingURL=server.js.map