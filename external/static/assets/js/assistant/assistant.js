import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/libs/stats.module.js';

var guideData = JSON.parse(JSON.stringify(GuideFile));
var select_value = null;
var detect_result = null;
var oldTime = null;
var active_assistant_click = false;
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
  select_value = $('input:checkbox[name=chatbot]:checked').val();
  move_baner(select_value);
});

// assistant text 수정
var change_text_speak = (text) => {
  console.log(guideData.guide[0].text[0]);
  $('#guide_text').text(guideData.guide[0].text[0]);
};
change_text_speak('하이');

// local storage가 바뀌면 실행되는 이벤트
addEventListener('storage', (event) => {
  detect_result = JSON.parse(localStorage.getItem('Detect_Result'));
  if (detect_result != undefined) {
    //assistant가 움직이는 조건
    if (detect_result.DetectJawOpen) {
      select_value = true;
      $('#checkbox').attr('checked', select_value);
      move_baner(select_value);
      oldTime = Date.now();

      let timer = setInterval(() => {
        const currentTime = Date.now();
        // 경과한 밀리초 가져오기
        const diff = currentTime - oldTime;

        // 초(second) 단위 변환하기
        const sec = Math.floor(diff / 1000);

        // HTML에 문자열 넣기
        console.log(sec);

        if (active_assistant_click == false && sec > 10) {
          select_value = false;
          $('#checkbox').attr('checked', select_value);
          move_baner(select_value);
          clearInterval(timer);
        }
      }, 1000);
    } else {
    }
    // localStorage.setItem('Detect_Result', JSON.stringify(detect_result_json));
  }
});

//고령층이 어려워함을 detecting하기 위한 조건 함수
var detect_condition = (detect_result) => {
  /*
    1. 터치를 하려고 하는 자세를 확인 (행동)
      # isPointingUpKiosk(results_gestureRecognizer, results_poseLandmarker);
      - 팔꿈치(14 - right elbow or 13 - left elbow)가 손(20 - right index, 19 - left index)보다 아래에 위치하면 손을 들고 있는 자세
      - Pointing gesture를 취하고 있으면 터치를 할려고하는 자세를 확인할 수 있음
    2. 표정의 detect(emotion deteting)
      # expressionDetection()
      - 부정적인 감정들("sad", "angry", "fearful", "disgusted", "surprised")을 detect
      # isEyeBlinkDetectedFunc(results_faceLandmarker)
      - 눈 찌뿌리는 것을 detect
      # isMouthOpen(results_faceLandmarker)
      - 입 벌리고 있는 것을 detect
    3. 터치 시간
  
  */
  let DetectRaisingArmPose = detect_result.DetectRaisingArmPose; // 팔을 들고 있는 것
  let DetectPointingGesture = detect_result.DetectPointingGesture; // 포인팅하는 손
  let DetectNegativeExpression = detect_result.DetectNegativeExpression; //부정적인 표정
  let DetectGrimaceFace = detect_result.DetectGrimaceFace; // 눈을 찡그림
  let DetectJawOpen = detect_result.DetectJawOpen; // 눈을 찡그림
};

$('#assistant_container').click(() => {
  active_assistant_click = true;
});

var move_baner = (select_value) => {
  if (select_value) {
    $('#baner').removeClass('fade_in');
    $('#baner').addClass('fade_out');
  } else {
    $('#baner').removeClass('fade_out');
    $('#baner').addClass('fade_in');
  }
};

// ******************** three.js assistant ********************************
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
const textureLoader = new THREE.TextureLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
// scene.add(new THREE.AxesHelper(5));
scene.background = new THREE.Color('white');

// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize($('#canvas').Width, $('#canvas').Height);
// document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color('gray');
const fbxLoader = new FBXLoader();
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff80 });
const cube = new THREE.Mesh(geometry, material);

var light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(0.8, 1.4, 1.0);
scene.add(light);
scene.add(light.target);

var light2 = new THREE.DirectionalLight(0xffffff, 1.0);
light2.position.set(2, 2, -1.0);
scene.add(light2);
scene.add(light2.target);

let helper = new THREE.DirectionalLightHelper(light, 5);
// light.add(helper);
// const ambientLight = new THREE.AmbientLight();
// scene.add(ambientLight);

//   scene.add(cube);
var x = 0;
var y = 1;
var z = 0.0001992086331106493;
var oriantation = [
  0.06494180163025447, 7.928285565790015e-16, -5.1560219238536995e-17,
];
camera.position.set(x, y, z);
camera.rotation.x = 100;

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1;
controls.maxDistance = 500;
controls.target.set(0, 0, 0);
function resizeCanvasToDisplaySize() {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // adjust displayBuffer size to match
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // update any render target sizes here
  }
}
resizeCanvasToDisplaySize();

let mixer;
let modelReady = false;
const animationActions = [];
let activeAction;
let lastAction;
// fbxLoader.setPath('../fbx/material/');
fbxLoader.load(
  '../fbx/material/CuteRobot_no(1).fbx',
  function (object) {
    // Traverse through the object and handle materials
    object.scale.set(0.01, 0.01, 0.01);
    object.position.set(-0.01, 0.2, 0.75);
    object.rotation.set(-1.6, 0, 0);
    camera.lookAt(object.position);

    // object.traverse를 사용하여 몸통 텍스처 입히기
    textureLoader.load('../fbx/material/CuteRobot.png', function (texture) {
      // 로드된 텍스처를 사용하여 재질을 생성
      var material = new THREE.MeshBasicMaterial({ map: texture });

      object.traverse(function (child) {
        if (child.isMesh) {
          console.log(child.material[0]);
          child.material[0] = material;
          child.material[0].needsUpdate = true;
          child.geometry.computeVertexNormals();
        }
        child.castShadow = true;
      });
    });
    // object.traverse를 사용하여 얼굴 텍스처 입히기
    textureLoader.load(
      '../fbx/material/CuteRobotFaceTexture_hi.png',
      function (texture) {
        // 로드된 텍스처를 사용하여 재질을 생성
        var material = new THREE.MeshBasicMaterial({ map: texture });

        // object.traverse를 사용하여 모든 메쉬에 새로운 재질을 적용
        object.traverse(function (child) {
          if (child.isMesh) {
            child.material[1] = material;
            child.material[1].needsUpdate = true;
          }
        });
      },
    );

    mixer = new THREE.AnimationMixer(object);
    const animationAction = mixer.clipAction(object.animations[0]);
    animationActions.push(animationAction);
    activeAction = animationActions[0];

    scene.add(object);

    fbxLoader.load(
      '../fbx/material/Waving(3).fbx',
      (object) => {
        console.log('loaded Waving');

        const animationAction = mixer.clipAction(object.animations[0]);
        animationActions.push(animationAction);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log(error);
      },
    );
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.log(error);
  },
);

// const stats = new Stats();
// document.body.appendChild(stats.dom);

const animations = {
  default: function () {
    setAction(animationActions[0]);
  },
  samba: function () {
    setAction(animationActions[1]);
  },
  bellydance: function () {
    setAction(animationActions[2]);
  },
  goofyrunning: function () {
    setAction(animationActions[3]);
  },
};

const setAction = (toAction) => {
  if (toAction != activeAction) {
    if (lastAction) {
      lastAction.fadeOut(1);
    }

    lastAction = activeAction;
    activeAction = toAction;

    if (lastAction) {
      lastAction.fadeOut(1);
    }

    activeAction.reset();
    activeAction.fadeIn(1);
    activeAction.play();
  }
};

const animate = function () {
  requestAnimationFrame(animate);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  controls.update();
  if (modelReady) mixer.update(clock.getDelta());

  renderer.render(scene, camera);
  // stats.update();
  // animations.samba();
};

animate();
