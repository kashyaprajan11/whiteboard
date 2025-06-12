import { Tools, ElementType } from "@/types";

export function drawElement(
  roughCanvas: any,
  context: CanvasRenderingContext2D,
  element: ElementType
) {
  switch (element.type) {
    case Tools.line:
    case Tools.rectangle:
      roughCanvas.draw(element.roughElement);
      break;

    default:
      throw new Error(`Unknown type ${element.type}`);
  }
}
