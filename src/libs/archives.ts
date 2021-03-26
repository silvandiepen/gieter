import { makePath, getParent } from "./files";
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
          .filter((item) => item.parent == file.id && !item.home)

          //  Enrich each child with meta information and a link
          .map((item) => ({
            title: item.title,
            date: item?.meta?.date,
            created: item?.meta?.date || item.created,
            meta: { ...item.meta, hide: true },
            link: makePath(item),
            parent: item.parent,
          }))
          .sort((a, b) => b.created - a.created);
        
      
      } else {
        /*
         * Inherit the parents type on each child
         */
        if (file.parent && !file.meta.type) {

          const parent = getParent(payload,file.parent);

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
