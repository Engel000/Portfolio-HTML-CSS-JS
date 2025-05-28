// Scroll fade-in
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
});

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Fondo animado
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width, height;
const stars = [];

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.5 + 0.2,
    hue: Math.random() * 360
  });
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  for (let star of stars) {
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = Math.random() * width;
    }

    star.hue += 0.5;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${star.hue}, 100%, 70%, 0.6)`;
    ctx.fill();
  }
  requestAnimationFrame(animate);
}

animate();
