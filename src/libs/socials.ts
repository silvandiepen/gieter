import { Payload } from "@/types";
import {
  blockLine,
  blockLineError,
  blockMid,
  blockRowLine,
  blockTable,
  blue,
  bold,
} from "cli-block";

export interface Social {
  icon: string;
  link: string;
  title: string;
}

export const generateSocials = async (payload: Payload): Promise<Payload> => {
  const socials = getSocials(payload.settings.config);

  if (socials.length) {
    blockMid("Socials");

    socials.forEach((social: Social, idx) => {
      blockLine(bold(social.title));
      blockLine(blue(social.link));
      blockLine("");
    });
  }

  //   throw new Error();

  return { ...payload, socials };
};

export const getSocials = (config: Payload["settings"]["config"]): Social[] => {
  if (!config.socials) return [];

  let socials = [];
  config.socials.forEach((url: string) => {
    if (!url) return;
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    if (matches && matches[1])
      socials.push({
        link: url,
        name: url
          .replace(matches[1] || "", "")
          .replace(/^https?:\/\//, "")
          .replace("/", ""),
        title: (matches[1] || "").replace("www.", "").split(".")[0],
      });
    else {
      blockLineError(`${url} is  not a valid link`);
    }
  });

  return socials;
};
