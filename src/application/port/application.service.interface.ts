import { IService } from './service.interface'
import { Application } from '../domain/model/application'

/**
 * User Application service interface.
 *
 * @extends {IService<Application>}
 */
export interface IApplicationService extends IService<Application> {
}
