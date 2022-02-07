import { parentPath } from "./tools";

import { makePath } from "./files";
import { Payload } from "../types";
import { getExcerpt } from "./helpers";
/*
 *  Archives
 */

export const generateArchives = async (payload: Payload): Promise<Payload> => {
  payload.files = payload.files

    // Map all Archive parents and get their children
    .map((file, index) => {
      const archiveName = file.name;
      const archiveType = file.meta.type;

      let children = [];

      if (file.home && file.meta.isArchive) {
        children = payload.files
          .filter((item) => item.parent == file.parent && !item.home)

          //  Enrich each child with meta information, a link and the excerpt
          .map((item) => ({
            ...item,
            date: item?.meta?.date,
            created: item?.meta?.date || item.created,
            meta: { ...item.meta, hide: true },
            link: makePath(item),
            excerpt: getExcerpt(item),
            tags: item?.meta.tags
              ? payload.tags.filter((tag) => item?.meta.tags.includes(tag.name))
              : [],
          }))
          .sort((a, b) => parseInt(b.created) - parseInt(a.created));
      } else {
        /*
         * Inherit the parents type on each child
         */
        if (file.parent && !file.meta.type) {
          const parent = payload.files.find((parentFile) => {
            if (!parentFile.home) return false;
            return (
              parentFile.path.toLowerCase() ==
              (parentPath(file.path) + "/readme.md").toLowerCase()
            );
          });

          if (parent?.meta && parent.meta.type)
            if (file?.meta)
              payload.files[index].meta = {
                ...file.meta,
                type: parent.meta.type,
              };
            else payload.files[index].meta = { type: parent.meta.type };
        }
      }

      if (children.length > 0) console.log(file.path);
      // console.log(file);

      return {
        ...file,
        archives: children.length
          ? [{ name: archiveName, type: archiveType, children }]
          : [],
      };
    });

  return payload;
};

export const getArchives = async (payload: Payload): Promise<Payload> => {
  payload.files = payload.files.map((file) => {
    if (file.meta.showArchive) {
      return { ...file };
    } else {
      return file;
    }
  });

  return payload;
};
