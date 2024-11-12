import { Message, MessageMedia } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";
import { userUnregistratedMessage } from "../utils/utility";
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';  // Impor sharp untuk konversi gambar

const prisma = new PrismaClient();

export class CommandSticker extends Command {
    constructor() {
        super('s', 'Perintah untuk mengubah gambar menjadi stiker', ['sticker']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg);
        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber },
        });

        if (!user) {
            userUnregistratedMessage(msg);
            return;
        }

        // Pastikan pengguna memiliki cukup koin untuk menggunakan perintah ini
        if (user.coins <= 0) {
            msg.reply('⚠️ *Kamu tidak memiliki cukup koin untuk menggunakan perintah ini.*');
            return;
        }

        // Mengurangi koin setelah perintah dijalankan
        await prisma.user.update({
            where: { phone: phoneNumber },
            data: {
                coins: user.coins - 1,  // Mengurangi 1 koin
            },
        });

        // Reaksi pertama: Menandakan bahwa proses sedang berlangsung
        await msg.react('⏳');

        if (!msg.hasMedia && !(await msg.getQuotedMessage())) {
            msg.reply('⚠️ *Harap kirimkan gambar atau tandai gambar yang ingin diubah menjadi stiker!*');
            return;
        }

        const quotedMessage = await msg.getQuotedMessage();
        let media;
        if (quotedMessage) {
            media = await quotedMessage.downloadMedia(); // Mengambil media dari pesan yang ditandai
        } else {
            media = await msg.downloadMedia(); // Mengambil media dari pesan yang dikirim langsung
        }

        if (!media) {
            msg.reply('⚠️ *Tidak dapat mengunduh media.*\nPastikan media tersebut adalah sebuah gambar.');
            await msg.react('❌')
            return;
        }

        // Pengecekan tipe media, pastikan itu adalah gambar atau stiker
        if (media.mimetype.startsWith('image/') || media.mimetype === 'image/webp') {
            try {
                // Jika media adalah stiker (webp), kita perlu mengonversinya ke PNG menggunakan sharp
                if (media.mimetype === 'image/webp') {
                    const buffer = Buffer.from(media.data, 'base64');
                    
                    // Menggunakan sharp untuk mengonversi dari webp ke png
                    const convertedBuffer = await sharp(buffer).png().toBuffer(); 
                    
                    // Memuat gambar yang sudah diubah
                    const image = await loadImage(convertedBuffer); 

                    // Membuat canvas dan mengubah gambar menjadi kotak sempurna
                    const size = Math.min(image.width, image.height);
                    const canvas = createCanvas(size, size);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, size, size);

                    // Mengonversi canvas ke buffer PNG
                    const pngBuffer = canvas.toBuffer('image/png');
                    const base64Image = pngBuffer.toString('base64');
                    const mediaToSend = new MessageMedia('image/png', base64Image);

                    await msg.reply(mediaToSend, undefined, { sendMediaAsSticker: true });
                    await msg.react('✅'); // Menambahkan tanda centang hijau sebagai reaksi selesai
                } else {
                    const image = await loadImage(`data:${media.mimetype};base64,${media.data}`); // Memuat gambar dari media
                    // Menggunakan Canvas untuk mengubah gambar menjadi kotak sempurna
                    const size = Math.min(image.width, image.height);
                    const canvas = createCanvas(size, size);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, size, size);

                    // Mengonversi canvas ke buffer gambar dan mengirimnya sebagai stiker
                    const buffer = canvas.toBuffer('image/png');
                    const base64Image = buffer.toString('base64');
                    const mediaToSend = new MessageMedia('image/png', base64Image);

                    await msg.reply(mediaToSend, undefined, { sendMediaAsSticker: true });
                    await msg.react('✅'); // Menambahkan tanda centang hijau sebagai reaksi selesai
                }
            } catch (error) {
                console.error('Terjadi kesalahan dalam membuat stiker:', error);
                await msg.react('❌');
                msg.reply('❌ *Terjadi kesalahan saat mengubah gambar menjadi stiker. Coba lagi nanti.*');
            }
        } else {
            msg.reply('⚠️ *Harap kirimkan gambar atau tandai gambar yang ingin diubah menjadi stiker!*');
            await msg.react('❌')
        }
    }
}
