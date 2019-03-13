// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ContextKey from './ContextKey';
class ScrollController {
	private scrollInterval: NodeJS.Timeout | undefined = undefined;
	private isAutoScroll: ContextKey;
	private _disposable: vscode.Disposable;
	private _isRunning: boolean = false;
	private _line: 1 | -1 = 1;
	dispose() {
		this.stopScroll();
		this._disposable.dispose();
	}
	constructor() {
		this.isAutoScroll = new ContextKey('scroll.isStart');
		let subscriptions: vscode.Disposable[] = [];
		// vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
		// vscode.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
		this._disposable = vscode.Disposable.from(...subscriptions);
	}
	private _onEvent(data: any) {
		// console.log('>: ScrollController -> private_onEvent -> data', data);

	}
	public startScroll(line: 1 | -1) {
		this._line = line;
		// console.log('>: ScrollController -> publicstartScroll -> startScroll');
		if (this._isRunning) { return; }
		this._isRunning = true;
		this.isAutoScroll.set(this._isRunning);
		this.scrollInterval = setInterval(() => {
			var result = this.scroll(this._line);
			if (!result) {
				this.stopScroll();
			}
		}, 150);
	}
	private scroll(line: number) {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return false;
		}
		let currentPosition = editor.selection.active;
		let moveToLine = currentPosition.line + line;
		let documentLineCount = editor.document.lineCount;
		if (moveToLine > documentLineCount - 1) {
			moveToLine = documentLineCount - 1;
			return false;
		}
		if (moveToLine < 0) {
			moveToLine = 0;
			return false;
		}
		// console.log('>: scroll -> line', moveToLine);
		let moveToCharactor = editor.document.lineAt(moveToLine).firstNonWhitespaceCharacterIndex;
		let newPosition = new vscode.Position(moveToLine, moveToCharactor);
		editor.selection = new vscode.Selection(newPosition, newPosition);
		editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
		return true;
	}

	public stopScroll() {
		// console.log("Stop");
		if (this._isRunning) {
			this._isRunning = false;
			if (this.scrollInterval) {
				this.isAutoScroll.set(false);
				clearInterval(this.scrollInterval);
			}
		}
	}
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "scroll-auto" is now active!');
	let controller = new ScrollController();

	let upHandlder = vscode.commands.registerCommand('scroll_auto_up', () => {
		controller.startScroll(-1);
	});

	let stopHandler = vscode.commands.registerCommand('scroll_auto_stop', () => {
		controller.stopScroll();
	});

	let downHandler = vscode.commands.registerCommand('scroll_auto_down', () => {
		controller.startScroll(1);
	});
	context.subscriptions.push(upHandlder);
	context.subscriptions.push(downHandler);
	context.subscriptions.push(stopHandler);
	context.subscriptions.push(controller);
}

// this method is called when your extension is deactivated
export function deactivate() { }
