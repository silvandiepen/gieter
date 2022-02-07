import { hello } from "../../libs/tools";
import { blockFooter, blockHeader, blockLine } from "cli-block";
import { buildCss } from "./compile";

hello().then(async () => {
  blockHeader("Styles");
  blockLine();
  await buildCss();
  blockFooter();
});
