/**
 * Interface Repository
 * 
 * @template T 
 * @author Douglas Rafael <douglas.rafael@nutes.uepb.edu.br>
 */
export interface IUserRepository<T> {
    save(item: T): Promise<T>
    getAll(query?: Object): Promise<Array<T>>
    getById(query?: Object): Promise<T>
    update(id: string, item: Object): Promise<T>
    delete(id: string): Promise<boolean>
}
