import { Client, Intents } from "discord.js";
import { Player } from "discord-player";

export default class DiscordClient {
  private _client: Client;
  private _queue: any = null;
  private _player: any = null;
  private _message: any;

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

  public init() {
    this._client.login(process.env.DISCORD_TOKEN);

    this._client.on("ready", () => {
      console.log(`Logged in!`);
    });

    this._client.on("messageCreate", (message: any) => {
      if (message) {
        this._message = message;

        if (message.content.match(/!play/)) {
          const query = message.content.replace(/!play/g, "");
          this.play(query);
        }
      }
    });
  }

  public async play(query: string) {
    this._queue = this._player.createQueue(this._message.guild, {
      metadata: {
        channel: this._message.member.voice.channel,
      },
    });

    try {
      if (!this._queue.connection)
        await this._queue.connect(this._message.member.voice.channel);
    } catch {
      this._queue.destroy();
      return await this._message.reply({
        content: "Could not join your voice channel!",
      });
    }

    // await this._message.deferReply();
    const track = await this._player
      .search(query, {
        requestedBy: this._message.author,
      })
      .then((x: any) => x.tracks[0]);

    if (!track) {
      console.log(`❌ | Track **${query}** not found!`);
    }

    this._queue.play(track);

    return console.log(`⏱️ | Loading track **${track.title}**!`);
  }
}
