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
    public static readonly APP_ID: string = 'account_service'
    public static readonly NODE_ENV: string = 'development' // development, test, production
    public static readonly PORT_HTTP: number = 3000
    public static readonly PORT_HTTPS: number = 3001
    public static readonly SWAGGER_URI: string = 'https://api.swaggerhub.com/apis/nutes.ocariot/account-service/v1/swagger.json'
    public static readonly LOGO_URI: string = 'http://www.ocariot.com.br/wp-content/uploads/2018/08/cropped-512-32x32.png'

    // KEYS
    public static readonly JWT_ISSUER: string = 'ocariot'

    // MongoDB
    public static readonly MONGODB_URI: string = 'mongodb://127.0.0.1:27017/account-service'
    public static readonly MONGODB_URI_TEST: string = 'mongodb://127.0.0.1:27017/account-service-test'

    // RabbitMQ
    public static readonly RABBITMQ_HOST: string = '127.0.0.1:5672'
    public static readonly RABBITMQ_PORT: number = 5672
    public static readonly RABBITMQ_USERNAME: string = 'guest'
    public static readonly RABBITMQ_PASSWORD: string = 'guest'

    // Log
    public static readonly LOG_DIR: string = 'logs'

    // ADMIN USER DEFAULT
    public static readonly ADMIN_USERNAME: string = 'admin'
    public static readonly ADMIN_PASSWORD: string = 'admin*159'

    // Certificate Path
    public static readonly JWT_PRIVATE_KEY_PATH: string = '.certs/jwt.key'
    public static readonly JWT_PUBLIC_KEY_PATH: string = '.certs/jwt.pem'

    // Certificate
    // To generate self-signed certificates, see: https://devcenter.heroku.com/articles/ssl-certificate-self
    public static readonly SSL_KEY_PATH: string = '.certs/server.key'
    public static readonly SSL_CERT_PATH: string = '.certs/server.crt'

    public static readonly IP_WHITELIST: Array<string> = ['*']
}
