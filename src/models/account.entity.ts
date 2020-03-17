import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'

@Entity({
  name: 'accounts',
  orderBy: {
    createdAt: 'ASC'
  }
})
export class Account {
  @Expose()
  @ObjectIdColumn()
  _id: string

  @Expose()
  @Column()
  username: string

  @Expose()
  @Column()
  password: string

  @Expose()
  @Column()
  createdAt: number
  
  @Expose()
  @Column()
  updatedAt: number

  constructor(account: Partial<Account>) {
    if (account) {
      Object.assign(
        this,
        plainToClass(Account, account, {
          excludeExtraneousValues: true
        })
      )
      this._id = this._id || uuid.v1()
      this.createdAt = this.createdAt || +new Date()
      this.updatedAt = +new Date()
    }
  }
}
