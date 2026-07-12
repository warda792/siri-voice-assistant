let btn = document.querySelector("#btn")
let content = document.querySelector("#content")
let voice = document.querySelector("#voice")

// Change this to your deployed backend URL once it's live
// e.g. "https://your-backend.onrender.com"
const BACKEND_URL = "https://siri-voice-assistant-3lbv.vercel.app"

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text)
    text_speak.rate = 1
    text_speak.pitch = 1
    text_speak.volume = 1
    text_speak.lang = "en-GB"
    window.speechSynthesis.speak(text_speak)
}

function wishMe() {
    let day = new Date()
    let hours = day.getHours()
    if (hours >= 0 && hours < 12) {
        speak("Good Morning")
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon")
    } else {
        speak("Good Evening")
    }
}

window.addEventListener('load', () => {
    wishMe()
})

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = new speechRecognition()

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex
    let transcript = event.results[currentIndex][0].transcript
    content.innerText = transcript
    takeCommand(transcript.toLowerCase())
}

btn.addEventListener("click", () => {
    recognition.start()
    btn.style.display = "none"
    voice.style.display = "block"
})

// Sends unmatched commands to the AI backend for a smart reply
async function askAI(message) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Request failed")
        }

        speak(data.reply)
        content.innerText = data.reply

    } catch (err) {
        console.error("AI backend error:", err)
        speak("Sorry, I couldn't reach my brain right now. Please try again.")
    }
}

function takeCommand(message) {
    btn.style.display = "flex"
    voice.style.display = "none"

    if (message.includes("hello") || message.includes("hey")) {
        speak("hello sir, how can I help you?")

    } else if (message.includes("who are you")) {
        speak("I'm your virtual assistant created by Miss Warda Anis")

    } else if (message.includes("what's the time") || message.includes("time")) {
        let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric", second: "numeric" })
        speak(time)

    } else if (message.includes("date")) {
        let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric" })
        speak(date)

    } else if (message.includes("open youtube")) {
        window.open("https://www.youtube.com/", "_blank")
        speak("opening youtube")

    } else if (message.includes("open google")) {
        window.open("https://www.google.com/", "_blank")
        speak("opening google")

    } else if (message.includes("open facebook")) {
        window.open("https://www.facebook.com/", "_blank")
        speak("opening facebook")

    } else if (message.includes("open instagram")) {
        window.open("https://www.instagram.com/", "_blank")
        speak("opening instagram")

    } else if (message.includes("open twitter")) {
        window.open("https://twitter.com/", "_blank")
        speak("opening twitter")

    } else if (message.includes("open linkedin")) {
        window.open("https://www.linkedin.com/", "_blank")
        speak("opening linkedin")

    } else if (message.includes("open whatsapp")) {
        window.open("https://web.whatsapp.com/", "_blank")
        speak("opening whatsapp")

    } else if (message.includes("open stackoverflow")) {
        window.open("https://stackoverflow.com/", "_blank")
        speak("opening stackoverflow")

    } else if (message.includes("open github")) {
        window.open("https://github.com/", "_blank")
        speak("opening github")

    } else if (message.includes("open netflix")) {
        window.open("https://www.netflix.com/", "_blank")
        speak("opening netflix")

    } else if (message.includes("open amazon prime")) {
        window.open("https://www.primevideo.com/", "_blank")
        speak("opening amazon prime")

    } else {
        // No matching command — ask the AI backend instead
        askAI(message)
    }
}
