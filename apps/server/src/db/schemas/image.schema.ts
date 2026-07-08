export type OptimizedImageAsset = {
  avif?: {
    key: string;
    url: string;
    sizeBytes?: number;
  };
  webp?: {
    key: string;
    url: string;
    sizeBytes?: number;
  };
  width?: number;
  height?: number;
};
