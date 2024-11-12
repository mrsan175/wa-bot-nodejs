import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandSendCoins extends Command {
    constructor() {
        super('send', 'Perintah untuk mengirim koin ke pengguna lain', ['send']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const senderPhone = extractPhoneNumber(msg);

        // Pastikan ada dua argumen: nomor telepon tujuan dan jumlah koin
        if (args.length < 2) {
            msg.reply('Harap masukkan nomor tujuan dan jumlah koin yang ingin dikirim.\nContoh: *!send <nomor_telepon> <jumlah_koin>*');
            return;
        }

        const targetPhone = args[0];
        const amount = parseInt(args[1], 10);

        // Validasi jumlah koin
        if (isNaN(amount) || amount <= 0) {
            msg.reply('Masukkan jumlah koin yang benar.');
            return;
        }

        const sender = await prisma.user.findUnique({ where: { phone: senderPhone } });
        if (!sender || sender.coins < amount) {
            msg.reply('Koin kamu tidak mencukupi untuk melakukan pengiriman.');
            return;
        }

        const recipient = await prisma.user.findUnique({ where: { phone: targetPhone } });
        if (!recipient) {
            msg.reply('Penerima dengan nomor tersebut tidak ditemukan.');
            return;
        }

        // Mengurangi koin pengirim dan menambah koin penerima
        await prisma.user.update({ where: { phone: senderPhone }, data: { coins: sender.coins - amount } });
        await prisma.user.update({ where: { phone: targetPhone }, data: { coins: recipient.coins + amount } });

        // Mencatat transaksi ke tabel TransactionHistory
        await prisma.transactionHistory.create({
            data: {
                senderId: sender.id,
                receiverId: recipient.id,
                amount,
            }
        });

        msg.reply(`Anda berhasil mengirim ${amount} koin ke ${recipient.name} (${targetPhone}).`);
    }
}
