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

    public static readonly USER: any = {
        NOT_FOUND: 'User not found!',
        NOT_FOUND_DESCRIPTION: 'User not found or already removed. A new operation for the same resource is not required.',
        PASSWORD_NOT_MATCH: 'Password does not match!',
        PASSWORD_NOT_MATCH_DESCRIPTION: 'The old password parameter does not match with the actual user password.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {user_id} is not in valid format!'
    }

    public static readonly CHILD: any = {
        ALREADY_REGISTERED: 'Child is already registered...',
        CHILDREN_REGISTER_REQUIRED: 'It is necessary for children to be registered before proceeding.',
        IDS_WITHOUT_REGISTER: 'The following IDs were verified without registration: ',
        NOT_FOUND: 'Child not found!',
        NOT_FOUND_DESCRIPTION: 'Child not found or already removed. A new operation for the same resource is not required.',
        ASSOCIATION_FAILURE: 'The association could not be performed because the child does not have a record.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {child_id} is not in valid format!'
    }

    public static readonly INSTITUTION: any = {
        ALREADY_REGISTERED: 'Institution is already registered...',
        REGISTER_REQUIRED: 'The institution provided does not have a registration.',
        ALERT_REGISTER_REQUIRED: 'It is necessary that the institution be registered before trying again.',
        NOT_FOUND: 'Institution not found!',
        HAS_ASSOCIATION: 'The institution is associated with one or more users.',
        NOT_FOUND_DESCRIPTION: 'Institution not found or already removed. A new operation for the same resource is not required.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {institution_id} is not in valid format!'
    }

    public static readonly FAMILY: any = {
        ALREADY_REGISTERED: 'Family is already registered...',
        NOT_FOUND: 'Family not found!',
        NOT_FOUND_DESCRIPTION: 'Family not found or already removed. A new operation for the same resource is not required.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {family_id} is not in valid format!'
    }

    public static readonly EDUCATOR: any = {
        ALREADY_REGISTERED: 'Educator is already registered...',
        NOT_FOUND: 'Educator not found!',
        NOT_FOUND_DESCRIPTION: 'Educator not found or already removed. A new operation for the same resource is not required.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {educator_id} is not in valid format!'
    }

    public static readonly HEALTH_PROFESSIONAL: any = {
        ALREADY_REGISTERED: 'Health Professional is already registered...',
        NOT_FOUND: 'Health Professional not found!',
        NOT_FOUND_DESCRIPTION: 'Health Professional not found or already removed.' +
            ' A new operation for the same resource is not required.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {healthprofessional_id} is not in valid format!'
    }

    public static readonly APPLICATION: any = {
        ALREADY_REGISTERED: 'Application is already registered...',
        NOT_FOUND: 'Application not found!',
        NOT_FOUND_DESCRIPTION: 'Application not found or already removed. A new operation for the same resource is not required.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {application_id} is not in valid format!'
    }

    public static readonly CHILDREN_GROUP: any = {
        ALREADY_REGISTERED: 'Children Group is already registered...',
        NOT_FOUND: 'Children Group not found!',
        NOT_FOUND_DESCRIPTION: 'Children Group not found or already removed. ' +
            'A new operation for the same resource is not required.',
        PARAM_ID_NOT_VALID_FORMAT: 'Parameter {group_id} is not in valid format!'
    }

    public static readonly ERROR_MESSAGE: any = {
        UNEXPECTED: 'An unexpected error has occurred. Please try again later...',
        UUID_NOT_VALID_FORMAT: 'Some ID provided does not have a valid format!',
        UUID_NOT_VALID_FORMAT_DESC: 'A 24-byte hex ID similar to this: 507f191e810c19729de860ea is expected.',
        MULTIPLE_UUID_NOT_VALID_FORMAT: 'The following IDs from children attribute are not in valid format: {0}',
        INVALID_MULTIPLE_UUID: 'Children field contains invalid IDs. It is expected that each item in the array is a ' +
            '24-byte hex string like this: 507f191e810c19729de860ea',
        INTERNAL_SERVER_ERROR: 'An internal server error has occurred.',
        INTERNAL_SERVER_ERROR_DESC: 'Check all parameters of the operation being requested.',
        REQUIRED_FIELDS: 'Required fields were not provided...',
        REQUIRED_FIELDS_DESC: '{0} are required!',
        INVALID_FIELDS: 'One or more request fields are invalid...',
        INVALID_STRING: '{0} must be a string!',
        EMPTY_STRING: '{0} must have at least one character!',
        YEAR_NOT_ALLOWED: 'Date {0} has year not allowed. The year must be greater than 1678 and less than 2261.',
        INVALID_DATE_FORMAT: 'Date: {0}, is not in valid ISO 8601 format.',
        INVALID_DATE_FORMAT_DESC: 'Date must be in the format: yyyy-MM-dd',
        INVALID_DATETIME_FORMAT: 'Datetime: {0}, is not in valid ISO 8601 format.',
        INVALID_DATETIME_FORMAT_DESC: 'Datetime must be in the format: yyyy-MM-ddTHH:mm:ssZ',
        INVALID_ARRAY: '{0} must be an array!',
        INVALID_AGE_DATE: 'Datetime: {0}, cannot be used!',
        INVALID_AGE_DATE_DESC: 'The \'age\' and \'age_calc_date\' fields can only receive past or present dates.',
        INVALID_SCOPES: 'The list of new scopes is invalid!',
        INVALID_SCOPES_DESC_1: 'A scopes array with at least one item is required.',
        INVALID_SCOPES_DESC_2: '{0} are not valid scopes for {1} users.'
    }
}
