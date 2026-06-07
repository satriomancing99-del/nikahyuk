import React, { useState, useRef, useEffect } from 'react';
import { Template } from '../../../../types/database.types';
import { parseJsonContent, parseJsxContent, parseZipFile, FileInfo } from '../utils/templateParser';

export const useTemplateUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [globalDragActive, setGlobalDragActive] = useState(false);
  const [importType, setImportType] = useState<'zip' | 'json' | 'jsx' | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [draftJsxCode, setDraftJsxCode] = useState<string | null>(null);
  const [jsxWarnings, setJsxWarnings] = useState<string[]>([]);

  const [draftTemplate, setDraftTemplate] = useState<Partial<Template> | null>(null);
  const [draftFiles, setDraftFiles] = useState<FileInfo[]>([]);
  const [selectedDraftThumbnailFile, setSelectedDraftThumbnailFile] = useState<File | null>(null);
  const [customThumbnailPreview, setCustomThumbnailPreview] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const clearDraft = () => {
    setDraftTemplate(null);
    setDraftFiles([]);
    setImportType(null);
    setCustomThumbnailPreview('');
    setSelectedDraftThumbnailFile(null);
    setDraftJsxCode(null);
    setJsxWarnings([]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    setGlobalDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setGlobalDragActive(false);
    dragCounter.current = 0;
    setIsParsing(true);
    setParsingError(null);
    setDraftTemplate(null);
    setDraftFiles([]);
    setSelectedDraftThumbnailFile(null);
    setCustomThumbnailPreview('');
    setDraftJsxCode(null);
    setJsxWarnings([]);

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            const res = parseJsonContent(content, file.name, file.size);
            setImportType(res.importType);
            setDraftTemplate(res.draftTemplate);
            setDraftFiles(res.draftFiles);
          } catch (err: any) {
            setParsingError(err.message);
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsText(file);
      } else if (fileName.endsWith('.jsx')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            const res = parseJsxContent(content, file.name, file.size);
            setImportType(res.importType);
            setDraftTemplate(res.draftTemplate);
            setDraftFiles(res.draftFiles);
            setDraftJsxCode(res.draftJsxCode);
            setJsxWarnings(res.jsxWarnings);
          } catch (err: any) {
            setParsingError(err.message);
          } finally {
            setIsParsing(false);
          }
        };
        reader.readAsText(file);
      } else if (fileName.endsWith('.zip')) {
        const res = await parseZipFile(file);
        setImportType(res.importType);
        setDraftTemplate(res.draftTemplate);
        setDraftFiles(res.draftFiles);
        setDraftJsxCode(res.draftJsxCode);
        setJsxWarnings(res.jsxWarnings);
        setIsParsing(false);
      } else {
        throw new Error('Format file tidak didukung! Pastikan Anda mengunggah file berekstensi .zip, .json, atau .jsx.');
      }
    } catch (err: any) {
      setParsingError(err.message || 'Gagal menganalisis file.');
      setIsParsing(false);
    }
  };

  const handleCustomThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedDraftThumbnailFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        setCustomThumbnailPreview(res);
        if (draftTemplate) {
          setDraftTemplate(prev => prev ? ({ ...prev, thumbnail_url: res }) : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDraftFieldChange = (field: keyof Template, value: any) => {
    if (draftTemplate) {
      setDraftTemplate(prev => prev ? ({ ...prev, [field]: value }) : null);
    }
  };

  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      setGlobalDragActive(true);
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setGlobalDragActive(true);
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (
        dragCounter.current <= 0 ||
        e.relatedTarget === null ||
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        dragCounter.current = 0;
        setGlobalDragActive(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setGlobalDragActive(false);
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener('dragenter', handleGlobalDragEnter);
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragleave', handleGlobalDragLeave);
    window.addEventListener('drop', handleGlobalDrop);

    return () => {
      window.removeEventListener('dragenter', handleGlobalDragEnter);
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragleave', handleGlobalDragLeave);
      window.removeEventListener('drop', handleGlobalDrop);
    };
  }, [draftTemplate]);

  return {
    dragActive,
    globalDragActive,
    importType,
    parsingError,
    isParsing,
    draftJsxCode,
    jsxWarnings,
    draftTemplate,
    draftFiles,
    selectedDraftThumbnailFile,
    customThumbnailPreview,
    fileInputRef,
    setParsingError,
    clearDraft,
    handleDrag,
    handleDrop,
    handleFileInputChange,
    handleCustomThumbnailChange,
    handleDraftFieldChange,
    setDraftTemplate,
  };
};
