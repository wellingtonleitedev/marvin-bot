import "dotenv/config";

import tmi from "tmi.js";
import DiscordClient from "./discordClient";
import TwitchClient from "./twitchClient";

const discordClient = new DiscordClient();
const twitchClient = new TwitchClient(
  tmi.client({
    options: { debug: true },
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      username: process.env.TWITCH_USERNAME || "",
      password: process.env.TWITCH_PASSWORD || "",
    },
    channels: [process.env.TWITCH_CHANNEL || ""],
  })
);

discordClient.init();
twitchClient.init();
