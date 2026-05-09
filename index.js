import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Events,
  type ChatInputCommandInteraction,
  type Message,
} from "discord.js";
import { commands } from "./commands";
import {
  handleChat,
  handleCharacters,
  handleBounty,
  handleDevilFruit,
  handleFact,
} from "./handlers";
import {
  handleStart,
  handlePrendre,
  handleRefuser,
  handleNaviguer,
  handleCombattre,
  handleFuir,
  handleRejoindre,
  handleDebarquer,
  handleMangerFruit,
  handleStatut,
  handleIle,
  handleQuete,
  handleComplete,
  handleSail,
  handleBountyPlayer,
  handleAttaque,
  handleFight,
  handleFruit,
  handleMove,
  handleMap,
  handleNear,
  handleShip,
  handleAttackPlayer,
  handleCrew,
  handleUpgrade,
  handleInventaire,
  handleBoss,
  handleInventory,
  handleHaki,
  triggerEvenementAleatoire,
  triggerBossAleatoire,
  triggerRencontreAleatoire,
} from "./adventure";
import { logger } from "../lib/logger";

function narrer(message: Message, texte: string): void {
  message.channel.send("📜 " + texte).catch((err) => {
    logger.error({ err }, "narrer send error");
  });
}

export async function startBot(): Promise<void> {
  const token = process.env["DISCORD_TOKEN"];
  if (!token) {
    logger.warn("DISCORD_TOKEN not set — Discord bot will not start");
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, async (readyClient) => {
    logger.info({ tag: readyClient.user.tag }, "Discord bot is online");

    const rest = new REST().setToken(token);
    const applicationId = readyClient.application.id;
    const commandData = commands.map((cmd) => cmd.toJSON());

    try {
      await rest.put(Routes.applicationCommands(applicationId), {
        body: commandData,
      });
      logger.info("Slash commands registered globally");
    } catch (err) {
      logger.error({ err }, "Failed to register slash commands");
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = interaction as ChatInputCommandInteraction;

    try {
      switch (cmd.commandName) {
        case "chat":
          await handleChat(cmd);
          break;
        case "characters":
          await handleCharacters(cmd);
          break;
        case "bounty":
          await handleBounty(cmd);
          break;
        case "devilfruit":
          await handleDevilFruit(cmd);
          break;
        case "fact":
          await handleFact(cmd);
          break;
        default:
          await cmd.reply({
            content: "Unknown command!",
            ephemeral: true,
          });
      }
    } catch (err) {
      logger.error({ err, command: cmd.commandName }, "Command handler error");
      if (!cmd.replied && !cmd.deferred) {
        await cmd.reply({
          content: "Something went wrong on the Grand Line. Try again!",
          ephemeral: true,
        });
      }
    }
  });

  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;

    triggerRencontreAleatoire(message);
    triggerEvenementAleatoire(message);
    triggerBossAleatoire(message);

    const content = message.content.trim();
    const contentLower = content.toLowerCase();

    if (contentLower.startsWith("!attack")) {
      handleAttackPlayer(message);
      return;
    }
    if (contentLower.startsWith("!crew ")) {
      handleCrew(message, content.slice(6));
      return;
    }
    if (contentLower.startsWith("!upgrade")) {
      handleUpgrade(message, content.slice(9).trim());
      return;
    }

    switch (contentLower) {
      case "!ping":
        message.reply("🏓 Pong !").catch((err) =>
          logger.error({ err }, "ping reply error")
        );
        break;
      case "!start":
        handleStart(message);
        break;
      case "!prendre":
        handlePrendre(message);
        break;
      case "!refuser":
        handleRefuser(message);
        break;
      case "!naviguer":
        handleNaviguer(message);
        break;
      case "!combattre":
        handleCombattre(message);
        break;
      case "!fuir":
        handleFuir(message);
        break;
      case "!rejoindre":
        handleRejoindre(message);
        break;
      case "!debarquer":
        handleDebarquer(message);
        break;
      case "!mangerfruit":
        handleMangerFruit(message);
        break;
      case "!statut":
        handleStatut(message);
        break;
      case "!ile":
        handleIle(message);
        break;
      case "!quete":
        handleQuete(message);
        break;
      case "!complete":
        handleComplete(message);
        break;
      case "!sail":
        handleSail(message);
        break;
      case "!bounty":
        handleBountyPlayer(message);
        break;
      case "!attaque":
        handleAttaque(message);
        break;
      case "!fight":
        handleFight(message);
        break;
      case "!fruit":
        handleFruit(message);
        break;
      case "!move":
        handleMove(message);
        break;
      case "!map":
        handleMap(message);
        break;
      case "!near":
        handleNear(message);
        break;
      case "!ship":
        handleShip(message);
        break;
      case "!inventaire":
        handleInventaire(message);
        break;
      case "!boss":
        handleBoss(message);
        break;
      case "!inventory":
        handleInventory(message);
        break;
      case "!haki":
        handleHaki(message);
        break;
      case "!help":
        message.channel
          .send(
            "🏴‍☠️ **OnepieceBot — Commandes**\n\n" +
              "**Aventure (prefix `!`)**\n" +
              "`!start` — Commence ton aventure One Piece\n" +
              "`!statut` — Voir ton profil de pirate\n" +
              "`!ile` — Infos sur ton île actuelle\n" +
              "`!quete` — Reçois une quête aléatoire sur ton île\n" +
              "`!complete` — Accomplis ta quête active et gagne ta récompense\n" +
              "`!sail` — Navigue vers la prochaine île\n" +
              "`!prendre` · `!refuser` · `!naviguer`\n" +
              "`!combattre` · `!fuir` · `!rejoindre`\n" +
              "`!debarquer` · `!mangerFruit`\n" +
              "`!ping` — Test de connexion\n\n" +
              "**Slash commands**\n" +
              "`/chat` — Parle avec un personnage One Piece (IA)\n" +
              "`/characters` — Liste tous les personnages\n" +
              "`/bounty` — Voir la prime d'un personnage\n" +
              "`/devilfruit` — Voir le fruit du démon d'un personnage\n" +
              "`/fact` — Fait aléatoire sur One Piece"
          )
          .catch((err) => logger.error({ err }, "help send error"));
        break;
    }
  });

  client.on(Events.Error, (err) => {
    logger.error({ err }, "Discord client error");
  });

  await client.login(token);
}
