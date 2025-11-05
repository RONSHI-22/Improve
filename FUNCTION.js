document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');

      // add fade-out effect
      document.body.classList.add('fade-out');

      // redirect after animation
      setTimeout(() => {
        window.location.href = href;
      }, 500); // same as CSS transition duration
    });
  });

  document.addEventListener("DOMContentLoaded", function() {
  const gal = document.getElementById("gal");
  if (gal) gal.addEventListener("click", () => window.location.href = "Bverse.html");

  const L = document.getElementById("L");
  if (L) L.addEventListener("click", () => window.location.href = "LAus.html");

  const CS = document.getElementById("CS");
  if (CS) CS.addEventListener("click", () => window.location.href = "contactUs.html");
});


window.onload = function() {
  document.getElementById("page").addEventListener("click", function() {
    window.location.href = "https://www.facebook.com/sjmpmontalban";
  });

  document.getElementById("ems").addEventListener("click", function() {
    window.location.href = "https://www.facebook.com/sjmpmontalban";  //palitan nalang ng link ng email ng community partner
  });
};

//changing color effecfts
document.addEventListener("DOMContentLoaded", function() {
  const page = document.getElementById("page");
  const ems = document.getElementById("ems");

  function addHoverEffect(el, hoverColor) {
    const originalColor = window.getComputedStyle(el).backgroundColor;

    el.addEventListener("mouseover", function() {
      el.style.transform = "scale(1.1)";
      el.style.transition = "all 0.3s ease";
      el.style.backgroundColor = hoverColor;
      el.style.color = "white"; // optional text color change
    });

    el.addEventListener("mouseout", function() {
      el.style.transform = "scale(1)";
      el.style.backgroundColor = originalColor;
      el.style.color = ""; // reset text color
    });
  }

  addHoverEffect(page, "blue");
  addHoverEffect(ems, "green");
});


// slide show effect on abour uor app page

document.addEventListener("DOMContentLoaded", () => {
  const images = [
    "pictures/ML.jpg",
    "pictures/nove;.webp",
    "pictures/pvz.jpg"
  ];

  let index = 0;
  const slideshow = document.getElementById("slideshow");

  slideshow.addEventListener("click", () => {
    index = (index + 1) % images.length;
    slideshow.src = images[index];
  });
});


// script.js
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navRight = document.getElementById("nav-right");

  menuToggle.addEventListener("click", () => {
    navRight.classList.toggle("active");
  });
});









