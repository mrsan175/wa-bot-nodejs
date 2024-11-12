import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient } from "@prisma/client";
import { extractPhoneNumber } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandTransactionHistory extends Command {
    constructor() {
        super('sendhistory', 'Perintah untuk melihat riwayat transaksi koin', ['sendhistory']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const userPhone = extractPhoneNumber(msg);

        // Dapatkan data pengguna berdasarkan nomor telepon
        const user = await prisma.user.findUnique({
            where: { phone: userPhone },
            select: { id: true },
        });

        if (!user) {
            msg.reply('User tidak ditemukan.');
            return;
        }

        // Ambil histori transaksi pengiriman dan penerimaan koin untuk pengguna ini
        const transactions = await prisma.transactionHistory.findMany({
            where: {
                OR: [
                    { senderId: user.id },
                    { receiverId: user.id }
                ]
            },
            select: {
                amount: true,
                timestamp: true,
                sender: { select: { name: true, phone: true } },
                receiver: { select: { name: true, phone: true } },
            },
            orderBy: { timestamp: 'desc' },
            take: 10 // Menampilkan 10 transaksi terbaru
        });

        if (transactions.length === 0) {
            msg.reply('Kamu belum memiliki riwayat transaksi.');
            return;
        }

        // Menyusun riwayat transaksi
        let historyMessage = 'Riwayat Transaksi Kamu:\n';
        transactions.forEach(tx => {
            const direction = tx.sender.phone === userPhone ? 'Mengirim' : 'Menerima';
            const counterparty = tx.sender.phone === userPhone ? tx.receiver : tx.sender;
            historyMessage += `${direction} ${tx.amount} koin kepada ${counterparty.name} (${counterparty.phone}) pada ${tx.timestamp.toLocaleString()}\n`;
        });

        msg.reply(historyMessage);
    }
}
