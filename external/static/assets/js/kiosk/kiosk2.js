let json = $('.MenuContainer').css('border', 'solid 1px red');

let menuData = JSON.parse(JSON.stringify(MenuFile));
console.log(menuData);

var num = '2';
$('#menu' + num)
  .find('img')
  .attr('src', '../img/menu/digital_cafe_latte.png');

const change_menu = (category) => {
  menuData[category][0].forEach((element, index) => {
    console.log(element);
  });
};

1 2 3 4 5 6
7 8 9 10 11 12
index+1


change_menu('coffee');
