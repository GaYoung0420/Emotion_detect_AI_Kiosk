if (localStorage.getItem('selectMenu')) {
  var lastData = JSON.parse(localStorage.getItem('selectMenu'));
  console.log(lastData);
  $('.menu_title').text(lastData.text);
  $('.menu_title_info').text(lastData.explain);
  $('.menu_price_data').text(lastData.price.toLocaleString('ko-KR'));
  $('.menu_option_img').attr("src", lastData.img);

}

// const set_option_page = () => {
  
// };


/*
explain
: 
"독창적인 풍미의 다크 초콜릿의 풍미를 느낄 수 있는 커피"
img
: 
"../img/menu/digital_americano.png"
price
: 
1400
text
: 
"아메리카노"


*/
