export const findWebComponents = async (html: string): Promise<string[]> => {
  const regex = /\s*<sil-(.*?)[^>]*>/g;
  const regex2 = /\s*sil-(.*?)[^>]*/g;

  const results = [
    ...new Set(
      html
        .match(regex)
        .map((r) => r.match(regex2))
        .flat()
        .map((r) => r.split(" ")[0].replace("sil-", ""))
    ),
  ];

  return results;
};
