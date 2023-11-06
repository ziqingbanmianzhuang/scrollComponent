//引入scrollcomponent组件
import scrollComponent from './src/index.vue'

//为组件提供install安装方法，供按需引入
scrollComponent.install = (app, options) => {
    for (const key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
            //scrollComponent源组件的props属性的key是采用对象结构申明而非单个类型声明
            //???为何是赋值成一个函数而非原来的值,预防对象的引用类型被修改吗,那么函数会被调用吗
            scrollComponent.props[key].default = options[key];
            console.log(scrollComponent.props);
        }
    }
    app.component('scrollComponent', scrollComponent)
}

export default scrollComponent