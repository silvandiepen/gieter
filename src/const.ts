export const CACHE_THUMBS = ".cache";
export const CACHE_DIR = process.cwd() + "/.cache";
export const ALLOWED_MEDIA_EXTENSIONS = [
  ".svg",
  ".png",
  ".jpg",
  ".gif",
  ".webp",
];
export const CONVERT_MEDIA_EXTENSIONS = [".png", ".jpg", ".gif"];
export const noconvertMediaFiles = ALLOWED_MEDIA_EXTENSIONS.filter(
  (el) => !CONVERT_MEDIA_EXTENSIONS.includes(el)
);
export const MEDIA_SIZES = {
  SMALL: 640,
  MEDIUM: 1024,
  LARGE: 1920,
};

export enum MEDIA_SIZE_NAME {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}
