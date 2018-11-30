import http from 'http'
import App from './src/app'
import config from './config/config';
require('dotenv').load()

const port = process.env.PORT || config.PORT

const app = App.getExpress()
app.listen(port, () => console.log(`Server running on port ${port}`))

process.on('SIGINT', () => {
    process.exit()
})