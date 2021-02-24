import { IService } from './service.interface'
import { Child } from '../domain/model/child'

/**
 * Child service interface.
 *
 * @extends {IService<Child>}
 */
export interface IChildService extends IService<Child> {
    /**
     * Saves the child's NFC tag.
     * The tag must be unique for each user.
     *
     * @param childId
     * @param tag
     * return {Promise<Child>}
     */
    saveNfcTag(childId: string, tag: string): Promise<Child>

    /**
     * Removes the child's NFC tag.
     *
     * @param childId
     * return {Promise<Child>}
     */
    removeNfcTag(childId: string): Promise<boolean>

    /**
     * Recovers child data according to the NFC Tag
     *
     * @param tag
     * @return {Promise<Child | undefined>}
     */
    getByNfcTag(tag: string): Promise<Child | undefined>

    /**
     * Returns the total of children.
     *
     * @return {Promise<number>}
     * @throws {RepositoryException}
     */
    count(): Promise<number>
}
