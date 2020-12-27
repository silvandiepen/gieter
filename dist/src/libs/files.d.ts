import { MarkdownFile, buildHtmlArgs } from "../types";
export declare const getFileTree: (dir: string, filter?: string) => Promise<MarkdownFile[]>;
export declare const getFileData: (file: MarkdownFile) => Promise<MarkdownFile>;
export declare const getFiles: (dir: string) => Promise<MarkdownFile[]>;
export declare const fileTitle: (file: MarkdownFile) => string;
export declare const buildHtml: (file: MarkdownFile, args: buildHtmlArgs) => Promise<string>;
export declare const makePath: (path: string) => string;
export declare const createFolder: (folder: string) => Promise<void>;
export declare const download: (url: string, destination: string) => Promise<void>;
