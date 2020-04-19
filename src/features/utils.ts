import { TextDocument } from "vscode";

export function documentInScope(document: TextDocument) {
    const { languageId } = document;
    const { path } = document.uri;
    return (
        languageId === 'haskell' ||
        languageId === 'literate haskell' ||
        path.endsWith('.hs') ||
        path.endsWith('.lhs')
    );
}
