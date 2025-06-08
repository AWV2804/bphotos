import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { constructBackendUrl } from '../utils/backendurl';
import { useAuth } from '../AuthContext';

interface PhotoUploadProps {
  onUploadSuccess: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, userid } = useAuth();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!token || !userid) {
      setError('Please log in to upload photos');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('userId', userid);

        const backendUrl = await constructBackendUrl('/photos/upload');
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            Authorization: token,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
      onUploadSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  }, [token, userid, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    }
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the photos here ...</p>
            ) : (
              <p>Drag and drop photos here, or click to select files</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, GIF up to 10MB
          </p>
        </div>
      </div>
      
      {uploading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Uploading...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload; 