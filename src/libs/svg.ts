import { Language, Project } from "../types";
import { getFileData } from "./files";
import { join } from "path";

export const getSVGLogo = async (project: Project): Promise<string> => {
  let logo = "";
  if (project?.logo && project?.logo.includes(".svg")) {
    const logoData = await getFileData({
      id: "",
      name: "",
      fileName: "",
      created: null,
      path: join(process.cwd(), project.logo),
      relativePath: project.logo,
      language: Language.EN,
    });
    logo = logoData;
  }
  return logo;
};
