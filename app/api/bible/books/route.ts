
/**
 * Bible Books API Endpoint
 * Returns list of all Bible books with metadata
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Complete Bible books data
const BIBLE_BOOKS = [
  // Old Testament
  { id: 'genesis', name: 'Génesis', chapters: 50, testament: 'old', category: 'pentateuco' },
  { id: 'exodus', name: 'Éxodo', chapters: 40, testament: 'old', category: 'pentateuco' },
  { id: 'leviticus', name: 'Levítico', chapters: 27, testament: 'old', category: 'pentateuco' },
  { id: 'numbers', name: 'Números', chapters: 36, testament: 'old', category: 'pentateuco' },
  { id: 'deuteronomy', name: 'Deuteronomio', chapters: 34, testament: 'old', category: 'pentateuco' },
  { id: 'joshua', name: 'Josué', chapters: 24, testament: 'old', category: 'historicos' },
  { id: 'judges', name: 'Jueces', chapters: 21, testament: 'old', category: 'historicos' },
  { id: 'ruth', name: 'Rut', chapters: 4, testament: 'old', category: 'historicos' },
  { id: '1samuel', name: '1 Samuel', chapters: 31, testament: 'old', category: 'historicos' },
  { id: '2samuel', name: '2 Samuel', chapters: 24, testament: 'old', category: 'historicos' },
  { id: '1kings', name: '1 Reyes', chapters: 22, testament: 'old', category: 'historicos' },
  { id: '2kings', name: '2 Reyes', chapters: 25, testament: 'old', category: 'historicos' },
  { id: '1chronicles', name: '1 Crónicas', chapters: 29, testament: 'old', category: 'historicos' },
  { id: '2chronicles', name: '2 Crónicas', chapters: 36, testament: 'old', category: 'historicos' },
  { id: 'ezra', name: 'Esdras', chapters: 10, testament: 'old', category: 'historicos' },
  { id: 'nehemiah', name: 'Nehemías', chapters: 13, testament: 'old', category: 'historicos' },
  { id: 'esther', name: 'Ester', chapters: 10, testament: 'old', category: 'historicos' },
  { id: 'job', name: 'Job', chapters: 42, testament: 'old', category: 'poeticos' },
  { id: 'psalms', name: 'Salmos', chapters: 150, testament: 'old', category: 'poeticos' },
  { id: 'proverbs', name: 'Proverbios', chapters: 31, testament: 'old', category: 'poeticos' },
  { id: 'ecclesiastes', name: 'Eclesiastés', chapters: 12, testament: 'old', category: 'poeticos' },
  { id: 'song', name: 'Cantares', chapters: 8, testament: 'old', category: 'poeticos' },
  { id: 'isaiah', name: 'Isaías', chapters: 66, testament: 'old', category: 'profeticos_mayores' },
  { id: 'jeremiah', name: 'Jeremías', chapters: 52, testament: 'old', category: 'profeticos_mayores' },
  { id: 'lamentations', name: 'Lamentaciones', chapters: 5, testament: 'old', category: 'profeticos_mayores' },
  { id: 'ezekiel', name: 'Ezequiel', chapters: 48, testament: 'old', category: 'profeticos_mayores' },
  { id: 'daniel', name: 'Daniel', chapters: 12, testament: 'old', category: 'profeticos_mayores' },
  { id: 'hosea', name: 'Oseas', chapters: 14, testament: 'old', category: 'profeticos_menores' },
  { id: 'joel', name: 'Joel', chapters: 3, testament: 'old', category: 'profeticos_menores' },
  { id: 'amos', name: 'Amós', chapters: 9, testament: 'old', category: 'profeticos_menores' },
  { id: 'obadiah', name: 'Abdías', chapters: 1, testament: 'old', category: 'profeticos_menores' },
  { id: 'jonah', name: 'Jonás', chapters: 4, testament: 'old', category: 'profeticos_menores' },
  { id: 'micah', name: 'Miqueas', chapters: 7, testament: 'old', category: 'profeticos_menores' },
  { id: 'nahum', name: 'Nahúm', chapters: 3, testament: 'old', category: 'profeticos_menores' },
  { id: 'habakkuk', name: 'Habacuc', chapters: 3, testament: 'old', category: 'profeticos_menores' },
  { id: 'zephaniah', name: 'Sofonías', chapters: 3, testament: 'old', category: 'profeticos_menores' },
  { id: 'haggai', name: 'Hageo', chapters: 2, testament: 'old', category: 'profeticos_menores' },
  { id: 'zechariah', name: 'Zacarías', chapters: 14, testament: 'old', category: 'profeticos_menores' },
  { id: 'malachi', name: 'Malaquías', chapters: 4, testament: 'old', category: 'profeticos_menores' },
  
  // New Testament
  { id: 'matthew', name: 'Mateo', chapters: 28, testament: 'new', category: 'evangelios' },
  { id: 'mark', name: 'Marcos', chapters: 16, testament: 'new', category: 'evangelios' },
  { id: 'luke', name: 'Lucas', chapters: 24, testament: 'new', category: 'evangelios' },
  { id: 'john', name: 'Juan', chapters: 21, testament: 'new', category: 'evangelios' },
  { id: 'acts', name: 'Hechos', chapters: 28, testament: 'new', category: 'historicos' },
  { id: 'romans', name: 'Romanos', chapters: 16, testament: 'new', category: 'paulinas' },
  { id: '1corinthians', name: '1 Corintios', chapters: 16, testament: 'new', category: 'paulinas' },
  { id: '2corinthians', name: '2 Corintios', chapters: 13, testament: 'new', category: 'paulinas' },
  { id: 'galatians', name: 'Gálatas', chapters: 6, testament: 'new', category: 'paulinas' },
  { id: 'ephesians', name: 'Efesios', chapters: 6, testament: 'new', category: 'paulinas' },
  { id: 'philippians', name: 'Filipenses', chapters: 4, testament: 'new', category: 'paulinas' },
  { id: 'colossians', name: 'Colosenses', chapters: 4, testament: 'new', category: 'paulinas' },
  { id: '1thessalonians', name: '1 Tesalonicenses', chapters: 5, testament: 'new', category: 'paulinas' },
  { id: '2thessalonians', name: '2 Tesalonicenses', chapters: 3, testament: 'new', category: 'paulinas' },
  { id: '1timothy', name: '1 Timoteo', chapters: 6, testament: 'new', category: 'paulinas' },
  { id: '2timothy', name: '2 Timoteo', chapters: 4, testament: 'new', category: 'paulinas' },
  { id: 'titus', name: 'Tito', chapters: 3, testament: 'new', category: 'paulinas' },
  { id: 'philemon', name: 'Filemón', chapters: 1, testament: 'new', category: 'paulinas' },
  { id: 'hebrews', name: 'Hebreos', chapters: 13, testament: 'new', category: 'generales' },
  { id: 'james', name: 'Santiago', chapters: 5, testament: 'new', category: 'generales' },
  { id: '1peter', name: '1 Pedro', chapters: 5, testament: 'new', category: 'generales' },
  { id: '2peter', name: '2 Pedro', chapters: 3, testament: 'new', category: 'generales' },
  { id: '1john', name: '1 Juan', chapters: 5, testament: 'new', category: 'generales' },
  { id: '2john', name: '2 Juan', chapters: 1, testament: 'new', category: 'generales' },
  { id: '3john', name: '3 Juan', chapters: 1, testament: 'new', category: 'generales' },
  { id: 'jude', name: 'Judas', chapters: 1, testament: 'new', category: 'generales' },
  { id: 'revelation', name: 'Apocalipsis', chapters: 22, testament: 'new', category: 'profeticos' }
]

export async function GET() {
  try {
    const totalChapters = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0)
    const oldTestamentBooks = BIBLE_BOOKS.filter(book => book.testament === 'old')
    const newTestamentBooks = BIBLE_BOOKS.filter(book => book.testament === 'new')

    return NextResponse.json({
      success: true,
      books: BIBLE_BOOKS,
      metadata: {
        totalBooks: BIBLE_BOOKS.length,
        totalChapters,
        oldTestament: {
          books: oldTestamentBooks.length,
          chapters: oldTestamentBooks.reduce((sum, book) => sum + book.chapters, 0)
        },
        newTestament: {
          books: newTestamentBooks.length,
          chapters: newTestamentBooks.reduce((sum, book) => sum + book.chapters, 0)
        }
      }
    })
  } catch (error) {
    console.error('Error loading Bible books:', error)
    return NextResponse.json({
      success: false,
      books: [],
      error: 'Failed to load Bible books'
    }, { status: 500 })
  }
}
