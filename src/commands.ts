import Command from "./commands/";
import { CommandSay } from "./commands/CommandSay";
import { CommandRegister } from "./commands/CommandRegister";
import { CommandVerify } from "./commands/CommandVerify";
import { CommandChangeNameSelf } from "./commands/CommandChangeNameSelf";
import { CommandChangeNameOther} from "./commands/CommandChangeNameOther";
import { CommandMine} from "./commands/CommandMine";
import { CommandMiningStatus } from "./commands/CommandMiningStatus";
import { CommandMiningHistory } from "./commands/CommandMiningHistory";
import { CommandMe } from "./commands/CommandMe";
import { CommandSendCoins } from "./commands/CommandSendCoins";
import { CommandTotalCoins } from "./commands/CommandTotalCoins";
import { CommandTransactionHistory } from "./commands/CommandTransactionHistory";
import { CommandHelp } from "./commands/CommandHelp";
import { CommandSticker } from "./commands/CommandSticker";
import { CommandAdventure } from "./commands/CommandAdventure";
import { CommandTopCoins } from "./commands/CommandTopCoins";
import { CommandYtDownloader } from "./commands/CommandYtDownloader";

const commands: Command[] = [
    new CommandSay(),
    new CommandRegister(),
    new CommandVerify(),
    new CommandChangeNameSelf(),
    new CommandChangeNameOther(),
    new CommandMine(),
    new CommandMiningStatus(),
    new CommandMiningHistory(),
    new CommandMe(),
    new CommandSendCoins(),
    new CommandTotalCoins(),
    new CommandTransactionHistory(),
    new CommandHelp(),
    new CommandSticker(),
    new CommandAdventure(),
    new CommandTopCoins(),
    new CommandYtDownloader(),
];

export default commands;