function downloadImage(button) {
  let img = button.closest(".image-card").querySelector("img");
  let link = document.createElement("a");
  link.href = img.src;
  link.download = "downloaded_image.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function likeImage(button) {
  let likesDiv = button.closest(".image-card").querySelector(".likes");
  let currentLikes = parseInt(likesDiv.innerText);
  likesDiv.innerText = currentLikes + 1 + " Likes";
}

function deleteImage(button) {
  let imgCard = button.closest(".image-card");
  imgCard.remove();
}

function uploadImage(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let imgCard = document.createElement("div");
      imgCard.classList.add("image-card");
      imgCard.innerHTML = `
                <div class="image-container">
                    <img src="${e.target.result}" alt="Uploaded Image">
                </div>
                <div class="card-footer">
                    <div class="buttons">
                        <button onclick="downloadImage(this)">⬇</button>
                        <button onclick="likeImage(this)">❤️</button>
                        <button onclick="deleteImage(this)">🗑</button>
                    </div>
                    <div class="likes">0 Likes</div>
                </div>
            `;
      // Insert new image at the beginning (top) of the container
      let container = document.getElementById("imageContainer");
      container.insertBefore(imgCard, container.firstChild);
    };
    reader.readAsDataURL(file);
  }
}
