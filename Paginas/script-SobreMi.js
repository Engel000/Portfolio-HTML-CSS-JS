const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let w, h, particles;
let particleDistance = 40;
let mouse = {
	x: undefined,
	y: undefined,
	radius: 100
};

const vaporwaveColors = ["#FFBDEA", "#FEFFBE", "#CBFFE6", "#AFE9FF", "#BFB9FF"];

function hexToRGBA(hex, alpha = 1) {
	if (typeof hex !== "string" || !hex.startsWith("#") || hex.length !== 7) {
		console.warn("Color inválido recibido en hexToRGBA:", hex);
		return `rgba(255,255,255,${alpha})`;
	}
	let r = parseInt(hex.slice(1, 3), 16);
	let g = parseInt(hex.slice(3, 5), 16);
	let b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function init() {
	resizeReset();
	animationLoop();
}

function resizeReset() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;

	particles = [];
	for (let y = (((h - particleDistance) % particleDistance) + particleDistance) / 2; y < h; y += particleDistance) {
		for (let x = (((w - particleDistance) % particleDistance) + particleDistance) / 2; x < w; x += particleDistance) {
			particles.push(new Particle(x, y));
		}
	}
}

function animationLoop(t = 0) {
	ctx.clearRect(0, 0, w, h);
	drawScene(t);
	requestAnimationFrame(animationLoop);
}

function drawScene(t) {
	for (let i = 0; i < particles.length; i++) {
		particles[i].update(t);
		particles[i].draw(t);
	}
	drawLine(t);
}

function drawLine(t) {
	for (let a = 0; a < particles.length; a++) {
		for (let b = a; b < particles.length; b++) {
			let dx = particles[a].x - particles[b].x;
			let dy = particles[a].y - particles[b].y;
			let distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < particleDistance * 1.5) {
				let opacity = 1 - (distance / (particleDistance * 1.5));
				let wave = (particles[a].x + particles[a].y + t / 10) / 100;
				let colorIndex = Math.floor((wave % vaporwaveColors.length + vaporwaveColors.length) % vaporwaveColors.length);
				let color = vaporwaveColors[colorIndex] || "#ffffff";
				let rgbaColor = hexToRGBA(color, opacity);

				ctx.strokeStyle = rgbaColor;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(particles[a].x, particles[a].y);
				ctx.lineTo(particles[b].x, particles[b].y);
				ctx.stroke();
			}
		}
	}
}

function mousemove(e) {
	mouse.x = e.x;
	mouse.y = e.y;
}

function mouseout() {
	mouse.x = undefined;
	mouse.y = undefined;
}

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.size = 4;
		this.baseX = this.x;
		this.baseY = this.y;
		this.speed = (Math.random() * 25) + 5;
	}
	draw(t) {
		let wave = (this.x + this.y + t / 10) / 100;
		let index = Math.floor((wave % vaporwaveColors.length + vaporwaveColors.length) % vaporwaveColors.length);
		ctx.fillStyle = vaporwaveColors[index] || "#ffffff";

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
	update() {
		let dx = mouse.x - this.x;
		let dy = mouse.y - this.y;
		let distance = Math.sqrt(dx * dx + dy * dy);
		let maxDistance = mouse.radius;
		let force = (maxDistance - distance) / maxDistance;
		let forceDirectionX = dx / distance;
		let forceDirectionY = dy / distance;
		let directionX = forceDirectionX * force * this.speed;
		let directionY = forceDirectionY * force * this.speed;

		if (distance < mouse.radius) {
			this.x -= directionX;
			this.y -= directionY;
		} else {
			if (this.x !== this.baseX) {
				let dx = this.x - this.baseX;
				this.x -= dx / 10;
			}
			if (this.y !== this.baseY) {
				let dy = this.y - this.baseY;
				this.y -= dy / 10;
			}
		}
	}
}

init();
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", mousemove);
window.addEventListener("mouseout", mouseout);

console.clear();

const TAIL_LENGTH = 20;
const cursor = document.getElementById('cursor');
let mouseX = 0;
let mouseY = 0;
let cursorCircles;
let cursorHistory = Array(TAIL_LENGTH).fill({x: 0, y: 0});

function onMouseMove(event) {
	mouseX = event.clientX;
	mouseY = event.clientY;
}

function initCursor() {
	for (let i = 0; i < TAIL_LENGTH; i++) {
		let div = document.createElement('div');
		div.classList.add('cursor-circle');
		cursor.append(div);
	}
	cursorCircles = Array.from(document.querySelectorAll('.cursor-circle'));
}

function updateCursor() {
	cursorHistory.shift();
	cursorHistory.push({ x: mouseX, y: mouseY });

	for (let i = 0; i < TAIL_LENGTH; i++) {
		let current = cursorHistory[i];
		let next = cursorHistory[i + 1] || cursorHistory[TAIL_LENGTH - 1];

		let xDiff = next.x - current.x;
		let yDiff = next.y - current.y;

		current.x += xDiff * 0.35;
		current.y += yDiff * 0.35;
		cursorCircles[i].style.transform = `translate(${current.x}px, ${current.y}px) scale(${i/TAIL_LENGTH})`;
	}
	requestAnimationFrame(updateCursor);
}

document.addEventListener('mousemove', onMouseMove, false);

initCursor();
updateCursor();
