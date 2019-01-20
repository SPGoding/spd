import {
    createConnection,
    ProposedFeatures,
    TextDocumentSyncKind
} from 'vscode-languageserver'
import { WorkspaceCache, CommandTreeNode } from './utils/types'
import * as fs from 'fs'

const connection = createConnection(ProposedFeatures.all)
export const commandTree: CommandTreeNode[] = []

connection.onInitialize((params) => {
    commandTree.push(...JSON.parse(
        fs.readFileSync('../../ref/commands.json', { encoding: 'utf8' })
    ) as CommandTreeNode[])

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
