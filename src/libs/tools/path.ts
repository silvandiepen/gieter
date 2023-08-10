export const parentPath = (path: string, goBack = -1): string =>
  path.split("/").slice(0, goBack).join("/");

export const renamePath = (ogLink: string, rename: string) => {
  const pathGroup = ogLink.split("/");
  pathGroup[pathGroup.length - 2] = rename;
  return pathGroup.join("/").toLowerCase();
};
