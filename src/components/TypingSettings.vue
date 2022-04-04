<template>
	<el-row :gutter="2">
		<el-col :span="4">
			<el-select placeholder="双拼方案" :teleported="false" popper-class="schemeSelect" v-model="configPage.settings.schemeName">
				<el-button @click="addNewScheme">添加新方案</el-button>
				<el-divider border-style="dashed" />
				<el-option-group v-for="schemeGroup in schemeGroups" :key="schemeGroup" :label="schemeGroup.groupName">
					<el-option v-for="scheme in schemeGroup.schemeList" :label="scheme" :value="scheme" />
				</el-option-group>
			</el-select>
		</el-col>
		<el-col :span="4">
			<el-select placeholder="练习模式" :teleported="false" popper-class="schemeSelect" v-model="configPage.settings.typingModel">
				<el-option-group label="单字练习">
					<el-option label="顺序练习" value="wordOrder" />
					<el-option label="随机练习" value="wordRandom" />
				</el-option-group>
				<el-option-group label="短文练习">
					<el-option label="双拼输入" value="doubleTyping" disabled />
					<el-option label="中文输入" value="chineseTyping" disabled />
				</el-option-group>
			</el-select>
		</el-col>
	</el-row>
</template>

<script setup>
// 获取父组件传入的值
const props = defineProps(['configPage', 'configPage']);
const emit = defineEmits(['addNewScheme']);

const configPage = props.configPage, // 设置
	schemeGroups = configPage.schemeGroups // 方案分组信息

console.log('typingSettings: ', configPage);
function addNewScheme(){
	emit('addNewScheme');
}
</script>

<style scoped="scoped">
.el-row {
	width: 100%;
}
.el-select {
	width: 100px;
}
:deep(.schemeSelect) {
	background-color: var(--selectOptionBackColor);
}
.el-select:deep(.el-input__inner) {
	text-align: right;
	box-shadow: none;
}
.el-scrollbar .el-button {
	padding: 0 20%;
	margin-top: -4px;
	background-color: var(--selectOptionBackColor);
	border: none;
	color: #00b6c9;
}
.el-scrollbar .el-button:hover {
	color: #0097a7;
	background-color: var(--selectAddButtonBackColor);
}
.el-select-dropdown__item.selected {
	background-color: #0000;
}
.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
	background-color: #aaaa;
}
.el-select-dropdown__item.is-disabled.hover,
.el-select-dropdown__item.is-disabled:hover {
	background-color: #0000;
}
.el-divider--horizontal {
	margin: 0;
}
</style>
