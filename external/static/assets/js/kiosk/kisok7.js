var cart_item = JSON.parse(localStorage.getItem('Cart'));
var place_value = JSON.parse(localStorage.getItem('Option'));
var result_price = 0;
$(window).on('load', function () {
  if (cart_item) {
    cart_item.forEach((element) => {
      result_price += element.price * element.count;
    });
  }
  $('#result_price').text(result_price.toLocaleString('ko-KR'));
});
