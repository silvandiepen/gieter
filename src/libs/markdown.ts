import MarkdownIt from "markdown-it";
import emoji from "markdown-it-emoji";
import prism from "markdown-it-prism";
import anchor from "markdown-it-anchor";
import tasks from "markdown-it-tasks";
import alert from "markdown-it-alert";
import defList from "markdown-it-deflist";

import svgImages from "@/libs/markdown-it-svg";
import { extractMeta, removeMeta } from "@/libs/markdown-meta";
import { MarkdownData } from "@/types";
import { getGist } from "@/libs/download";
import { asyncForEach } from "@sil/tools";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

md.use(prism, {
  plugins: ["autolinker"],
});
md.use(emoji);
md.use(anchor);
md.use(tasks, { enabled: true, label: true, labelAfter: true });
md.use(alert, { bem: true });
md.use(defList);
md.use(svgImages);

export const unp = (input: string): string => {
  // const regex = new RegExp("<p>(?:<img[^>]+>|<svg[^>]+>(.*?)</svg>)</p>", "g");
  // const images = input.match(regex);
  return input;
};

export const replaceData = async (input: string): Promise<string> => {
  const gist = /\[gist=(.*?)\]/g;
  const matches = input.match(gist);
  if (matches) {
    await asyncForEach(matches, async (match) => {
      const gistId = match.split("[gist=").pop().split("]")[0];
      const gistData = await getGist(gistId);
      input = input.replace(match, `\n${gistData}\n`);
    });
  }
  return input;
};

export const toHtml = async (input: string): Promise<MarkdownData> => {
  const metaData = await extractMeta(input);
  const strippedData = await removeMeta(input);
  const replacedData = await replaceData(strippedData);
  const renderedDocument = md.render(replacedData);

  return {
    document: unp(renderedDocument),
    meta: metaData,
  };
};
