import { UserIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const userType = defineType({
  name: 'user',
  title: 'Utilizatori',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({ name: 'name', title: 'Nume Complet', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required().email() }),
    defineField({ name: 'image', title: 'Avatar', type: 'image' }),
    defineField({ 
        name: 'role', 
        title: 'Rol', 
        type: 'string', 
        options: { list: ['customer', 'admin'] },
        initialValue: 'customer'
    }),
    defineField({
      name: 'orders',
      title: 'Comenzi',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'book' }] }] // Simplificat momentan
    }),
  ],
})