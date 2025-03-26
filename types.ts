export const Tools = {
  pan: "pan",
  selection: "selection",
  rectangle: "rectange",
  line: "line",
  pencil: "pencil",
  text: "text",
};

export type ToolsType = (typeof Tools)[keyof typeof Tools];
