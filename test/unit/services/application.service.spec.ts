// import sinon from 'sinon'
// // import { assert } from 'chai'
// import { Application } from '../../../src/application/domain/model/application'
// import { ApplicationMock } from '../../mocks/application.mock'
// import { UserRepoModel } from '../../../src/infrastructure/database/schema/user.schema'
// import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
// import { IntegrationEventRepositoryMock } from '../../mocks/integration.event.repository.mock'
// import { IConnectionFactory } from '../../../src/infrastructure/port/connection.factory.interface'
// import { ConnectionFactoryRabbitmqMock } from '../../mocks/connection.factory.rabbitmq.mock'
// import { ConnectionRabbitmqMock } from '../../mocks/connection.rabbitmq.mock'
// import { IConnectionEventBus } from '../../../src/infrastructure/port/connection.event.bus.interface'
// import { IApplicationRepository } from '../../../src/application/port/application.repository.interface'
// import { IApplicationService } from '../../../src/application/port/application.service.interface'
// import { ApplicationService } from '../../../src/application/service/application.service'
// import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
// import { IEventBus } from '../../../src/infrastructure/port/event.bus.interface'
// import { EventBusRabbitmqMock } from '../../mocks/event.bus.rabbitmq.mock'
// import { IInstitutionRepository } from '../../../src/application/port/institution.repository.interface'
// import { ApplicationRepositoryMock } from '../../mocks/application.repository.mock'
// import { InstitutionRepositoryMock } from '../../mocks/institution.repository.mock'
// import { ILogger } from '../../../src/utils/custom.logger'
// import { IInstitutionService } from '../../../src/application/port/institution.service.interface'
// import { InstitutionService } from '../../../src/application/service/institution.service'
// import { IUserRepository } from '../../../src/application/port/user.repository.interface'
// import { UserRepositoryMock } from '../../mocks/user.repository.mock'
// import { Institution } from '../../../src/application/domain/model/institution'
// import { InstitutionMock } from '../../mocks/institution.mock'
//
// require('sinon-mongoose')
//
// describe('Services: Application', () => {
//     const institution: Institution = new InstitutionMock()
//     const application: Application = new ApplicationMock()
//     application.password = 'password_mock'
//     application.institution = institution
//
//     const modelFake: any = UserRepoModel
//     const applicationRepo: IApplicationRepository = new ApplicationRepositoryMock()
//     const userRepo: IUserRepository = new UserRepositoryMock()
//     const institutionRepo: IInstitutionRepository = new InstitutionRepositoryMock()
//     const integrationRepo: IIntegrationEventRepository = new IntegrationEventRepositoryMock()
//
//     const connectionFactoryRabbitmq: IConnectionFactory = new ConnectionFactoryRabbitmqMock()
//     const connectionRabbitmqPub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
//     const connectionRabbitmqSub: IConnectionEventBus = new ConnectionRabbitmqMock(connectionFactoryRabbitmq)
//     const eventBusRabbitmq: IEventBus = new EventBusRabbitmqMock(connectionRabbitmqPub, connectionRabbitmqSub)
//     const customLogger: ILogger = new CustomLoggerMock()
//
//     const applicationService: IApplicationService = new ApplicationService(applicationRepo, institutionRepo,
//         integrationRepo, customLogger, eventBusRabbitmq)
//
//     const institutionService: IInstitutionService = new InstitutionService(institutionRepo, userRepo, customLogger)
//
//     afterEach(() => {
//         sinon.restore()
//     })
//
//     /**
//      * Method "add(application: Application)"
//      */
//     describe('add(application: Application)', () => {
//         context('when the Application is correct and it still does not exist in the repository', () => {
//             it('should return the Application that was added', async () => {
//                 sinon
//                     .mock(modelFake)
//                     .expects('create')
//                     .withArgs(application)
//                     .resolves(application)
//
//                 try {
//                     await institutionService.add(institution)
//                     await applicationService.add(application)
//                 } catch (err) {
//                     console.log(err)
//                 }
//             })
//         })
//     })
// })
