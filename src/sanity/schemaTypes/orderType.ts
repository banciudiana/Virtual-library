import { BasketIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const orderType = defineType({
  name: 'order',
  title: 'Comenzi',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({ 
      name: 'orderNumber', 
      title: 'Număr Comandă', 
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ 
      name: 'orderDate', 
      title: 'Data Comenzii', 
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    // CÂMP CRITIC: Backup prin email pentru a găsi comanda în Account
    defineField({ 
      name: 'email', 
      title: 'Email Client', 
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    // Legătura directă cu documentul de User
    defineField({ 
      name: 'user', 
      title: 'Utilizator (Profil)', 
      type: 'reference', 
      to: [{ type: 'user' }] 
    }),
    defineField({ 
      name: 'totalAmount', 
      title: 'Total Plătit (RON)', 
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({ 
      name: 'status', 
      title: 'Status', 
      type: 'string', 
      options: { 
        list: [
          { title: 'Plătit', value: 'Plătit' },
          { title: 'În procesare', value: 'În procesare' },
          { title: 'Livrat', value: 'Livrat' },
          { title: 'Eșuat', value: 'Eșuat' },
        ] 
      },
      initialValue: 'Plătit'
    }),
    defineField({
      name: 'items',
      title: 'Produse Cumpărate',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { 
            name: 'book', 
            title: 'Carte',
            type: 'reference', 
            to: [{ type: 'book' }],
            validation: (Rule) => Rule.required(),
          },
          { name: 'quantity', title: 'Cantitate', type: 'number' },
          { name: 'priceAtPurchase', title: 'Preț la achiziție', type: 'number' },
          { name: 'format', title: 'Format ales', type: 'string' }
        ],
        preview: {
          select: {
            title: 'book.title',
            quantity: 'quantity',
            format: 'format',
          },
          prepare(selection) {
            const { title, quantity, format } = selection;
            return {
              title: title || 'Carte necunoscută',
              subtitle: `${quantity}x | Format: ${format || 'Nespecificat'}`,
            };
          },
        },
      }]
    })
  ],
  preview: {
    select: {
      title: 'orderNumber',
      subtitle: 'email',
      amount: 'totalAmount',
    },
    prepare(selection) {
      const { title, subtitle, amount } = selection;
      return {
        title: `#${title}`,
        subtitle: `${subtitle} — Total: ${amount} RON`,
      };
    },
  },
})