import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/libs/stats.module.js';

class App {
  constructor() {
    const divContainer = document.querySelector('#webgl-container');
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.appendChild(renderer.domElement);

    this._renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupModel();
    this._setupControls();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupControls() {
    this._controls = new OrbitControls(this._camera, this._divContainer);
  }

  _zoomFit(object3D, camera, viewMode, bFront) {
    const box = new THREE.Box3().setFromObject(object3D);
    const sizeBox = box.getSize(new THREE.Vector3()).length();
    const centerBox = box.getCenter(new THREE.Vector3());

    let offsetX = 0,
      offsetY = 0,
      offsetZ = 0;
    viewMode === 'X'
      ? (offsetX = 1)
      : viewMode === 'Y'
        ? (offsetY = 1)
        : (offsetZ = 1);

    if (!bFront) {
      offsetX *= -1;
      offsetY *= -1;
      offsetZ *= -1;
    }
    camera.position.set(
      centerBox.x + offsetX,
      centerBox.y + offsetY,
      centerBox.z + offsetZ,
    );

    const halfSizeModel = sizeBox * 0.5;
    const halfFov = THREE.Math.degToRad(camera.fov * 0.5);
    const distance = halfSizeModel / Math.tan(halfFov);
    const direction = new THREE.Vector3()
      .subVectors(camera.position, centerBox)
      .normalize();
    const position = direction.multiplyScalar(distance).add(centerBox);

    camera.position.copy(position);
    camera.near = sizeBox / 100;
    camera.far = sizeBox * 100;

    camera.updateProjectionMatrix();

    camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
    this._controls.target.set(centerBox.x, centerBox.y, centerBox.z);
  }

  async _setupModel() {
    this._clock = new THREE.Clock();

    const textureLoader = new THREE.TextureLoader();

    const loadingManager = new THREE.LoadingManager();
    loadingManager.setURLModifier(function (url) {
      // this function is called for each asset request

      // if (url === './texture1.png') {
      //   url = './texture2.png';
      // }

      return url;
    });
    const loader = new FBXLoader();
    const waving = await loader.loadAsync('../fbx/material/CuteRobot.fbx');
    const waving_ani = await loader.loadAsync(
      '../fbx/material/StandingIdle(2).fbx',
    );

    this._mixer = new THREE.AnimationMixer(waving);
    const action = this._mixer.clipAction(waving_ani.animations[0]);
    action.play();
    //waving.children[0].material
    // loader.setResourcePath('../fbx/material/CuteRobot.png');
    // const texture1 = await textureLoader.loadAsync(
    //   '../fbx/material/CuteRobot.png',
    // );
    // var material = new THREE.MeshBasicMaterial({ map: texture1 });
    // var material_a = [];
    // waving.traverse(function (child) {
    //   if (child.isMesh) {
    //     // child.material[0] = material;
    //     // child.geometry.computeVertexNormals();
    //   }
    //   child.castShadow = true;
    // });
    // console.log(waving);

    // console.log(waving.animations[0]);

    // loader.load('../fbx/material/Dancing.fbx', (object) => {
    //   this._mixer = new THREE.AnimationMixer(object);
    //   const action = this._mixer.clipAction(object.animations[0]);
    //   console.log(object.animations[0]);

    // textureLoader.load('../fbx/material/CuteRobot.png', function (texture) {
    //   // 로드된 텍스처를 사용하여 재질을 생성
    //   var material = new THREE.MeshBasicMaterial({ map: texture });

    //   object.traverse(function (child) {
    //     if (child.isMesh) {
    //       console.log(child.material[0]);
    //       child.material[0] = material;
    //       child.material[0].needsUpdate = true;
    //       child.geometry.computeVertexNormals();
    //     }
    //     child.castShadow = true;
    //   });
    // });
    // object.traverse를 사용하여 얼굴 텍스처 입히기
    // textureLoader.load(
    //   '../fbx/material/CuteRobotFaceTexture_hi.png',
    //   function (texture) {
    //     // 로드된 텍스처를 사용하여 재질을 생성
    //     var material = new THREE.MeshBasicMaterial({ map: texture });

    //     // object.traverse를 사용하여 모든 메쉬에 새로운 재질을 적용
    //     object.traverse(function (child) {
    //       if (child.isMesh) {
    //         child.material[1] = material;
    //         child.material[1].needsUpdate = true;
    //       }
    //     });
    //   },
    // );
    // this._mixer = new THREE.AnimationMixer(waving);
    // const action = this._mixer.clipAction(waving.animations[0]);
    // action.play();

    // });
    // loader.load('../fbx/material/Rumba.fbx', (object) => {
    //   this._mixer = new THREE.AnimationMixer(object);
    //   const action = this._mixer.clipAction(object.animations[0]);
    //   console.log(object.animations[0]);
    //   action.play();

    //   this._scene.add(object);

    //   this._zoomFit(object, this._camera, 'Z', true);

    //   this._clock = new THREE.Clock();
    // });

    this._scene.add(waving);

    this._zoomFit(waving, this._camera, 'Z', true);

    this._clock = new THREE.Clock();
  }

  _setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );

    camera.position.z = 2;
    this._camera = camera;

    this._scene.add(this._camera);
  }

  _setupLight() {
    const color = 0xffffff;
    const intensity = 2;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    //this._scene.add(light);
    this._camera.add(light);
  }

  update(time) {
    time *= 0.001; // second unit
    const delta = this._clock.getDelta();
    if (this._mixer) this._mixer.update(delta);
  }

  render(time) {
    this._renderer.render(this._scene, this._camera);
    this.update(time);

    requestAnimationFrame(this.render.bind(this));
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }
}

window.onload = function () {
  new App();
};
