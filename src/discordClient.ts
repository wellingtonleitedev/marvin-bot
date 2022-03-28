import {
  Client,
  Message,
  Intents,
  User,
  Guild,
  VoiceBasedChannel,
} from "discord.js";
import { Player, Queue } from "discord-player";

interface Info {
  user: User;
  channel: VoiceBasedChannel;
}

export default class DiscordClient {
  private _client: Client;
  private _queue = {} as Queue;
  private _player = {} as Player;
  public readonly _info: Info = {
    user: {} as User,
    channel: {
      guild: {} as Guild,
    } as VoiceBasedChannel,
  };

  constructor() {
    this._client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });

    this._player = new Player(this._client);
  }

  public async init() {
    this._client.login(process.env.DISCORD_TOKEN);

    await this.listenerOnReady();
    await this.listenerOnReceiveMessage();
  }

  private async listenerOnReady() {
    this._client.on("ready", async (client) => {
      const channel = (await client.channels.fetch(
        process.env.TWITCH_VOICE_CHANNEL_DEFAULT ?? ""
      )) as VoiceBasedChannel;

      this._info.channel = channel;
      console.log(`Logged in!`);
    });
  }

  private async listenerOnReceiveMessage() {
    this._client.on("messageCreate", async (message: Message) => {
      console.log({
        message,
      });

      if (!message.member?.voice?.channel) return;

      this._info.channel = message.member.voice.channel;
      this._info.user = message.author;

      const command = message.content.split(" ").at(0);
      const query = message.content.replace(/!play/g, "");

      switch (command) {
        case "!play":
          await this.play(query);
          break;
        case "!next":
          this.next();
          break;
        default:
          return;
      }
    });
  }

  public async play(query: string) {
    console.log({ query });
    await this.createPlayerConnection();
    await this.startQueue(query);
  }

  public next() {
    this._queue.skip();
  }

  private async createPlayerConnection() {
    this._queue = this._player.createQueue(this._info?.channel?.guild, {
      metadata: {
        channel: this._info.channel,
      },
    });

    try {
      if (!this._queue.connection)
        await this._queue.connect(this._info.channel);
    } catch {
      this._queue.destroy();
      // return await this._message.reply({
      //   content: "Could not join your voice channel!",
      // });
    }
  }

  private async startQueue(query: string) {
    // await this._message.deferReply();
    const track = await this._player
      .search(query, {
        requestedBy: this._info.user ?? this._client.user,
      })
      .then((x) => x.tracks[0]);

    if (!track) {
      console.log(`❌ | Track **${query}** not found!`);
    }

    this._queue.play(track);

    return console.log(`⏱️ | Loading track **${track.title}**!`);
  }
}
