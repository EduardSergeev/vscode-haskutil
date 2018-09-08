'use strict';

import { CodeActionProvider, Disposable, TextDocument, Range, CodeActionContext, CancellationToken, CodeAction, WorkspaceEdit, CodeActionKind } from 'vscode';
import * as vscode from 'vscode';


export default class ExtensionProvider implements CodeActionProvider
{
	private static commandId: string = 'haskell.addExtension';
	private command: Disposable;

	public activate(subscriptions: Disposable[])
	{
		this.command = vscode.commands.registerCommand(ExtensionProvider.commandId, this.runCodeAction, this);
		subscriptions.push(this);
	}

	public dispose(): void
	{
		this.command.dispose();
  }
  
  private static get Extensions(): string[]
  {
    var extSettings = vscode.workspace.getConfiguration("haskutil");
    return extSettings.get("supportedExtensions");
  }
  
  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): Promise<any>
  {
		let codeActions = [];
		for (let diagnostic of context.diagnostics)
		{
			for (let extension of ExtensionProvider.Extensions)
			{
				if (!diagnostic.message.includes(extension))
				{
					continue;
        }
        
        let line = `{-# LANGUAGE ${extension} #-}`;
        let title = `Add ${line}`;
				let codeAction = new CodeAction(title, CodeActionKind.QuickFix);
				codeAction.command = {
					title: title,
					command: ExtensionProvider.commandId,
					arguments: [
            document,
            extension,
						line					
					]
        };
        codeAction.diagnostics = [diagnostic];
				codeActions.push(codeAction);
			}
		}
		return codeActions;    
  }

  private runCodeAction(document: TextDocument, newExtension: string, extensionLine: string): Thenable<boolean>
  {
		function afterMatch(offset)
		{
			let position = document.positionAt(offset);
			return document.offsetAt(position.with(position.line + 1, 0));
    }
    
		let text = document.getText();
    var position = 0;

    const pattern = /^{-#\s+LANGUAGE\s+([^#]+)#-}/gm;
		for (let match; match = pattern.exec(text);)
		{
      let oldExtension = match[1];
      if (oldExtension > newExtension)
      {
        position = match.index;
        break; 
      }
      position = afterMatch(match.index + match[0].length);
		}    

		let edit = new WorkspaceEdit();
    edit.insert(document.uri, document.positionAt(position), extensionLine + "\n");
		return vscode.workspace.applyEdit(edit);    
  }
}
