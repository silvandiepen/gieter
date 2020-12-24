const MarkdownIt = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});
import emoji from "markdown-it-emoji";
import prism from "markdown-it-prism";
import anchor from "markdown-it-anchor";

import { extractMeta, removeMeta } from "./markdown-meta";
import { MarkdownData } from "../types";

const md = new MarkdownIt();

md.use(prism);
md.use(emoji);
md.use(anchor);

export const toHtml = async (input: string): Promise<MarkdownData> => {
  const metaData = await extractMeta(input);
  const strippedData = await removeMeta(input);
  const renderedDocument = md.render(strippedData);

  return {
    document: renderedDocument,
    meta: metaData,
  };
};
