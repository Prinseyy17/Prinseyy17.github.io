const lightbox = document.getElementById('lightbox');
const img = lightbox.querySelector('img');
const video = lightbox.querySelector('video');
const caption = lightbox.querySelector('.lightbox-caption');
const prevBtn = lightbox.querySelector('.prev');
const nextBtn = lightbox.querySelector('.next');
const closeBtn = lightbox.querySelector('.close');

let mediaItems = Array.from(document.querySelectorAll('figure'));
let currentIndex = 0;

// Open lightbox
mediaItems.forEach((figure, index) => {
  figure.addEventListener('click', () => {
    currentIndex = index;
    showMedia(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  });
});

// Close lightbox
closeBtn.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Restore scroll
  stopVideo();
});

// Navigation
prevBtn.addEventListener('click', () => navigate(-1));
nextBtn.addEventListener('click', () => navigate(1));

function navigate(direction) {
  currentIndex = (currentIndex + direction + mediaItems.length) % mediaItems.length;
  showMedia(currentIndex);
}

function showMedia(index) {
  const media = mediaItems[index].querySelector('img, video');
  const captionText = mediaItems[index].querySelector('figcaption')?.innerText || '';

  stopVideo();
  if (media.tagName.toLowerCase() === 'img') {
    img.src = media.src;
    img.style.display = 'block';
    video.style.display = 'none';
  } else {
    video.src = media.src;
    video.style.display = 'block';
    img.style.display = 'none';
    video.load();
  }

  caption.textContent = captionText;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  switch (e.key) {
    case 'ArrowRight':
      navigate(1);
      break;
    case 'ArrowLeft':
      navigate(-1);
      break;
    case 'Escape':
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      stopVideo();
      break;
  }
});

// Swipe support
let startX = 0;
lightbox.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

lightbox.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  if (endX - startX > 50) navigate(-1); // Swipe right
  else if (startX - endX > 50) navigate(1); // Swipe left
});

function stopVideo() {
  video.pause();
  video.currentTime = 0;
  video.src = '';
}

// Helper to update the lightbox image
const updateLightbox = () => {
    const currentImg = galleryImgs[currentImgIndex];
    if (currentImg) {
        lightboxImg.src = currentImg.src;
    }
};

// Show image in lightbox
galleryImgs.forEach((img, index) => {
    img.addEventListener("click", () => {
        currentImgIndex = index;
        lightbox.classList.add("show");
        updateLightbox();
    });
});

// Close lightbox only if backdrop is clicked
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove("show");
        lightboxImg.src = "";
    }
});

// Keyboard navigation for lightbox
document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;

    switch (e.key) {
        case "Escape":
            lightbox.classList.remove("show");
            lightboxImg.src = "";
            break;
        case "ArrowRight":
            currentImgIndex = (currentImgIndex + 1) % galleryImgs.length;
            updateLightbox();
            break;
        case "ArrowLeft":
            currentImgIndex = (currentImgIndex - 1 + galleryImgs.length) % galleryImgs.length;
            updateLightbox();
            break;
    }
});

// Swipe support for lightbox (touch devices)
let touchStartX = 0;

lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

lightbox.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            // Swipe left
            currentImgIndex = (currentImgIndex + 1) % galleryImgs.length;
        } else {
            // Swipe right
            currentImgIndex = (currentImgIndex - 1 + galleryImgs.length) % galleryImgs.length;
        }
        updateLightbox();
    }
});

// Smooth scrolling for navigation
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        if (link.hash !== "") {
            e.preventDefault();
            const target = document.querySelector(link.hash);
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    });
});

// Debounced scroll listener for highlighting nav links
let scrollTimeout;
window.addEventListener("scroll", () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
        let scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            if (
                scrollPos >= section.offsetTop &&
                scrollPos < section.offsetTop + section.offsetHeight
            ) {
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === "#" + section.id) {
                        link.classList.add("active");
                    }
                });
            }
        });

        scrollTimeout = null;
    }, 100); // Adjust debounce delay as needed
});
