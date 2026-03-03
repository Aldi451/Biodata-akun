function openLink(url) {
  window.open(url, "_blank");
}

function showComments() {
  const commentSection = document.querySelector(".comments-section");

  if (commentSection.style.display === "block") {
    commentSection.style.display = "none";
  } else {
    commentSection.style.display = "block";
  }
}

function submitComment() {
  const username = document.getElementById("username").value.trim();
  const comment = document.getElementById("usercomment").value.trim();
  const commentList = document.getElementById("comment-list");

  if (username === "") {
    alert("Nama harus diisi sebelum berkomentar!");
    return;
  }

  if (comment === "") {
    alert("Komentar tidak boleh kosong!");
    return;
  }

  const now = new Date();

  // Buat elemen komentar
  const li = document.createElement("li");
  li.classList.add("comment-item");

  li.innerHTML = `
    <div class="comment-header">${username}</div>
    <div class="comment-body">${comment}</div>
    <div class="comment-time" data-time="${now.toISOString()}"></div>
    <div class="comment-actions">
      <button onclick="replyComment(this)">Reply</button>
      <button onclick="deleteComment(this)">Delete</button>
    </div>
  `;

  commentList.appendChild(li);

  document.getElementById("usercomment").value = "";
  updateTimes();
}

function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (now.toDateString() === date.toDateString()) {
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else {
    const options = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString("en-GB", options).replace(",", " ,");
  }
}

function updateTimes() {
  const times = document.querySelectorAll(".comment-time");
  times.forEach(el => {
    const date = new Date(el.dataset.time);
    el.textContent = formatRelativeTime(date);
  });
}

setInterval(updateTimes, 60000);

function replyComment(btn) {
  alert("Fitur reply bisa ditambahkan sesuai kebutuhan.");
}

function deleteComment(btn) {
  btn.closest(".comment-item").remove();
}

// Bubble generator
function createBubble() {
  const bubble = document.createElement("div");
  const size = Math.random() * 40 + 10; // ukuran random
  bubble.classList.add("bubble");
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${Math.random() * window.innerWidth}px`;
  
  document.body.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 10000); // hapus setelah animasi selesai
}

// Buat bubble setiap 500ms
setInterval(createBubble, 500);

document.querySelector(".facebook").onclick = () => {
  window.open("https://www.facebook.com/aldy.hidayat.568?_rdr", "_blank");
};

document.querySelector(".instagram").onclick = () => {
  window.open("https://www.instagram.com/hidayat_rifaldi", "_blank");
};

document.querySelector(".twitter").onclick = () => {
  window.open("https://twitter.com", "_blank");

};
