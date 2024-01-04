// var change_text_speak = (text) => {
//   $('#guide_text').text(text);
// };
// change_text_speak('하이');

// let detect_result = null;

// $(window).on('load', function () {
//   window.requestAnimationFrame(detect_camera);
// });

// var detect_camera = () => {
//   detect_result = JSON.parse(localStorage.getItem('Detect_Result'));
//   console.log(detect_result);
//   // detect_camera();
// };

// const detect_camera = () => {
//   detect_result = JSON.parse(localStorage.getItem('Detect_Result'));
//   if (detect_result != null) {
//     console.log(detect_result.DetectJawOpen);
//   }
//   window.requestAnimationFrame(detect_camera);
// };

// var move_baner = (select_value) => {
//   if (select_value) {
//     $('#baner').removeClass('fade_in');
//     $('#baner').addClass('fade_out');
//   } else {
//     $('#baner').removeClass('fade_out');
//     $('#baner').addClass('fade_in');
//   }
// };

// addEventListener('storage', (event) => {
//   detect_result = JSON.parse(localStorage.getItem('Detect_Result'));
//   if (detect_result != null) {
//     console.log(detect_result.DetectJawOpen);

//     move_baner(select_value);
//   }
// });
