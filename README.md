# OASIS AI BETA CLI VERSION

![banner](image-1.png)
AI inference powered by distributed compute

# [Register Here](https://r.oasis.ai/fra1156)


# Features

## New Features
- **Enhanced and Clearer logging time** 

- **Total Bandwidth Used**

- **Clearer Total Uptime for Each Provider**

- **Support SOCKS Proxy Format**

## Features

- **Register/Login Accounts**

- **Auto Create Providers**

- **Auto Send Heartbeat**

- **Support Multy Accounts**

- **Support Proxy**

# Requirements

- **Node.js**: Ensure you have Node.js installed.
  Check if node.js is installed.
     ```bash
     node -v
     ```

- **NPM**: Ensure you have npm installed.
  Check if NPM (Node Package Manager) is installed.
     ```bash
     npm --v
     ```
     
# How to Use

1. Clone this repository:

   ```bash
   git clone https://github.com/federicoalie/oasis-bot.git
   cd oasis-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. put your email and pass to `accounts.txt` format `email|password` 1 account for 1 line

   ```bash
   nano accounts.txt
   ```

4. put your proxy to `proxy.txt` format `http://username:pass@ip:port` or `socks5://username:pass@ip:port`, if you want create multiple providers you need to put multiple proxy there 1 proxy for 1 provider.

   ```bash
   nano proxy.txt
   ```

5. Setup to create accounts/login and get Tokens:

   ```bash
   npm run setup
   ```

6. Run The Script:

   ```bash
   npm run start
   ```

7. Additional feature auto refferal
   ```bash
   npm run autoreff
   ```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).

# Source
https://github.com/Zlkcyber/oasis-bot
