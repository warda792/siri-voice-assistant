const BACKEND_URL = "https://siri-voice-assistant-3lbv.vercel.app"

let btn = document.querySelector("#btn")
let content = document.querySelector("#content")
let voice = document.querySelector("#voice")

// Preload voices on page load
let voices = []
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices()
}

function speak(text) {
    window.speechSynthesis.cancel()
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1
        utterance.pitch = 1
        utterance.volume = 1
        const gbVoice = voices.find(v => v.lang === 'en-GB')
        if (gbVoice) utterance.voice = gbVoice
        window.speechSynthesis.speak(utterance)
    }, 100)
}

// Keep Chrome speech engine alive
setInterval(() => {
    if (!window.speechSynthesis.speaking) {
        window.speechSynthesis.resume()
    }
}, 5000)

function wishMe() {
    const hours = new Date().getHours()
    if (hours >= 0 && hours < 12)       speak("Good Morning")
    else if (hours >= 12 && hours < 16) speak("Good Afternoon")
    else                                 speak("Good Evening")
}

window.addEventListener('load', () => {
    setTimeout(wishMe, 500)
})

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = new speechRecognition()

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript
    content.innerText = transcript
    takeCommand(transcript.toLowerCase())
}

recognition.onerror = () => resetUI()
recognition.onend = () => resetUI()

btn.addEventListener("click", () => {
    window.speechSynthesis.cancel()
    recognition.start()
    btn.style.display = "none"
    voice.style.display = "block"
    content.innerText = ''
})

function resetUI() {
    btn.style.display = "flex"
    voice.style.display = "none"
}

// Fetch with one automatic retry after a delay
async function fetchWithRetry(url, options, retries = 2, delayMs = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options)
            const data = await response.json()

            // Gemini rate limit — wait and retry
            if (!response.ok && (
                data.error?.includes('high demand') ||
                data.error?.includes('quota') ||
                data.error?.includes('rate') ||
                response.status === 429 ||
                response.status === 503
            )) {
                if (i < retries - 1) {
                    content.innerText = 'Just a moment...'
                    await new Promise(r => setTimeout(r, delayMs))
                    continue
                }
            }

            return { response, data }
        } catch (err) {
            if (i < retries - 1) {
                await new Promise(r => setTimeout(r, delayMs))
                continue
            }
            throw err
        }
    }
}

async function askAI(message) {
    try {
        content.innerText = 'Thinking...'

        const result = await fetchWithRetry(
            `${BACKEND_URL}/api/ask`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            }
        )

        if (!result) throw new Error("No result")

        const { response, data } = result

        if (!response.ok) {
            // Gemini busy — tell the user nicely
            const friendly = "Gemini is a little busy right now. Please ask me again in a moment."
            content.innerText = friendly
            speak(friendly)
            return
        }

        content.innerText = data.reply
        speak(data.reply)

    } catch (err) {
        console.error("AI backend error:", err)
        const fallback = "I had trouble connecting. Please try again."
        content.innerText = fallback
        speak(fallback)
    }
}

function takeCommand(message) {
    resetUI()

    if (message.includes("hello") || message.includes("hey")) {
        speak("Hello sir, how can I help you?")

    } else if (message.includes("who are you")) {
        speak("I am your virtual assistant created by Miss Warda Anis.")

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

