import * as vscode from 'vscode';

export default class Configuration {
  public static get shouldOrganiseImportsOnInsert(): boolean {
    return configuration().get("organiseImportsOnInsert");
  }

  public static get shouldOrganiseExtensionOnInsert(): boolean {
    return configuration().get("organiseExtensionOnInsert");
  }

  public static get supportedExtensions(): string[] {
    return configuration().get("supportedExtensions");
  }

  public static get shouldSplitExtensions(): boolean {
    return configuration().get("splitExtensions");
  }

  public static get shouldAlignExtensions(): boolean {
    return configuration().get("alignExtensions");
  }

  public static get shouldSortExtensions(): boolean {
    return configuration().get("sortExtensions");
  }

  public static get shouldOrganizeExtensionsOnSave(): boolean {
    return configuration().get("organiseExtensionOnSave");
  }

  public static get shouldAlignImports(): boolean {
    return configuration().get("alignImports");
  }

  public static get shouldPadImports(): boolean {
    return configuration().get("alwaysPadImports");
  }

  public static get shouldSortImports(): boolean {
    return configuration().get("sortImports");
  }

  public static get shouldOrganizeImportsOnSave(): boolean {
    return configuration().get("organiseImportsOnSave");
  }
}

function configuration() {
  return vscode.workspace.getConfiguration("haskutil");  
}
