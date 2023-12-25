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
