import { cloudflareApi } from '../lib/cloudflare-api';

/**
 * Extracts the raw R2 object path from a proxied or direct R2 URL.
 * Works for both local development and production URL formats.
 */
export const extractR2PathFromUrl = (urlStr: string | null | undefined): string | null => {
  if (!urlStr) return null;
  const marker = '/api/media/file/';
  if (urlStr.includes(marker)) {
    const segment = urlStr.split(marker).pop();
    if (segment) {
      return decodeURIComponent(segment);
    }
  }
  return null;
};

/**
 * Deletes a file from Cloudflare R2 given its public URL.
 */
export const deleteR2FileByUrl = async (urlStr: string | null | undefined): Promise<boolean> => {
  if (!urlStr) return false;
  const r2Path = extractR2PathFromUrl(urlStr);
  if (!r2Path) return false;
  try {
    return await cloudflareApi.deleteFile(r2Path);
  } catch (err) {
    console.error(`[R2 Cleanup] Failed to delete file at path: ${r2Path}`, err);
    return false;
  }
};
