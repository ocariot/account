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

    /**
     * Returns the total of children.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>

    /**
     * Updates a Child's fitbit_status.
     *
     * @param childId - Id of child to be updated.
     * @param fitbitStatus - New fitbit_status to be inserted in Child.
     * @return {Promise<Child>}
     * @throws {ValidationException | RepositoryException}
     */
    updateFitbitStatus(childId: string, fitbitStatus: string): Promise<Child>

    /**
     * Updates a Child's last_sync.
     *
     * @param childId - Id of child to be updated.
     * @param lastSync - New last_sync to be inserted in Child.
     * @return {Promise<Child>}
     * @throws {ValidationException | RepositoryException}
     */
    updateLastSync(childId: string, lastSync: Date): Promise<Child>

    /**
     * Returns the children who had their data synchronized in a range of days (up to N days ago).
     *
     * @param numberOfDays Number of days used to search for children who had their data synchronized in a range of days
     *                     (up to {numberOfDays} ago).
     * @return {Promise<Array<Child>>}
     * @throws {RepositoryException}
     */
    findInactiveChildren(numberOfDays: number): Promise<Array<Child>>

    /**
     * Recovers child data according to the NFC Tag
     *
     * @param tag
     * @return {Promise<Child | undefined>}
     */
    getByNfcTag(tag: string): Promise<Child | undefined>
}
