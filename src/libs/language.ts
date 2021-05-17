import { Language, Payload, File, LanguageMenuItem } from "../types";
import { makePath } from "./files";

export const defaultLanguage: Language = Language.EN;

export const getLangFromPath = (pathName: string): Language => {
  const langPath = pathName
    .split("/")
    .find((partial) => partial.indexOf(":") > 0);
  if (!langPath) return defaultLanguage;
  return getLangFromFilename(langPath);
};

export const fixLangInPath = (
  pathName: string,
  removeDefault = true
): string => {
  const language = getLangFromPath(pathName);

  const path = pathName.split("/").map((partial) => {
    const ext = partial.indexOf(".") > 0 ? partial.split(".")[1] : null;
    return partial.indexOf(":") > 0
      ? `${partial.split(":")[0]}${ext ? `.${ext}` : ``}`
      : partial;
  });

  if (language == defaultLanguage && removeDefault) {
    return path.join("/");
  }
  return `${language ? `/${language}` : ""}/${path.join("/")}`.replace(
    "//",
    "/"
  );
};

export const getLangFromFilename = (fileName: string): Language => {
  fileName = fileName.indexOf(".") ? fileName.split(".")[0] : fileName;

  if (fileName.indexOf(":") > 0) {
    const lang = fileName.split(":")[1];
    switch (lang) {
      case "en":
        return Language.EN;
      case "nl":
        return Language.NL;
      case "ru":
        return Language.RU;
      case "mt":
        return Language.MT;
      case "am":
        return Language.AM;
      default:
        return defaultLanguage;
    }
  }
  return defaultLanguage;
};

const getLanguageForPage = (payload: Payload, file: File): Language => {
  let lang = Language.EN;

  if (file && file.language) lang = file.language;
  else if (file && file.meta.language) lang = file.meta.language;
  else if (payload.project?.language) lang = payload.project.language;

  return lang;
};

export const getLanguageMenu = (
  payload: Payload,
  file: File
): LanguageMenuItem[] => {
  const menu = [];
  payload.languages.forEach((lang: Language) => {
    const altPage = payload.files.find(
      (f) => f.id == file.id.replace(`${file.language}-`, `${lang}-`)
    );

    const link = altPage
      ? `${makePath(altPage)}`
      : `/${lang == defaultLanguage ? "" : lang}`;

    menu.push({
      name: lang,
      link,
      active: lang == getLanguageForPage(payload, file),
    });
  });
  return menu;
};
