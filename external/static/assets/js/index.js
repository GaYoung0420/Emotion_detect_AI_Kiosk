// video 요소를 HTML 문서에서 가져옵니다.
const video = document.getElementById("video");

// 캔버스 요소를 문서에서 가져와 변수로 선언합니다.
const canvas = document.createElement("canvas");
document.body.append(canvas);

// faceapi.js에서 사용되는 여러 모델을 비동기적으로 로드합니다.
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/external/static/assets/models"),
]).then(startVideo); // 모든 모델이 성공적으로 로드되면 startVideo 함수를 호출합니다.

// 비디오 스트림에서 얼굴을 감지하고 특징 및 표정을 표시하는 함수입니다.
function startVideo() {
  // 비디오 스트림에서 track을 가져옵니다.
  const videoStream = video.captureStream();

  // 비디오 트랙이 추가될 때마다 실행되는 이벤트 리스너를 설정합니다.
  videoStream.addEventListener("addtrack", () => {
    // 비디오 트랙과 관련된 ImageCapture 객체를 생성합니다.
    const videoTrack = videoStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);

    // 일정 시간 간격으로 비디오 프레임을 캡처하고 얼굴을 감지하여 화면에 표시합니다.
    setInterval(async () => {
      try {
        // 비디오 프레임을 가져와서 얼굴 감지 및 표현을 수행합니다.
        const bitmap = await imageCapture.grabFrame();
        const detections = await faceapi
          .detectAllFaces(bitmap, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        // 캔버스를 지우고, 감지된 얼굴의 위치, 특징, 표정을 캔버스에 그립니다.
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      } catch (error) {
        console.error(error);
      }
    }, 100);
  });
}

// 비디오가 재생될 때 실행되는 이벤트 리스너를 설정합니다.
video.addEventListener("playing", () => {
  // 얼굴 감지 결과를 표시할 캔버스를 생성하고 문서에 추가합니다.
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  // 캔버스의 크기를 비디오의 크기와 일치시킵니다.
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // 일정 시간 간격으로 비디오 프레임을 가져와서 얼굴을 감지하고 표현을 표시합니다.
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    // 캔버스를 지우고, 감지된 얼굴의 위치, 특징, 표정을 캔버스에 그립니다.
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});
