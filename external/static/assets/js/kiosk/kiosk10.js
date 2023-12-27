var timer = () => {
  setTimeout(function () {
    complete();
  }, 5000);
};

var complete = () => {
  $('#complete_container').addClass('none_class');
  $('#card_container').fadeIn(1000);
  setTimeout(function () {}, 5000);
};

timer();

$('.goto_homeBtn').click(() => {
  window.location.href = '../html/kiosk_1_Touch_screen.html';
});
