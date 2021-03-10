import { File, buildHtmlArgs, Project, Meta } from "../types";
export declare const getFileTree: (dir: string, filter?: string) => Promise<File[]>;
export declare const getFileData: (file: File) => Promise<string>;
export declare const getFiles: (dir: string, ext: string) => Promise<File[]>;
export declare const buildHtml: (file: File, args: buildHtmlArgs, template?: string) => Promise<string>;
export declare const makeLink: (path: string) => string;
export declare const createFolder: (folder: string) => Promise<void>;
export declare const download: (url: string, destination: string) => Promise<void>;
export declare const getProjectConfig: (meta: Meta) => Project;
