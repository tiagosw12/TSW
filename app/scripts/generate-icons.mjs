// One-off icon generator: draws a flat clinical-monitor icon (near-black
// background, phosphor-green ECG trace) directly to PNG bytes via zlib, so
// we don't need an image library just to produce a few static app icons.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BG = [10, 14, 18]; // near-black clinical monitor background
const TRACE = [51, 217, 153]; // muted phosphor green

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function ecgY(x, size) {
  // Stylized single QRS-like spike centered in the icon, flat baseline otherwise.
  const mid = size / 2;
  const t = (x / size) * 4 - 2; // -2..2 across the icon
  const spike =
    Math.abs(t) < 0.35
      ? -Math.sign(t || 1) * Math.max(0, 1 - Math.abs(t) / 0.35) * (size * 0.32)
      : 0;
  const wobble = Math.sin((x / size) * Math.PI * 2) * size * 0.02;
  return mid + wobble - spike;
}

function drawPng(size) {
  const px = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      px[i] = BG[0];
      px[i + 1] = BG[1];
      px[i + 2] = BG[2];
      px[i + 3] = 255;
    }
  }
  // subtle grid, like chart paper
  const gridStep = Math.max(8, Math.floor(size / 12));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x % gridStep === 0 || y % gridStep === 0) {
        const i = (y * size + x) * 4;
        px[i] = Math.min(255, px[i] + 10);
        px[i + 1] = Math.min(255, px[i + 1] + 14);
        px[i + 2] = Math.min(255, px[i + 2] + 16);
      }
    }
  }
  // ECG trace, a few px thick
  const thickness = Math.max(2, Math.floor(size / 48));
  for (let x = 0; x < size; x++) {
    const y = Math.round(ecgY(x, size));
    for (let dy = -thickness; dy <= thickness; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= size) continue;
      const i = (yy * size + x) * 4;
      px[i] = TRACE[0];
      px[i + 1] = TRACE[1];
      px[i + 2] = TRACE[2];
      px[i + 3] = 255;
    }
  }

  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size * 4; x++) {
      raw[y * (size * 4 + 1) + 1 + x] = px[y * size * 4 + x];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL("../public/icons", import.meta.url), { recursive: true });
for (const size of [180, 192, 512]) {
  const buf = drawPng(size);
  writeFileSync(new URL(`../public/icons/icon-${size}.png`, import.meta.url), buf);
}
console.log("icons generated");
