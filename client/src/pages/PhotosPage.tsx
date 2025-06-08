import React, { useState, useEffect } from "react";
import { constructBackendUrl } from "../utils/backendurl";
import { useAuth } from "../AuthContext";
import PhotoUpload from "../components/PhotoUpload";
import PhotoDetails from "../components/PhotoDetails";
import ViewControls from "../components/ViewControls";
import BulkActions from "../components/BulkActions";
import HamburgerIcon from '../components/HamburgerIcon';

interface Photo {
  _id: string;
  filename: string;
  gridFSFileId: string;
  contentType: string;
  isFavorite?: boolean;
  url?: string;
  dateTaken?: string;
  uploadedAt?: string;
  size?: number;
  tags?: string[];
  description?: string;
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
}

const PhotosPage: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'dateTaken'>('dateTaken');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { token, userid } = useAuth();
  const [zoom, setZoom] = useState(3); // 3 (min, 3 cols) to 6 (max, 6 cols)

  // Map zoom value to Tailwind grid-cols class (min 3, max 6)
  const gridColsClass = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  }[zoom];

  const fetchPhotos = async () => {
    if (!token || !userid) {
      setError("Unauthorized. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const backendUrl = await constructBackendUrl(`/photos?userId=${userid}`);
      const response = await fetch(backendUrl, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch photo metadata");
      }

      const photoData: Photo[] = await response.json();

      const photosWithUrls = await Promise.all(
        photoData.map(async (photo) => {
          try {
            const photoUrl = await constructBackendUrl(`/photos/download/${photo.gridFSFileId}`);
            const imgResponse = await fetch(photoUrl, {
              headers: { Authorization: token },
            });

            if (!imgResponse.ok) {
              console.error(`Failed to load image: ${photo.filename}`);
              return { ...photo, url: "/fallback-image.jpg" };
            }

            const blob = await imgResponse.blob();
            const objectURL = URL.createObjectURL(blob);
            return { ...photo, url: objectURL };
          } catch (error) {
            console.error("Error fetching image:", error);
            return { ...photo, url: "/fallback-image.jpg" };
          }
        })
      );

      setPhotos(photosWithUrls);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [token, userid]);

  const handleUploadSuccess = () => {
    fetchPhotos();
  };

  const handlePhotoClick = (photo: Photo) => {
    if (isSelectionMode) {
      handlePhotoSelect(photo._id);
    } else {
      setSelectedPhoto(photo);
    }
  };

  const handleCloseDetails = () => {
    setSelectedPhoto(null);
  };

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(photoId)) {
        newSelected.delete(photoId);
      } else {
        newSelected.add(photoId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    setSelectedPhotos(new Set(photos.map((photo) => photo._id)));
  };

  const handleClearSelection = () => {
    setSelectedPhotos(new Set());
  };

  const handleDeleteSelected = async () => {
    if (!token) return;

    try {
      const deletePromises = await Promise.all(
        Array.from(selectedPhotos).map(async (photoId) => {
          const url = await constructBackendUrl(`/photos/${photoId}`);
          return fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: token,
            },
          });
        })
      );

      await Promise.all(deletePromises);
      setSelectedPhotos(new Set());
      fetchPhotos();
    } catch (error) {
      console.error("Error deleting photos:", error);
    }
  };

  const handleDownloadSelected = async () => {
    if (!token) return;

    try {
      const downloadPromises = Array.from(selectedPhotos).map(async (photoId) => {
        const photo = photos.find((p) => p._id === photoId);
        if (!photo?.url) return;

        const response = await fetch(photo.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = photo.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });

      await Promise.all(downloadPromises);
    } catch (error) {
      console.error("Error downloading photos:", error);
    }
  };

  const handleAddTags = async (tags: string[]) => {
    if (!token) return;

    try {
      const updatePromises = Array.from(selectedPhotos).map(async (photoId) => {
        const url = await constructBackendUrl(`/photos/updateMetadata/${photoId}`);
        return fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags }),
        });
      });

      await Promise.all(updatePromises);
      setSelectedTags(tags);
      fetchPhotos();
    } catch (error) {
      console.error("Error adding tags:", error);
    }
  };

  const handleRemoveTags = async (tagsToRemove: string[]) => {
    if (!token) return;

    try {
      const newTags = selectedTags.filter((tag) => !tagsToRemove.includes(tag));
      const updatePromises = Array.from(selectedPhotos).map(async (photoId) => {
        const url = await constructBackendUrl(`/photos/updateMetadata/${photoId}`);
        return fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags: newTags }),
        });
      });

      await Promise.all(updatePromises);
      setSelectedTags(newTags);
      fetchPhotos();
    } catch (error) {
      console.error("Error removing tags:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredPhotos = photos.filter((photo) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      photo.filename.toLowerCase().includes(searchLower) ||
      photo.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      (photo.isFavorite && searchLower.includes("favorite")) ||
      (photo.dateTaken && new Date(photo.dateTaken).toLocaleDateString().includes(searchLower));
    
    return matchesSearch;
  });

  const handleUpdateTags = async (photoId: string, tags: string[]) => {
    try {
      const response = await fetch(`/api/photos/updateMetadata/${photoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tags");
      }

      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
          photo._id === photoId ? { ...photo, tags } : photo
        )
      );

      setSelectedPhoto((prev) =>
        prev?._id === photoId ? { ...prev, tags } : prev
      );
    } catch (error) {
      console.error("Error updating tags:", error);
      // TODO: Show error notification
    }
  };

  const handleToggleFavorite = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/toggleFavorite/${photoId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite status");
      }

      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
          photo._id === photoId
            ? { ...photo, isFavorite: !photo.isFavorite }
            : photo
        )
      );

      setSelectedPhoto((prev) =>
        prev?._id === photoId
          ? { ...prev, isFavorite: !prev.isFavorite }
          : prev
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // TODO: Show error notification
    }
  };

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "date":
        comparison = new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime();
        break;
      case "dateTaken":
        comparison = new Date(a.dateTaken || a.uploadedAt || 0).getTime() - new Date(b.dateTaken || b.uploadedAt || 0).getTime();
        break;
      case "name":
        comparison = a.filename.localeCompare(b.filename);
        break;
      case "size":
        comparison = (a.size || 0) - (b.size || 0);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
        <div className="flex-1">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Your Photos
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Upload and manage your photos
            </p>
          </div>
          <PhotoUpload onUploadSuccess={() => { handleUploadSuccess(); }} />
          <ViewControls
            viewMode={viewMode}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
            onSortOrderChange={setSortOrder}
            isSelectionMode={isSelectionMode}
            selectedCount={selectedPhotos.size}
            onSelectionModeChange={setIsSelectionMode}
            onSelectAll={() => {
              if (selectedPhotos.size === filteredPhotos.length) {
                setSelectedPhotos(new Set());
              } else {
                setSelectedPhotos(new Set(filteredPhotos.map((p) => p._id)));
              }
            }}
            onClearSelection={() => setSelectedPhotos(new Set())}
            onSearch={handleSearch}
            zoom={zoom}
            onZoomChange={setZoom}
            minZoom={3}
            maxZoom={6}
          />
          {filteredPhotos.length === 0 ? (
            <div className="text-center mt-12">
              <p className="text-gray-500 text-lg">
                No photos yet. Upload some photos to get started!
              </p>
            </div>
          ) : (
            <div
              className={`mt-8 ${
                viewMode === "grid"
                  ? `grid ${gridColsClass} gap-6`
                  : "space-y-4"
              }`}
            >
              {sortedPhotos.map((photo) => (
                <div
                  key={photo._id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 cursor-pointer relative ${
                    viewMode === "list" ? "flex items-center" : ""
                  } ${selectedPhotos.has(photo._id) ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <div
                    className={`relative ${
                      viewMode === "list" ? "w-24 h-24" : "aspect-square"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Image failed to load: ${photo.url}`);
                        e.currentTarget.src = "/fallback-image.jpg";
                      }}
                    />
                    {isSelectionMode && (
                      <div
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 ${
                          selectedPhotos.has(photo._id)
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300"
                        } flex items-center justify-center`}
                      >
                        {selectedPhotos.has(photo._id) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    {photo.isFavorite && (
                      <div className="absolute top-2 right-2 text-red-500">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <h2 className="text-sm font-medium text-gray-900 truncate">
                      {photo.filename}
                    </h2>
                    {viewMode === "list" && (
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Size: {photo.size ? `${(photo.size / 1024).toFixed(1)} KB` : "Unknown"}</p>
                        <p>Uploaded: {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : "Unknown"}</p>
                        <p>Date Taken: {photo.dateTaken ? new Date(photo.dateTaken).toLocaleDateString() : "Unknown"}</p>
                        {photo.tags && photo.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {photo.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Photo Details Sidebar */}
          <PhotoDetails
            photo={selectedPhoto}
            onClose={handleCloseDetails}
            onUpdateTags={handleUpdateTags}
            onToggleFavorite={handleToggleFavorite}
          />

          {/* Bulk Actions */}
          {isSelectionMode && (
            <BulkActions
              selectedCount={selectedPhotos.size}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteSelected}
              onDownloadSelected={handleDownloadSelected}
              onClearSelection={handleClearSelection}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotosPage;