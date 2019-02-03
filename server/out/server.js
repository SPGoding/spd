"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const fs = require("fs");
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
exports.commandTree = [];
connection.onInitialize((params) => {
    exports.commandTree.push(...JSON.parse(fs.readFileSync('../../ref/commands.json', { encoding: 'utf8' })));
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
const workspaceCache = {};
connection.onDidOpenTextDocument(params => {
    params.textDocument.text;
});
//# sourceMappingURL=server.js.map