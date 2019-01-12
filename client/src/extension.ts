import { ExtensionContext, window } from 'vscode'
import {
    LanguageClient, LanguageClientOptions, ServerOptions, TransportKind
} from 'vscode-languageclient'

export function activate(context: ExtensionContext) {
    const module = context.asAbsolutePath('./server/out/server.js')
    const serverOptions: ServerOptions = {
        run: {
            module,
            transport: TransportKind.ipc
        },
        debug: {
            module,
            transport: TransportKind.ipc,
            options: {
                execArgv: ['--nolazy', '--inspect=25566']
            }
        }
    }
    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'mcfunction' },
            { scheme: 'untitled', language: 'mcfunction' }
        ]
    }

    const client = new LanguageClient('SPD Language Server', serverOptions, clientOptions)

    const disposable = client.start()

    context.subscriptions.push(disposable)
}
