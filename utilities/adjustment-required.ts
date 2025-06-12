import { ToolsType } from "@/types";

export function adjustmentRequired(type: ToolsType) {
  return ["line", "rectangle"].includes(type);
}
