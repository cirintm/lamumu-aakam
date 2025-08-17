import { supabase, CONFIG } from "./config.js";

// Load images from Supabase
export async function loadImages() {
  try {
    showLoadingState();

    const { data: images, error } = await supabase
      .from("images")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error loading images:", error);
      showErrorMessage("Failed to load images");
      return;
    }

    const container = document.getElementById("imageContainer");
    container.innerHTML = ""; // Clear existing content

    if (images && images.length > 0) {
      images.forEach((image) => {
        createImageCard(image);
      });
    } else {
      showEmptyState();
    }

    hideLoadingState();
  } catch (error) {
    console.error("Error:", error);
    showErrorMessage("Failed to load images");
    hideLoadingState();
  }
}

// Create image card HTML
export function createImageCard(imageData) {
  const container = document.getElementById("imageContainer");
  const imgCard = document.createElement("div");
  imgCard.classList.add("image-card");
  imgCard.dataset.imageId = imageData.id;

  // Get public URL for the image
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(CONFIG.storageBucket)
    .getPublicUrl(imageData.storage_path);

  imgCard.innerHTML = `
    <div class="image-container">
      <img src="${publicUrl}" alt="${imageData.alt_text || "Uploaded Image"}" 
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';">
    </div>
    <div class="card-footer">
      <div class="buttons">
        <button class="download-btn" title="Download">⬇</button>
        <button class="like-btn" title="Like">❤️</button>
        <button class="delete-btn" title="Delete">🗑</button>
      </div>
      <div class="likes">${imageData.likes || 0} Likes</div>
    </div>
  `;

  // Add event listeners
  const downloadBtn = imgCard.querySelector(".download-btn");
  const likeBtn = imgCard.querySelector(".like-btn");
  const deleteBtn = imgCard.querySelector(".delete-btn");

  downloadBtn.addEventListener("click", () => downloadImage(imgCard));
  likeBtn.addEventListener("click", () => likeImage(imgCard));
  deleteBtn.addEventListener("click", () => deleteImage(imgCard));

  container.appendChild(imgCard);
}

// Download image function
export async function downloadImage(imgCard) {
  try {
    const img = imgCard.querySelector("img");
    const imageId = imgCard.dataset.imageId;

    // Get image data from Supabase
    const { data: imageData, error } = await supabase
      .from("images")
      .select("filename, storage_path")
      .eq("id", imageId)
      .single();

    if (error) {
      console.error("Error getting image data:", error);
      return;
    }

    // Create download link
    const link = document.createElement("a");
    link.href = img.src;
    link.download = imageData.filename || "downloaded_image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading image:", error);
  }
}

// Like image function
export async function likeImage(imgCard) {
  try {
    const imageId = imgCard.dataset.imageId;
    const likesDiv = imgCard.querySelector(".likes");
    const likeBtn = imgCard.querySelector(".like-btn");

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

    // Update UI
    likesDiv.textContent = `${newLikesCount} Likes`;

    // Add animation effect
    likeBtn.style.transform = "scale(1.3)";
    setTimeout(() => {
      likeBtn.style.transform = "scale(1)";
    }, 200);
  } catch (error) {
    console.error("Error liking image:", error);
  }
}

// Delete image function
export async function deleteImage(imgCard) {
  if (!confirm("Are you sure you want to delete this image?")) {
    return;
  }

  try {
    const imageId = imgCard.dataset.imageId;

    // Get image data first
    const { data: imageData, error: fetchError } = await supabase
      .from("images")
      .select("storage_path")
      .eq("id", imageId)
      .single();

    if (fetchError) {
      console.error("Error fetching image data:", fetchError);
      return;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(CONFIG.storageBucket)
      .remove([imageData.storage_path]);

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
      return;
    }

    // Remove from UI
    imgCard.remove();
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

// Upload image function
export async function uploadImage(file) {
  if (!file) return;

  // Validate file
  if (!validateFile(file)) {
    return;
  }

  try {
    showUploadProgress();

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
      hideUploadProgress();
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
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      showErrorMessage("Failed to save image data");
      hideUploadProgress();
      return;
    }

    // Add to UI at the top
    const container = document.getElementById("imageContainer");
    const tempCard = container.firstChild;
    createImageCard(dbData);
    if (tempCard) {
      container.insertBefore(container.lastChild, tempCard);
    }

    hideUploadProgress();
    showSuccessMessage("Image uploaded successfully!");
  } catch (error) {
    console.error("Error uploading image:", error);
    showErrorMessage("Failed to upload image");
    hideUploadProgress();
  }
}

// Validate file function
export function validateFile(file) {
  // Check file type
  if (!CONFIG.allowedTypes.includes(file.type)) {
    showErrorMessage("Please select a valid image file (JPEG, PNG, GIF, WebP)");
    return false;
  }

  // Check file size
  if (file.size > CONFIG.maxFileSize) {
    const maxSizeMB = CONFIG.maxFileSize / (1024 * 1024);
    showErrorMessage(`File size must be less than ${maxSizeMB}MB`);
    return false;
  }

  return true;
}

// UI Helper functions
export function showLoadingState() {
  const container = document.getElementById("imageContainer");
  container.innerHTML = '<div class="loading">Loading images...</div>';
}

export function hideLoadingState() {
  const loadingEl = document.querySelector(".loading");
  if (loadingEl) {
    loadingEl.remove();
  }
}

export function showEmptyState() {
  const container = document.getElementById("imageContainer");
  container.innerHTML =
    '<div class="empty-state">No images yet. Upload the first one!</div>';
}

export function showUploadProgress() {
  const uploadBtn = document.querySelector(".upload-btn");
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";
}

export function hideUploadProgress() {
  const uploadBtn = document.querySelector(".upload-btn");
  uploadBtn.disabled = false;
  uploadBtn.textContent = "Add Image";
}

export function showErrorMessage(message) {
  // Remove existing messages
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = "message error-message";
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

export function showSuccessMessage(message) {
  // Remove existing messages
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = "message success-message";
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}
