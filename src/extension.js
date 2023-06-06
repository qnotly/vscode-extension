const vscode = require('vscode');
const QnotlyWebViewProvider = require('./web-view-provider');
const QnotlyFileProvider = require('./file-provider');
const QNotlyStorage = require('./storage');


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	// Initialize Extension
	let storage = new QNotlyStorage(context);
	let file_provider = new QnotlyFileProvider(context.extensionUri.path);
	let qnotly_web_provider = new QnotlyWebViewProvider(file_provider, storage);

	// Save QNote
	context.subscriptions.push(vscode.commands.registerCommand('qnotly.saveQNote', async function (...args) {
		qnotly_web_provider.showSaveQNoteForm(
			(args.length > 0) ? args[0].path : ''
		);
		vscode.commands.executeCommand('workbench.view.extension.qnotly-explorer');
	}));

	// Register WebView
	vscode.window.registerWebviewViewProvider("qnotly-explorer-id", qnotly_web_provider);

	// Show Current Related File QNotes
	if (vscode.window.activeTextEditor !== undefined) {
		qnotly_web_provider.showFileRelatedQNotes(vscode.window.activeTextEditor.document.fileName);
	}

	// Change Related QNotes On Text Editor Change
	vscode.window.onDidChangeActiveTextEditor(e => {
		if (e !== undefined){
			qnotly_web_provider.showFileRelatedQNotes(e.document.fileName);
		}
	});
}


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
