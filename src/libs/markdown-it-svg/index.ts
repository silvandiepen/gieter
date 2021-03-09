import MarkdownIt from "markdown-it";

import { join } from "path";
import { download } from "../files";
import { readFileSync } from "fs";

function generateAttributes(md: MarkdownIt, token: any) {
  var ignore = ["src", "alt"];
  var escape = ["title"];
  var attributes = "";

  token.attrs.forEach((entry) => {
    var name = entry[0];

    if (ignore.includes(name)) return;

    var value = "";

    if (escape.includes(name)) {
      value = md.utils.escapeHtml(entry[1]);
    } else {
      value = entry[1];
    }

    attributes += ` ${name}="${value}"`;
  });

  return attributes;
}

const generateClass = (className: string): string =>
  className ? ' class="' + className + '"' : "";

const isLocal = (url: string): boolean => {
  const pattern = /^https?:\/\//i;
  return pattern.test(url);
};

const loadSvg = (url: string): string => {
  try {
    const data = readFileSync(url, "utf8");
    return data;
  } catch (err) {
    console.error(err);
  }
  return "";
};

const getImage = (url: string): string => {
  let svg = "";

  if (isLocal(url)) {
    let tempFile = join(process.cwd(), "temp/image.svg");
    download(url, tempFile);
    svg = loadSvg(tempFile);
  } else {
    svg = loadSvg(join(process.cwd(), url));
  }

  return svg;
};

const svgImages = (md: MarkdownIt, config) => {
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const localConfig = { ...config };

    const token = tokens[idx];
    const srcIndex = token.attrIndex("src");
    const url = token.attrs[srcIndex][1];
    const caption = md.utils.escapeHtml(token.content);

    const isSvg = url.indexOf(".svg") > 0;

    const imgClass = generateClass(localConfig.imgClass);
    const otherAttributes = generateAttributes(md, token);

    if (!isSvg) {
      return `<img src="${url}" alt="${caption}" ${imgClass} ${otherAttributes}>`;
    } else {
      const svg = getImage(url);
      return svg ? svg : "couldnt-load-yet";
    }
  };
};
export default svgImages;
