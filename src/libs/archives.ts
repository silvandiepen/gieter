import { makeLink } from "./files";
import { Payload } from "../types";
/*
 *  Archives
 */

export const generateArchives = async (payload: Payload): Promise<Payload> => {
  payload.files = payload.files

    // Map all Archive parents and get their children
    .map((file) => {
      let children = [];
      if (file.home && file.meta.isArchive) {
        children = payload.files
          .filter((item) => item.parent == file.parent && !item.home)

          //  Enrich each child with meta information and a link
          .map((item) => ({
            title: item.title,
            created: item?.meta?.date || item.created,
            meta: { ...item.meta, hide: true },
            link: makeLink(item.path),
            parent: item.parent,
          }))
          .sort((a, b) => b.created - a.created);
      }

      return {
        ...file,
        children,
      };
    });

  return payload;
};
