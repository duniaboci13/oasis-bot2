import chalk from 'chalk';

export function logger(message, value = '', level = 'info') {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const levels = {
        info: chalk.greenBright,
        warn: chalk.yellowBright,
        error: chalk.redBright,
        success: chalk.blueBright,
        debug: chalk.magentaBright,
    };
    
    const log = levels[level] || chalk.whiteBright;
    console.log(log(`[${formattedDate}] | [${level.toUpperCase()}]: ${message}`, chalk.yellowBright(value)));
}
