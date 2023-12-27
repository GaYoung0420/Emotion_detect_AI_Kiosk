var card_insert_timer = () => {
  setTimeout(function () {
    card_pay();
  }, 10000);
};

var card_pay = () => {
  $('#card_pay').addClass('none_class');
  $('#card_pay_ing').fadeIn(1000);
  setTimeout(function () {
    window.location.href = '../html/kiosk_9_Print_receipts.html';
  }, 5000);
};

$('#card_pay').click(() => {
  card_pay();
});

card_insert_timer();
