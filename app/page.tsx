"use client";

import {
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
  MouseEvent,
} from "react";
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );

  useLayoutEffect(() => {
    setCanvasHeight(window.innerHeight);
    setCanvasWidth(window.innerWidth);
  }, []);

  console.log(elements);
  console.log(selectedElement);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      if (
        action === "writing" &&
        selectedElement &&
        selectedElement.id === element.id
      ) {
        return;
      }
      drawElement(roughCanvas, context, element);
    });
    context.restore();
  }, [elements, action, selectedElement]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing" && textArea && selectedElement) {
      setTimeout(() => {
        textArea.focus();
        textArea.value = selectedElement.text || "";
      }, 0);
    }
  }, [action, selectedElement]);

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

      case Tools.text:
        const canvas = document.getElementById("canvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
          throw new Error("Canvas element not found");
        }
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get 2D context from canvas");
        }
        if (!options) {
          throw new Error("No text options provided for text tool");
        }
        const textWidth = context.measureText(options.text).width;
        const textHeight = 24;
        elementCopy[id] = {
          ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type),
          text: options.text,
        };
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    setElements(elementCopy, true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    console.log("handleblur ran");
    if (selectedElement) {
      const { id, x1, y1, type } = selectedElement;

      const x2 = selectedElement.x2 || x1;
      const y2 = selectedElement.y2 || y1;

      setAction("none");
      setSelectedElement(null);
      updateElement(id, x1, y1, x2, y2, type, { text: event.target.value });
    } else {
      console.error("No element selected when handleBlur was called");
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;

    if (action === "writing") return;

    if (
      tool == Tools.rectangle ||
      tool == Tools.line ||
      tool == Tools.pencil ||
      tool == Tools.text
    ) {
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
      setAction(tool == Tools.text ? "writing" : "drawing");
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
    setSelectedElement(null);
  };

  return (
    <div>
      <ActionBar tool={tool} setTool={setTool} />
      {action === "writing" && (
        <textarea
          ref={textAreaRef}
          className="textArea"
          onBlur={handleBlur}
          style={{
            font: "24px sans-serif",
            top: selectedElement ? selectedElement.y1 : 0,
            left: selectedElement ? selectedElement.x1 : 0,
          }}
        />
      )}
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
