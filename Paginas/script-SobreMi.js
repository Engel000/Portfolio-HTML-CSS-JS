// Selecciona el elemento canvas del DOM
const canvas = document.querySelector("#canvas");
// Obtiene el contexto 2D del canvas para poder dibujar
const ctx = canvas.getContext("2d");

// Variables globales para dimensiones y partículas
let w, h, particles;
// Distancia entre partículas
let particleDistance = 40;
// Objeto que representa el mouse y su radio de interacción
let mouse = {
	x: undefined,
	y: undefined,
	radius: 100
};

// Colores estilo vaporwave
const vaporwaveColors = ["#FFBDEA", "#FEFFBE", "#CBFFE6", "#AFE9FF", "#BFB9FF"];

// Función para convertir colores HEX a RGBA con opacidad
function hexToRGBA(hex, alpha = 1) {
	if (typeof hex !== "string" || !hex.startsWith("#") || hex.length !== 7) {
		console.warn("Color inválido recibido en hexToRGBA:", hex);
		return `rgba(255,255,255,${alpha})`; // color blanco por defecto
	}
	let r = parseInt(hex.slice(1, 3), 16); // componente rojo
	let g = parseInt(hex.slice(3, 5), 16); // componente verde
	let b = parseInt(hex.slice(5, 7), 16); // componente azul
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Inicializa el canvas y comienza la animación
function init() {
	resizeReset();      // Ajusta tamaño del canvas y genera partículas
	animationLoop();    // Comienza el bucle de animación
}

// Ajusta tamaño del canvas al tamaño de ventana y genera partículas
function resizeReset() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;

	particles = [];
	// Calcula posición inicial y crea partículas espaciadas
	for (let y = (((h - particleDistance) % particleDistance) + particleDistance) / 2; y < h; y += particleDistance) {
		for (let x = (((w - particleDistance) % particleDistance) + particleDistance) / 2; x < w; x += particleDistance) {
			particles.push(new Particle(x, y));
		}
	}
}

// Bucle principal de animación que limpia y dibuja la escena cada frame
function animationLoop(t = 0) {
	ctx.clearRect(0, 0, w, h); // Limpia el canvas
	drawScene(t);             // Dibuja partículas y líneas
	requestAnimationFrame(animationLoop); // Llama al siguiente frame
}

// Dibuja todas las partículas y líneas de conexión
function drawScene(t) {
	for (let i = 0; i < particles.length; i++) {
		particles[i].update(t); // Actualiza posición según el mouse
		particles[i].draw(t);   // Dibuja la partícula
	}
	drawLine(t);               // Dibuja líneas entre partículas cercanas
}

// Dibuja líneas entre partículas que están suficientemente cerca
function drawLine(t) {
	for (let a = 0; a < particles.length; a++) {
		for (let b = a; b < particles.length; b++) {
			let dx = particles[a].x - particles[b].x;
			let dy = particles[a].y - particles[b].y;
			let distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < particleDistance * 1.5) {
				let opacity = 1 - (distance / (particleDistance * 1.5)); // Opacidad según distancia

				// Calcula un índice de color con efecto de onda
				let wave = (particles[a].x + particles[a].y + t / 10) / 100;
				let colorIndex = Math.floor((wave % vaporwaveColors.length + vaporwaveColors.length) % vaporwaveColors.length);
				let color = vaporwaveColors[colorIndex] || "#ffffff";
				let rgbaColor = hexToRGBA(color, opacity);

				// Dibuja línea entre las partículas a y b
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

// Evento cuando el mouse se mueve
function mousemove(e) {
	mouse.x = e.x;
	mouse.y = e.y;
}

// Evento cuando el mouse sale de la ventana
function mouseout() {
	mouse.x = undefined;
	mouse.y = undefined;
}

// Clase para representar una partícula
class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.size = 4;
		this.baseX = this.x; // Posición original
		this.baseY = this.y;
		this.speed = (Math.random() * 25) + 5; // Velocidad de movimiento al repelerse
	}
	// Dibuja la partícula
	draw(t) {
		let wave = (this.x + this.y + t / 10) / 100;
		let index = Math.floor((wave % vaporwaveColors.length + vaporwaveColors.length) % vaporwaveColors.length);
		ctx.fillStyle = vaporwaveColors[index] || "#ffffff";

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
	// Actualiza la posición de la partícula en respuesta al mouse
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

		// Si el mouse está cerca, la partícula se aleja
		if (distance < mouse.radius) {
			this.x -= directionX;
			this.y -= directionY;
		} else {
			// Si no, vuelve a su posición base lentamente
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

// Inicia la animación
init();
// Añade eventos para redimensionar ventana y mover mouse
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", mousemove);
window.addEventListener("mouseout", mouseout);

// Limpia la consola
console.clear();

// Longitud de la cola del cursor animado
const TAIL_LENGTH = 20;

// Referencia al contenedor del cursor personalizado
const cursor = document.getElementById('cursor');

// Coordenadas del mouse
let mouseX = 0;
let mouseY = 0;

// Historial y elementos del cursor
let cursorCircles;
let cursorHistory = Array(TAIL_LENGTH).fill({x: 0, y: 0});

// Actualiza posición del mouse
function onMouseMove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
}

// Inicializa el cursor animado creando los círculos
function initCursor() {
  for (let i = 0; i < TAIL_LENGTH; i++) {
    let div = document.createElement('div');
    div.classList.add('cursor-circle') ;
    cursor.append(div);
  }
  cursorCircles = Array.from(document.querySelectorAll('.cursor-circle'));
}

// Actualiza la posición de cada círculo del cursor para crear un efecto de seguimiento
function updateCursor() {  
  cursorHistory.shift(); // Elimina el valor más antiguo
  cursorHistory.push({ x: mouseX, y: mouseY }); // Añade la nueva posición
    
  for (let i = 0; i < TAIL_LENGTH; i++) {
    let current = cursorHistory[i];
    let next = cursorHistory[i + 1] || cursorHistory[TAIL_LENGTH - 1];
    
    let xDiff = next.x - current.x;
    let yDiff = next.y - current.y;
    
    // Movimiento suave interpolando la posición
    current.x += xDiff * 0.35;
    current.y += yDiff * 0.35;
    cursorCircles[i].style.transform = `translate(${current.x}px, ${current.y}px) scale(${i/TAIL_LENGTH})`;  
  }
  requestAnimationFrame(updateCursor) // Llama al siguiente frame
}

// Escucha el movimiento del mouse
document.addEventListener('mousemove', onMouseMove, false);

// Inicializa y ejecuta la animación del cursor
initCursor();
updateCursor();
