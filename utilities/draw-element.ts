import { Tools, ElementType } from "@/types";
import getStroke from "perfect-freehand";

export function drawElement(
  roughCanvas: any,
  context: CanvasRenderingContext2D,
  element: ElementType
) {
  console.log("type", element.type);
  switch (element.type) {
    case Tools.line:
    case Tools.rectangle:
      roughCanvas.draw(element.roughElement);
      break;

    case Tools.pencil:
      if (!element.points) {
        throw new Error(`Pencil element points aren't defined`);
      }

      const strokePoints = getStroke(element.points);
      const formattedPoints: [number, number][] = strokePoints.map((point) => {
        if (point.length !== 2) {
          throw new Error(
            `Expected point to have exactly 2 elements, got ${point.length}`
          );
        }
        return [point[0], point[1]];
      });
      const stroke = getSvgPathFromStroke(formattedPoints);
      context.fill(new Path2D(stroke));
      break;
    case Tools.text:
      context.textBaseline = "top";
      context.font = "24px manrope";
      const text = element.text || "";
      context.fillText(text, element.x1, element.y1); // Render text on canvas
      break;
    default:
      throw new Error(`Unknown type ${element.type}`);
  }
}

// source: https://github.com/steveruizok/perfect-freehand?tab=readme-ov-file
const average = (a: number, b: number) => (a + b) / 2;

function getSvgPathFromStroke(points: [number, number][], closed = true) {
  const len = points.length;

  if (len < 4) {
    return ``;
  }

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
}
