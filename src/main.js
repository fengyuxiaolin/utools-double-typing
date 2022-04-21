import {
    createApp
} from 'vue'
import App from './App.vue'
import pinyin from 'pinyin';
/**
 * 开源汉字拼音转换工具
 * https://github.com/hotoo/pinyin/tree/v2.x
 */
window.toPinyin = (hanzi, option) => {
    return pinyin(hanzi, option);
}

/**
 * 以无声调风格转换为拼音, 开启多音字模式
 * 
 * @param {String} hanzi
 */
window.toPinyinNormal = hanzi => {
    if (hanzi === '哦') {
        return [
            ['o', 'e']
        ]
    } else if (hanzi === '嘚') {
        return [
            ['dei', 'de']
        ]
    }
    let pyList = pinyin(hanzi, {
        style: pinyin.STYLE_NORMAL,
        heteronym: true
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
    return pyList;
}
window.compare = (hanzi1, hanzi2) => {
    return pinyin.compare(hanzi1, hanzi2);
}

import {
    Plus
} from "@element-plus/icons-vue";
let app = createApp(App);
app.component('Plus', Plus);
app.mount('#app')