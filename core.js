//
function conectar(){

	var mysql      = require('mysql');
	var conn = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'criptool_desa',
	  password : 'desArrollo90',
	  database : 'criptool_bittrex'
	});


	conn.connect(function(err) {
	    if (err) {
	        console.error('Error connecting: ' + err.stack);
	        return;
	    }

	    //console.log('Connected as id ' + conn.threadId);
	});

	return conn;
}

exports.conectar = conectar;


//Fibo
function fibo(maxH, minH){

	var f23  = parseFloat((maxH) + (0.236 * (minH - maxH)), 8, '.', '').toFixed(8);
	var f38  = parseFloat((maxH) + (0.382 * (minH - maxH)), 8, '.', '').toFixed(8);
	var f50  = parseFloat((maxH) + (0.500 * (minH - maxH)), 8, '.', '').toFixed(8);
	var f61  = parseFloat((maxH) + (0.618 * (minH - maxH)), 8, '.', '').toFixed(8);
	var f78  = parseFloat((maxH) + (0.786 * (minH - maxH)), 8, '.', '').toFixed(8);
	var f100 = parseFloat((maxH) + (1.000 * (minH - maxH)), 8, '.', '').toFixed(8);
	
	//return array(f23, f38, f50, f61, f78, f100);
	//return 10;

	var obj = {
    	f23: f23,
    	f38: f38,
    	f50: f50,
    	f61: f61,
    	f78: f78,
    	f100: f100
  	}

  	return obj;
}

exports.fibo = fibo;


//LOG
function write_log(text){

	var moment = require('moment');
	var date = moment.utc().format('YYYYMMDD');
	var date2 = moment.utc().format('YYYY-MM-DD H:mm:ss');
	//var date = moment().format('YYYYMMDD');


	const { transports, format, createLogger } = require('winston');

	const logger = createLogger({
	  level: 'info',
	  format: format.combine(
	    format.timestamp(),
	    format.colorize(),
	    format.printf(info => `[${date2}] ${info.message}\r\n`)
	  ),
	  transports: [
	    //
	    // - Write to all logs with level `info` and below to `combined.log`
	    // - Write all logs error (and below) to `error.log`.
	    //
	    //new transports.File({ filename: file+'.log', level: 'error' }),
	    new transports.File({ filename: './logs/log_' + date +'.log' })
	  ]
	});

	logger.info(text);
}

exports.write_log = write_log;


//TG
function sendMessageBot(text){

	process.env["NTBA_FIX_319"] = 1;

	const TelegramBot = require('node-telegram-bot-api');

	// replace the value below with the Telegram token you receive from @BotFather
	const token = '671259410:AAGbbGuD62r4FaKOLW2g1cDQb4wOxwDoae8';

	// Create a bot that uses 'polling' to fetch new updates
	const bot = new TelegramBot(token, {polling: false});

	//var chatId = 415713002;
	//bot.sendMessage(chatId, text);

	var chatId = {"jp": 415713002, "st": 481636964};

	//ENVIO AMBOS BOT'S
	for(var k in chatId){

  		bot.sendMessage(chatId[k], text);
	}
}

exports.sendMessageBot = sendMessageBot;


//MARKET ACTIVO
function build_json(callback){

	var conn = conectar();

	conn.query('SELECT `cont`, `MarketName`, `low`, `high`, `f23`, `f38`, `f50`, `status` FROM `botNode` WHERE `status` < 4', function (err, result) {
	    if (err)
	        throw err;

	    //const fs = require('fs');
	    const fs = require('graceful-fs');
	    fs.writeFile('./BD_Node.json', JSON.stringify(result));

	    callback('true');

	    conn.end();

	});

	//conn.end();
}

exports.build_json = build_json;


//MARKET NO ACTIVO
function build_json_Close(){

	var conn = conectar();

	conn.query('SELECT * FROM (SELECT `cont`, `MarketName`, `low`, `high`, `f23`, `f38`, `f50`, `status` FROM `botNode` WHERE `status` > 3 ORDER BY `date` DESC) AS `Alias` GROUP BY `MarketName`', function (err, result) {
	    if (err)
	        throw err;

	    //const fs = require('fs');
	    const fs = require('graceful-fs');
	    fs.writeFile('./BD_Node_Close.json', JSON.stringify(result));

	    //callback('true');

	    conn.end();

	});

	//conn.end();
}

exports.build_json_Close = build_json_Close;


/*
//UPDATE STATUS
function update_mysql(status, cont){

	const moment = require('moment');
	var date = moment.utc().format('YYYY-MM-DD H:mm:ss');


	var mysql      = require('mysql');
	var conn = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'criptool_desa',
	  password : 'desArrollo90',
	  database : 'criptool_bittrex'
	});


	//MYSQL UPDATE
	var conn = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'criptool_desa',
	  password : 'desArrollo90',
	  database : 'criptool_bittrex'
	});

	conn.connect(function(err) {
	    if (err) {
	        console.error('Error connecting: ' + err.stack);
	        return;
	    }

	    //console.log('Connected as id ' + conn.threadId);
	});

	conn.query('UPDATE `botNode` SET `status` = ?, `date_Update` = ? WHERE `cont` = ?', [status, date, cont], (err, result) => {
	    if (err)
	        throw err;

	    //console.log(`Changed ${result.changedRows} row(s)`);

	});

	conn.end();
}

exports.update_mysql = update_mysql;
*/


//REQUEST POST ALARM PHP
function requestAlertPHP(alarmCont, alarmMarket, alarmPrice, alarmchatId, price){

  var request = require('request');

	request({
		uri: "https://criptools.com/s/node/postNodeAlarm.php",
		method: "POST",
		form: {
		  alarmCont: alarmCont,
		  alarmMarket: alarmMarket,
		  alarmPrice: alarmPrice,
		  alarmchatId: alarmchatId,
		  price: price
		}
		}, function(error, response, body) {
			console.log(body);
		});
}

exports.requestAlertPHP = requestAlertPHP;


//REQUEST POST BOT PHP
function requestNodePHP(cont, nivel, status){

  var request = require('request');

	request({
		uri: "https://criptools.com/s/node/postNodeBot.php",
		method: "POST",
		form: {
		  cont: cont,
		  nivel: nivel,
		  status: status
		}
		}, function(error, response, body) {
			console.log(body);
		});
}

exports.requestNodePHP = requestNodePHP;


//REQUEST POST BOT PHP HIGHS
function requestNodePHP_Highs(cont, low, streamHigh){

  var request = require('request');

	request({
		uri: "https://criptools.com/s/node/postNodeBotHighs.php",
		method: "POST",
		form: {
		  cont: cont,
		  low: low,
		  streamHigh: streamHigh
		}
		}, function(error, response, body) {
			console.log(body);
		});
}

exports.requestNodePHP_Highs = requestNodePHP_Highs;


//BALANCES
function balances(callback){

	global.xx = '';


	const Binance = require('node-binance-api');

	const binance = new Binance().options({
	  APIKEY: 'gzMmsGMfeFwM86UWNPNfuoz5z8jRKH5dAJTyFhMbJ9BxcSZIGsWFmvMA0BBOmAKB',
	  APISECRET: 'LhjBmLtwS7zy1lpP1OMwFp38LnCg7dkfW2Y5eoU7Y3u46BrQWgT80CTrnRqg1oah',
	  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
	  test: true // If you want to use sandbox mode where orders are simulated
	});


	/* 
	const jp = new Binance().options({
	  APIKEY: 'Vp3U3pVaaQyYiTm3GC3wuWOtHji3pO7gFFZRcYlT9uOA8zXUYehhnqbqFEfoik9P',
	  APISECRET: 'm1HuOisA3QXxXYCHhPpjdOmPtd2fkxtSWr7nIt6OU8NTAaX3Vav9UrOOczGt4TmH',
	  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
	  test: true // If you want to use sandbox mode where orders are simulated
	});
	*/


	binance.balance((error, balancesx) => {
	  if ( error ) return console.error(error);
	  //console.log("balances()", balances);

	  //var MarketName = "BTC";
	  //console.log("BTC balance: ", balances[MarketName].available);

	  global.xx = balancesx.BTC.available;
	  
	});

	callback(global.xx);
}

exports.balances = balances;