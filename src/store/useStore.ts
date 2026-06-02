import { create } from 'zustand';
import type { AppState } from '../types';

export const useStore = create<AppState>((set) => ({
  originalFile: null,
  image: null,
  imageDimensions: { width: 0, height: 0 },
  imageType: 'image/png',
  guides: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
  previewSlices: [],
  isPreviewOpen: false,
  setImage: (file, image, width, height, imageType) => set({ originalFile: file, image, imageDimensions: { width, height }, imageType, guides: [], zoom: 1, pan: { x: 0, y: 0 }, previewSlices: [] }),
  addGuide: (guide) => set((state) => ({ guides: [...state.guides, { ...guide, id: crypto.randomUUID() }], previewSlices: [] })),
  updateGuidePosition: (id, position) => set((state) => ({
    guides: state.guides.map(g => g.id === id ? { ...g, position } : g), previewSlices: []
  })),
  removeGuide: (id) => set((state) => ({ guides: state.guides.filter(g => g.id !== id), previewSlices: [] })),
  setGuides: (guides) => set({ guides, previewSlices: [] }),
  clearGuides: () => set({ guides: [], previewSlices: [] }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  setPreviewSlices: (slices) => set({ previewSlices: slices }),
  setIsPreviewOpen: (isOpen) => set({ isPreviewOpen: isOpen }),
}));
