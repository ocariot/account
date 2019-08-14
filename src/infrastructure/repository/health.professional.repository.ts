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
        const itemNew: HealthProfessional = this.mapper.transform(item)
        return new Promise<HealthProfessional>((resolve, reject) => {
            this.healthProfessionalModel.create(itemNew)
                .then((result) => {
                    // Required due to 'populate ()' routine.
                    // If there is no need for 'populate ()', the return will suffice.
                    const query = new Query()
                    query.filters = result._id
                    return resolve(this.findOne(query))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public find(query: IQuery): Promise<Array<HealthProfessional>> {
        const q: any = query.toJSON()
        const populate: any = [
            { path: 'institution', select: {}, match: {} },
            { path: 'children_groups', populate: { path: 'children', populate: { path: 'institution' } } }]

        for (const key in q.filters) {
            if (key.startsWith('institution.')) {
                populate[0].match[key.split('.')[1]] = q.filters[key]
                delete q.filters[key]
            }
        }

        for (const key in q.fields) {
            if (key.startsWith('institution.')) {
                populate[0].select[key.split('.')[1]] = 1
                delete q.fields[key]
            }
        }

        return new Promise<Array<HealthProfessional>>((resolve, reject) => {
            this.healthProfessionalModel.find(q.filters)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .populate(populate)
                .exec()
                .then((result: Array<HealthProfessional>) => resolve(
                    result
                        .filter(item => item.institution)
                        .map(item => this.mapper.transform(item))
                ))
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public findOne(query: IQuery): Promise<HealthProfessional> {
        const q: any = query.toJSON()
        const populate: any = [
            { path: 'institution', select: {}, match: {} },
            { path: 'children_groups', populate: { path: 'children', populate: { path: 'institution' } } }]

        for (const key in q.fields) {
            if (key.startsWith('institution.')) {
                populate[0].select[key.split('.')[1]] = 1
                delete q.fields[key]
            }
        }

        return new Promise<HealthProfessional>((resolve, reject) => {
            this.healthProfessionalModel.findOne(q.filters)
                .populate(populate)
                .exec()
                .then((result: HealthProfessional) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    public update(item: HealthProfessional): Promise<HealthProfessional> {
        const itemUp: any = this.mapper.transform(item)
        const populate: any = [
            { path: 'institution', select: {}, match: {} },
            { path: 'children_groups', populate: { path: 'children', populate: { path: 'institution' } } }]

        return new Promise<HealthProfessional>((resolve, reject) => {
            this.healthProfessionalModel.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .populate(populate)
                .exec()
                .then((result: HealthProfessional) => {
                    if (!result) return resolve(undefined)
                    return resolve(this.mapper.transform(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
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
            super.find(query)
                .then((result: Array<HealthProfessional>) => {
                    if (healthProfessional.id) {
                        if (result.length > 0) return resolve(true)
                        return resolve(false)
                    }
                    for (const healthProfItem of result) {
                        if (healthProfItem.username === healthProfessional.username) return resolve(true)
                    }
                    return resolve(false)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
