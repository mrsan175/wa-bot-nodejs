import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CommandTotalCoins extends Command {
    constructor() {
        super('totalcoins', 'Perintah untuk melihat total koin yang beredar', ['totalcoins']);
    }
    async execute(msg: Message, args: string[]): Promise<void> {
        // Hitung total koin dari semua user
        const totalCoins = await prisma.user.aggregate({
            _sum: {
                coins: true,
            },
        });

        const total = totalCoins._sum.coins || 0; // Jika tidak ada koin, default ke 0
        msg.reply(`Total koin yang beredar saat ini adalah ${total} koin.`);
    }
}
