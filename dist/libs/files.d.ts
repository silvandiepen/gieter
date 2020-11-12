import { MarkdownFile } from "../types";
export declare const getFileTree: (dir: string, filter?: string) => Promise<MarkdownFile[]>;
export declare const getFileData: (file: MarkdownFile) => Promise<MarkdownFile>;
export declare const getFiles: (dir: string) => Promise<MarkdownFile[]>;
export declare const buildHtml: (file: MarkdownFile) => Promise<string>;
