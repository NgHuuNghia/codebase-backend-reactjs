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

import { NAME } from '@environments'

@Entity({
	name: `${NAME}_messages`,
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Message {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	content: string

	@Expose()
	@Column()
	idNode: string

	@Expose()
	@Column()
	idUser: string

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	createdAt: number

	@Expose()
	@Column()
	updatedAt: number

	constructor(message: Partial<Message>) {
		if (message) {
			Object.assign(
				this,
				plainToClass(Message, message, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.content = this.content || ''
			this.isActive = this.isActive !== undefined ? this.isActive : true
			this.createdAt = this.createdAt || +new Date()
			this.updatedAt = +new Date()
		}
	}
}
