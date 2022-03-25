<template>
	<el-header>header</el-header>

	<el-main><HelloWorld /></el-main>
</template>

<script setup>
import HelloWorld from './components/HelloWorld.vue';
</script>

<style>
html,
body {
	height: 100%;
	margin: 0;
	padding: 0;
}

:root {
	--backgroundColor: #eeeeee;
	--boxBottom: 0px -2px 0px #0097a7 inset;
	--fontColor: #141414;
	--trueKeyBackColor: #bed5be;
	--buttonBackColor: #d3dce6;
	--keyMapShengColor: #12a9e0;
	--buttonFontColor: #585a5f;
}

@media (prefers-color-scheme: dark) {
	:root {
		--backgroundColor: #333333;
		--fontColor: #adadad;
		--trueKeyBackColor: #415c41;
		--buttonBackColor: #333333;
		--keyMapShengColor: #ad593a;
		--buttonFontColor: #adadad;
	}
}

#app {
	background-color: var(--backgroundColor);
	height: 100%;
	color: var(--fontColor);
}

.el-input__inner {
	background-color: var(--backgroundColor);
}

.el-header {
	display: flex;
	justify-content: center;
}
</style>
