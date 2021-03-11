#!/usr/bin/env node
import { Payload } from "./types";
export declare const files: (payload: Payload) => Promise<Payload>;
export declare const settings: (payload: Payload) => Promise<Payload>;
export declare const contentPages: (payload: Payload) => Promise<Payload>;
export declare const media: (payload: Payload) => Promise<Payload>;
