var express = require('express');
var router = express.Router();
const csv = require('csvtojson')
const apiBase = '/api/v1'

router.get(`${apiBase}/total-cases`, function(req, res, next) {
  const csvFilePath = '../data/totalCases.csv'
    csv()
  .fromFile(csvFilePath)
  .then((jsonObj)=>{
    res.send(jsonObj);
  })
});

router.get(`${apiBase}/by-race`, function(req, res, next) {
  const csvFilePath = '../data/byRace.csv'
  csv()
  .fromFile(csvFilePath)
  .then((jsonObj)=>{
    res.send(jsonObj);
  })
});

router.get(`${apiBase}/by-sex`, function(req, res, next) {
  const csvFilePath = '../data/bySex.csv'
  csv()
  .fromFile(csvFilePath)
  .then((jsonObj)=>{
    res.send(jsonObj);
  })
});

router.get(`${apiBase}/by-zip-code`, function(req, res, next) {
  const csvFilePath = '../data/byZipCode.csv'
  csv()
  .fromFile(csvFilePath)
  .then((jsonObj)=>{
    res.send(jsonObj);
  })
});

router.get(`${apiBase}/by-age-group`, function(req, res, next) {
  const csvFilePath = '../data/byAgeGroup.csv'
  csv()
  .fromFile(csvFilePath)
  .then((jsonObj)=>{
    res.send(jsonObj);
  })
});

module.exports = router;
