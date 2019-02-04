import {
    createConnection,
    ProposedFeatures,
    TextDocumentSyncKind
} from 'vscode-languageserver'
import { WorkspaceCache, CommandTreeNode } from './utils/types'
import * as fs from 'fs'

const connection = createConnection(ProposedFeatures.all)

connection.onInitialize((params) => {
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
                triggerCharacters: [' ', ',', '\r\n']
            },
            textDocumentSync: {
                change: TextDocumentSyncKind.Incremental,
                openClose: true
            }
        }
    }
})

const workspaceCache: WorkspaceCache = {}

connection.onDidOpenTextDocument(params => {
    params.textDocument.text
})
