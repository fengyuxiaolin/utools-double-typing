import { createApp } from 'vue'
import App from './App.vue'
import pinyin from 'pinyin'
/**
 * 开源汉字拼音转换工具
 * https://github.com/hotoo/pinyin/tree/v2.x
 */
window.toPinyin = (hanzi, option) => {
  return pinyin(hanzi, option)
}

/**
 * 以无声调风格转换为拼音, 开启多音字模式
 *
 * @param {String} hanzi
 */
window.toPinyinNormal = (hanzi) => {
  if (hanzi === '哦') {
    return [['o', 'e']]
  } else if (hanzi === '嘚') {
    return [['dei', 'de']]
  }
  let pyList = pinyin(hanzi, {
    style: pinyin.STYLE_NORMAL,
    heteronym: true,
  })
  pyList.forEach((pys) => {
    pys.forEach((py, i) => {
      if (py === 'n') {
        pys[i] = 'en'
      }
      if (py === 'ng') {
        pys[i] = 'eng'
      }
    })
  })
  return pyList
}
window.compare = (hanzi1, hanzi2) => {
  return pinyin.compare(hanzi1, hanzi2)
}
window.toPinyinFirst = (hanzi) => {
  return pinyin(hanzi, {
    style: pinyin.STYLE_FIRST_LETTER,
  })
}

import {
  CopyWritingCorrectService,
  CharacterCorrector,
  SpaceCorrector,
  UnitOfMeasurementCorrector,
} from 'copywriting-correct'

const wcService = new CopyWritingCorrectService()
wcService.resetCorrectors([
  CharacterCorrector,
  SpaceCorrector,
  UnitOfMeasurementCorrector,
])

window.correctText = (text) => {
  return wcService.correct(text)
}

// 比较两个版本号大小
window.compareVersion = (v1, v2) => {
  const v1List = v1.split('.')
  const v2List = v2.split('.')
  const len = Math.max(v1List.length, v2List.length)
  for (let i = 0; i < len; i++) {
    const n1 = parseInt(v1List[i] || 0)
    const n2 = parseInt(v2List[i] || 0)
    if (n1 > n2) {
      return 1
    }
    if (n1 < n2) {
      return -1
    } else {
      continue
    }
  }
}

import { Plus, Menu } from '@element-plus/icons-vue'
let app = createApp(App)
app.component('Plus', Plus)
app.component('Menu', Menu)
app.mount('#app')
