import "dotenv/config";
import { Client } from "tmi.js";
import DiscordClient from "./discordClient";

export default class TwitchClient {
  private _channel: string = "";

  constructor(private _client: Client, private discordClient: DiscordClient) {}

  public async init() {
    this._client.connect().catch(console.error);
    await this.listenerOnReceiveMessage();
  }

  private async listenerOnReceiveMessage() {
    this._client.on("message", async (channel, _, message, self) => {
      if (self) return;

      this._channel = channel;

      const command = message.split(" ").at(0);

      switch (command) {
        case "!play":
          const query = message.replace(/\!play/g, "");
          await this.discordClient.play(query);
          break;
        case "!next":
          this.discordClient.next();
          break;
        default:
          return;
      }
    });
  }

  public sendMessage(message: string) {
    this._client.say(this._channel, message);
  }
}
