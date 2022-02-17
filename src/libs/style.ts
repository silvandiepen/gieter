import { PurgeCSS } from "purgecss";

import { createDir } from "@sil/tools/dist/lib/system";
import { buildCss } from "../style/compile/compile";
import { Style, Payload, Language } from "../types";
import { buildPage } from "./page";
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
  return css;
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
  // If there is a menu, enrich the menu with active and parent items so these will be picked up by purgeCss
  const mockMenu = [...payload.menu];

  if (mockMenu.length > 0) {
    const ph = {
      id: "",
      name: "placeholder",
      active: true,
    };
    mockMenu.push(
      { ...ph, link: "parent", language: Language.EN },
      { ...ph, link: "parent/child", language: Language.EN }
    );
  }

  const emptyFile = {
    id: "",
    name: "",
    fileName: "",
    path: "parent/child",
    created: new Date(),
    language: Language.EN,
    title: "",
    html: null,
    meta: {},
    archive: [],
  };

  const customHtml = await buildPage(
    { ...payload, menu: mockMenu, style: { og: "" } },
    emptyFile
  );

  // Add colormodes to html
  const mockHtml = customHtml.html.data.replace(
    "<body",
    '<body color-mode="dark" color-mode="light"'
  );

  const customCss = await createCss(mockHtml, css);
  return customCss;
};

/*
 * createStylesheets
 *
 * Styles are being downloaded and directly the base css is being generated.
 * createStylesheets responds with loading the payload with the original styles and possible custom or additional styles.
 */
export const createStylesheets = async (
  styleData: string,
  payload: Payload
): Promise<Payload> => {
  // Download the style
  const style: Style = {
    og: "",
    path: "",
    sheet: "",
  };

  if (styleData == "") {
    console.log(`styleData is empty`);
    process.exit();
  }

  const customCss = await createBaseCss(payload, styleData);

  if (payload.files.length > 1) {
    await createDir(payload.settings.output);
    const filePath = join(payload.settings.output, "style.css");
    await writeFile(filePath, customCss);
    style.path = "/style.css";
  } else {
    style.sheet = customCss;
  }

  style.og = styleData;

  if (payload.project.styleOverrule) style.path = payload.project.styleOverrule;
  if (payload.project.style) style.add = payload.project.style;

  return { ...payload, style };
};

export const generateStyles = async (payload: Payload): Promise<Payload> => {
  const styleFile = await buildCss();
  payload = await createStylesheets(styleFile, payload);
  return payload;
};
