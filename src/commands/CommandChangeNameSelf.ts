import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";
import { userUnregistratedMessage } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandChangeNameSelf extends Command {
    constructor() {
        super('cname', 'Perintah untuk mengganti nama kamu', ['ganti-nama']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg); 
        const newName = args.join(' ').trim();
        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber },
        });

        if (!user) {
            userUnregistratedMessage(msg);
            return;
        }

        
        if (newName.length === 0) {
            msg.reply('Harap masukkan nama baru setelah perintah !cname,\nContoh: !cname Axel');
            return;
        }

        

        
        await prisma.user.update({
            where: { phone: phoneNumber },
            data: { name: newName },
        });

        msg.reply(`Nama Kamu telah berhasil diubah menjadi ${newName}.`);
    }
}
