import router from '@/router'

const state = {
  userFile: null,
  userFilePageSize: 1024 * 3, // blob chunk size
  userFilePageContent: '',
  userFoobarHighlighting: false,
}

const getters = {
  userFilePageCount: (state) => {
    return Math.floor(state.userFile?.size / state.userFilePageSize) || 0 // zero indexed
  },
  userFilePageContentWords: (state) => {
    const words = state.userFilePageContent?.match(/([^\W_#\d]+)/g) ?? []

    return words.reduce((frequency, word) => {
      word = word?.toLowerCase() //  // normalize words to lowercase
      if (!frequency[word]) frequency[word] = 1
      else frequency[word] += 1
      return frequency
    }, {}) || {}
  },
  userFilePageContentWordsFrequent: (state, getters) => {
    const words = getters.userFilePageContentWords
    const mostFrequentCount = Math.max(...Object.values(words))

    return Object.entries(words)
      .filter(([, count]) => count === mostFrequentCount)
      .map(([word]) => word) // extract word (remove count)
      || []
  },
  userFilePageContentProcessed: (state, getters) => {
    const { userFilePageContent } = state
    const { userFilePageContentWordsFrequent } = getters

    const substitute = state.userFoobarHighlighting
      ? 'foo<em>$1</em>bar'
      : '<em>$1</em>'

    return userFilePageContentWordsFrequent.reduce((acc, word) => {
      const regex = new RegExp(`\\b(${word})\\b`, 'ig')
      return acc.replace(regex, substitute)
    }, userFilePageContent) || ''
  },
}

const mutations = {
  setUserFile: (state, payload) => state.userFile = payload,
  setUserFoobarHighlighting: (state, payload) => state.userFoobarHighlighting = payload,
  setUserFilePageContent: (state, payload) => state.userFilePageContent = payload,
}

const actions = {
  updateUserFoobarHighlighting: ({ commit }, payload) => {
    commit('setUserFoobarHighlighting', payload)
  },
  updateUserFile: async ({ commit, dispatch }, payload) => {
    const [file] = Array.isArray(payload) ? payload : [payload] // first file only
    await commit('setUserFile', file)
    dispatch('extractUserFileContent')
  },
  gotoPage: async ({ dispatch }, payload) => {
    const query = {
      page: payload,
    }
    await router.push({ query })
    dispatch('extractUserFileContent')
  },
  extractUserFileContent: async ({ state, commit }) => {
    if (!state.userFile) return await commit('setUserFilePageContent', '')
    // if (currentPage > maxPages) return dispatch('gotoPage', undefined)

    const { page = 0 } = router.currentRoute.value.query || {}
    const start = page * state.userFilePageSize
    const end = start + state.userFilePageSize

    const content = await new Promise((resolve, reject) => {
      const blob = state.userFile.slice(start, end) // TODO: better split on newlines
      const reader = new FileReader()
      reader.onerror = () => reject(reader.error)
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsText(blob)
    })

    commit('setUserFilePageContent', content)
  },
  tempFetch: async ({ dispatch }) => {
    const blob = await fetch('/Employee Empowerment.md').then(res => res.blob())
    dispatch('updateUserFile', blob)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
