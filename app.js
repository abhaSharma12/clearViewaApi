var logger= require('./config/logger').logger;

try {
	var sendAgentSummaryData = require('./controllers/sendAgentSummaryData');
	var sendSkillGroupSummaryData = require('./controllers/sendSkillGroupSummaryData');
	


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

	
	

	app.use('/', router);
	app.listen(port);
	logger.info("monetDataAPI app listening at " + port);
} catch(ex) {
	logger.info(ex);
}