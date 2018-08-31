var mysql = require('mysql');
var logger= require('../config/logger').logger;
var mysqlconnection = require('../config/mysqlconnection');
var monetConfig = require('../config/monetConfig');
var https = require('https');

var send = function(cb) {
  var resp = "";
  logger.info("sendAgentSummaryData - Job Start time: " + new Date());
  var connection = mysql.createConnection(mysqlconnection);
  connection.connect();

  connection.query("SELECT * FROM `Monet_Agent_Summary` WHERE `SentTime` IS NULL", function(err, data) {
    connection.end();
    if (err) {
      logger.error(err);
      resp = "failure";
      cb(resp, null);
    } else {
      // logger.debug(data);
      logger.info("sendAgentSummaryData - Total Data Length : " + data.length);
      var arrayLength = data.length;
      var tempArray = [];
      for (var index = 0; index < arrayLength; index += 100) {
          temp = data.slice(index, index+100);
          tempArray.push(temp);
      }
      sendHTTPRequest(tempArray, 0, function(res) {
        resp = "success";
        cb(resp, null);
      }, function(err) {
        resp = "failure";
        cb(resp, null);
      });
    } 
  });
}

function sendHTTPRequest(data, counter, callback) {
  if(data.length < counter + 1) {
    var object = {"status" : "completed"};
    logger.info(object);
    callback(object);
  } else {
    var headers = {
      "Content-Type" : "application/soap+xml; charset=utf-8"
    };

    var options = {
      host: monetConfig.host,
      port: null,
      path: '/datacollector/monetwebservice.asmx',
      method: 'POST',
      headers: headers,
      async: false
    };

    var xml = '<?xml version="1.0" encoding="utf-8"?>' + 
      '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
        '<soap12:Body>' + 
          '<SendAgentHistoryRecordsArray xmlns="http://tempuri.org/">' + 
            '<agentHistoryCollection>' ;
    var dataArray = data[counter];
    var idString = "";
    for(var i=0; i<dataArray.length; i++) {
      var object = '<AgentHistoryObj>' + 
        '<AgentID>' + dataArray[i].AgentId + '</AgentID>' +
        '<IntervalStart>' + dataArray[i].IntervalStart + '</IntervalStart>' +
        '<IntervalEnd>' + dataArray[i].IntervalEnd + '</IntervalEnd>' + 
        '<LoginTime>' + dataArray[i].LoginTime + '</LoginTime>' + 
        '<Calls>' + dataArray[i].Calls + '</Calls>' +
        '<CallTime>' + dataArray[i].CallTime + '</CallTime>' + 
        '<ACWTime>' + dataArray[i].ACW + '</ACWTime>' + 
        '<Hold>' + dataArray[i].Hold + '</Hold>' + 
        '<HoldTime>' + dataArray[i].HoldTime + '</HoldTime>' +
        '<MakeBusy>' + dataArray[i].MakeBusy + '</MakeBusy>' +
        '<MakeBusyTime>' + dataArray[i].MakeBusyTime + '</MakeBusyTime>' + 
        '<CallsReturnedToQueue>' + dataArray[i].CallsReturnedToQueue + '</CallsReturnedToQueue>' + 
      '</AgentHistoryObj>';
      xml += object;
      idString += dataArray[i].Id + ",";
    }

    xml += '</agentHistoryCollection>' +
            '<userName>' + monetConfig.username + '</userName>' +
            '<password>' + monetConfig.password + '</password>' +
          '</SendAgentHistoryRecordsArray>' +
        '</soap12:Body>' +
      '</soap12:Envelope>';

    logger.debug("xml sent : " + xml);
  
    var req = https.request(options, function(res) {
      res.setEncoding('utf8');
      var chunks = "";
      res.on('data', function(chunk) {
          chunks += chunk;
      });
      res.on("end", function () {
        logger.info(chunks);
        updateTable(idString, function(resp) {
          sendHTTPRequest(data, counter + 1, callback);
        }, function(err) {
          //retryonceagain
          logger.error(err);
          updateTable(idString, function(resp) {
            sendHTTPRequest(data, counter + 1, callback);
          }, function(err) {
            logger.error(err);
          });
        });
      });
    });

    req.on('error', function(e) {
      logger.error(e);
    });

    req.write(xml);
    req.end();
  }
}

function updateTable(idString, cb) {
  var connection2 = mysql.createConnection(mysqlconnection);
  connection2.connect();
  idString = idString.substring(0,idString.lastIndexOf(","));
  var query = "update Monet_Agent_Summary set SentTime = NOW() where SentTime IS NULL and Id in (" + idString + ")";
  logger.info(query);
  connection2.query(query, function(err, data) {
    connection2.end();
    if (err) {
      logger.error(err);
      cb(null, false);
    } else {
      logger.info("sendAgentSummaryData - Job End time: " + new Date());
      cb(true, null);
    }
  });
}

module.exports.send = send;