import React from 'react';
import { ImageAdjustments, Translations } from '../types';

interface ImageControlsProps {
  imageAdjustments: ImageAdjustments;
  onAdjustment: (key: keyof ImageAdjustments, value: number | boolean) => void;
  t: Translations;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  imageAdjustments,
  onAdjustment,
  t
}) => {
  return (
    <div className="absolute bottom-16 right-4 w-64 bg-[#0F2744] rounded-lg shadow-lg border border-[#1E3A5F] overflow-hidden">
      <div className="p-3 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-xs font-medium">{t.imageControls.contrast}</label>
          <input
            type="range"
            min="0"
            max="200"
            value={imageAdjustments.contrast}
            onChange={(e) => onAdjustment('contrast', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1E3A5F] rounded-full appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-xs font-medium">{t.imageControls.transparency}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={imageAdjustments.transparency}
            onChange={(e) => onAdjustment('transparency', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1E3A5F] rounded-full appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-xs font-medium">{t.imageControls.blackAndWhite}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={imageAdjustments.blackAndWhite}
            onChange={(e) => onAdjustment('blackAndWhite', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1E3A5F] rounded-full appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-xs font-medium">{t.imageControls.sharpness}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={imageAdjustments.sharpness}
            onChange={(e) => onAdjustment('sharpness', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1E3A5F] rounded-full appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-xs font-medium">{t.imageControls.brightness}</label>
          <input
            type="range"
            min="0"
            max="200"
            value={imageAdjustments.brightness}
            onChange={(e) => onAdjustment('brightness', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1E3A5F] rounded-full appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-white text-xs font-medium">{t.imageControls.dimensions}</label>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={imageAdjustments.maintainAspectRatio}
                onChange={(e) => onAdjustment('maintainAspectRatio', e.target.checked)}
                className="w-3.5 h-3.5"
              />
              <span className="text-white text-xs">{t.imageControls.maintainRatio}</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={Math.round(imageAdjustments.width)}
              onChange={(e) => onAdjustment('width', Number(e.target.value))}
              className="w-full bg-[#1E3A5F] text-white px-2 py-1 rounded text-xs"
            />
            <span className="text-white">×</span>
            <input
              type="number"
              value={Math.round(imageAdjustments.height)}
              onChange={(e) => onAdjustment('height', Number(e.target.value))}
              className="w-full bg-[#1E3A5F] text-white px-2 py-1 rounded text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
