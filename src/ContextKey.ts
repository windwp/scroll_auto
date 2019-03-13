import * as vscode from "vscode";
export default class ContextKey {
    private _name: string;
    private _lastValue: boolean = false;

    constructor(name: string) {
        this._name = name;
    }

    public set(value: boolean): void {
        if (this._lastValue === value) {
            return;
        }
        this._lastValue = value;
        vscode.commands.executeCommand('setContext', this._name, this._lastValue);
    }
}