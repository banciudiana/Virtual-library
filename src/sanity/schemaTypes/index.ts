import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {authorType} from './authorType'
import {bookType} from './bookType'


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [ authorType,bookType, categoryType],
}
