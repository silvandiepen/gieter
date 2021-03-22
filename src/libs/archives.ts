import { makePath } from "./files";
import { Payload } from "../types";

/*
 *  Archives
 */

const parentPath = (path: string): string =>
  path.split("/").slice(0, -1).join("/");

export const generateArchives = async (payload: Payload): Promise<Payload> => {
  payload.files = payload.files

    // Map all Archive parents and get their children
    .map((file, index) => {
      let archiveName = file.name;
      let archiveType = file.meta.type;

      let children = [];
      if (file.home && file.meta.isArchive) {
        children = payload.files
          .filter((item) => item.parent == file.parent && !item.home)

          //  Enrich each child with meta information and a link
          .map((item) => ({
            title: item.title,
            date: item?.meta?.date,
            created: item?.meta?.date || item.created,
            meta: { ...item.meta, hide: true },
            link: makePath(item, payload),
            parent: item.parent,
          }))
          .sort((a, b) => b.created - a.created);
      } else {
        /*
         * Inherit the parents type on each child
         */
        if (file.parent && !file.meta.type) {
          let parent = payload.files.find((parentFile) => {
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
  payload.files = payload.files.map((file, index) => {
    if (file.meta.showArchive) {
      let children = [];

      return { ...file };
    } else {
      return file;
    }
  });

  return payload;
};
