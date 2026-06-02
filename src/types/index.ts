export type Guide = {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
};

export interface Slice {
  id: string;
  bitmap: ImageBitmap;
  previewUrl: string;
  row: number;
  col: number;
  width: number;
  height: number;
  customName: string;
}

export type AppState = {
  originalFile: File | null;
  image: HTMLImageElement | null;
  imageDimensions: { width: number; height: number };
  imageType: string;
  guides: Guide[];
  zoom: number;
  pan: { x: number; y: number };
  previewSlices: Slice[];
  isPreviewOpen: boolean;
  setImage: (file: File, img: HTMLImageElement, width: number, height: number, type: string) => void;
  addGuide: (guide: Omit<Guide, 'id'>) => void;
  updateGuidePosition: (id: string, position: number) => void;
  removeGuide: (id: string) => void;
  setGuides: (guides: Guide[]) => void;
  clearGuides: () => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setPreviewSlices: (slices: Slice[]) => void;
  setIsPreviewOpen: (isOpen: boolean) => void;
};
