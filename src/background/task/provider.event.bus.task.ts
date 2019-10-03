import qs from 'query-strings-parser'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IEventBus } from '../../infrastructure/port/eventbus.interface'
import { IBackgroundTask } from '../../application/port/background.task.interface'
import { ILogger } from '../../utils/custom.logger'
import { Query } from '../../infrastructure/repository/query/query'
import { IQuery } from '../../application/port/query.interface'
import { Child } from '../../application/domain/model/child'
import { IChildRepository } from '../../application/port/child.repository.interface'
import { Family } from '../../application/domain/model/family'
import { IFamilyRepository } from '../../application/port/family.repository.interface'
import { Educator } from '../../application/domain/model/educator'
import { IEducatorRepository } from '../../application/port/educator.repository.interface'
import { HealthProfessional } from '../../application/domain/model/health.professional'
import { IHealthProfessionalRepository } from '../../application/port/health.professional.repository.interface'
import { Application } from '../../application/domain/model/application'
import { IApplicationRepository } from '../../application/port/application.repository.interface'
import { Institution } from '../../application/domain/model/institution'
import { IInstitutionRepository } from '../../application/port/institution.repository.interface'
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator'

@injectable()
export class ProviderEventBusTask implements IBackgroundTask {
    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
        @inject(Identifier.FAMILY_REPOSITORY) private readonly _familyRepository: IFamilyRepository,
        @inject(Identifier.EDUCATOR_REPOSITORY) private readonly _educatorRepository: IEducatorRepository,
        @inject(Identifier.HEALTH_PROFESSIONAL_REPOSITORY)
                        private readonly _healthProfessionalRepository: IHealthProfessionalRepository,
        @inject(Identifier.APPLICATION_REPOSITORY) private readonly _applicationRepository: IApplicationRepository,
        @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public run(): void {
        this.initializeProviders()
    }

    public stop(): Promise<void> {
        return this._eventBus.dispose()
    }

    /**
     * Provide resources for queries.
     * Most queries support the query string pattern defined in the REST API.
     */
    private initializeProviders(): void {
        // Providing child resource.
        this._eventBus.bus
            .provideChildren(async (query) => {
                try {
                    const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                    const result: Array<Child> = await this._childRepository.findAll(_query)
                    return result.map(item => item.toJSON())
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Child resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Child resource: ${err.message}`))

        // Providing family resource.
        this._eventBus.bus
            .provideFamilies(async (query) => {
                try {
                    const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                    const result: Array<Family> = await this._familyRepository.findAll(_query)
                    return result.map(item => item.toJSON())
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Family resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Family resource: ${err.message}`))

        // Providing family children resource.
        this._eventBus.bus
            .provideFamilyChildren(async (familyId) => {
                try {
                    ObjectIdValidator.validate(familyId)
                    const result: Family = await this._familyRepository.findById(familyId)
                    if (result && result.children) return result.children.map(item => item.toJSON())
                    return []
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Family Children resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Family Children resource: ${err.message}`))

        // Providing educator resource.
        this._eventBus.bus
            .provideEducators(async (query) => {
                try {
                    const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                    const result: Array<Educator> = await this._educatorRepository.findAll(_query)
                    return result.map(item => item.toJSON())
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Educator resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Educator resource: ${err.message}`))

        // Providing educator children group resource.
        this._eventBus.bus
            .provideEducatorChildrenGroups(async (educatorId) => {
                try {
                    ObjectIdValidator.validate(educatorId)
                    const result: Educator = await this._educatorRepository.findById(educatorId)
                    if (result && result.children_groups) return result.children_groups.map(item => item.toJSON())
                    return []
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Educator ChildrenGroup resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Educator ChildrenGroup resource: ${err.message}`))

        // Providing health professional resource.
        this._eventBus.bus
            .provideHealthProfessionals(async (query) => {
                try {
                    const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                    const result: Array<HealthProfessional> = await this._healthProfessionalRepository.findAll(_query)
                    return result.map(item => item.toJSON())
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('HealthProfessional resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide HealthProfessional resource: ${err.message}`))

        // Providing health professional children group resource.
        this._eventBus.bus
            .provideHealthProfessionalChildrenGroups(async (healthProfessionalId) => {
                try {
                    ObjectIdValidator.validate(healthProfessionalId)
                    const result: HealthProfessional = await this._healthProfessionalRepository.findById(healthProfessionalId)
                    if (result && result.children_groups) return result.children_groups.map(item => item.toJSON())
                    return []
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('HealthProfessional ChildrenGroup resource provided successfully!'))
            .catch((err) => {
                this._logger.error(`Error trying to provide HealthProfessional ChildrenGroup resource: ${err.message}`)
            })

        // Providing application resource.
        this._eventBus.bus
            .provideApplications(async (query) => {
                try {
                    const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                    const result: Array<Application> = await this._applicationRepository.findAll(_query)
                    return result.map(item => item.toJSON())
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Application resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Application resource: ${err.message}`))

        // Providing institution resource.
        this._eventBus.bus
            .provideInstitutions(async (query) => {
                try {
                    const _query: IQuery = new Query().fromJSON({ ...qs.parser(query) })
                    const result: Array<Institution> = await this._institutionRepository.find(_query)
                    return result.map(item => item.toJSON())
                } catch (err) {
                    return err
                }
            })
            .then(() => this._logger.info('Institution resource provided successfully!'))
            .catch((err) => this._logger.error(`Error trying to provide Institution resource: ${err.message}`))
    }
}
