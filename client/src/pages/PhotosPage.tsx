import React, { useState, useEffect } from "react";
import { constructBackendUrl } from "../utils/backendurl";
import { useAuth } from "../AuthContext";

interface Photo {
  _id: string;
  filename: string;
  gridFSFileId: string;
  contentType: string;
  isFavorite?: boolean;
  url?: string; // Added this to store the downloaded photo URL
}

const PhotosPage: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, userid } = useAuth();

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!token || !userid) {
        setError("Unauthorized. Please log in.");
        setLoading(false);
        return;
      }
  
      try {
        // Step 1: Get photo metadata
        const backendUrl = await constructBackendUrl(`/photos?userId=${userid}`);
        console.log("Fetching metadata from:", backendUrl);
  
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
        console.log("Received photo metadata:", photoData);
  
        // Step 2: Fetch actual image binary and create object URL
        const photosWithUrls = await Promise.all(
          photoData.map(async (photo) => {
            try {
              const photoUrl = await constructBackendUrl(`/photos/download/${photo.gridFSFileId}`);
              
              const imgResponse = await fetch(photoUrl, {
                headers: { Authorization: token },
              });
  
              if (!imgResponse.ok) {
                console.error(`Failed to load image: ${photo.filename}`);
                return { ...photo, url: "/fallback-image.jpg" }; // Use a default image on failure
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
  
    fetchPhotos();
  }, [token, userid]);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-blue-100 to-gray-100 flex-grow">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4 text-center">
        Your Photos
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo._id} className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                console.error(`Image failed to load: ${photo.url}`);
                e.currentTarget.src = "/fallback-image.jpg"; // Fallback image
              }}
            />
            <h2 className="text-lg font-bold mt-2">{photo.filename}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosPage;