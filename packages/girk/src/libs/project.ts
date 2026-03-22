import { asyncForEach, fileExists, getFileData } from "@girk/utils";
import { camelCase } from "@sil/case";
import { Project, Meta, File, Arguments } from "../types";
import { flattenObject } from "./helpers";

export const getConfig = async (): Promise<Arguments> => {
  const configFiles = ["./girk.config.json", "./gieter.config.json"];

  for (const configFile of configFiles) {
    const configExists = await fileExists(configFile);

    if (configExists) {
      const data = await getFileData(configFile);
      return flattenObject(data as unknown as Record<string, unknown>);
    }
  }

  return {};
};

const fixProjectTypes = (input: Project): Project => {
  const fixedProject: Project = {};

  Object.keys(input).forEach((key: string) => {
    let value: any;
    if (input[key] == "false") value = false;
    else if (input[key] == "true") value = true;
    else if (!/\r|\n/.exec(input[key]) && input[key].split(",").length > 1)
      value = input[key].split(",");
    else value = input[key];

    fixedProject[key] = value;
  });

  return fixedProject;
};

const getProjectConfig = (meta: Meta): Project => {
  const project: Project = {};
  // Merge configs
  Object.keys(meta).forEach((item) => {
    if (item.includes("project") && typeof item == "string") {
      const key = camelCase(item.replace("project", ""), { exclude: [":"] });
      if (key == "ignore") {
        project[key] = [];
        meta[item]
          .toString()
          .split(",")
          .forEach((value) => {
            value = value.trim();
            if (value.indexOf(",")) {
              value = value.split(",");
            }
            project.ignore.push(value);
          });
      } else project[key] = meta[item];
    }
  });
  return project;
};

export const getProjectData = async (files: File[]): Promise<Project> => {
  const project: Project = {};

  // First set the argumnets from the config file
  const config = await getConfig();
  if (config) {
    const projectMeta = getProjectConfig(config);
    Object.keys(projectMeta).forEach((key) => {
      if (!project[key]) project[key] = projectMeta[key];
    });
  }

  // Arguments set in files itself, will override the config file.
  await asyncForEach(files, async (file: File) => {
    const projectMeta = getProjectConfig(file.meta);
    Object.keys(projectMeta).forEach((key) => {
      if (!project[key]) project[key] = projectMeta[key];
    });
  });

  return fixProjectTypes(project);
};
