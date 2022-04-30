import {
  Client,
  Message,
  Intents,
  User,
  Guild,
  VoiceBasedChannel,
  TextBasedChannel,
} from "discord.js";
import { Player, Queue } from "discord-player";
import TwitchClient from "./twitchClient";

interface Info {
  user: User;
  voiceChannel: VoiceBasedChannel;
  textChannel: any;
  message: any;
}

interface IQueue extends Queue {
  metadata?: {
    channel: any;
  };
}

export default class DiscordClient {
  public instance: DiscordClient;
  private _client: Client;
  private _queue = {} as IQueue;
  private _player = {} as Player;

  public readonly _info: Info = {
    user: {} as User,
    message: null,
    voiceChannel: {
      guild: {} as Guild,
    } as VoiceBasedChannel,
    textChannel: {} as TextBasedChannel,
  };

  constructor() {
    this._client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
    });

    this.instance = this;
    this._player = new Player(this._client);
  }

  public async init() {
    this._client.login(process.env.DISCORD_TOKEN);

    await this.listenerOnReady();
    await this.listenerOnReceiveMessage();
  }

  private async listenerOnReady() {
    this._client.on("ready", async (client) => {
      const voiceChannel = (await client.channels.fetch(
        process.env.TWITCH_VOICE_CHANNEL_DEFAULT!
      )) as VoiceBasedChannel;

      const textChannel = await client.channels.fetch(
        process.env.TWITCH_TEXT_CHANNEL_DEFAULT ?? ""
      );

      this._info.voiceChannel = voiceChannel;
      this._info.textChannel = voiceChannel;

      console.log(`Logged in!`);
    });
  }

  private async listenerOnReceiveMessage() {
    this._client.on("messageCreate", async (message: Message) => {
      if (!message.member?.voice?.channel) return;

      this._info.voiceChannel = message.member.voice.channel;
      this._info.user = message.author;
      this._info.message = message;

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
    await this.createPlayerConnection();
    await this.startQueue(query);
  }

  public next() {
    this._queue.skip();
  }

  private async createPlayerConnection() {
    this._queue = this._player.createQueue(this._info?.voiceChannel?.guild, {
      metadata: {
        channel: this._info.voiceChannel,
      },
    });

    try {
      if (!this._queue.connection)
        await this._queue.connect(this._info.voiceChannel);
    } catch {
      this._queue.destroy();
      // return await this._message.reply({
      //   content: "Could not join your voice channel!",
      // });
    }
  }

  private async startQueue(query: string) {
    const twitchClient = TwitchClient.getInstance(this.instance);

    // await this._message.deferReply();
    const track = await this._player
      .search(query, {
        requestedBy: this._info.user ?? this._client.user,
      })
      .then((x) => x.tracks[0]);

    if (!track) {
      this._info.message.reply(`❌ | Track **${query}** not found!`);
    }

    this._queue.play(track);

    // this._player.on("trackStart", (queue, track) => {
    // twitchClient.sendMessage(`🎶 | Now playing **${track.title}**!`);
    // this._queue.metadata?.channel?.send(
    //   `🎶 | Now playing **${track.title}**!`
    // );
    // });

    // return this._info.message.reply(`⏱️ | Loading track **${track.title}**!`);
  }
}
