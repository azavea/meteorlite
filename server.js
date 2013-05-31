var http = require("http"),
	https = require("https"),
	events = require("events");


// sets the GET options to pull in Dark Sky data
var optionsGET = {
	hostname: 'api.forecast.io',
	port: 443,
	path: '/forecast/7d13a62cc497c6c9d000e30a5e3a32be/39.958882,-75.158587',
	method: 'GET'
};

// sets the PUT options to send data to the bulb
// change /lights/# to set the bulb
// 1 = john
// 2 = mike
// 3 = brian
var optionsSET = {
	hostname: '192.168.96.227',
	port: 80,
	path: '/api/meteorlite/lights/3/state',
	method: 'PUT'
};

var currentTemp;

function set_bulb(temp) {

	// change the hue based on the temperature from get_weather()
	var hue;
	switch (true){
		case (temp >= 95):
			hue = 65000;
			break;
		case ((temp < 95) && (temp >= 90 )):
			hue = 60000;
			break;
		case ((temp < 90) && (temp >= 85 )):
			hue = 55000;
			break;
		default:
			hue = 30000;
			break;
	}

	// the JSON that gets sent to the bulb
	var setToJSON = '{"hue": ' + hue + ', "on": true}';
	var req = http.request(optionsSET, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('Sent to bulb: ' + chunk);
		});
	});
      
    req.on('error', function(e) {
  		console.log('Problem with PUT request: ' + e.message);
	});
    
    // write the string
    req.write(setToJSON);
	req.end();
}

function get_weather() {  
    var req = https.request(optionsGET, function(res) {
    	var result = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			result += chunk;
		});

		res.on('end', function () {
			var data = JSON.parse(result);
			currentTemp = data.currently.temperature;
			console.log('Current Temperature: ' + currentTemp);
			set_bulb(currentTemp);
		});
	});
      
    req.on('error', function(e) {
  		console.log('Problem with GET request: ' + e.message);
	});
      
	req.end();
}
// Update every 2 minutes
setInterval(get_weather, 120000);

// start the server
function start() {
	http.createServer().listen(8888);
	console.log("Server started");
}

exports.start = start;