import { useState } from "react";
import Cropper from "react-easy-crop";

export default function ImageCropperModal({ file, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(URL.createObjectURL(file), croppedAreaPixels);
    onConfirm(croppedBlob);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <Cropper
          image={URL.createObjectURL(file)}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
        <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        <div className="modal-actions">
          <button onClick={handleConfirm}>확인</button>
          <button onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
}

async function getCroppedImg(imageSrc, crop, mimeType = "image/png") {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, crop.width, crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas toBlob failed"));
        return;
      }
      resolve(blob);
    }, mimeType);
  });
}
