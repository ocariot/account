import { expect } from 'chai'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { Container } from 'inversify'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import fs from 'fs'
import { Default } from '../../../src/utils/default'

const container: Container = DI.getInstance().getContainer()
const generateJwtKeysTask: IBackgroundTask = container.get(Identifier.GENERATE_JWT_KEYS_TASK)
const jwt_private_key_path = process.env.JWT_PRIVATE_KEY_PATH || Default.JWT_PRIVATE_KEY_PATH
const jwt_public_key_path = process.env.JWT_PUBLIC_KEY_PATH || Default.JWT_PUBLIC_KEY_PATH

describe('GENERATE JWT KEYS TASK', () => {
    afterEach(async () => {
        try {
            await generateJwtKeysTask.stop()

            // Changes permissions to allow read and write operations on path
            fs.chmodSync(jwt_private_key_path.substring(0, jwt_private_key_path.length - 7), 0o777)
        } catch (err) {
            throw new Error('Failure on GenerateJwtKeysTask test: ' + err.message)
        }
    })

    describe('GENERATE JWT KEY', () => {
        context('when the keys path have write permission', () => {
            it('should return true in the "existsSync" function call on keys paths', async () => {
                try {
                    await generateJwtKeysTask.run()

                    const privateKeyPathExists: boolean = fs.existsSync(jwt_private_key_path)
                    const publicKeyPathExists: boolean = fs.existsSync(jwt_public_key_path)
                    expect(privateKeyPathExists).to.eql(true)
                    expect(publicKeyPathExists).to.eql(true)
                } catch (err) {
                    throw new Error('Failure on GenerateJwtKeysTask test: ' + err.message)
                }
            })
        })

        context('when the keys path does not have write permission', () => {
            it('should throw an exception', async () => {
                try {
                    // Changes permissions for read-only
                    fs.chmodSync(jwt_private_key_path.substring(0, jwt_private_key_path.length - 7), 0o444)

                    await generateJwtKeysTask.run()
                } catch (err) {
                    expect(err.message).to.eql('Error: EACCES: permission denied, open \'.certs/jwt.key\'')
                }
            })
        })
    })
})
