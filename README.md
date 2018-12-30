# spd

A VSCode extension for editing Minecraft datapacks.

## Using

TODO

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   ├── test // Tests for Language Client
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        ├── test // Tests for Language Server
        └── server.ts // Language Server entry point
```

## Building

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code in this folder.
- Execute `Run Build Task` command (defaults to `Ctrl + Shift + B`) to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the lauch config.
    - If you want to debug the server as well, use the launch configuration `Attach to Server`

## Special Thanks To

- [datapack-language-server](https://github.com/pca006132/datapack-language-server) by @pca006132
- [lsp-sample](https://github.com/Microsoft/vscode-extension-samples/tree/master/lsp-sample) by @Microsoft.
- [mcfunction-langserver](https://github.com/Levertion/mcfunction-langserver) by @Levertion