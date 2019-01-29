import { IService } from './service.interface'
import { HealthProfessional } from '../domain/model/health.professional'

/**
 * Health Professional service interface.
 *
 * @extends {IService<HealthProfessional>}
 */
export interface IHealthProfessionalService extends IService<HealthProfessional> {
}
