'use client';

import { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage, FaSpinner } from 'react-icons/fa';

const ImageUpload = ({
  onImagesUploaded,
  onImageDeleted,
  existingImages = [],
  maxImages = 4,
  className = '',
  disabled = false,
  uploading: externalUploading = false
}) => {
  const [internalUploading, setInternalUploading] = useState(false);
  const uploading = externalUploading || internalUploading;
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    if (disabled || uploading) return;
    
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - existingImages.length;
    
    if (fileArray.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
      return;
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidFiles = fileArray.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Only JPEG, PNG, and WebP images are allowed.`);
      return;
    }

    // Validate file sizes (5MB max per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum file size is 5MB.`);
      return;
    }

    onImagesUploaded(fileArray);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleFileSelect(files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDeleteImage = (index) => {
    if (disabled || uploading) return;
    onImageDeleted(index);
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const remainingSlots = maxImages - existingImages.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {remainingSlots > 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <FaSpinner className="animate-spin text-blue-500" size={32} />
            ) : (
              <FaCloudUploadAlt className="text-gray-400" size={32} />
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-700">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </p>
              <p className="text-xs text-gray-500">
                {remainingSlots === 1 
                  ? '1 more image allowed' 
                  : `${remainingSlots} more images allowed`
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Drag & drop or click to select
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Images ({existingImages.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {existingImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                
                {/* Delete Button */}
                {!disabled && !uploading && (
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    aria-label="Delete image"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="truncate">{image.originalName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-blue-600">
            <FaSpinner className="animate-spin" />
            <span>Uploading images...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;













