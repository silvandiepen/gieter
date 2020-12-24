import { nthIndex } from "./helpers";
import { Meta } from "../types";

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
        if (v.indexOf(":") > -1) {
          const valueArray = v.split(":");

          // Get the key
          const key = valueArray[0].trim().replace(" ", "_");

          // Set the default string value;
          let value: string | number | string[] | Date = valueArray[1].trim();

          // If the value is a number, convert to a number
          if (!isNaN(value as any)) value = parseInt(value, 10);

          // If the value has commas, convert it to an array
          if (typeof value === "string" && value.indexOf(",") > -1)
            value = value.split(",").map((val: string) => val.trim());

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
