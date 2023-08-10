export const removeTag = (input: string, tag: string): string => {
    const regex = new RegExp(`<${tag}(.*)>(.*)<\/${tag}>`, "gi");
    return input.replace(regex, "");
  };
  
  export const getStringFromTag = (input: string, tag: string): string => {
    const regex = new RegExp(`<${tag}(.*?)>(.+?)<\/${tag}>`, "gi");
    const matches = regex.exec(input);
    return matches && matches.length > 1 ? matches[2] : "";
  };
  
  export const getIndexes = (source: string, find: string): number[] => {
    const result = [];
    let i = 0;
  
    while (i < source.length) {
      if (source.substring(i, i + find.length) === find) {
        result.push(i);
        i += find.length;
      } else {
        i++;
      }
    }
  
    return result;
  };
  
  export const nthIndex = (source: string, find: string, nth: number): number => {
    const result = getIndexes(source, find);
    return result[nth];
  };
  