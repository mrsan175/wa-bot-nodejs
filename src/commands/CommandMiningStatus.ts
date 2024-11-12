import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";
import { userUnregistratedMessage } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandMiningStatus extends Command {
    constructor() {
        super('mining', 'Perintah untuk melihat siapa saja yang sedang menambang beserta sisa waktu mereka', ['mining']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const currentTime = new Date();
        const phoneNumber = extractPhoneNumber(msg);

        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber },
        });

        if(!user) {
            userUnregistratedMessage(msg);
            return;
        }

        // Ambil semua user yang sedang menambang (belum 3 menit sejak terakhir menambang)
        const miners = await prisma.user.findMany({
            where: {
                lastMinedAt: {
                    gte: new Date(currentTime.getTime() - 3 * 60 * 1000), // Menambang dalam 3 menit terakhir
                }
            },
            select: {
                phone: true,
                name: true,
                lastMinedAt: true,
            }
        });

        if (miners.length === 0) {
            msg.reply('⚡ *Tidak ada user yang sedang menambang saat ini.*\nCobalah perintah *!mine* untuk memulai penambangan.');
            return;
        }

        let miningList = '💎 *User yang sedang menambang:* \n\n';
        miners.forEach(miner => {
            if (miner.lastMinedAt) {
                const timeDifference = Math.floor((currentTime.getTime() - new Date(miner.lastMinedAt).getTime()) / 1000); // Dalam detik
                const remainingTime = 180 - timeDifference; // 180 detik (3 menit) - selisih waktu

                const remainingMinutes = Math.floor(remainingTime / 60); // Menampilkan dalam menit
                const remainingSeconds = remainingTime % 60; // Menampilkan sisa detik

                // Menambahkan informasi user yang sedang menambang
                let timeLeftText = '';
                if (remainingMinutes > 0) {
                    timeLeftText = `${remainingMinutes} menit ${remainingSeconds} detik`;
                } else {
                    timeLeftText = `${remainingSeconds} detik`;
                }

                miningList += `🔹 *${miner.name}* (${miner.phone})\n⏳ *Sisa waktu*: ${timeLeftText} lagi\n\n`;
            }
        });

        msg.reply(miningList);
    }
}
