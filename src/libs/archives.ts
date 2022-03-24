import { parentPath } from "@sil/tools/dist/lib/system";

import { makePath } from "./files";
import { ArchiveType, Payload, File } from "../types";
import { getExcerpt } from "./helpers";
/*
 *  Archives
 */

export const generateArchives = async (payload: Payload): Promise<Payload> => {
  payload.files = payload.files
    // Map all Archive parents and get their children
    .map((file) => {
      const archiveName = file.name;
      const archiveType = file.meta.archive;

      let children = [];

      const order =
        archiveType == ArchiveType.BLOG
          ? (a: File, b: File) =>
              parseInt(b.created.toString()) - parseInt(a.created.toString())
          : (a: File, b: File) => a.meta.order - b.meta.order;

      children = payload.files
        .filter((f) => f.parent.id == file.id)
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
        .sort(order);

      // if (file.home && !!archiveType) {
      //   children = payload.files
      //     .filter((item) => item.parent?.id === file.id && !item.home)

      //     //  Enrich each child with meta information, a link and the excerpt
      //     .map((item) => ({
      //       ...item,
      //       date: item?.meta?.date,
      //       created: item?.meta?.date || item.created,
      //       meta: { ...item.meta, hide: true },
      //       link: makePath(item),
      //       excerpt: getExcerpt(item),
      //       tags: item?.meta.tags
      //         ? payload.tags.filter((tag) => item?.meta.tags.includes(tag.name))
      //         : [],
      //     }))
      //     .sort(order);
      //   // if (archiveType == ArchiveType.ARTICLES) {
      //   //   console.log(children);
      //   // }
      //   // console.log(children);
      // } else {
      //   /*
      //    * Inherit the parents type on each child
      //    */
      //   if (file.parent?.id && !file.meta.type) {
      //     const parent = payload.files.find((parentFile) => {
      //       if (!parentFile.home) return false;
      //       return (
      //         parentFile.path.toLowerCase() ==
      //         (parentPath(file.path) + "/readme.md").toLowerCase()
      //       );
      //     });

      //     if (parent?.meta && !!archiveType)
      //       if (file?.meta)
      //         payload.files[index].meta = {
      //           ...file.meta,
      //           type: archiveType,
      //         };
      //       else payload.files[index].meta = { type: archiveType };
      //   }
      // }

      return {
        ...file,
        archive: children.length
          ? { name: archiveName, type: archiveType, children }
          : null,
      };
    });

  return payload;
};

// export const getArchives = async (payload: Payload): Promise<Payload> => {
//   payload.files = payload.files.map((file) => {
//     if (file.meta.showArchive) {
//       return { ...file };
//     } else {
//       return file;
//     }
//   });

//   return payload;
// };
