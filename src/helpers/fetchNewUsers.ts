import type TelegramBot from "node-telegram-bot-api";
import { CHAT_IDS } from "../constants/ChatIds.ts";
import "dotenv/config";

const BASE_URL = process.env.BASE_URL;

interface User {
    address: string;
    bio: string;
    image: string;
    twitter_id: string;
    twitter_username: string;
    points: string;
    pointLastestWeek: string;
    tier: number;
    tierUpdatedAt: string | null;
    addedPointPrelaunch: boolean;
    createdAt: string;
    action: string;
    time: number;
    unique_hash: string;
}

const seenUsers = new Set<string>();

const START_TIME = Date.now();

const fetchNewUsers = async (bot: TelegramBot) => {
    console.log("User running");
    try {
        if (!BASE_URL) {
            console.log("BASE_URL is not defined");
            return;
        }

        const response = await fetch(`${BASE_URL}/user/explore?limit=49`);
        if (!response.ok) {
            console.log(`Failed to fetch users: ${response.statusText}`);
            return;
        }

        const { data } : { data: User[]} = await response.json();


        for (const user of data) {
            if (user.action !== "new-user") {
                continue;
            }

            if (new Date(user.createdAt).getTime() < START_TIME) {
                continue;
            }

            if (!seenUsers.has(user.unique_hash)) {
                seenUsers.add(user.unique_hash);

                console.log("User seen", user.twitter_username);

              
                if (CHAT_IDS.length > 0) {
                    const message = `
🆕 *New User Detected!*

👤 *Username:* [${user?.twitter_username}](https://x.com/${user?.twitter_username})
💰 *Points:* ${user?.points}
🆔 *Address:* \`${user.address}\`
🔗 [Basescan](https://basescan.org/address/${user.address})
📅 *Created At:* ${new Date(user.createdAt).toLocaleString()}
                    `.trim();

                    const sendPromises = CHAT_IDS.map(chatId => 
                        bot.sendMessage(chatId.trim(), message, { parse_mode: "Markdown" })
                            .catch(err => console.log(`Failed to send message to ${chatId}:`, err))
                    );

                    await Promise.all(sendPromises);

                    console.log("User sent");
                } else {
                    console.log("TELEGRAM_CHAT_ID is not defined, skipping notification.");
                }
            }
        }

    } catch (error) {
        console.log("Error fetching new users:", error);
    }
};

export default fetchNewUsers;