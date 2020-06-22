/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Default {
    public static readonly APP_ID: string = 'account.app'
    public static readonly NODE_ENV: string = 'development' // development, test, production
    public static readonly PORT_HTTP: number = 3000
    public static readonly PORT_HTTPS: number = 3001
    public static readonly SWAGGER_URI: string = 'https://api.swaggerhub.com/apis/nutes.ocariot/account-service/v1/swagger.json'
    public static readonly LOGO_URI: string = 'http://www.ocariot.com.br/wp-content/uploads/2018/08/cropped-512-32x32.png'

    // KEYS
    public static readonly JWT_ISSUER: string = 'ocariot'

    // MongoDB
    public static readonly MONGODB_URI: string = 'mongodb://127.0.0.1:27017/ocariot-account'
    public static readonly MONGODB_URI_TEST: string = 'mongodb://127.0.0.1:27017/ocariot-account-test'

    // RabbitMQ
    public static readonly RABBITMQ_URI: string = 'amqp://guest:guest@127.0.0.1:5672'

    // Log
    public static readonly LOG_DIR: string = 'logs'

    // ADMIN USER DEFAULT
    public static readonly ADMIN_USERNAME: string = 'admin'
    public static readonly ADMIN_PASSWORD: string = 'admin*159'

    // Secret Key of the Username Anonymization
    public static readonly ENCRYPT_SECRET_KEY: string = 's3cr3tk3y'

    // Certificate Path
    public static readonly JWT_PRIVATE_KEY_PATH: string = '.certs/jwt.key'
    public static readonly JWT_PUBLIC_KEY_PATH: string = '.certs/jwt.pem'

    // Certificate
    // To generate self-signed certificates, see: https://devcenter.heroku.com/articles/ssl-certificate-self
    public static readonly SSL_KEY_PATH: string = '.certs/server.key'
    public static readonly SSL_CERT_PATH: string = '.certs/server.crt'
    public static readonly RABBITMQ_CA_PATH: string = '.certs/ca.crt'

    /**
     * The frequency of time that the application will check, in the background, the need to send one or more
     * notifications, according to the cron expression.
     * For example, the value 0 0 9 * * *, means that the check it will occurs every day at 09:00:00.
     *
     * Cron ranges:
     *
     * Seconds            Minutes            Hours            Day of Month            Months            Day of Week
     *  0-59               0-59               0-23                1-31            0-11 (Jan-Dec)       0-6 (Sun-Sat)
     */
    public static readonly EXPRESSION_AUTO_NOTIFICATION: string = '0 0 9 * * *'

    // The number of days to be used as a parameter for checking the need to send one or more notifications.
    public static readonly NUMBER_OF_DAYS: number = 7

    /**
     * User scopes
     */
        // Admin
    public static readonly ADMIN_SCOPES = [
        'users:delete',
        'users:resetPassword',
        'educators:create',
        'educators:read',
        'educators:readAll',
        'educators:update',
        'educators:delete',
        'families:create',
        'families:read',
        'families:readAll',
        'families:update',
        'families:delete',
        'children:create',
        'children:read',
        'children:readAll',
        'children:update',
        'children:delete',
        'healthprofessionals:create',
        'healthprofessionals:read',
        'healthprofessionals:readAll',
        'healthprofessionals:update',
        'healthprofessionals:delete',
        'applications:create',
        'applications:read',
        'applications:readAll',
        'applications:update',
        'applications:delete',
        'institutions:create',
        'institutions:read',
        'institutions:readAll',
        'institutions:update',
        'institutions:delete',
        'socioquest:read',
        'healthquest:read',
        'parentphyquest:read',
        'childrenphyquest:read',
        'habitsquest:read',
        'foodhabitsquest:read',
        'perceptionquest:read',
        'foodtracking:create',
        'foodtracking:read',
        'foodtracking:update',
        'foodtracking:delete',
        'physicalactivities:read',
        'sleep:read',
        'measurements:read',
        'environment:read',
        'missions:read',
        'gamificationprofile:read',
        'notifications:create',
        'notifications:read',
        'notifications:delete',
        'devices:create',
        'devices:read',
        'devices:delete'
    ]

    // Application
    public static readonly APPLICATION_SCOPES = [
        'applications:read',
        'children:readAll',
        'institutions:read',
        'institutions:readAll',
        'physicalactivities:create',
        'physicalactivities:read',
        'physicalactivities:update',
        'physicalactivities:delete',
        'sleep:create',
        'sleep:read',
        'sleep:update',
        'sleep:delete',
        'measurements:create',
        'measurements:read',
        'measurements:delete',
        'environment:create',
        'environment:read',
        'environment:update',
        'environment:delete',
        'socioquest:read',
        'healthquest:read',
        'parentphyquest:read',
        'childrenphyquest:read',
        'habitsquest:read',
        'foodhabitsquest:create',
        'foodhabitsquest:read',
        'perceptionquest:read',
        'foodtracking:create',
        'foodtracking:read',
        'foodtracking:update',
        'foodtracking:delete',
        'missions:create',
        'missions:read',
        'missions:update',
        'missions:delete',
        'gamificationprofile:create',
        'gamificationprofile:read',
        'gamificationprofile:update',
        'gamificationprofile:delete',
        'external:sync'
    ]

    // Child
    public static readonly CHILD_SCOPES = [
        'children:read',
        'institutions:read',
        'physicalactivities:create',
        'physicalactivities:read',
        'sleep:create',
        'sleep:read',
        'measurements:create',
        'measurements:read',
        'environment:read',
        'foodtracking:create',
        'foodtracking:read',
        'foodtracking:update',
        'foodtracking:delete',
        'missions:read',
        'gamificationprofile:read',
        'gamificationprofile:update',
        'external:sync',
        'notifications:create',
        'notifications:read',
        'notifications:delete'
    ]

    // Educator
    public static readonly EDUCATOR_SCOPES = [
        'children:read',
        'children:readAll',
        'educators:read',
        'educators:update',
        'childrengroups:create',
        'childrengroups:read',
        'childrengroups:update',
        'childrengroups:delete',
        'institutions:read',
        'institutions:readAll',
        'institutions:update',
        'physicalactivities:create',
        'physicalactivities:read',
        'physicalactivities:update',
        'physicalactivities:delete',
        'sleep:create',
        'sleep:read',
        'sleep:update',
        'sleep:delete',
        'measurements:create',
        'measurements:read',
        'measurements:delete',
        'environment:read',
        'childrenphyquest:read',
        'habitsquest:create',
        'habitsquest:read',
        'habitsquest:update',
        'foodhabitsquest:create',
        'foodhabitsquest:read',
        'foodhabitsquest:update',
        'perceptionquest:create',
        'perceptionquest:read',
        'perceptionquest:update',
        'foodtracking:create',
        'foodtracking:read',
        'foodtracking:update',
        'foodtracking:delete',
        'missions:create',
        'missions:read',
        'missions:update',
        'missions:delete',
        'gamificationprofile:create',
        'gamificationprofile:read',
        'gamificationprofile:update',
        'external:sync',
        'notifications:create',
        'notifications:read',
        'notifications:delete'
    ]

    // Family
    public static readonly FAMILY_SCOPES = [
        'children:read',
        'families:read',
        'families:update',
        'institutions:read',
        'physicalactivities:create',
        'physicalactivities:read',
        'physicalactivities:update',
        'physicalactivities:delete',
        'sleep:create',
        'sleep:read',
        'sleep:update',
        'sleep:delete',
        'measurements:create',
        'measurements:read',
        'measurements:delete',
        'environment:read',
        'socioquest:create',
        'socioquest:read',
        'socioquest:update',
        'healthquest:create',
        'healthquest:read',
        'healthquest:update',
        'parentphyquest:create',
        'parentphyquest:read',
        'parentphyquest:update',
        'childrenphyquest:read',
        'habitsquest:create',
        'habitsquest:read',
        'habitsquest:update',
        'foodhabitsquest:create',
        'foodhabitsquest:read',
        'foodhabitsquest:update',
        'perceptionquest:create',
        'perceptionquest:read',
        'perceptionquest:update',
        'foodtracking:create',
        'foodtracking:read',
        'foodtracking:update',
        'foodtracking:delete',
        'missions:create',
        'missions:read',
        'missions:update',
        'gamificationprofile:create',
        'gamificationprofile:read',
        'gamificationprofile:update',
        'external:sync',
        'notifications:create',
        'notifications:read',
        'notifications:delete'
    ]

    // Health Professional
    public static readonly HEALTH_PROF_SCOPES = [
        'children:read',
        'children:readAll',
        'healthprofessionals:read',
        'healthprofessionals:update',
        'childrengroups:create',
        'childrengroups:read',
        'childrengroups:update',
        'childrengroups:delete',
        'institutions:read',
        'institutions:readAll',
        'institutions:update',
        'physicalactivities:read',
        'sleep:read',
        'measurements:read',
        'environment:read',
        'socioquest:read',
        'healthquest:read',
        'parentphyquest:read',
        'childrenphyquest:create',
        'childrenphyquest:read',
        'childrenphyquest:update',
        'habitsquest:read',
        'foodhabitsquest:read',
        'perceptionquest:read',
        'foodtracking:create',
        'foodtracking:read',
        'foodtracking:update',
        'foodtracking:delete',
        'missions:read',
        'gamificationprofile:read',
        'external:sync',
        'notifications:create',
        'notifications:read',
        'notifications:delete'
    ]
}
