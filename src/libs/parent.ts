import { asyncForEach } from "@sil/tools";
import { Payload, File, ArchiveType } from "../types";

export const getParentFiles = async (payload: Payload): Promise<Payload> => {
  asyncForEach(payload.files, (file: File, index: number) => {
    const parentFile = payload.files.find(
      (f) => f.parent == file.parent && f.home && f.id !== file.id
    );

    if (parentFile)
      payload.files[index].parent = {
        title: parentFile.title,
        id: parentFile.id,
        name: parentFile.name,
        archive: parentFile.meta?.archive || ArchiveType.NONE,
      };
  });

  return payload;
};

export const parent = async (payload: Payload): Promise<Payload> => {
  payload = await getParentFiles(payload);
  return payload;
};
