import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import fetchNewUsers from "./helpers/fetchNewUsers.ts";
import fetchNewRooms from "./helpers/fetchNewRooms.ts";

dotenv.config();

const TG_BOT_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TG_BOT_TOKEN) {
    throw new Error("TELEGRAM_TOKEN is not defined");
}

const bot = new TelegramBot(TG_BOT_TOKEN);

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    console.log(chatId);
    bot.sendMessage(chatId, "Hello!");
});

console.log("Bot is running...");

setInterval(() => {
    fetchNewUsers(bot);
    fetchNewRooms(bot);
}, 10000);


