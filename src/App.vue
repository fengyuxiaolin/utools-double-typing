<template>
	<el-header>header</el-header>

	<el-main>
		<HelloWorld />
	</el-main>
</template>

<script setup>
	import HelloWorld from './components/HelloWorld.vue'
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
		--boxBottom: 0px -2px 0px #0097A7 inset;
		--fontColor: #141414;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--backgroundColor: #333333;
			--boxBottom: 0px -2px 0px #0097A7 inset;
			--fontColor: #eeeeee;
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

	.el-header,
	.el-main {
		display: flex;
		justify-content: center;
	}
</style>
