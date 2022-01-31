export default async function workerCommand (payload, transferable, progress) {
  return new Promise((resolve, reject) => {
    try {
      const worker = window.$worker
      const onMessage = (e) => {
        if (e.data.type === `${payload.type}Progress`) return progress(e.data.payload)
        if (e.data.type !== payload.type) return

        worker.removeEventListener('message', onMessage)
        resolve(e.data)
      }
      worker.addEventListener('message', onMessage)
      worker.postMessage(payload, transferable)
    }
    catch (error) {
      reject(error)
    }
  })
}
