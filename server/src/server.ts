import {
    createConnection,
    ProposedFeatures,
    TextDocumentSyncKind
} from 'vscode-languageserver'

const connection = createConnection(ProposedFeatures.all)

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
                change: TextDocumentSyncKind.Incremental,
                openClose: true
            }
        }
    }
})
