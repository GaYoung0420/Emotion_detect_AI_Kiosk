var cart_item = JSON.parse(localStorage.getItem('Cart'));
var option = JSON.parse(localStorage.getItem('Option'));
var result_price = 0;
$(window).on('load', function () {
  if (cart_item) {
    cart_item.forEach((element) => {
      result_price += element.price * element.count;
    });
  }
  $('#result_price').text(result_price.toLocaleString('ko-KR'));
});

var change_svg_filter = (change, class_name) => {
  if (change) {
    $(class_name).css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    $(class_name).css(
      'filter',
      'invert(29%) sepia(7%) saturate(4483%) hue-rotate(182deg) brightness(90%) contrast(88%)',
    );
  }
};

var change_svg_ = (select_value, first, second, third, fourth) => {
  switch (select_value) {
    case first:
      change_svg_filter(true, '.option_svg_' + first);
      change_svg_filter(false, '.option_svg_' + second);
      change_svg_filter(false, '.option_svg_' + third);
      change_svg_filter(false, '.option_svg_' + fourth);
      break;
    case second:
      change_svg_filter(false, '.option_svg_' + first);
      change_svg_filter(true, '.option_svg_' + second);
      change_svg_filter(false, '.option_svg_' + third);
      change_svg_filter(false, '.option_svg_' + fourth);
      break;
    case third:
      change_svg_filter(false, '.option_svg_' + first);
      change_svg_filter(false, '.option_svg_' + second);
      change_svg_filter(true, '.option_svg_' + third);
      change_svg_filter(false, '.option_svg_' + fourth);
      break;
    case fourth:
      change_svg_filter(false, '.option_svg_' + first);
      change_svg_filter(false, '.option_svg_' + second);
      change_svg_filter(false, '.option_svg_' + third);
      change_svg_filter(true, '.option_svg_' + fourth);
      break;
    default:
      change_svg_filter(false, '.option_svg_' + first);
      change_svg_filter(false, '.option_svg_' + second);
      change_svg_filter(false, '.option_svg_' + third);
      change_svg_filter(false, '.option_svg_' + fourth);
      break;
  }
};

$('input:radio[name=payment]').click(function () {
  var select_value = $('input:radio[name=payment]:checked').val();
  change_svg_(select_value, 'mobile_cupon', 'gift_card', 'mobile_pay', 'cash');
});

$('.ok_button').click(() => {
  var select_value = $('input:radio[name=payment]:checked').val();
  if (select_value != null) {
    option.payment = select_value;
    localStorage.setItem('Option', JSON.stringify(option));
    window.location.href = '../html/kiosk_8_pay.html';
  }
});

$('.no_button').click(() => {
  history.back();
});
