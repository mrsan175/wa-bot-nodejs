import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber, userUnregistratedMessage } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandMe extends Command {
    constructor() {
        super('me', 'Perintah untuk melihat data kamu', ['me']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg); // Mendapatkan nomor telepon user yang mengirim perintah
        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber },
        });

        if (!user) {
            userUnregistratedMessage(msg);
            return;
        }

        // Mengambil data user
        const name = user.name || 'Tanpa Nama';
        const coins = user.coins || 0;
        const lastMinedAt = user.lastMinedAt 
            ? `🕰 Terakhir menambang pada: *${new Date(user.lastMinedAt).toLocaleString()}*`
            : '❗ Belum pernah menambang';

        // Menampilkan data user dalam format yang rapi
        const userData = 
            `✨ *Profil Kamu* ✨\n\n` +
            `📛 *Nama*: ${name}\n` +
            `📞 *Nomor Telepon*: ${phoneNumber}\n` +
            `💰 *Koin*: ${coins}\n` +
            `${lastMinedAt}\n\n` +
            `🔎 Ketik perintah lainnya untuk melanjutkan!`;

        msg.reply(userData);
    }
}
