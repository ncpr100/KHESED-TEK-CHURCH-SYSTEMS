
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const spiritualGifts = [
  // Leadership Gifts
  { name: 'Liderazgo', category: 'Liderazgo', description: 'Capacidad divina para guiar, dirigir y organizar a otros hacia objetivos espirituales.' },
  { name: 'Administración', category: 'Liderazgo', description: 'Don para organizar recursos y coordinar ministerios de manera efectiva.' },
  { name: 'Pastor', category: 'Liderazgo', description: 'Corazón para cuidar, proteger y nutrir espiritualmente a otros creyentes.' },
  
  // Teaching & Communication Gifts
  { name: 'Enseñanza', category: 'Comunicación', description: 'Habilidad especial para explicar y transmitir verdades bíblicas de forma clara.' },
  { name: 'Predicación', category: 'Comunicación', description: 'Capacidad para proclamar la Palabra de Dios con autoridad y claridad.' },
  { name: 'Evangelismo', category: 'Comunicación', description: 'Pasión y habilidad especial para compartir el evangelio con los no creyentes.' },
  { name: 'Profecía', category: 'Comunicación', description: 'Don para hablar la palabra de Dios de manera directa y oportuna.' },
  
  // Service Gifts
  { name: 'Servicio', category: 'Servicio', description: 'Corazón para ayudar y servir a otros de manera práctica y desinteresada.' },
  { name: 'Ayuda', category: 'Servicio', description: 'Capacidad para asistir y apoyar a otros en sus necesidades y ministerios.' },
  { name: 'Hospitalidad', category: 'Servicio', description: 'Don para recibir y atender a otros con calidez y generosidad.' },
  { name: 'Misericordia', category: 'Servicio', description: 'Compasión especial para ministrar a los que sufren y están en necesidad.' },
  
  // Artistic & Creative Gifts
  { name: 'Música', category: 'Artístico', description: 'Talento musical para alabar a Dios y ministrar a través de la música.' },
  { name: 'Arte y Creatividad', category: 'Artístico', description: 'Habilidades creativas para expresar la gloria de Dios a través del arte.' },
  { name: 'Danza', category: 'Artístico', description: 'Capacidad para adorar y ministrar a través del movimiento y la danza.' },
  
  // Spiritual Gifts
  { name: 'Intercesión', category: 'Espiritual', description: 'Don especial para orar efectivamente por otros y sus necesidades.' },
  { name: 'Discernimiento', category: 'Espiritual', description: 'Capacidad para distinguir entre la verdad y el error espiritual.' },
  { name: 'Fe', category: 'Espiritual', description: 'Confianza extraordinaria en Dios para cosas grandes y específicas.' },
  { name: 'Sanidad', category: 'Espiritual', description: 'Don para ser instrumento de Dios en la restauración física y emocional.' },
  
  // Relational Gifts
  { name: 'Consejería', category: 'Relacional', description: 'Sabiduría especial para guiar a otros en decisiones y problemas de vida.' },
  { name: 'Mentoreo', category: 'Relacional', description: 'Capacidad para discipular y formar espiritualmente a otros creyentes.' },
  { name: 'Motivación', category: 'Relacional', description: 'Don para animar e inspirar a otros hacia el crecimiento espiritual.' },
  
  // Technical & Modern Gifts
  { name: 'Tecnología', category: 'Técnico', description: 'Habilidades técnicas aplicadas al servicio del reino de Dios.' },
  { name: 'Comunicación Digital', category: 'Técnico', description: 'Capacidad para usar medios digitales para expandir el evangelio.' },
  { name: 'Medios Audiovisuales', category: 'Técnico', description: 'Talento para producir contenido multimedia para el ministerio.' },
  
  // Ministry-Specific Gifts
  { name: 'Trabajo con Niños', category: 'Ministerial', description: 'Corazón especial y habilidad para ministrar a los niños.' },
  { name: 'Trabajo Juvenil', category: 'Ministerial', description: 'Pasión y capacidad para conectar y ministrar a los jóvenes.' },
  { name: 'Adultos Mayores', category: 'Ministerial', description: 'Don para ministrar y acompañar a la población de adultos mayores.' },
  { name: 'Matrimonios y Familias', category: 'Ministerial', description: 'Sabiduría especial para fortalecer relaciones matrimoniales y familiares.' },
]

async function seedSpiritualGifts() {
  console.log('🌱 Seeding spiritual gifts...')
  
  for (const gift of spiritualGifts) {
    await prisma.spiritualGift.upsert({
      where: { name: gift.name },
      update: {
        category: gift.category,
        description: gift.description,
      },
      create: {
        name: gift.name,
        category: gift.category,
        description: gift.description,
      },
    })
  }
  
  console.log(`✅ Successfully seeded ${spiritualGifts.length} spiritual gifts`)
}

if (require.main === module) {
  seedSpiritualGifts()
    .catch((e) => {
      console.error('❌ Error seeding spiritual gifts:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedSpiritualGifts }
