import { Message } from "whatsapp-web.js";
import Command from "./";
import { PrismaClient, Player } from "@prisma/client";
import { extractPhoneNumber, gainExperience } from "../utils/utility";

const prisma = new PrismaClient();

export class CommandAdventure extends Command {
    constructor() {
        super('a', 'Memulai game petualangan', ['fight', 'shop', 'inventory', 'profile']);
    }

    async execute(msg: Message, args: string[]): Promise<void> {
        const phoneNumber = extractPhoneNumber(msg);
        const user = await prisma.user.findUnique({
            where: { phone: phoneNumber },
            include: { player: { include: { inventory: { include: { item: true } } } } },
        });

        if (!user) {
            msg.reply('⚠️ Anda harus terdaftar untuk bermain game ini.');
            return;
        }

        if (!user.player) {
            await prisma.player.create({
                data: {
                    userId: user.id,
                    hp: 100,
                    attackPower: 10,
                    level: 1,
                    experience: 0
                }
            });
            msg.reply('🧙‍♂️ Petualangan dimulai! Karakter Anda telah dibuat.');
        } else {
            const command = args[0]?.toLowerCase();
            switch (command) {
                case 'f':
                    await this.fight(msg, user.player);
                    break;
                case 's':
                    await this.showShop(msg);
                    break;
                case 'b':
                    const itemId = parseInt(args[1], 10);
                    await this.buyItem(msg, user.player, itemId);
                    break;
                case 'u':
                    await this.usePotion(msg, user.player); // Menggunakan potion
                    break;
                case 'inven':
                    await this.showInventory(msg, user.player);
                    break;
                case 'me':
                    await this.showProfile(msg, user.player);
                    break;
                default:
                    msg.reply('⚔️ Perintah tidak dikenal! Gunakan *fight*, *shop*, *buy <itemId>*, *inventory*, atau *profile* untuk memulai petualangan Anda.');
            }
        }
    }

    async fight(msg: Message, player: Player) {
        // Menyesuaikan HP dan Attack Power monster berdasarkan level pemain
        let monsterHP = Math.floor(Math.random() * (40 + player.level * 3)) + 40; // HP monster meningkat dengan level pemain
        const monsterAttack = Math.floor(Math.random() * (15 + player.level * 3)) + 10; // Serangan monster meningkat dengan level pemain

        let playerHP = player.hp;
        let battleLog = `👹 You encountered a monster with ${monsterHP} HP and ${monsterAttack} attack!\n\n`;

        while (playerHP > 0 && monsterHP > 0) {
            const damageToMonster = Math.floor(Math.random() * player.attackPower) + 1;
            const damageToPlayer = Math.floor(Math.random() * monsterAttack) + 1;

            battleLog += `⚔️ You attacked the monster for ${damageToMonster} damage.\n`;
            battleLog += `👹 Monster attacked you for ${damageToPlayer} damage.\n`;

            monsterHP -= damageToMonster;
            playerHP -= damageToPlayer;
        }

        if (playerHP <= 0) {
            battleLog += `\n💀 You lost the fight and lost 10 coins!`;
            await prisma.user.update({
                where: { id: player.userId },
                data: { coins: { decrement: 10 } },
            });

            await prisma.player.update({
                where: { id: player.id },
                data: { hp: 0 }, // Pemain kalah, HP menjadi 0
            });
        } else {
            // Random experience dan coin yang didapat berdasarkan level
            const baseExp = Math.floor(Math.random() * 100) + 50;  // Random base XP antara 5 dan 15
            const coinGained = Math.floor(Math.random() * 50) + 20;  // Random coin antara 1 dan 10
            let expGained = baseExp;

            // Sesuaikan XP dan coin dengan level player
            const expMultiplier = 1 + (0.1 * player.level);  // XP meningkat 10% per level
            const coinMultiplier = 1 + (0.05 * player.level);  // Coin meningkat 5% per level
            expGained = Math.floor(expGained * expMultiplier);  // Mengalikan pengalaman dengan multiplier
            const finalCoinGained = Math.floor(coinGained * coinMultiplier);  // Mengalikan coin dengan multiplier

            battleLog += `\n🎉 You won! Gained ${finalCoinGained} coins and ${expGained} experience points.`;

            // Update pengalaman player dan cek apakah level up
            const updatedPlayer = await gainExperience(player.id.toString(), expGained);

            await prisma.user.update({
                where: { id: player.userId },
                data: {
                    coins: { increment: finalCoinGained }
                }
            });

            await prisma.player.update({
                where: { id: player.id },
                data: { hp: playerHP },
            });

            if (updatedPlayer) {
                battleLog += `\n\n🔹 HP: ${playerHP}/${player.maxHp}\n🔹 Level: ${updatedPlayer.level}\n🔹 EXP: ${updatedPlayer.experience}/${updatedPlayer.level * 100}\n🔹 Rank: ${updatedPlayer.rank}`;
            }
        }

        await msg.reply(battleLog);
    }



    async showShop(msg: Message) {
        const items = await prisma.shop.findMany();
        let shopList = "🛒 Daftar Item di Toko:\n";
        items.forEach(item => {
            shopList += `ID: ${item.id} - ${item.name} (Harga: ${item.price} koin, Stok: ${item.stock})\n`;
        });
        await msg.reply(shopList);
    }

    async buyItem(msg: Message, player: Player, itemId: number) {
        if (!itemId) {
            msg.reply('⚠️ ID item tidak valid!');
            return;
        }
        const item = await prisma.shop.findUnique({ where: { id: itemId } });
        if (!item) {
            msg.reply('⚠️ Item tidak ditemukan!');
            return;
        }
        if (item.stock <= 0) {
            msg.reply('⚠️ Stok item habis!');
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: player.userId } });
        if (!user) {
            msg.reply('⚠️ User tidak ditemukan!');
            return;
        }
        if (user.coins < item.price) {
            msg.reply('⚠️ Koin Anda tidak cukup untuk membeli item ini!');
            return;
        }

        await prisma.user.update({
            where: { id: player.userId },
            data: { coins: { decrement: item.price } }
        });
        await prisma.inventory.create({
            data: {
                playerId: player.id,
                itemId: item.id,
                quantity: 1
            }
        });
        await prisma.shop.update({
            where: { id: item.id },
            data: { stock: { decrement: 1 } }
        });

        msg.reply(`✅ Anda berhasil membeli ${item.name}.`);
    }

    async showInventory(msg: Message, player: Player) {
        const inventoryItems = await prisma.inventory.findMany({
            where: { playerId: player.id },
            include: { item: true }
        });

        if (inventoryItems.length === 0) {
            msg.reply('🎒 Inventori kosong.');
            return;
        }

        let inventoryList = "🎒 Inventori Anda:\n";
        inventoryItems.forEach(invItem => {
            inventoryList += `${invItem.item.name} - Jumlah: ${invItem.quantity}\n`;
        });

        msg.reply(inventoryList);
    }

    async showProfile(msg: Message, player: Player) {
        msg.reply(`👤 Your Profile:\n` +
            `HP: ${player.hp}/${player.maxHp}\n` +
            `Level: ${player.level}\n` +
            `EXP: ${player.experience}/${player.level * 100}\n` +
            `Attack Power: ${player.attackPower}\n` +
            `Rank: ${player.rank}`);
    }

    // Fungsi untuk membeli Potion
    async buyPotion(msg: Message, player: Player) {
        const potion = await prisma.shop.findUnique({
            where: { id: 1 }, // Assuming the Potion has an id of 1
        });

        if (!potion) {
            msg.reply('⚠️ Potion tidak tersedia di toko.');
            return;
        }

        if (potion.stock <= 0) {
            msg.reply('⚠️ Stok potion habis!');
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: player.userId },
        });

        if (!user) {
            msg.reply('⚠️ User tidak ditemukan!');
            return;
        }

        if (user.coins < potion.price) {
            msg.reply('⚠️ Koin Anda tidak cukup untuk membeli potion!');
            return;
        }

        // Pembelian potion berhasil
        await prisma.user.update({
            where: { id: player.userId },
            data: { coins: { decrement: potion.price } },
        });

        // Menambahkan potion ke inventory pemain
        const inventoryItem = await prisma.inventory.findFirst({
            where: {
                playerId: player.id,
                itemId: potion.id,
            },
        });

        if (inventoryItem) {
            // Jika pemain sudah memiliki potion, tambahkan jumlahnya
            await prisma.inventory.update({
                where: { id: inventoryItem.id },
                data: { quantity: { increment: 1 } },
            });
        } else {
            // Jika pemain belum memiliki potion, buat entri baru di inventory
            await prisma.inventory.create({
                data: {
                    playerId: player.id,
                    itemId: potion.id,
                    quantity: 1,
                },
            });
        }

        // Mengurangi stok potion di toko
        await prisma.shop.update({
            where: { id: potion.id },
            data: { stock: { decrement: 1 } },
        });

        msg.reply(`✅ Anda berhasil membeli Potion!`);
    }

    // Fungsi untuk menggunakan Potion
    async usePotion(msg: Message, player: Player) {
        const playerPotion = await prisma.inventory.findFirst({
            where: {
                playerId: player.id
            },
            include: {
                player: true
            }
        })
        const inventoryItem = await prisma.inventory.findFirst({
            where: {
                playerId: player.id,
                item: { name: "Potion" },
            },
            include: { item: true },
        });

        if (!inventoryItem) {
            msg.reply('⚠️ Anda tidak memiliki Potion!');
            return;
        }

        const maxHp = player.maxHp; // Menggunakan maxHp yang baru
        // const newHp = Math.min(player.hp + 50, maxHp);  // HP tidak melebihi maxHp
        await prisma.player.update({
            where: { id: player.id },
            data: { hp: maxHp },  // Update HP sesuai penambahan
        });

        // Mengurangi jumlah potion yang dimiliki pemain
        await prisma.inventory.update({
            where: { id: inventoryItem.id },
            data: { quantity: { decrement: 1 } },
        });

        msg.reply(`✅ Anda telah menggunakan Potion. HP Anda sekarang ${maxHp}.`);
    }
}
