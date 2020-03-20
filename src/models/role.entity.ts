import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'
import { NAME } from '@environments'

@Entity({
  name: `${NAME}_roles`,
  orderBy: {
    createAt: `ASC`
  }
})
export class Role {
  @Expose()
  @ObjectIdColumn()
  _id: string

  @Expose()
  @Column()
  code: string

  @Expose()
  @Column()
  description: string

  @Expose()
  @Column()
  permissions: string[]

  @Expose()
  @Column()
  isActive: boolean

  @Expose()
	@Column()
  createdAt: number

	@Expose()
	@Column()
	updatedAt: number

  constructor(role: Partial<Role>) {
    if (role) {
      Object.assign(
        this,
        plainToClass(Role, role, {
          excludeExtraneousValues: true
        })
      )
      this._id = this._id || uuid.v4()
      this.code = this.code || ''
      this.description = this.description
      this.permissions = this.permissions || []
      this.isActive = this.isActive !== undefined ? this.isActive : true
      this.createdAt = this.createdAt || +new Date()
      this.updatedAt = +new Date()
    }
  }

}
