import url from "url";
import net from "net";

interface connectionConfig {
  timeout?: number;
  retries?: number;
  domain?: string;
}

export const checkConnection = async (config: connectionConfig = {}) => {
  const { timeout = 5000, retries = 5, domain = "https://google.com" } = config;
  const urlInfo = url.parse(domain);
  if (urlInfo.port === null) {
    if (urlInfo.protocol === "ftp:") {
      urlInfo.port = "21";
    } else if (urlInfo.protocol === "http:") {
      urlInfo.port = "80";
    } else if (urlInfo.protocol === "https:") {
      urlInfo.port = "443";
    }
  }
  const defaultPort: number = Number.parseInt(urlInfo.port || "80");
  const hostname: string = urlInfo.hostname || urlInfo.pathname;

  for (let i = 0; i < retries; i++) {
    const connectPromise = new Promise(
      (resolve: (value: number) => void, reject) => {
        const client = new net.Socket();
        client.connect({ port: defaultPort, host: hostname }, () => {
          client.destroy();
          resolve(1);
        });
        client.on("data", (): void => {});
        client.on("error", (err) => {
          client.destroy();
          reject(err);
        });
        client.on("close", () => {});
      }
    );
    try {
      //@ts-ignore
      await connectPromise.timeout(timeout);
    } catch (ex) {
      if (i === retries - 1) {
        throw ex;
      }
    }
  }
};
