import { blockRowLine } from "cli-block";
import { Payload, File } from "../types";
import { createPage } from "./page";

export const createSitemap = async (payload: Payload): Promise<Payload> => {
  const sitemap = [];

  //   const file: File = {
  //     id: fileId(path),
  //     name: tag.name,
  //     title: `#${tag.name}`,
  //     path,
  //     created: new Date(),
  //     language: Language.EN,
  //     fileName: "index.html",
  //     parent: tag.parent,
  //     meta: { type: tag.type },
  //     archives: [
  //       {
  //         name: tag.name,
  //         type: ArchiveType.ARTICLES,
  //         children: archive,
  //       },
  //     ],
  //     html: `<h1>#${tag.name}</h1>`,
  //     type: FileType.TAG,
  //   };

  payload.files.forEach((file: File) => {
    // blockRowLine([file.name, file.home, file.id, file.parent?.id]);

    blockRowLine([
      file.name,
      file.home ? "true" : "false",
      file.id,
      file.parent?.id ? file.parent.id : "",
    ]);
  });

  //   await createPage(payload, file);

  return payload;
};
