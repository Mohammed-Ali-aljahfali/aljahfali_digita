// Pure byte validation shared by the edge endpoint and isolated Node tests.
// SVG, PDF, HTML and renamed files are intentionally unsupported.
export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const ascii = (bytes, offset, count) => String.fromCharCode(...bytes.subarray(offset, offset + count));
const invalid = () => { throw new Error('INVALID_RECEIPT_IMAGE'); };
function dimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      width > 16384 || height > 16384 || width * height > 40000000) invalid();
  return { width, height };
}
export function inspectReceiptImage(bytes, declaredType) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 16 || bytes.byteLength > MAX_RECEIPT_BYTES) invalid();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let type; let size;
  if (bytes[0] === 137 && ascii(bytes, 1, 3) === 'PNG' && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) {
    type = 'image/png'; let offset = 8; let hasImage = false; let ended = false;
    if (bytes.length < 45 || view.getUint32(8) !== 13 || ascii(bytes, 12, 4) !== 'IHDR') invalid();
    size = dimensions(view.getUint32(16), view.getUint32(20));
    while (offset + 12 <= bytes.length) {
      const length = view.getUint32(offset); const chunk = ascii(bytes, offset + 4, 4);
      if (length > bytes.length - offset - 12) invalid();
      if (chunk === 'IDAT' && length > 0) hasImage = true;
      offset += length + 12;
      if (chunk === 'IEND') { if (length !== 0 || offset !== bytes.length) invalid(); ended = true; break; }
    }
    if (!hasImage || !ended) invalid();
  } else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    type = 'image/jpeg';
    if (bytes.at(-2) !== 255 || bytes.at(-1) !== 217) invalid();
    let offset = 2; let scan = false;
    const frameMarkers = new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) invalid();
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 0xda) { scan = true; break; }
      if (marker === 0xd9) break;
      if (marker === 0x01 || marker >= 0xd0 && marker <= 0xd7) continue;
      if (offset + 2 > bytes.length) invalid();
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) invalid();
      if (frameMarkers.has(marker)) {
        if (length < 8) invalid();
        size = dimensions(view.getUint16(offset + 5), view.getUint16(offset + 3));
      }
      offset += length;
    }
    if (!size || !scan) invalid();
  } else if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    type = 'image/webp';
    if (view.getUint32(4, true) + 8 !== bytes.length) invalid();
    let offset = 12; let hasImage = false;
    while (offset + 8 <= bytes.length) {
      const chunk = ascii(bytes, offset, 4); const length = view.getUint32(offset + 4, true); const data = offset + 8;
      if (length > bytes.length - data) invalid();
      if (chunk === 'VP8X') {
        if (length < 10) invalid();
        const width = bytes[data + 4] | bytes[data + 5] << 8 | bytes[data + 6] << 16;
        const height = bytes[data + 7] | bytes[data + 8] << 8 | bytes[data + 9] << 16;
        size = dimensions(width + 1, height + 1);
        // Animated images are not needed for payment evidence.
        if (bytes[data] & 2) invalid();
      } else if (chunk === 'VP8 ') {
        if (length < 10 || bytes[data + 3] !== 0x9d || bytes[data + 4] !== 0x01 || bytes[data + 5] !== 0x2a) invalid();
        size = size || dimensions(view.getUint16(data + 6,true) & 0x3fff,view.getUint16(data + 8,true) & 0x3fff); hasImage = true;
      } else if (chunk === 'VP8L') {
        if (length < 5 || bytes[data] !== 0x2f) invalid();
        const bits = view.getUint32(data + 1, true);
        size = size || dimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1); hasImage = true;
      }
      offset = data + length + (length % 2);
    }
    if (offset !== bytes.length || !hasImage || !size) invalid();
  } else invalid();
  if (declaredType !== type) invalid();
  return { type, ...size, bytes: bytes.byteLength };
}
