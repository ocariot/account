import { IService } from './service.interface'
import { Child } from '../domain/model/child'

/**
 * Child service interface.
 *
 * @extends {IService<Child>}
 */
export interface IChildService extends IService<Child> {
    /**
     * Returns the total of children.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>
}
