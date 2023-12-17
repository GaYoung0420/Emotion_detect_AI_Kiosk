if (localStorage.getItem('selectMenu')) {
  var lastData = JSON.parse(localStorage.getItem('selectMenu'));
  console.log(lastData);
  $('.menu_title').text(lastData.text);
  $('.menu_title_info').text(lastData.explain);
  $('.menu_price_data').text(lastData.price.toLocaleString('ko-KR'));
  $('.menu_option_img').attr('src', lastData.img);
}

$('input:radio[name=temp]').click(function () {
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
});