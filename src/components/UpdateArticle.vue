<script setup>
import { ref } from "vue";
// 从父组件获取数据
const props = defineProps(["configPage"]);
const emit = defineEmits(["changeContextMenu", "initContextMenu"]);
const dialogVisible = ref(false),
  formRef = ref(),
  formData = ref({
    articleId: '',
    articleRev: '',
    articleTitle: '',
    articleAuthor: '',
    articleContent: ''
  }),
  rules = ref({
    articleTitle: [{
      required: true,
      message: '请输入标题',
      trigger: 'blur'
    }],
    articleAuthor: [],
    articleContent: [{
      required: true,
      message: '请输入正文',
      trigger: 'blur'
    }]
  }),
  contextList = ref([
    {
      label: '排版文本',
      click: textLayout
    }
  ]);


function close () {
  dialogVisible.value = false;
}
// 关闭时
function onClose () {
  // 清空表单数据
  formData.value = {
    articleId: '',
    articleRev: '',
    articleTitle: '',
    articleAuthor: '',
    articleContent: ''
  };
  emit("updateDialogClosed");
}
// 提交修改
function handelConfirm () {
  formRef.value.validate((valid) => {
    if (!valid) return;
    const data = {
      _id: formData.value.articleId,
      _rev: formData.value.articleRev,
      data: {
        title: formData.value.articleTitle,
        author: formData.value.articleAuthor,
        article: formData.value.articleContent
      }
    }
    console.log('data: ', data);
    window.updateUtoolsDB(data);
    close();
  });
}
// 打开编辑短文页面
function openDialog () {
  emit('changeContextMenu', contextList.value);
  dialogVisible.value = true;
}

// 初始化formData
function initFormData (article_id) {
  let article = window.getDataById(article_id);
  if (article) {
    formData.value = {
      articleId: article._id,
      articleRev: article._rev,
      articleTitle: article.data.title,
      articleAuthor: article.data.author.trim(),
      articleContent: article.data.article
    }
  }
}
function textLayout () {
  formData.value.articleContent = correctText(formData.value.articleContent);
}

defineExpose({ openDialog, initFormData })
</script>
<template>
  <div class="updateArticleDialog">
    <el-dialog v-model="dialogVisible" title="修改短文" width="30%" draggable @close="onClose">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="标题" prop="articleTitle">
            <el-select v-model="formData.articleId" placeholder="请选择短文">
              <el-option v-for="article in configPage.articles" :key="article" :label="article.articleName"
                :value="article.articleId" />
            </el-select>
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
    </el-dialog>
  </div>
</template>
<style scope>
.updateArticleDialog .el-dialog {
  width: 76%;
}
.updateArticleDialog .el-col {
  margin-right: 42px;
}
.updateArticleDialog .el-form-item {
  width: 82%;
}
.updateArticleDialog .el-textarea .el-textarea__inner {
  height: 100px;
}
</style>