import React, { useState, useRef, useEffect } from "react";
import { supabase, CONFIG } from "../config.js";

const ImageCard = ({ image, currentUser, onLike, onDelete }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(CONFIG.storageBucket)
    .getPublicUrl(image.storage_path);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const handleDownload = async () => {
    try {
      // Fetch the image as a blob to enable proper download
      const response = await fetch(publicUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = image.filename || `lamumu-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
      // Fallback: try direct link method
      const link = document.createElement("a");
      link.href = publicUrl;
      link.download = image.filename || `lamumu-image-${Date.now()}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLike = () => {
    onLike(image.id);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      onDelete(image.id);
    }
  };

  const canDelete = currentUser && image.user_id === currentUser.id;

  return (
    <div className="image-card">
      <div className="image-container" ref={imgRef}>
        {/* Loading placeholder */}
        {!isLoaded && (
          <div className="image-placeholder">
            <div className="loading-spinner"></div>
            <span>Loading...</span>
          </div>
        )}

        {/* Lazy loaded image */}
        {isInView && (
          <img
            src={hasError ? null : publicUrl}
            alt={image.alt_text || "Uploaded Image"}
            className={`image ${isLoaded ? "loaded" : "loading"}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        )}

        {/* Error fallback */}
        {hasError && (
          <div className="image-error">
            <span>❌</span>
            <span>Failed to load image</span>
          </div>
        )}
      </div>
      <div className="card-footer">
        <div className="buttons">
          <button onClick={handleDownload} title="Download">
            ⬇
          </button>
          <button onClick={handleLike} title="Like">
            ❤️
          </button>
          {canDelete && (
            <button
              onClick={handleDelete}
              title="Delete"
              className="delete-btn"
            >
              🗑
            </button>
          )}
        </div>
        <div className="likes">{image.likes || 0} Likes</div>
      </div>
    </div>
  );
};

export default ImageCard;
