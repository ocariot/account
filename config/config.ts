/**
 * Class that defines application configuration variables.
 * 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
class Configs {
    /**
     * Provide configuration variables here.
     * Example: key: string = 'kEY_VALUE'
     */
    APP_TITLE = 'Account Service'
    APP_DESCRIPTION = 'Microservice for user management.'
    DB_URI: string = 'mongodb://mongo:27017/account'
    DB_URI_TEST: string = 'mongodb://mongo:27017/account-test'
    README_DEFAULT: string = `<h2>${this.APP_TITLE} - <small>${this.APP_DESCRIPTION}.</small></h2>
    <p>Access the API documentation <a href="/api/v1/reference">v.1.0</a></p>`
    jwtSecret = "MyS3cr3tK3Y"
    jwtSession = { session: false }
    PORT: number = 5000
}

export default new Configs()