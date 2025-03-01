import { Column, DataType, Model, Table } from 'sequelize-typescript'
import { REAL_BIGINT } from '../RealBigInt.js'
import { Optional } from 'sequelize'

interface FAQAttributes {
  id: bigint
  author: bigint
  name: string
  title: string
  content: string
}

interface FAQCreationAttributes extends Optional<FAQAttributes, 'id'> {}

@Table({
  tableName: 'FAQs'
})
export class FAQ extends Model<FAQAttributes, FAQCreationAttributes> {
  @Column({
    type: REAL_BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  declare public id: bigint

  @Column({
    type: REAL_BIGINT
  })
  declare public author: bigint

  @Column({
    type: new DataType.STRING(36)
  })
  declare public name: string

  @Column({
    type: new DataType.STRING(64)
  })
  declare public title: string

  @Column({
    type: new DataType.TEXT('long')
  })
  declare public content: string
}
