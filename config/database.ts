import mongoose from 'mongoose'
import config from './config'

mongoose.Promise = Promise

function getDBUri(): string {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
        return process.env.MONGODB_URI_TEST || config.DB_URI_TEST
    }
    return process.env.MONGODB_URI || config.DB_URI
}

export function tryConnect() {
    mongoose.connect(getDBUri(), { useCreateIndex: true, useNewUrlParser: true })
        .then(con => {
            console.log('MongoDB successfully connected!')
        })
        .catch((err) => {
            console.log('MongoDB try connect error', err)
            setTimeout(() => {
                tryConnect();
            }, 2000);
        });
}

