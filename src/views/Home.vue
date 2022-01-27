<template>
  <div class="w-[900px] h-full p-4 mx-auto text-center flex flex-col items-center bg-main">
    <a href="/">
      <img alt="Vue logo" src="@/assets/logo.png">
    </a>

    <FileDrop
      @drop="handleFileDrop"
      @remove="handFileRemove"
    />

    <Toggle
      class="pt-5"
      :checked="userFoobarHighlighting"
      @click="store.dispatch('app/updateUserFoobarHighlighting', !userFoobarHighlighting)"
    >
      Toggle foobar word highlighting
    </Toggle>

    <Pagination />

    <pre v-if="userFile"
      class="max-w-screen-lg text-left break-words whitespace-pre-wrap"
      v-html="userFilePageContentProcessed || '(empty)'"
    />

    <Pagination />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import FileDrop from '@/components/FileDrop'
import Pagination from '@/components/Pagination'
import Toggle from '@/components/Toggle'

const store = useStore()
const route = useRoute()

const userPage = computed(() => route.query.page || 0)
const userFile = computed(() => store.state.app.userFile)
const userFoobarHighlighting = computed(() => store.state.app.userFoobarHighlighting)
const userFilePageContentProcessed = computed(() => store.getters['app/userFilePageContentProcessed'])

// store.dispatch('app/tempFetch')

watch(userPage, () => {
  store.dispatch('app/extractUserFileContent')

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })
})

function handleFileDrop (files) {
  const [file] = files || [] // first file only
  store.dispatch('app/updateUserFile', file)
}

function handFileRemove () {
  store.dispatch('app/updateUserFile', null)
}
</script>

<style lang="scss">
pre {
  em {
    display: inline;
    position: relative;
    &:nth-child(even):after {
      transform: rotate(-8deg) translateY(-1px);
      border-top-left-radius: 12px;
      padding: 4px 24px 4px 16px;
      // border: 1px solid red;
    }
    &:nth-child(odd):after {
      transform: rotate(9deg) translateY(1px);
      border-top-left-radius: 4px;
      padding: 4px 24px 4px 16px;
      // border: 1px solid green;
    }
    &:after {
      margin: 0 -12px 0 -4px;
      border-top-left-radius: 12px;
      border-bottom-right-radius: 12px;
      background:
          linear-gradient(100deg, transparent 0px, transparent 4px,
              rgba(#ffeaba,0.75) 4px, rgba(#ffeaba,0.50) calc(100% - 4px),
              transparent calc(100% - 4px),
              transparent 100%);
      mix-blend-mode: multiply;
      z-index: 1;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      content: "";
      display: block;
    }
  }
}
</style>
