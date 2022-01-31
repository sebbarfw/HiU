<template>
  <div class="pagination flex flex-col items-center py-8">
    <div class="flex text-gray-700" v-if="filePageCount && pages.length">
      <router-link class="h-8 w-8 flex justify-center items-center cursor-pointer" :to="`?page=${0}`">
        <ChevronDoubleLeftIcon class="h-5 pt-1 mr-1" />
      </router-link>
      <router-link class="h-8 w-8 flex justify-center items-center cursor-pointer" :to="`?page=${prevPage}`">
        <ChevronLeftIcon class="h-5 pt-1 mr-1" />
      </router-link>

      <div class="flex h-8 font-medium">
        <router-link
          class="min-w-8 p-2 md:hidden flex justify-center items-center cursor-pointer leading-5 transition duration-150 ease-in border-t-2 border-green-500"
          :to="`?page=${userPage}`"
        >
          {{ route.query.page }}
        </router-link>
        <router-link
          v-for="page in pages" :key="page"
          class="min-w-8 p-2 md:flex justify-center items-center hidden cursor-pointer leading-5 transition duration-150 ease-in border-t-2"
          :class="{
            'border-green-500': page === userPage,
            'border-transparent': page !== userPage,
          }"
          :to="`?page=${page}`"
        >
          {{ page }}
        </router-link>
      </div>

      <router-link class="h-8 w-8 flex justify-center items-center cursor-pointer" :to="`?page=${nextPage}`">
        <ChevronRightIcon class="h-5 pt-1 ml-1" />
      </router-link>
      <router-link class="h-8 w-8 flex justify-center items-center cursor-pointer" :to="`?page=${filePageCount}`">
        <ChevronDoubleRightIcon class="h-5 pt-1 mr-1" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/vue/outline'

const store = useStore()
const route = useRoute()

const userPage = computed(() => route.query.page || '0')
const filePageCount = computed(() => store.getters['app/filePageCount'])

const pages = computed(() => {
  const page = userPage.value
  const max = filePageCount.value

  let min = 0
  let pages = 5

  if (pages > max) pages = max + 1

  let start = page - Math.floor(pages / 2)
  start = Math.max(start, min)
  start = Math.min(start, min + max - pages + 1)

  return  [...Array(pages).keys()]
    .map((_, i) => start + i)
    .map(n => n.toString())
})

const prevPage = computed(() => {
  return userPage.value > 0
    ? +userPage.value - 1
    : 0
})

const nextPage = computed(() => {
  return userPage.value < filePageCount.value
    ? +userPage.value + 1
    : userPage.value
})
</script>
