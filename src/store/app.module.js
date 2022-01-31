import router from '@/router'
import workerCommand from '@/helper/workerCommand'

const state = {
  fileMeta: {},
  fileWords: [],
  fileWordsLoading: null,
  filePageSize: 1024 * 3, // blob chunk size
  filePageContent: '',
  userFoobarHighlighting: false,
}

const getters = {
  filePageCount: (state) => {
    return Math.floor(state.fileMeta?.size / state.filePageSize) || 0 // zero indexed
  },
  filePageStartEnd: (state) => {
    const { page = 0 } = router.currentRoute.value.query || {}
    const start = page * state.filePageSize
    const end = start + state.filePageSize
    return {
      start,
      end,
    }
  },
  filePageContentHighlighted: (state) => {
    const substitute = state.userFoobarHighlighting
      ? 'foo<em>$1</em>bar'
      : '<em>$1</em>'

    const regex = new RegExp(`\\b(${state.fileWords})\\b`, 'ig')
    return state.filePageContent?.replace(regex, substitute)
  },
}

const mutations = {
  setFileMeta: (state, payload) => state.fileMeta = payload,
  setFileWords: (state, payload) => state.fileWords = payload,
  setFileWordsLoading: (state, payload) => state.fileWordsLoading = payload,
  setFilePageContent: (state, payload) => state.filePageContent = payload,
  setUserFoobarHighlighting: (state, payload) => state.userFoobarHighlighting = payload,
}

const actions = {
  updateUserFoobarHighlighting: ({ commit }, payload) => {
    commit('setUserFoobarHighlighting', payload)
  },
  updateUserFile: async ({ commit, dispatch }, payload) => {
    const [file] = Array.isArray(payload) ? payload : [payload] // first file only
    const meta = !file ? {} : {
      size: file.size,
    }

    const query = {
      page: undefined,
    }
    await router.push({ query })
    await commit('setFileWords', null)
    await commit('setFilePageContent', '')

    await commit('setFileMeta', meta)
    await dispatch('getFileWords', file)
    await dispatch('getFileChunk')
  },
  getFileChunk: async ({ commit, getters }, payload) => { // eslint-ignore-line no-unused-vars
    const data = await workerCommand({
      type: 'getFileChunk',
      payload: payload || getters.filePageStartEnd,
    })
    commit('setFilePageContent', data.payload)
  },
  getFileWords: async ({ commit } , blob) => {
    commit('setFileWordsLoading', 1)

    const data = await workerCommand({
      type: 'getFileWords',
      payload: blob,
    }, undefined, (percent) => {
      commit('setFileWordsLoading', percent)
    })

    const [word] = data.payload || []
    commit('setFileWords', word)
    commit('setFileWordsLoading', false)

    if (blob?.byteLength) { // should not have access to buffer
      console.warn('getFileWords: transferable not sent?')
    }
  },
  gotoPage: async ({ dispatch }, payload) => {
    const query = {
      page: payload,
    }
    await router.push({ query })
    dispatch('getFileChunk')
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
