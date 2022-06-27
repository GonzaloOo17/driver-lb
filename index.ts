const mqtt = require('mqtt');
const cfg = require('./config/myConfig');

const connectUrl = `mqtt://${cfg.mqtt.host}:${cfg.mqtt.port}`

const clientId = cfg.mqtt.clientId;

console.log(connectUrl)
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: cfg.mqtt.user,
  password: cfg.mqtt.password,
  reconnectPeriod: 1000,
});


const topicAWeight = '/is1234/stat/actualweight';
const topic_get_average = '/is1234/get/averageweight';

client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic_get_average], () => {
    console.log(`Subscribe to topic '${topic_get_average}'`)
  })

  setInterval(()=>{
    sendAWeight(client);
  }, 5000);
  
})

client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString())
})

const sendAWeight = (client) => {

  // REAL WEIGHT: 14.50 +- 0.1
  const aWeight = 14.49 + Math.random()*2/10;
  client.publish(topicAWeight, aWeight.toString(), { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })
}