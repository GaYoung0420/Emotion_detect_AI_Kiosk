import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
var move_baner = (select_value) => {
  if (select_value) {
    $('#baner').removeClass('fade_in');
    $('#baner').addClass('fade_out');
  } else {
    $('#baner').removeClass('fade_out');
    $('#baner').addClass('fade_in');
  }
};

$('#toggle').click(() => {
  var select_value = $('input:checkbox[name=chatbot]:checked').val();
  move_baner(select_value);
});

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const fov = 50;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.PointLight(0xffffff, 1000);
const fbxLoader = new FBXLoader();
const textureLoader = new THREE.TextureLoader();

function main() {
  controls.enableDamping = true;
  controls.target.set(0, 1, 2);
  camera.position.set(0, 1, 2);

  scene.add(new THREE.AxesHelper(5));

  light.position.set(2.5, 7.5, 15);
  scene.add(light);
  // scene.background = new THREE.Color('black');
  scene.background = new THREE.Color('#fafafa');
  fbxLoader.load(
    '../fbx/CuteRobot.fbx',
    (object) => {
      // object.traverse(function (child) {
      //   if (child.isMesh) {
      //     const texture = textureLoader.load('../fbx/material/CuteRobot.png');
      //     child.material.map = texture; // assign your diffuse texture here
      //   }
      //   // if ((child as THREE.Mesh).isMesh) {
      //   //     // (child as THREE.Mesh).material = material
      //   //     if ((child as THREE.Mesh).material) {
      //   //         ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
      //   //     }
      //   // }
      // });
      object.scale.set(0.01, 0.01, 0.01);
      scene.add(object);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.log(error);
    },
  );

  // const boxWidth = 1;
  // const boxHeight = 1;
  // const boxDepth = 1;
  // const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  // const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }); // greenish blue

  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  // function render(time) {
  //   time *= 0.001; // convert time to seconds
  //   // camera.aspect = canvas.clientWidth / canvas.clientHeight;
  //   // camera.updateProjectionMatrix();
  //   // cube.rotation.x = time;
  //   // cube.rotation.y = time;

  //   renderer.render(scene, camera);

  //   requestAnimationFrame(render);
  // }
  // requestAnimationFrame(render);
}

main();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

controls.update();
animate();