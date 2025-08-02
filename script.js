const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");



//   API Setup
const API_KEY = "AIzaSyD5lKeVgMDdMAT6uXaaQ-mR5RBJBV3X2AI";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const chatHistory = [];

// creates message elements with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Generate user message using API
const generateBotResponse = async (incomingMesageDiv) => {
  const messageElement = incomingMesageDiv.querySelector(".message-text");


  // Add bot response to chat history
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data
        ? [
            {
              inline_data: {
                mime_type: userData.file.mime_type,
                data: userData.file.data,
              },
            },
          ]
        : []),
    ],
  });

  // API request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory,
    }),
  };

  try {

    // Fetch bot response from API
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);



    // Extract and display bot's response text
    const apiResponseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    messageElement.innerText = apiResponseText;



    // add bot response to chat history
    chatHistory.push({
    role: "model",
    parts: [{text:apiResponseText}],
  });


  } catch (error) {
    console.log(error);
    messageElement.innerText = error.message;
    messageElement.style.color = "#ff0000";
  } finally {
    // Reset file after sending
    userData.file = { data: null, mime_type: null };
    incomingMesageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

//handling outgoint user message
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim(); // storing user message by creating a global object making it accessable throughout the project
  messageInput.value = ""; // Clearing textarea after the message is sent
  fileUploadWrapper.classList.remove("file-uploaded");

  //Create and display user message
  const messageContent = `<div class="message-text"></div>
                          ${
                            userData.file
                              ? `<img src = "data:${userData.file.mime_type};base64,${userData.file.data}" class = "attachment"/>`
                              : ""
                          }`;

  const outgoingMesageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  outgoingMesageDiv.querySelector(".message-text").textContent =
    userData.message; // instead of textcontent use innertext
  chatBody.appendChild(outgoingMesageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // to display loading ,thinking and bot answer
  //Stimulate bot response with thinking indicator after a delay
  setTimeout(() => {
    const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path fill="#040926" d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8
                        106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8
                        106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9
                        53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8
                        0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5
                        0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2
                        644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2
                        609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5
                        149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9
                        51.9-51.9s51.9 23.3 51.9 51.9z">
                    </path>
                    <!--to change the color of chatbot logo(<path fill="#7C7C7C")-->
                    <!--this svg states the generation of the images like chatbot logo and images-->
                </svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                    
                </div>`;

    const incomingMesageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );
    chatBody.appendChild(incomingMesageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    generateBotResponse(incomingMesageDiv);
  }, 600);
};

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim(); //trim() method  removes whitespace from both side of  a string
  if (e.key === "Enter" && userMessage) {
    handleOutgoingMessage(e);
  }
});

// Handle file input change and preview selected file
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader(); // converting file to base64 format   (Base64 is a binary-to-text encoding scheme used to represent binary data (like images, files, or any non-text content) in a readable ASCII string format./ ext-based formats like HTML, CSS, JSON, or XML)
  reader.onload = (e) => {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    // store file data in userData
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
    fileInput.value = ""; // clearing the file input value to allow the user to select the same file again
  };

  reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
});

// Initialize emoji picked and emoji selection
const picker = new EmojiMart.Picker({
  theme: "dark",
  skinTonePosition: "preview",
  set: "apple",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});

document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document
  .querySelector("#file-upload")
  .addEventListener("click", () => fileInput.click()); // trigger the file input when the file upload button is clicked

chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);

closeChatbot.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
