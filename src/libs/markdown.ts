import MarkdownIt from "markdown-it";
import emoji from "markdown-it-emoji";
import prism from "markdown-it-prism";
import anchor from "markdown-it-anchor";
import tasks from "markdown-it-tasks";
import alert from "markdown-it-alert";
import svgImages from "./markdown-it-svg";
import defList from "markdown-it-deflist";

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
md.use(tasks, { enabled: true, label: true, labelAfter: true });
md.use(alert, { bem: true });
md.use(defList);
md.use(svgImages);

export const unp = (input: string): string => {
  // const regex = new RegExp("<p>(?:<img[^>]+>|<svg[^>]+>(.*?)</svg>)</p>", "g");
  // const images = input.match(regex);
  // console.log(images);
  return input;
};

export const toHtml = async (input: string): Promise<MarkdownData> => {
  const metaData = await extractMeta(input);
  const strippedData = await removeMeta(input);
  const renderedDocument = await md.render(strippedData);

  return {
    document: unp(renderedDocument),
    meta: metaData,
  };
};
