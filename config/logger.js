var winston = require('winston');
var fs = require('fs');
var df = require('dateformat');

var logConfig = require('./logConfig.json');
winston.setLevels( winston.config.npm.levels );
winston.addColors( winston.config.npm.colors );

if ( !fs.existsSync( logConfig.rootFilesDirectory + logConfig.logDirectory ) ) {
    fs.mkdirSync( logConfig.rootFilesDirectory + logConfig.logDirectory );
}

if ( !fs.existsSync( logConfig.rootFilesDirectory + logConfig.logDirectory) ) {
    fs.mkdirSync( logConfig.rootFilesDirectory + logConfig.logDirectory);
}
winston.setLevels( winston.config.npm.levels );
winston.addColors( winston.config.npm.colors );

module.exports.logger = new( winston.Logger )( {
 exitOnError: false, 
  transports: [
    new winston.transports.Console( {
      level: 'debug', 
      colorize: true,
      timestamp : function() {  return df(new Date(), "HH:MM:ss"); }
    }),
    new (require('winston-daily-rotate-file'))({
      level: 'debug',
      timestamp : function(){ return Date()},
      filename: logConfig.rootFilesDirectory + logConfig.logDirectory + '/.log',
      datePattern: 'dd-MM-yyyy',
      prepend: true,
      handleExceptions: true,
      json: true
   })
  ] 
});