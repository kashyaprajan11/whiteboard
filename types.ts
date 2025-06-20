export type ElementType = {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ToolsType;
  roughElement?: any;
  position?: string | null;
  points?: { x: number; y: number }[];
  text?: any;
};

export const Tools = {
  pan: "pan",
  selection: "selection",
  rectangle: "rectangle",
  line: "line",
  pencil: "pencil",
  text: "text",
};

export type ToolsType = (typeof Tools)[keyof typeof Tools];

export type ActionTypes =
  | "writing"
  | "drawing"
  | "moving"
  | "panning"
  | "resizing"
  | "none";
