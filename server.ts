import http from 'http'
import App from './src/app'

const port = process.env.PORT || 3000

App.then((app) => {
    app.listen(port, () => console.log(`Server running on port ${port}`))
}).catch(err => {
    console.error(err.message)
    process.exit(1)
})