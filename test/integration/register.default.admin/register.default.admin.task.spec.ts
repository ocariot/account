// import { expect } from 'chai'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { Container } from 'inversify'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
// import { Default } from '../../../src/utils/default'

const container: Container = DI.getInstance().getContainer()
const registerDefaultAdminTask: IBackgroundTask = container.get(Identifier.REGISTER_DEFAULT_ADMIN_TASK)
// const jwt_private_key_path = process.env.JWT_PRIVATE_KEY_PATH || Default.JWT_PRIVATE_KEY_PATH
// const jwt_public_key_path = process.env.JWT_PUBLIC_KEY_PATH || Default.JWT_PUBLIC_KEY_PATH

describe('REGISTER DEFAULT ADMIN TASK', () => {
    afterEach(async () => {
        await registerDefaultAdminTask.stop()
    })

    describe('CREATE USER ADMIN', () => {
        context('', () => {
            it('', async () => {
                try {
                    await registerDefaultAdminTask.run()
                } catch (err) {
                    console.log(err)
                }
            })
        })

        context('', () => {
            it('', async () => {
                try {
                    await registerDefaultAdminTask.run()
                } catch (err) {
                    console.log(err)
                }
            })
        })
    })
})
