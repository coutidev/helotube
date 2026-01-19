
/**
 * Serviço para lidar com uploads diretamente para o Cloudinary.
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
  // Usar resource_type 'auto' às vezes ajuda em erros de rede dependendo da extensão do arquivo
  formData.append('resource_type', 'auto'); 

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Endpoint de upload para Cloudinary
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    
    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
        } else {
          const errorMsg = response.error?.message || 'Falha no upload';
          reject(new Error(errorMsg));
        }
      } catch (e) {
        reject(new Error('Servidor retornou uma resposta inválida.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Erro de Rede. Verifique sua internet, se o Cloud Name está correto ou se há um bloqueador de anúncios impedindo o envio.'));
    };

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
    video.onerror = () => {
      resolve(false);
    };
    video.src = URL.createObjectURL(file);
  });
};
