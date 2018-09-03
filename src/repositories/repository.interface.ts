/**
 * Interface Repository
 * 
 * @template T 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export interface IUserRepository<T> {
    save(item: T): Promise<T>
    getAll(params?: Object): Promise<Array<T>>
    getById(id: string, params?: Object): Promise<T>
    update(id: string, item: Object): Promise<T>
    delete(id: string): Promise<boolean>
}

export interface IProfileRepository<T> {
    save(item: T): Promise<T>
    getAll(params?: Object): Promise<Array<T>>
    getById(id: string, params?: Object): Promise<T[]>
    delete(user_id: string, profile_id: string): Promise<boolean>
}