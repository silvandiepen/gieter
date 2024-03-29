import { parentPath } from "@sil/tools/dist/lib/system";

import { makePath } from "@/libs/files";
import { ArchiveType, Payload, File } from "@/types";
import { getExcerpt } from "@/libs/helpers";
/*
 *  Archives
 */

export const generateArchives = async (payload: Payload): Promise<Payload> => {
  payload.files = payload.files

    // Map all Archive parents and get their children
    .map((file, index) => {
      const archiveName = file.name;
      const archiveType = file.meta.archive;

      let children = [];

      const isParent = (item: File, file: File) => {
        return item.parent == archiveName;
      };

      const order =
        archiveType == ArchiveType.BLOG
          ? (a, b) => parseInt(b.created) - parseInt(a.created)
          : (a, b) => a.meta.order - b.meta.order;

      if (file.home && !!archiveType) {
        children = payload.files

          .filter((item) => isParent(item, file) && !item.home)

          //  Enrich each child with meta information, a link and the excerpt
          .map((item) => ({
            ...item,
            date: item?.meta?.date,
            created: item?.meta?.date || item.created,
            meta: { ...item.meta, hide: true },
            link: makePath(item),
            redirect: item.meta.redirect ? item.meta.redirect : null,
            excerpt: getExcerpt(item),
            tags: item?.meta.tags
              ? payload.tags.filter((tag) => item?.meta.tags.includes(tag.name))
              : [],
          }))
          .sort(order);
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

          if (parent?.meta && !!archiveType)
            if (file?.meta)
              payload.files[index].meta = {
                ...file.meta,
                type: archiveType,
              };
            else payload.files[index].meta = { type: archiveType };
        }
      }

      return {
        ...file,
        archives: children.length
          ? [
              {
                name: archiveName,
                type: archiveType,
                children,
                title: file?.meta?.archiveTitle,
              },
            ]
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
