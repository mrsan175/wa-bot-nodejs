import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";

const prisma = new PrismaClient();

const ALLOWED_PHONE = '6282191722654';

export class CommandVerify extends Command {
    constructor() {
        super('ver', 'Perintah untuk memverifikasi user', ['verifikasi']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg);
        const targetPhone = args[0];

        
        if (phoneNumber !== ALLOWED_PHONE) {
            msg.reply('Hanya nomor yang diizinkan yang bisa menggunakan perintah ini.');
            return;
        }

        
        const userToVerify = await prisma.user.findUnique({
            where: { phone: targetPhone },
        });

        if (!userToVerify) {
            msg.reply('User dengan nomor tersebut tidak ditemukan.');
            return;
        }

        
        await prisma.user.update({
            where: { phone: targetPhone },
            data: { isVerified: true },
        });

        msg.reply(`User dengan nomor ${targetPhone} telah berhasil diverifikasi.`);
    }
}
