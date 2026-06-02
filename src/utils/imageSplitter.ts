import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Guide, Slice } from '../types';

export type ExportFormat = 'original' | 'png' | 'webp' | 'jpeg';

export interface SplitOptions {
  format: ExportFormat;
  quality: number;
  originalFormat: string;
}

export async function bitmapToBlob(bitmap: ImageBitmap, format: string = 'image/png', quality: number = 1): Promise<Blob> {
  const isLossy = format === 'image/jpeg' || format === 'image/webp';

  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('No 2d context');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    
    const blobOptions: any = { type: format };
    if (isLossy) blobOptions.quality = quality;
    return await canvas.convertToBlob(blobOptions);
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('No 2d context');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    return new Promise((resolve, reject) => {
      const callback = (blob: Blob | null) => blob ? resolve(blob) : reject(new Error('toBlob failed'));
      if (isLossy) canvas.toBlob(callback, format, quality);
      else canvas.toBlob(callback, format);
    });
  }
}

export async function splitImage(
  originalFile: File,
  guides: Guide[],
  imageDimensions: { width: number; height: number }
): Promise<Slice[]> {
  const vGuides = guides.filter(g => g.type === 'vertical').map(g => Math.round(g.position)).sort((a, b) => a - b);
  const hGuides = guides.filter(g => g.type === 'horizontal').map(g => Math.round(g.position)).sort((a, b) => a - b);

  const uniqueVGuides = [...new Set(vGuides)].filter(p => p > 0 && p < imageDimensions.width);
  const uniqueHGuides = [...new Set(hGuides)].filter(p => p > 0 && p < imageDimensions.height);

  const xPoints = [0, ...uniqueVGuides, imageDimensions.width];
  const yPoints = [0, ...uniqueHGuides, imageDimensions.height];

  const slices: Slice[] = [];
  const bitmap = await createImageBitmap(originalFile, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });

  for (let row = 0; row < yPoints.length - 1; row++) {
    for (let col = 0; col < xPoints.length - 1; col++) {
      const x = xPoints[col];
      const y = yPoints[row];
      const width = xPoints[col + 1] - x;
      const height = yPoints[row + 1] - y;

      const sliceBitmap = await createImageBitmap(bitmap, x, y, width, height, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
      const blob = await bitmapToBlob(sliceBitmap, 'image/png');
      const previewUrl = URL.createObjectURL(blob);

      slices.push({
        id: crypto.randomUUID(),
        bitmap: sliceBitmap,
        previewUrl,
        row,
        col,
        width,
        height,
        customName: `slice_r${row + 1}_c${col + 1}`
      });
    }
  }

  bitmap.close();
  return slices;
}

export async function exportZip(
  slices: Slice[],
  options: SplitOptions
) {
  const zip = new JSZip();

  let mimeType = options.originalFormat;
  if (options.format === 'png') mimeType = 'image/png';
  if (options.format === 'webp') mimeType = 'image/webp';
  if (options.format === 'jpeg') mimeType = 'image/jpeg';

  let extension = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
  else if (mimeType.includes('webp')) extension = 'webp';
  else if (mimeType.includes('png')) extension = 'png';
  else if (mimeType.includes('gif')) extension = 'gif';
  
  for (const slice of slices) {
    const blob = await bitmapToBlob(slice.bitmap, mimeType, options.quality);
    const filename = `${slice.customName || `slice_r${slice.row+1}_c${slice.col+1}`}.${extension}`;
    zip.file(filename, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'split-images.zip');
}
