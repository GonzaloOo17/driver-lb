const mqtt = require('mqtt');
const cfg = require('./config/myConfig');

const connectUrl: string = `mqtt://${cfg.mqtt.host}:${cfg.mqtt.port}`

const clientId: string = cfg.mqtt.clientId;
let interval: any;

let allMeasures : any[] = [];
let isMeasuring : boolean = false;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: cfg.mqtt.user,
  password: cfg.mqtt.password,
  reconnectPeriod: 1000,
});


const topicAWeight: string = '/is1234/stat/actualweight';
const topic_get_average: string = '/is1234/get/averageweight';
const topic_send_average: string = '/is1234/stat/averageweight';
const topic_start_measure: string = '/is1234/start/measure';
const topic_stop_measure: string = '/is1234/stop/measure';
const topic_turnoff: string = '/is1234/turnoff';
const topic_turnon: string = '/is1234/turnon';

client.on('connect', () => {
  console.log('Connected!!');

  client.subscribe([topic_get_average], () => console.log(`Subscribe to topic '${topic_get_average}'`))
  client.subscribe([topic_start_measure], () => console.log(`Subscribe to topic '${topic_start_measure}'`))
  client.subscribe([topic_stop_measure], () => console.log(`Subscribe to topic '${topic_stop_measure}'`))
  client.subscribe([topic_turnoff], () => console.log(`Subscribe to topic '${topic_turnoff}'`))
  client.subscribe([topic_turnon], () => console.log(`Subscribe to topic '${topic_turnon}'`))

  startInterval();
})

client.on('message', (topic, payload) => {
  handleTopic(topic, payload);
})

const handleTopic = (topic, payload) => {

  let t = topic.substring(1);
  t = t.substring(t.indexOf('/'));

  switch (t){
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
      const avg = allMeasures.reduce((partialSum, a) => partialSum + a, 0)/allMeasures.length;
      console.log('Requested average weight, it is: ', avg);
      client.publish(topic_send_average, avg.toString(), { qos: 0, retain: false }, (error) => error ? console.error(error) : null);
      break;
    }
  }

}

const sendAWeight = (client) => {
  // REAL WEIGHT: 14.50 +- 0.1
  const aWeight = 14.49 + Math.random()*2/10;
  client.publish(topicAWeight, aWeight.toString(), { qos: 0, retain: false }, (error) => error ? console.error(error) : null);
  if(isMeasuring){
    allMeasures.push(aWeight);
  }
}

const startInterval = () => {
  interval = setInterval(()=>{
    sendAWeight(client);
  }, 5000);
}