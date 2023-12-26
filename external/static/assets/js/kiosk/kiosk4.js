var place_value = JSON.parse(localStorage.getItem('Option'));

var change_svg_filter = (change, class_name) => {
  if (change) {
    $(class_name).css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    $(class_name).css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
};

var change_svg_ = (select_value, first, second) => {
  switch (select_value) {
    case first:
      change_svg_filter(true, '.option_svg_' + first);
      change_svg_filter(false, '.option_svg_' + second);
      break;
    case second:
      change_svg_filter(false, '.option_svg_' + first);
      change_svg_filter(true, '.option_svg_' + second);
      break;
    default:
      break;
  }
};

$(window).on('load', function () {
  if (place_value) {
    change_svg_(place_value.place, 'restaurant', 'takeout');
    $("input:radio[name='place'][value='" + place_value.place + "']").prop(
      'checked',
      true,
    );
  }
});

$('input:radio[name=place]').click(function () {
  var select_value = $('input:radio[name=place]:checked').val();
  change_svg_(select_value, 'restaurant', 'takeout');
  place_value = select_value;
});

$('.ok_button').click(() => {
  var option = { place: place_value };
  localStorage.setItem('Option', JSON.stringify(option));
  window.location.href = '../html/kiosk_5_Check_order.html';
});

$('.no_button').on('click', function () {
  history.back();
});

// localStorage.setItem('Cart', JSON.stringify(cartData));
