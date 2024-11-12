import { Message, MessageMedia } from "whatsapp-web.js"
import youtubedl from "youtube-dl-exec"; "youtube-dl-exec";
import Command from ".";
import path from "path";

export class CommandYtDownloader extends Command {
    constructor() {
        super('yt', 'Download video dari YouTube', ['yt']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        if (args.length === 0) {
            msg.reply('Harap masukkan URL video YouTube setelah perintah !yt,\nContoh: !yt https://www.youtube.com/watch?v=abcdefghijk');
            return;
        }

        msg.react('⏳');

        const url = args[0];
        await this.downloadVideo(url, msg);
    }

    async downloadVideo(url: string, msg: Message): Promise<void> {
        const videoInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            callHome: false,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        });

        const title = typeof videoInfo === 'string' ? 'unknown' : videoInfo.title;
        const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
        const filePath = path.join(__dirname, '..', '..', 'downloads', filename);

        const result = await youtubedl(url, {
            format: 'best',
            output: filePath,
        });

        if (result) {
            console.log(result);
        }
        msg.react('✅');
        msg.reply(`Video dengan judul *${title}* telah berhasil diunduh.`);
    }


}