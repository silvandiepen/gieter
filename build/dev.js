// const watch = require("node-watch");
const { extname } = require("path");
const { watch } = require("chokidar");

const {
  blockLine,
  blockLineError,
  blockLineSuccess,
  bold,
  green,
  red,
  blue,
  blockHeader,
} = require("cli-block");
const { exec } = require("child_process");

let watchDist = watch("./dist", { recursive: true });
let watchSource = watch("./src", { recursive: true });
let watchPublic = watch("./public", { recursive: true });

const runner = () => {
  exec(`npm run build:simple`);
};

const runStyle = () => {
  exec(`npm run style:clean && npm run build:style && npm run build:simple`);
};

const startTime = Date.now();
let last = Date.now();

const fileLogger = (group, action, value) => {
  if (action == "added" && startTime < Date.now() + 1000) return;

  const filename = value.split("/")[value.split("/").length - 1];

  value = value
    .replace(`${group}/`, `${bold(blue(group))} → `)
    .replace(filename, `${bold(filename)}`);

  const diff = Date.now() - last;

  if (diff > 1000) {
    blockLine();
  }
  last = Date.now();

  if (value.includes(".d.ts") || value.includes(".js.map")) return;

  switch (action) {
    case "added":
      action = green(action);
      break;
    case "changed":
      action = blue(action);
      break;
    case "removed":
      action = red(action);
      break;
  }

  blockLine(`${green(action)} → ${value}`);
};

const fileActions = (group, action, value) => {
  if (extname(value) === ".scss" && group == "src") runStyle();

  fileLogger(group, action, value);
};

const addActions = (watcher, name) => {
  watcher
    .on("add", (file) => fileLogger(name, "added", `${file}`))
    .on("change", (file) => fileActions(name, "changed", `${file}`))
    .on("unlink", (file) => fileLogger(name, "removed", `${file}`));
};

addActions(watchDist, "dist");
addActions(watchSource, "src");
addActions(watchPublic, "public");

// watchDist.on("change", (_, name) => {
//   console.log(name);
//   //   fileLogger("dist", name);
// });

// watchPublic.on("change", (_, name) => {
//   fileLogger("public", name);
// });

watchSource.on("ready", () => {
  blockHeader("Started watchmode");
  blockLine();

  //   let last = Date.now();
  //   const waitForTypescript = setInterval(() => {
  //     const diff = Date.now() - last;

  //     if (diff > 1500) {
  //       clearInterval(waitForTypescript);
  //       blockLine();
  //       blockLineSuccess("Running our initial build");
  //       runner();
  //     }
  //     console.log("hoi");
  //   }, 100);

  blockLineSuccess("Running TypeScript Watch");
  exec(`npm run dev`);

  blockLineSuccess("Running Server");
  blockLine("http://localhost:3000");
  exec("npx serve public");

  blockLineSuccess("Running Server");
  blockLine("http://localhost:3000");
  exec("npm run build:simple");
});

const logError = (err) => blockLineError(err);

watchPublic.on("error", (err) => logError(err));
watchSource.on("error", (err) => logError(err));
watchDist.on("error", (err) => logError(err));
