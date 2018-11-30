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
    NODE_ENV:string = 'dev'
    DB_URI: string = 'mongodb://localhost:27017/account'
    DB_URI_TEST: string = 'mongodb://localhost:27017/account-test'
    JWT_SECRET="MyS3cr3tK3Y"
    PORT: number = 3000
}

export default new Configs()