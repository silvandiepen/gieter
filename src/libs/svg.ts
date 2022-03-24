import { fileExists, getFileData } from "@sil/tools/dist/lib/system";
import { join } from "path";

export const getSVGData = async (svg: string): Promise<string> => {
  const exists = await fileExists(join(process.cwd(), svg));
  if (exists) {
    const svgData = await getFileData(join(process.cwd(), svg));
    return svgData;
  }
  return "";
};
