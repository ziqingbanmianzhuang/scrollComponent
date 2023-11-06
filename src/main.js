import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

//引入scrollComponent
import scrollComponent from '../packages/index'

//创建app
const app = createApp(App)

//注册插件scrollComponent   
//全局自定义配置width的默认,优先级小于组件应用级别
app.use(scrollComponent, {
    barStyle: {
        backgroundColor: 'pink'
    },
    size: 7,
    offset: 0
})

//挂载app
app.mount('#app')
