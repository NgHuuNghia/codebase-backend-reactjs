import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'
import { DishInfo } from '../generator/graphql.schema'

import { NAME } from '@environments'
@Entity({
	name: `${NAME}_menus`,
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Menu {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	idNode: string

	@Expose()
	@Column()
	idShop: string

	@Expose()
	@Column()
	dishes: DishInfo[]

	@Expose()
	@Column()
	isPublished: boolean

	@Expose()
	@Column()
	isLocked: boolean

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	createdAt: number

	@Expose()
	@Column()
	updatedAt: number

	constructor(menu: Partial<Menu>) {
		if (menu) {
			Object.assign(
				this,
				plainToClass(Menu, menu, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.dishes = this.dishes || []
			this.isPublished = this.isPublished || false
			this.isLocked = this.isLocked || false
			this.isActive = this.isActive || true
			this.createdAt = this.createdAt || +new Date()
			this.updatedAt = +new Date()
		}
	}
}
