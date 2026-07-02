export interface Mp3Meta {
  title: string;
  artist: string;
}

/**
 * Decodes a text frame based on the ID3v2 encoding byte.
 */
function decodeText(view: DataView, offset: number, length: number, encoding: number): string {
  if (length <= 0) return '';
  const bytes = new Uint8Array(view.buffer, view.byteOffset + offset, length);
  
  try {
    if (encoding === 0) {
      // ISO-8859-1 (Latin-1)
      const decoder = new TextDecoder('windows-1252');
      return decoder.decode(bytes);
    } else if (encoding === 1) {
      // UTF-16 with BOM
      if (bytes.length >= 2) {
        if (bytes[0] === 0xff && bytes[1] === 0xfe) {
          return new TextDecoder('utf-16le').decode(bytes.subarray(2));
        } else if (bytes[0] === 0xfe && bytes[1] === 0xff) {
          return new TextDecoder('utf-16be').decode(bytes.subarray(2));
        }
      }
      return new TextDecoder('utf-16').decode(bytes);
    } else if (encoding === 2) {
      // UTF-16BE without BOM
      return new TextDecoder('utf-16be').decode(bytes);
    } else if (encoding === 3) {
      // UTF-8
      return new TextDecoder('utf-8').decode(bytes);
    }
  } catch (err) {
    console.error('Error decoding ID3 text frame:', err);
  }
  
  // Fallback: simple ASCII/Latin1 string from char codes
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== 0) {
      str += String.fromCharCode(bytes[i]);
    }
  }
  return str;
}

/**
 * Fallback to parse title and artist from filename when ID3 tags are missing or invalid.
 */
export function parseMetaFromFilename(filename: string): Mp3Meta {
  // Strip extension
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  
  // Look for "Artist - Title" or "Artist-Title" format
  const parts = nameWithoutExt.split('-');
  if (parts.length > 1) {
    const artist = parts[0].trim();
    const title = parts.slice(1).join('-').trim();
    return {
      title: title || nameWithoutExt,
      artist: artist || 'Unknown',
    };
  }
  
  return {
    title: nameWithoutExt,
    artist: 'Unknown',
  };
}

/**
 * Reads the start of an MP3 file and extracts ID3v2 Title (TIT2) and Artist (TPE1) metadata.
 */
export function parseMp3Metadata(file: File): Promise<Mp3Meta> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    // Usually the ID3 header is in the first 128KB
    const slice = file.slice(0, 128 * 1024);
    
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        resolve(parseMetaFromFilename(file.name));
        return;
      }
      
      try {
        const view = new DataView(buffer);
        // ID3 header check (first 3 bytes must be "ID3" / 0x49 0x44 0x33)
        if (
          buffer.byteLength < 10 ||
          view.getUint8(0) !== 0x49 ||
          view.getUint8(1) !== 0x44 ||
          view.getUint8(2) !== 0x33
        ) {
          resolve(parseMetaFromFilename(file.name));
          return;
        }

        const majorVersion = view.getUint8(3);
        const flags = view.getUint8(5);
        
        // Size is 4 bytes synchsafe integer (7 bits per byte: 0xxxxxxx)
        const s0 = view.getUint8(6);
        const s1 = view.getUint8(7);
        const s2 = view.getUint8(8);
        const s3 = view.getUint8(9);
        const id3Size = ((s0 & 0x7f) << 21) | ((s1 & 0x7f) << 14) | ((s2 & 0x7f) << 7) | (s3 & 0x7f);

        let offset = 10;
        // Check for extended header flag (bit 6 of flags)
        if ((flags & 0x40) !== 0 && offset + 4 <= buffer.byteLength) {
          const extSize = view.getUint32(offset);
          if (majorVersion === 4) {
            // Synchsafe size in ID3v2.4 extended header
            const es0 = (extSize >> 24) & 0xff;
            const es1 = (extSize >> 16) & 0xff;
            const es2 = (extSize >> 8) & 0xff;
            const es3 = extSize & 0xff;
            const synchsafeExtSize = ((es0 & 0x7f) << 21) | ((es1 & 0x7f) << 14) | ((es2 & 0x7f) << 7) | (es3 & 0x7f);
            offset += synchsafeExtSize;
          } else {
            offset += 4 + extSize;
          }
        }

        let title = '';
        let artist = '';
        const limit = Math.min(offset + id3Size, buffer.byteLength);

        while (offset + 10 < limit) {
          // Read frame ID (4 characters)
          let frameId = '';
          for (let i = 0; i < 4; i++) {
            const charCode = view.getUint8(offset + i);
            if (charCode >= 32 && charCode <= 126) {
              frameId += String.fromCharCode(charCode);
            }
          }

          // If frame ID is not 4 alphanumeric chars, break (reached end of tags or corrupt frame)
          if (!/^[A-Z0-9]{4}$/.test(frameId)) {
            break;
          }

          // Read frame size
          let frameSize = 0;
          if (majorVersion === 4) {
            // ID3v2.4 uses synchsafe size for frames
            const fs0 = view.getUint8(offset + 4);
            const fs1 = view.getUint8(offset + 5);
            const fs2 = view.getUint8(offset + 6);
            const fs3 = view.getUint8(offset + 7);
            frameSize = ((fs0 & 0x7f) << 21) | ((fs1 & 0x7f) << 14) | ((fs2 & 0x7f) << 7) | (fs3 & 0x7f);
          } else {
            // ID3v2.3 uses regular 32-bit big-endian integer
            frameSize = view.getUint32(offset + 4);
          }

          if (frameSize <= 0 || offset + 10 + frameSize > limit) {
            break;
          }

          if (frameId === 'TIT2' || frameId === 'TPE1') {
            const encoding = view.getUint8(offset + 10);
            const textValue = decodeText(view, offset + 11, frameSize - 1, encoding);
            const cleanedText = textValue.replace(/\0+$/, '').trim();

            if (frameId === 'TIT2') {
              title = cleanedText;
            } else if (frameId === 'TPE1') {
              artist = cleanedText;
            }
          }

          offset += 10 + frameSize;
        }

        const fallback = parseMetaFromFilename(file.name);
        resolve({
          title: title || fallback.title,
          artist: artist || fallback.artist,
        });
      } catch (err) {
        console.error('Error parsing ID3 tags:', err);
        resolve(parseMetaFromFilename(file.name));
      }
    };

    reader.onerror = () => {
      resolve(parseMetaFromFilename(file.name));
    };

    reader.readAsArrayBuffer(slice);
  });
}
