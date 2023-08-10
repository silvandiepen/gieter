import { asyncForEach } from "@/libs/tools";
import { File, Payload } from "../types";

export const processPartials = async (payload: Payload): Promise<Payload> => {
  /*
   * Extract all Partials and add them to their parent.
   */
  await asyncForEach(payload.files, async (file: File, index: number) => {
    // console.log(file.fileName);
  });
  return payload;
};
