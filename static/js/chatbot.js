// Handle text input submission
document
  .getElementById("chat-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const userInput = document.getElementById("user-input").value.trim();
    document.getElementById("user-input").value = "";
    if (userInput === "") {
      alert("Please enter a message.");
      return;
    }

    addUserMessage(userInput);

    // Show loading state
    const loadingBubble = addLoadingBubble();

    // Send user input to the server and get the response
    try {
      const response = await fetch("/get_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });

      const result = await response.json();

      // Remove loading bubble
      document.getElementById("chat-bubbles").removeChild(loadingBubble);

      // Add chatbot response bubble
      addBotMessage(result.response);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });

// Record and transcribe vocal input
document
  .getElementById("mic-button")
  .addEventListener("click", async function () {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/m4a" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recorded_audio.m4a");
        const response = await fetch("/transcribe_audio", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.transcription) {
          addUserMessage(result.transcription);
          // Show loading state
          const loadingBubble = addLoadingBubble();
          await sendMessage(result.transcription, loadingBubble);
        }
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
    } catch (err) {
      console.error("Error accessing microphone", err);
    }
  });

// Function to send message to server and handle response
async function sendMessage(message, loadingBubble) {
  try {
    const response = await fetch("/get_response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    });
    const result = await response.json();

    // Remove loading bubble
    document.getElementById("chat-bubbles").removeChild(loadingBubble);

    // Add chatbot response bubble
    addBotMessage(result.response);
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

// Function to add user message to chat
function addUserMessage(message) {
  const chatBubbles = document.getElementById("chat-bubbles");
  const userBubble = document.createElement("li");
  userBubble.className =
    "max-w-2xl ms-auto flex justify-end gap-x-2 sm:gap-x-4 mt-4";
  userBubble.innerHTML = `
      <div class="grow text-end space-y-3">
        <div class="inline-block bg-blue-600 rounded-lg p-2 shadow-sm">
          <p class="text-sm text-white">${message}</p>
        </div>
      </div>
      <span class="shrink-0 inline-flex items-center justify-center size-[38px] rounded-md bg-gray-600">
        <span class="text-sm font-medium text-white leading-none">KID</span>
      </span>
    `;
  chatBubbles.appendChild(userBubble);
  userBubble.scrollIntoView({ behavior: "smooth" });
}

// Function to add bot response to chat
function addBotMessage(message) {
  const chatBubbles = document.getElementById("chat-bubbles");
  const responseBubble = document.createElement("li");
  responseBubble.className = "flex gap-x-2 sm:gap-x-4";
  responseBubble.innerHTML = `
      <span class="inline-flex justify-center items-center w-[38px] h-[38px] rounded-md bg-[#63bda4] overflow-hidden">
        <img src="./static/images/EmoImg.png" alt="" class="object-contain w-full h-full" />
      </span>
      <div class="grow max-w-[90%] md:max-w-2xl w-full space-y-3">
<div class="bg-white border border-white-200 rounded-lg p-4 space-y-3 white:bg-neutral-900 white:border-neutral-700">
          <p class="text-sm text-gray-800">${message}</p>
        </div>
        <div>
          
        </div>
      </div>
    `;
  chatBubbles.appendChild(responseBubble);
  requestAnimationFrame(() => {
    responseBubble.scrollIntoView({ behavior: "smooth" });
  });
}

// Function to add loading bubble
function addLoadingBubble() {
  const chatBubbles = document.getElementById("chat-bubbles");
  const loadingBubble = document.createElement("li");
  loadingBubble.className = "flex gap-x-2 sm:gap-x-4";
  loadingBubble.innerHTML = `
      <span class="inline-flex justify-center items-center w-[38px] h-[38px] rounded-md bg-[#63bda4] overflow-hidden">
        <img src="./static/images/EmoImg.png" alt="" class="object-contain w-full h-full" />
      </span>
      <div class="bg-white border border-gray-200 rounded-lg p-4 space-y-3 white:bg-neutral-900">
        <p class="text-sm text-gray-800 ">EMO is typing...</p>
      </div>
    `;
  chatBubbles.appendChild(loadingBubble);
  return loadingBubble;
}

// Clear the chat bubbles when "New chat" is clicked
document.getElementById("new-chat").addEventListener("click", function () {
  document.getElementById("chat-bubbles").innerHTML = "";
});

// Detect "Enter" key press in the textarea to submit the form
document
  .getElementById("user-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      document.getElementById("chat-form").dispatchEvent(new Event("submit"));
    }
  });
