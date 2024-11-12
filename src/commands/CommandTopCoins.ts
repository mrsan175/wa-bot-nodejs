import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CommandTopCoins extends Command {
    constructor() {
        super('topcoins', 'Menampilkan 10 pemain dengan koin terbanyak', []);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        // Mengambil 10 pemain dengan koin terbanyak
        const topPlayers = await prisma.user.findMany({
            orderBy: {
                coins: 'desc',
            },
            take: 10,
        });

        if (topPlayers.length === 0) {
            msg.reply('⚠️ Tidak ada pemain dengan data koin.');
            return;
        }

        let topList = "🏆 Top 10 Pemain dengan Koin Terbanyak:\n";
        topPlayers.forEach((player, index) => {
            topList += `${index + 1}. ${player.name} - ${player.coins} koin\n`;
        });

        await msg.reply(topList);
    }
}
