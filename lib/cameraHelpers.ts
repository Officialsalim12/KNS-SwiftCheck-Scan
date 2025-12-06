import type { CameraDevice } from 'html5-qrcode';

export type CameraFacing = 'front' | 'back';

const normalizeLabel = (label?: string) => (label || '').toLowerCase();

export const detectCameraFacing = (label?: string): CameraFacing | 'unknown' => {
  const normalized = normalizeLabel(label);
  if (!normalized) return 'unknown';
  if (normalized.includes('back') || normalized.includes('rear') || normalized.includes('environment')) {
    return 'back';
  }
  if (normalized.includes('front') || normalized.includes('user') || normalized.includes('face')) {
    return 'front';
  }
  return 'unknown';
};

export const pickCameraIdByPreference = (devices: CameraDevice[], preference: CameraFacing): string | null => {
  if (!devices?.length) return null;

  const preferredDevice = devices.find((device) => detectCameraFacing(device.label) === preference);
  if (preferredDevice) {
    return preferredDevice.id;
  }

  return devices[0].id ?? null;
};

