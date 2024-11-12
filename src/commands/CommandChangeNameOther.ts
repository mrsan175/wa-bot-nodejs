import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandChangeNameOther extends Command {
    constructor() {
        super('cn', 'Perintah untuk mengganti nama user lain', ['cn']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg); 

        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber },
        });

        
        if (!user || (!user.isVerified && phoneNumber !== '62821917226541')) {
            msg.reply('Hanya user yang terverifikasi atau nomor yang diizinkan yang dapat menggunakan perintah ini.');
            return;
        }
        
        if (args.length < 2) {
            msg.reply('Harap masukkan nomor telepon dan nama baru setelah perintah !cn,\nContoh: !cn 6281234567890 Alex');
            return;
        }

        const targetPhone = args[0]; 
        const newName = args.slice(1).join(' ').trim(); 

        
        if (!targetPhone || !newName) {
            msg.reply('Nomor telepon dan nama baru harus diisi dengan benar.');
            return;
        }

        
        const userToUpdate = await prisma.user.findUnique({
            where: { phone: targetPhone },
        });

        if (!userToUpdate) {
            msg.reply('User dengan nomor telepon tersebut tidak ditemukan.');
            return;
        }

        
        await prisma.user.update({
            where: { phone: targetPhone },
            data: { name: newName },
        });

        msg.reply(`Nama user dengan nomor telepon ${targetPhone} telah berhasil diubah menjadi ${newName}.`);
    }
}
