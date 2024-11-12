import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber, userUnregistratedMessage } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandMine extends Command {
    constructor() {
        super('mine', 'Perintah untuk memulai penambangan', ['mine']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg); // Mendapatkan nomor telepon pengguna
        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber },
        });

        // Jika pengguna belum terdaftar
        if (!user) {
            userUnregistratedMessage(msg);
            return;
        }

        // Cek apakah pengguna sedang menambang
        if (user.lastMinedAt && (new Date().getTime() - new Date(user.lastMinedAt).getTime()) < 3 * 60 * 1000) {
            // Hitung sisa waktu penambangan
            const timeElapsed = Math.floor((new Date().getTime() - new Date(user.lastMinedAt).getTime()) / 1000);
            const remainingTime = 180 - timeElapsed;
            const remainingMinutes = Math.floor(remainingTime / 60);
            const remainingSeconds = remainingTime % 60;

            const remainingTimeMessage = remainingMinutes > 0
                ? `${remainingMinutes} menit ${remainingSeconds} detik`
                : `${remainingSeconds} detik`;

            msg.reply(`⚒️ *Proses Penambangan Sedang Berjalan!*\n⏳ Sisa waktu: ${remainingTimeMessage}`);
            return;
        }

        // Tandai waktu mulai penambangan
        await prisma.user.update({
            where: { phone: phoneNumber },
            data: { lastMinedAt: new Date() },
        });

        msg.reply(`⚒️ *Penambangan Dimulai!*\nKamu akan mendapatkan koin setelah 3 menit.`);

        // Setelah 3 menit, tambahkan koin ke akun pengguna
        setTimeout(async () => {
            const coinMined = Math.floor(Math.random() * 5) + 1; // Koin acak antara 1 dan 5

            // Perbarui jumlah koin pengguna
            await prisma.user.update({
                where: { phone: phoneNumber },
                data: { coins: user.coins + coinMined },
            });

            // Simpan histori penambangan
            await prisma.miningHistory.create({
                data: {
                    userId: user.id,
                    coinMined: coinMined,
                },
            });

            // Kirim pemberitahuan ke pengguna
            msg.reply(`🏆 *Penambangan Selesai!*\n🎉 Kamu mendapatkan *${coinMined}* koin.`);
        }, 3 * 60 * 1000); // Waktu tunggu 3 menit
    }
}
