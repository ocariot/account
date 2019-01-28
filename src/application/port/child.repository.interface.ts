import { IRepository } from './repository.interface'
import { Child } from '../domain/model/child'
import { ValidationException } from '../domain/exception/validation.exception'

/**
 * Interface of the child repository.
 * Must be implemented by the user repository at the infrastructure layer.
 *
 * @see {@link ChildRepository} for further information.
 * @extends {IRepository<User>}
 */
export interface IChildRepository extends IRepository<Child> {
    /**
     * Checks if an child already has a registration.
     * What differs from one child to another is the username.
     *
     * @param child
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(child: Child | Array<Child>): Promise<boolean | ValidationException>
}
