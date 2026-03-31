import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {authorType} from './authorType'
import {bookType} from './bookType'
import {userType} from './userType'
import {orderType} from './orderType'
import {saleType} from './saleType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ authorType,bookType, categoryType,userType,orderType,saleType],
}
