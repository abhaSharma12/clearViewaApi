var logger= require('./config/logger').logger;

try {
	var sendAgentSummaryData = require('./controllers/sendAgentSummaryData');
	var sendSkillGroupSummaryData = require('./controllers/sendSkillGroupSummaryData');
	var sendAgentSummaryData_6x = require('./controllers/sendAgentSummaryData_6x');
	var sendSkillGroupSummaryData_6x = require('./controllers/sendSkillGroupSummaryData_6x');

	var express = require('express');
	var app = express();
	var port = process.env.PORT || 9191;   
	var router = express.Router(); 

	router.post('/sendAgentSummaryData', function (req, res) {
		logger.info("Calling sendAgentSummaryData at " + new Date());
		sendAgentSummaryData.send(function(response) {
			logger.info("sendAgentSummaryData - sending response as : " + response);
			res.send(response);
		});
		
	});

	router.post('/sendSkillGroupSummaryData', function (req, res) {
		logger.info("Calling sendSkillGroupSummaryData at " + new Date());
		sendSkillGroupSummaryData.send(function(response) {
			logger.info("sendSkillGroupSummaryData - sending response as : " + response);
			res.send(response);
		});
	});

	router.post('/sendAgentSummaryData_6x', function (req, res) {
		logger.info("Calling sendAgentSummaryData_6x at " + new Date());
		sendAgentSummaryData_6x.send(function(response) {
			logger.info("sendAgentSummaryData_6x - sending response as : " + response);
			res.send(response);
		});
		
	});

	router.post('/sendSkillGroupSummaryData_6x', function (req, res) {
		logger.info("Calling sendSkillGroupSummaryData_6x at " + new Date());
		sendSkillGroupSummaryData_6x.send(function(response) {
			logger.info("sendSkillGroupSummaryData_6x - sending response as : " + response);
			res.send(response);
		});
	});

	app.use('/', router);
	app.listen(port);
	logger.info("monetDataAPI app listening at " + port);
} catch(ex) {
	logger.info(ex);
}