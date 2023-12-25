var cart_item = JSON.parse(localStorage.getItem('Cart'));
var place_value = JSON.parse(localStorage.getItem('Option'));
var menu = ['1', '2', '3'];
$(window).on('load', function () {
  if (place_value) {
    $("input:radio[name='place']:radio[value=" + place_value.place + ']').prop(
      'checked',
      true,
    );
  }
  if (cart_item) {
    set_orderlist(cart_item);
  }
  console.log(cart_item);
});

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

var set_orderlist = (cart_item) => {
  let swiper_slide_container = 0;
  cart_item.forEach((element, index) => {
    if (index % 3 == 0) {
      console.log(index);
      swiper_slide_container++;
      $('.swiper-wrapper').append(
        '<div class="swiper-slide" style="flex-direction: column; display: flex; align-items: center;" ><div id="swiper_slide_container' +
          swiper_slide_container +
          '"></div></div>',
      );
    }
    /*
    {
    "name": "에스프레소 콘파냐",
    "price": 2000,
    "count": 1,
    "img": "../img/menu/digital_espresso_conpa.png",
    "option_text": "옵션 : 따뜻함,보통,디카페인",
    "options": {
        "temp": "hot",
        "size": "medium",
        "coffeebean": "decaffeine"
    },
    "add_options": {
        "coffee_shot": {
            "options": "",
            "price": 0
        },
        "ice": {
            "options": "",
            "price": 0
        },
        "syrup": {
            "options": "",
            "price": 0
        }
    },
    "idname": "coffee4"
}
     */
    $('#swiper_slide_container' + swiper_slide_container).append(
      '<div class="order_container"> <div class="order_product_info_container center_cantainer"> <div class="product_img"> <div class="list_number center_cantainer">' +
        (index + 1) +
        '</div> <div class="img_menu_container center_cantainer"> <img class="img_menu" src="' +
        element.img +
        '" style="height: 130px" /> </div> </div> <div style=" height: 205px; padding-top: 20px; padding-left: 5px; position: relative; " > <div class="menu_title_text">' +
        element.name +
        '</div> <div class="option_text">' +
        element.option_text +
        '</div> <div style="position: absolute; bottom: 11px; right: 110px" > <button class="option_change_button">옵션 변경</button> </div> </div> </div> <div class="count_info_container center_cantainer"> <div class="count_info_sub_container center_cantainer"> <button class="count_control">-</button> <text class="count_font">' +
        element.count +
        '</text> <button class="count_control">+</button> </div> </div> <div class="price_container center_cantainer"> <text class="price_text" >' +
        element.price.toLocaleString('ko-KR') +
        ' <span style="font-size: 35px">원</span></text > </div> <div class="delete_container center_cantainer"> <button class="delete_button">X</button> </div> </div>',
    );
  });
};
