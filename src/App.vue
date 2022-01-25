<template>
  <div class="flex flex-col w-full h-screen">
    <div class="w-[900px] h-full p-4 mx-auto overflow-scroll space-y-4 text-center flex flex-col items-center bg-main">
      <img alt="Vue logo" src="./assets/logo.png">
      <HelloWorld msg="Welcome to Your Vue.js App"/>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>
