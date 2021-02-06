const MarkdownIt = require("markdown-it");
import emoji from "markdown-it-emoji";
import prism from "markdown-it-prism";
import anchor from "markdown-it-anchor";
import taskLists from "markdown-it-tasks";

import { extractMeta, removeMeta } from "./markdown-meta";
import { MarkdownData } from "../types";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

md.use(prism);
md.use(emoji);
md.use(anchor);
md.use(taskLists, { enabled: true, label: true, labelAfter: true });

export const toHtml = async (input: string): Promise<MarkdownData> => {
  const metaData = await extractMeta(input);
  const strippedData = await removeMeta(input);
  const renderedDocument = md.render(strippedData);

  return {
    document: renderedDocument,
    meta: metaData,
  };
};
