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

import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';
const {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
  HandLandmarker,
  PoseLandmarker,
  GestureRecognizer,
} = vision;
const demosSection = document.getElementById('demos');
const imageBlendShapes = document.getElementById('image-blend-shapes');
const videoBlendShapes = document.getElementById('video-blend-shapes');

let faceLandmarker = undefined;
let poseLandmarker = undefined;
let gestureRecognizer = undefined;
let runningMode = 'IMAGE';
let webcam1Running = false;
let webcam2Running = false;
let webcam_state = false;
const videoWidth = 480;

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.

let deviceId1 = null;
let deviceId2 = null;
let number = 1;
// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

var getWebcams = function () {
  return navigator.mediaDevices.enumerateDevices().then((devices) => {
    devices.forEach((device) => {
      if (device.kind === 'videoinput') {
        if (device.label === 'SPC-A1200MB Webcam (0c45:6340)')
          webcam1Running = true;
        else if (device.label === 'SC-FD110B PC Camera (1bcf:2284)')
          webcam2Running = true;
      }
      if (webcam1Running == true && webcam2Running == true) {
        webcam_state = true;
      }

      console.log('AAA');

      //webcam1Running
      // console.log(
      //   device.kind +
      //     ': LABEL = "' +
      //     device.label +
      //     '" ID = ' +
      //     device.deviceId,
      // );
    });

    return devices.filter((device) => {
      return device.kind === 'videoinput';
    });
  });
};
var startWebcamStream = function (webcamDevice) {
  var constraints = {
    audio: false,
    video: {
      optional: [
        {
          sourceId: webcamDevice.deviceId,
        },
      ],
    },
    deviceId: {
      exact: webcamDevice.deviceId,
    },
  };

  console.log(
    'Starting webcam stream with device ID = ' + webcamDevice.deviceId,
  );

  var successCallback = function (stream) {
    // $('#right').append(
    //   '<div>LABEL = "SPC-A1200MB Webcam (0c45:6340)"<br> ID = WebCam"1"</div><video autoplay></video>',
    // );
    var container = document.getElementById('video-container' + number);
    var video = document.createElement('video');
    video.id = 'webcam' + number;
    var canvas = document.createElement('canvas');
    canvas.classList.add('output_canvas');
    canvas.id = 'output_canvas' + number;
    video.autoplay = true;
    setVideoStream(video, stream);
    var row = document.createElement('div');
    row.innerHTML =
      'LABEL = "' + webcamDevice.label + '"<br> ID = 웹캠' + number;
    row.classList.add('text_info');
    container.appendChild(row);
    container.appendChild(video);
    container.appendChild(canvas);

    video.addEventListener('loadeddata', () => {
      console.log('Video ' + number + ' loaded');
      predictWebcam(canvas, canvas.getContext('2d'), video);
    });
    number += 1;
    console.log(
      'Webcam stream with device ID = ' +
        webcamDevice.deviceId +
        ', LABEL = "' +
        webcamDevice.label +
        '" started',
      'success',
    );
  };

  var errorCallback = function (error) {
    console.log(
      'Webcam stream with device ID = ' +
        webcamDevice.deviceId +
        ', LABEL = "' +
        webcamDevice.label +
        '" failed to start: ' +
        error,
      'error',
    );
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(successCallback)
    .catch(errorCallback);
};

var setVideoStream = function (video, stream) {
  try {
    video.srcObject = stream;
  } catch (error) {
    video.src = window.URL.createObjectURL(stream);
  }
};

var checkWebcamResolution = function (width, height) {
  return new Promise(function (resolve) {
    var successCallback = function (stream) {
      var video = document.createElement('video');
      video.autoplay = true;
      setVideoStream(video, stream);

      right.appendChild(video);

      video.onloadedmetadata = function (e) {
        if (width === video.videoWidth && height === video.videoHeight) {
          console.log(
            'Webcam stream successfully started in <strong>' +
              width +
              'x' +
              height +
              '</strong>',
            'success',
          );
        } else {
          console.log(
            'Webcam stream failed to start in <strong>' +
              width +
              'x' +
              height +
              '</strong>, instead started in <strong>' +
              video.videoWidth +
              'x' +
              video.videoHeight +
              '</strong>',
            'error',
          );
        }

        setTimeout(function () {
          stream.getTracks().forEach(function (track) {
            track.stop();
          });

          video.remove();
          resolve();
        }, 500);
      };
    };

    var errorCallback = function () {
      log(
        'Webcam stream failed to start in <strong>' +
          width +
          'x' +
          height +
          '</strong>',
        'error',
      );
      resolve();
    };

    mediaDevices
      .getUserMedia({
        video: {
          width: {
            exact: width,
          },
          height: {
            exact: height,
          },
        },
      })
      .then(successCallback)
      .catch(errorCallback);
  });
};
// 미디어파이프의 모델을 초기화하고 웹캠 스트림을 활성화하여 감지된 얼굴, 손, 포즈, 제스처 등을 예측하는 모델 로드하는 함수
const enableCam = async () => {
  // FilesetResolver를 사용하여 미디어파이프 모델을 로드합니다.
  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
  );

  // 얼굴 랜드마커 모델을 초기화합니다.
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    // 모델 경로 및 실행 모드를 설정합니다.
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
  });

  // 포즈 랜드마커 모델을 초기화합니다.
  poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
    // 모델 경로 및 실행 모드를 설정합니다.
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 2,
  });

  // 제스처 인식 모델을 초기화합니다.
  gestureRecognizer = await GestureRecognizer.createFromOptions(
    filesetResolver,
    {
      // 모델 경로 및 실행 모드를 설정합니다.
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
    },
  );

  // 모든 모델이 로드되었는지 확인하고 로드되지 않았다면 메시지를 출력하고 함수를 종료합니다.
  if (!faceLandmarker || !poseLandmarker || !gestureRecognizer) {
    console.log('Wait! model is not loaded yet.');
    return;
  }
  console.log('Start');
  getWebcams().then((webcamDevices) => {
    webcamDevices.forEach((webcamDevice) => {
      startWebcamStream(webcamDevice);
    });
  });
  // const test = async () => {
  //   await navigator.mediaDevices
  //     .enumerateDevices()
  //     .then((devices) => {
  //       devices.forEach((device) => {
  //         if (device.kind === 'videoinput') {
  //           if (device.label === 'SPC-A1200MB Webcam (0c45:6340)')
  //             deviceId1 = device.deviceId;
  //           else if (device.label === 'SC-FD110B PC Camera (1bcf:2284)')
  //             deviceId2 = device.deviceId;
  //         }
  //       });
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };
  // test();

  // // getUserMedia()를 지원하는지 확인하고 웹캠 스트림을 활성화합니다.
  // if (hasGetUserMedia()) {

  //   navigator.mediaDevices
  //     .getUserMedia({
  //       video: {
  //         deviceId: deviceId1,
  //       },
  //     })
  //     .then((stream) => {
  //       console.log('deviceId1 : ' + deviceId1);
  //       console.log(stream);

  //       video1.srcObject = stream;
  //       video1.addEventListener('loadeddata', () => {
  //         console.log('Video 1 loaded');
  //         // predictWebcam(canvasElement1, canvasCtx1, video1);
  //       });
  //       webcam1Running = true;
  //     });

  //   // "SC-FD110B PC Camera (1bcf:2284)"
  //   // 웹캠 스트림을 활성화하고 예측 함수(predictWebcam)를 호출합니다.

  //   navigator.mediaDevices
  //     .getUserMedia({
  //       video: {
  //         deviceId: deviceId2,
  //       },
  //     })
  //     .then((stream) => {
  //       console.log('deviceId2 : ' + deviceId2);
  //       console.log(stream);
  //       video2.srcObject = stream;
  //       video2.addEventListener('loadeddata', () => {
  //         console.log('Video 2 loaded');
  //         // predictWebcam(canvasElement2, canvasCtx2, video2);
  //       });
  //       webcam2Running = true;
  //     });
  // } else {
  //   // getUserMedia()를 지원하지 않는 경우 경고 메시지를 출력합니다.
  //   console.warn('getUserMedia() is not supported by your browser');
  // }
};

// enableCam();

// faceapi.js에서 사용되는 여러 모델을 비동기적으로 로드합니다.
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
  faceapi.nets.faceExpressionNet.loadFromUri('../models'),
]).then(enableCam); // 모든 모델이 성공적으로 로드되면 startVideo 함수를 호출합니다.

let lastVideoTime = -1;
let results_faceLandmarker = undefined;
let results_gestureRecognizer = undefined;
let results_poseLandmarker = undefined;
let results_expression = undefined;

let isEyeBlinkDetected = false;
let isJawOpen = false;
let eyeBlinkStartTime = 0;
let JawOpenStartTime = 0;

let DetectRaisingArmPose = false; // 팔을 들고 있는 것
let DetectPointingGesture = false; // 포인팅하는 손
let DetectNegativeExpression; //부정적인 표정
let DetectGrimaceFace = false; // 눈을 찡그림
let DetectJawOpen = false; // 눈을 찡그림

// 웹캠 비디오 스트림에서 얼굴과 손을 감지하고 해당 랜드마크를 캔버스에 그리는 함수
async function predictWebcam(canvasElement, canvasCtx, video) {
  const drawingUtils = new DrawingUtils(canvasCtx);

  // 캔버스의 크기를 웹캠 비디오의 크기에 맞게 조정합니다.
  canvasElement.style.width = video.videoWidth;
  canvasElement.style.height = video.videoHeight;

  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  // 미디어파이프 모델을 실행하는 모드를 설정합니다.
  // 'IMAGE' 모드에서 'VIDEO' 모드로 변경합니다.
  if (runningMode === 'IMAGE') {
    runningMode = 'VIDEO';
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
      nowInMs,
    );
  }
  DetectRaisingArmPose = false; // 팔을 들고 있는 것
  DetectPointingGesture = false; // 포인팅하는 손
  DetectNegativeExpression = false; //부정적인 표정
  DetectGrimaceFace = false; // 눈을 찡그림
  DetectJawOpen = false; // 눈을 찡그림

  results_faceLandmarker = faceLandmarker.detectForVideo(video, startTimeMs);

  results_poseLandmarker = detectPoseLandmarks(
    drawingUtils,
    video,
    canvasElement,
    canvasCtx,
  );

  // 손의 랜드마크를 캔버스에 그리는 함수
  // drawGesturePredict(
  //   results_gestureRecognizer,
  //   drawingUtils,
  //   canvasElement,
  //   canvasCtx,
  // );

  // 얼굴의 랜드마크를 캔버스에 그리는 함수
  // drawFaceMarker(results_faceLandmarker, drawingUtils);

  // console.log(DetectNegativeExpression);

  // 감정 Detector
  // expressionDetection(video);

  // 눈 찡그림 인식
  isEyeBlinkDetectedFunc(results_faceLandmarker);

  isMouthOpen(results_faceLandmarker);

  // 손을 포인팅하여 들고있는 자세 인식
  isPointingUpKiosk(results_gestureRecognizer, results_poseLandmarker);

  predictTroubleContext(video);

  // 웹캠이 실행 중일 경우, 브라우저가 준비될 때마다 이 함수를 다시 호출하여 지속적으로 예측합니다.
  if (webcam_state === true) {
    window.requestAnimationFrame(() => {
      const video1 = document.getElementById('webcam1');
      const canvasElement1 = document.getElementById('output_canvas1');
      const canvasCtx1 = canvasElement1.getContext('2d');

      const video2 = document.getElementById('webcam2');
      const canvasElement2 = document.getElementById('output_canvas2');
      const canvasCtx2 = canvasElement2.getContext('2d');
      predictWebcam(canvasElement1, canvasCtx1, video1);
      predictWebcam(canvasElement2, canvasCtx2, video2);
    });
  }
}

// 키오스크 사용시 어려움을 겪는 것을 확인하기 위한 함수
var webcam1_result = {
  DetectRaisingArmPose: false,
  pointingGestureResult: false,
  negativeExpressionResult: false,
  grimaceFaceResult: false,
  jawOpenResult: false,
};

var webcam2_result = {
  DetectRaisingArmPose: false,
  pointingGestureResult: false,
  negativeExpressionResult: false,
  grimaceFaceResult: false,
  jawOpenResult: false,
};
function predictTroubleContext(video) {
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

    let DetectRaisingArmPose = false; // 팔을 들고 있는 것
    let DetectPointingGesture = false; // 포인팅하는 손
    let DetectNegativeExpression; //부정적인 표정
    let DetectGrimaceFace = false; // 눈을 찡그림
    let DetectJawOpen = false; // 눈을 찡그림
  
  */

  // JavaScript 코드에서 결과를 HTML에 표시하는 부분
  // 결과를 HTML 요소에 표시하고 true일 경우 텍스트 색상을 파란색으로 변경하는 함수

  if (video.id === 'webcam1') {
    webcam1_result.DetectRaisingArmPose = DetectRaisingArmPose;
    webcam1_result.pointingGestureResult = DetectPointingGesture;
    webcam1_result.negativeExpressionResult = DetectNegativeExpression;
    webcam1_result.grimaceFaceResult = DetectGrimaceFace;
    webcam1_result.jawOpenResult = DetectJawOpen;
  } else if (video.id === 'webcam2') {
    webcam2_result.DetectRaisingArmPose = DetectRaisingArmPose;
    webcam2_result.pointingGestureResult = DetectPointingGesture;
    webcam2_result.negativeExpressionResult = DetectNegativeExpression;
    webcam2_result.grimaceFaceResult = DetectGrimaceFace;
    webcam2_result.jawOpenResult = DetectJawOpen;
  }

  function displayResult(labelId) {
    let value = false;
    let webcam1_result_value = false;
    let webcam2_result_value = false;
    switch (labelId) {
      case 'raisingArmPoseResult':
        webcam1_result_value = webcam1_result.raisingArmPoseResult;
        webcam2_result_value = webcam2_result.raisingArmPoseResult;
        break;
      case 'pointingGestureResult':
        webcam1_result_value = webcam1_result.pointingGestureResult;
        webcam2_result_value = webcam2_result.pointingGestureResult;
        break;
      case 'negativeExpressionResult':
        webcam1_result_value = webcam1_result.negativeExpressionResult;
        webcam2_result_value = webcam2_result.negativeExpressionResult;
        break;
      case 'grimaceFaceResult':
        webcam1_result_value = webcam1_result.grimaceFaceResult;
        webcam2_result_value = webcam2_result.grimaceFaceResult;
        break;
      case 'jawOpenResult':
        console.log(
          'webcam1_result.jawOpenResult : ' + webcam2_result.jawOpenResult,
        );
        console.log(
          'webcam2_result.jawOpenResult : ' + webcam2_result.jawOpenResult,
        );
        webcam1_result_value = webcam1_result.jawOpenResult;
        webcam2_result_value = webcam2_result.jawOpenResult;
        break;
      default:
        break;
    }
    if (webcam1_result_value === true || webcam2_result_value === true) {
      value = true;
    }
    console.log(value);
    // const resultElement = document.getElementById(labelId);
    $('#' + labelId).text(`${labelId}: ${value}`);
    $('#' + labelId).css('color', value ? 'blue' : 'red');
    // resultElement.textContent = `${labelId}: ${value}`;
    // resultElement.style.color = value ? 'blue' : 'red';
  }

  // 함수 호출 예시
  displayResult('raisingArmPoseResult');
  displayResult('pointingGestureResult');
  displayResult('negativeExpressionResult');
  displayResult('grimaceFaceResult');
  displayResult('jawOpenResult');

  // 1. 터치를 할려고 하는가 (자세 확인)
  // if (DetectRaisingArmPose) {
  //   if (DetectGrimaceFace) {
  //   }
  // }
}

function isPointingUpKiosk(results_gestureRecognizer, results_poseLandmarker) {
  /*
    1. 터치를 하려고 하는 자세를 확인
        // 팔꿈치(14 - right elbow or 13 - left elbow)가 손(20 - right index, 19 - left index)보다 아래에 위치하면 손을 들고 있는 자세
        // Pointing gesture를 취하고 있으면 터치를 할려고하는 자세를 확인할 수 있음
  
  */

  const landmarksPoseLandmarker = results_poseLandmarker.landmarks[0];
  const gestures = results_gestureRecognizer.gestures[0];

  if (
    landmarksPoseLandmarker &&
    landmarksPoseLandmarker[13] !== undefined &&
    landmarksPoseLandmarker[14] !== undefined &&
    landmarksPoseLandmarker[20] !== undefined &&
    landmarksPoseLandmarker[19] !== undefined &&
    gestures &&
    gestures[0] !== undefined
  ) {
    let rightElbow_position = landmarksPoseLandmarker[14];
    let leftElbow_position = landmarksPoseLandmarker[13];
    let rightIndex_position = landmarksPoseLandmarker[20];
    let leftIndex_position = landmarksPoseLandmarker[19];

    let pointing_gesture = gestures[0];
    if (
      rightElbow_position.y < rightIndex_position.y ||
      leftElbow_position.y < leftIndex_position.y
    ) {
      DetectRaisingArmPose = true; // 팔을 들고 있는 것
      // console.log("팔 들었음");
    }
    if (pointing_gesture.categoryName === 'Pointing_Up') {
      DetectPointingGesture = true; // 포인팅하는 손
      // console.log("Pointing_Up");
    }
  }
}

// 눈 찡그림 인식
function isEyeBlinkDetectedFunc(results_faceLandmarker) {
  const faceBlendshapes = results_faceLandmarker.faceBlendshapes[0];
  let currentTime = Date.now();
  let elapsedTime = (currentTime - eyeBlinkStartTime) / 1000; // 경과 시간(초) 계산
  if (
    faceBlendshapes &&
    faceBlendshapes.categories[9] !== undefined &&
    faceBlendshapes.categories[10] !== undefined
  ) {
    let eyeBlinkLeft = results_faceLandmarker.faceBlendshapes[0].categories[9];
    let eyeBlinkRight =
      results_faceLandmarker.faceBlendshapes[0].categories[10];
    if (eyeBlinkLeft.score > 0.3 && eyeBlinkRight.score > 0.3) {
      // 찡그림이 감지됨
      if (!isEyeBlinkDetected) {
        // 처음으로 찡그림이 감지된 경우, 시작 시간을 기록
        eyeBlinkStartTime = currentTime;
        isEyeBlinkDetected = true;
      } else if (elapsedTime >= 1) {
        // 찡그림이 지속되고 3초 이상 경과한 경우
        // console.log("찡그림");
        DetectGrimaceFace = true;
      }
    } else {
      // 찡그림이 감지되지 않음
      isEyeBlinkDetected = false;
      DetectGrimaceFace = false;
      // console.log("찡그림X");
    }
  }
}

// 입 벌림 인식
function isMouthOpen(results_faceLandmarker) {
  const faceBlendshapes = results_faceLandmarker.faceBlendshapes[0];
  // console.log(faceBlendshapes.categories[25]);
  let currentTime = Date.now();
  // console.log(faceBlendshapes.categories[25]);
  // let elapsedTime = (currentTime - eyeBlinkStartTime) / 1000; // 경과 시간(초) 계산
  if (faceBlendshapes && faceBlendshapes.categories[25] !== undefined) {
    let jawOpen = faceBlendshapes.categories[25];
    if (jawOpen.score > 0.1) {
      // console.log("입벌림 " + jawOpen.score);

      // 입벌림이 감지됨
      // if (!isJawOpen) {
      //   // 처음으로 찡그림이 감지된 경우, 시작 시간을 기록
      //   JawOpenStartTime = currentTime;
      //   isJawOpen = true;
      // } else if (elapsedTime >= 3) {
      //   // 입벌림이 지속되고 3초 이상 경과한 경우
      DetectJawOpen = true;
      // }
    } else {
      // 입벌림이 감지되지 않음
      isJawOpen = false;
      DetectJawOpen = false;
      // console.log("찡그림X");
    }
  }
}

// 표정 Recognition 하는 함수
async function expressionDetection(video) {
  // 표정 detect
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  let maxExpression = undefined;
  if (detections[0] != undefined) {
    let expressionsResult = [
      { name: 'neutral', value: detections[0].expressions.neutral },
      { name: 'happy', value: detections[0].expressions.happy },
      { name: 'sad', value: detections[0].expressions.sad },
      { name: 'angry', value: detections[0].expressions.angry },
      { name: 'fearful', value: detections[0].expressions.fearful },
      { name: 'disgusted', value: detections[0].expressions.disgusted },
      { name: 'surprised', value: detections[0].expressions.surprised },
    ];

    maxExpression = expressionsResult.reduce((max, current) => {
      return max.value > current.value ? max : current;
    }, expressionsResult[0]);

    if (
      (maxExpression.name === 'sad' ||
        maxExpression.name === 'angry' ||
        maxExpression.name === 'fearful' ||
        maxExpression.name === 'disgusted' ||
        maxExpression.name === 'surprised') &&
      maxExpression.value > 0.8
    ) {
      DetectNegativeExpression = true;
      // console.log(
      //   "부정적 표정 감지: ",
      //   maxExpression.name,
      //   maxExpression.value
      // );
    } else {
      DetectNegativeExpression = false;
    }
  }
}

//////////////////////////////// Drawing ********************************
//주어진 results_gestureRecognizer 객체를 기반으로 화면에 손의 특징점 및 제스처를 그리는 함수
function drawGesturePredict(
  results_gestureRecognizer,
  drawingUtils,
  canvasElement,
  canvasCtx,
) {
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
          color: '#00FF00',
          lineWidth: 5,
        },
      );
      drawingUtils.drawLandmarks(landmarks, {
        color: '#FF0000',
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
      results_gestureRecognizer.gestures[0][0].score * 100,
    ).toFixed(2);
    const handedness = results_gestureRecognizer.handednesses[0][0].displayName;
    const gestureOutput = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
    // console.log(gestureOutput); // 콘솔에 제스처 정보 출력
  } else {
    // console.log("none"); // 만약 제스처가 없다면 "none" 출력
  }
}

// results_faceLandmarker 객체에서 얼굴 랜드마크를 추출하고 캔버스에 해당 랜드마크를 그리는 역할
function drawFaceMarker(results_faceLandmarker, drawingUtils) {
  // results_faceLandmarker 객체에서 얼굴 랜드마크를 가져옵니다.
  for (const landmarks of results_faceLandmarker.faceLandmarks) {
    // 얼굴 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: '#C0C0C070', lineWidth: 1 },
    );
    // 오른쪽 눈 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: '#FF3030' },
    );
    // 오른쪽 눈썹 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: '#FF3030' },
    );
    // 왼쪽 눈 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: '#30FF30' },
    );
    // 왼쪽 눈썹 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: '#30FF30' },
    );
    // 얼굴 윤곽 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: '#E0E0E0' },
    );
    // 입 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: '#E0E0E0',
    });
    // 오른쪽 눈동자 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: '#FF3030' },
    );
    // 왼쪽 눈동자 주변의 랜드마크를 연결하는 선을 그립니다.
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: '#30FF30' },
    );
  }
}

// pose 그리는 함수
function detectPoseLandmarks(drawingUtils, video, canvasElement, canvasCtx) {
  let startTimeMs = performance.now();
  let results_poseLandmarker;
  poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
    // canvasCtx.save();
    // canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // for (const landmark of result.landmarks) {
    //   drawingUtils.drawLandmarks(landmark, {
    //     radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
    //   });
    //   drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    // }
    // canvasCtx.restore();
    results_poseLandmarker = result;
  });

  return results_poseLandmarker;
}
