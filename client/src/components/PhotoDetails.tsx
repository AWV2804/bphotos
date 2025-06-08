import React, { useState } from "react";

interface PhotoDetailsProps {
  photo: {
    _id: string;
    filename: string;
    url?: string;
    dateTaken?: string;
    uploadedAt?: string;
    size?: number;
    tags?: string[];
    description?: string;
    isFavorite?: boolean;
    importantMetadata?: {
      Make?: string;
      Model?: string;
      Location?: {
        Latitude: number;
        Longitude: number;
      };
      Dimensions?: {
        width: number;
        height: number;
      };
    };
    fullMetadata?: any;
  } | null;
  onClose: () => void;
  onUpdateTags: (photoId: string, tags: string[]) => Promise<void>;
  onToggleFavorite: (photoId: string) => Promise<void>;
}

const PhotoDetails: React.FC<PhotoDetailsProps> = ({
  photo,
  onClose,
  onUpdateTags,
  onToggleFavorite,
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isEditingTags, setIsEditingTags] = useState(false);

  if (!photo) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString();
  };

  const formatSize = (size?: number) => {
    if (!size) return "Unknown";
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      const updatedTags = [...(photo.tags || []), newTag.trim()];
      await onUpdateTags(photo._id, updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = (photo.tags || []).filter((tag) => tag !== tagToRemove);
    await onUpdateTags(photo._id, updatedTags);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Photo Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Photo Preview */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error(`Image failed to load: ${photo.url}`);
                e.currentTarget.src = "/fallback-image.jpg";
              }}
            />
            <button
              onClick={() => onToggleFavorite(photo._id)}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 ${
                photo.isFavorite
                  ? "text-red-500 bg-white"
                  : "text-gray-400 bg-white hover:text-red-500"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill={photo.isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Basic Information */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Filename</dt>
                <dd className="mt-1 text-sm text-gray-900 break-all">{photo.filename}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date Taken</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(photo.dateTaken)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(photo.uploadedAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">File Size</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatSize(photo.size)}</dd>
              </div>
              {photo.importantMetadata?.Dimensions && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {photo.importantMetadata.Dimensions.width} x {photo.importantMetadata.Dimensions.height} pixels
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Camera Information */}
          {photo.importantMetadata?.Make && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Make</dt>
                  <dd className="mt-1 text-sm text-gray-900">{photo.importantMetadata.Make}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Model</dt>
                  <dd className="mt-1 text-sm text-gray-900">{photo.importantMetadata.Model}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Location */}
          {photo.importantMetadata?.Location && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {photo.importantMetadata.Location.Latitude}, {photo.importantMetadata.Location.Longitude}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Tags */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
              <button
                onClick={() => setIsEditingTags(!isEditingTags)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isEditingTags ? "Done" : "Edit"}
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {photo.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    {isEditingTags && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditingTags && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add a tag and press Enter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {photo.description && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-sm text-gray-600">{photo.description}</p>
            </div>
          )}

          {/* Full Details Button */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showFullDetails ? "Hide Full Details" : "Show Full Details"}
            </button>

            {showFullDetails && photo.fullMetadata && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Full EXIF Data</h3>
                <pre className="p-4 bg-gray-50 rounded-lg overflow-auto text-xs text-gray-700">
                  {JSON.stringify(photo.fullMetadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="flex space-x-3">
              <button
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => window.open(photo.url, '_blank')}
              >
                View Full Size
              </button>
              <button
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => {
                  // TODO: Implement delete functionality
                  console.log('Delete photo:', photo._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetails; 