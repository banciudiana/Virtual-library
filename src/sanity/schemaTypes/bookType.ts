import {BookIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const bookType = defineType({
  name: 'book',
  title: 'Cărți',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titlu Carte',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (Link Pagina)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: [{type: 'author'}], // Aici se face legătura cu schema ta de autori
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'price',
      title: 'Preț de Bază (Paperback - RON)', // Acesta va fi X
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
        name: 'categories',
        title: 'Categorii',
        type: 'array', // Permite mai multe selecții
        of: [{ type: 'reference', to: { type: 'category' } }],
        validation: (Rule) => Rule.required().min(1).error('Alege cel puțin o categorie'),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Descriere Scurtă',
      type: 'text',
      description: 'Apare în cardul cărții (max 150 caractere).',
    }),
    defineField({
      name: 'longDescription',
      title: 'Descriere Detaliată',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [{title: 'Bullet', value: 'bullet'}],
        }),
      ],
    }),
    defineField({
      name: 'format',
      title: 'Format Disponibil',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Paperback (Fizică)', value: 'paperback' },
          { title: 'Hardback (Copertă dură)', value: 'hardback' },
          { title: 'Ebook (Digital)', value: 'ebook' },
          { title: 'Audiobook', value: 'audiobook' },
        ],
        layout: 'grid' // Arată mai elegant în Studio
      },
      validation: (Rule) => Rule.required().min(1).error('Selectează cel puțin un format.'),
    }),
    defineField({
      name: 'stock',
      title: 'Stoc (Produse Fizice)',
      type: 'number',
      description: 'Câte exemplare fizice sunt disponibile.',
      // Logica: Ascundem stocul dacă e doar digital
      hidden: ({document}) => {
      const formats = document?.format as string[] | undefined;
      if (!formats) return false;
      // Dacă am selectat DOAR formate digitale, ascundem câmpul de stoc
      const hasPhysical = formats.some(f => f === 'paperback' || f === 'hardback');
      return !hasPhysical;
      },
      validation: (Rule) => Rule.min(0).error('Stocul nu poate fi negativ'),
      initialValue: 0,
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'image',
      title: 'Coperta Cărții',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'Fișier eBook (PDF)',
      type: 'file',
      options: {
        accept: '.pdf',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'author.name', // Afișează numele autorului în listă
      media: 'image',
    },
  },
})