import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Download, Trash2, Sun, Contrast, Droplet, Palette, Image as ImageIcon, Scale, Maximize2, Lock, Unlock } from 'lucide-react';

interface ImageEditorProps {
  onSave: (imageData: string | null, position: 'before' | 'after') => void;
  onClose: () => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  initialImage?: string;
  initialPosition?: 'before' | 'after';
}

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sharpness: number;
  grayscale: number;
  width: number;
  height: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  onSave,
  onClose,
  isDarkMode,
  language,
  initialImage,
  initialPosition = 'before'
}) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [position, setPosition] = useState<'before' | 'after'>(initialPosition);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    sharpness: 0,
    grayscale: 0,
    width: 800,
    height: 600
  });
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    it: {
      title: "Editor Immagine",
      uploadImage: "Carica immagine",
      beforeParagraph: "Prima del paragrafo",
      afterParagraph: "Dopo il paragrafo",
      save: "Salva",
      cancel: "Annulla",
      downloadImage: "Scarica immagine",
      deleteImage: "Elimina immagine",
      confirmDelete: "Sei sicuro di voler eliminare l'immagine?",
      brightness: "Luminosità",
      contrast: "Contrasto",
      saturation: "Saturazione",
      hue: "Tonalità",
      sharpness: "Nitidezza",
      grayscale: "Bianco/Nero",
      dimensions: "Dimensioni",
      width: "Larghezza",
      height: "Altezza",
      lockAspectRatio: "Blocca proporzioni",
      unlockAspectRatio: "Sblocca proporzioni"
    },
    en: {
      title: "Image Editor",
      uploadImage: "Upload image",
      beforeParagraph: "Before paragraph",
      afterParagraph: "After paragraph",
      save: "Save",
      cancel: "Cancel",
      downloadImage: "Download image",
      deleteImage: "Delete image",
      confirmDelete: "Are you sure you want to delete the image?",
      brightness: "Brightness",
      contrast: "Contrast",
      saturation: "Saturation",
      hue: "Hue",
      sharpness: "Sharpness",
      grayscale: "Grayscale",
      dimensions: "Dimensions",
      width: "Width",
      height: "Height",
      lockAspectRatio: "Lock aspect ratio",
      unlockAspectRatio: "Unlock aspect ratio"
    }
  };

  const t = translations[language];

  useEffect(() => {
    applyImageAdjustments();
  }, [adjustments, image]);

  const applyImageAdjustments = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = adjustments.width;
      canvas.height = adjustments.height;
      
      // Apply base filters
      ctx.filter = `
        brightness(${adjustments.brightness}%)
        contrast(${adjustments.contrast}%)
        saturate(${adjustments.saturation}%)
        hue-rotate(${adjustments.hue}deg)
        grayscale(${adjustments.grayscale}%)
      `;
      
      // Draw the image
      ctx.drawImage(img, 0, 0, adjustments.width, adjustments.height);

      // Apply sharpness if needed
      if (adjustments.sharpness > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const factor = adjustments.sharpness / 100;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          data[i] = r + (255 - r) * factor;
          data[i + 1] = g + (255 - g) * factor;
          data[i + 2] = b + (255 - b) * factor;
        }

        ctx.putImageData(imageData, 0, 0);
      }
    };
    img.src = image;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width / img.height;
          setOriginalAspectRatio(ratio);
          setAdjustments(prev => ({
            ...prev,
            width: img.width,
            height: img.height
          }));
          setImage(e.target?.result as string);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    if (aspectRatioLocked) {
      if (dimension === 'width') {
        setAdjustments(prev => ({
          ...prev,
          width: value,
          height: Math.round(value / originalAspectRatio)
        }));
      } else {
        setAdjustments(prev => ({
          ...prev,
          height: value,
          width: Math.round(value * originalAspectRatio)
        }));
      }
    } else {
      setAdjustments(prev => ({
        ...prev,
        [dimension]: value
      }));
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      onSave(imageData, position);
    }
  };

  const handleDeleteImage = () => {
    if (window.confirm(t.confirmDelete)) {
      onSave(null, position);
      onClose();
    }
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageData;
      link.download = 'image.png';
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#111827] rounded-lg p-8 max-w-5xl w-full text-white border border-white border-opacity-20 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <canvas
              ref={canvasRef}
              className="border border-gray-600 w-full"
            />
          </div>

          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            >
              <Upload size={20} className="mr-2" />
              {t.uploadImage}
            </button>

            {/* Image Adjustments */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <Sun size={16} className="mr-2" />
                  {t.brightness}
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.brightness}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <Contrast size={16} className="mr-2" />
                  {t.contrast}
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.contrast}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <Droplet size={16} className="mr-2" />
                  {t.saturation}
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <Palette size={16} className="mr-2" />
                  {t.hue}
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={adjustments.hue}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, hue: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <ImageIcon size={16} className="mr-2" />
                  {t.sharpness}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.sharpness}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, sharpness: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <Scale size={16} className="mr-2" />
                  {t.grayscale}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustments.grayscale}
                  onChange={(e) => setAdjustments(prev => ({ ...prev, grayscale: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Maximize2 size={16} className="mr-2" />
                    {t.dimensions}
                  </span>
                  <button
                    onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    {aspectRatioLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm">{t.width}</label>
                    <input
                      type="number"
                      value={adjustments.width}
                      onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
                      className="w-full p-1 bg-gray-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm">{t.height}</label>
                    <input
                      type="number"
                      value={adjustments.height}
                      onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
                      className="w-full p-1 bg-gray-700 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Posizione immagine:</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="before"
                    checked={position === 'before'}
                    onChange={() => setPosition('before')}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">{t.beforeParagraph}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="after"
                    checked={position === 'after'}
                    onChange={() => setPosition('after')}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2">{t.afterParagraph}</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={handleDownloadImage}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                disabled={!image}
              >
                <Download size={20} className="mr-2" />
                {t.downloadImage}
              </button>
              <button
                onClick={handleDeleteImage}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                disabled={!image}
              >
                <Trash2 size={20} className="mr-2" />
                {t.deleteImage}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!image}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;