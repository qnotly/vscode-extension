const vscode = require('vscode');


module.exports = class QNotlyStorage {

    /**
     * 
     * @param {vscode.ExtensionContext} context 
     */
    constructor(context) {
        this._storage = context.globalState;
        this._current_workspace = {};
        this.init()
    }

    async init(){
        let meta_data = this._storage.get('qnotly', {
            'workspaces': []
        });

        if (vscode.workspace.workspaceFolders === undefined){
            return;
        }

        let current_workspace = vscode.workspace.workspaceFolders[0];

        let path_found = false;

        meta_data.workspaces.map(workspace => {
            if (
                path_found == false &&
                workspace.name == current_workspace.name &&
                workspace.uri.path == current_workspace.uri.path
            ){
                this._current_workspace = current_workspace;
                path_found = true;
            }
            workspace.path == current_workspace
        })
        if (!path_found) {
            this._current_workspace = current_workspace;
            this._current_workspace._id = meta_data.workspaces.length;
            meta_data.workspaces.push(current_workspace);
            await this._storage.update('qnotly', meta_data);
            await this._storage.update(
                `qnotly-workspace-${this._current_workspace._id}`, {
                    qnotes: []
                }
            )
        }
    }

    async setQNote(qnote, code, file, lines) {
        let workspace = this._storage.get(`qnotly-workspace-${this._current_workspace._id}`, {
            qnotes: []
        });
        await this._storage.update(
            `qnotly-workspace-${this._current_workspace._id}`, {
                qnotes: [...workspace.qnotes, {
                    qnote, code, file, lines, _id: workspace.qnotes.length
                }]
            }
        )
    }

    getFileQNotes(file_path) {
        let qnotes = [];
        let workspace = this._storage.get(`qnotly-workspace-${this._current_workspace._id}`, {
            qnotes: []
        });
        workspace.qnotes.map(qnote => {
            if (qnote.file == file_path){
                qnotes.push(qnote);
            }
        })
        return qnotes;
    }

    async deleteQNote(qnoteId) {
        let qnotes = [];
        let workspace = this._storage.get(`qnotly-workspace-${this._current_workspace._id}`, {
            qnotes: []
        });
        workspace.qnotes.map(qnote => {
            if (qnote._id != qnoteId){
                qnotes.push(qnote);
            }
        })
        await this._storage.update(
            `qnotly-workspace-${this._current_workspace._id}`, {
                qnotes
            }
        )
        return qnotes;
    }
}
