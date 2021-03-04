import { File } from "../types";
export declare const asyncForEach: (array: any, callback: any) => Promise<void>;
export declare const getIndexes: (source: string, find: string) => number[];
export declare const nthIndex: (source: string, find: string, nth: number) => number;
export declare const createDir: (dir: string) => Promise<void>;
export declare const hello: (args?: any) => Promise<any>;
export declare const removeTitle: (input: string) => string;
export declare const getTitle: (input: string) => string;
export declare const fileTitle: (file: File) => string;
