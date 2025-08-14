'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

export default function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#000000');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageURL(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.Textbox('Edit me', {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: fontColor,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const handleDeleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (canvas && activeObject && !(activeObject as any).isEditing) {
      canvas.remove(activeObject);
      canvas.requestRenderAll();
    }
  };

  const handleExport = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas-export.png';
      link.click();
    }
  };

  useEffect(() => {
    if (!imageURL || !canvasRef.current) return;

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    fabric.Image.fromURL(imageURL, (img) => {
      if (!img) return;

      const width = img.width ?? 800;
      const height = img.height ?? 600;

      canvas.setWidth(width);
      canvas.setHeight(height);

      canvas.setBackgroundImage(img, () => {
        canvas.renderAll();
      });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = canvas.getActiveObject();
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        activeObject &&
        !(activeObject as any).isEditing
      ) {
        canvas.remove(activeObject);
        canvas.requestRenderAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [imageURL]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧠 Adomate Meme Editor</h2>

      <div style={{ marginBottom: '15px' }}>
        <input type="file" accept="image/png" onChange={handleImageUpload} />
      </div>

      {imageURL && (
        <div style={{ marginBottom: '15px' }}>
          <button onClick={handleAddText}>➕ Add Text</button>
          <button onClick={handleDeleteSelected} style={{ marginLeft: '10px' }}>🗑️ Delete</button>
          <button onClick={handleExport} style={{ marginLeft: '10px' }}>💾 Export Image</button>

          <div style={{ marginTop: '10px' }}>
            <label>
              Font Size:
              <input
                type="number"
                min="10"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                style={{ marginLeft: '10px', width: '60px' }}
              />
            </label>

            <label style={{ marginLeft: '20px' }}>
              Font Color:
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </label>
          </div>
        </div>
      )}

      {imageURL && <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />}
    </div>
  );
}
