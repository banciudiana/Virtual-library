import { BasketIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const orderType = defineType({
  name: 'order',
  title: 'Comenzi',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({ name: 'orderNumber', title: 'Număr Comandă', type: 'string' }),
    defineField({ name: 'orderDate', title: 'Data Comenzii', type: 'datetime' }),
    defineField({ name: 'totalAmount', title: 'Total Plătit (RON)', type: 'number' }),
    defineField({ 
      name: 'status', 
      title: 'Status', 
      type: 'string', 
      options: { list: ['Plătit', 'În procesare', 'Livrat', 'Eșuat'] },
      initialValue: 'Plătit'
    }),
    defineField({
      name: 'items',
      title: 'Produse Cumpărate',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'book', type: 'reference', to: [{ type: 'book' }] },
          { name: 'quantity', type: 'number' },
          { name: 'priceAtPurchase', title: 'Preț la achiziție', type: 'number' },
          { name: 'format', title: 'Format ales', type: 'string' }
        ]
      }]
    })
  ]
})