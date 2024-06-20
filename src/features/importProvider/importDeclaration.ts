import { Range, TextDocument } from "vscode";

export default class ImportDeclaration {
  private _before: string = '';
  private _importElements: string[] = [];
  private _importSeparators: string[] = [];
  private _after: string = '';
  qualified: string = " ";
  alias?: string;
  importList?: string;
  hidingList?: string;
  offset?: number;
  length?: number;

  constructor(
    public module: string,
    optional?: {
      qualified?: string,
      alias?: string,
      importList?: string,
      importElements?: string,
      hidingList?: string,
      offset?: number,
      length?: number
    }) {
    if (optional) {
      this.qualified = optional.qualified || "";
      this.alias = optional.alias;
      this.importList = optional.importList;
      this.importElements = optional.importElements;
      this.hidingList = optional.hidingList;
      this.offset = optional.offset;
      this.length = optional.length;
    }
  }

  private get separator() {
    return ', '
  };

  public get importElements() {
    const separators = this._importSeparators.concat([this._after]);
    return [this._before].concat(this._importElements.flatMap((elem, i) => [elem, separators[i]])).join('');
  }

  public set importElements(elementsString: string) {
    const before = /^\s*/g;
    const elements = /[^\s,]+/g;
    const separators = /\S([\s,]+)\S/g;
    const after = /\s*$/g;
    elementsString ??= '';
    this._before = elementsString.match(before)[0];
    this._importElements = elementsString ? [...elementsString.matchAll(elements)].map(m => m[0]) : [];
    this._importSeparators = elementsString ? [...elementsString.matchAll(separators)].map(m => m[1]) : [];
    this._after = elementsString.match(after)[0];
  }

  public addImportElement(newElem: string) {
    let before = this.importElements;
    if (this._importElements.length === 0) {
      this.importList = " (I)";
      before = "I";
    }

    let index = this._importElements.findIndex(oldElem => this.compareImportElements(newElem, oldElem) < 0);
    index = index === -1 ? this._importElements.length : index;
    if (this._importElements.length > 0) {
      if (index === this._importElements.length) {
        this._importSeparators.push(this.separator);
      } else {
        this._importSeparators.splice(index, 0, this.separator);
      }
    }
    this._importElements.splice(index, 0, newElem);

    this.importList = this.importList.replace(before, this.importElements);
  }

  public removeElement(elem: string) {
    const before = this.importElements;

    const index = this._importElements.findIndex(oldElem => oldElem === elem || oldElem == `${elem}(..)`);
    if (index !== -1) {
      if (this._importElements.length > 1) {
        if (index === this._importElements.length - 1) {
          this._importSeparators.pop();
        } else {
          this._importSeparators.splice(index, 1);
        }
      }
      this._importElements.splice(index, 1);

      this.importList = this.importList.replace(before, this.importElements);
    }
  }

  private compareImportElements(left: string, right: string) {
    const toSortable = (elem: string) => elem.replace('(', '~');
    const ls = toSortable(left);
    const rs = toSortable(right);
    return ls < rs ? -1 : ls > rs ? 1 : 0;
  }

  public get text() {
    return `import${this.qualified || ""}${this.module}${this.alias || ""}${this.importList || ""}${this.hidingList || ""}`;
  }

  public getRange(document: TextDocument): Range {
    return new Range(
      document.positionAt(this.offset),
      document.positionAt(this.offset + this.length));
  }

  public static getImports(text: string): ImportDeclaration[] {
    const importPattern = /^import((?:\s+qualified\s+)|\s+)(\S+)(\s+as\s+(\S+))?(\s*?\(((?:(?:\(.*?\))|.|\r?\n)*?)\))?(\s+hiding\s+\(((?:(?:\(.*?\))|.|\r?\n)*?)\))?/gm;
    const imports = [];
    for (let match; match = importPattern.exec(text);) {
      imports.push(new ImportDeclaration(
        match[2],
        {
          qualified: match[1],
          alias: match[3],
          importList: match[5],
          importElements: match[6],
          hidingList: match[7],
          offset: match.index,
          length: match[0].length
        }));
    }
    return imports;
  }
}
