function openLink(url) {
  window.open(url, "_blank");
}

function showComments() {
  const commentSection = document.querySelector(".comments-section");
  commentSection.classList.toggle("active");
}

/* Bubble Background */
function createBubble() {
  const bubble = document.createElement("div");
  const size = Math.random() * 40 + 10;

  bubble.classList.add("bubble");
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${Math.random() * window.innerWidth}px`;

  document.body.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 10000);
}

setInterval(createBubble, 500);
