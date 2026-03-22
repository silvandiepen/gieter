import { nthIndex } from "@girk/utils";
import { Meta } from "@/types";

export const fixType = (value: string): any => {
  if (!isNaN(value as any)) return parseInt(value, 10);
  else return value;
};

export const extractMeta = async (input: string): Promise<Meta> => {
  const startLine = nthIndex(input, "---", 0);
  const endLine = nthIndex(input, "---", 1);

  const meta = {};
  if (startLine > -1 && startLine < 10 && endLine > -1) {
    input
      .substring(startLine + 3, endLine)
      .split("\n")
      .filter((v) => v !== "")
      .map((v) => {
        const separatorIndex = v.indexOf(": ");
        if (separatorIndex > -1) {
          const keyPart = v.slice(0, separatorIndex);
          const valuePart = v.slice(separatorIndex + 2);

          // Get the key
          const key = keyPart.trim().replace(" ", "_");

          // Set the default string value;
          let value: string | number | string[] | Date = valuePart.trim();

          value = fixType(value);

          // If the value has commas, convert it to an array
          if (
            typeof value === "string" &&
            value.indexOf(",") > -1 &&
            value.indexOf("http") < 0
          )
            value = value.split(",").map((val: string) => fixType(val.trim()));

          // If they key has date in the name, auto convert to a date.
          if (key.toLowerCase().indexOf("date") > -1)
            value = new Date(value as string);

          // Set the meta data;
          meta[key] = value;
        }
      });
    return meta;
  }
  return meta;
};

export const removeMeta = async (input: string): Promise<string> => {
  const startLine = nthIndex(input, "---", 0);
  const endLine = nthIndex(input, "---", 1);
  if (endLine > -1 && startLine < 10)
    return input.substring(endLine + 3, input.length);
  else return input.trim();
};
