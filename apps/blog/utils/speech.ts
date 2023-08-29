export const handleRecord = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  // const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
  // const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent

  const recognition = new SpeechRecognition()
  // if (SpeechGrammarList) {
  //   // SpeechGrammarList is not currently available in Safari, and does not have any effect in any other browser.
  //   // This code is provided as a demonstration of possible capability. You may choose not to use it.
  //   const speechRecognitionList = new SpeechGrammarList()
  //   const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(' | ')} ;`
  //   speechRecognitionList.addFromString(grammar, 1)
  //   recognition.grammars = speechRecognitionList
  // }
  recognition.continuous = false
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.start()
  console.log('Ready to receive.')

  recognition.onresult = function (event: any) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at the last position.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    console.log(event.results[0][0].transcript)
  }

  recognition.onspeechend = function () {
    recognition.stop()
  }

  recognition.onnomatch = function (event: any) {
    console.log(event)
  }

  recognition.onerror = function (event: any) {
    console.log(event)
  }
}
