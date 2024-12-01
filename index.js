import puppeteer from 'puppeteer';
import axios from 'axios';
import * as schedule from 'node-schedule';

async function wordleData() {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('https://www.nytimes.com/games/wordle/index.html');
  const wordleData = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('nyt-wordle-state'));
  });
  await browser.close();
  return wordleData.solution;
}

async function postToWebhook() {
  let word = await wordleData();
  word = word.charAt(0).toUpperCase() + word.slice(1);
  let url =
    '';
  let data = {
    username: '',
    avatar_url: 'https://freewordle.org/images/wordle-game-icon-512.png',
    content: `**${word}**\n`,
    embeds: [],
    components: [],
  };
  axios.post(url, data);
}

// create a new rule for everyday at 00:00 (midnight) eastern time
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = 'America/New_York';

schedule.scheduleJob(rule, () => {
  postToWebhook();
});
