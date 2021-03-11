import { PurgeCSS } from "purgecss";

import { Style, Payload } from "../types";
import { buildPage } from "./page";
import { download } from "./files";
import { createDir } from "./helpers";

const { readFile, writeFile } = require("fs").promises;
import { join } from "path";

/*
 * createCss
 *
 * Create CSS string based on Original input and HTML file.
 */
export const createCss = async (
  content: string,
  css: string,
  options = {}
): Promise<string> => {
  const purgeCSSResult = await new PurgeCSS().purge({
    content: [
      {
        raw: content,
        extension: "html",
      },
    ],
    css: [{ raw: css }],
    fontFace: true,
    keyframes: true,
    variables: true,
    ...options,
  });

  //   console.log(purgeCSSResult[0], content);
  //   return "";
  return purgeCSSResult[0].css;
};

/*
 * createBaseCss
 *
 * Create a base CSS based on an empty page. This CSS is automatically applied to all pages.
 */

export const createBaseCss = async (
  payload: Payload,
  css: string
): Promise<string> => {
  const emptyFile = {
    name: "",
    fileName: "",
    path: "",
    created: "",
    title: "",
    html: null,
    menu: payload.menu,
    meta: {},
    children: [],
  };

  const customHtml = await buildPage(
    { ...payload, style: { og: "" } },
    emptyFile
  );

  const customCss = await createCss(customHtml.html.data, css, {});
  return customCss;
};

/*
 * generateStyles
 *
 * Styles are being downloaded and directly the base css is being generated.
 * generateStyles responds with loading the payload with the original styles and possible custom or additional styles.
 */
export const generateStyles = async (payload: Payload): Promise<Payload> => {
  // Download the style
  let style: Style = {};

  await download(
    "https://stil.style/default.css",
    join(__dirname, "../dist/style.css")
  );

  const styleData = await readFile(
    join(__dirname, "../dist/style.css")
  ).then((res: any) => res.toString());

  if (payload.files.length > 1) {
    await createDir(payload.settings.output);
    const filePath = join(payload.settings.output, "style.css");
    const customCss = await createBaseCss(payload, styleData);

    await writeFile(filePath, customCss);

    style.path = "/style.css";
  } else {
    const customCss = await createBaseCss(payload, styleData);
    style.sheet = customCss;
  }

  style.og = styleData;

  if (payload.project.styleOverrule) style.path = payload.project.styleOverrule;
  if (payload.project.style) style.add = payload.project.style;

  return { ...payload, style };
};
