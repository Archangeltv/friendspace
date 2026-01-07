import type TelegramBot from "node-telegram-bot-api";
import { CHAT_IDS } from "../constants/ChatIds.ts";
import "dotenv/config"

const BASE_URL = process.env.BASE_URL;

interface RoomData {
    room: {
        id: string;
        blockNumber: string;
        contract: string;
        createdAt: string;
        creator: string;
        creatorReward: string;
        currentSupply: string;
        sn: string;
        totalSupply: string | null;
        updatedAt: string;
        metadataId: string;
        volume: string;
        stakeAddress: string;
        sellPrice: string;
        buyPrice: string;
        midPrice: string;
        tier: string;
        featured: boolean;
        fundSize: string;
        pnl: string;
        pnlPercentage7d: string;
        pnlPercentage30d: string;
        pnlPercentageAllTime: string;
        fundPnlUpdatedAt: string;
        votingNotificationSent: boolean;
        bridgeProcessId: string | null;
        withdrawProcessId: string | null;
        roomType: string;
        walletAddress: string;
    };
    creator: {
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
    };
    metadata: {
        id: string;
        name: string;
        description: string;
        image: string;
        animationUrl: string | null;
        type: string;
        banner: string | null;
        externalUrl: string | null;
    };
    room_key: string | null;
    unique_holders: number;
}

const seenRooms = new Set<string>();

const START_TIME = Date.now();

const fetchNewRooms = async (bot: TelegramBot) => {
    try {
        if (!BASE_URL) {
            console.log("BASE_URL is not defined");
            return;
        }

        const response = await fetch(`${BASE_URL}/room/paginate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                featured: false,
                limit: 20,
                sortBy: "createdAt",
                sortDir: "desc",
                userAddress: "0x3dcCfcf598996cE895669D930D37C5725f4bd76d"
            })
        });
        if (!response.ok) {
            console.log(`Failed to fetch rooms: ${response.statusText}`);
            return;
        }

        const { data }: { data: RoomData[] } = await response.json();

        for (const item of data) {
            if (new Date(item.room.createdAt).getTime() < START_TIME) {
                continue;
            }

            if (!seenRooms.has(item.room.contract)) {
                seenRooms.add(item.room.contract);

                if (CHAT_IDS.length > 0) {
                    const message = `
� *New Room Created!*

🏷 *Name:* ${item.metadata.name}
� *Description:* ${item.metadata.description}
👤 *Creator:* [${item.creator.twitter_username}](https://x.com/${item.creator.twitter_username}) | [BaseScan](https://basescan.org/address/${item.creator.address})
💰 *Buy Price:* ${item.room.buyPrice}
🆔 *Contract:* [\`${item.room.contract}\`](https://basescan.org/address/${item.room.contract})
📅 *Created At:* ${new Date(item.room.createdAt).toLocaleString()}
                    `.trim();

                    const sendPromises = CHAT_IDS.map(chatId => 
                        bot.sendMessage(chatId.trim(), message, { parse_mode: "Markdown" })
                            .catch(err => console.log(`Failed to send message to ${chatId}:`, err))
                    );

                    await Promise.all(sendPromises);
                } else {
                    console.log("TELEGRAM_CHAT_ID is not defined, skipping notification.");
                }
            }
        }

    } catch (error) {
        console.log("Error fetching new rooms:", error);
    }
};

export default fetchNewRooms;