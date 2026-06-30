import React, { useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useImageCropper } from '../hooks/useImageCropper';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropperType: 'groom' | 'bride' | 'cover' | null;
  cropperImageSrc: string;
  onCropComplete: (base64: string, file: File) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  cropperType,
  cropperImageSrc,
  onCropComplete,
}) => {
  const {
    cropperZoom, setCropperZoom, cropperOffset, isDragging,
    baselineW, baselineH, maskW, maskH, setCropperImgNaturalDim,
    handleCropperMouseDown, handleCropperMouseMove, handleCropperMouseUp,
    handleCropperTouchStart, handleCropperTouchMove, handleApplyCrop
  } = useImageCropper(cropperType, cropperImageSrc, onCropComplete, onClose);

  useEffect(() => {
    if (isOpen && cropperImageSrc) {
      const tempImg = new Image();
      tempImg.onload = () => {
        setCropperImgNaturalDim({ w: tempImg.width, h: tempImg.height });
      };
      tempImg.src = cropperImageSrc;
    }
  }, [isOpen, cropperImageSrc]);

  if (!isOpen || !cropperType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 p-6 z-10 flex flex-col items-center animate-in scale-in duration-200">
        <h3 className="text-base font-extrabold text-gray-900 mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" /> Sesuaikan & Posisikan Foto
        </h3>
        <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
          Seret/geser foto untuk mengatur posisinya, dan gunakan slider di bawah untuk memperbesar atau mengecilkan agar pas dengan desain template.
        </p>
        
        <div 
          className="relative border-4 border-gray-100 bg-gray-50 overflow-hidden shadow-inner flex items-center justify-center cursor-move"
          style={{ 
            width: `${maskW}px`, 
            height: `${maskH}px`,
            borderRadius: cropperType === 'cover' ? '24px' : '9999px'
          }}
          onMouseDown={handleCropperMouseDown}
          onMouseMove={handleCropperMouseMove}
          onMouseUp={handleCropperMouseUp}
          onMouseLeave={handleCropperMouseUp}
          onTouchStart={handleCropperTouchStart}
          onTouchMove={handleCropperTouchMove}
          onTouchEnd={handleCropperMouseUp}
        >
          {cropperType !== 'cover' && (
            <div className="absolute inset-0 border-2 border-primary-500/30 rounded-full z-10 pointer-events-none" />
          )}
          
          <img 
            src={cropperImageSrc} 
            alt="Cropping item"
            className="select-none pointer-events-none max-w-none"
            style={{
              width: `${baselineW}px`,
              height: `${baselineH}px`,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${cropperOffset.x}px), calc(-50% + ${cropperOffset.y}px)) scale(${cropperZoom})`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          />
        </div>
        
        <div className="w-full mt-6 space-y-2 px-4">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>Perkecil</span>
            <span>Zoom: {Math.round(cropperZoom * 100)}%</span>
            <span>Perbesar</span>
          </div>
          <input 
            type="range"
            min="1"
            max="4"
            step="0.05"
            value={cropperZoom}
            onChange={(e) => setCropperZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
          />
        </div>
        
        <div className="w-full flex items-center justify-end gap-3 mt-8 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleApplyCrop}
            className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Terapkan & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
