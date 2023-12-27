var option = JSON.parse(localStorage.getItem('Option'));

$('#recepit_yes').click(() => {
  option.recepit = true;
  localStorage.setItem('Option', JSON.stringify(option));
  window.location.href = '../html/kiosk_10_pay_complete.html';
});

$('#recepit_no').click(() => {
  option.recepit = false;
  localStorage.setItem('Option', JSON.stringify(option));
  window.location.href = '../html/kiosk_10_pay_complete.html';
});
