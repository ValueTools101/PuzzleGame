// All ambient sounds are synthesized right here on the device — nothing is
// downloaded, streamed, or recorded from a third party, so there is no
// licensing concern. Each sound is generated once, cached to a WAV file in
// the app's cache directory, and reused on every later app launch.
import * as FileSystem from 'expo-file-system';

export const SAMPLE_RATE = 22050;
const LOOP_SECONDS = 8;

function makePinkNoise(numSamples) {
  const out = new Float32Array(numSamples);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < numSamples; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    out[i] = pink * 0.11;
  }
  return out;
}

function makeBrownNoise(numSamples) {
  const out = new Float32Array(numSamples);
  let lastOut = 0;
  for (let i = 0; i < numSamples; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    out[i] = Math.max(-1, Math.min(1, lastOut * 3.5));
  }
  return out;
}

function makeRainTexture(numSamples, sampleRate) {
  const brown = makeBrownNoise(numSamples);
  const pink = makePinkNoise(numSamples);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.07 * t + Math.sin(t * 0.3));
    out[i] = brown[i] * 0.5 + pink[i] * 0.9 * envelope;
  }
  return out;
}

function makeWind(numSamples, sampleRate) {
  const pink = makePinkNoise(numSamples);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const gust = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.05 * t) * Math.sin(2 * Math.PI * 0.013 * t + 1.3);
    out[i] = pink[i] * (0.4 + 0.6 * Math.max(0, gust));
  }
  return out;
}

function makeTone(numSamples, sampleRate, freq) {
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const breathe = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.1 * t);
    out[i] = Math.sin(2 * Math.PI * freq * t) * 0.5 * breathe;
  }
  return out;
}

function makePop(sampleRate) {
  const duration = 0.18;
  const numSamples = Math.floor(sampleRate * duration);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 900 - 500 * (t / duration);
    const env = Math.exp(-t * 18);
    out[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.6;
  }
  return out;
}

function makeChime(sampleRate) {
  const duration = 1.6;
  const numSamples = Math.floor(sampleRate * duration);
  const out = new Float32Array(numSamples);
  const notes = [523.25, 659.25];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let v = 0;
    notes.forEach((f, idx) => {
      const start = idx * 0.15;
      if (t >= start) {
        const lt = t - start;
        v += Math.sin(2 * Math.PI * f * lt) * Math.exp(-lt * 2.2) * 0.35;
      }
    });
    out[i] = v;
  }
  return out;
}

function applyFadeEdges(samples, sampleRate, fadeMs = 30) {
  const fadeSamples = Math.floor((sampleRate * fadeMs) / 1000);
  for (let i = 0; i < fadeSamples && i < samples.length / 2; i++) {
    const g = i / fadeSamples;
    samples[i] *= g;
    samples[samples.length - 1 - i] *= g;
  }
}

function generatorFor(id) {
  const n = SAMPLE_RATE * LOOP_SECONDS;
  switch (id) {
    case 'rain': {
      const s = makeRainTexture(n, SAMPLE_RATE);
      applyFadeEdges(s, SAMPLE_RATE);
      return s;
    }
    case 'brown': {
      const s = makeBrownNoise(n);
      applyFadeEdges(s, SAMPLE_RATE);
      return s;
    }
    case 'wind': {
      const s = makeWind(n, SAMPLE_RATE);
      applyFadeEdges(s, SAMPLE_RATE);
      return s;
    }
    case 'tone-low':
      return makeTone(n, SAMPLE_RATE, 110);
    case 'tone-mid':
      return makeTone(n, SAMPLE_RATE, 220);
    case 'pop':
      return makePop(SAMPLE_RATE);
    case 'chime':
      return makeChime(SAMPLE_RATE);
    default:
      throw new Error('Unknown sound id: ' + id);
  }
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function encodeWav(floatSamples, sampleRate) {
  const numSamples = floatSamples.length;
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, floatSamples[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, s, true);
    offset += 2;
  }
  return new Uint8Array(buffer);
}

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function uint8ToBase64(bytes) {
  const len = bytes.length;
  const parts = new Array(Math.ceil(len / 3));
  let idx = 0;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;
    parts[idx++] =
      B64_CHARS[(triplet >> 18) & 0x3f] +
      B64_CHARS[(triplet >> 12) & 0x3f] +
      (i + 1 < len ? B64_CHARS[(triplet >> 6) & 0x3f] : '=') +
      (i + 2 < len ? B64_CHARS[triplet & 0x3f] : '=');
  }
  return parts.join('');
}

const SOUND_DIR = FileSystem.cacheDirectory + 'unwind-sounds/';

export async function getSoundFileUri(id) {
  const dirInfo = await FileSystem.getInfoAsync(SOUND_DIR);
  if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(SOUND_DIR, { intermediates: true });
  const fileUri = SOUND_DIR + id + '.wav';
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (fileInfo.exists) return fileUri;
  const floatSamples = generatorFor(id);
  const bytes = encodeWav(floatSamples, SAMPLE_RATE);
  const base64 = uint8ToBase64(bytes);
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return fileUri;
}
