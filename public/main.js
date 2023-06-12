let messageIndex = 1;

function addMessageToChatbox(sender, text, messageClass) {
  const messageDiv = document.createElement("div");
  messageDiv.innerHTML = `${sender}: ${text}`;
  messageDiv.classList.add(messageClass);
  document.getElementById("chatbox").appendChild(messageDiv);
}

function addSuggestionToContainer(suggestion) {
  const suggestionButton = document.createElement("button");
  suggestionButton.innerHTML = suggestion;
  suggestionButton.classList.add("suggestion");
  document.getElementById("suggestionsContainer").appendChild(suggestionButton);
}

document.getElementById("sendButton").addEventListener("click", () => {
  const userInput = document.getElementById("userInput").value;
  if (userInput) {
    addMessageToChatbox("You", userInput, "userText");
    document.getElementById("userInput").value = "";

    // Example bot response
    setTimeout(() => {
      addMessageToChatbox("Bot", "This is a response.", "botText");
      // Example suggestions
      ["Suggestion 1", "Suggestion 2", "Suggestion 3"].forEach((suggestion) => {
        addSuggestionToContainer(suggestion);
      });
    }, 1000);
  }
});
