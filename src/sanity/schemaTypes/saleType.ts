// schemas/sale.ts
import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const saleType = defineType({
  name: 'sale',
  title: 'Campanii Reduceri',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({ 
      name: 'title', 
      title: 'Nume Campanie', 
      type: 'string', 
      description: 'Ex: Reduceri de Paște' 
    }),
    defineField({ 
      name: 'discountValue', 
      title: 'Valoare Reducere (ex: 0.2 pentru 20%)', 
      type: 'number',
      validation: Rule => Rule.min(0).max(1)
    }),
    defineField({
      name: 'appliedBooks',
      title: 'Cărți în Campanie',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'book' }] }]
    }),
    defineField({
      name: 'isActive',
      title: 'Activează Campania',
      type: 'boolean',
      initialValue: false
    }),
  ]
})