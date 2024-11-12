import { Message } from "whatsapp-web.js";

abstract class Command {

    prefixs: string[] = ["!"];
    name: string;
    desc: string;
    alias: string[];

    constructor(name: string, desc?: string, alias?: string[]) {
        this.name = name;
        this.desc = desc || "";
        this.alias = [name, ...(alias || [])];
        // this.alias = alias? [name, ...alias]: [name];
    }

    abstract execute(msg: Message, args: string[]): void;

    handle(msg: Message) {
        const prefix = msg.body[0];
        const argsAll: string[] = msg.body.slice(1).split(" ");
        if (this.prefixs.includes(prefix)) {
            const cmdNoPrefix = argsAll[0].toLocaleLowerCase();
            if (this.alias.includes(cmdNoPrefix)) {
                this.execute(msg, argsAll.slice(1));
            }
        }
    }
}

export default Command;