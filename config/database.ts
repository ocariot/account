import mongoose from 'mongoose'
import config from './config'

mongoose.Promise = Promise

export function tryConnect() {
    mongoose.connect(config.DB_URI, { useCreateIndex: true, useNewUrlParser: true })
        .then(con => {
            console.log('MongoDB Connected1')
        })
        .catch((err) => {
            console.log('MongoDB try connect error', err)
            setTimeout(() => {
                tryConnect();
            }, 2000);
        });
}