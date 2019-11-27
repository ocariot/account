import { DIContainer } from '../../../di/di'
import { Identifier } from '../../../di/identifiers'
import { ILogger } from '../../../utils/custom.logger'
import { ValidationException } from '../../domain/exception/validation.exception'
import { IChildRepository } from '../../port/child.repository.interface'
import { Child, FitbitStatus } from '../../domain/model/child'
import { ObjectIdValidator } from '../../domain/validator/object.id.validator'
import { Strings } from '../../../utils/strings'

/**
 * Handler for FitbitAuthErrorEvent operation.
 *
 * @param event
 */
export const fitbitAuthErrorEventHandler = async (event: any) => {
    const childRepository: IChildRepository = DIContainer.get<IChildRepository>(Identifier.CHILD_REPOSITORY)
    const logger: ILogger = DIContainer.get<ILogger>(Identifier.LOGGER)

    try {
        if (typeof event === 'string') event = JSON.parse(event)
        if (!event.fitbit && (!event.fitbit.child_id || !event.fitbit.error)) {
            throw new ValidationException('Event received but could not be handled due to an error in the event format.')
        }
        const childId: string = event.fitbit.child_id
        const errorCode: number = event.fitbit.error.code
        let fitbitStatus: string = ''
        switch (errorCode) {
            case 1011:
                fitbitStatus = FitbitStatus.EXPIRED_TOKEN
                break
            case 1012:
                fitbitStatus = FitbitStatus.INVALID_TOKEN
                break
            case 1021:
                fitbitStatus = FitbitStatus.INVALID_GRANT
                break
            case 1401:
                fitbitStatus = FitbitStatus.INVALID_CLIENT
                break
            case 1429:
                fitbitStatus = FitbitStatus.SYSTEM
                break
            default:
                fitbitStatus = FitbitStatus.NONE
                break
        }

        // 1. Validate child_id
        ObjectIdValidator.validate(childId, Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)

        const childUp: Child = new Child()
        childUp.id = childId
        childUp.fitbit_status = fitbitStatus

        // 2. Try to update the user
        await childRepository.update(childUp)

        // 3. If got here, it's because the action was successful.
        logger.info(`Action for event ${event.event_name} associated with child with ID: ${childId} successfully held!`)
    } catch (err) {
        logger.warn(`An error occurred while attempting `
            .concat(`perform the operation with the ${event.event_name} name event. ${err.message}`)
            .concat(err.description ? ' ' + err.description : ''))
    }
}
