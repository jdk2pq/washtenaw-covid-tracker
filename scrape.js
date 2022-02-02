const puppeteer = require('puppeteer');
const moment = require('moment');
const stringify = require('csv-stringify');
const fs = require('fs');
const https = require('https');

(async () => {
    const today = moment();
    const todayStr = today.startOf('day').format('MMMM D, YYYY')
    const todayStrShort = today.startOf('day').format('MMM D, YYYY')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.washtenaw.org/3108/Cases');

    const [
        shouldUpdate,
        twoWeekSnapshotTable,
        totalCasesTable,
        byAgeGroupTable,
        bySexTable,
        byRaceTable,
        byZipCodeTable
    ] = await page.evaluate((today, todayStr, todayStrShort) => {
	const lastUpdatedDate = Array.from(document.querySelectorAll('.fr-view p')).find(p => p.textContent.toLowerCase().includes('updated:')).textContent.trim()
        const updated = lastUpdatedDate.includes(todayStr) || lastUpdatedDate.includes(todayStrShort)

        return [
            updated,
            ...Array.from(document.querySelectorAll('.widgetBody table')).map((t) => {
                return Array.from(t.tBodies[0].rows).map(r => [today, ...Array.from(r.cells).map((c) => c.textContent.trim())])
            })];
    }, today, todayStr, todayStrShort);

    if (shouldUpdate) {
        stringify(twoWeekSnapshotTable, (err, output) => {
            return fs.appendFileSync("data/twoWeekSnapshot.csv", output);
        });

        stringify(totalCasesTable, (err, output) => {
            return fs.appendFileSync("data/totalCases.csv", output);
        });

        stringify(byAgeGroupTable, (err, output) => {
            return fs.appendFileSync("data/byAgeGroup.csv", output);
        });

        stringify(bySexTable, (err, output) => {
            return fs.appendFileSync("data/bySex.csv", output);
        });

        stringify(byZipCodeTable, (err, output) => {
            return fs.appendFileSync("data/byZipCode.csv", output);
        });

        // Table was added back around 4/15
        // Alternative way of pulling data from new ArcGIS maps:
        //
        // const options = {
        //     hostname: 'services2.arcgis.com',
        //     path: '/xRI3cTw3hPVoEJP0/ArcGIS/rest/services/Join_COVID_Data_(View)_to_Washtenaw_County_Zip_Codes_(cut)/FeatureServer/0/query?f=json&where=1%3D1&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*&maxRecordCountFactor=2&outSR=102100&resultOffset=0&resultRecordCount=4000&cacheHint=true&quantizationParameters=%7B"mode"%3A"view"%2C"originPosition"%3A"upperLeft"%2C"tolerance"%3A1.0583354500042257%2C"extent"%3A%7B"xmin"%3A-9365768.2999%2C"ymin"%3A5171712.272600003%2C"xmax"%3A-9299563.3116%2C"ymax"%3A5226389.159199998%2C"spatialReference"%3A%7B"wkid"%3A102100%2C"latestWkid"%3A3857%7D%7D%7D',
        //     method: 'GET'
        // }
        //
        // let byZipCodeTable;
        // let str;
        // const callback = (response) => {
        //     response.on('data', (data) => {
        //         if (data) {
        //             str += data;
        //         }
        //     });
        //     response.on('end', () => {
        //         byZipCodeTable = JSON.parse(str.replace('undefined', '')).features.map(f => {
        //             return [
        //                 today.toISOString(),
        //                 f.attributes.zip,
        //                 f.attributes.frequency
        //             ]
        //         });
        //         stringify(byZipCodeTable, (err, output) => {
        //             return fs.appendFileSync("data/byZipCode.csv", output);
        //         });
        //     });
        // }
        // const req = https.request(options, callback).end();

        stringify(byRaceTable, (err, output) => {
            return fs.appendFileSync("data/byRace.csv", output);
        });
    }
    await browser.close();
})();
