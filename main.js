import { readToken, delay } from "./utils/file.js";
import { createConnection } from "./utils/websocket.js";
import chalk from 'chalk';

async function start() {

    const banner = `
        ===========================
        ====                   ====
        ==== OASIS NETWORK BOT ====
        ====                   ====
        ===========================
    `

    console.log(chalk.red(banner));
    
    const tokens = await readToken("providers.txt");
    const proxies = await readToken("proxy.txt");

    if (proxies.length < tokens.length) {
        logger("Not enough proxies for the number of Providers. Exiting...");
        return;
    }

    // Create connections with 1 proxy per token
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const proxy = proxies[i]; 

        await createConnection(token, proxy);
        await delay(5000);
    }
}

start();
