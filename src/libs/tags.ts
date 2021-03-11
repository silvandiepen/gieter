import { asyncForEach } from "./helpers";
import { Payload, File, FileType, Tag } from "../types";
import { createPage } from "./page";
import * as log from "cli-block";

/*
 *  Tags
 */

export const generateTags = async (payload: Payload): Promise<Payload> => {
  const tags: Tag[] = [];

  await asyncForEach(payload.files, (file: File) => {
    if (file.meta && file.meta?.tags) {
      for (let i = 0; i < file.meta.tags.length; i++) {
        let parent = payload.files.find((f) => f.name == file.parent);

        let tag = {
          name: file.meta.tags[i],
          parent: file.parent,
          type: parent?.meta.type || "",
        };
        if (
          !tags.some(
            (item) => item.name === tag.name && item.parent === tag.parent
          )
        )
          tags.push(tag);
      }
    }
  });
  return { ...payload, tags };
};

export const createTagPages = async (payload: Payload): Promise<Payload> => {
  if (payload.tags.length) log.BLOCK_MID("Tag pages");

  await asyncForEach(payload.tags, async (tag: Tag) => {
    const file: File = {
      name: tag.name,
      title: `#${tag.name}`,
      path: `/tag/${tag.parent}/${tag.name}/index.html`,
      created: new Date(),
      fileName: "index.html",
      parent: tag.parent,
      meta: { type: tag.type },
      children: payload.files.filter(
        (file) =>
          file.meta?.tags?.includes(tag.name) && file.parent == tag.parent
      ),
      html: `<h1>#${tag.name}</h1>`,
      type: FileType.TAG,
    };
    await createPage(payload, file);
  });
  return { ...payload };
};
