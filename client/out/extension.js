"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
function activate(context) {
    const module = context.asAbsolutePath('./server/out/server.js');
    const serverOptions = {
        run: {
            module,
            transport: vscode_languageclient_1.TransportKind.ipc
        },
        debug: {
            module,
            transport: vscode_languageclient_1.TransportKind.ipc,
            options: {
                execArgv: ['--nolazy', '--inspect=25566']
            }
        }
    };
    const clientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'mcfunction' },
            { scheme: 'untitled', language: 'mcfunction' }
        ]
    };
    const client = new vscode_languageclient_1.LanguageClient('SPD Language Server', serverOptions, clientOptions);
    const disposable = client.start();
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map