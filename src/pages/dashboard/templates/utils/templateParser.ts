import JSZip from 'jszip';
import { Template } from '../../../../types/database.types';

export interface FileInfo {
  name: string;
  size: number;
  isFolder: boolean;
}

export interface ParseResult {
  importType: 'zip' | 'json' | 'jsx';
  draftTemplate: Partial<Template>;
  draftFiles: FileInfo[];
  draftJsxCode: string | null;
  jsxWarnings: string[];
}

export const scanJsxWarnings = (code: string): string[] => {
  const warnings: string[] = [];
  if (code.includes('mempelai.') && !code.includes('mempelai?.')) {
    warnings.push('⚠️ Properti `mempelai` dipanggil langsung tanpa optional chaining (?.). Ubah menjadi `mempelai?.groom_name` dsb.');
  }
  if ((code.includes('events[') || code.includes('events.')) && !code.includes('events?.')) {
    warnings.push('⚠️ Array `events` dipanggil mendadak. Sangat disarankan: `events?.[0]` atau `events?.find(...)` agar aman.');
  }
  if (code.includes('gifts.') && !code.includes('gifts?.')) {
    warnings.push('⚠️ Kado rekening `gifts` dideretkan langsung. Gunakan `gifts?.map(...)` untuk melindungi UI dari error.');
  }
  if (code.includes('gallery.') && !code.includes('gallery?.')) {
    warnings.push('⚠️ Foto galeri `gallery` dirender langsung. Gunakan `gallery?.map(...)`.');
  }
  if (code.includes('wishes.') && !code.includes('wishes?.')) {
    warnings.push('⚠️ Pesan para tamu `wishes` dirujuk mentah-mentah. Gunakan `wishes?.map(...)` atau `wishes || []`.');
  }
  return warnings;
};

export const parseJsonContent = (content: string, fileName: string, fileSize: number): ParseResult => {
  const parsed = JSON.parse(content);
  if (!parsed.name) {
    throw new Error('Konfigurasi JSON harus memiliki properti "name".');
  }
  const baseSlug = parsed.slug || parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return {
    importType: 'json',
    draftTemplate: {
      name: parsed.name,
      slug: baseSlug,
      category: parsed.category || 'Classic',
      price: Number(parsed.price) || 120000,
      thumbnail_url: parsed.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
      preview_url: parsed.preview_url || `/preview/${baseSlug}`,
      status: parsed.status || 'active'
    },
    draftFiles: [{ name: fileName, size: fileSize, isFolder: false }],
    draftJsxCode: null,
    jsxWarnings: []
  };
};

export const parseJsxContent = (content: string, fileName: string, fileSize: number): ParseResult => {
  const baseName = fileName.replace(/\.jsx$/i, '');
  const formattedName = baseName.replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').trim();
  const finalName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  const baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  let detectedCategory = 'Modern';
  const lowerCode = content.toLowerCase();
  if (lowerCode.includes('floral') || baseSlug.includes('floral')) {
    detectedCategory = 'Floral';
  } else if (lowerCode.includes('rustic') || baseSlug.includes('rustic')) {
    detectedCategory = 'Rustic';
  } else if (lowerCode.includes('minimalist') || baseSlug.includes('minimalist')) {
    detectedCategory = 'Minimalist';
  } else if (lowerCode.includes('islamic') || baseSlug.includes('islamic')) {
    detectedCategory = 'Islamic';
  } else if (lowerCode.includes('classic') || baseSlug.includes('classic')) {
    detectedCategory = 'Classic';
  }

  return {
    importType: 'jsx',
    draftTemplate: {
      name: finalName,
      slug: baseSlug,
      category: detectedCategory,
      price: 150000,
      thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
      preview_url: `/preview/${baseSlug}`,
      status: 'active',
      jsx_code: content
    },
    draftFiles: [{ name: fileName, size: fileSize, isFolder: false }],
    draftJsxCode: content,
    jsxWarnings: scanJsxWarnings(content)
  };
};

export const parseZipFile = async (file: File): Promise<ParseResult> => {
  const zip = await JSZip.loadAsync(file);
  const fileList: FileInfo[] = [];
  zip.forEach((relativePath, zipEntry) => {
    fileList.push({
      name: zipEntry.name,
      size: (zipEntry as any)._data?.uncompressedSize || 0,
      isFolder: zipEntry.dir
    });
  });

  const configEntry = zip.file('config.json') || zip.file('template.json') || Object.values(zip.files).find(f => f.name.endsWith('.json'));
  if (!configEntry) {
    throw new Error('File "config.json" atau "template.json" tidak ditemukan di dalam root ZIP.');
  }

  const configContentStr = await configEntry.async('string');
  const parsed = JSON.parse(configContentStr);
  if (!parsed.name) {
    throw new Error('Isi config.json di dalam ZIP harus menyertakan properti "name".');
  }

  const baseSlug = parsed.slug || parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let extractedThumbnailUrl = parsed.thumbnail_url || '';

  const thumbnailEntry = zip.file('thumbnail.jpg') || zip.file('thumbnail.png') || Object.values(zip.files).find(f => f.name.includes('thumbnail') && (f.name.endsWith('.jpg') || f.name.endsWith('.png') || f.name.endsWith('.jpeg')));
  if (thumbnailEntry) {
    const base64Data = await thumbnailEntry.async('base64');
    const ext = thumbnailEntry.name.endsWith('.png') ? 'png' : 'jpeg';
    extractedThumbnailUrl = `data:image/${ext};base64,${base64Data}`;
  }

  let extractedJsxCode = '';
  const jsxEntry = Object.values(zip.files).find(f => f.name.endsWith('.jsx'));
  if (jsxEntry) {
    extractedJsxCode = await jsxEntry.async('string');
  }

  return {
    importType: 'zip',
    draftTemplate: {
      name: parsed.name,
      slug: baseSlug,
      category: parsed.category || 'Classic',
      price: Number(parsed.price) || 150000,
      thumbnail_url: extractedThumbnailUrl || 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=400',
      preview_url: parsed.preview_url || `/preview/${baseSlug}`,
      status: parsed.status || 'active',
      jsx_code: extractedJsxCode || null
    },
    draftFiles: fileList,
    draftJsxCode: extractedJsxCode || null,
    jsxWarnings: extractedJsxCode ? scanJsxWarnings(extractedJsxCode) : []
  };
};
