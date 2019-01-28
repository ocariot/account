/**
 * Class that defines variables with default values.
 *
 * @see Variables defined in .env will have preference.
 * @see Be careful not to put critical data in this file as it is not in .gitignore.
 * Sensitive data such as database, passwords and keys should be stored in secure locations.
 *
 * @abstract
 */
export abstract class Strings {
    public static readonly APP: any = {
        TITLE: 'Account Service',
        APP_DESCRIPTION: 'Micro-service for Account.'
    }

    public static readonly VALIDATION_CHILD: any = {
        ALREADY_REGISTERED: 'Child is already registered!',
        CHILDREN_REGISTER_REQUIRED: 'It is necessary for children to be registered before proceeding.',
        IDS_WITHOUT_REGISTER: 'The following IDs were verified without registration:',
        VERIFICATION_PROBLEM: 'There was a problem verifying children!'
    }

    public static readonly VALIDATION_INSTITUTION: any = {
        REGISTER_REQUIRED: 'The institution provided does not have a registration.',
        ALERT_REGISTER_REQUIRED: 'It is necessary that the institution be registered before trying again.'
    }

    public static readonly VALIDATION_FAMILY: any = {
        ALREADY_REGISTERED: 'Family is already registered!'
    }

    public static readonly VALIDATION_APPLICATION: any = {
        ALREADY_REGISTERED: 'Application is already registered!'
    }

    public static readonly ERROR_MESSAGE: any = {
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...'
    }
}
