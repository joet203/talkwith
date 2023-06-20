const express = require("express");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();

app.use(bodyParser.json());

const dirPath = "./.data"; // Directory for bot data

// Create the .data directory if it doesn't exist
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// Endpoint to store bot data
app.post("/storeBotData", (req, res) => {
  const data = {
    botName: req.body.botName,
    pageTitle: req.body.pageTitle,
    initializationText: req.body.initializationText,
    firstMessage: req.body.firstMessage,
    colorScheme: req.body.colorScheme,
    suggestionText: req.body.suggestionText,
  };

  const filename = `${dirPath}/${data.botName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}_botData.json`;

  fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: "Error storing data" });
    } else {
      res.send({ success: true, data });
    }
  });
});

// Endpoint to retrieve bot data
app.get("/getBotData/:botName", (req, res) => {
  const botName = req.params.botName;
  const filename = `${dirPath}/${botName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}_botData.json`;

  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .send({ success: false, message: "Error retrieving data" });
    } else {
      res.send({ success: true, data: JSON.parse(data) });
    }
  });
});

// Endpoint to retrieve all bot names
app.get("/getBotNames", (req, res) => {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .send({ success: false, message: "Error retrieving bot names" });
    } else {
      const botNames = files
        .filter((file) => file.endsWith("_botData.json")) // Only consider JSON data files
        .map((file) => path.basename(file, "_botData.json")); // Remove file extension to get bot name

      res.send(botNames);
    }
  });
});

app.post("/message", async (req, res) => {
  const botName = req.body.botName;
  const user_message = req.body.messages;

  // Load bot data from JSON file
  const filename = `./.data/${botName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}_botData.json`;
  const botData = JSON.parse(fs.readFileSync(filename, "utf8"));

  var start = {
    role: "system",
    content: botData.initializationText,
  };

  const msgs = [start, ...user_message];

  try {
    var gptResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: msgs,
    });
    const bot_message = gptResponse.data.choices[0].message.content.trim();

    res.json({ reply: bot_message });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Define route for admin3.html
app.get("/admin3.html", (req, res) => {
  res.sendFile(__dirname + "/public/admin3.html");
});

// Define wildcard route for bot names
app.get("/:botName([a-zA-Z0-9]+)", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(express.static("public"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
