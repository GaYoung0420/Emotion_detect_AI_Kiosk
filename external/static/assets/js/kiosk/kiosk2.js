// let json = $('.MenuContainer').css('border', 'solid 1px red');
$(window).on('load', function () {
  change_menu($('input[name=category]:checked').val());
});
let menuData = JSON.parse(JSON.stringify(MenuFile));
var menu = ['1', '2', '3'];
let select_category = 'coffee';

// var num = '2';
// $('#menu' + num)
//   .find('img')
//   .attr('src', '../img/menu/digital_cafe_latte.png');

// console.log(category_num);

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
      // swiper_slide++;
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
      window.location.href = '../html/kiosk_3_Select_option.html';
      localStorage.setItem('selectMenu', JSON.stringify(element));
    });
  });
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

