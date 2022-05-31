import { asyncForEach } from "@sil/tools";

import { Payload, File, FileType, Tag, Language, ArchiveType } from "../types";
import { createPage } from "./page";
import { fileId } from "./files";

import { blockMid } from "cli-block";

/*
 *  Tags
 */

export const generateTags = async (payload: Payload): Promise<Payload> => {
  const tags: Tag[] = [];

  await asyncForEach(payload.files, (file: File) => {
    if (file.meta && file.meta?.tags) {
      if (typeof file.meta?.tags === "string")
        file.meta.tags = [file.meta.tags];

      for (let i = 0; i < file.meta.tags.length; i++) {
        const parent = payload.files.find((f) => f.name == file.parent?.name);

        const tag = {
          name: file.meta.tags[i],
          link: `/tag/${file.meta.tags[i]}`,
          parent: file.parent,
          type: parent?.meta.type || "",
        };

        if (payload.project.groupTags) {
          if (
            !tags.some(
              (item) =>
                item.name === tag.name && item.parent?.id === tag.parent.id
            )
          )
            tags.push(tag);
        } else {
          if (!tags.some((item) => item.name === tag.name)) tags.push(tag);
        }
      }
    }
  });
  return { ...payload, tags };
};

export const createTagPages = async (payload: Payload): Promise<Payload> => {
  if (payload.tags.length) blockMid("Tag pages");

  await asyncForEach(payload.tags, async (tag: Tag) => {
    const path = `/tag/${payload.project.groupTags ? `${tag.parent}/` : ``}${
      tag.name
    }/index.html`;

    const archive = payload.project.groupTags
      ? payload.files.filter(
          (file) =>
            file.meta?.tags?.includes(tag.name) &&
            file.parent?.id === tag.parent.id
        )
      : payload.files.filter((file) => file.meta?.tags?.includes(tag.name));

    const file: File = {
      id: fileId(path),
      name: tag.name,
      title: `#${tag.name}`,
      path,
      created: new Date(),
      language: Language.EN,
      fileName: "index.html",
      parent: tag.parent,
      meta: { type: tag.type },
      archive: {
        name: tag.name,
        type: ArchiveType.ARTICLES,
        children: archive,
        sections: []
      },
      html: `<h1>#${tag.name}</h1>`,
      type: FileType.TAG,
    };

    await createPage(payload, file);
  });
  return payload;
};
