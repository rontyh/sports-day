// --------------------
// SCENE SETUP
// --------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --------------------
// LIGHTING
// --------------------
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// --------------------
// GROUND
// --------------------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x228B22 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// --------------------
// PLAYER
// --------------------
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
player.position.y = 0.5;
scene.add(player);

camera.position.set(0, 6, -10);
camera.lookAt(player.position);

// --------------------
// GAME VARIABLES
// --------------------
let speed = 0;
let direction = 0;
let accelerating = false;
let braking = false;

let freshness = 100;
let hasOrder = false;
let money = 0;
let rating = 5;
let timeLeft = 180;

// --------------------
// TOUCH CONTROLS
// --------------------
document.getElementById("gas").ontouchstart = () => accelerating = true;
document.getElementById("gas").ontouchend = () => accelerating = false;

document.getElementById("brake").ontouchstart = () => braking = true;
document.getElementById("brake").ontouchend = () => braking = false;

// --------------------
// JOYSTICK
// --------------------
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
let joystickActive = false;

joystick.addEventListener("touchstart", () => joystickActive = true);

joystick.addEventListener("touchend", () => {
  joystickActive = false;
  direction = 0;
  stick.style.left = "30px";
});

joystick.addEventListener("touchmove", (e) => {
  if (!joystickActive) return;

  let touch = e.touches[0];
  let rect = joystick.getBoundingClientRect();
  let x = touch.clientX - rect.left - 50;

  direction = x * 0.003;
});

// --------------------
// ACCEPT ORDER
// --------------------
document.getElementById("acceptOrder").onclick = () => {
  hasOrder = true;
  freshness = 100;
};

// --------------------
// TRAFFIC
// --------------------
const cars = [];

for (let i = 0; i < 3; i++) {
  let car = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 2),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );
  car.position.set(Math.random() * 20 - 10, 0.5, Math.random() * 20 - 10);
  scene.add(car);
  cars.push(car);
}

// --------------------
// TIMER
// --------------------
setInterval(() => {
  timeLeft--;
  document.getElementById("time").innerText = timeLeft;

  if (timeLeft <= 0) {
    alert("Shift Ended!");
    location.reload();
  }
}, 1000);

// --------------------
// GAME LOOP
// --------------------
function animate() {
  requestAnimationFrame(animate);

  if (accelerating) speed += 0.01;
  if (braking) speed -= 0.02;

  speed *= 0.98;

  player.rotation.y -= direction;
  player.position.x -= Math.sin(player.rotation.y) * speed;
  player.position.z -= Math.cos(player.rotation.y) * speed;

  // Camera follow
  camera.position.x = player.position.x;
  camera.position.z = player.position.z - 10;
  camera.lookAt(player.position);

  // Freshness decrease
  if (hasOrder) {
    freshness -= 0.05;
    if (freshness < 0) freshness = 0;
    document.getElementById("freshnessBar").style.width = freshness * 2 + "px";
  }

  // Traffic movement
  cars.forEach(car => {
    car.position.x += 0.05;
    if (car.position.x > 20) car.position.x = -20;
  });

  renderer.render(scene, camera);
}

animate();
