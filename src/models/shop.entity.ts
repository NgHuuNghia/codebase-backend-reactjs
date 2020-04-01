import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'
import { NAME } from '../environments'

@Entity({
	name: `${NAME}_shops`,
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Shop {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	createdAt: number

	@Expose()
	@Column()
	updatedAt: number

	constructor(shop: Partial<Shop>) {
		if (shop) {
			Object.assign(
				this,
				plainToClass(Shop, shop, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.isActive = this.isActive !== undefined ? this.isActive : true
			this.createdAt = this.createdAt || +new Date().valueOf()
			this.updatedAt = +new Date().valueOf()
		}
	}
}
