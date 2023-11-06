<template>
    <div ref="scrollDiv" class="scroll-div"
        :class="{ 'is-scroll-native': isSurportNative, 'is-native-div': !needCustom, [viewClass]: !needCustom }"
        :style="viewStyle">
        <div v-if="needCustom" ref="scrollDivView" class="scroll-div-view" :class="{ [viewClass]: needCustom }"
            :style="divStyle">
            <slot></slot>
        </div>
        <div v-if="needCustom && needYBar" ref="scrollY" class="scroll-div-y">
            <div ref="scrollYBar" class="scroll-div-y-bar"
                :class="{ 'is-always-show': awaysShowScroll, 'is-show': showScrollY }" :style="yBarStyle"></div>
        </div>
        <div v-if="needCustom && needXBar" ref="scrollX" class="scroll-div-x">
            <div ref="scrollXBar" class="scroll-div-x-bar"
                :class="{ 'is-always-show': awaysShowScroll, 'is-show': showScrollX }" :style="xBarStyle"></div>
        </div>>
        <slot v-if="!needCustom"></slot>
    </div>
</template>

<script setup>
import { defineProps, computed, onMounted, onBeforeUnmount, ref, nextTick } from 'vue';

//外界传过来的props
const props = defineProps({
    width: {
        type: [String, Number],
        default: 0
    },
    height: {
        type: [String, Number],
        default: 0
    },
    padding: {
        type: [String, Number],
        default: 0
    },
    size: {
        type: [String, Number],
        default: '7px'
    },
    offset: {
        type: [String, Number],
        default: '0px'
    },
    viewClass: {
        type: String,
        default: ''
    },
    //默认不常显示bar
    awaysShowScroll: {
        type: Boolean,
        default: false
    },
    //默认使用原生的滚动条
    useNative: {
        type: Boolean,
        default: true
    },
    scroll: {
        type: Function,
        default: null
    },
    barStyle: {
        type: Object,
        default: null
    },
    timerInterval: {
        type: Number,
        default: 1500

    }
})

//scrollcontainer
let scrollContainer = ref(null);

//guttersize
let guttersize = ref('0px');

//needYBar
let needYBar = ref(true);

//needXBar
let needXBar = ref(true);

//通过MSIE字段来判断是否是IE11系列之前(true)的(不包括11)浏览器,,activeXobeject判断ie11(true),(ie之外的浏览器,IE11之前的浏览器都是false)
//是否禁止优化,如果是ie11,ie11之前的系列,火狐浏览器那么就禁止优化,其余浏览器不禁止优化
let disabledOptimize = ref(navigator
    .userAgent.indexOf('Firefox') > -1
    ||
    'ActiveXObject' in window
    ||
    window.navigator.userAgent.indexOf('MSIE') > -1)

//默认不需要自定义
let needCustom = ref(false);

//默认不支持native
let isSurportNative = ref(false);

//计算的index
let zIndex = 0;
zIndex++;
let calcIndex = ref(0);

//showScrollY
let showScrollY = ref(false);
//showScrollX
let showScrollX = ref(false);

let scrollDiv = ref()
let scrollDivView = ref()
let customScrollContainer = ref(null)
let scrollY = ref();
let scrollX = ref();
let scrollYBar = ref();
let scrollXBar = ref();
let scrollTop = ref(0);
let scrollLeft = ref(0);
let showScroll = ref(false);
let timer = ref(null);

let startY = ref(0);
let startX = ref(0);
let distanceY = ref(0);
let distanceX = ref(0);


//divstyle
const divStyle = computed(() => {
    const style = {};
    props.height ? (style.height = `calc(100% + ${guttersize.value}px)`) : (style['overflow-x'] = 'hidden');
    style.width = `calc(100% + ${guttersize.value}px)`
    if (props.padding) {
        style.padding = props.padding;
    }
    return style;
})
//yBarStyle
const yBarStyle = computed(() => {
    return createBarStyle(true)
})
//xBarStyle
const xBarStyle = computed(() => {
    return createBarStyle(false)
})

//viewStyle
const viewStyle = computed(() => {
    const style = {};
    props.width && (style.width = format(props.width));
    props.height && (style.height = format(props.height));
    //不需要自定义才允许赋值padding
    console.log('viewStyle', needCustom);
    (!needCustom.value && props.padding) && (style.padding = format(props.padding));
    return style;
})


//format函数,规范传入的参数
const format = (value) => {
    return typeof value === 'number' ? `${value}px` : value
}

//createBarStyle
const createBarStyle = (isYScroll) => {
    const style = { ...props.barStyle }
    if (props.size) {
        const sizeVal = format(props.size);
        isYScroll ? style.width = sizeVal : style.height = sizeVal;
        style.borderRadius = sizeVal;
    }
    if (props.offset) {
        const offsetVal = format(props.offset);
        isYScroll ? style.right = offsetVal : style.bottom = offsetVal;
    }
    return style;
}


//getgetGutterSize
const getGutterSize = () => {
    const box = document.createElement('div');
    box.style.cssText = 'width:100px;height:100px;overflow:scroll';
    document.body.appendChild(box);
    guttersize.value = (box.offsetWidth - box.clientWidth);
    //如果scroll之后出现滚动条那么就需要自定义
    needCustom.value = guttersize.value > 0;
    document.body.removeChild(box);
    console.log('guttersize', guttersize);

}


//检查是否是wenkit内核的浏览器
const checkwebkit = () => {
    // 1.浏览器可以正确显示滚动条,2.用户选择使用原生滚动条(默认支持)进入此逻辑
    //如果是非webkit浏览器那么就需要自定义滚动条
    //如果是webkit浏览器那么就不需要自定义滚动条
    needCustom.value = navigator.userAgent.toLowerCase().indexOf('applewebkit') === -1
    //webkit浏览器不需要自定义,支持原生
    //非webkit需要自定义,不支持原生
    isSurportNative.value = !needCustom.value
    return isSurportNative.value
}

//calcsize事件计算的是滚动条的长度或者宽度
const calcsize = (isVertical) => {
    let scrollBar, key, clientVal, scrollVal;
    if (isVertical) {
        scrollBar = scrollYBar
        key = 'height';
        clientVal = 'clientHeight';
        scrollVal = 'scrollHeight';
    } else {
        scrollBar = scrollXBar;
        key = 'width';
        clientVal = 'clientWidth';
        scrollVal = 'scrollWidth';
    }
    let clientValue = customScrollContainer[clientVal];
    scrollBar.value && (scrollBar.value.style[key] = clientValue * clientValue / customScrollContainer[scrollVal] + 'px');
    console.log('calcsize', scrollBar.value.style[key]);
}


//自定义Handle事件
const handleScroll = (e) => {
    console.log('handlescroll');
    const el = e.targrt || e.srcElement;
    let clientVal, scrollVal, scroll, isVertical, scrollBar, transform;

    if (el.scrollTop !== scrollTop.value) {
        clientVal = 'clientHeight', scrollVal = 'scrollHeight', scroll = 'scrollTop', isVertical = true, scrollBar = scrollYBar, transform = 'translateY';
        let srollVal1 = customScrollContainer[scrollVal];
        let clientVal1 = customScrollContainer[clientVal];
        let scroll1 = customScrollContainer[scroll];
        showScrollY.value = true;
        // 计算滚动条的高度或者宽度
        calcsize(isVertical);
        //计算scrollbar的位置并移动到相应的位置
        let distance = scroll1 * clientVal1 / srollVal1;
        scrollBar.value && (scrollBar.value.style.transform = `${transform}(${distance}px)`);
        timer && clearTimeout(timer);
        //如果不是常驻滚动条那么就要多走一个定时器逻辑
        if (!props.awaysShowScroll) {
            timer = setTimeout(() => {
                console.log('timery');
                showScrollY.value = false;
            }, props.timerInterval)
        }

    }
    if (el.scrollLeft !== scrollLeft.value) {
        console.log('scrollX', el.scrollLeft, scrollLeft.value);
        clientVal = 'clientWidth', scrollVal = 'scrollWidth', scroll = 'scrollLeft', isVertical = false, scrollBar = scrollXBar, transform = 'translateX';
        let srollVal1 = customScrollContainer[scrollVal];
        let clientVal1 = customScrollContainer[clientVal];
        let scroll1 = customScrollContainer[scroll];
        showScrollX.value = true;
        // 计算滚动条的高度或者宽度
        calcsize(isVertical);
        //计算scrollbar的位置并移动到相应的位置
        let distance = scroll1 * clientVal1 / srollVal1;
        scrollBar.value && (scrollBar.value.style.transform = `${transform}(${distance}px)`);
        timer && clearTimeout(timer);
        //如果不是常驻滚动条那么就要多走一个定时器逻辑
        if (!props.awaysShowScroll) {
            timer = setTimeout(() => {
                console.log('timerx');
                showScrollX.value = false;
            }, props.timerInterval)
        }
    }

    isVertical ? scrollTop.value = el[scroll] : scrollLeft.value = el[scroll];
    // scrollHeight代表包括当前不可见部分的元素的高度。而可见部分的高度其实就是clientHeight，也就是scrollHeight>=clientHeight恒成立,两个都是包括内容和边框

}

//movescrollYBar
const moveScrollYBar = (el) => {
    moveScrollBar(el, 'pageY', 'startY', 'scrollHeight', 'clientHeight', 'distanceY', 'scrollTop');
    console.log('movescrollYBar');
}

//moveScrollXBar
const moveScrollXBar = (el) => {
    moveScrollBar(el, 'pageX', 'startX', 'scrollWidth', 'clientWidth', 'distanceX', 'scrollLeft');
    console.log('movescrollXBar');
}

//moveScrollBar
const moveScrollBar = (e, pageOffset, start, scrollVal, clientVal, distance, scroll) => {
    console.log('moveScrollBar');
    const delta = e[pageOffset] - (start === 'startY' ? startY : startX);
    const scrollVal1 = customScrollContainer[scrollVal];
    const clientVal1 = customScrollContainer[clientVal];
    let change = scrollVal1 * delta / clientVal1;
    change += (distance === 'distanceY' ? distanceY : distanceX);
    if (change < 0) {
        customScrollContainer[scroll] = 0;
        return;
    }
    if (change + clientVal1 >= scrollVal1) {
        customScrollContainer[scroll] = scrollVal1 - clientVal1;
        return;
    }
    customScrollContainer[scroll] = change;
}

//clickend
const clickEnd = () => {
    document.removeEventListener('mousemove', moveScrollYBar);
    document.removeEventListener('mousemove', moveScrollXBar);
    document.removeEventListener('mouseup', clickEnd);
    console.log('clickend');
}

//clickStart
const clickStart = (e) => {
    const target = e.target || e.srcElement;
    if (/scroll-div-y/.test(target.className)) {
        startY = e.pageY;
        distanceY = customScrollContainer.scrollTop;
        // scrollY.remeoveEventListener('mousemove', clickMove);
        document.addEventListener('mousemove', moveScrollYBar);
    } else {
        startX = e.pageX;
        distanceX = customScrollContainer.scrollLeft;
        //scrollX.remeoveEventListener('mousemove', clickMove);
        document.addEventListener('mousemove', moveScrollXBar)
    }
    document.addEventListener('mouseup', clickEnd)
    console.log('clickstart', target);
}

//updateScrollBar
const updateScrollBar = () => {
    //如果不是自定义滚动条或者常驻滚动条那么就return;
    if (!customScrollContainer || !props.awaysShowScroll) {
        return;
    }
    const { clientHeight, clientWidth, scrollHeight, scrollWidth } = customScrollContainer;
    const showScrollY = scrollHeight > clientHeight;
    const showScrollX = scrollWidth > clientWidth;
    //就算是常驻滚动条也得在scroll>client的时候才会一直显示
    needYBar = showScrollY;
    needXBar = showScrollX;
    if (showScrollY) {
        //设置事件监听
        scrollYBar.value.addEventListener('mousedown', clickStart);
        //常驻滚动条样式透明度设置为1;
        scrollYBar.value.style.opacity = 1;
        //设置滚动条的高度
        calcsize(true);
    }
    if (showScrollX) {
        //设置事件监听
        scrollXBar.value.addEventListener('mousedown', clickStart);
        //常驻滚动条样式透明度设置为1;
        scrollXBar.value.style.opacity = 1;
        //设置滚动条的宽度
        calcsize();
    }

}

//scrollTo
const scrollTo = (yPosition, xPosition) => {
    console.log('scrollTo');
    if (yPosition === 'top') {
        scrollContainer.scrollTop = 0;
    } else if (!isNaN((+yPosition))) {
        scrollContainer.scrollTop = +yPosition;
    }
    if (xPosition === 'left') {
        scrollContainer.scrollLeft = 0;
    } else if (!isNaN((+xPosition))) {
        scrollContainer.scrollLeft = +xPosition;
    }

}

//向外导出scrollTo
defineExpose({
    scrollTo
})


// hoverScrollYBar
const hoverScrollYBar = () => {
    console.log('hoverScrollYBar');
    let scrollVal = customScrollContainer.scrollHeight;
    let clientVal = customScrollContainer.clientHeight;
    if (scrollVal > clientVal) {
        scrollYBar.value.style.height = clientVal * clientVal / scrollVal + 'px';
        showScrollY.value = true;
        scrollYBar.value.addEventListener('mousedown', clickStart);
        scrollY.value.addEventListener('mouseout', hoverOutScroll);
    }
}

// hoverScrollXBar
const hoverScrollXBar = () => {
    console.log('hoverScrollXBar');
    let scrollVal = customScrollContainer.scrollWidth;
    let clientVal = customScrollContainer.clientWidth;
    if (scrollVal > clientVal) {
        scrollXBar.value.style.width = clientVal * clientVal / scrollVal + 'px';
        showScrollX.value = true;
        scrollXBar.value.addEventListener('mousedown', clickStart);
        scrollX.value.addEventListener('mouseout', hoverOutScroll);
    }
}

//hoveroutScroll
const hoverOutScroll = (e) => {
    console.log('hoverOutScroll');
    const target = e.target || e.srcElement;
    if (/(scroll-div-y)/.test(target.className) || /(scroll-div-y-bar)/.test(target.className)) {
        console.log('yyy');
        showScrollY.value = false;
        scrollYBar.value.removeEventListener('mousedown', clickStart);
        scrollY.value.removeEventListener('mouseout', hoverOutScroll);
    } else {
        showScrollX.value = false;
        console.log('xxxx');
        scrollXBar.value.removeEventListener('mousedown', clickStart);
        scrollX.value.removeEventListener('mouseout', hoverOutScroll);
    }
}

onMounted(() => {
    //如果原生能正常显示滚动条那么就暂时需要自定义滚动条
    getGutterSize();
    needCustom.value && props.useNative && checkwebkit()
    if (props.scroll) {
        nextTick(() => {
            scrollContainer = needCustom.value ? scrollDivView.value : scrollDiv.value;
            console.log('scrollContainer', scrollContainer);
            scrollContainer.addEventListener('scroll', props.scroll)
        })
    }
    if (!needCustom.value) {
        return;
    }
    nextTick(() => {
        customScrollContainer = scrollDivView.value;
        console.log('customScrollContainer', customScrollContainer);
        customScrollContainer.addEventListener('scroll', handleScroll);
        if (props.awaysShowScroll) {
            updateScrollBar();
        } else {
            calcsize(true);
            calcsize();
            scrollY.value.addEventListener('mouseover', hoverScrollYBar);
            scrollX.value.addEventListener('mouseover', hoverScrollXBar);
        }
    })



})

onBeforeUnmount(() => {
    if (!needCustom.value) {
        return;
    }
    customScrollContainer.removeEventListener('scroll', handleScroll);
    if (props.awaysShowScroll) {
        scrollYBar.value && scrollYBar.value.removeEventListener('mousedown', clickStart);
        scrollXBar.value && scrollXBar.value.removeEventListener('mousedown', clickStart);
    } else {
        scrollY.value.removeEventListener('mouseover', hoverScrollYBar);
        scrollX.value.removeEventListener('mouseover', hoverScrollXBar);
    }

})

</script>

<style lang="scss" scoped>
.scroll-div {
    overflow: hidden;

    position: relative;

    //非继承
    box-sizing: border-box;

    //控制用户是否可以选择文本,非继承
    user-select: none;

    &.is-native-div {
        display: block;
        overflow: auto;
    }

    .scroll-div-view {
        overflow: scroll;

        box-sizing: border-box;

    }

    .scroll-div-y {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 7px;

        .scroll-div-y-bar {
            position: relative;
            right: 1px;
            width: 7px;
            border-radius: 7px;
            background-color: rgba(0, 0, 0, .5);
            opacity: 0;
            transition: opacity .5s ease 0s;

            &.is-show {
                cursor: pointer;
                opacity: 1;
                transition: opacity 0s ease 0s;
            }

            &.is-always-show {
                background-color: rgba(144, 147, 153, .5);

                &:hover,
                &:active {
                    background-color: rgba(144, 147, 153, .8);
                }
            }
        }
    }

    .scroll-div-x {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 7px;

        .scroll-div-x-bar {
            position: relative;
            bottom: 1px;
            height: 7px;
            border-radius: 7px;
            background-color: rgba(0, 0, 0, .5);
            opacity: 0;
            transition: opacity .5s ease 0s;

            &.is-show {
                cursor: pointer;
                opacity: 1;
                transition: opacity 0s ease 0s;
            }

            &.is-always-show {
                background-color: rgba(144, 147, 153, .5);

                &:hover,
                &:active {
                    background-color: rgba(144, 147, 153, .8);
                }
            }
        }
    }

    //webkit原生滚动条样式
    &.is-scroll-native::-webkit-scrollbar {
        width: 7px;
        height: 7px;
    }

    &.is-scroll-native::-webkit-scrollbar-thumb {
        border-radius: 7px;

        background-color: rgba(144, 147, 153, .5);

        &:hover,
        &:active {
            background-color: rgba(144, 147, 153, .8);
        }

    }
}
</style>