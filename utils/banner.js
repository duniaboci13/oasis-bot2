import chalk from 'chalk';

const banner = `
===========================
====                   ====
==== OASIS NETWORK BOT ====
====                   ====
===========================
`

export function showBanner() {
    console.log(chalk.red(banner));
}