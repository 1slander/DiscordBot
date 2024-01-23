const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const folderPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(folderPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(folderPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

console.log(folderPath);
console.log(commandFolders);

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}!`);

  // const ping = new SlashCommandBuilder()
  //   .setName("ping")
  //   .setDescription('Replies with "Pong!"');
  // //const pingCommand = ping.toJSON();
  // client.application.commands.create(ping);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
  // if (interaction.commandName === "ping") {
  //   await interaction.reply("Pong!");
  // }
});

client.login(process.env.DISCORD_TOKEN);
