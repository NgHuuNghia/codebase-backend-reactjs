import {
	Entity,
	ObjectIdColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert
} from 'typeorm'
import { NAME } from '@environments'
import * as uuid from 'uuid'

@Entity({
	name: `${NAME}_permissions`,
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Permission {
	@ObjectIdColumn()
	_id: string

	@Column()
	code: string

	@Column()
	description: string

	@CreateDateColumn()
	createdAt: string
	@UpdateDateColumn()
	updatedAt: string

	@BeforeInsert()
	async b4create() {
		this._id = await uuid.v4()
	}
}
