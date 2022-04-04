<template>
	<div>
		<el-form ref="newSchemeForm" :model="formData" :rules="rules" label-width="px" class="newSchemeForm">
			<el-row>
				<el-col :span="8">
					<el-form-item label="方案名称" prop="schemeFinallyName">
						<el-input
							v-model="formData.schemeFinallyName"
							placeholder="选择或输入方案"
							filterable
							default-first-option
							allow-create
							:style="{ width: '100%' }"
							@change="changeSchemeName"
						></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8" :offset="4">
					<el-form-item label="所属分组" prop="groupName">
						<el-select v-model="formData.groupName" placeholder="请选择所属分组" filterable allow-create default-first-option clearable :style="{ width: '100%' }">
							<el-option
								v-for="(schemeGroup, index) in configPage.schemeGroups"
								:key="index"
								:label="schemeGroup.groupName"
								:value="schemeGroup.groupName"
							></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="8">
					<el-form-item label="模板方案" prop="schemeModelName">
						<el-select v-model="formData.schemeModelName" placeholder="选择模板方案" filterable clearable :style="{ width: '100%' }" @change="changeSchemeName">
							<el-option v-for="(model, index) in modelOptions" :key="index" :label="model" :value="model"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="4" :offset="4">
					<el-form-item label="音节" prop="syllable">
						<el-select v-model="formData.syllable" placeholder="请选择音节" filterable :style="{ width: '100%' }" @change="changeSyllable">
							<el-option-group label="声母">
								<el-option v-for="(keyboard, sheng, index) in syllableOptions.sheng" :key="index" :label="sheng" :value="sheng"></el-option>
							</el-option-group>
							<el-option-group label="韵母">
								<el-option v-for="(keyboard, yun, index) in syllableOptions.yun" :key="index" :label="yun" :value="yun"></el-option>
							</el-option-group>
							<el-option-group label="零声母">
								<el-option v-for="(keyboard, zero, index) in syllableOptions.zero" :key="index" :label="zero" :value="'zero' + zero"></el-option>
							</el-option-group>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="7" :offset="1">
					<el-form-item label="按键" prop="keyboard">
						<el-select
							v-model="formData.keyboard"
							placeholder="请选择按键"
							filterable
							default-first-option
							allow-create
							:style="{ width: '100%' }"
							:collapse-tags-tooltip="true"
							collapse-tags
							@blur="checkKeyboard"
							ref="keyboard"
						>
							<el-option v-for="(item, index) in keyboardOptions" :key="index" :label="item" :value="item"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row justify="end">
				<el-form-item>
					<el-button @click="resetForm" class="resetForm">重置</el-button>
					<el-button type="success" @click="submitForm">提交</el-button>
				</el-form-item>
			</el-row>
		</el-form>
		<el-drawer v-model="drawer" title="保存方案失败" direction="btt">
			<div v-if="syllableNotDefineList.sheng.length > 0">
				<p>以下声母未指定按键, 且自动绑定失败:</p>
				<p>{{ syllableNotDefineList.sheng }}</p>
			</div>
			<div v-if="syllableNotDefineList.yun.length > 0">
				<p>以下韵母未指定按键, 且自动绑定失败:</p>
				<p>{{ syllableNotDefineList.yun }}</p>
			</div>
			<div v-if="syllableNotDefineList.zero.length > 0">
				<p>以下零声母未指定按键(零声母需手动设置双拼键位):</p>
				<p>{{ syllableNotDefineList.zero }}</p>
			</div>
		</el-drawer>
	</div>
</template>
<script>
export default {
	components: {},
	props: ['configPage', 'configDb'],
	data() {
		// 校验键位并暂存
		var checkKeyboard = (rule, value, callback) => {
			let volid = true;
			if (value.length > 0) {
				this.formData.keyboard = value.toUpperCase();
				value = this.formData.keyboard;
				// 如果当前音节不是零声母, 则对应单个按键
				if (this.formData.syllable.indexOf('zero') === -1) {
					if (this.keyboardOptions.indexOf(value) === -1) {
						this.formData.keyboard = '';
						callback(new Error('按键不可用'));
						volid = false;
					}
					// 每个按键只对应一个声母
					if (this.syllableOptions.sheng[this.formData.syllable]) {
						Object.keys(this.syllableOptions.sheng).forEach(sheng => {
							if (this.syllableOptions.sheng[sheng] == value.toLowerCase() && sheng != this.formData.syllable.toLowerCase()) {
								this.formData.keyboard = '';
								callback(new Error('声母按键冲突'));
								volid = false;
							}
						});
					}
				} else {
					if (value.length === 1) {
						// 零声母对应两个按键
						if (this.keyboardOptions.indexOf(value) !== -1) {
							value += value;
							this.formData.keyboard = value;
						} else {
							this.formData.keyboard = '';
							callback(new Error('按键不可用'));
							volid = false;
						}
					} else if (value.length !== 2) {
						this.formData.keyboard = '';
						callback(new Error('按键不可用'));
						volid = false;
					} else {
						value.split('').forEach(v => {
							if (this.keyboardOptions.indexOf(v) === -1) {
								this.formData.keyboard = '';
								callback(new Error('按键不可用'));
								volid = false;
							}
						});
					}
				}
				if (this.formData.syllable != '' && volid) {
					if (Object.keys(this.syllableOptions.sheng).indexOf(this.formData.syllable) !== -1) {
						this.syllableOptions.sheng[this.formData.syllable] = value.toLowerCase();
					} else if (Object.keys(this.syllableOptions.yun).indexOf(this.formData.syllable) !== -1) {
						this.syllableOptions.yun[this.formData.syllable] = value.toLowerCase();
					} else if (Object.keys(this.syllableOptions.zero).indexOf(this.formData.syllable.slice(4)) !== -1) {
						this.syllableOptions.zero[this.formData.syllable.slice(4)] = value.toLowerCase();
					}
				}
			}
			callback();
		};
		return {
			formData: {
				schemeFinallyName: '自定义方案',
				groupName: '自定义',
				schemeModelName: undefined,
				syllable: 'b',
				keyboard: ''
			},
			newSchemeName: '',
			rules: {
				schemeFinallyName: [
					{
						required: true,
						message: '请选择方案或输入新方案',
						trigger: 'change'
					}
				],
				groupName: [
					{
						required: true,
						message: '请选择所属分组',
						trigger: 'change'
					}
				],
				schemeModelName: [],
				syllable: [],
				keyboard: [{ require: false, validator: checkKeyboard, trigger: 'change' }]
			},
			modelOptions: [],
			syllableOptions: {},
			keyboardOptions: 'QWERTYUIOPASDFGHJKL;ZXCVBNM'.split(''),
			schemeFinallyNameProps: {
				multiple: false,
				label: 'label',
				value: 'value',
				children: 'children',
				checkStrictly: false
			},
			drawer: false,
			syllableNotDefineList: {
				sheng: [],
				yun: [],
				zero: []
			}
		};
	},
	computed: {},
	watch: {},
	created() {
		this.initSyllableOptions();
	},
	mounted() {
		console.log('createPage', this.$props.configPage);
		let configPage = this.$props.configPage;
		this.newSchemeName = this.createSchemeName();
		configPage.settings.schemeName = this.newSchemeName;
		configPage.schemes.forEach(scheme => {
			this.modelOptions.push(scheme.name);
		});
		configPage.schemes.push({
			name: this.newSchemeName,
			details: this.syllableOptions
		});
		this.schemeFinallyNameOptions = [];
	},
	methods: {
		createSchemeName() {
			const schemeName = 'newSchemeName' + new Date().getTime() + Math.round(Math.random() * 1000);
			this.$props.configPage.schemes.forEach(scheme => {
				if (schemeName == scheme.name) {
					return this.createSchemeName();
				}
			});
			return schemeName;
		},
		changeSyllable(val) {
			console.log(this.formData.syllable);
			this.formData.keyboard = '';
		},
		getNewDetails() {
			return {
				sheng: {
					b: ' ',
					c: ' ',
					d: ' ',
					f: ' ',
					g: ' ',
					h: ' ',
					j: ' ',
					k: ' ',
					l: ' ',
					m: ' ',
					n: ' ',
					p: ' ',
					q: ' ',
					r: ' ',
					s: ' ',
					t: ' ',
					w: ' ',
					x: ' ',
					y: ' ',
					z: ' ',
					ch: ' ',
					sh: ' ',
					zh: ' '
				},
				yun: {
					a: ' ',
					ai: ' ',
					an: ' ',
					ang: ' ',
					ao: ' ',
					e: ' ',
					ei: ' ',
					en: ' ',
					eng: ' ',
					i: ' ',
					ia: ' ',
					ian: ' ',
					iang: ' ',
					iao: ' ',
					ie: ' ',
					iong: ' ',
					in: ' ',
					ing: ' ',
					iu: ' ',
					o: ' ',
					ong: ' ',
					ou: ' ',
					u: ' ',
					ua: ' ',
					uai: ' ',
					uan: ' ',
					uang: ' ',
					ue: ' ',
					ui: ' ',
					un: ' ',
					uo: ' ',
					v: ' ',
					ve: ' '
				},
				zero: {
					a: ' ',
					ai: ' ',
					an: ' ',
					ang: ' ',
					ao: ' ',
					e: ' ',
					ei: ' ',
					en: ' ',
					eng: ' ',
					er: ' ',
					o: ' ',
					ou: ' '
				}
			};
		},
		initSyllableOptions() {
			this.syllableOptions = this.getNewDetails();
		},
		checkKeyboard() {
			this.$refs['newSchemeForm'].validate(valid => {
				if (!valid) return;
			});
		},
		submitForm() {
			this.$refs['newSchemeForm'].validate(valid => {
				console.log('提交名称: ', this.formData.schemeFinallyName);
				const schemeName = this.formData.schemeFinallyName;
				const db = this.$props.configDb;
				db.data.settings.schemeName = schemeName;
				db.data.schemes.forEach((sc, i) => {
					if (sc.name === schemeName) {
						db.data.schemes.splice(i, 1);
					}
				});
				// 判断是否设置了键位值
				this.syllableNotDefineList = { sheng: [], yun: [], zero: [] };
				Object.keys(this.syllableOptions.sheng).forEach(sheng => {
					if (this.syllableOptions.sheng[sheng] == ' ' || this.syllableOptions.sheng[sheng] == '') {
						if (sheng.length > 1) {
							this.syllableNotDefineList.sheng.push(sheng);
						}
						// 判断按键是否被占用
						Object.keys(this.syllableOptions.sheng).forEach(optionSheng => {
							if (this.syllableOptions.sheng[optionSheng] == sheng) {
								// 被占用则加入失败列表
								this.syllableNotDefineList.sheng.push(sheng);
							}
						});
						// 如果没有被占用则设置键位为自身
						if (this.syllableNotDefineList.sheng.indexOf(sheng) === -1) {
							this.syllableOptions.sheng[sheng] = sheng;
						}
					}
				});
				Object.keys(this.syllableOptions.yun).forEach(yun => {
					if (this.syllableOptions.yun[yun] == ' ' || this.syllableOptions.yun[yun] == '') {
						if (yun.length == 1) {
							this.syllableOptions.yun[yun] = yun;
						} else {
							this.syllableNotDefineList.yun.push(yun);
						}
					}
				});
				Object.keys(this.syllableOptions.zero).forEach(zero => {
					if (this.syllableOptions.zero[zero] == ' ' || this.syllableOptions.zero[zero] == '') {
						this.syllableNotDefineList.zero.push(zero);
					}
				});
				let undefinedLength = this.syllableNotDefineList.sheng.length || this.syllableNotDefineList.yun.length || this.syllableNotDefineList.zero.length;
				if (undefinedLength > 0) {
					this.drawer = true;
					return;
				}
				db.data.schemes.push({
					name: schemeName,
					details: this.syllableOptions
				});
				try {
					let have = false;
					db.data.schemeGroups.forEach(group => {
						let index = group.schemeList.indexOf(schemeName);
						if (group.groupName === this.formData.groupName) {
							if (index === -1) {
								group.schemeList.push(schemeName);
							}
							have = true;
						} else if (index >= 0) {
							group.schemeList.splice(index, 1);
						}
					});
					if (have) {
						throw new Error();
					}
					db.data.schemeGroups.push({
						groupName: this.formData.groupName,
						schemeList: [schemeName]
					});
				} catch {}
				this.$emit("addNewScheme", false);
			});
		},
		resetForm() {
			this.$refs['newSchemeForm'].resetFields();
			this.initSyllableOptions();
		},
		changeSchemeName(val) {
			this.$props.configPage.schemes.forEach(scheme => {
				if (val == scheme.name) {
					this.syllableOptions.sheng = scheme.details.sheng;
					this.syllableOptions.yun = scheme.details.yun;
					this.syllableOptions.zero = scheme.details.zero;
				}
			});
		}
	}
};
</script>
<style scoped>
.el-button {
	padding: 0 40px;
	width: 40px;
}
.newSchemeForm {
	background-color: var(--backgroundColor);
	position: absolute;
	left: 20px;
	top: 60px;
	height: 115px;
	width: 92%;
	z-index: 1;
}
.resetForm {
	background-color: var(--resetButtonBackColor);
}
:deep(.el-select__tags) {
	white-space: nowrap;
	overflow: hidden;
}
:deep(.el-select__input) {
	white-space: nowrap;
}
.el-drawer p {
	margin: 0;
	padding: 0;
}
:deep(.el-drawer__header) {
	margin-bottom: 10px;
}
:deep(.el-drawer__body) {
	padding-top: 0;
}
</style>
