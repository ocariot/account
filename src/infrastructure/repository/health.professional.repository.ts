import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { UserType } from '../../application/domain/model/user'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { ILogger } from '../../utils/custom.logger'
import { Identifier } from '../../di/identifiers'
import { Query } from './query/query'
import { HealthProfessional } from '../../application/domain/model/health.professional'
import { HealthProfessionalEntity } from '../entity/health.professional.entity'
import { IHealthProfessionalRepository } from '../../application/port/health.professional.repository.interface'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { IQuery } from '../../application/port/query.interface'

/**
 * Implementation of the Health Professional repository.
 *
 * @implements {IHealthProfessionalRepository}
 */
@injectable()
export class HealthProfessionalRepository extends BaseRepository<HealthProfessional, HealthProfessionalEntity>
    implements IHealthProfessionalRepository {

    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly healthProfessionalModel: any,
        @inject(Identifier.HEALTH_PROFESSIONAL_ENTITY_MAPPER) readonly healthProfessionalMapper:
            IEntityMapper<HealthProfessional, HealthProfessionalEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly logger: ILogger
    ) {
        super(healthProfessionalModel, healthProfessionalMapper, logger)
    }

    public create(item: HealthProfessional): Promise<HealthProfessional> {
        // Encrypt password
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        const itemNew: HealthProfessional = this.healthProfessionalMapper.transform(item)
        return new Promise<HealthProfessional>((resolve, reject) => {
            this.healthProfessionalModel.create(itemNew)
                .then((result) => {
                    // Required due to 'populate ()' routine.
                    // If there is no need for 'populate ()', the return will suffice.
                    const query = new Query()
                    query.filters = { _id: result._id }
                    return resolve(this.findOne(query))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public findAll(query: IQuery): Promise<HealthProfessional[]> {
        query.addFilter({ type: UserType.HEALTH_PROFESSIONAL })
        return super.findAll(query)
    }

    public findOne(query: IQuery): Promise<HealthProfessional> {
        const q: any = query.toJSON()
        const populate: any = { path: 'children_groups', populate: { path: 'children' } }

        return new Promise<HealthProfessional>((resolve, reject) => {
            this.healthProfessionalModel.findOne(q.filters)
                .populate(populate)
                .exec()
                .then((result: HealthProfessional) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.healthProfessionalMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public update(item: HealthProfessional): Promise<HealthProfessional> {
        const itemUp: any = this.healthProfessionalMapper.transform(item)
        const populate: any = { path: 'children_groups', populate: { path: 'children' } }

        return new Promise<HealthProfessional>((resolve, reject) => {
            this.healthProfessionalModel.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .populate(populate)
                .exec()
                .then((result: HealthProfessional) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.healthProfessionalMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public findById(healthProfessionalId: string): Promise<HealthProfessional> {
        const query: Query = new Query()
        query.filters = { _id: healthProfessionalId, type: UserType.HEALTH_PROFESSIONAL }
        return this.findOne(query)
    }

    public checkExist(healthProfessional: HealthProfessional): Promise<boolean> {
        const query: Query = new Query()
        if (healthProfessional.id) query.filters = { _id: healthProfessional.id }

        query.addFilter({ type: UserType.HEALTH_PROFESSIONAL })
        return new Promise<boolean>((resolve, reject) => {
            this.healthProfessionalModel.find(query.filters)
                .exec()
                .then((result: Array<HealthProfessional>) => {
                    if (healthProfessional.id) {
                        if (result.length > 0) return resolve(true)
                        return resolve(false)
                    }
                    return resolve(result.some(value => value.username === healthProfessional.username))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public count(): Promise<number> {
        return super.count(new Query().fromJSON({ filters: { type: UserType.HEALTH_PROFESSIONAL } }))
    }

    public countChildrenGroups(healthProfessionalId: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.findOne(new Query().fromJSON({
                filters: {
                    _id: healthProfessionalId,
                    type: UserType.HEALTH_PROFESSIONAL
                }
            }))
                .then(result => resolve(result && result.children_groups ? result.children_groups.length : 0))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    /**
     * Retrieves the health professionals who have an association with a Child according to child ID.
     *
     * @param childId
     * @return {Promise<Array<HealthProfessional>>}
     * @throws {ValidationException | RepositoryException}
     */
    public findHealthProfsByChildId(childId: string): Promise<Array<HealthProfessional>> {
        const populate: any = { path: 'children_groups', populate: { path: 'children' } }

        return new Promise<Array<HealthProfessional>>((resolve, reject) => {
            // 1. Search all health professionals and populate their groups
            this.healthProfessionalModel.find({ type: UserType.HEALTH_PROFESSIONAL })
                .populate(populate)
                .exec()
                .then((result: Array<HealthProfessional>) => {
                    // 2. Filters health professionals by removing those who have no association with the childId received
                    result = result.filter(hProfItem => {
                        if (hProfItem.children_groups && hProfItem.children_groups.length) {
                            // 2.1. Filter ChildrenGroups
                            hProfItem.children_groups = hProfItem.children_groups.filter(groupItem => {
                                if (groupItem.children && groupItem.children.length) {
                                    // 2.2 Filter each children array of each ChildrenGroup
                                    groupItem.children = groupItem.children.filter(childItem => childItem.id === childId)
                                }

                                return !!(groupItem.children && groupItem.children.length)
                            })
                        }

                        return !!(hProfItem.children_groups && hProfItem.children_groups.length)
                    })

                    // 3. Apply the mapper to each health professional and return the array
                    resolve(result.map(item => this.healthProfessionalMapper.transform(item)))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }
}
