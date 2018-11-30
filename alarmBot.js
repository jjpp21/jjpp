process.env["NTBA_FIX_319"] = 1;

//
const core = require('./core');
//

//
const mysql = require('mysql');
//

//
const cjson = require('cjson');
//

//
const moment = require('moment');
//

//
const Binance = require('node-binance-api');
const binance = new Binance().options({
	APIKEY: '<key>',
  	APISECRET: '<secret>',
	useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
	test: true // If you want to use sandbox mode where orders are simulated
});


binance.websockets.miniTicker(markets => {


	var localDBAlarm = cjson.load('/home/criptool/public_html/criptools.com/s/node/BD_Alarm.json');


	for (var i in markets){

		var valido = true;

		var market = markets[i]["s"];
		var price = markets[i]["c"];

		//UNICO MERCADI USDT QUE SE PERMITE
		if(market == "BTCUSDT"){ valido = false; }

		//VALIDACION DE MERCADOS || BTCUSDT
		if(valido){
			if(market.endsWith('BNB') || (market.endsWith('ETH')) || (market.endsWith('USDT'))) { continue; }
		}

		//if(market == "BTCUSDT"){ console.log(market);  process.exit(); }


		for(var k in localDBAlarm){

			var cumple = false;

			var alarmCont = localDBAlarm[k]["cont"];
			var alarmMarket = localDBAlarm[k]["MarketName"];
			var alarmPrice = localDBAlarm[k]["price"];
			var alarmchatId = localDBAlarm[k]["chatId"];
			var alarmOperador = localDBAlarm[k]["operador"];
			var alarmStatus = localDBAlarm[k]["status"];

			//console.log(alarmMarket + alarmOperador + alarmPrice);

			if(alarmStatus == 2) { continue; }

			if(alarmMarket == market){

			  if((alarmOperador == ">=") && (price >= alarmPrice)) { cumple = true; }
			  if((alarmOperador == "<=") && (price <= alarmPrice)) { cumple = true; }

			  if(cumple) {

			    //var resp = market + ': ' + price;
			    var resp = `\r\n ${market}: alarm: ${alarmPrice} price: ${price}`;

			    console.log(resp);
			    //core.sendMessageBot(resp);

			    //ENVIO A PHP
			    core.requestAlertPHP(alarmCont, alarmMarket, alarmPrice, alarmchatId, price);
			    //core.postNode(alarmCont);
			    //core.build_json_Alarm();

			  }

			}

		}

	}

});


/*
function postNode(alarmCont, alarmMarket, alarmPrice, alarmchatId, price){

  var request = require('request');

  request({
    //uri: "https://criptools.com/s/xcarga.php",
    uri: "https://criptools.com/s/postNode.php",
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
*/