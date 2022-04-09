<template>
  <div id="contextmenu" v-show="menuVisible" class="menu">
    <div
      v-for="context in contextList"
      :key="context"
      class="contextmenu_item"
      @click="selectItem(context.click)"
    >
      {{ context.label }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// 从父组件获取数据
let props = defineProps(["contextList"]);
// 从父组件获取方法
let emits = defineEmits(["selectContext"]);
// 声明页面所需数据
let menuVisible = ref(false), // 是否显示菜单
  contextList = props.contextList; // 菜单列表
console.log("contextList: ", contextList);

// 实现一个右键菜单
function rightClick(key) {
  menuVisible.value = false; // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
  menuVisible.value = true; // 显示模态窗口，跳出自定义菜单栏
  var menu = document.querySelector(".menu");
  styleMenu(key, menu);
}
function foo() {
  // 取消鼠标监听事件 菜单栏
  menuVisible.value = false;
  document.removeEventListener("click", foo); // 关掉监听
}
function styleMenu(key, menu) {
  document.addEventListener("click", foo); // 给整个document新增监听鼠标事件，点击任何位置执行foo方法
  menu.style.left = key.clientX + "px";
  menu.style.top = key.clientY + "px";
  // 如果点击位置在菜单栏的右边，则菜单栏的位置往左移动
  let menuWidth = 100;
  if (key.clientX + menuWidth + 20 > document.body.clientWidth) {
    menu.style.left = key.clientX - menuWidth + "px";
  }
  // 如果点击位置在菜单栏的下方，则菜单栏的位置往上移动
  let menuHeight = contextList.length === 1 ? 34 : contextList.length * 35 + 1;
  if (key.clientY + menuHeight + 20 > document.body.clientHeight) {
    menu.style.top = key.clientY - menuHeight + "px";
  }
}
// 绑定右键菜单栏事件
document.addEventListener("contextmenu", rightClick);

// 定义方法
// 右键菜单栏选择项
function selectItem(cb) {
  cb();
}
</script>

<style scope>
.menu {
  position: absolute;
  background-color: #fff;
  width: 100px;
  /*height: 106px;*/
  font-size: 12px;
  color: #444040;
  border-radius: 4px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  white-space: nowrap;
  z-index: 1000;
}
.contextmenu_item {
  display: block;
  line-height: 34px;
  text-align: center;
}
.contextmenu_item:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.contextmenu_item:hover {
  cursor: pointer;
  background: #66b1ff;
  border-color: #66b1ff;
  color: #fff;
}
</style>