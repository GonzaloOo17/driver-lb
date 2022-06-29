var mqtt = require('mqtt');
var cfg = require('./config/myConfig');
var connectUrl = "mqtt://".concat(cfg.mqtt.host, ":").concat(cfg.mqtt.port);
var clientId = cfg.mqtt.clientId;
var interval;
var allMeasures = [];
var isMeasuring = false;
var client = mqtt.connect(connectUrl, {
    clientId: clientId,
    clean: true,
    connectTimeout: 4000,
    username: cfg.mqtt.user,
    password: cfg.mqtt.password,
    reconnectPeriod: 1000
});
var topicAWeight = '/is1234/stat/actualweight';
var topic_get_average = '/is1234/get/averageweight';
var topic_send_average = '/is1234/stat/averageweight';
var topic_start_measure = '/is1234/start/measure';
var topic_stop_measure = '/is1234/stop/measure';
var topic_turnoff = '/is1234/turnoff';
var topic_turnon = '/is1234/turnon';
client.on('connect', function () {
    console.log('Connected!!');
    client.subscribe([topic_get_average], function () { return console.log("Subscribe to topic '".concat(topic_get_average, "'")); });
    client.subscribe([topic_start_measure], function () { return console.log("Subscribe to topic '".concat(topic_start_measure, "'")); });
    client.subscribe([topic_stop_measure], function () { return console.log("Subscribe to topic '".concat(topic_stop_measure, "'")); });
    client.subscribe([topic_turnoff], function () { return console.log("Subscribe to topic '".concat(topic_turnoff, "'")); });
    client.subscribe([topic_turnon], function () { return console.log("Subscribe to topic '".concat(topic_turnon, "'")); });
    startInterval();
});
client.on('message', function (topic, payload) {
    handleTopic(topic, payload);
});
var handleTopic = function (topic, payload) {
    var t = topic.substring(1);
    t = t.substring(t.indexOf('/'));
    switch (t) {
        case '/start/measure': {
            console.log('Starting measure:', payload.toString());
            isMeasuring = true;
            allMeasures = [];
            break;
        }
        case '/stop/measure': {
            console.log('Stopping measure, there are ', allMeasures.length, ' measures');
            isMeasuring = false;
            break;
        }
        case '/turnoff': {
            console.log('Turning off balance');
            isMeasuring = false;
            clearInterval(interval);
            break;
        }
        case '/turnon': {
            console.log('Turning on balance');
            startInterval();
            break;
        }
        case '/get/averageweight': {
            var avg = allMeasures.reduce(function (partialSum, a) { return partialSum + a; }, 0) / allMeasures.length;
            console.log('Requested average weight, it is: ', avg);
            client.publish(topic_send_average, avg.toString(), { qos: 0, retain: false }, function (error) { return error ? console.error(error) : null; });
            break;
        }
    }
};
var sendAWeight = function (client) {
    // REAL WEIGHT: 14.50 +- 0.1
    var aWeight = 14.49 + Math.random() * 2 / 10;
    client.publish(topicAWeight, aWeight.toString(), { qos: 0, retain: false }, function (error) { return error ? console.error(error) : null; });
    if (isMeasuring) {
        allMeasures.push(aWeight);
    }
};
var startInterval = function () {
    interval = setInterval(function () {
        sendAWeight(client);
    }, 5000);
};
