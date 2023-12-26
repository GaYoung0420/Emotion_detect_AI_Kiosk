var place_value = JSON.parse(localStorage.getItem('Option'));
var inputElement = document.getElementById('txtPhone');

inputElement.addEventListener('input', function () {
  autoHyphen2();
});

function appendToInput(number) {
  if (inputElement.value.length < 13) {
    inputElement.value += number;
    console.log(inputElement.value.length);
    autoHyphen2();
  }
}

function backspace() {
  var inputValue = inputElement.value.replace(/\D/g, '');
  inputElement.value = inputValue.slice(0, -1); // Remove the last character
  autoHyphen2();
}

function clearInput() {
  inputElement.value = ''; // Clear all content
  autoHyphen2();
}

const autoHyphen2 = () => {
  inputElement.value = inputElement.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
    .replace(/(\-{1,2})$/g, '');
};

$('#earn_point_btn ').click(() => {
  $('.select_point_container').addClass('none_class');
  $('.input_phone_number_container').removeClass('none_class');
});

$('#no_earn_point_btn ').click(() => {
  place_value.point = { number: '' };
  localStorage.setItem('Option', JSON.stringify(place_value));
  window.location.href = '../html/kiosk_7_Choose_payment_method.html';
});

$('.no_button').click(() => {
  $('.select_point_container').removeClass('none_class');
  $('.input_phone_number_container').addClass('none_class');
});

$('.ok_button').click(() => {
  if (inputElement.value.length < 13 || inputElement.value == null) {
    $('.add_option_select_conatiner').removeClass('none_class');
  } else {
    place_value.point = { number: inputElement.value };
    localStorage.setItem('Option', JSON.stringify(place_value));
    window.location.href = '../html/kiosk_7_Choose_payment_method.html';
  }
});

$('#alert_check').click(() => {
  $('.add_option_select_conatiner').addClass('none_class');
});
