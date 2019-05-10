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
     * If the object to be verified has id, it will be considered
     * as character in the verification, otherwise the username will be used.
     *
     * For validation with a Array <Child>, ValidationException can be
     * triggered with IDs that do not have a record.
     * For simple object checking (Child) it is returned true or false.
     *
     * @param child
     * @return {Promise<boolean>} True if it exists or False, otherwise
     * @throws {ValidationException | RepositoryException}
     */
    checkExist(child: Child | Array<Child>): Promise<boolean | ValidationException>
}
