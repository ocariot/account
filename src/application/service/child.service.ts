import { inject, injectable } from 'inversify'
import { IChildService } from '../port/child.service.interface'
import { Child } from '../domain/model/child'
import { IQuery } from '../port/query.interface'
import { Identifier } from '../../di/identifiers'
import { IChildRepository } from '../port/child.repository.interface'
import { IEventBus } from '../../infrastructure/port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'

/**
 * Implementing activity Service.
 *
 * @implements {IActivityService}
 */
@injectable()
export class ChildService implements IChildService {

    constructor(@inject(Identifier.CHILD_REPOSITORY) private readonly _childRepository: IChildRepository,
                @inject(Identifier.RABBITMQ_EVENT_BUS) readonly eventBus: IEventBus,
                @inject(Identifier.LOGGER) readonly logger: ILogger) {
    }

    public async add(child: Child): Promise<Child> {
        return this._childRepository.create(child)
    }

    public async getAll(query: IQuery): Promise<Array<Child>> {
        return this._childRepository.find(query)
    }

    public async getById(id: string | number, query: IQuery): Promise<Child> {
        query.filters = { _id: id }
        return this._childRepository.findOne(query)
    }

    public async remove(id: string | number): Promise<boolean> {
        return this._childRepository.delete(id)
    }

    public async update(child: Child): Promise<Child> {
        return this._childRepository.update(child)
    }
}
