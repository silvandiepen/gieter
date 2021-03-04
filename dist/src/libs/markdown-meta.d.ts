import { Meta } from "../types";
export declare const fixType: (value: string) => any;
export declare const extractMeta: (input: string) => Promise<Meta>;
export declare const removeMeta: (input: string) => Promise<string>;
