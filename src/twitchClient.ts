import "dotenv/config";
import tmi, { Client } from "tmi.js";
import DiscordClient from "./discordClient";

export default class TwitchClient {
  static instance: TwitchClient;
  private _channel: string = "";
  private discordClient = {} as DiscordClient | undefined;
  private _client: Client = tmi.client({
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
  });

  private constructor(discordClient?: DiscordClient) {
    this.discordClient = discordClient;
  }

  public static getInstance(discordClient?: DiscordClient) {
    if (!this.instance) {
      this.instance = new TwitchClient(discordClient);
    }

    return this.instance;
  }

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
          await this.discordClient?.play(query);
          break;
        case "!next":
          this.discordClient?.next();
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
