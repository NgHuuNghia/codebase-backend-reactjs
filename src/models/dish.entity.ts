import {
	Entity,
	ObjectIdColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert
} from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'

import { NAME } from '../environments'

@Entity({
	name: `${NAME}_dishes`,
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Dish {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	idShop: string

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	createdAt: number

	@Expose()
	@Column()
	updatedAt: number

	constructor(dish: Partial<Dish>) {
		if (dish) {
			Object.assign(
				this,
				plainToClass(Dish, dish, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.name = this.name || ''
			this.isActive = this.isActive !== undefined ? this.isActive : true
			this.createdAt = this.createdAt || +new Date()
			this.updatedAt = +new Date()
		}
	}
}
