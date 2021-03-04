"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = void 0;
const url_1 = __importDefault(require("url"));
const net_1 = __importDefault(require("net"));
const checkConnection = (config = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const { timeout = 5000, retries = 5, domain = "https://google.com" } = config;
    const urlInfo = url_1.default.parse(domain);
    if (urlInfo.port === null) {
        if (urlInfo.protocol === "ftp:") {
            urlInfo.port = "21";
        }
        else if (urlInfo.protocol === "http:") {
            urlInfo.port = "80";
        }
        else if (urlInfo.protocol === "https:") {
            urlInfo.port = "443";
        }
    }
    const defaultPort = Number.parseInt(urlInfo.port || "80");
    const hostname = urlInfo.hostname || urlInfo.pathname;
    for (let i = 0; i < retries; i++) {
        const connectPromise = new Promise((resolve, reject) => {
            const client = new net_1.default.Socket();
            client.connect({ port: defaultPort, host: hostname }, () => {
                client.destroy();
                resolve(1);
            });
            client.on("data", () => { });
            client.on("error", (err) => {
                client.destroy();
                reject(err);
            });
            client.on("close", () => { });
        });
        try {
            //@ts-ignore
            yield connectPromise.timeout(timeout);
        }
        catch (ex) {
            if (i === retries - 1) {
                throw ex;
            }
        }
    }
});
exports.checkConnection = checkConnection;
//# sourceMappingURL=connection.js.map