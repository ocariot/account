import { inject, injectable } from 'inversify'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { ILogger } from '../../utils/custom.logger'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IInstitutionRepository } from '../port/institution.repository.interface'
import { ValidationException } from '../domain/exception/validation.exception'
import { Strings } from '../../utils/strings'
import { UserType } from '../domain/model/user'
import { IHealthProfessionalService } from '../port/health.professional.service.interface'
import { IHealthProfessionalRepository } from '../port/health.professional.repository.interface'
import { HealthProfessional } from '../domain/model/health.professional'
import { CreateHealthProfessionalValidator } from '../domain/validator/create.health.professional.validator'
import { ChildrenGroup } from '../domain/model/children.group'
import { IChildrenGroupService } from '../port/children.group.service.interface'
import { UpdateUserValidator } from '../domain/validator/update.user.validator'

/**
 * Implementing Health Professional Service.
 *
 * @implements {IHealthProfessionalService}
 */
@injectable()
export class HealthProfessionalService implements IHealthProfessionalService {

    constructor(
        @inject(Identifier.HEALTH_PROFESSIONAL_REPOSITORY) private readonly _healthProfessionalRepository:
            IHealthProfessionalRepository,
        @inject(Identifier.INSTITUTION_REPOSITORY) private readonly _institutionRepository: IInstitutionRepository,
        @inject(Identifier.CHILDREN_GROUP_SERVICE) private readonly _childrenGroupService: IChildrenGroupService,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
    }

    public async add(healthProfessional: HealthProfessional): Promise<HealthProfessional> {
        CreateHealthProfessionalValidator.validate(healthProfessional)

        try {
            // 1. Checks if Health Professional already exists.
            const healthProfessionalExist = await this._healthProfessionalRepository.checkExist(healthProfessional)
            if (healthProfessionalExist) throw new ConflictException(Strings.HEALTH_PROFESSIONAL.ALREADY_REGISTERED)

            // 2. Checks if the institution exists.
            if (healthProfessional.institution && healthProfessional.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(healthProfessional.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Strings.INSTITUTION.REGISTER_REQUIRED,
                        Strings.INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }
        } catch (err) {
            return Promise.reject(err)
        }

        // 3. Create new Health Professional register.
        return this._healthProfessionalRepository.create(healthProfessional)
    }

    public async getAll(query: IQuery): Promise<Array<HealthProfessional>> {
        query.addFilter({ type: UserType.HEALTH_PROFESSIONAL })
        return this._healthProfessionalRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<HealthProfessional> {
        query.addFilter({ _id: id, type: UserType.HEALTH_PROFESSIONAL })
        return this._healthProfessionalRepository.findOne(query)
    }

    public async update(healthProfessional: HealthProfessional): Promise<HealthProfessional> {
        UpdateUserValidator.validate(healthProfessional)

        try {
            // 1. Checks if the institution exists.
            if (healthProfessional.institution && healthProfessional.institution.id !== undefined) {
                const institutionExist = await this._institutionRepository.checkExist(healthProfessional.institution)
                if (!institutionExist) {
                    throw new ValidationException(
                        Strings.INSTITUTION.REGISTER_REQUIRED,
                        Strings.INSTITUTION.ALERT_REGISTER_REQUIRED
                    )
                }
            }
        } catch (err) {
            return Promise.reject(err)
        }

        // 2. Update Health Professional data.
        return this._healthProfessionalRepository.update(healthProfessional)
    }

    public async remove(id: string | number): Promise<boolean> {
        return this._healthProfessionalRepository.delete(id)
    }

    public async saveChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        try {
            // 1. Checks if the health professional exists.
            const healthProfessional: HealthProfessional = await this._healthProfessionalRepository.findById(healthProfessionalId)
            if (!healthProfessional || !healthProfessional.children_groups) {
                throw new ValidationException(
                    Strings.HEALTH_PROFESSIONAL.NOT_FOUND,
                    Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION
                )
            }

            // 2. Save children group.
            const childrenGroupResult: ChildrenGroup = await this._childrenGroupService.add(childrenGroup)

            // 3. Update health professional with group of children created.
            healthProfessional.addChildrenGroup(childrenGroupResult)
            await this._healthProfessionalRepository.update(healthProfessional)

            // 4. If everything succeeds, it returns the data of the created group.
            return Promise.resolve(childrenGroupResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getAllChildrenGroups(healthProfessionalId: string, query: IQuery): Promise<Array<ChildrenGroup>> {
        try {
            // 1. Checks if the health professional exists.
            const healthProfessional: HealthProfessional = await this._healthProfessionalRepository.findById(healthProfessionalId)
            if (!healthProfessional || healthProfessional.id !== healthProfessionalId
                || (healthProfessional.children_groups && healthProfessional.children_groups.length === 0)) {
                return Promise.resolve([])
            }

            // 2. Retrieves children groups by health professional id.
            query.addFilter({ user_id: healthProfessionalId })
            return this._childrenGroupService.getAll(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getChildrenGroupById(healthProfessionalId: string, childrenGroupId: string, query: IQuery):
        Promise<ChildrenGroup | undefined> {

        try {
            // 1. Checks if the health professional exists.
            const healthProfessional: HealthProfessional = await this._healthProfessionalRepository.findById(healthProfessionalId)
            if (!healthProfessional || !healthProfessional.children_groups) return Promise.resolve(undefined)

            // 2. Verifies that the group of children belongs to the health professional.
            const checkGroups: Array<ChildrenGroup> = await healthProfessional.children_groups.filter((obj, pos, arr) => {
                return arr.map(childrenGroup => childrenGroup.id).indexOf(childrenGroupId) === pos
            })

            // 3. The group to be selected does not exist or is not assigned to the health professional.
            //    When the group is assigned the checkGroups array size will be equal to 1.
            if (checkGroups.length !== 1) return Promise.resolve(undefined)
        } catch (err) {
            return Promise.reject(err)
        }

        // 4. The group to be selected exists and is related to the health professional.
        // Then, it can be selected.
        return this._childrenGroupService.getById(childrenGroupId, query)
    }

    public async updateChildrenGroup(healthProfessionalId: string, childrenGroup: ChildrenGroup): Promise<ChildrenGroup> {
        try {
            // 1. Checks if the health professional exists.
            const healthProfessional: HealthProfessional = await this._healthProfessionalRepository.findById(healthProfessionalId)
            if (!healthProfessional) {
                throw new ValidationException(
                    Strings.HEALTH_PROFESSIONAL.NOT_FOUND,
                    Strings.HEALTH_PROFESSIONAL.NOT_FOUND_DESCRIPTION
                )
            }

            // 2. Update children group.
            const childrenGroupResult: ChildrenGroup = await this._childrenGroupService.update(childrenGroup)

            // 3. If everything succeeds, it returns the data of the created group.
            return Promise.resolve(childrenGroupResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async deleteChildrenGroup(healthProfessionalId: string, childrenGroupId: string): Promise<boolean> {
        try {
            // 1. Checks if the health professional exists.
            const healthProfessional: HealthProfessional = await this._healthProfessionalRepository.findById(healthProfessionalId)
            if (!healthProfessional) {
                throw new ValidationException(
                    Strings.EDUCATOR.NOT_FOUND,
                    Strings.EDUCATOR.NOT_FOUND_DESCRIPTION
                )
            }

            // 2. Remove the children group.
            const removeResult: boolean = await this._childrenGroupService.remove(childrenGroupId)

            // 3. Remove association with health professional
            if (removeResult) {
                const childrenGroup: ChildrenGroup = new ChildrenGroup()
                childrenGroup.id = childrenGroupId
                await healthProfessional.removeChildrenGroup(childrenGroup)

                // 4. Update health professional.
                await this._healthProfessionalRepository.update(healthProfessional)
            }

            // 5. Returns true if the operation was successful, otherwise false.
            return Promise.resolve(removeResult)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
