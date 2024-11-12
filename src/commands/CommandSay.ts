import { Message } from "whatsapp-web.js";
import Command from "./";

export class CommandSay extends Command {
    constructor() {
        super('p', 'Ini adalah command Say', ['ping']);
    }
    execute(msg: Message, args: string[]): void {
        msg.reply('Pong!\nAda yang bisa saya bantu?🤖');
    }
}