const Discord = require('discord.js');
const fs = require('fs');
const readline = require('readline');
const delay = require("delay");
const client = new Discord.Client({ intents: [1 << 0, 1 << 1, 1 << 12, 1 << 9, 1 << 5, 1 << 10, 1 << 13, 1 << 3] });

var random_username = require('random-username-generator');
const password_gen = require('generate-password');
const random = require('random-name');

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())


const prefix = "!";
const token = "*****" // Enter Your discord token, can be created/found on the Discord Developer portal
const catchall = "@iniascooks.com" // Enter your catchall

var ProxyArray = [];


client.on('ready', () => {
    console.info(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.content.startsWith(prefix + "create")) {
        const ReadProxiesFile = readline.createInterface({
            input: fs.createReadStream('./proxies.txt'),
            output: process.stdout,
            console: false
        });
        console.log("Check Point")

        ReadProxiesFile.on('line', async function (line) {
            let current_proxy = line.split(":");
            let proxy_ip = current_proxy[0];
            let proxy_port = current_proxy[1];
            let proxy_username = current_proxy[2];
            let proxy_password = current_proxy[3];

            const browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--proxy-server=' + proxy_ip + ':' + proxy_port, //'--proxy-server=161.123.171.78:3190',
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-notifications",
                    "--disable-sync",
                    "--window-size=1000,1000",
                ],
                defaultViewport: null,
            });

            const page = await browser.newPage();
            await page.authenticate({
                username: proxy_username,
                password: proxy_password
            });

            await page.setDefaultNavigationTimeout(120000);
            await delay(1500);

            await page.goto("https://www.discord.com/");

            let loginButton = await page.$x('//a[contains(text(), "Login")]');
            await loginButton[0].click();

            await page.waitForSelector('button[class="smallRegisterLink-1qEJhz linkButton-2ax8wP button-f2h6uQ lookLink-15mFoz lowSaturationUnderline-Z6CW6z colorLink-1Md3RZ sizeMin-DfpWCE grow-2sR_-F"]');
            await delay(1500)
            await page.click('button[class="smallRegisterLink-1qEJhz linkButton-2ax8wP button-f2h6uQ lookLink-15mFoz lowSaturationUnderline-Z6CW6z colorLink-1Md3RZ sizeMin-DfpWCE grow-2sR_-F"]');

            let random_first_last = random.first() + random.last();
            await page.waitForSelector('input[name="email"]');
            await page.type('input[name="email"]', random_first_last + catchall, { delay: 150 });

            await page.type('input[name="username"]', random_first_last, { delay: 150 });

            let random_password = password_gen.generate({
                length: 16,
                numbers: true,
                symbols: true,
                lowercase: true,
                uppercase: true,
                strict: true,
                excludeSimilarCharacters: true,
            });
            await page.type('input[name="password"]', random_password, { delay: 150 });

            let all_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let picked_month = all_months[Math.floor(Math.random() * all_months.length)];
            let random_day = Math.floor(Math.random() * 30) + 1;
            let random_day_string = random_day.toString();
            let random_year = Math.floor(Math.random() * (2002 - 1995) + 1995);
            let random_year_string = random_year.toString();

            await page.type('#react-select-2-input', picked_month, { delay: 200 });
            await page.type('#react-select-3-input', random_day_string, { delay: 200 });
            await page.type('#react-select-4-input', random_year_string, { delay: 200 });

            await delay(2000);
            await page.click('button[type="submit"]')

            await page.$('iframe[title="widget containing checkbox for hCaptcha security challenge"]', { timeout: 3000 })
                .then(async () => {
                    console.log("Found Checkbox");
                    await delay(1500);
                    await page.click('iframe[title="widget containing checkbox for hCaptcha security challenge"]');
                    await delay(4500);
                }).catch(er => {
                    console.log('Determining if hcaptcha is required to be solved')
                });




        })

    };

});

client.login(token)