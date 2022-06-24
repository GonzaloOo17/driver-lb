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


const topic = '/nodejs/mqtt';
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
})

client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString())
})