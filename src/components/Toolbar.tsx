import React from 'react';
import { useStore } from '../store/useStore';

export const Toolbar: React.FC = () => {
  const { image, imageDimensions, setZoom, setPan, clearGuides } = useStore();

  const handleFitImage = () => {
    if (!image) return;
    // container is approx window width minus 2 sidebars (320px each = 640px)
    const containerWidth = window.innerWidth - 640;
    const containerHeight = window.innerHeight - 60; // Toolbar height
    
    const scaleX = containerWidth / imageDimensions.width;
    const scaleY = containerHeight / imageDimensions.height;
    // 90% of max fit to leave a little padding
    const scale = Math.min(scaleX, scaleY) * 0.9; 

    setZoom(scale);
    
    // Center it
    const scaledWidth = imageDimensions.width * scale;
    const scaledHeight = imageDimensions.height * scale;
    setPan({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2,
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="toolbar">
      <h1 className="title-logo">Image Splitter Pro</h1>
      
      {image && (
        <div className="toolbar-actions">
          <button onClick={handleFitImage} className="btn-toolbar">
            Fit Image
          </button>
          <button onClick={handleResetZoom} className="btn-toolbar">
            Reset Zoom
          </button>
          <button onClick={clearGuides} className="btn-toolbar btn-danger">
            Clear Guides
          </button>
        </div>
      )}
    </div>
  );
};
