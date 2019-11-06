import { Range, TextDocument } from "vscode";

export default class ExtensionDeclaration
{
  private _extensions?: string[] = [];
  private _header: string = "";

  constructor(header: string, extensions: string, public offset?: number, public length?: number)
  {
    this.extensions = extensions;
    this._header = header;
  }

  public get extensions()
  {
    return this._extensions.join(',');
  }

  public set extensions(extensionsString: string)
  {
    this._extensions = extensionsString ? extensionsString.split(',') : [];
  }

  public get header()
  {
    return this._header;
  }

  public get extensionNames()
  {
    return this._extensions.map(e => e.trim());
  }

  public get text()
  {
    return `{-# ${this.header} ${this.extensions}#-}`;
  }

  public getRange(document: TextDocument): Range
  {
    return new Range(
      document.positionAt(this.offset),
      document.positionAt(this.offset + this.length));
  }

  public static get extensionRegex(): RegExp
  {
    return /^{-#\s+(LANGUAGE)\s+([^#]+)#-}/gmi;
  }

  public static getExtensions(text: string): ExtensionDeclaration[]
  {
    const imports = [];
    for (let match, regex = ExtensionDeclaration.extensionRegex; match = regex.exec(text);)
    {
      imports.push(new ExtensionDeclaration(match[1], match[2], match.index, match[0].length));
    }
    return imports;
  }
}
