'use client';

import React, { useState, useEffect } from 'react';
import { getUserImages, createUserImage, deleteUserImage } from '@/lib/api';
import { UserImage } from '@/types/proposal';

interface ImageLibraryProps {
  onSelectImage: (image: UserImage) => void;
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({ onSelectImage }) => {
  const [images, setImages] = useState<UserImage[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const userImages = await getUserImages();
    setImages(userImages);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // This is a placeholder for your actual upload logic.
    // You would typically upload the file to a service like S3, Cloudinary, etc.
    // and get a URL back.
    const imageUrl = URL.createObjectURL(file);

    try {
      const newImage = await createUserImage({ url: imageUrl, tags: file.name });
      setImages([newImage, ...images]);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteUserImage(imageId);
        setImages(images.filter(img => img.id !== imageId));
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="image-upload" className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload Image'}
        </label>
        <input id="image-upload" type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {images.map(image => (
          <div key={image.id} className="relative group">
            <img src={image.url} alt={image.tags || 'User image'} className="w-full h-32 object-cover rounded-md" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onSelectImage(image)} className="px-3 py-1 bg-white text-black rounded-md text-sm mr-2">Select</button>
              <button onClick={() => handleDelete(image.id)} className="px-3 py-1 bg-red-500 text-white rounded-md text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageLibrary;
