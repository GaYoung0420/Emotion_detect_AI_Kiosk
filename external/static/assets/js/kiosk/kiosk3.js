//$("input[name='radioName']:checked").val();

var menu = {
  name: '',
  price: 0,
  count: 0,
  img: '',
  options: {
    temp: '',
    size: '',
    coffeebean: '',
  },
  add_options: {
    coffee_shot: {
      options: '',
      price: 0,
    },
    ice: {
      options: '',
      price: 0,
    },
    syrup: {
      options: '',
      price: 0,
    },
  },
};

var add_options = {
  coffee_shot: 'two_shot',
  ice: 'two_ice',
  syrup: '',
};

// 금액 설정
var set_price = () => {
  let option_coffee_shot = menu.add_options.coffee_shot.price;
  let option_ice = menu.add_options.ice.price;
  let option_syrup = menu.add_options.syrup.price;
  let count_price = lastData.price;
  menu.price = count_price + option_coffee_shot + option_ice + option_syrup;

  $('.menu_price_info').text((menu.price * menu.count).toLocaleString('ko-KR'));
};

// 수량 설정
var set_count = (add_info) => {
  if (add_info) {
    menu.count += 1;
    $('.set_count').text(menu.count);
    set_price();
  } else {
    if (menu.count > 1) {
      menu.count -= 1;
      $('.set_count').text(menu.count);
      set_price();
    }
  }
};

var set_options = (info, value) => {
  switch (info) {
    case 'temp':
      menu.options.temp = value;
      break;
    case 'size':
      menu.options.size = value;
      break;
    case 'coffeebean':
      menu.options.coffeebean = value;
      break;
    case 'coffee_shot':
      menu.add_options.coffee_shot.options = value;
      if (value === 'three_shot') menu.add_options.coffee_shot.price = 300;
      else menu.add_options.coffee_shot.price = 0;
      break;
    case 'ice':
      menu.add_options.ice.options = value;
      if (value === 'three_ice') menu.add_options.ice.price = 300;
      else menu.add_options.ice.price = 0;
      break;
    case 'syrup':
      menu.add_options.syrup.options = value;
      menu.add_options.syrup.price = 500;
      break;
    default:
      break;
  }
  console.log(menu);
};

// 선택한 메뉴 옵션 화면에 뿌리기
if (localStorage.getItem('selectMenu')) {
  var lastData = JSON.parse(localStorage.getItem('selectMenu'));

  console.log(lastData);
  menu.name = lastData.text;
  menu.img = lastData.img;
  menu.price = lastData.price;
  menu.count = 1;
  set_price();
  $('.menu_title').text(lastData.text);
  $('.menu_title_info').text(lastData.explain);
  $('.menu_price_data').text(lastData.price.toLocaleString('ko-KR'));
  $('.menu_option_img').attr('src', lastData.img);
  $('.set_count').text(menu.count);
}

// ******************** 이벤트 핸들러 ********************

// 추가선택사항 옵션 활성화
$('#add_option_button').click(function () {
  $('#add_option').removeClass('none_class');

  let select_option = (class_name, id_name) => {
    console.log(class_name, id_name);
    change_svg_filter(true, class_name);
    $(id_name).prop('checked', true);
    let select_value = $('input:radio[name=coffee_shot]:checked').val();
    console.log(select_value);
  };

  if (
    menu.add_options.coffee_shot.options === '' &&
    menu.add_options.ice.options === ''
  ) {
    $('#two_shot').prop('checked', true);
    change_svg_('two_shot', 'one_shot', 'two_shot', 'three_shot');
    $('#two_ice').prop('checked', true);
    change_svg_('two_ice', 'one_ice', 'two_ice', 'three_ice');

    $('#vanilla').prop('checked', false);
    $('#hazelnut').prop('checked', false);
    $('#caramel').prop('checked', false);
    change_svg_filter(false, '.option_svg_vanilla');
    change_svg_filter(false, '.option_svg_hazelnut');
    change_svg_filter(false, '.option_svg_caramel');
  } else {
    let coffee_shot = menu.add_options.coffee_shot.options;
    let ice = menu.add_options.ice.options;
    let syrup = menu.add_options.syrup.options;
    $('#' + coffee_shot).prop('checked', true);
    $('#' + ice).prop('checked', true);
    change_svg_(coffee_shot, 'one_shot', 'two_shot', 'three_shot');
    change_svg_(ice, 'one_ice', 'two_ice', 'three_ice');

    if (menu.add_options.syrup.options !== '') {
      console.log(syrup);
      $('#' + syrup).prop('checked', true);
      change_svg_(syrup, 'vanilla', 'hazelnut', 'caramel');
    }
  }
});

//옵션 확인 버튼
$('.able_option_btn').click(function () {
  set_options('coffee_shot', add_options.coffee_shot);
  set_options('ice', add_options.ice);
  if (add_options.syrup !== '') set_options('syrup', add_options.syrup);
  $('#add_option').addClass('none_class');
  set_price();
});

$('.cancel_option_btn').click(function () {
  add_options.coffee_shot = menu.add_options.coffee_shot.options;
  add_options.ice = menu.add_options.ice.options;
  add_options.syrup = menu.add_options.syrup.options;
  $('#add_option').addClass('none_class');
});

// 장바구니에 담기 버튼
$('#add_to_cart_button').click(function () {
  if (
    $('input:radio[name=temp]').is(':checked') &&
    $('input:radio[name=size]').is(':checked') &&
    $('input:radio[name=coffeebean]').is(':checked')
  ) {
    let cart_item = JSON.parse(localStorage.getItem('Cart'));

    if (cart_item == undefined) {
      localStorage.setItem('Cart', JSON.stringify([menu]));
    } else {
      cart_item.push(menu);
      console.log(cart_item);
      localStorage.setItem('Cart', JSON.stringify(cart_item));
    }

    window.location.href = '../html/kiosk_2_Menu_select.html';
  } else {
    $('#alert').removeClass('none_class');
  }
});

$('#alert_check').click(function () {
  $('#alert').addClass('none_class');
});
// 수량 조절 버튼 클릭시
$('#add_item_btn').click(function () {
  set_count(true);
});

$('#delete_item_btn').click(function () {
  set_count(false);
});

// 온도 선택 라디오 버튼 클릭시
$('input:radio[name=temp]').click(function () {
  set_options('temp', $("input[name='temp']:checked").val());
  if ($('#ice').is(':checked')) {
    //체크되어있을때 실행
    $('.option_svg_cold').css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    //체크해제되어있을때 실행
    $('.option_svg_cold').css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
  if ($('#hot').is(':checked')) {
    //체크되어있을때 실행
    $('.option_svg_hot').css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    //체크해제되어있을때 실행
    $('.option_svg_hot').css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
});

// 사이즈 선택 라디오 버튼 클릭시
$('input:radio[name=size]').click(function () {
  set_options('size', $("input[name='size']:checked").val());
  if ($('#small').is(':checked')) {
    //체크되어있을때 실행
    $('.option_svg_small').css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    //체크해제되어있을때 실행
    $('.option_svg_small').css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
  if ($('#medium').is(':checked')) {
    //체크되어있을때 실행
    $('.option_svg_medium').css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    //체크해제되어있을때 실행
    $('.option_svg_medium').css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
  if ($('#large').is(':checked')) {
    //체크되어있을때 실행
    $('.option_svg_large').css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    //체크해제되어있을때 실행
    $('.option_svg_large').css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
});

// 원두 선택 라디오 버튼 클릭시
$('input:radio[name=coffeebean]').click(function () {
  set_options('coffeebean', $("input[name='coffeebean']:checked").val());
  if ($('#esspreso').is(':checked')) {
    //체크되어있을때 실행
    $('.option_svg_esspreso').css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    //체크해제되어있을때 실행
    $('.option_svg_esspreso').css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
  if ($('#decaffeine').is(':checked')) {
    //체크되어있을때 실행
    $('.option_svg_decaffeine').css(
      'filter',
      'invert(100%) sepia(17%) saturate(410%) hue-rotate(186deg) brightness(123%) contrast(100%)',
    );
  } else {
    //체크해제되어있을때 실행
    $('.option_svg_decaffeine').css(
      'filter',
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
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
      'invert(32%) sepia(0%) saturate(0%) hue-rotate(355deg) brightness(100%) contrast(87%)',
    );
  }
};

var change_svg_ = (select_value, first, second, third) => {
  switch (select_value) {
    case first:
      change_svg_filter(true, '.option_svg_' + first);
      change_svg_filter(false, '.option_svg_' + second);
      change_svg_filter(false, '.option_svg_' + third);
      break;
    case second:
      change_svg_filter(false, '.option_svg_' + first);
      change_svg_filter(true, '.option_svg_' + second);
      change_svg_filter(false, '.option_svg_' + third);
      break;
    case third:
      change_svg_filter(false, '.option_svg_' + first);
      change_svg_filter(false, '.option_svg_' + second);
      change_svg_filter(true, '.option_svg_' + third);
      break;
    default:
      break;
  }
};

// 원두 선택 라디오 버튼 클릭시
$('input:radio[name=coffee_shot]').click(function () {
  var select_value = $('input:radio[name=coffee_shot]:checked').val();
  add_options.coffee_shot = select_value;
  change_svg_(select_value, 'one_shot', 'two_shot', 'three_shot');
});

// 얼음 선택 라디오 버튼 클릭 시
$('input:radio[name=ice]').click(function () {
  var select_value = $('input:radio[name=ice]:checked').val();
  add_options.ice = select_value;
  change_svg_(select_value, 'one_ice', 'two_ice', 'three_ice');
});

// 시럽 선택 라디오 버튼 클릭 시
$('input:radio[name=syrup]').click(function () {
  var select_value = $('input:radio[name=syrup]:checked').val();
  add_options.syrup = select_value;
  change_svg_(select_value, 'vanilla', 'hazelnut', 'caramel');
});
