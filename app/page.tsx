"use client";

import { useEffect, useLayoutEffect, useState, MouseEvent } from "react";
import rough from "roughjs";

import { createElement } from "@/utilities/create-element";
import { drawElement } from "@/utilities/draw-element";
import { useHistory } from "@/hooks/useHistory";
import { adjustmentRequired } from "@/utilities/adjustment-required";
import { adjustedCoordinates } from "@/utilities/adjust-element-coordinates";
import ActionBar from "@/components/action-bar";
import { Tools, ToolsType, ActionTypes, ElementType } from "@/types";

export default function Home() {
  const initialTool: ToolsType = Tools.selection;

  const [tool, setTool] = useState<ToolsType>(initialTool);
  const [action, setAction] = useState<ActionTypes>("none");
  const { elements, setElements, undo, redo } = useHistory([]);
  const [canvasHeight, setCanvasHeight] = useState<number | undefined>(
    undefined
  );
  const [canvasWidth, setCanvasWidth] = useState<number | undefined>(undefined);
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );

  useEffect(() => {
    setCanvasHeight(window.innerHeight);
    setCanvasWidth(window.innerWidth);
  }, []);

  console.log(elements);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      drawElement(roughCanvas, context, element);
    });
  });

  const updateElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: ToolsType,
    options?: { text: string }
  ) => {
    const elementCopy = [...elements];
    switch (type) {
      case Tools.line:
      case Tools.rectangle:
        elementCopy[id] = createElement(id, x1, y1, x2, y2, type);
        break;

      case Tools.pencil:
        const existingPoints = elementCopy[id].points || [];
        elementCopy[id].points = [...existingPoints, { x: x2, y: y2 }];
        break;

      default:
        throw new Error(`Unknown type: ${type}`);
    }

    setElements(elementCopy, true);
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;

    if (tool == Tools.rectangle || tool == Tools.line || tool == Tools.pencil) {
      const id = elements.length;
      const newElement = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement);
      setAction("drawing");
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    }
  };

  const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;

    if (selectedElement) {
      const index = elements.length - 1;
      const { id, type } = elements[index];

      if (action === "drawing" && adjustmentRequired(type)) {
        const { x1, y1, x2, y2 } = adjustedCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
    }

    setAction("none");
  };

  return (
    <div>
      <ActionBar tool={tool} setTool={setTool} />
      <canvas
        id="canvas"
        height={canvasHeight}
        width={canvasWidth}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}
