import { precacheAndRoute } from 'workbox-precaching'
precacheAndRoute(self.__WB_MANIFEST)

console.log('Worker: init')

const state = {
  file: null,
  frequency: new Map(),
}

self.onmessage = async (e) => {
  const { type, payload } = e.data

  switch (type) {
    case 'getFileWords':
      state.file = payload // save for future use
      state.frequency = new Map()
      return self.postMessage({ type, payload: await getFileWords(payload) })
    case 'getFileChunk': {
      return self.postMessage({ type, payload: await getFileChunk(payload) })
    }
    default:
      console.log('Worker (unhandled):', e.data)
  }
}

async function getFileChunk({ start, end }) {
  return new Promise((resolve, reject) => {
    if (!state.file) resolve(null)
    const blob = state.file.slice(start, end)
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsText(blob)
  })
}

function getFileWords (blob) {
  return new Promise((resolve, reject) => {
    if (!blob) return resolve(null)
    const reader = new FileLineStreamer()

    reader.open(blob, (lines, error) => {
      if (error) return reject(error)
      if (lines === null) {
        let highest = []

        for (let [k, v] of state.frequency.entries()) {
          const [, value = 0] = highest || []
          if (v > value) highest = [k, v]
        }

        return resolve(highest)
      }

      lines.join('\n')?.match(/(\p{Letter}+)/gu)?.forEach(word => {
        word = word?.toLowerCase() // normalize words to lowercase
        if (!state.frequency.has(word)) state.frequency.set(word, 1)
        else state.frequency.set(word, state.frequency.get(word) + 1)
      })

      self.postMessage({
        type: 'getFileWordsProgress',
        payload: reader.getProgress(),
      })

      reader.getNextBatch()
    })

    // start
    reader.getNextBatch()
  })
}

// https://stackoverflow.com/questions/24647563/reading-line-by-line-file-in-javascript-on-client-side
function FileLineStreamer () {
  var loopholeReader = new FileReader();
  var chunkReader = new FileReader();
  var delimiter = "\n".charCodeAt(0);

  var expectedChunkSize = 1024*1024; // Slice size to read
  var loopholeSize = 200;            // Slice size to search for line end

  var file = null;
  var fileSize;
  var loopholeStart;
  var loopholeEnd;
  var chunkStart;
  var chunkEnd;
  var lines;
  var thisForClosure = this;
  var handler;

  // Reading of loophole ended
  loopholeReader.onloadend = function(evt) {
    // Read error
    if (evt.target.readyState != FileReader.DONE) {
      handler(null, new Error("Not able to read loophole (start: )"));
      return;
    }
    var view = new DataView(evt.target.result);

    var realLoopholeSize = loopholeEnd - loopholeStart;

    for(var i = realLoopholeSize - 1; i >= 0; i--) {
      if (view.getInt8(i) == delimiter) {
        chunkEnd = loopholeStart + i + 1;
        var blob = file.slice(chunkStart, chunkEnd);
        chunkReader.readAsText(blob);
        return;
      }
    }

    // No delimiter found, looking in the next loophole
    loopholeStart = loopholeEnd;
    loopholeEnd = Math.min(loopholeStart + loopholeSize, fileSize);
    thisForClosure.getNextBatch();
  };

  // Reading of chunk ended
  chunkReader.onloadend = function(evt) {
    // Read error
    if (evt.target.readyState != FileReader.DONE) {
      handler(null, new Error("Not able to read loophole"));
      return;
    }

    lines = evt.target.result.split(/\r?\n/);
    // Remove last new line in the end of chunk
    if (lines.length > 0 && lines[lines.length - 1] == "") {
      lines.pop();
    }

    chunkStart = chunkEnd;
    chunkEnd = Math.min(chunkStart + expectedChunkSize, fileSize);
    loopholeStart = Math.min(chunkEnd, fileSize);
    loopholeEnd = Math.min(loopholeStart + loopholeSize, fileSize);

    thisForClosure.getNextBatch();
  };

  this.getProgress = function () {
    if (file == null)
      return 0;
    if (chunkStart == fileSize)
      return 100;
    return Math.round(100 * (chunkStart / fileSize));
  }

  // Public: open file for reading
  this.open = function (fileToOpen, linesProcessed) {
    file = fileToOpen;
    fileSize = file.size;
    loopholeStart = Math.min(expectedChunkSize, fileSize);
    loopholeEnd = Math.min(loopholeStart + loopholeSize, fileSize);
    chunkStart = 0;
    chunkEnd = 0;
    lines = null;
    handler = linesProcessed;
  };

  // Public: start getting new line async
  this.getNextBatch = function() {
    // File wasn't open
    if (file == null) {
      handler(null, new Error("You must open a file first"));
      return;
    }
    // Some lines available
    if (lines != null) {
      var linesForClosure = lines;
      setTimeout(function() { handler(linesForClosure, null) }, 0);
      lines = null;
      return;
    }
    // End of File
    if (chunkStart == fileSize) {
      handler(null, null);
      return;
    }
    // File part bigger than expectedChunkSize is left
    if (loopholeStart < fileSize) {
      let blob = file.slice(loopholeStart, loopholeEnd);
      loopholeReader.readAsArrayBuffer(blob);
    }
    // All file can be read at once
    else {
      chunkEnd = fileSize;
      let blob = file.slice(chunkStart, fileSize);
      chunkReader.readAsText(blob);
    }
  };
}
