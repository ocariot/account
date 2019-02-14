import 'reflect-metadata'
import { Container } from 'inversify'
import { HomeController } from '../ui/controller/home.controller'
import { Identifier } from './identifiers'
import { UserEntity } from '../infrastructure/entity/user.entity'
import { IEntityMapper } from '../infrastructure/port/entity.mapper.interface'
import { User } from '../application/domain/model/user'
import { RabbitMQConnectionFactory } from '../infrastructure/eventbus/rabbitmq/rabbitmp.connection.factory'
import { RabbitMQConnection } from '../infrastructure/eventbus/rabbitmq/rabbitmq.connection'
import { EventBusRabbitMQ } from '../infrastructure/eventbus/rabbitmq/eventbus.rabbitmq'
import { MongoDBConnectionFactory } from '../infrastructure/database/mongodb.connection.factory'
import { MongoDBConnection } from '../infrastructure/database/mongodb.connection'
import { IDBConnection } from '../infrastructure/port/db.connection.interface'
import { IRabbitMQConnection } from '../infrastructure/port/rabbitmq.connection.interface'
import { IConnectionFactory } from '../infrastructure/port/connection.factory.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { BackgroundService } from '../background/background.service'
import { App } from '../app'
import { CustomLogger, ILogger } from '../utils/custom.logger'
import { IChildService } from '../application/port/child.service.interface'
import { ChildService } from '../application/service/child.service'
import { IChildRepository } from '../application/port/child.repository.interface'
import { ChildRepository } from '../infrastructure/repository/child.repository'
import { ChildEntity } from '../infrastructure/entity/child.entity'
import { ChildEntityMapper } from '../infrastructure/entity/mapper/child.entity.mapper'
import { ChildController } from '../ui/controller/child.controller'
import { UserRepoModel } from '../infrastructure/database/schema/user.schema'
import { Child } from '../application/domain/model/child'
import { UserEntityMapper } from '../infrastructure/entity/mapper/user.entity.mapper'
import { InstitutionRepoModel } from '../infrastructure/database/schema/institution.schema'
import { FamilyService } from '../application/service/family.service'
import { IFamilyService } from '../application/port/family.service.interface'
import { FamilyController } from '../ui/controller/family.controller'
import { IFamilyRepository } from '../application/port/family.repository.interface'
import { FamilyRepository } from '../infrastructure/repository/family.repository'
import { FamilyEntity } from '../infrastructure/entity/family.entity'
import { Family } from '../application/domain/model/family'
import { FamilyEntityMapper } from '../infrastructure/entity/mapper/family.entity.mapper'
import { InstitutionController } from '../ui/controller/institution.controller'
import { IInstitutionService } from '../application/port/institution.service.interface'
import { InstitutionService } from '../application/service/institution.service'
import { IInstitutionRepository } from '../application/port/institution.repository.interface'
import { InstitutionRepository } from '../infrastructure/repository/institution.repository'
import { Institution } from '../application/domain/model/institution'
import { InstitutionEntityMapper } from '../infrastructure/entity/mapper/institution.entity.mapper'
import { InstitutionEntity } from '../infrastructure/entity/institution.entity'
import { AuthController } from '../ui/controller/auth.controller'
import { IAuthService } from '../application/port/auth.service.interface'
import { AuthService } from '../application/service/auth.service'
import { IAuthRepository } from '../application/port/auth.repository.interface'
import { AuthRepository } from '../infrastructure/repository/auth.repository'
import { ApplicationController } from '../ui/controller/application.controller'
import { IApplicationService } from '../application/port/application.service.interface'
import { ApplicationService } from '../application/service/application.service'
import { IApplicationRepository } from '../application/port/application.repository.interface'
import { ApplicationRepository } from '../infrastructure/repository/application.repository'
import { Application } from '../application/domain/model/application'
import { ApplicationEntity } from '../infrastructure/entity/application.entity'
import { ApplicationEntityMapper } from '../infrastructure/entity/mapper/application.entity.mapper'
import { EducatorController } from '../ui/controller/educator.controller'
import { IEducatorRepository } from '../application/port/educator.repository.interface'
import { EducatorRepository } from '../infrastructure/repository/educator.repository'
import { EducatorEntity } from '../infrastructure/entity/educator.entity'
import { Educator } from '../application/domain/model/educator'
import { EducatorEntityMapper } from '../infrastructure/entity/mapper/educator.entity.mapper'
import { IEducatorService } from '../application/port/educator.service.interface'
import { EducatorService } from '../application/service/educator.service'
import { HealthProfessionalController } from '../ui/controller/health.professional.controller'
import { IHealthProfessionalService } from '../application/port/health.professional.service.interface'
import { HealthProfessionalService } from '../application/service/health.professional.service'
import { IHealthProfessionalRepository } from '../application/port/health.professional.repository.interface'
import { HealthProfessionalRepository } from '../infrastructure/repository/health.professional.repository'
import { HealthProfessional } from '../application/domain/model/health.professional'
import { HealthProfessionalEntity } from '../infrastructure/entity/health.professional.entity'
import { HealthProfessionalEntityMapper } from '../infrastructure/entity/mapper/health.professional.entity.mapper'
import { IChildrenGroupService } from '../application/port/children.group.service.interface'
import { ChildrenGroupService } from '../application/service/children.group.service'
import { IChildrenGroupRepository } from '../application/port/children.group.repository.interface'
import { ChildrenGroupRepository } from '../infrastructure/repository/children.group.repository'
import { ChildrenGroup } from '../application/domain/model/children.group'
import { ChildrenGroupEntity } from '../infrastructure/entity/children.group.entity'
import { ChildrenGroupEntityMapper } from '../infrastructure/entity/mapper/children.group.entity.mapper'
import { ChildrenGroupRepoModel } from '../infrastructure/database/schema/children.group.schema'
import { UserController } from '../ui/controller/user.controller'
import { IUserService } from '../application/port/user.service.interface'
import { UserService } from '../application/service/user.service'
import { IUserRepository } from '../application/port/user.repository.interface'
import { UserRepository } from '../infrastructure/repository/user.repository'

export class DI {
    private static instance: DI
    private readonly container: Container

    /**
     * Creates an instance of DI.
     *
     * @private
     */
    private constructor() {
        this.container = new Container()
        this.initDependencies()
    }

    /**
     * Recover single instance of class.
     *
     * @static
     * @return {App}
     */
    public static getInstance(): DI {
        if (!this.instance) this.instance = new DI()
        return this.instance
    }

    /**
     * Get Container inversify.
     *
     * @returns {Container}
     */
    public getContainer(): Container {
        return this.container
    }

    /**
     * Initializes injectable containers.
     *
     * @private
     * @return void
     */
    private initDependencies(): void {
        this.container.bind(Identifier.APP).to(App).inSingletonScope()

        // Controllers
        this.container.bind<HomeController>(Identifier.HOME_CONTROLLER)
            .to(HomeController).inSingletonScope()
        this.container.bind<UserController>(Identifier.USER_CONTROLLER)
            .to(UserController).inSingletonScope()
        this.container.bind<AuthController>(Identifier.AUTH_CONTROLLER)
            .to(AuthController).inSingletonScope()
        this.container.bind<ChildController>(Identifier.CHILD_CONTROLLER)
            .to(ChildController).inSingletonScope()
        this.container.bind<FamilyController>(Identifier.FAMILY_CONTROLLER)
            .to(FamilyController).inSingletonScope()
        this.container.bind<ApplicationController>(Identifier.APPLICATION_CONTROLLER)
            .to(ApplicationController).inSingletonScope()
        this.container.bind<EducatorController>(Identifier.EDUCATOR_CONTROLLER)
            .to(EducatorController).inSingletonScope()
        this.container.bind<HealthProfessionalController>(Identifier.HEALTH_PROFESSIONAL_CONTROLLER)
            .to(HealthProfessionalController).inSingletonScope()
        this.container.bind<InstitutionController>(Identifier.INSTITUTION_CONTROLLER)
            .to(InstitutionController).inSingletonScope()

        // Services
        this.container.bind<IAuthService>(Identifier.AUTH_SERVICE)
            .to(AuthService).inSingletonScope()
        this.container.bind<IUserService>(Identifier.USER_SERVICE)
            .to(UserService).inSingletonScope()
        this.container.bind<IChildService>(Identifier.CHILD_SERVICE)
            .to(ChildService).inSingletonScope()
        this.container.bind<IFamilyService>(Identifier.FAMILY_SERVICE)
            .to(FamilyService).inSingletonScope()
        this.container.bind<IApplicationService>(Identifier.APPLICATION_SERVICE)
            .to(ApplicationService).inSingletonScope()
        this.container.bind<IEducatorService>(Identifier.EDUCATOR_SERVICE)
            .to(EducatorService).inSingletonScope()
        this.container.bind<IHealthProfessionalService>(Identifier.HEALTH_PROFESSIONAL_SERVICE)
            .to(HealthProfessionalService).inSingletonScope()
        this.container.bind<IInstitutionService>(Identifier.INSTITUTION_SERVICE)
            .to(InstitutionService).inSingletonScope()
        this.container.bind<IChildrenGroupService>(Identifier.CHILDREN_GROUP_SERVICE)
            .to(ChildrenGroupService).inSingletonScope()

        // Repositories
        this.container.bind<IAuthRepository>(Identifier.AUTH_REPOSITORY)
            .to(AuthRepository).inSingletonScope()
        this.container.bind<IUserRepository>(Identifier.USER_REPOSITORY)
            .to(UserRepository).inSingletonScope()
        this.container.bind<IChildRepository>(Identifier.CHILD_REPOSITORY)
            .to(ChildRepository).inSingletonScope()
        this.container.bind<IFamilyRepository>(Identifier.FAMILY_REPOSITORY)
            .to(FamilyRepository).inSingletonScope()
        this.container.bind<IApplicationRepository>(Identifier.APPLICATION_REPOSITORY)
            .to(ApplicationRepository).inSingletonScope()
        this.container.bind<IEducatorRepository>(Identifier.EDUCATOR_REPOSITORY)
            .to(EducatorRepository).inSingletonScope()
        this.container.bind<IHealthProfessionalRepository>(Identifier.HEALTH_PROFESSIONAL_REPOSITORY)
            .to(HealthProfessionalRepository).inSingletonScope()
        this.container.bind<IInstitutionRepository>(Identifier.INSTITUTION_REPOSITORY)
            .to(InstitutionRepository).inSingletonScope()
        this.container.bind<IChildrenGroupRepository>(Identifier.CHILDREN_GROUP_REPOSITORY)
            .to(ChildrenGroupRepository).inSingletonScope()

        // Mongoose Schema
        this.container.bind(Identifier.USER_REPO_MODEL).toConstantValue(UserRepoModel)
        this.container.bind(Identifier.INSTITUTION_REPO_MODEL).toConstantValue(InstitutionRepoModel)
        this.container.bind(Identifier.CHILDREN_GROUP_REPO_MODEL).toConstantValue(ChildrenGroupRepoModel)

        // Mappers
        this.container.bind<IEntityMapper<User, UserEntity>>(Identifier.USER_ENTITY_MAPPER)
            .to(UserEntityMapper).inSingletonScope()
        this.container.bind<IEntityMapper<Child, ChildEntity>>(Identifier.CHILD_ENTITY_MAPPER)
            .to(ChildEntityMapper).inSingletonScope()
        this.container.bind<IEntityMapper<Family, FamilyEntity>>(Identifier.FAMILY_ENTITY_MAPPER)
            .to(FamilyEntityMapper).inSingletonScope()
        this.container.bind<IEntityMapper<Application, ApplicationEntity>>(Identifier.APPLICATION_ENTITY_MAPPER)
            .to(ApplicationEntityMapper).inSingletonScope()
        this.container.bind<IEntityMapper<Educator, EducatorEntity>>(Identifier.EDUCATOR_ENTITY_MAPPER)
            .to(EducatorEntityMapper).inSingletonScope()
        this.container
            .bind<IEntityMapper<HealthProfessional, HealthProfessionalEntity>>(Identifier.HEALTH_PROFESSIONAL_ENTITY_MAPPER)
            .to(HealthProfessionalEntityMapper).inSingletonScope()
        this.container.bind<IEntityMapper<Institution, InstitutionEntity>>(Identifier.INSTITUTION_ENTITY_MAPPER)
            .to(InstitutionEntityMapper).inSingletonScope()
        this.container.bind<IEntityMapper<ChildrenGroup, ChildrenGroupEntity>>(Identifier.CHILDREN_GROUP_ENTITY_MAPPER)
            .to(ChildrenGroupEntityMapper).inSingletonScope()

        // Background Services
        this.container.bind(Identifier.BACKGROUND_SERVICE)
            .to(BackgroundService).inSingletonScope()
        this.container.bind<IConnectionFactory>(Identifier.RABBITMQ_CONNECTION_FACTORY)
            .to(RabbitMQConnectionFactory).inSingletonScope()
        this.container.bind<IRabbitMQConnection>(Identifier.RABBITMQ_CONNECTION)
            .to(RabbitMQConnection).inSingletonScope()
        this.container.bind<IEventBus>(Identifier.RABBITMQ_EVENT_BUS)
            .to(EventBusRabbitMQ).inSingletonScope()
        this.container.bind<IConnectionFactory>(Identifier.MONGODB_CONNECTION_FACTORY)
            .to(MongoDBConnectionFactory).inSingletonScope()
        this.container.bind<IDBConnection>(Identifier.MONGODB_CONNECTION)
            .to(MongoDBConnection).inSingletonScope()

        // Log
        this.container.bind<ILogger>(Identifier.LOGGER).to(CustomLogger).inSingletonScope()
    }
}
