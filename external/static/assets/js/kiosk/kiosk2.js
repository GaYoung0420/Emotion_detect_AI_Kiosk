// let json = $('.MenuContainer').css('border', 'solid 1px red');

let menuData = JSON.parse(JSON.stringify(MenuFile));
var menu = ['1', '2', '3'];
let select_category = 'coffee';
let total_price = 0;
let total_count = 0;
let right_btn_count = 0;
let left_btn_count = 0;
$(window).on('load', function () {
  change_menu($('input[name=category]:checked').val());
  swiper.update();
  change_cart();
});

// 스와이프
var swiper = new Swiper('.swiper-container', {
  spaceBetween: 10, //슬라이드 간격
  pagination: {
    //페이징 사용자 설정
    el: '.swiper-pagination', //페이징 태그 클래스 설정
    clickable: true, //버튼 클릭 여부
    type: 'bullets', //페이징 타입 설정(종류: bullets, fraction, progressbar)
    // Bullet Numbering 설정
    renderBullet: function (index, className) {
      return '<span class="' + className + '">' + menu[index] + '</span>';
    },
  },
  // nav 화살표 출력 시 추가
  navigation: {
    prevEl: '.swiper-button-prev',
    nextEl: '.swiper-button-next',
  },
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

// 메뉴 바뀜
const change_menu = (category) => {
  let swiper_slide_container = 0;
  let menuRowContainer = 0;
  menuData[category].forEach((element, index) => {
    // console.log(element);
    /*
    catagory : "coffee"
    explain : "더 진한 독창적인 풍미의 다크 초콜릿의 풍미를 느낄 수 있는 커피"
    img : "../img/menu/digital_espresso.png"
    price :"1,500"
    text : "에스프레소"
    */
    let idname = category + index;
    if (index % 6 == 0) {
      swiper_slide_container++;
      $('.swiper-wrapper').append(
        "<div class='swiper-slide'><div id='swiper_slide_container" +
          swiper_slide_container +
          "' class='swiper-slide-container center_cantainer'></div></div++>",
      );
    }
    if (index % 3 == 0) {
      menuRowContainer++;
      $('#swiper_slide_container' + swiper_slide_container).append(
        "<div id='menuRowContainer" +
          menuRowContainer +
          "' class='menuRowContainer'></div>",
      );
    }
    $('#menuRowContainer' + menuRowContainer).append(
      '<button id =' +
        idname +
        ' class="menuBtn"><div class="menuImg"> <img  src=' +
        element.img +
        ' /></div><div id="menuName">' +
        element.text +
        '</div><div id="menuPrice">' +
        formatNumberWithCommas(element.price) +
        ' 원</div></button>',
    );

    $('#' + idname).click(function () {
      if (category == 'coffee' || category == 'tea') {
        window.location.href = '../html/kiosk_3_Select_option.html';
        element.idname = idname;
        console.log(element.idname);
        localStorage.setItem('selectMenu', JSON.stringify(element));
      } else {
        let cart_item = JSON.parse(localStorage.getItem('Cart'));
        var menu = {
          id: idname,
          name: element.text,
          price: element.price,
          option_text: '',
          count: 1,
          img: element.img,
          options: {
            temp: '',
            size: '',
            coffeebean: '',
          },
        };

        if (cart_item == undefined) {
          localStorage.setItem('Cart', JSON.stringify([menu]));
          change_cart();
        } else {
          similiar_check(cart_item, menu);
          change_cart();
        }
      }
    });
  });
};

$('.cart_delete').click(function () {
  if (localStorage.getItem('Cart')) {
    var cartData = [];
    localStorage.setItem('Cart', JSON.stringify(cartData));
    change_cart();
  }
});

/*
{
  "name": "아메리카노",
  "price": 3600,
  "count": 2,
  "options": {
    "temp": "hot",
    "size": "large",
    "coffeebean": "decaffeine"
  },
  "add_options": {
    "coffee_shot": {
      "options": "one_shot",
      "price": 0
    },
    "ice": {
      "options": "three_ice",
      "price": 300
    },
    "syrup": {
      "options": "hazelnut",
      "price": 500
    }
  }
}
*/

// cart 변경
const change_cart = () => {
  $('.cart_list_container').empty();
  var cartData = JSON.parse(localStorage.getItem('Cart'));
  console.log(cartData);
  total_count = 0;
  total_price = 0;

  if (cartData === null || cartData.length === 0) {
    right_btn_count = 0;
    left_btn_count = 0;
    $('#cart_count').text(total_count);
    $('#cart_price').text(total_price.toLocaleString('ko-KR'));
    $('.cart_list_container').append(
      '<div class="menu_select_subcontainer"> <text style="font-size: 30px; color: #8d909f; font-weight: 700">주문내역이 없습니다. 메뉴를 선택해주세요</text></div>',
    );
  } else if (cartData) {
    right_btn_count = 0;
    left_btn_count = 0;
    cartData.forEach((element, index) => {
      total_price += element.price * element.count;
      total_count += element.count;
      $('#cart_count').text(total_count);
      $('#cart_price').text(total_price.toLocaleString('ko-KR'));

      $('.cart_list_container').append(
        '<div class="cart_list_background"> <div class="center_cantainer" style="width: 100%; gap: 190px"> <div class="cart_list_number center_cantainer">' +
          (index + 1) +
          '</div> <button id="delete' +
          index +
          '" class="cart_delete_icon center_cantainer"> <img src="../svg/cart_delete.svg" />삭제</button></div><div class="cart_info_sub_conatiner"><img class="cart_menu_img" src="' +
          element.img +
          '"/> <div class="cart_container_info_sub_conatiner"> <div class="cart_menu_name">' +
          element.name +
          '</div> <div class="cart_info_text"> <span>' +
          element.option_text +
          '</span> </div> </div> </div> <div class="center_cantainer" style="width: 100%;"> <div class="center_cantainer" style="gap: 10px; width:150px;"> <img id ="minus' +
          index +
          '" src="../svg/delete_to_cart_icon.svg" /> <text class="count_info_text"><span id = "count' +
          index +
          '">' +
          element.count +
          '</span>개</text> <img id = "add' +
          index +
          '" src="../svg/add_to_cart_icon.svg" /> </div> <div class="price_text">' +
          (element.price * element.count).toLocaleString('ko-KR') +
          ' <span class="price_won">원</span></div></div></div>',
      );

      localStorage.setItem('Cart', JSON.stringify(cartData));

      // console.log($('.cart_list_container').scrollLeft());
      // console.log(
      //   $('.cart_list_container').prop('scrollWidth') / cartData.length,
      // );
      $('#add' + index).click(function () {
        change_count_price('add', element, index, cartData);
        change_cart();
      });

      $('#minus' + index).click(function () {
        change_count_price('minus', element, index, cartData);
        change_cart();
      });

      $('#delete' + index).click(function () {
        cartData.splice(index, 1);
        localStorage.setItem('Cart', JSON.stringify(cartData));
        change_cart();
      });
    });
    right_btn_count = cartData.length - 2;
    if (cartData.length == 3) {
      $('.cart_list_container').animate({ scrollLeft: 205 }, 500);
      $('#cart_left_btn').addClass('abled_menut_btn');
    } else {
      $('.cart_list_container').animate(
        { scrollLeft: 380 * right_btn_count + 205 },
        500,
        'linear',
      );
      $('#cart_left_btn').addClass('abled_menut_btn');
    }
  }
};

$('#cart_right_btn').click(() => {
  $('.cart_list_container').animate(
    { scrollLeft: $('.cart_list_container').scrollLeft() + 347 },
    300,
  );
  change_btn();
});

$('#cart_left_btn').click(() => {
  if ($('#cart_left_btn').hasClass('abled_menut_btn') === true)
    $('.cart_list_container').animate(
      { scrollLeft: $('.cart_list_container').scrollLeft() - 347 },
      300,
    );
  change_btn();
});

var change_btn = () => {
  var cartData = JSON.parse(localStorage.getItem('Cart'));

  console.log(
    $('.cart_list_container').prop('scrollWidth') -
      $('.cart_list_container').scrollLeft(),
  );
  if (
    $('.cart_list_container').prop('scrollWidth') -
      $('.cart_list_container').scrollLeft() >
      901 &&
    cartData.length >= 3
  ) {
    $('#cart_right_btn').addClass('abled_menut_btn');
  } else {
    $('#cart_right_btn').removeClass('abled_menut_btn');
  }

  if ($('.cart_list_container').scrollLeft() > 0) {
    $('#cart_left_btn').addClass('abled_menut_btn');
  } else {
    $('#cart_left_btn').removeClass('abled_menut_btn');
  }
};

var change_count_price = (func, element, index, cartData) => {
  console.log(func, element, index, cartData);
  if (func == 'add') {
    total_price -= element.count * element.price;
    element.count += 1;
    total_count += 1;
    total_price += element.count * element.price;
  } else if (func == 'minus') {
    element.count -= 1;
    total_price -= element.price;
    total_count -= 1;
  }

  if (element.count == 0) {
    cartData.splice(index, 1);
    localStorage.setItem('Cart', JSON.stringify(cartData));
    change_cart();
  } else {
    localStorage.setItem('Cart', JSON.stringify(cartData));
  }
  $('#count' + index).text(element.count);
  $('#cart_count').text(total_count);
  $('#cart_price').text(total_price.toLocaleString('ko-KR'));
};

// Function to format number with commas
function formatNumberWithCommas(number) {
  return number.toLocaleString('ko-KR');
}
$('input:radio[name=category]').click(function () {
  var value = $('input[name=category]:checked').val();

  var category_num = Math.ceil(menuData[value].length / 6);

  $('.swiper-wrapper').empty();
  // $('.swiper-pagination').empty();
  // $('.swiper-pagination').empty();
  // if (category_num == 1) {
  //   $('.swiper-pagination').append(
  //     '<span class="swiper-pagination-bullet swiper-pagination-bullet-active" tabindex="0" aria-current="true"> 1 </span>;',
  //   );
  // }
  change_menu(value);
  swiper.update();

  swiper.slideTo(0);
});
