/**
 * Constants used in dependence injection.
 *
 * @abstract
 */
export abstract class Identifier {
    public static readonly APP: any = Symbol.for('App')

    // Controllers
    public static readonly HOME_CONTROLLER: any = Symbol.for('HomeController')
    public static readonly AUTH_CONTROLLER: any = Symbol.for('AuthController')
    public static readonly USER_CONTROLLER: any = Symbol.for('UserController')
    public static readonly CHILD_CONTROLLER: any = Symbol.for('ChildController')
    public static readonly FAMILY_CONTROLLER: any = Symbol.for('FamilyController')
    public static readonly EDUCATOR_CONTROLLER: any = Symbol.for('EducatorController')
    public static readonly HEALTH_PROFESSIONAL_CONTROLLER: any = Symbol.for('HealthProfessionalController')
    public static readonly APPLICATION_CONTROLLER: any = Symbol.for('ApplicationController')
    public static readonly INSTITUTION_CONTROLLER: any = Symbol.for('InstitutionController')

    // Services
    public static readonly AUTH_SERVICE: any = Symbol.for('AuthService')
    public static readonly USER_SERVICE: any = Symbol.for('UserService')
    public static readonly CHILD_SERVICE: any = Symbol.for('ChildService')
    public static readonly FAMILY_SERVICE: any = Symbol.for('FamilyService')
    public static readonly EDUCATOR_SERVICE: any = Symbol.for('EducatorService')
    public static readonly HEALTH_PROFESSIONAL_SERVICE: any = Symbol.for('HealthProfessionalService')
    public static readonly APPLICATION_SERVICE: any = Symbol.for('ApplicationService')
    public static readonly INSTITUTION_SERVICE: any = Symbol.for('InstitutionService')
    public static readonly CHILDREN_GROUP_SERVICE: any = Symbol.for('ChildrenGroupService')

    // Repositories
    public static readonly AUTH_REPOSITORY: any = Symbol.for('AuthRepository')
    public static readonly USER_REPOSITORY: any = Symbol.for('UserRepository')
    public static readonly CHILD_REPOSITORY: any = Symbol.for('ChildRepository')
    public static readonly FAMILY_REPOSITORY: any = Symbol.for('FamilyRepository')
    public static readonly EDUCATOR_REPOSITORY: any = Symbol.for('EducatorRepository')
    public static readonly HEALTH_PROFESSIONAL_REPOSITORY: any = Symbol.for('HealthProfessionalRepository')
    public static readonly APPLICATION_REPOSITORY: any = Symbol.for('ApplicationRepository')
    public static readonly INSTITUTION_REPOSITORY: any = Symbol.for('InstitutionRepository')
    public static readonly CHILDREN_GROUP_REPOSITORY: any = Symbol.for('ChildrenGroupRepository')
    public static readonly INTEGRATION_EVENT_REPOSITORY: any = Symbol.for('IntegrationEventRepository')

    // Models
    public static readonly USER_REPO_MODEL: any = Symbol.for('UserRepoModel')
    public static readonly INSTITUTION_REPO_MODEL: any = Symbol.for('InstitutionRepoModel')
    public static readonly CHILDREN_GROUP_REPO_MODEL: any = Symbol.for('ChildrenGroupRepoModel')
    public static readonly INTEGRATION_EVENT_REPO_MODEL: any = Symbol.for('IntegrationEventRepoModel')

    // Mappers
    public static readonly USER_ENTITY_MAPPER: any = Symbol.for('UserEntityMapper')
    public static readonly CHILD_ENTITY_MAPPER: any = Symbol.for('ChildEntityMapper')
    public static readonly FAMILY_ENTITY_MAPPER: any = Symbol.for('FamilyEntityMapper')
    public static readonly EDUCATOR_ENTITY_MAPPER: any = Symbol.for('EducatorEntityMapper')
    public static readonly HEALTH_PROFESSIONAL_ENTITY_MAPPER: any = Symbol.for('HealthProfessionalEntityMapper')
    public static readonly APPLICATION_ENTITY_MAPPER: any = Symbol.for('ApplicationEntityMapper')
    public static readonly INSTITUTION_ENTITY_MAPPER: any = Symbol.for('InstitutionEntityMapper')
    public static readonly CHILDREN_GROUP_ENTITY_MAPPER: any = Symbol.for('ChildrenGroupEntityMapper')

    // Background Services
    public static readonly RABBITMQ_EVENT_BUS: any = Symbol.for('EventBusRabbitMQ')
    public static readonly RABBITMQ_CONNECTION_FACTORY: any = Symbol.for('RabbitMQConnectionFactory')
    public static readonly RABBITMQ_CONNECTION: any = Symbol.for('ConnectionRabbitmq')
    public static readonly MONGODB_CONNECTION_FACTORY: any = Symbol.for('ConnectionFactoryMongoDB')
    public static readonly MONGODB_CONNECTION: any = Symbol.for('ConnectionMongoDB')
    public static readonly BACKGROUND_SERVICE: any = Symbol.for('BackgroundService')

    // Tasks
    public static readonly REGISTER_DEFAULT_ADMIN_TASK: any = Symbol.for('RegisterDefaultAdminTask')
    public static readonly EVENT_BUS_TASK: any = Symbol.for('EventBusTask')

    // Log
    public static readonly LOGGER: any = Symbol.for('CustomLogger')
}
