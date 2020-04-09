const puppeteer = require('puppeteer');
const moment = require('moment');
const stringify = require('csv-stringify');
const fs = require('fs');
const https = require('https');

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


        // Alternative way of pulling data from new ArcGIS maps:

        const options = {
            hostname: 'services2.arcgis.com',
            path: '/xRI3cTw3hPVoEJP0/ArcGIS/rest/services/COVID_Data/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=FID%20ASC&resultOffset=0&resultRecordCount=50&cacheHint=true&quantizationParameters=%7B%22mode%22%3A%22edit%22%7D',
            method: 'GET'
        }

        let byZipCodeTable;
        let str;
        const callback = (response) => {
            response.on('data', (data) => {
                if (data) {
                    str += data;
                }
            });
            response.on('end', () => {
                byZipCodeTable = JSON.parse(str.replace('undefined', '')).features.map(f => {
                    return [
                        today.toISOString(),
                        f.attributes.zip,
                        f.attributes.frequency
                    ]
                });
                stringify(byZipCodeTable, (err, output) => {
                    return fs.appendFileSync("byZipCode.csv", output);
                });
            });
        }
        const req = https.request(options, callback).end();

        stringify(byRaceTable, (err, output) => {
            return fs.appendFileSync("byRace.csv", output);
        });
    }
    await browser.close();
})();
