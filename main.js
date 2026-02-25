// ===============================
// SCENE SETUP
// ===============================
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

// ===============================
// LIGHTING
// ===============================
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// ===============================
// ROAD SYSTEM
// ===============================
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 200),
  new THREE.MeshStandardMaterial({ color: 0x333333 })
);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// Lane markings
for (let i = -90; i < 100; i += 15) {
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.1, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  line.position.set(0, 0.05, i);
  scene.add(line);
}

// ===============================
// BIKE MODEL (Grouped)
// ===============================
const bike = new THREE.Group();

// Body
const body = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.5, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
body.position.y = 0.75;
bike.add(body);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
frontWheel.rotation.z = Math.PI / 2;
frontWheel.position.set(0, 0.4, 1);
bike.add(frontWheel);

const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
backWheel.rotation.z = Math.PI / 2;
backWheel.position.set(0, 0.4, -1);
bike.add(backWheel);

bike.position.y = 0;
scene.add(bike);

// ===============================
// CAMERA
// ===============================
camera.position.set(0, 6, -12);
camera.lookAt(bike.position);

// ===============================
// GAME VARIABLES
// ===============================
let speed = 0;
let accelerating = false;
let braking = false;

let joystickData = { x: 0, y: 0 };

// ===============================
// TOUCH BUTTONS
// ===============================
const gasBtn = document.getElementById("gas");
const brakeBtn = document.getElementById("brake");

gasBtn.addEventListener("touchstart", () => accelerating = true);
gasBtn.addEventListener("touchend", () => accelerating = false);

brakeBtn.addEventListener("touchstart", () => braking = true);
brakeBtn.addEventListener("touchend", () => braking = false);

// ===============================
// JOYSTICK SYSTEM
// ===============================
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

let joystickActive = false;

joystick.addEventListener("touchstart", () => joystickActive = true);

joystick.addEventListener("touchend", () => {
  joystickActive = false;
  joystickData.x = 0;
  joystickData.y = 0;
  stick.style.left = "30px";
  stick.style.top = "30px";
});

joystick.addEventListener("touchmove", (e) => {
  if (!joystickActive) return;

  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];

  let x = touch.clientX - rect.left - 50;
  let y = touch.clientY - rect.top - 50;

  const maxDistance = 30;
  const distance = Math.sqrt(x * x + y * y);

  if (distance > maxDistance) {
    x = (x / distance) * maxDistance;
    y = (y / distance) * maxDistance;
  }

  stick.style.left = 30 + x + "px";
  stick.style.top = 30 + y + "px";

  joystickData.x = x / maxDistance;
  joystickData.y = y / maxDistance;
});

// ===============================
// TRAFFIC SYSTEM
// ===============================
const cars = [];

for (let i = 0; i < 4; i++) {
  const car = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1, 3),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
  );

  car.position.set(
    (Math.random() - 0.5) * 10,
    0.5,
    Math.random() * 150 - 75
  );

  scene.add(car);
  cars.push(car);
}

// ===============================
// COLLISION DETECTION
// ===============================
function checkCollision(obj1, obj2) {
  const box1 = new THREE.Box3().setFromObject(obj1);
  const box2 = new THREE.Box3().setFromObject(obj2);
  return box1.intersectsBox(box2);
}

// ===============================
// GAME LOOP
// ===============================
function animate() {
  requestAnimationFrame(animate);

  // Steering
  bike.rotation.y -= joystickData.x * 0.05;

  // Acceleration
  if (accelerating) speed += 0.02;
  if (braking) speed -= 0.03;

  speed *= 0.97;

  // Move bike
  bike.position.x -= Math.sin(bike.rotation.y) * speed;
  bike.position.z -= Math.cos(bike.rotation.y) * speed;

  // Camera follow
  camera.position.x = bike.position.x;
  camera.position.z = bike.position.z - 12;
  camera.lookAt(bike.position);

  // Traffic movement
  cars.forEach(car => {
    car.position.z += 0.5;
    if (car.position.z > 100) car.position.z = -100;

    if (checkCollision(bike, car)) {
      alert("💥 You Crashed! Delivery Failed!");
      location.reload();
    }
  });

  // Off-road detection
  if (Math.abs(bike.position.x) > 10) {
    alert("🚫 You went off the road!");
    location.reload();
  }

  renderer.render(scene, camera);
}

animate();
