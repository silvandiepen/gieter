const MarkdownIt = require("markdown-it");
import prism from "markdown-it-prism";
import { extractMeta, removeMeta } from "./markdown-meta";
import { MarkdownData } from "../types";

const md = new MarkdownIt();

md.use(prism);

export const toHtml = async (input: string): Promise<MarkdownData> => {
  const metaData = await extractMeta(input);
  const strippedData = await removeMeta(input);
  const renderedDocument = md.render(strippedData);

  return {
    document: renderedDocument,
    meta: metaData,
  };
};
