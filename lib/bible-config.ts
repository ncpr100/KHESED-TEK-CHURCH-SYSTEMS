
/**
 * Centralized Bible Translation Configuration
 * Manages all Bible version definitions and translations
 * Updated: September 1, 2025
 */

export interface BibleVersion {
  id: string
  name: string
  abbreviation: string
  language: 'es' | 'en'
  apiId?: string // For future API integration
  copyrightInfo?: string
  publishingHouse?: string
  year?: number
}

// Curated Bible versions as per user specifications
export const BIBLE_VERSIONS: BibleVersion[] = [
  // ESPAÑOL (9 versiones)
  { 
    id: 'RVR1960', 
    name: 'Reina Valera 1960', 
    abbreviation: 'RVR60', 
    language: 'es',
    year: 1960,
    publishingHouse: 'Sociedades Bíblicas Unidas'
  },
  { 
    id: 'RVC', 
    name: 'Reina Valera Contemporánea', 
    abbreviation: 'RVC', 
    language: 'es',
    year: 2009,
    publishingHouse: 'Sociedades Bíblicas Unidas'
  },
  { 
    id: 'TLA', 
    name: 'Traducción al Lenguaje Actual', 
    abbreviation: 'TLA', 
    language: 'es',
    year: 2000,
    publishingHouse: 'Sociedades Bíblicas Unidas'
  },
  { 
    id: 'PDT', 
    name: 'Palabra de Dios para Todos', 
    abbreviation: 'PDT', 
    language: 'es',
    year: 2005,
    publishingHouse: 'Bible League International'
  },
  { 
    id: 'NVI', 
    name: 'Nueva Versión Internacional', 
    abbreviation: 'NVI', 
    language: 'es',
    year: 1999,
    publishingHouse: 'Sociedad Bíblica Internacional'
  },
  { 
    id: 'NTV', 
    name: 'Nueva Traducción Viviente', 
    abbreviation: 'NTV', 
    language: 'es',
    year: 2010,
    publishingHouse: 'Tyndale House Publishers'
  },
  { 
    id: 'NBLA', 
    name: 'Nueva Biblia de las Américas', 
    abbreviation: 'NBLA', 
    language: 'es',
    year: 2005,
    publishingHouse: 'The Lockman Foundation'
  },
  { 
    id: 'VBL', 
    name: 'Versión Biblia Libre', 
    abbreviation: 'VBL', 
    language: 'es',
    year: 2018,
    publishingHouse: 'Biblia Libre'
  },
  { 
    id: 'AMP', 
    name: 'Biblia Amplificada', 
    abbreviation: 'AMP', 
    language: 'es',
    year: 1987,
    publishingHouse: 'Editorial Vida'
  },
  
  // ENGLISH (9 versions)
  { 
    id: 'ESV', 
    name: 'English Standard Version', 
    abbreviation: 'ESV', 
    language: 'en',
    year: 2001,
    publishingHouse: 'Crossway'
  },
  { 
    id: 'KJV', 
    name: 'King James Version', 
    abbreviation: 'KJV', 
    language: 'en',
    year: 1611,
    publishingHouse: 'Public Domain'
  },
  { 
    id: 'TPT', 
    name: 'The Passion Translation', 
    abbreviation: 'TPT', 
    language: 'en',
    year: 2017,
    publishingHouse: 'BroadStreet Publishing'
  },
  { 
    id: 'NLT', 
    name: 'New Living Translation', 
    abbreviation: 'NLT', 
    language: 'en',
    year: 1996,
    publishingHouse: 'Tyndale House Publishers'
  },
  { 
    id: 'AMPC', 
    name: 'Amplified Bible, Classic Edition', 
    abbreviation: 'AMPC', 
    language: 'en',
    year: 1987,
    publishingHouse: 'The Lockman Foundation'
  },
  { 
    id: 'GNT', 
    name: 'Good News Translation', 
    abbreviation: 'GNT', 
    language: 'en',
    year: 1976,
    publishingHouse: 'American Bible Society'
  },
  { 
    id: 'MEV', 
    name: 'Modern English Version', 
    abbreviation: 'MEV', 
    language: 'en',
    year: 2014,
    publishingHouse: 'Charisma House'
  },
  { 
    id: 'MSG', 
    name: 'The Message', 
    abbreviation: 'MSG', 
    language: 'en',
    year: 2002,
    publishingHouse: 'NavPress'
  },
  { 
    id: 'MIRROR', 
    name: 'The Mirror Translation', 
    abbreviation: 'MIRROR', 
    language: 'en',
    year: 2012,
    publishingHouse: 'Mirror Word Publishing'
  }
]

// Helper functions for version management
export function getBibleVersions(language?: 'es' | 'en'): BibleVersion[] {
  if (!language) return BIBLE_VERSIONS
  return BIBLE_VERSIONS.filter(version => version.language === language)
}

export function getBibleVersionById(id: string): BibleVersion | undefined {
  return BIBLE_VERSIONS.find(version => version.id === id)
}

export function getBibleVersionNames(): { [key: string]: string } {
  const names: { [key: string]: string } = {}
  BIBLE_VERSIONS.forEach(version => {
    names[version.id] = version.name
  })
  return names
}

export function validateBibleVersionId(id: string): boolean {
  return BIBLE_VERSIONS.some(version => version.id === id)
}

// API Configuration for future integration
export interface BibleAPIConfig {
  provider: 'bible-api' | 'scripture-api' | 'youversion' | 'esv-api'
  apiKey?: string
  baseUrl: string
  rateLimit: number
  supportedVersions: string[]
}

export const BIBLE_API_PROVIDERS: { [key: string]: BibleAPIConfig } = {
  'bible-api': {
    provider: 'bible-api',
    baseUrl: 'https://bible-api.com',
    rateLimit: 100, // requests per hour
    supportedVersions: ['KJV', 'ESV', 'NASB', 'NIV']
  },
  'scripture-api': {
    provider: 'scripture-api',
    baseUrl: 'https://api.scripture.api.bible/v1',
    rateLimit: 500,
    supportedVersions: ['ESV', 'KJV', 'NASB', 'NIV', 'NLT', 'MSG']
  }
}

// Content strategy for sourcing authentic translations
export const CONTENT_STRATEGY = {
  highPriority: ['PDT', 'VBL', 'AMP', 'NLT', 'GNT', 'MEV'], // New versions needing content
  sources: {
    'PDT': 'Bible League International',
    'VBL': 'Biblia Libre Project',
    'AMP': 'Editorial Vida',
    'NLT': 'Tyndale House Publishers',
    'GNT': 'American Bible Society',
    'MEV': 'Charisma House'
  },
  apiPriority: ['ESV', 'KJV', 'NLT', 'MSG'], // Versions with good API availability
  manualContent: ['TPT', 'MIRROR', 'AMP', 'VBL'] // Versions requiring manual content addition
}
