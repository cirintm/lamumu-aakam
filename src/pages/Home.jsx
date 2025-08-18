import React, { useState, useEffect } from "react";
import { supabase, CONFIG } from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";
import ImageCard from "../components/ImageCard.jsx";

const Home = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);

      const { data: images, error } = await supabase
        .from("images")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error loading images:", error);
        showErrorMessage("Failed to load images");
        return;
      }

      setImages(images || []);
    } catch (error) {
      console.error("Error:", error);
      showErrorMessage("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!user) {
      showErrorMessage("Please login to upload images");
      return;
    }

    // Validate file
    if (!validateFile(file)) {
      return;
    }

    try {
      setUploading(true);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(CONFIG.storageBucket)
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        showErrorMessage("Failed to upload image");
        return;
      }

      // Save metadata to database
      const { data: dbData, error: dbError } = await supabase
        .from("images")
        .insert([
          {
            filename: file.name,
            storage_path: filePath,
            alt_text: `Uploaded image: ${file.name}`,
            likes: 0,
            file_size: file.size,
            mime_type: file.type,
            user_id: user.id, // Add user ownership
          },
        ])
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        showErrorMessage("Failed to save image data");
        return;
      }

      // Add to state at the beginning
      setImages((prev) => [dbData, ...prev]);
      showSuccessMessage("Image uploaded successfully!");

      // Clear file input
      event.target.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      showErrorMessage("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (imageId) => {
    try {
      // Get current likes count
      const { data: currentData, error: fetchError } = await supabase
        .from("images")
        .select("likes")
        .eq("id", imageId)
        .single();

      if (fetchError) {
        console.error("Error fetching likes:", fetchError);
        return;
      }

      const newLikesCount = (currentData.likes || 0) + 1;

      // Update likes in database
      const { error: updateError } = await supabase
        .from("images")
        .update({ likes: newLikesCount })
        .eq("id", imageId);

      if (updateError) {
        console.error("Error updating likes:", updateError);
        return;
      }

      // Update state
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, likes: newLikesCount } : img
        )
      );
    } catch (error) {
      console.error("Error liking image:", error);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      const imageToDelete = images.find((img) => img.id === imageId);

      if (!imageToDelete) return;

      // Check if user owns this image
      if (!user || imageToDelete.user_id !== user.id) {
        showErrorMessage("You can only delete your own images");
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(CONFIG.storageBucket)
        .remove([imageToDelete.storage_path]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .eq("id", imageId);

      if (dbError) {
        console.error("Error deleting from database:", dbError);
        showErrorMessage("Failed to delete image");
        return;
      }

      // Remove from state
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showSuccessMessage("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      showErrorMessage("Failed to delete image");
    }
  };

  const validateFile = (file) => {
    // Check file type
    if (!CONFIG.allowedTypes.includes(file.type)) {
      showErrorMessage(
        "Please select a valid image file (JPEG, PNG, GIF, WebP)"
      );
      return false;
    }

    // Check file size
    if (file.size > CONFIG.maxFileSize) {
      const maxSizeMB = CONFIG.maxFileSize / (1024 * 1024);
      showErrorMessage(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const showErrorMessage = (message) => {
    // You can replace this with a proper toast/notification system
    alert(message);
  };

  const showSuccessMessage = (message) => {
    // You can replace this with a proper toast/notification system
    alert(message);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = { target: { files: [files[0]] } };
      handleFileUpload(fakeEvent);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {user && (
        <div className="upload-section">
          <button
            className="upload-btn"
            disabled={uploading}
            onClick={() => document.getElementById("fileInput").click()}
          >
            {uploading ? "Uploading..." : "Add Image"}
          </button>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
      )}

      <div
        className="container"
        id="imageContainer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {images.length > 0 ? (
          images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              currentUser={user}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="empty-state">
            {user
              ? "No images yet. Upload the first one!"
              : "No images to display."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
