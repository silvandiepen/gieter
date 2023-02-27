import { Payload, Style } from "../../types";
import { buildCss } from "./compile";

export const generateStyles = async (payload: Payload): Promise<Payload> => {


  const styleSheet = await buildCss();
  const style = {
    path: "/style/",
    sheet: styleSheet,
    add: "",
    page: "",
    og: "",
  } as Style;
  return { ...payload, style };
};

export const createCss = () => {
  return "";
};
