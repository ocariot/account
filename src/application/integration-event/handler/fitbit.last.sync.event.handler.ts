import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { ValidationException } from '../../domain/exception/validation.exception'

/**
 * Handler for FitbitLastSyncEvent operation.
 *
 * @param event
 */
export const fitbitLastSyncEventHandler = async (event: any) => {
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.lastsync) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }

        logger.info(`Action for event ${event.event_name} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
