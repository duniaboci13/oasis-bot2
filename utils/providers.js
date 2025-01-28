import { generateRandomId } from "./system.js";
import { readToken, saveProviders, saveToken } from "./file.js";
import { logger } from "./logger.js";
import axios from 'axios';
import fs from 'fs';

async function connectWithToken(token) {
    const url = 'https://api.oasis.ai/internal/auth/connect';
    const randomId = generateRandomId();
    const payload = {
        "name": randomId,
        "platform": "browser"
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
    };

    try {
        const response = await axios.post(url, payload, { headers });
        const logToken = response.data.token;
        logger('Creating Providers successful:', logToken);
        return logToken;
    } catch (error) {
        logger('Creating Providers error:', error.response ? error.response.status : error.response.statusText, 'error');
        return null;
    }
}

async function getAllProviders(token) {
    const url = 'https://api.oasis.ai/internal/provider/providers?limit=100';

    const headers = {
        'Authorization': token,
    }

    try {
        const response = await axios.get(url, { headers });
        const data = response.data;
        logger('Get All Providers successful');
        return data
    } catch (error) {
        logger('Get All Providers error:', error.response ? error.response.status : error.response.statusText, 'error');
        return null;
    }
}

async function deleteProviders(token, nodeId) {
    const url = `https://api.oasis.ai/internal/provider/?id=${nodeId}`;
    const headers = {
        'Authorization': token,
    }

    try {
        const response = await axios.delete(url, { headers });
        const data = response.data;

        return data
    } catch (error) {
        logger('Delete Providers error:', error.response ? error.response.status : error.response.statusText, 'error');
        return null;
    }
}

export async function createProviders(numID) {
    try {
        const tokens = await readToken('tokens.txt');
        const filePath = 'providers.txt';

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                logger(`Deleted existing providers file: ${filePath}`);
            } catch (error) {
                logger(`Error deleting existing providers file: ${filePath}`, error, 'error');
            }
        }

        for (const token of tokens) { 
            logger(`Checking all providers using token: ${token}`);
            const response = await getAllProviders(token);
            const nodeIds = response.results.map(item=> item.id);

            logger(`Found ${nodeIds.length} existing providers, trying to delete old providers...`);
            
            for (const nodeId of nodeIds) {
                await deleteProviders(token, nodeId);
                logger(`${nodeIds.length - nodeIds.indexOf(nodeId)}/${nodeIds.length} | Providers ${nodeId} was successfully deleted. `);
            };

            logger(`Creating new providers using token: ${token}`);
            
            for (let i = 0; i < numID; i++) {
                logger(`Creating Providers #${i + 1}....`);
                const logToken = await connectWithToken(token);
                if (logToken) {
                    saveProviders("providers.txt", logToken)
                } else {
                    logger('Failed to create provider', 'error', 'error');
                }
            };
            
        };
        return true;
    } catch (error) {
        logger("Error reading token or connecting:", error, 'error');
    };
};
