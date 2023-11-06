
<template>
  <!-- //应用级别赋值props进行组件的配置 -->
  <!-- <scrollComponent width="200px" height="500px" padding="20px" class="my-scroll-div" view-class="my-view"
    :scroll="handleScroll" awaysShowScroll>
    <div style="width: 1000px;height: 30px;background: pink"></div>
    <div v-for="(item, index) in contents" :key="index">{{ item.label }}</div>
  </scrollComponent>
  <scrollComponent height="600px" class="my-scroll-div" view-class="myview">
    <div style="width: 1000px;height: 10px;background: pink"></div>
    <div v-for="(item, index) in contents" :key="index">{{ item.label }}</div>
  </scrollComponent>

  <scrollComponent ref="scrollTopExam" height="200px" width="200px" class="my-scroll-div" view-class="myview"
    :useNative="false" :awaysShowScroll="true" :scroll="handleScroll">
    <div style="width: 1000px;height: 30px;background: pink"></div>
    <div v-for="(item, index) in contents" :key="index" style="width:1000px">{{ item.label }}</div>
  </scrollComponent>
  <button @click="scrollToLeft">scroll to top</button>
  <scrollComponent width="500px" height="200px" class="my-scroll-div" view-class="myview">
    <div style="width: 1000px;height: 30px;background: pink"></div>
    <div v-for="(item, index) in contents" :key="index">{{ item.label }}</div>
  </scrollComponent>
  <scrollComponent padding="30px" class="my-scroll-div" view-class="myview">
    <div style="width: 1000px;height: 30px;background: pink"></div>
    <div v-for="(item, index) in contents" :key="index">{{ item.label }}</div>
  </scrollComponent>
  <scrollComponent width="500px" padding="30px" class="my-scroll-div" view-class="myview">
    <div style="width: 1000px;height: 30px;background: pink"></div>
    <div v-for="(item, index) in contents" :key="index">{{ item.label }}</div>
  </scrollComponent> -->
  <scrollComponent height="200px" class="my-scroll-div" view-class="myview" width="200px" :useNative="false"
    awaysShowScroll>
    <div style="width: 200px;height: 30px;background: pink"></div>
    <div v-for="(item, index) in contents" :key="index" width="100px">{{ item.label }}</div>
  </scrollComponent>
</template>

<script setup>
import { ref } from 'vue'
//content数组
const contents = [
  {
    label: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officiis quas nobis praesentium nisi deserunt, fuga libero, error quia vero nulla corporis odio fugit atque et accusamus numquam. Tempora, qui numquam!'
  },
  {
    label: '导航2'
  },
  {
    label: '导航3'
  },
  {
    label: '导航2'
  },
  {
    label: '导航3'
  },
  {
    label: '导航2'
  },
  {
    label: '导航3'
  },
  {
    label: '导航2'
  },
  {
    label: '导航3'
  },
  {
    label: '导航2'
  },
  {
    label: '导航3'
  },
  {
    label: '导航2'
  },
  {
    label: '导航3'
  }
]
const handleScroll = () => {
  console.log('app,handleScroll');
}
//scrollTopExam
const scrollTopExam = ref();
const scrollToTop = () => {
  // scrollTopExam.value.scrollTo('top')
  scrollTopExam.value.scrollTo('top');

}
const scrollToLeft = () => {
  // scrollTopExam.value.scrollTo('top')
  scrollTopExam.value.scrollTo('top', 'left');

}

</script>

<style scoped lang="scss">
body {
  margin: 0;
  padding-top: 24px;
  background-color: #f5f6fa;
}

.my-scroll-div {
  margin-bottom: 24px;
}

.myview {
  background-color: #fff;
  word-break: break-all;
}
</style>
