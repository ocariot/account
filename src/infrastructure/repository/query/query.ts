import { Pagination } from './pagination'
import { IPagination, IQuery } from '../../../application/port/query.interface'

/**
 * Defines object to be used for queries.
 *
 * @example
 * ```typescript
 * const fields: Array<string> = new Array('name', 'email')
 * const ordination: Map<string, string> = new Map().set('created_at', 'desc') // descending order
 * const pagination: Pagination = new Pagination(1, 10)
 * const filters: object = {
 *      created_at: { $gte: '2018-07-30T00:00:00.000Z' },
 *      email: { $regex: '^lorem', $options: 'i' }
 * }
 *
 * // Creating query instance
 * const query = new Query(fields, ordination, pagination, req.query.filters)
 * ```
 * @implements {IQuery}
 */
export class Query implements IQuery {
    private _fields!: Array<string>
    private _ordination!: Map<string, string>
    private _pagination!: IPagination
    private _filters!: object

    /**
     * Creates an instance of Query.
     *
     * @param fields - Defines the attributes that should be returned.
     * @param ordination - Defines the attributes and how they should be sorted (ascending or descending).
     * @param pagination - Defines maximum page and number of data to be returned.
     * @param filters - Defines rules for filtering, such as filtering by some attribute.
     */
    constructor(fields?: Array<string>, ordination?: Map<string, string>,
                pagination?: IPagination, filters?: object) {
        this.fields = (fields) ? fields : []
        this.ordination = (ordination) ? ordination : new Map().set('created_at', 'desc')
        this.pagination = (pagination) ? pagination : new Pagination()
        this.filters = (filters) ? filters : {}
    }

    get fields(): Array<string> {
        return this._fields
    }

    set fields(value: Array<string>) {
        this._fields = value
    }

    get ordination(): Map<string, string> {
        return this._ordination
    }

    set ordination(value: Map<string, string>) {
        this._ordination = value
    }

    get pagination(): IPagination {
        return this._pagination
    }

    set pagination(value: IPagination) {
        this._pagination = value
    }

    get filters(): object {
        return this._filters
    }

    set filters(value: object) {
        this._filters = value
    }

    public addFilter(filter: object): void {
        if (filter instanceof Object) {
            this._filters = Object.assign(this._filters, filter)
        }
    }

    public fromJSON(json: any): Query {
        if (!json) return this

        if (json.fields) {
            this.fields = Object.keys(json.fields).map((elem) => elem, [])
        }

        if (json.sort || json.ordination) {
            const __ordination: Map<string, string> = new Map()
            Object.keys((json.sort || json.ordination))
                .reduce((prev, elem) => __ordination.set(elem, (json.sort[elem] || json.ordination[elem])), {})
            this.ordination = __ordination
        }

        if (json.pagination) this.pagination = this.pagination.fromJSON(json.pagination)
        if (json.filters) this.filters = json.filters

        return this
    }

    public toJSON(): any {
        return {
            fields: [...this.fields].reduce((obj, value, key) => (obj[value] = 1, obj), {}),
            ordination: [...this.ordination.entries()].reduce((obj, [key, value]) => (obj[key] = value, obj), {}),
            pagination: this.pagination.toJSON(),
            filters: this.filters
        }
    }
}
