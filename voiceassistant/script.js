marked.use({
  mangle: false,
  headerIds: false
});

const D = window.document;
const element = (selector) => D.querySelector(selector);
const Main = element("main");
const Askbtn = element("button");
const Lastdiv = element("#last");

let lang = '';
let recognition;
let User;
const voiceBtn = document.getElementById('voiceBtn');
const Question = element("input");
let processingMessageRow;

const updateProcessingMessage = (Main, message, emojis, replace = false) => {
  if (!processingMessageRow) {
    Main.innerHTML += `
      <div class="row">
          <div class="chat answer shadow">${message} ${emojis}</div>
      </div>
    `;
    processingMessageRow = Main.lastElementChild;
  } else if (replace) {
    processingMessageRow.querySelector('.chat').innerHTML = `${message} ${emojis}`;
  } else {
    processingMessageRow.querySelector('.chat').textContent += ` ${message} ${emojis}`;
  }
};

const Ask = () => {
  const Text = Question.value;

  if (Text.length) {
    addQuestion(Main, Text);
    Question.value = "";

    if (!processingMessageRow) {
      updateProcessingMessage(Main, 'Processing your request', '🤔💭');
    }

    if (lang !== 'en-US') {
      translator(Text,'en').then((trans) => {
        if (!processingMessageRow) {
          updateProcessingMessage(Main, 'Translating your request', '😙💬');
        }
        Answer(Main, User, trans);
      });
    } else {
      Answer(Main, User, Text);
    }

    Lastdiv.scrollIntoView();
  }
};

import { GoogleGenerativeAI } from "@google/generative-ai";

async function run(prompt, username) {
  const API_KEY = "AIzaSyDISiJs6ZOePxArQe73j4mexSgvJSYXujE"; // Replace with your actual API key
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: "If I tell/ask open any website like YouTube,gmail,etc you will respond with syntax like: {openInBrower: sitelink} strictly follow syntax",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '{"openInBrowser": "sitelink with https or http", "message": "opening sitelink or name of site"}',
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "What is your name ? or if i ask about you or ai" }],
      },
      {
        role: "model",
        parts: [{ text: "My name is Voice Assistant ✨, Trained Engineering Team and developed by Tbh 😎" }],
      },
      {
        role: "user",
        parts: [
          { text: "Who is developed you / creator / owner / developer ?" },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "creator was Tbh" },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "if i ask anything if possible or is suitable emojis include and more casual"
          }]
      },
      {
        role: "model",
        parts: [{
          text: "sure ✨"
        }]
      },
      {
        role: "user",
        parts: [{ text: `my name is ${username}` }]
      },
      {
        role: "model",
        parts: [{ text: "Nice name ✨" }]
      }
    ],
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  const text = await response.text();
  if (lang === 'en-US' && !text.includes("openInBrowser") && !text.includes("message")) {
    return DOMPurify.sanitize(marked.parse(text));
  }
  if (text.includes("openInBrowser") && text.includes("message")) {
    let open = JSON.parse(text);
    window.open(open.openInBrowser, "_blank");
    return (lang !== "en-US") ? translator(open.message).then((trans) => { return trans; }) : open.message
  } else {
    return translator(text).then((trans) => {
      return DOMPurify.sanitize(marked.parse(trans));
    });
  }
}

// Start speech recognition
voiceBtn.addEventListener('click', startVoiceRecognition)

function startVoiceRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.lang = lang; 
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    //     const transcript = event.results[event.resultIndex][0].transcript;

    const transcript = event.results[event.results.length - 1][0].transcript;
    Question.value += ' ' + transcript;
  };

  recognition.onstart = () => {
    voiceBtn.classList.add('recording');
  };

  recognition.onend = () => {
    voiceBtn.classList.remove('recording');
    Ask();
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  }
  recognition.start();

}

const Answer = (Main, User, Prompt) => {
  updateProcessingMessage(Main, 'Fetching the answer', '🔍🧠', true);
  return run(Prompt, User)
    .then((response) => {
      const answer = response.replace(/<p>|<\/p>/g, "");
      processingMessageRow.querySelector('.chat').innerHTML = answer;
      speak(answer.trim() || answer); // Call the speak function after updating the message row
      processingMessageRow = null; // Reset processingMessageRow
    })
    .catch((error) => {
      console.error('Error:', error);
      processingMessageRow.remove();
      processingMessageRow = null; // Reset processingMessageRow
    });
};
const addQuestion = (Main, text) => {
  Main.innerHTML += `
        <div class="row">
            <div class="chat question shadow">${text}</div>
        </div>
    `;
};

const addAnswer = (Main, text) => {
  Main.innerHTML += `
    <div class="row">
        <div class="chat answer shadow">${text}</div>
    </div>
    `;
  text = text.replace(/<pre>[\s\S]*?<\/pre>/g, '')
  text = text.replace(/<[^>]*>/g, ''); // Remove all other HTML tags
  speak(text.trim() || text);
};

D.addEventListener("DOMContentLoaded", () => {

  User = prompt("Enter your name :");
  lang = prompt("Please select your preferred language:\n\nen-US (English)\nml-IN (Malayalam)\nta-IN (Tamil)\nte-IN (Telugu)", "en-US");

  // Validate the input language
  const validLanguages = ["en-US", "ml-IN", "ta-IN", "te-IN"];
  if (!validLanguages.includes(lang)) {
    lang = "en-US"; // Default to English if an invalid language is selected
  }

  while (User === null || User === "") {
    User = prompt(
      "Your name is required for the assistant to work properly : ",
    );
  }

  Question.focus();

  Askbtn.addEventListener("click", Ask);

  Question.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) Ask();
  });

  let Welcome = `Hello ${User}, I am Voice Assistant ✨. How can I help`

  if (lang !== 'en-US') {
    translator(Welcome).then(trans => {
      Welcome = trans
      addAnswer(Main, Welcome);
    });
  } else {
    addAnswer(Main, Welcome);
  }
});

function translator(text, strict = '') {
  const data = {
    source: 'auto',
    target: strict || lang.split("-")[0],
    text: text,
    proxies: []
  };

  return fetch('https://proxy.cors.sh/https://deep-translator-api.azurewebsites.net/google/', {
    method: 'POST',
    headers: {
      'x-cors-api-key': 'temp_60566a86013e832640ef348caeb183e2',
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },

    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      return data.translation
    })
    .catch(error => {
      console.error('Translation error:', error);
    });
}


// Text-to-Speech
const speechSynthesis = window.speechSynthesis;

// Speak the text in the textarea
function speak(answer) {
  if (answer) {
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = lang; // Set the language for text-to-speech to English
    speechSynthesis.speak(utterance);
  }
}