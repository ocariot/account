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
    DB_URI: string = 'mongodb://127.0.0.1:27017/account'
    DB_URI_TEST: string = 'mongodb://127.0.0.1:27017/account-test'
    README_DEFAULT: string = `<h2>${this.APP_TITLE} - <small>${this.APP_DESCRIPTION}.</small></h2>
    <p>Access the API documentation <a href="/api/v1/doc" >v.1.0 </a></p>`

    jwtSecret =  "MyS3cr3tK3Y"
    jwtSession = {session: false}
}

export default new Configs()