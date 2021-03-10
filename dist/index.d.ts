#!/usr/bin/env node
import { Payload } from "./types";
export declare const files: (payload: Payload) => Promise<Payload>;
export declare const settings: (payload: Payload) => Promise<Payload>;
export declare const menu: (payload: Payload) => Promise<Payload>;
export declare const archives: (payload: Payload) => Promise<Payload>;
export declare const tags: (payload: Payload) => Promise<Payload>;
export declare const contentPages: (payload: Payload) => Promise<Payload>;
export declare const tagPages: (payload: Payload) => Promise<Payload>;
export declare const media: (payload: Payload) => Promise<Payload>;
