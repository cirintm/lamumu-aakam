import { loadImages, uploadImage } from "./gallery.js";

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Lamumu Image Gallery starting...");

  // Load images from Supabase
  loadImages();

  // Set up file upload functionality
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.querySelector(".upload-btn");

  // Upload button click handler
  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  // File input change handler
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImage(file);
      // Clear the input so the same file can be uploaded again
      event.target.value = "";
    }
  });

  // Drag and drop functionality
  const container = document.getElementById("imageContainer");

  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    container.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area when item is dragged over it
  ["dragenter", "dragover"].forEach((eventName) => {
    container.addEventListener(eventName, highlight, false);
  });
  ["dragleave", "drop"].forEach((eventName) => {
    container.addEventListener(eventName, unhighlight, false);
  });

  // Handle dropped files
  container.addEventListener("drop", handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight(e) {
    container.classList.add("drag-over");
  }

  function unhighlight(e) {
    container.classList.remove("drag-over");
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      uploadImage(files[0]);
    }
  }

  console.log("✅ Gallery initialized successfully!");
});
