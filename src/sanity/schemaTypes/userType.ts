import { UserIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const userType = defineType({
  name: 'user',
  title: 'Utilizatori',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({ name: 'name', title: 'Nume Complet', type: 'string' }),
    defineField({ 
      name: 'email', 
      title: 'Email', 
      type: 'string', 
      validation: (Rule) => Rule.required().email() 
    }),
    defineField({ name: 'image', title: 'Avatar', type: 'image' }),
    defineField({ 
        name: 'role', 
        title: 'Rol', 
        type: 'string', 
        options: { list: ['customer', 'admin'] },
        initialValue: 'customer'
    }),
    // FAVORITE: Referințe către cărțile preferate
    defineField({
      name: 'favorites',
      title: 'Favorite',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'book' }] }],
      description: 'Lista de cărți salvate la favorite'
    }),
    // COMENZI: Referință către documente de tip 'order' (le creăm mai jos)
    defineField({
      name: 'orders',
      title: 'Istoric Comenzi',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'order' }] }]
    }),
  ],
})