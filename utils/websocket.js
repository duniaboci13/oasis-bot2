import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from 'socks-proxy-agent';
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
    const wsOptions = {
        headers: {
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            connection: 'Upgrade',
            host: 'ws.oasis.ai',
            origin: 'chrome-extension://knhbjeinoabfecakfppapfgdhcpnekmm',
            pragma: 'no-cache',
            'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits',
            'sec-websocket-version': '13',
            upgrade: 'websocket',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        }
    };

    if (proxy) {
        logger(`Connect Using proxy: ${proxy}`);
        if (proxy.startsWith('socks://') || proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
            wsOptions.agent = new SocksProxyAgent(proxy);
        } else {
            wsOptions.agent = new HttpsProxyAgent(proxy);
        }
    }

    const socket = new WebSocket(`wss://ws.oasis.ai/?token=${token}&version=0.1.20&platform=extension`, wsOptions);

    socket.on("open", async () => {
        logger(`WebSocket connection established for providers: ${token}`, "", "success");
        const randomId = generateRandomId();
        const systemData = generateRandomSystemData();

        socket.send(JSON.stringify(systemData));

        socket.send(
            JSON.stringify({
                id: randomId,
                type: "heartbeat",
                data: {
                    inferenceState: true,
                    version: "0.1.20",
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
                        inferenceState: true,
                        version: "0.1.20",
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
                const { totalUptime, creditsEarned } = parsedMessage.data;
                const formattedUptime = formatUptime(totalUptime);

                logger(`Heartbeat sent for provider:`, token, "success");

                logger(`Total Uptime: ${formattedUptime} | Credits earn: ${creditsEarned} | Total Bandwidth Used: ${dataUsage}`);
            } else if (parsedMessage.type === "acknowledged") {
                logger("System Updated:", message, "info");
            } else if (parsedMessage.type === "error" && parsedMessage.data.code === "Invalid body") {
                const systemData = generateRandomSystemData();
                socket.send(JSON.stringify(systemData));
            }
        } catch (error) {
            logger("Error parsing message:", error,"error");
        }
    });

    socket.on("close", () => {
        logger("WebSocket connection closed for token:", token,"warn");
        setTimeout(() => {
            logger("Attempting to reconnect for token:", token,"warn");
            createConnection(token, proxy); 
        }, 5000);
    });

    socket.on("error", (error) => {
        logger("WebSocket error:", error, "error");
    });
}