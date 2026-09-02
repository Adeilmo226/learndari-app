/**
 * Recording format conversion.
 *
 * Browsers record in whatever they like — Chrome and Firefox produce WebM/Opus,
 * which iOS cannot decode at all. Everything is therefore re-encoded to plain
 * 16-bit WAV before upload, which every platform can play. Clips are a second or
 * two long, so the extra bytes are irrelevant.
 */

const TARGET_SAMPLE_RATE = 24_000;
const PEAK_TARGET = 0.9;

/** Formats iOS can play back. Anything else must be re-recorded. */
export function isPlayableOnDevice(mime: string): boolean {
  return /^audio\/(wav|x-wav|wave|vnd\.wave|mp4|m4a|x-m4a|aac|mpeg|mp3)\b/i.test(mime);
}

/** Preferred capture type — Safari gives us AAC directly, others fall back. */
export function preferredRecordingMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/**
 * Decodes a recorded blob and re-encodes it as mono 24 kHz WAV, with a gentle
 * peak normalisation so recordings made at different distances match.
 */
export async function toWavBlob(blob: Blob): Promise<Blob> {
  const bytes = await blob.arrayBuffer();
  const context = new AudioContext();

  try {
    const decoded = await context.decodeAudioData(bytes.slice(0));
    const frameCount = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE));
    const offline = new OfflineAudioContext(1, frameCount, TARGET_SAMPLE_RATE);

    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();

    const rendered = await offline.startRendering();
    return encodeWav(normalise(rendered.getChannelData(0)), TARGET_SAMPLE_RATE);
  } finally {
    void context.close();
  }
}

function normalise(samples: Float32Array): Float32Array {
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.abs(samples[i]);
    if (value > peak) peak = value;
  }
  // Leave very quiet clips alone rather than amplifying room noise.
  if (peak < 0.02 || peak >= PEAK_TARGET) return samples;

  const gain = PEAK_TARGET / peak;
  const output = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) output[i] = samples[i] * gain;
  return output;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeText = (offset: number, text: string): void => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // format: PCM
  view.setUint16(22, 1, true); // channels: mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}
