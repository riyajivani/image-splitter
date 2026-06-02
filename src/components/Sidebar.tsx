import React, { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { exportZip } from '../utils/imageSplitter';
import type { ExportFormat } from '../utils/imageSplitter';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { setImage, addGuide, image, imageDimensions, guides } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalFormat, setOriginalFormat] = useState('image/png');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('original');
  const [quality, setQuality] = useState(0.9);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFormat(file.type);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          setImage(img, img.width, img.height);
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVerticalGuide = () => {
    if (!image) return;
    addGuide({ type: 'vertical', position: imageDimensions.width / 2 });
  };

  const handleAddHorizontalGuide = () => {
    if (!image) return;
    addGuide({ type: 'horizontal', position: imageDimensions.height / 2 });
  };

  const handleExport = async () => {
    if (!image) return;
    setIsExporting(true);
    try {
      await exportZip(image, guides, imageDimensions, {
        format: exportFormat,
        quality,
        originalFormat,
      });
    } catch (e) {
      console.error(e);
      alert('Failed to export images. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const showQualitySlider = 
    exportFormat === 'jpeg' || 
    exportFormat === 'webp' || 
    (exportFormat === 'original' && (originalFormat === 'image/jpeg' || originalFormat === 'image/webp'));

  return (
    <div className="sidebar">
      <h1 className="title">Image Splitter Pro</h1>
      
      <div className="section">
        <label className="label">Upload Image</label>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-primary"
        >
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
          <div className="section">
            <label className="label">Guides</label>
            <button onClick={handleAddVerticalGuide} className="btn btn-secondary">
              Add Vertical Guide
            </button>
            <button onClick={handleAddHorizontalGuide} className="btn btn-secondary">
              Add Horizontal Guide
            </button>
          </div>
          
          <div className="section" style={{ marginTop: '16px' }}>
            <label className="label">Export Settings</label>
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="select-input"
            >
              <option value="original">Original Format</option>
              <option value="png">PNG</option>
              <option value="webp">WEBP</option>
              <option value="jpeg">JPEG</option>
            </select>

            {showQualitySlider && (
              <div>
                <div className="quality-header">
                  <span>Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1" 
                  value={quality} 
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="range-input"
                />
              </div>
            )}

            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="btn btn-accent"
              style={{ marginTop: '8px' }}
            >
              {isExporting ? 'Exporting...' : 'Export ZIP'}
            </button>
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
