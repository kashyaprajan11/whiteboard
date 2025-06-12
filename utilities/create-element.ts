import rough from "roughjs";
import { Tools, ToolsType, ElementType } from "@/types";

export function createElement(
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: ToolsType
): ElementType {
  const generator = rough.generator();

  switch (type) {
    case Tools.line:
    case Tools.rectangle:
      const roughElement =
        type === Tools.line
          ? generator.line(x1, y1, x2, y2)
          : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      return { id, x1, y1, x2, y2, type, roughElement };

    default:
      throw new Error(`Unknown type: ${type}`);
  }
}
