import { Project } from "../types";
import { getFileData } from "@sil/tools/dist/lib/system";
import { join } from "path";

export const getSVGLogo = async (project: Project): Promise<string> => {
  let logo = "";
  if (project?.logo && project?.logo.includes(".svg")) {
    const logoData = await getFileData(join(process.cwd(), project.logo));
    logo = logoData;
  }
  return logo;
};
