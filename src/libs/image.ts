import { File } from "../types";

export const getThumbnail = (file: File) => {
  return file.meta?.thumbnail
    ? file.meta.thumbnail
    : file.meta?.image
    ? file.meta.image
    : null;
};
