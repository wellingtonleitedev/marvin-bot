import "dotenv/config";

import DiscordClient from "./discordClient";
import TwitchClient from "./twitchClient";

const discordClient = new DiscordClient();
const twitchClient = TwitchClient.getInstance(discordClient);

discordClient.init();
twitchClient.init();
