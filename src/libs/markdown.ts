const MarkdownIt = require("markdown-it");
import prism from "markdown-it-prism";

const md = new MarkdownIt();
md.use(prism);

export const toHtml = async (input: string): Promise<string> => {
  return md.render(input);
};
