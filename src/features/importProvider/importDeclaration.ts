import { Range, TextDocument } from "vscode";

export default class ImportDeclaration
{
	private _importElements?: string[] = [];
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
		})
	{
		if (optional)
		{
			this.qualified = optional.qualified || "";
			this.alias = optional.alias;
			this.importList = optional.importList;
			this.importElements = optional.importElements;
			this.hidingList = optional.hidingList;
			this.offset = optional.offset;
			this.length = optional.length;
		}
	}

	public get importElements()
	{
		return this._importElements ? this._importElements.join(',') : null;
	}

	public set importElements(elementsString: string)
	{
		this._importElements = elementsString ? elementsString.split(',') : [];
	}

	public get importNames()
	{
		return this._importElements.map(e => e.trim());
	}

	public addImportElement(newElem: string)
	{
		let before = this.importElements;
		if (this.importNames.length === 0 || this.importNames[0] === "")
		{
			this.importList = " (I)";
			before = "I";
			this._importElements = [];
		}

		let index = this.importNames.findIndex(oldElem =>
		{
			return newElem < oldElem;
		});
		index = index === -1 ? this.importNames.length : index;
		if (index === 0)
		{
			if (this.importElements.length > 0)
			{
				this._importElements.splice(index, 1, `${newElem}, ${this._importElements[0]}`);
			}
			else
			{
				this._importElements.push(newElem);
			}
		}
		else
		{
			this._importElements.splice(index, 0, ` ${newElem}`);
		}

		this.importList = this.importList.replace(before, this.importElements);
	}

	public get text()
	{
		return `import${this.qualified || ""}${this.module}${this.alias || ""}${this.importList || ""}${this.hidingList || ""}`;
  }

  public getRange(document: TextDocument): Range
  {
    return new Range(
      document.positionAt(this.offset),
      document.positionAt(this.offset + this.length));       
  }
  
  public static getImports(text: string): ImportDeclaration[]
	{
		const importPattern = /^import((?:\s+qualified\s+)|\s+)(\S+)(\s+as\s+(\S+))?(\s*?\(((?:(?:\(.*?\))|.|\n)*?)\))?(\s+hiding\s+\(((?:(?:\(.*?\))|.|\n)*?)\))?/gm;
		const imports = [];
		for (let match; match = importPattern.exec(text);)
		{
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
