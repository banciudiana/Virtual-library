import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Categorii',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({ name: 'title', title: 'Nume Categorie', type: 'string', validation: Rule => Rule.required() }),
    defineField({ 
      name: 'slug', 
      title: 'Slug', 
      type: 'slug', 
      options: { source: 'title' }, 
      validation: Rule => Rule.required() 
    }),
    defineField({
      name: 'parent',
      title: 'Categorie Părinte',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Lasă gol dacă este o categorie principală (ex: Ficțiune). Alege un părinte dacă este subcategorie (ex: Thriller -> Ficțiune).'
    }),
    defineField({
      name: 'description',
      title: 'Descriere',
      type: 'text',
    }),
  ],
})