// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarker,
  PoseLandmarker,
  GestureRecognizer,
} = vision;
const demosSection = document.getElementById("demos");
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker = undefined;
let poseLandmarker = undefined;
let gestureRecognizer = undefined;
let runningMode = "IMAGE";
let webcamRunning = false;
const videoWidth = 480;

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// 미디어파이프의 모델을 초기화하고 웹캠 스트림을 활성화하여 감지된 얼굴, 손, 포즈, 제스처 등을 예측하는 모델 로드하는 함수
const enableCam = async () => {
  // FilesetResolver를 사용하여 미디어파이프 모델을 로드합니다.
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  // 얼굴 랜드마커 모델을 초기화합니다.
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    // 모델 경로 및 실행 모드를 설정합니다.
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
  });

  // 포즈 랜드마커 모델을 초기화합니다.
  poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
    // 모델 경로 및 실행 모드를 설정합니다.
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 2,
  });

  // 제스처 인식 모델을 초기화합니다.
  gestureRecognizer = await GestureRecognizer.createFromOptions(
    filesetResolver,
    {
      // 모델 경로 및 실행 모드를 설정합니다.
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
    }
  );

  // 모든 모델이 로드되었는지 확인하고 로드되지 않았다면 메시지를 출력하고 함수를 종료합니다.
  if (!faceLandmarker || !poseLandmarker || !gestureRecognizer) {
    console.log("Wait! model is not loaded yet.");
    return;
  }

  // getUserMedia()를 지원하는지 확인하고 웹캠 스트림을 활성화합니다.
  if (hasGetUserMedia()) {
    // getUserMedia()의 매개변수를 설정합니다.
    const constraints = {
      video: true,
    };
    // 웹캠 스트림을 활성화하고 예측 함수(predictWebcam)를 호출합니다.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
      webcamRunning = true;
      console.log("Webcam");
    });
  } else {
    // getUserMedia()를 지원하지 않는 경우 경고 메시지를 출력합니다.
    console.warn("getUserMedia() is not supported by your browser");
  }
};

// enableCam();

// faceapi.js에서 사용되는 여러 모델을 비동기적으로 로드합니다.
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/external/static/assets/models"),
]).then(enableCam); // 모든 모델이 성공적으로 로드되면 startVideo 함수를 호출합니다.

let lastVideoTime = -1;
let results_faceLandmarker = undefined;
let results_gestureRecognizer = undefined;
let results_poseLandmarker = undefined;
let results_expression = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);

// 웹캠 비디오 스트림에서 얼굴과 손을 감지하고 해당 랜드마크를 캔버스에 그리는 함수
async function predictWebcam() {
  // 캔버스의 크기를 웹캠 비디오의 크기에 맞게 조정합니다.
  canvasElement.style.width = video.videoWidth;
  canvasElement.style.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  // 미디어파이프 모델을 실행하는 모드를 설정합니다.
  // 'IMAGE' 모드에서 'VIDEO' 모드로 변경합니다.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }

  // 현재 시간을 기록합니다.
  let startTimeMs = performance.now();
  let nowInMs = Date.now();
  // 비디오의 현재 시간이 이전과 다를 경우에만 감지 및 예측을 수행합니다.
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;

    // 웹캠 비디오에서 얼굴과 손을 감지하고 랜드마크를 가져옵니다.
    results_gestureRecognizer = gestureRecognizer.recognizeForVideo(
      video,
      nowInMs
    );
  }
  results_faceLandmarker = faceLandmarker.detectForVideo(video, startTimeMs);

  results_poseLandmarker = detectPoseLandmarks();

  // 손의 랜드마크를 캔버스에 그리는 함수를 호출합니다.
  drawGesturePredict(results_gestureRecognizer);

  // 얼굴의 랜드마크를 캔버스에 그리는 함수를 호출합니다.

  drawFaceMarker(results_faceLandmarker);

  // 감정 Detector
  results_expression = expressionDetection();

  if (
    results_gestureRecognizer.landmarks[0] != undefined &&
    results_gestureRecognizer.landmarks[0][14] != undefined &&
    results_poseLandmarker.landmarks[0][13] != undefined &&
    results_poseLandmarker.landmarks[0][20] != undefined &&
    results_poseLandmarker.landmarks[0][19] != undefined &&
    results_gestureRecognizer.gestures[0][0] != undefined &&
    results_faceLandmarker.faceBlendshapes[0] != undefined &&
    results_faceLandmarker.faceBlendshapes[0].categories[9] != undefined &&
    results_faceLandmarker.faceBlendshapes[0].categories[10] != undefined
  ) {
    predictTroubleContext(
      results_faceLandmarker,
      results_gestureRecognizer,
      results_poseLandmarker
    );
  }

  // 웹캠이 실행 중일 경우, 브라우저가 준비될 때마다 이 함수를 다시 호출하여 지속적으로 예측합니다.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}

// 키오스크 사용시 어려움을 겪는 것을 확인하기 위한 함수
let isEyeBlinkDetected = false;
let eyeBlinkStartTime = 0;
function predictTroubleContext(
  results_faceLandmarker,
  results_gestureRecognizer,
  results_poseLandmarker
) {
  /*
    1. 터치를 하려고 하는 자세를 확인
        // 팔꿈치(14 - right elbow or 13 - left elbow)가 손(20 - right index, 19 - left index)보다 아래에 위치하면 손을 들고 있는 자세
        // Pointing gesture를 취하고 있으면 터치를 할려고하는 자세를 확인할 수 있음
    2. 표정의 변화(emotion deteting), 터치 지속 시간, 
  
  */

  let rightElbow_position = results_poseLandmarker.landmarks[0][14];
  let leftElbow_position = results_poseLandmarker.landmarks[0][13];
  let rightIndex_position = results_poseLandmarker.landmarks[0][20];
  let leftIndex_position = results_poseLandmarker.landmarks[0][19];

  let pointing_gesture = results_gestureRecognizer.gestures[0][0];

  let eyeBlinkLeft = results_faceLandmarker.faceBlendshapes[0].categories[9];
  let eyeBlinkRight = results_faceLandmarker.faceBlendshapes[0].categories[10];

  if (
    (rightElbow_position.y < rightIndex_position.y ||
      leftElbow_position.y < leftIndex_position.y) &&
    pointing_gesture.categoryName === "Pointing_Up"
  ) {
    console.log("터치 직전 확인");
    let currentTime = Date.now();
    let elapsedTime = (currentTime - eyeBlinkStartTime) / 1000; // 경과 시간(초) 계산

    if (eyeBlinkLeft.score > 0.3 && eyeBlinkRight.score > 0.3) {
      // 찡그림이 감지됨
      if (!isEyeBlinkDetected) {
        // 처음으로 찡그림이 감지된 경우, 시작 시간을 기록
        eyeBlinkStartTime = currentTime;
        isEyeBlinkDetected = true;
      } else if (elapsedTime >= 1) {
        // 찡그림이 지속되고 3초 이상 경과한 경우
        console.log("찡그림");
      }
    } else {
      // 찡그림이 감지되지 않음
      isEyeBlinkDetected = false;
      console.log("찡그림X");
    }
  }
}
//주어진 results_gestureRecognizer 객체를 기반으로 화면에 손의 특징점 및 제스처를 그리는 함수
function drawGesturePredict(results_gestureRecognizer) {
  // 캔버스 컨텍스트를 저장하고 캔버스를 지웁니다.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // 만약 결과 객체에 특징점이 존재한다면 각 특징점에 연결선과 특징점을 그립니다.
  if (results_gestureRecognizer.landmarks) {
    for (const landmarks of results_gestureRecognizer.landmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        GestureRecognizer.HAND_CONNECTIONS,
        {
          color: "#00FF00",
          lineWidth: 5,
        }
      );
      drawingUtils.drawLandmarks(landmarks, {
        color: "#FF0000",
        lineWidth: 2,
      });
    }
  }
  // 캔버스 컨텍스트를 복원합니다.
  canvasCtx.restore();

  // 만약 결과 객체에 제스처가 존재한다면 첫 번째 제스처의 정보를 가져와서 출력합니다.
  if (results_gestureRecognizer.gestures.length > 0) {
    const categoryName = results_gestureRecognizer.gestures[0][0].categoryName;
    const categoryScore = parseFloat(
      results_gestureRecognizer.gestures[0][0].score * 100
    ).toFixed(2);
    const handedness = results_gestureRecognizer.handednesses[0][0].displayName;
    const gestureOutput = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
    // console.log(gestureOutput); // 콘솔에 제스처 정보 출력
  } else {
    // console.log("none"); // 만약 제스처가 없다면 "none" 출력
  }
}

async function expressionDetection() {
  // 표정 detect
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  let maxExpression = undefined;
  if (detections[0] != undefined) {
    let expressionsResult = [
      { name: "neutral", value: detections[0].expressions.neutral },
      { name: "happy", value: detections[0].expressions.happy },
      { name: "sad", value: detections[0].expressions.sad },
      { name: "angry", value: detections[0].expressions.angry },
      { name: "fearful", value: detections[0].expressions.fearful },
      { name: "disgusted", value: detections[0].expressions.disgusted },
      { name: "surprised", value: detections[0].expressions.surprised },
    ];

    maxExpression = expressionsResult.reduce((max, current) => {
      return max.value > current.value ? max : current;
    }, expressionsResult[0]);

    // console.log("현재 표정: ", maxExpression.name, maxExpression.value);
    return maxExpression;
  }
}

// results_faceLandmarker 객체에서 얼굴 랜드마크를 추출하고 캔버스에 해당 랜드마크를 그리는 역할
function drawFaceMarker(results_faceLandmarker) {
  // results_faceLandmarker 객체에서 얼굴 랜드마크를 가져옵니다.
  for (const landmarks of results_faceLandmarker.faceLandmarks) {
    // 얼굴 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: "#C0C0C070", lineWidth: 1 }
    );
    // 오른쪽 눈 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: "#FF3030" }
    );
    // 오른쪽 눈썹 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: "#FF3030" }
    );
    // 왼쪽 눈 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: "#30FF30" }
    );
    // 왼쪽 눈썹 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: "#30FF30" }
    );
    // 얼굴 윤곽 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: "#E0E0E0" }
    );
    // 입 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: "#E0E0E0",
    });
    // 오른쪽 눈동자 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: "#FF3030" }
    );
    // 왼쪽 눈동자 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: "#30FF30" }
    );
  }
}

function detectPoseLandmarks() {
  let startTimeMs = performance.now();
  let results_poseLandmarker;
  poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
      });
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }
    canvasCtx.restore();
    results_poseLandmarker = result;
  });

  return results_poseLandmarker;
}
