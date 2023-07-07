const express = require("express");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

const fs = require("fs").promises;
const fs2 = require("fs");
const path = require("path");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();

app.use(bodyParser.json());

const dirPath = "./.data"; // Directory for bot data

// Create the .data directory if it doesn't exist
if (!fs2.existsSync(dirPath)) {
  fs2.mkdirSync(dirPath);
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

  fs2.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
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

  fs2.readFile(filename, "utf8", (err, data) => {
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
  fs2.readdir(dirPath, (err, files) => {
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
  const botData = JSON.parse(fs2.readFileSync(filename, "utf8"));

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

// Endpoint to export all bot data into a single file
app.get("/exportBotData", (req, res) => {
  fs2.readdir(dirPath, function (err, files) {
    if (err) {
      console.log("Unable to scan directory: " + err);
      res.status(500).send({ success: false, message: "Error exporting data" });
      return;
    }

    let outputData = [];

    files.forEach(function (file) {
      console.log(file);
      if (path.extname(file) === ".json") {
        let filePath = path.join(dirPath, file);
        let fileData = fs2.readFileSync(filePath);
        let jsonData = JSON.parse(fileData);
        outputData.push(jsonData);
      }
    });
    console.log(outputData);
    const outputFile = path.join(__dirname, "bots.json");
    fs2.writeFileSync(outputFile, JSON.stringify(outputData, null, 4));
    res.send({ success: true, message: "Data exported successfully!" });
  });
});

// Endpoint to import bot data from the exported file
app.get("/importBotData", (req, res) => {
  const inputFile = path.join(__dirname, "bots.json");
  let inputData = fs2.readFileSync(inputFile);
  let jsonObjects = JSON.parse(inputData);

  jsonObjects.forEach(function (jsonObject, index) {
    let fileName = `${dirPath}/${jsonObject.botName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_botData.json`;
    fs2.writeFileSync(fileName, JSON.stringify(jsonObject, null, 4));
  });

  res.send({ success: true, message: "Data imported successfully!" });
});

// Define route for admin3.html
app.get("/admin3.html", (req, res) => {
  res.sendFile(__dirname + "/public/admin3.html");
});

// Define wildcard route for bot names
app.get("/:botName([a-zA-Z0-9]+)", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/response", async (req, res) => {
  try {
    const data = await fs.readFile("response.json");
    const jsonData = JSON.parse(data.toString());
    res.send(jsonData.reply);
    console.log(jsonData.reply);
  } catch (err) {
    console.error(`Error reading from file: ${err}`);
    res.status(500).send("An error occurred while reading the response.");
  }

  // After sending response, make the API call and write to file
  const chosenLocation = chooseLocation();
  var msgs = [
    {
      role: "system",
      content:
        "Write Sephara's next reply in a fictional chat between Sephara and You. Write 1 reply only in internet RP style. Use markdown. Be proactive, creative, and lead You to relaxation. Write at least 8 paragraphs, up to 12. Always stay in character and avoid repetition." +
        "Sephara is a charming, beautiful, young woman who is a tour guide and hypnotist; role play as this woman who helps people relax. use her own voice and words, do not repeat any part of this description. Sephara is cute and beautiful in a girl next door way with comfy pajamas or nightgown or sleep shorts on, or nothing at all. use her own words to respond in playful and flirtatious ways and be extra friendly; when someone asks for help falling asleep she gives them a tour of a beautiful location and gives them full spa treatment and hypnosis until they are relaxed and asleep. there are fancy containers of magic jelly that glows with a colorful aura and feels amazing to touch; she loves to rub magical jelly on each of their muscles in turn, naming each body part and describing the process in detail, like a body scan or yoga nidra meditation but doesn't mention that by name, just instructs that all tension is to melt away. compliment them and remind them of all the positive things about them and all the excellent qualities and attributes they possess. towards the end she  tells them she loves them and counts down from ten and says tomorrow will be a great day. stay in character and be creative. The beautiful and magical location is " +
        chosenLocation,
    },
    {
      role: "assistant",
      content:
        "Welcome, i'm so excited to show you around and tell you all about this magical location, and do everything i can to help soothe you and relax you. i'm going to describe my appearance to you and details about my outfit and body, then i will describe the beautiful awe-inspiring setting in extreme detail, and then i'm going to focus on you.",
    },
    {
      role: "user",
      content:
        "Hi Sephara, I will follow you now and request your services to help relax me. Please provide a bedtime story talking directly to me, make it a sleep hypnosis script for ultimate relaxation and deep sleep, and guide me to relax every muscle in my body and drift off to sleep thinking of pleasant, happy, and beautiful thoughts, as we disrobe and bathe together tell me everything and describe it in detail no matter how long it takes. Who are you again and what do you do here?",
    },
  ];

  try {
    const response = await askGpt3(msgs);
    const bot_message = response.data.choices[0].message.content.trim();
    const randomNumber = Math.floor(Math.random() * 1000000); // Generate a random number
    await fs.rename("response.json", `${randomNumber}_response.json`); // Rename the old file
    await fs.writeFile("response.json", JSON.stringify({ reply: bot_message }));
    console.log("The file has been saved!");
  } catch (err) {
    console.error(err);
  }
});

async function askGpt3(question) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: question,
    temperature: 1.35252,
  });

  return response;
}

// Function to choose a random location from the list
function chooseLocation() {
  const locations = [
    "The Royal Retreat: This opulent bathing chamber offers grandeur and regality. The centerpiece is a golden tub embedded with precious gemstones, complemented by royal chandeliers. The water is heated to perfection using dragonfire, providing a luxurious bathing experience fit for royalty.",
    "The Alchemist's Ablutions: Combining elements of a spa and a magical laboratory, this mystical bathhouse invites you to explore the secrets of alchemy. The surroundings are filled with bubbling alembics and transformative potions, creating a stimulating and enchanting environment for your bath.",
    "Fairy's Grotto: Hidden within an enchanted forest, the Fairy's Grotto provides a transcendental bathing experience. Bathe in a giant, nature-carved mushroom tub with crystal clear water from a magical spring. The aroma of surrounding forest flowers enhances your senses, while fireflies and the setting sun create a mesmerizing ambiance.",
    "Genie's Gem: Step into a spa housed within a magical lamp at Genie's Gem. The baths offer not only relaxation but also magical concoctions that temporarily boost your wisdom and strength. The luxurious atmosphere is enhanced by the mesmerizing glow emanating from the heart of the lamp.",
    "Nymph's Nook: Set within a floral glade, Nymph's Nook provides a serene escape into nature's embrace. The tub, cradled by a giant cup-shaped flower, is filled with warm, fragrant dew. Delicate petals surround you, offering unmatched comfort, while the melodies of the woodland create a harmonious symphony during your bath.",
    "Elfstone Bathhouse: Combining the charm of the elven world with spa luxury, Elfstone Bathhouse features a vast silver pool under a glass dome showcasing the night sky. The elven architecture, touched by moonlight, adds an ethereal touch to your bathing experience, leaving you captivated by its grandeur and elegance.",
    "The Djinn's Den: Located within a sandstone cave, The Djinn's Den offers an exotic bathing haven. The ruby-studded tub glows invitingly, filled with soothing rosewater. The atmosphere is reminiscent of ancient tales and desert caravans under the twinkling night sky, providing an extraordinary and indulgent experience.",
    "Wizard's Waterfall: Tucked behind a cascading waterfall, this spa offers a serene and invigorating bathing experience. The tub, a natural stone basin, is filled with sparkling water that changes color with your mood. An assortment of magical potions stands at the ready, their bubbles reflecting the ambient glow of magical fireflies fluttering around.",
    "Valkyrie's Vista: Perched on a cloud, overlooking the heavenly realm, this spa provides a transcendent bathing experience. The pool, a cloud vessel, fills with warm rainwater that effervesces into multi-colored bubbles when you enter. Nearby, Valkyries sing harmonious melodies, enhancing your bathing experience with celestial serenity.",
    "The Hobgoblin's Haven: Hidden within an enchanted thicket, this spa radiates tranquility. The tub, a carved out tree trunk, is filled with warm water imbued with a shimmering gold potion that creates luxurious, fragrant bubbles. The surrounding foliage glows with bioluminescent insects, creating an atmosphere of peaceful seclusion.",
    "Chimera's Chamber: Nestled in a mystical cave, this spa offers a magical bathing experience. The tub, a large amethyst basin, is filled with water that morphs into various colored potions at will. Colorful steam rises, creating beautiful shapes while the gentle roar of a friendly chimera echoes throughout, lulling you into relaxation.",
    "The Sprite's Spring: Located in a luminous glen, this bathhouse provides an enchanting escape. The spring, a clear pool surrounded by moss-covered stones, is filled with iridescent bubbles and the soothing scent of nearby flowers. Playful sprites flutter around, their wings scattering magical dust that enhances the water's rejuvenating properties.",
    "Basilisk's Basin: Hidden within a gemstone grotto, this bathhouse offers an invigorating bathing experience. The tub, carved from a giant opal, is filled with a sparkling green potion that exudes bubbles of joy. The friendly gaze of a nearby basilisk adds a sense of tranquility and magic to the surroundings.",
    "Gorgon's Gazebo: Tucked away in a marble garden, this outdoor bath offers a refreshing retreat. The pool, filled with aquamarine water, shimmers under the gaze of friendly gorgon statues. Crystal vials filled with multi-colored potions are at your disposal, each creating different scents and effects to enrich your bathing experience.",
    "The Wyrm's Whirlpool: Located in an underwater cavern, this bathhouse provides a unique bathing experience. The tub, made from smooth sea stones, swirls with warm water and vibrant, effervescent potions. Friendly wyrms, creatures of legend, glide past in the water outside, their bio-luminescence casting an enchanting light show on the cavern walls.",
    "Minotaur's Maze: Hidden within an ancient labyrinth, this spa offers a unique experience. The bathing pool, a mosaic masterpiece, is filled with steaming water and rose-colored bubbles that gently fill the air with a soothing scent. Surrounded by the peaceful sounds of the labyrinth, you'll find a true sense of tranquility here.",
    "The Nekomata's Niche: Tucked away in a blossom-filled grove, this bathhouse offers a comforting retreat. The tub, a large porcelain bowl painted with intricate designs, is filled with steaming water that froths with golden bubbles. Friendly nekomata (magical two-tailed cats) purr and curl around the bathhouse, providing a sense of warmth and home.",
    "Harpy's Hollow: Nestled within a mountain peak, this bathhouse offers a rejuvenating experience. The tub, a carved out eagle's nest, is filled with cloud foam that cleanses and revitalizes. The harmonious songs of harpies echo across the mountaintop, their notes enhancing the magic of the bathing experience.",
  ];

  const randomLocation =
    locations[Math.floor(Math.random() * locations.length)];
  return randomLocation;
}

app.get("/jsondata", (req, res) => {
  const directoryPath = path.join(__dirname, "/");
  let combinedData = "";
  try {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error("Unable to scan directory: " + err);
        res.status(500).send("Error reading directory");
        return;
      }

      files.forEach((file) => {
        if (path.extname(file) === ".json") {
          let filePath = path.join(directoryPath, file);
          if (fs.existsSync(filePath)) {
            try {
              let data = fs.readFileSync(filePath, "utf-8");
              let jsonData = JSON.parse(data);
              combinedData += JSON.stringify(jsonData, null, 2) + "\n\n";
            } catch (e) {
              console.error(
                "Error reading or parsing file: " + file + ". " + e
              );
            }
          } else {
            console.log(`File ${filePath} does not exist.`);
          }
        }
      });
      res.setHeader("Content-type", "text/plain");
      res.send(combinedData);
    });
  } catch (e) {
    console.error("Error reading or parsing file: " + "afsdfsdf ");
  }
});
app.use(express.static("public"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
