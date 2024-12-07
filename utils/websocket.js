import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";
import { generateRandomId, generateRandomSystemData } from "./system.js";
import { delay } from "./file.js";
import { logger } from "./logger.js";

let totalDataUsage = 0;

function formatDataUsage(bytesCount) {
    if (bytesCount >= 1024 * 1024) {
        return `${(bytesCount / (1024 * 1024)).toFixed(2)}MB`;
    } else if(bytesCount >= 1024) {
        return `${(bytesCount / 1024).toFixed(2)}KB`;
    }
    return `${bytesCount}B`
}

function formatUptime(seconds) {
    const years = Math.floor(seconds / (365 * 24 * 60 * 60));
    const days = Math.floor((seconds % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    let formattedUptime = [];
    if (years > 0) formattedUptime.push(`${years} year${years > 1 ? 's' : ''}`);
    if (days > 0) formattedUptime.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) formattedUptime.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) formattedUptime.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return formattedUptime.join(', '); 
}

export async function createConnection(token, proxy = null) {
    const wsOptions = {};
    if (proxy) {
        logger(`Connect Using proxy: ${proxy}`);
        wsOptions.agent = new HttpsProxyAgent(proxy);
    }

    const socket = new WebSocket(`wss://ws.oasis.ai/?token=${token}`, wsOptions);

    socket.on("open", async () => {
        logger(`WebSocket connection established for providers: ${token}`, "", "success");
        const randomId = generateRandomId();
        const systemData = generateRandomSystemData();

        socket.send(JSON.stringify(systemData));
        await delay(2000);

        socket.send(
            JSON.stringify({
                id: randomId,
                type: "heartbeat",
                data: {
                    version: "0.1.7",
                    mostRecentModel: "unknown",
                    status: "active",
                },
            })
        );

        setInterval(() => {
            const randomId = generateRandomId();
            socket.send(
                JSON.stringify({
                    id: randomId,
                    type: "heartbeat",
                    data: {
                        version: "0.1.7",
                        mostRecentModel: "unknown",
                        status: "active",
                    },
                })
            );
        }, 60000);
    });

    socket.on("message", (data) => {
        const message = data.toString();
        totalDataUsage += message.length;
        const dataUsage = formatDataUsage(totalDataUsage)

        try {
            const parsedMessage = JSON.parse(message);
            
            if (parsedMessage.type === "serverMetrics") {
                const { totalEarnings, totalUptime, creditsEarned } = parsedMessage.data;
                const formattedUptime = formatUptime(totalUptime);

                logger(`Heartbeat sent for provider:`, token, "success");

                logger(`Uptime:${formattedUptime}| Credits earn: ${creditsEarned}| Bandwidth Used: ${dataUsage}`);
            } else if (parsedMessage.type === "acknowledged") {
                logger("System Updated:", message, "warn");
            } else if (parsedMessage.type === "error" && parsedMessage.data.code === "Invalid body") {
                const systemData = generateRandomSystemData();
                socket.send(JSON.stringify(systemData));
            }
        } catch (error) {
            logger("Error parsing message:", error,"error");
        }
    });

    socket.on("close", () => {
        logger("WebSocket connection closed", "","warn");
        setTimeout(() => {
            logger("Attempting to reconnect", "","warn");
            createConnection(token, proxy); 
        }, 5000);
    });

    socket.on("error", (error) => {
        logger("WebSocket error:", error, "error");
    });
}
