import { getFileData } from "@/libs/tools";
import { join } from "path";

export const getSVGData = async (svg: string): Promise<string> => {
  const svgData = await getFileData(join(process.cwd(), svg));
  return svgData;
};
