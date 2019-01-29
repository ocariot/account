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

    public static readonly CHILD: any = {
        ALREADY_REGISTERED: 'Child is already registered!',
        CHILDREN_REGISTER_REQUIRED: 'It is necessary for children to be registered before proceeding.',
        IDS_WITHOUT_REGISTER: 'The following IDs were verified without registration:',
        NOT_FOUND: 'Child not found!',
        NOT_FOUND_DESCRIPTION: 'Child not found or already removed. A new operation for the same resource is not required.',
        ASSOCIATION_FAILURE: 'The association could not be performed because the child does not have a record.'
    }

    public static readonly INSTITUTION: any = {
        ALREADY_REGISTERED: 'Institution is already registered!',
        REGISTER_REQUIRED: 'The institution provided does not have a registration.',
        ALERT_REGISTER_REQUIRED: 'It is necessary that the institution be registered before trying again.',
        NOT_FOUND: 'Institution not found!',
        NOT_FOUND_DESCRIPTION: 'Institution not found or already removed. A new operation for the same resource is not required.'
    }

    public static readonly FAMILY: any = {
        ALREADY_REGISTERED: 'Family is already registered!',
        NOT_FOUND: 'Family not found!',
        NOT_FOUND_DESCRIPTION: 'Family not found or already removed. A new operation for the same resource is not required.'
    }

    public static readonly EDUCATOR: any = {
        ALREADY_REGISTERED: 'Educator is already registered!',
        NOT_FOUND: 'Educator not found!',
        NOT_FOUND_DESCRIPTION: 'Educator not found or already removed. A new operation for the same resource is not required.'
    }

    public static readonly HEALTH_PROFESSIONAL: any = {
        ALREADY_REGISTERED: 'Health Professional is already registered!',
        NOT_FOUND: 'Health Professional not found!',
        NOT_FOUND_DESCRIPTION: 'Health Professional not found or already removed.' +
            ' A new operation for the same resource is not required.'
    }

    public static readonly APPLICATION: any = {
        ALREADY_REGISTERED: 'Application is already registered!',
        NOT_FOUND: 'Application not found!',
        NOT_FOUND_DESCRIPTION: 'Application not found or already removed. A new operation for the same resource is not required.'
    }

    public static readonly ERROR_MESSAGE: any = {
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...'
    }
}
