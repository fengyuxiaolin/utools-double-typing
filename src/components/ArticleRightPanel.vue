<template>
  <div class="articleRightPanelBox">
    <el-form ref="articleForm" :model="formData" :rules="rules">
      <el-row>
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="作者" prop="author">
          <el-input v-model="formData.author" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="速度" prop="speed">
          <el-input v-model="formData.speed" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="正确率" prop="correct">
          <el-input v-model="formData.correct" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="计时" prop="timer">
          <el-input v-model="formData.timer" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="进度" prop="schedule">
          <el-input v-model="formData.schedule" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="退格数" prop="backSeveral">
          <el-input v-model="formData.backSeveral" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="错误数" prop="errSeveral">
          <el-input v-model="formData.errSeveral" clearable :style="{width: '100%'}" disabled>
          </el-input>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>
<script>
export default {
  components: {},
  props: ['nowArticle', 'nowTypingArticle'],
  data () {
    return {
      formData: {
        title: undefined,
        author: undefined,
        speed: "",
        correct: '100%',
        timer: '00:00:00',
        schedule: '0%',
        backSeveral: 0,
        errSeveral: 0,
      },
      rules: {
        title: [],
        author: [],
        speed: [],
        correct: [],
        timer: [],
        schedule: [],
        backSeveral: [],
        errSeveral: [],
      },
      typingInterval: undefined,
      timerDetails: {
        hour: 0,
        minute: 0,
        second: 0,
        pureSecond: 0
      }
    }
  },
  computed: {},
  watch: {},
  created () { },
  mounted () { },
  methods: {
    toStartInterval () {
      if (!this.typingInterval) {
        this.typingInterval = setInterval(() => {
          // 计时
          this.formData.timer = this.timerPlus();
          // 进度 = 当前字数 / 总字数 * 100%
          this.formData.schedule = (this.nowTypingArticle.length / this.nowArticle.article.length * 100).toFixed(2) + '%';
          let trueLength = 0;
          let errSeveral = 0;
          for (const i in this.$props.nowTypingArticle) {
            if (this.$props.nowTypingArticle[i] == this.$props.nowArticle.article[i]) {
              trueLength++;
            } else {
              errSeveral++;
            }
          }
          // 错误数
          this.formData.errSeveral = errSeveral;
          // 正确率 = 正确字数 / 当前字数 * 100%
          this.formData.correct = (trueLength / this.nowTypingArticle.length * 100).toFixed(2) + '%';
          // 速度 = 当前字数 / 计时
          this.formData.speed = (this.nowTypingArticle.length / this.timerDetails.pureSecond * 60).toFixed(2) + '字/分';
        }, 1000)
      }
    },
    timerPlus () {
      this.timerDetails.pureSecond++;
      this.timerDetails.second++
      if (this.timerDetails.second == 60) {
        this.timerDetails.second = 0
        this.timerDetails.minute++
        if (this.timerDetails.minute == 60) {
          this.timerDetails.minute = 0
          this.timerDetails.hour++
        }
      }
      if (this.timerDetails.hour > 24) {
        return '超过1天';
      }
      return String(this.timerDetails.hour).padStart(2, '0') + ':' + String(this.timerDetails.minute).padStart(2, '0') + ':' + String(this.timerDetails.second).padStart(2, '0');
    },
  }
}
</script>

<style scoped>
.articleRightPanelBox .el-input:deep(.el-input__inner) {
  width: 100%;
  border: none;
  outline: none;
  background-color: #fff0;
  box-shadow: none;
  padding: 0;
}
.articleRightPanelBox .el-input.is-disabled:deep(.el-input__inner) {
  cursor: default;
}
.articleRightPanelBox:deep(.el-form-item__label) {
  width: 56px;
}
.articleRightPanelBox .el-row {
  height: 32px;
}
</style>
