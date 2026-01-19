
/**
 * Serviço para lidar com uploads diretamente para o Cloudinary.
 * Para usar, configure um "Unsigned Upload Preset" no painel do Cloudinary.
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  duration: number;
}

export const uploadVideoToCloudinary = async (
  file: File,
  cloudName: string,
  uploadPreset: string,
  onProgress: (percent: number) => void
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('resource_type', 'video');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Falha no upload para o Cloudinary'));
      }
    };

    xhr.onerror = () => reject(new Error('Erro de rede no Cloudinary'));
    xhr.send(formData);
  });
};

export const checkIsVertical = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.videoHeight > video.videoWidth);
    };
    video.src = URL.createObjectURL(file);
  });
};
