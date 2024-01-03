var change_text_speak = (text) => {
  $('#guide_text').text(text);
};
change_text_speak('하이');

let detect_result = null;

$(window).on('load', function () {
  detect_camera();
});
var detect_camera = () => {
  detect_result = JSON.parse(localStorage.getItem('Detect_Result'));
  console.log(detect_result);
  // detect_camera();
};