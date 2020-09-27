import * as vscode from 'vscode';


export enum Section {
  Feature = 'feature',
  OrganiseImportsOnInsert = 'organiseImportsOnInsert',
  OrganiseExtensionOnInsert = 'organiseExtensionOnInsert',
  SupportedExtensions = 'supportedExtensions',
  SplitExtensions = 'splitExtensions',
  AlignExtensions = 'alignExtensions',
  SortExtensions = 'sortExtensions',
  OrganizeExtensionsOnSave = 'organiseExtensionOnSave',
  AlignImports = 'alignImports',
  AlwaysPadImports = 'alwaysPadImports',
  SortImports = 'sortImports',
  OrganizeImportsOnSave = 'organiseImportsOnSave',
}

function get<T>(section: Section): T { 
  return vscode.workspace.getConfiguration('haskutil').get(section);
}


export default class Configuration {  
  public static enabled(feature: string): boolean { 
    return get(Section.Feature)[feature];
  }

  public static get shouldOrganiseImportsOnInsert(): boolean {
    return get(Section.OrganiseImportsOnInsert);
  }

  public static get shouldOrganiseExtensionOnInsert(): boolean {
    return get(Section.OrganiseExtensionOnInsert);
  }

  public static get supportedExtensions(): string[] {
    return get(Section.SupportedExtensions);
  }

  public static get shouldSplitExtensions(): boolean {
    return get(Section.SplitExtensions);
  }

  public static get shouldAlignExtensions(): boolean {
    return get(Section.AlignExtensions);
  }

  public static get shouldSortExtensions(): boolean {
    return get(Section.SortExtensions);
  }

  public static get shouldOrganizeExtensionsOnSave(): boolean {
    return get(Section.OrganizeExtensionsOnSave);
  }

  public static get shouldAlignImports(): boolean {
    return get(Section.AlignImports);
  }

  public static get shouldPadImports(): boolean {
    return get(Section.AlwaysPadImports);
  }

  public static get shouldSortImports(): boolean {
    return get(Section.SortImports);
  }

  public static get shouldOrganizeImportsOnSave(): boolean {
    return get(Section.OrganizeImportsOnSave);
  } 
}
