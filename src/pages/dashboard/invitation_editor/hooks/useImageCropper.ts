import React, { useState, useMemo } from 'react';

export const useImageCropper = (
  cropperType: 'groom' | 'bride' | 'cover' | null,
  cropperImageSrc: string,
  onCropComplete: (base64: string, file: File) => void,
  onClose: () => void
) => {
  const [cropperZoom, setCropperZoom] = useState(1);
  const [cropperOffset, setCropperOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropperImgNaturalDim, setCropperImgNaturalDim] = useState({ w: 0, h: 0 });

  const maskW = 300;
  const maskH = cropperType === 'cover' ? 375 : 300;
  const targetW = cropperType === 'cover' ? 800 : 500;
  const targetH = cropperType === 'cover' ? 1000 : 500;

  const { baselineW, baselineH } = useMemo(() => {
    if (!cropperImgNaturalDim.w || !cropperImgNaturalDim.h) {
      return { baselineW: maskW, baselineH: maskH };
    }
    const imgRatio = cropperImgNaturalDim.w / cropperImgNaturalDim.h;
    const maskRatio = maskW / maskH;
    
    if (imgRatio > maskRatio) {
      return {
        baselineW: maskH * imgRatio,
        baselineH: maskH
      };
    } else {
      return {
        baselineW: maskW,
        baselineH: maskW / imgRatio
      };
    }
  }, [cropperImgNaturalDim, cropperType]);

  const handleCropperMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropperOffset.x,
      y: e.clientY - cropperOffset.y
    });
  };

  const handleCropperMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropperOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleCropperMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropperTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - cropperOffset.x,
        y: e.touches[0].clientY - cropperOffset.y
      });
    }
  };

  const handleCropperTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      setCropperOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleApplyCrop = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Gagal menginisialisasi context canvas 2D.');
      
      const currentZoom = Number(cropperZoom) || 1;
      const offsetX = Number(cropperOffset.x) || 0;
      const offsetY = Number(cropperOffset.y) || 0;
      const finalBaselineW = Number(baselineW) || maskW;
      const finalBaselineH = Number(baselineH) || maskH;
      
      canvas.width = targetW;
      canvas.height = targetH;
      
      const scaleFactor = targetW / maskW;
      const drawW = finalBaselineW * scaleFactor * currentZoom;
      const drawH = finalBaselineH * scaleFactor * currentZoom;
      const drawX = (targetW / 2) - (drawW / 2) + (offsetX * scaleFactor);
      const drawY = (targetH / 2) - (drawH / 2) + (offsetY * scaleFactor);
      
      if (!isFinite(drawW) || !isFinite(drawH) || !isFinite(drawX) || !isFinite(drawY)) {
        throw new Error('Dimensi gambar tidak valid.');
      }
      
      const img = new Image();
      img.src = cropperImageSrc;
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        
        canvas.toBlob((blob) => {
          if (blob && cropperType) {
            const croppedFile = new File([blob], `${cropperType}_photo.jpg`, { type: 'image/jpeg' });
            const base64Data = canvas.toDataURL('image/jpeg', 0.85);
            onCropComplete(base64Data, croppedFile);
          }
          onClose();
        }, 'image/jpeg', 0.95);
      };
    } catch (err: any) {
      console.error('Cropper error:', err);
      alert(`Gagal memotong gambar: ${err.message}`);
      onClose();
    }
  };

  return {
    cropperZoom,
    setCropperZoom,
    cropperOffset,
    isDragging,
    baselineW,
    baselineH,
    maskW,
    maskH,
    setCropperImgNaturalDim,
    handleCropperMouseDown,
    handleCropperMouseMove,
    handleCropperMouseUp,
    handleCropperTouchStart,
    handleCropperTouchMove,
    handleApplyCrop,
  };
};
