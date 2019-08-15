import { IIntegrationEventHandler } from './integration.event.handler.interface'

export class InstitutionSaveEventHandler implements IIntegrationEventHandler<any> {
    public handle(event: any): void {
        console.log('event received', event)
    }
}
