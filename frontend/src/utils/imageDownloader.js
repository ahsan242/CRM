// src/utils/imageDownloader.js
export const downloadImage = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

export const downloadMultipleImages = async (urls, prefix = 'image') => {
  const files = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const file = await downloadImage(urls[i], `${prefix}-${i}-${Date.now()}.jpg`);
      files.push(file);
    } catch (error) {
      console.warn(`Failed to download image ${i}:`, error);
    }
  }
  
  return files;
};