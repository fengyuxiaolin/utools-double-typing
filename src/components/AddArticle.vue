<template>
  <div class="addArticleDialog">
    <el-dialog v-bind="$attrs" @open="onOpen" @close="onClose" title="Dialog Titile" v-model="openAddArticle.open">
      <el-form ref="articleForm" :model="formData" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="标题" prop="articleTitle">
            <el-input v-model="formData.articleTitle" placeholder="请输入标题" clearable :style="{width: '100%'}">
            </el-input>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="作者" prop="articleAuthor">
            <el-input v-model="formData.articleAuthor" placeholder="请输入作者" clearable :style="{width: '100%'}">
            </el-input>
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="正文" prop="articleContent">
            <el-input v-model="formData.articleContent" type="textarea" placeholder="请输入正文" :maxlength="2000"
              show-word-limit :autosize="{minRows: 10, maxRows: 10}">
            </el-input>
          </el-form-item>
        </el-row>
        <el-row type="flex" justify="end" align="top">
          <el-col :span="1">
            <el-button type="info" size="small" @click="close"> 取消 </el-button>
          </el-col>
          <el-col :span="1">
            <el-button type="primary" @click="handelConfirm" size="small"> 保存 </el-button>
          </el-col>
        </el-row>
      </el-form>
      <contextmenu :contextList="contextList" v-if="contextList.length > 0" @selectItem="selectContext"
        :offset='contextOffset' />
    </el-dialog>
  </div>
</template>
<script>
import { defineEmits } from '@vue/runtime-core';
export default {
  inheritAttrs: false,
  components: {},
  props: ['openAddArticle', 'configDb', 'configPage', 'initArticle'],
  data () {
    // 校验数据库是否存在该标题
    var checkArticleTitle = (rules, articleTitle, cb) => {
      for (let i of this.configDb.data.articles) {
        if (i.articleName === articleTitle) {
          cb(new Error('该短文已存在'));
          return;
        }
      }
      cb();
    }
    return {
      formData: {
        articleTitle: undefined,
        articleAuthor: undefined,
        articleContent: undefined
      },
      rules: {
        articleTitle: [{
          required: true,
          message: '请输入标题',
          trigger: 'blur'
        }, {
          validator: checkArticleTitle,
          trigger: 'blur'
        }],
        articleAuthor: [],
        articleContent: [{
          required: true,
          message: '请输入正文',
          trigger: 'blur'
        }],
      },
      contextList: [
        {
          label: '排版文本',
          click: this.textLayout
        }
      ],
      contextOffset: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {},
  watch: {},
  created () { },
  mounted () {
  },
  methods: {
    onOpen () { },
    onClose () {
      this.$refs['articleForm'].resetFields()
    },
    close () {
      this.$props.openAddArticle.open = false
    },
    handelConfirm () {
      this.$refs['articleForm'].validate(valid => {
        if (!valid) return
        let articleDb = createArticle(this.formData);
        this.$props.configDb.data.articles.push({
          articleName: articleDb.data.title,
          articleId: articleDb._id,
        })
        updateUtoolsDB(this.$props.configDb);
        this.$props.configPage.articles.push({
          articleName: articleDb.data.title,
          articleId: articleDb._id
        })
        this.$props.initArticle.init();
        this.close();
      })
    },
    textLayout () {
      this.formData.articleContent = correctText(this.formData.articleContent);
    }
  }
}

</script>

<style scope>
.addArticleDialog .el-dialog {
  width: 76%;
}
.addArticleDialog .el-col {
  margin-right: 42px;
}
.addArticleDialog .el-form-item {
  width: 82%;
}
.addArticleDialog .el-textarea .el-textarea__inner {
  height: 100px;
}
</style>
