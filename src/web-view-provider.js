const vscode = require('vscode');
const hljs = require('highlight.js');
const mustache = require('mustache');
const QNotlyStorage = require('./storage'); // eslint-disable-line


module.exports = class QnotlyWebViewProvider {

    /**
     * 
     * @param {*} file_provider 
     * @param {QNotlyStorage} storage 
     */
    constructor(file_provider, storage) {
      this._file_provider = file_provider;
      this._webviewView = null;
      this._storage = storage;
    }

    __get_selected_text(){
      let editor = vscode.window.activeTextEditor;
      let selection = editor.selection;
      let range = new vscode.Range(
        selection.start.line, 0,
        selection.end.line + 1, 0
      );
      return editor.document.getText(range);
    }

    __get_selected_lines() {
      let editor = vscode.window.activeTextEditor;
      let selection = editor.selection;
      return {
        startLine: selection.start.line,
        startCharacter: 0,
        endLine: selection.end.line + 1,
        endCharacter: 0,
      };
    }

    __get_qnotes_template(file_path){
      const extension = file_path.split('.').pop();
      let language = (hljs.getLanguage(extension) === undefined) ? 'plaintext': extension;

      let qnotes = this._storage.getFileQNotes(file_path);
      const _qnotes = qnotes.map(qnote => {
        const _qnote_message = qnote.qnote.split('\n').map(line => `<span>${line}</span><br>`).join('');
        return {
          qnote: _qnote_message,
          language: language,
          code: hljs.highlight(qnote.code, {language: language}).value,
          qnoteId: qnote._id
        }
      });

      let template = mustache.render(this._file_provider.load_template('qnotes'), {
        qnotes: _qnotes
      });
      return template;
    }

    /**
     * 
     * @param {String} file_path 
     */
     showSaveQNoteForm(file_path) {
      if (this._webviewView){

        this._webviewView.webview.options = {
          enableForms: true,
          enableScripts: true
        };
        const extension = file_path.split('.').pop();
        let language = (hljs.getLanguage(extension) === undefined) ? 'plaintext': extension;

        let template = mustache.render(this._file_provider.load_template('qnote-form'), {
          "language": language,
          "code": hljs.highlight(this.__get_selected_text(), {language: language}).value
        });
        this._webviewView.webview.html = template;

      }
    }

    showFileRelatedQNotes(file_path) {
      if (this._webviewView){

        this._webviewView.webview.options = {
          enableForms: true,
          enableScripts: true
        };
        this._webviewView.webview.html = this.__get_qnotes_template(file_path);

      }
    }

    /**
     * 
     * @param {vscode.WebviewView} webviewView 
     * @param {*} context 
     * @param {*} token 
     */
    resolveWebviewView(webviewView, context, token) { // eslint-disable-line
      if (!this._webviewView) {
        this._webviewView = webviewView;
        webviewView.webview.options = {
          enableForms: true,
          enableScripts: true
        };

        this._webviewView.webview.onDidReceiveMessage(message => {
          let file_path = vscode.window.activeTextEditor.document.fileName;

          if (message.event == 'saveQNote') {
            this._storage.setQNote(
              message.data.qnote, this.__get_selected_text(), file_path, this.__get_selected_lines()
            );
          }
          else if (message.event == 'deleteQNote') {
            this._storage.deleteQNote(message.data.qnoteId);
          }
          this._webviewView.webview.html = this.__get_qnotes_template(file_path);
        })

        if (vscode.window.activeTextEditor !== undefined){
          webviewView.webview.html = this.__get_qnotes_template(
            vscode.window.activeTextEditor.document.fileName
          );
        }
      }
    }
}
