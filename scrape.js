const puppeteer = require('puppeteer');
const moment = require('moment');
const stringify = require('csv-stringify');
const fs = require('fs');

(async () => {
    const today = moment();
    const todayStr = today.startOf('day').format('MMMM D, YYYY')

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.washtenaw.org/3108/Cases');

    const [
        shouldUpdate,
        totalCasesTable,
        byAgeGroupTable,
        bySexTable,
        // Zip code table is gone as of 4/7
        // byZipCodeTable,
        byRaceTable] = await page.evaluate((today, todayStr) => {
        const updated = document.querySelector('.fr-view p').textContent.trim().includes(`${todayStr}`)

        return [
            updated,
            ...Array.from(document.querySelectorAll('.widgetBody table')).map((t) => {
            return Array.from(t.tBodies[0].rows).map(r => [today, ...Array.from(r.cells).map((c) => c.textContent.trim())])
        })];
    }, today, todayStr);

    if (shouldUpdate) {
        stringify(totalCasesTable, (err, output) => {
            return fs.appendFileSync("totalCases.csv", output);
        });

        stringify(byAgeGroupTable, (err, output) => {
            return fs.appendFileSync("byAgeGroup.csv", output);
        });

        stringify(bySexTable, (err, output) => {
            return fs.appendFileSync("bySex.csv", output);
        });
        // Zip code table is gone as of 4/7
        // stringify(byZipCodeTable, (err, output) => {
        //     return fs.appendFileSync("byZipCode.csv", output);
        // });

        stringify(byRaceTable, (err, output) => {
            return fs.appendFileSync("byRace.csv", output);
        });
    }
    await browser.close();
})();
