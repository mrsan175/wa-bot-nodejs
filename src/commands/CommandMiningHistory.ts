import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";
import { userUnregistratedMessage } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandMiningHistory extends Command {
    constructor() {
        super('mininghistory', 'Perintah untuk melihat histori tambang semua user', ['mininghistory']);
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

        if (!user || !user.isVerified) {
            msg.reply('Hanya user terverifikasi yang dapat melihat histori tambang.');
            return;
        }

        
        const miningHistory = await prisma.miningHistory.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                minedAt: 'desc', 
            }
        });

        if (miningHistory.length === 0) {
            msg.reply('Tidak ada histori tambang yang tersedia.');
            return;
        }

        let historyList = 'Histori Tambang User:\n';
        miningHistory.forEach(history => {
            const minedAt = history.minedAt.toISOString().split('T')[0]; 
            historyList += `${history.user.name} (${history.user.phone}) - ${history.coinMined} koin ditambang pada ${minedAt}\n`;
        });

        msg.reply(historyList);
    }
}
