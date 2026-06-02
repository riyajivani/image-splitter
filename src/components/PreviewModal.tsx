import React, { useState } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useStore } from '../store/useStore';
import { bitmapToBlob } from '../utils/imageSplitter';
import './PreviewModal.css';

export const PreviewModal: React.FC = () => {
  const { previewSlices, isPreviewOpen, setIsPreviewOpen, setPreviewSlices } = useStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  
  if (!isPreviewOpen) return null;

  const handleEditClick = (idx: number) => {
    setEditingIndex(idx);
    setCrop(undefined); // Reset crop state
  };

  const handleSaveCrop = async () => {
    if (editingIndex === null || !imageRef) {
      setEditingIndex(null);
      return;
    }

    if (!crop || crop.width === 0 || crop.height === 0) {
      setEditingIndex(null); // No crop applied, just return
      return;
    }
    
    try {
      const slice = previewSlices[editingIndex];
      const scaleX = imageRef.naturalWidth / imageRef.width;
      const scaleY = imageRef.naturalHeight / imageRef.height;

      const sx = crop.x * scaleX;
      const sy = crop.y * scaleY;
      const sWidth = crop.width * scaleX;
      const sHeight = crop.height * scaleY;

      // Crop the ImageBitmap directly
      const croppedBitmap = await createImageBitmap(slice.bitmap, sx, sy, sWidth, sHeight, {
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none'
      });

      // Close the old bitmap to prevent memory leaks
      slice.bitmap.close();

      const newBlob = await bitmapToBlob(croppedBitmap, 'image/png');
      const newPreviewUrl = URL.createObjectURL(newBlob);

      const updatedSlices = [...previewSlices];
      updatedSlices[editingIndex] = {
        ...slice,
        bitmap: croppedBitmap,
        previewUrl: newPreviewUrl,
        width: Math.round(sWidth),
        height: Math.round(sHeight)
      };
      
      setPreviewSlices(updatedSlices);
    } catch(e) {
      console.error(e);
      alert('Failed to crop');
    }
    setEditingIndex(null);
  };

  const handleNameChange = (idx: number, newName: string) => {
    const updated = [...previewSlices];
    updated[idx].customName = newName;
    setPreviewSlices(updated);
  };

  const handleSaveAndClose = () => {
    setIsPreviewOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="title">{editingIndex !== null ? 'Crop Slice' : 'Preview & Edit Slices'}</h2>
          <button className="close-btn" onClick={() => setIsPreviewOpen(false)}>×</button>
        </div>
        
        {editingIndex !== null ? (
          <div className="crop-editor">
            <p className="crop-instructions">Drag to crop. Original transparency and quality will be preserved.</p>
            <div className="crop-container">
               <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                 <img src={previewSlices[editingIndex].previewUrl} onLoad={e => setImageRef(e.currentTarget)} alt="Crop preview" className="crop-image" />
               </ReactCrop>
            </div>
            <div className="modal-actions-row">
              <button className="btn btn-secondary" onClick={() => setEditingIndex(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCrop}>Save Crop</button>
            </div>
          </div>
        ) : (
          <>
            <div className="slices-grid">
              {previewSlices.map((slice, idx) => (
                <div key={slice.id} className="slice-card">
                   <div className="slice-img-container" onClick={() => handleEditClick(idx)}>
                      <img src={slice.previewUrl} alt={`Slice ${idx}`} />
                      <div className="slice-edit-overlay">Click to Crop</div>
                   </div>
                   <div className="slice-info">
                     <input 
                       type="text" 
                       value={slice.customName} 
                       onChange={(e) => handleNameChange(idx, e.target.value)}
                       className="name-input"
                       title="Rename slice"
                     />
                     <div className="slice-meta">
                       {slice.width} x {slice.height}px
                     </div>
                   </div>
                </div>
              ))}
            </div>
            <div className="modal-actions-row">
              <button className="btn btn-accent" onClick={handleSaveAndClose} style={{ padding: '12px 24px', fontSize: '16px' }}>
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
