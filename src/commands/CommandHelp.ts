import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";

const prisma = new PrismaClient();
const ADMIN_PHONE = '6282191722654';

export class CommandHelp extends Command {
    constructor() {
        super('help', 'Menampilkan daftar perintah yang tersedia', ['help', 'commands']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg);
        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber }
        });

        // Memeriksa apakah user terverifikasi dan/atau admin
        const isAdmin = phoneNumber === ADMIN_PHONE;
        const isVerified = user?.isVerified || false;

        // Daftar perintah untuk masing-masing kategori
        const generalCommands = [
            { command: "!me", description: "Melihat data profil kamu" },
            { command: "!reg <nama>", description: "Mendaftarkan diri ke dalam sistem" },
            { command: "!mine", description: "Mulai menambang koin" },
            { command: "!mining", description: "Melihat status user yang sedang menambang" },
            { command: "!history", description: "Melihat histori penambangan koin" },
            { command: "!send <no_hp> <jumlah>", description: "Mengirim koin ke user lain" },
            { command: "!totalcoins", description: "Melihat total koin yang telah beredar" },
            { command: "!s", description: "Mengubah gambar menjadi stiker (menggunakan 1 koin)" },
            { command: "!cname <nama>", description: "Mengubah nama kamu sendiri" }
        ];

        const verifiedCommands = [
            { command: "!cname <nomor_hp> <nama>", description: "Mengubah nama user lain" }
        ];

        const adminCommands = [
            { command: "!ver <no_hp>", description: "Memverifikasi user" }
        ];

        // Format pesan daftar perintah
        let helpMessage = `📜 *Daftar Perintah yang Tersedia* 📜\n\n`;

        // Menambahkan perintah umum
        helpMessage += `👤 *User*\n`;
        generalCommands.forEach(cmd => {
            helpMessage += `   • *${cmd.command}*: ${cmd.description}\n`;
        });

        // Menambahkan perintah terverifikasi jika user terverifikasi
        if (isVerified) {
            helpMessage += `\n✅ *Verified User*\n`;
            verifiedCommands.forEach(cmd => {
                helpMessage += `   • *${cmd.command}*: ${cmd.description}\n`;
            });
        }

        // Menambahkan perintah admin jika user adalah admin
        if (isAdmin) {
            helpMessage += `\n👑 *Author*\n`;
            adminCommands.forEach(cmd => {
                helpMessage += `   • *${cmd.command}*: ${cmd.description}\n`;
            });
        }

        helpMessage += `\n\n📌 *Catatan:*\n`
        helpMessage += `• Sebelum menggunakan perintah, pastikan kamu sudah melakukan registrasi dengan perintah *!reg <nama>*.\n`;
        helpMessage += `• Sebagian perintah dapat mengurangi koin yang kamu miliki.\n`;

        helpMessage += `\n👑 *Author: _mrsan_*\n🌐 *Github*: https://github.com/mrsan175\n`;

        msg.reply(helpMessage);
    }
}
