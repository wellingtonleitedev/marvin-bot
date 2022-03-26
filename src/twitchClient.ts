import "dotenv/config";
import { Client } from "tmi.js";
import DiscordClient from "./discordClient";

export default class TwitchClient {
  constructor(private _client: Client) {}

  public init() {
    this._client.connect().catch(console.error);

    this._client.on("connected", () => {
      this._client.say("gamecodeofc", "O bot ta ON");
    });

    this._client.on("message", (channel, user, message, self) => {
      if (self) return;

      if (message.match(/\+play/)) {
        const query = message.replace(/\+play/g, "");

        this._client.say(channel, `Okay ${user.username}`);
        const discordClient = new DiscordClient();
        discordClient.play(query);
      }
    });
  }
}
