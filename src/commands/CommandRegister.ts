import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandRegister extends Command {
    constructor() {
        super('reg', 'Perintah untuk mendaftar sebagai user baru', ['daftar']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg);
        const username = args.join(' ').trim();

        if (username.length === 0) {
            msg.reply('Harap masukkan username setelah perintah.\nGunakan perintah !reg <username> untuk registrasi\nContoh: *!reg Alex*');
            return;
        }

        try {

            const user = await prisma.user.findUnique({
                where: { phone: phoneNumber },
            });

            if (user) {
                msg.reply('Kamu sudah terdaftar!');
                return;
            }

            await prisma.user.create({
                data: {
                    phone: phoneNumber,
                    name: username,
                },
            });

            msg.reply(`Pendaftaran berhasil! Selamat datang, ${username}`);
        } catch (error) {
            console.error(error);
            msg.reply('Terjadi kesalahan saat mencoba mendaftar. Silakan coba lagi.');
        }
    }
}
