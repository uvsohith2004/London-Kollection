export type OptimizedVideoAsset = {
  webm: {
    key: string;
    url: string;
    sizeBytes?: number;
  };
  mp4: {
    key: string;
    url: string;
    sizeBytes?: number;
  };
  thumbnail: {
    key: string;
    url: string;
  };
  duration?: number;
  width?: number;
  height?: number;
  mimeType?: string;
};
