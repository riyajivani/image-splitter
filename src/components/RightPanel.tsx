import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { exportZip, splitImage } from '../utils/imageSplitter';
import type { ExportFormat } from '../utils/imageSplitter';
import './Panels.css';

export const RightPanel: React.FC = () => {
  const { originalFile, image, imageDimensions, imageType, guides, previewSlices, setPreviewSlices, setIsPreviewOpen } = useStore();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('original');
  const [quality, setQuality] = useState(0.9);
  const [isExporting, setIsExporting] = useState(false);

  if (!image) {
    return (
      <div className="panel right-panel empty-panel">
        <p>Upload an image to see statistics and export options.</p>
      </div>
    );
  }

  const handlePreview = async () => {
    if (!originalFile) return;
    setIsExporting(true);
    try {
      if (previewSlices.length === 0) {
        const slices = await splitImage(originalFile, guides, imageDimensions);
        setPreviewSlices(slices);
      }
      setIsPreviewOpen(true);
    } catch (e) {
      console.error(e);
      alert('Failed to generate preview.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    if (!originalFile) return;
    setIsExporting(true);
    try {
      let slicesToExport = previewSlices;
      if (slicesToExport.length === 0) {
        slicesToExport = await splitImage(originalFile, guides, imageDimensions);
        setPreviewSlices(slicesToExport); // cache them
      }

      await exportZip(slicesToExport, {
        format: exportFormat,
        quality,
        originalFormat: imageType,
      });
    } catch (e) {
      console.error(e);
      alert('Failed to export images. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  // Ensure guides within bounds are counted correctly
  const vGuidesCount = [...new Set(guides.filter(g => g.type === 'vertical').map(g => Math.round(g.position)))].filter(p => p > 0 && p < imageDimensions.width).length;
  const hGuidesCount = [...new Set(guides.filter(g => g.type === 'horizontal').map(g => Math.round(g.position)))].filter(p => p > 0 && p < imageDimensions.height).length;
  
  const totalSlices = (vGuidesCount + 1) * (hGuidesCount + 1);

  const showQualitySlider = 
    exportFormat === 'jpeg' || 
    exportFormat === 'webp' || 
    (exportFormat === 'original' && (imageType === 'image/jpeg' || imageType === 'image/webp'));

  return (
    <div className="panel right-panel">
      <div className="section stats-section">
        <label className="label">Statistics</label>
        <div className="stat-row">
          <span className="stat-label">Dimensions:</span>
          <span className="stat-value">{imageDimensions.width} x {imageDimensions.height}px</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Vertical Guides:</span>
          <span className="stat-value">{vGuidesCount}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Horizontal Guides:</span>
          <span className="stat-value">{hGuidesCount}</span>
        </div>
        <div className="stat-row highlight">
          <span className="stat-label">Total Slices:</span>
          <span className="stat-value">{totalSlices}</span>
        </div>
      </div>
      
      <div className="section mt-4">
        <label className="label">Export Settings</label>
        <select 
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
          className="select-input mb-3"
        >
          <option value="original">Original Format</option>
          <option value="png">PNG</option>
          <option value="webp">WEBP</option>
          <option value="jpeg">JPEG</option>
        </select>

        {(exportFormat === 'jpeg' || (exportFormat === 'original' && imageType === 'image/jpeg')) && (
          <div className="warning-box">
            Warning: JPEG format does not support transparency. Transparent pixels will be flattened.
          </div>
        )}

        {showQualitySlider && (
          <div className="mb-3">
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
          onClick={handlePreview}
          disabled={isExporting}
          className="btn btn-primary mt-2"
        >
          {isExporting ? 'Generating...' : 'Preview & Edit Slices'}
        </button>

        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-accent mt-2"
        >
          {isExporting ? 'Exporting...' : 'Export ZIP'}
        </button>
      </div>
    </div>
  );
};
