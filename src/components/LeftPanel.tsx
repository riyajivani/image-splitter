import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Guide } from '../types';
import './Panels.css';

export const LeftPanel: React.FC = () => {
  const { setImage, image, imageDimensions, setGuides, addGuide } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          setImage(file, img, img.width, img.height, type);
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyGrid = (rows: number, cols: number) => {
    if (!image) return;
    const newGuides: Guide[] = [];
    
    // Horizontal guides (rows - 1 cuts)
    for (let i = 1; i < rows; i++) {
      newGuides.push({
        id: crypto.randomUUID(),
        type: 'horizontal',
        position: (imageDimensions.height / rows) * i
      });
    }
    
    // Vertical guides (cols - 1 cuts)
    for (let i = 1; i < cols; i++) {
      newGuides.push({
        id: crypto.randomUUID(),
        type: 'vertical',
        position: (imageDimensions.width / cols) * i
      });
    }
    
    setGuides(newGuides);
  };

  return (
    <div className="panel left-panel">
      <div className="section">
        <label className="label">Upload Image</label>
        <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
          Choose File
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }}
          accept="image/*" 
          onChange={handleFileUpload} 
        />
      </div>

      {image && (
        <>
          <div className="section mt-4">
            <label className="label">Manual Guides</label>
            <button onClick={() => addGuide({ type: 'vertical', position: imageDimensions.width / 2 })} className="btn btn-secondary">
              Add Vertical Guide
            </button>
            <button onClick={() => addGuide({ type: 'horizontal', position: imageDimensions.height / 2 })} className="btn btn-secondary">
              Add Horizontal Guide
            </button>
          </div>

          <div className="section mt-4">
            <label className="label">Smart Grids (Presets)</label>
            <div className="grid-buttons">
              <button onClick={() => applyGrid(2, 1)} className="btn btn-secondary grid-btn">2 (1x2)</button>
              <button onClick={() => applyGrid(1, 2)} className="btn btn-secondary grid-btn">2 (2x1)</button>
              <button onClick={() => applyGrid(3, 1)} className="btn btn-secondary grid-btn">3 (1x3)</button>
              <button onClick={() => applyGrid(1, 3)} className="btn btn-secondary grid-btn">3 (3x1)</button>
              <button onClick={() => applyGrid(2, 2)} className="btn btn-secondary grid-btn">4 (2x2)</button>
              <button onClick={() => applyGrid(3, 3)} className="btn btn-secondary grid-btn">9 (3x3)</button>
            </div>
          </div>
          
          <div className="instructions">
            <p>• Scroll to zoom</p>
            <p>• Click & drag background to pan</p>
            <p>• Drag guides to move</p>
            <p>• Double click guide to remove</p>
          </div>
        </>
      )}
    </div>
  );
};
