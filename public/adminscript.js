document
  .getElementById("bot-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const botName = document.getElementById("bot-name").value;
    const pageTitle = document.getElementById("page-title").value;
    const initializationText = document.getElementById("init-text").value;
    const firstMessage = document.getElementById("first-message").value;
    const colorScheme = document.getElementById("colorScheme").value; // new
    const suggestionText = document.getElementById("suggestion-text").value; // new

    fetch("/storeBotData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botName,
        pageTitle,
        initializationText,
        firstMessage,
        colorScheme, // new
        suggestionText, // new
      }),
    }).then((response) => {
      if (response.ok) {
        alert("Data saved successfully");
        location.reload(); // Reload to update the bot selector
      } else {
        alert("Error saving data");
      }
    });
  });

function loadBotData() {
  const botName = document.getElementById("bot-selector").value;
  fetch(`/getBotData/${botName}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("bot-name").value = data.data.botName;
      document.getElementById("page-title").value = data.data.pageTitle;
      document.getElementById("init-text").value = data.data.initializationText;
      document.getElementById("first-message").value = data.data.firstMessage;
      document.getElementById("colorScheme").value = data.data.colorScheme; // new
      document.getElementById("suggestion-text").value =
        data.data.suggestionText; // new
    });
}

// Load existing bot names when the page loads
window.onload = function () {
  fetch("/getBotNames")
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("bot-selector");
      data.forEach((botName) => {
        const option = document.createElement("option");
        option.value = botName;
        option.text = botName;
        select.appendChild(option);
      });
    });
};
