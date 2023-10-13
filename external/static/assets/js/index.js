const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/external/static/assets/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/external/static/assets/models"),
]).then(startVideo);

//Using webcam
// function startVideo() {
//   navigator.mediaDevices
//     .getUserMedia({ video: true })
//     .then(function (stream) {
//       video.srcObject = stream;
//     })
//     .catch(function (err) {
//       console.log(err);
//     });
// }

function startVideo() {
  const videoStream = video.captureStream();
  videoStream.addEventListener("addtrack", () => {
    const videoTrack = videoStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    setInterval(async () => {
      try {
        const bitmap = await imageCapture.grabFrame();
        const detections = await faceapi
          .detectAllFaces(bitmap, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
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

video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});
