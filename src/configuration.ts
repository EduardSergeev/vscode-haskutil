import * as vscode from 'vscode';
import { WorkspaceConfiguration } from 'vscode';


const rootSection = "haskutil";
const organiseImportsOnInsertSection = "organiseImportsOnInsert";
const organiseExtensionOnInsertSection = "organiseExtensionOnInsert";
const supportedExtensionsSection = "supportedExtensions";
const splitExtensionsSection = "splitExtensions";
const alignExtensionsSection = "alignExtensions";
const sortExtensionsSection = "sortExtensions";
const organizeExtensionsOnSaveSection = "organiseExtensionOnSave";
const alignImportsSection = "alignImports";
const alwaysPadImportsSection = "alwaysPadImports";
const sortImportsSection = "sortImports";
const organizeImportsOnSaveSection = "organiseImportsOnSave";
const checkDiagnosticsExtensionSection = "checkDiagnosticsExtension";

function root(): WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(rootSection);
}

function get<T>(section: string): T { 
  return root().get(section);
}


export default class Configuration {
  public static rootSection = rootSection;
  public static organiseImportsOnInsertSection = organiseImportsOnInsertSection;
  public static organiseExtensionOnInsertSection = organiseExtensionOnInsertSection;
  public static supportedExtensionsSection = supportedExtensionsSection;
  public static splitExtensionsSection = splitExtensionsSection;
  public static alignExtensionsSection = alignExtensionsSection;
  public static sortExtensionsSection = sortExtensionsSection;
  public static organizeExtensionsOnSaveSection = organizeExtensionsOnSaveSection;
  public static alignImportsSection = alignImportsSection;
  public static alwaysPadImportsSection = alwaysPadImportsSection;
  public static sortImportsSection = sortImportsSection;
  public static organizeImportsOnSaveSection = organizeImportsOnSaveSection;
  public static checkDiagnosticsExtensionSection = checkDiagnosticsExtensionSection;

  public static get root(): WorkspaceConfiguration {
    return root();
  }

  public static get shouldOrganiseImportsOnInsert(): boolean {
    return get(organiseImportsOnInsertSection);
  }

  public static get shouldOrganiseExtensionOnInsert(): boolean {
    return get(organiseExtensionOnInsertSection);
  }

  public static get supportedExtensions(): string[] {
    return get(supportedExtensionsSection);
  }

  public static get shouldSplitExtensions(): boolean {
    return get(splitExtensionsSection);
  }

  public static get shouldAlignExtensions(): boolean {
    return get(alignExtensionsSection);
  }

  public static get shouldSortExtensions(): boolean {
    return get(sortExtensionsSection);
  }

  public static get shouldOrganizeExtensionsOnSave(): boolean {
    return get(organizeExtensionsOnSaveSection);
  }

  public static get shouldAlignImports(): boolean {
    return get(alignImportsSection);
  }

  public static get shouldPadImports(): boolean {
    return get(alwaysPadImportsSection);
  }

  public static get shouldSortImports(): boolean {
    return get(sortImportsSection);
  }

  public static get shouldOrganizeImportsOnSave(): boolean {
    return get(organizeImportsOnSaveSection);
  } 

  public static get checkDiagnosticsExtension(): boolean {
    return get(checkDiagnosticsExtensionSection);
  } 
}
