//$("input[name='radioName']:checked").val();

var menu = {
  name: '',
  price: 0,
  count: 0,
  img: '',
  option_text: '',
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

var set_options_texts = (options, add_options) => {
  let option_array = new Array();
  if (options.temp != ' ') {
    switch (options.temp) {
      case 'hot':
        option_array.push('옵션 : ');
        option_array.push('따뜻함');
        break;
      case 'ice':
        option_array.push('옵션 : ');
        option_array.push('차가움');
        break;
    }
    switch (options.size) {
      case 'small':
        option_array.push('작게');
        break;
      case 'medium':
        option_array.push('보통');
        break;
      case 'large':
        option_array.push('크게');
        break;
    }
    switch (options.coffeebean) {
      case 'esspreso':
        option_array.push('에스프레소');
        break;
      case 'decaffeine':
        option_array.push('디카페인');
        break;
    }
    if (add_options !== undefined) {
      switch (add_options.coffee_shot.options) {
        case 'one_shot':
          option_array.push('커피 연하게');
          break;
        case 'two_shot':
          option_array.push('보통 진하게');
          break;
        case 'three_shot':
          option_array.push('진하게');
          break;
      }
      switch (add_options.ice.options) {
        case 'one_ice':
          option_array.push('얼음 적게');
          break;
        case 'two_ice':
          option_array.push('얼음 보통');
          break;
        case 'three_ice':
          option_array.push('얼음 많게');
          break;
      }
      switch (add_options.syrup.options) {
        case 'vanilla':
          option_array.push('바닐라시럽');
          break;
        case 'hazelnut':
          option_array.push('헤이즐넛시럽');
          break;
        case 'caramel':
          option_array.push('카라멜시럽');
          break;
      }
    }
  }

  let option_text = '';

  if (options != undefined || add_options !== undefined) {
    option_array.forEach((element, index) => {
      if (index == 0) {
        option_text = element;
      } else if (index == 1) {
        option_text = option_text.concat(element);
      } else {
        option_text = option_text.concat(',' + element);
      }
    });
  }

  return option_text;
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
var lastData = JSON.parse(localStorage.getItem('selectMenu'));

$(window).on('load', function () {
  // 선택한 메뉴 옵션 화면에 뿌리기

  if (localStorage.getItem('selectMenu')) {
    if (
      lastData.text === '히비스커스티' ||
      lastData.text === '캐모마일티' ||
      lastData.text === '페퍼민트티'
    ) {
      $('#coffeebean_container').addClass('invisible');
    }
    console.log(lastData);
    menu.name = lastData.text;
    menu.img = lastData.img;
    menu.price = lastData.price;
    menu.count = 1;
    menu.idname = lastData.idname;
    set_price();
    $('.menu_title').text(lastData.text);
    $('.menu_title_info').text(lastData.explain);
    $('.menu_price_data').text(lastData.price.toLocaleString('ko-KR'));
    $('.menu_option_img').attr('src', lastData.img);
    $('.set_count').text(menu.count);
  }
});

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

const similiar_check = (cartData, menu) => {
  let compare_name = false;

  cartData.forEach((element) => {
    if (element.name === menu.name) {
      element.count += 1;
      compare_name = true;
      return false;
    }
  });

  if (!compare_name) {
    cartData.push(menu);
  }
  localStorage.setItem('Cart', JSON.stringify(cartData));
};

// 장바구니에 담기 버튼
$('#add_to_cart_button').click(function () {
  if (
    $('input:radio[name=temp]').is(':checked') &&
    $('input:radio[name=size]').is(':checked')
  ) {
    if (
      $('input:radio[name=coffeebean]').is(':checked') ||
      lastData.text === '히비스커스티' ||
      lastData.text === '캐모마일티' ||
      lastData.text === '페퍼민트티'
    ) {
      let cart_item = JSON.parse(localStorage.getItem('Cart'));
      menu.option_text = set_options_texts(menu.options, menu.add_options);
      console.log(menu.option_text);
      if (cart_item == undefined) {
        localStorage.setItem('Cart', JSON.stringify([menu]));
      } else {
        var compare_name = false;

        cart_item.forEach((element, index) => {
          console.log(
            element.name == menu.name &&
              element.option_text == menu.option_text,
          );
          if (
            element.name == menu.name &&
            element.option_text == menu.option_text
          ) {
            console.log('AA');
            element.count += menu.count;
            compare_name = true;
          }
        });
        if (!compare_name) {
          cart_item.push(menu);
        }
        localStorage.setItem('Cart', JSON.stringify(cart_item));
      }
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
