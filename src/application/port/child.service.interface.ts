import { IService } from './service.interface'
import { Child } from '../domain/model/child'

/**
 * Child service interface.
 *
 * @extends {IService<Child>}
 */
export interface IChildService extends IService<Child> {
}
