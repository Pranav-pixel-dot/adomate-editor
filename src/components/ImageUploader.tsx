import React from 'react';

type Props = {
  onImageUpload: (url: string) => void;
};

export default function ImageUploader({ onImageUpload }: Props) {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.includes('image/png')) {
      alert("Please upload a PNG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        onImageUpload(reader.result.toString());
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label>Select a PNG Image: </label>
      <input type="file" accept="image/png" onChange={handleUpload} />
    </div>
  );
}
