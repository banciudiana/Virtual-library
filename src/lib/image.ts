import createImageUrlBuilder from '@sanity/image-url'

// Folosim datele direct din mediul Sanity deja configurat
const builder = createImageUrlBuilder({ 
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '', 
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production' 
})

export const urlFor = (source: any) => builder.image(source)  