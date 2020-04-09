const puppeteer = require('puppeteer');
const moment = require('moment');
const stringify = require('csv-stringify');
const fs = require('fs');

(async () => {
    const today = moment();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.washtenaw.org/3108/Cases');

    const [totalCasesTable,
        byAgeGroupTable,
        bySexTable,
        byZipCodeTable,
        byRaceTable] = await page.evaluate((today) => {
        return Array.from(document.querySelectorAll('.widgetBody table')).map((t) => {
            return Array.from(t.tHead.rows).map(r => ['Date', ...Array.from(r.cells).map((c) => c.textContent.trim())]).concat(
                Array.from(t.tBodies[0].rows).map(r =>[today, ...Array.from(r.cells).map((c) => c.textContent.trim())])
            );
        });
    }, today);

    stringify(totalCasesTable, (err, output) => {
        return fs.writeFileSync("totalCases.csv", output);
    });

    stringify(byAgeGroupTable, (err, output) => {
        return fs.writeFileSync("byAgeGroup.csv", output);
    });

    stringify(bySexTable, (err, output) => {
        return fs.writeFileSync("bySex.csv", output);
    });

    stringify(byZipCodeTable, (err, output) => {
        return fs.writeFileSync("byZipCode.csv", output);
    });

    stringify(byRaceTable, (err, output) => {
        return fs.writeFileSync("byRace.csv", output);
    });
    await browser.close();
})();
