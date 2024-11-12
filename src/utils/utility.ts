import { Message } from "whatsapp-web.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export function extractPhoneNumber(msg: Message): string {
    return msg.author ? msg.author.split('@')[0] : msg.from.split('@')[0];
}

export async function userUnregistratedMessage(msg: Message): Promise<void> {
    return msg.reply('Kamu belum terdaftar.\nGunakan perintah *!reg <nama>* untuk mendaftar.\nContoh: *!reg John*').then(() => {});
}

export async function gainExperience(playerId: string, experienceGained: number) {
    const player = await prisma.player.findUnique({ where: { id: Number(playerId) } });
    if (!player) return;

    let newExperience = player.experience + experienceGained;
    let newLevel = player.level;

    // Level up condition: experience threshold increases by 100 per level
    while (newExperience >= newLevel * 100) {
        newExperience -= newLevel * 100;
        newLevel++;
    }

    // Calculate rank based on level
    const rank = getRank(newLevel);

    // Calculate the new HP and Attack Power based on the level
    let newHP = player.maxHp + 10 * (newLevel - player.level);  // Increase HP by 10 per level
    let newAttackPower = player.attackPower + 5 * (newLevel - player.level);  // Increase Attack Power by 5 per level

    // Update player's level, experience, HP, Attack Power, and rank
    return prisma.player.update({
        where: { id: Number(playerId) },
        data: {
            level: newLevel,
            experience: newExperience,
            maxHp: newHP,
            attackPower: newAttackPower,
            rank,
        },
    });
}

// Rank determination based on level
export function getRank(level: number): string {
    if (level <= 25) return "Novice";
    if (level <= 50) return "Adventurer";
    if (level <= 75) return "Warrior";
    if (level <= 100) return "Hero";
    return "Legend";
}