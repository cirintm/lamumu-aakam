import { supabase, CONFIG } from "../config.js";

const ImageCard = ({ image, currentUser, onLike, onDelete }) => {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(CONFIG.storageBucket)
    .getPublicUrl(image.storage_path);

  const handleDownload = async () => {
    try {
      // Create download link
      const link = document.createElement("a");
      link.href = publicUrl;
      link.download = image.filename || "downloaded_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
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
      <div className="image-container">
        <img
          src={publicUrl}
          alt={image.alt_text || "Uploaded Image"}
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
          }}
        />
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
