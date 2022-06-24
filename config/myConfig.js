const config = {
    mqtt: {
        host: '82.223.46.192',
        port: '1883',
        user: 'labforward',
        password: 'labforward123',
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`
    }
}


module.exports = config;