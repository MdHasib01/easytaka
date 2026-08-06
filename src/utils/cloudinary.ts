/**
 * Upload an image file or base64 data string directly to Cloudinary using signed upload.
 * Works independently of backend deployment status.
 */

const CLOUD_NAME = 'bmiez0ep';
const API_KEY = '724651262621461';
const API_SECRET = 'JyZ2syXQv01AoOR-94OHtkvjlj8';

async function sha1(str: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function uploadImageToCloudinary(fileOrBase64: File | string): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000).toString();
  const folder = 'easytaka/avatars';
  
  // Cloudinary signature requires parameters sorted alphabetically: folder, timestamp
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
  const signature = await sha1(stringToSign);

  const formData = new FormData();
  formData.append('file', fileOrBase64);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Image upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.secure_url;
}
