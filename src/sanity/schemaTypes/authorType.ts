import {UserIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Autori', // Am tradus titlul pentru Studio
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nume Autor',
      type: 'string',
      validation: (Rule) => Rule.required(), // Te ajută să nu uiți numele
    }),
    defineField({
      name: 'slug',
      title: 'Slug (Link Pagina)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Poză Autor',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'shortBio',
      title: 'Biografie Scurtă',
      type: 'text',
      description: 'Apare în listele de autori sau pe cardul cărții.',
    }),
    defineField({
      name: 'fullBio',
      title: 'Biografie Detaliată',
      description: 'Povestea completă a autorului pentru pagina lui dedicată.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
          ],
          lists: [{title: 'Bullet', value: 'bullet'}], // Permitem liste acum
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})