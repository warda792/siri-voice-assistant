const BACKEND_URL = "https://siri-voice-assistant-3lbv.vercel.app"

let btn = document.querySelector("#btn")
let content = document.querySelector("#content")
let voice = document.querySelector("#voice")

// ── Speech Engine ─────────────────────────────────────────────────────────────
// Chrome has a well-known bug where SpeechSynthesis silently dies mid-session.
// This engine fixes it with:
//   1. Voice preloading — wait for voices before first speak
//   2. Cancel + delay — always cancel before new utterance, wait 150ms
//   3. Keep-alive ping — every 10s resume() to prevent Chrome from sleeping it
//   4. onend retry — if speech ends without speaking (bug), retry once
//   5. Timeout watchdog — if speech doesn't start in 1s, cancel and retry

let selectedVoice = null
let keepAliveInterval = null
let isSpeaking = false

function loadVoices() {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
            selectedVoice = voices.find(v => v.lang === 'en-GB') || voices[0]
            resolve()
            return
        }
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices()
            selectedVoice = voices.find(v => v.lang === 'en-GB') || voices[0]
            resolve()
        }
    })
}

function startKeepAlive() {
    stopKeepAlive()
    keepAliveInterval = setInterval(() => {
        if (!isSpeaking) {
            window.speechSynthesis.resume()
        }
    }, 10000)
}

function stopKeepAlive() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval)
        keepAliveInterval = null
    }
}

function speak(text) {
    window.speechSynthesis.cancel()
    isSpeaking = false

    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1
        utterance.pitch = 1
        utterance.volume = 1
        utterance.lang = 'en-GB'

        if (selectedVoice) {
            utterance.voice = selectedVoice
        }

        utterance.onerror = (e) => {
            if (e.error === 'interrupted') return
            console.warn('Speech error:', e.error)
            isSpeaking = false
            stopKeepAlive()
        }

        utterance.onend = () => {
            isSpeaking = false
            stopKeepAlive()
        }

        // Watchdog: if speech hasn't started in 1 second, force-retry once
        let watchdogFired = false
        const watchdog = setTimeout(() => {
            if (!isSpeaking) {
                watchdogFired = true
                console.warn('Speech watchdog triggered — retrying')
                window.speechSynthesis.cancel()
                setTimeout(() => {
                    window.speechSynthesis.speak(utterance)
                }, 200)
            }
        }, 1000)

        utterance.onstart = () => {
            if (!watchdogFired) clearTimeout(watchdog)
            isSpeaking = true
            startKeepAlive()
        }

        window.speechSynthesis.speak(utterance)
    }, 150)
}

// ── Greeting ──────────────────────────────────────────────────────────────────
async function wishMe() {
    await loadVoices()
    const hours = new Date().getHours()
    if (hours >= 0 && hours < 12)       speak("Good Morning")
    else if (hours >= 12 && hours < 16) speak("Good Afternoon")
    else                                 speak("Good Evening")
}

window.addEventListener('load', wishMe)

// ── Speech Recognition ────────────────────────────────────────────────────────
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = new speechRecognition()
recognition.lang = 'en-GB'
recognition.interimResults = false
recognition.maxAlternatives = 1

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript
    content.innerText = transcript
    takeCommand(transcript.toLowerCase())
}

recognition.onerror = (e) => {
    console.warn('Recognition error:', e.error)
    resetUI()
    if (e.error === 'not-allowed') {
        content.innerText = 'Microphone access denied. Please allow mic access.'
    }
}

recognition.onend = resetUI

btn.addEventListener("click", () => {
    window.speechSynthesis.cancel()
    isSpeaking = false
    recognition.start()
    btn.style.display = "none"
    voice.style.display = "block"
    content.innerText = ''
})

function resetUI() {
    btn.style.display = "flex"
    voice.style.display = "none"
}

// ── AI Fallback ───────────────────────────────────────────────────────────────
async function askAI(message) {
    try {
        content.innerText = 'Thinking...'
        const response = await fetch(`${BACKEND_URL}/api/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Request failed")
        content.innerText = data.reply
        speak(data.reply)
    } catch (err) {
        console.error("AI backend error:", err)
        const fallback = "Sorry, I couldn't reach my brain right now. Please try again."
        content.innerText = fallback
        speak(fallback)
    }
}

// ── Command Handler ───────────────────────────────────────────────────────────
function takeCommand(message) {
    resetUI()

    if (message.includes("hello") || message.includes("hey")) {
        speak("Hello sir, how can I help you?")

    } else if (message.includes("who are you")) {
        speak("I'm your virtual assistant created by Miss Warda Anis.")

    } else if (message.includes("time")) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric", second: "numeric" })
        speak(time)

    } else if (message.includes("date")) {
        const date = new Date().toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric" })
        speak(date)

    } else if (message.includes("open youtube")) {
        window.open("https://www.youtube.com/", "_blank")
        speak("Opening YouTube")

    } else if (message.includes("open google")) {
        window.open("https://www.google.com/", "_blank")
        speak("Opening Google")

    } else if (message.includes("open facebook")) {
        window.open("https://www.facebook.com/", "_blank")
        speak("Opening Facebook")

    } else if (message.includes("open instagram")) {
        window.open("https://www.instagram.com/", "_blank")
        speak("Opening Instagram")

    } else if (message.includes("open twitter")) {
        window.open("https://twitter.com/", "_blank")
        speak("Opening Twitter")

    } else if (message.includes("open linkedin")) {
        window.open("https://www.linkedin.com/", "_blank")
        speak("Opening LinkedIn")

    } else if (message.includes("open whatsapp")) {
        window.open("https://web.whatsapp.com/", "_blank")
        speak("Opening WhatsApp")

    } else if (message.includes("open stackoverflow")) {
        window.open("https://stackoverflow.com/", "_blank")
        speak("Opening Stack Overflow")

    } else if (message.includes("open github")) {
        window.open("https://github.com/", "_blank")
        speak("Opening GitHub")

    } else if (message.includes("open netflix")) {
        window.open("https://www.netflix.com/", "_blank")
        speak("Opening Netflix")

    } else if (message.includes("open amazon prime")) {
        window.open("https://www.primevideo.com/", "_blank")
        speak("Opening Amazon Prime")

    } else {
        askAI(message)
    }
}

