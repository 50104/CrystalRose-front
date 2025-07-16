export const safeConvertToWebP = async (file) => {
  try {
    return await convertToWebP(file);
  } catch (e) {
    console.warn("WebP 변환 실패, 원본 사용:", e);
    return file;
  }
};

export const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          const webpFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: "image/webp" }
          );
          resolve(webpFile);
        }, "image/webp", quality);
      };
    };
    reader.readAsDataURL(file);
  });
};