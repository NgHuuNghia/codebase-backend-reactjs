import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'
import {
  Category
} from '../generator/graphql.schema'
import { NAME } from '@environments'

@Entity({
  name: `${NAME}_nodes`,
  orderBy: {
    createdAt: 'ASC'
  }
})
export class Node {
  @Expose()
  @ObjectIdColumn()
  _id: string

  @Expose()
  @Column()
  idParent: string

  @Expose()
  @Column()
  name: string

  @Expose()
  @Column()
  category: Category

  @Expose()
  @Column()
  createdAt: number

  @Expose()
  @Column()
  updatedAt: number

  constructor(node: Partial<Node>) {
    if (node) {
      Object.assign(
        this,
        plainToClass(Node, node, {
          excludeExtraneousValues: true
        })
      )
      this._id = this._id || uuid.v1()
      this.createdAt = this.createdAt || +new Date()
      this.updatedAt = +new Date()
    }
  }
}