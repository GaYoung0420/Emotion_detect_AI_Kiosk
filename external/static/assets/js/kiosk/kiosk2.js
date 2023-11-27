let json = $('.MenuContainer').css('border', 'solid 1px red');

let menuData = JSON.parse(JSON.stringify(MenuFile));
let select_category = 'coffee';

// var num = '2';
// $('#menu' + num)
//   .find('img')
//   .attr('src', '../img/menu/digital_cafe_latte.png');

// console.log(category_num);





const change_menu = (category) => {
  var category_num = Math.ceil(menuData[category][0].length / 6);
  set_paging_button(category_num);
  menuData[category][0].forEach((element, index) => {
    console.log(element);
  });
};

const set_paging_button = (category_num)=>{

  for(let i=0; i<category_num; i++){
    if(i=0)
  }
  
}

change_menu(select_category);


/*

page에 따라서 메뉴 흩뿌리기

1 2 3 4 5 6
7 8 9 10 11 12


index+1

*/

