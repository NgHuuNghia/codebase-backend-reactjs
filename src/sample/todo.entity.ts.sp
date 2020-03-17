import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'

import { APP_NAME } from '@environments'

@Entity({
	name:  `${APP_NAME}_todos`,
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Todo {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	title: string

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	createdAt: number
	@Expose()
	@Column()
	updatedAt: number

	constructor(todo: Partial<Todo>) {
		if (todo) {
			Object.assign(
				this,
				plainToClass(Todo, todo, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.isActive = this.isActive !== undefined ? this.isActive : true
			this.createdAt = this.createdAt || +new Date()
			this.updatedAt = +new Date()
		}
	}
}
