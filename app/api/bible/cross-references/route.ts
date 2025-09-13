
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface CrossReference {
  reference: string
  text: string
  book: string
  chapter: number
  verse: number
  relevanceScore: number
  connectionType: 'direct' | 'thematic' | 'prophetic' | 'typological'
}

// Enhanced theological cross-references with Reformed perspective
const REFORMED_CROSS_REFERENCES: { [key: string]: CrossReference[] } = {
  'Juan 3:16': [
    {
      reference: '1 Juan 4:9-10',
      text: 'En esto se mostró el amor de Dios para con nosotros, en que Dios envió a su Hijo unigénito al mundo, para que vivamos por él. En esto consiste el amor: no en que nosotros hayamos amado a Dios, sino en que él nos amó a nosotros, y envió a su Hijo en propiciación por nuestros pecados.',
      book: '1 Juan',
      chapter: 4,
      verse: 9,
      relevanceScore: 0.98,
      connectionType: 'direct'
    },
    {
      reference: 'Romanos 5:8',
      text: 'Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.',
      book: 'Romanos',
      chapter: 5,
      verse: 8,
      relevanceScore: 0.95,
      connectionType: 'thematic'
    },
    {
      reference: 'Efesios 2:4-5',
      text: 'Pero Dios, que es rico en misericordia, por su gran amor con que nos amó, aun estando nosotros muertos en pecados, nos dio vida juntamente con Cristo (por gracia sois salvos).',
      book: 'Efesios',
      chapter: 2,
      verse: 4,
      relevanceScore: 0.92,
      connectionType: 'thematic'
    },
    {
      reference: 'Isaías 53:6',
      text: 'Todos nosotros nos descarriamos como ovejas, cada cual se apartó por su camino; mas Jehová cargó en él el pecado de todos nosotros.',
      book: 'Isaías',
      chapter: 53,
      verse: 6,
      relevanceScore: 0.90,
      connectionType: 'prophetic'
    },
    {
      reference: 'Juan 1:12',
      text: 'Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios.',
      book: 'Juan',
      chapter: 1,
      verse: 12,
      relevanceScore: 0.88,
      connectionType: 'direct'
    },
    {
      reference: 'Génesis 3:15',
      text: 'Y pondré enemistad entre ti y la mujer, y entre tu simiente y la simiente suya; ésta te herirá en la cabeza, y tú le herirás en el calcañar.',
      book: 'Génesis',
      chapter: 3,
      verse: 15,
      relevanceScore: 0.85,
      connectionType: 'prophetic'
    }
  ],

  'John 3:16': [
    {
      reference: 'Romanos 5:8',
      text: 'Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.',
      book: 'Romanos',
      chapter: 5,
      verse: 8,
      relevanceScore: 0.95,
      connectionType: 'thematic'
    },
    {
      reference: '1 Juan 4:9-10',
      text: 'En esto se mostró el amor de Dios para con nosotros, en que Dios envió a su Hijo unigénito al mundo, para que vivamos por él. En esto consiste el amor: no en que nosotros hayamos amado a Dios, sino en que él nos amó a nosotros, y envió a su Hijo en propiciación por nuestros pecados.',
      book: '1 Juan',
      chapter: 4,
      verse: 9,
      relevanceScore: 0.92,
      connectionType: 'direct'
    },
    {
      reference: 'Juan 1:12',
      text: 'Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios.',
      book: 'Juan',
      chapter: 1,
      verse: 12,
      relevanceScore: 0.88,
      connectionType: 'thematic'
    },
    {
      reference: 'Efesios 2:8-9',
      text: 'Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe.',
      book: 'Efesios',
      chapter: 2,
      verse: 8,
      relevanceScore: 0.85,
      connectionType: 'thematic'
    },
    {
      reference: 'Isaías 53:6',
      text: 'Todos nosotros nos descarriamos como ovejas, cada cual se apartó por su camino; mas Jehová cargó en él el pecado de todos nosotros.',
      book: 'Isaías',
      chapter: 53,
      verse: 6,
      relevanceScore: 0.80,
      connectionType: 'prophetic'
    }
  ],
  'Salmos 23:1': [
    {
      reference: 'Juan 10:11',
      text: 'Yo soy el buen pastor; el buen pastor su vida da por las ovejas.',
      book: 'Juan',
      chapter: 10,
      verse: 11,
      relevanceScore: 0.98,
      connectionType: 'direct'
    },
    {
      reference: 'Ezequiel 34:11-12',
      text: 'Porque así ha dicho Jehová el Señor: He aquí yo, yo mismo buscaré mis ovejas, y las reconoceré. Como reconoce su rebaño el pastor el día que está en medio de sus ovejas esparcidas, así reconoceré mis ovejas.',
      book: 'Ezequiel',
      chapter: 34,
      verse: 11,
      relevanceScore: 0.90,
      connectionType: 'prophetic'
    },
    {
      reference: '1 Pedro 2:25',
      text: 'Porque vosotros erais como ovejas descarriadas, pero ahora habéis vuelto al Pastor y Obispo de vuestras almas.',
      book: '1 Pedro',
      chapter: 2,
      verse: 25,
      relevanceScore: 0.87,
      connectionType: 'thematic'
    },
    {
      reference: 'Filipenses 4:19',
      text: 'Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.',
      book: 'Filipenses',
      chapter: 4,
      verse: 19,
      relevanceScore: 0.82,
      connectionType: 'thematic'
    }
  ],
  'Romanos 8:28': [
    {
      reference: 'Efesios 1:11',
      text: 'En él asimismo tuvimos herencia, habiendo sido predestinados conforme al propósito del que hace todas las cosas según el designio de su voluntad.',
      book: 'Efesios',
      chapter: 1,
      verse: 11,
      relevanceScore: 0.98,
      connectionType: 'direct'
    },
    {
      reference: 'Romanos 8:29-30',
      text: 'Porque a los que antes conoció, también los predestinó para que fuesen hechos conformes a la imagen de su Hijo, para que él sea el primogénito entre muchos hermanos. Y a los que predestinó, a éstos también llamó; y a los que llamó, a éstos también justificó; y a los que justificó, a éstos también glorificó.',
      book: 'Romanos',
      chapter: 8,
      verse: 29,
      relevanceScore: 0.97,
      connectionType: 'direct'
    },
    {
      reference: 'Génesis 50:20',
      text: 'Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien, para hacer lo que vemos hoy, para mantener en vida a mucho pueblo.',
      book: 'Génesis',
      chapter: 50,
      verse: 20,
      relevanceScore: 0.92,
      connectionType: 'typological'
    },
    {
      reference: 'Isaías 55:11',
      text: 'así será mi palabra que sale de mi boca; no volverá a mí vacía, sino que hará lo que yo quiero, y será prosperada en aquello para que la envié.',
      book: 'Isaías',
      chapter: 55,
      verse: 11,
      relevanceScore: 0.88,
      connectionType: 'thematic'
    },
    {
      reference: 'Filipenses 1:6',
      text: 'estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.',
      book: 'Filipenses',
      chapter: 1,
      verse: 6,
      relevanceScore: 0.85,
      connectionType: 'thematic'
    }
  ],

  '1 thessalonians 5:23': [
    {
      reference: '2 Tesalonicenses 2:16-17',
      text: 'Y el mismo Jesucristo Señor nuestro, y Dios nuestro Padre, el cual nos amó y nos dio consolación eterna y buena esperanza por gracia, conforte vuestros corazones, y os confirme en toda buena palabra y obra.',
      book: '2 Tesalonicenses',
      chapter: 2,
      verse: 16,
      relevanceScore: 0.94,
      connectionType: 'direct'
    },
    {
      reference: 'Filipenses 1:6',
      text: 'estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.',
      book: 'Filipenses',
      chapter: 1,
      verse: 6,
      relevanceScore: 0.92,
      connectionType: 'thematic'
    },
    {
      reference: 'Judas 1:24',
      text: 'Y a aquel que es poderoso para guardaros sin caída, y presentaros sin mancha delante de su gloria con gran alegría.',
      book: 'Judas',
      chapter: 1,
      verse: 24,
      relevanceScore: 0.90,
      connectionType: 'thematic'
    },
    {
      reference: 'Hebreos 13:20-21',
      text: 'Y el Dios de paz que resucitó de los muertos a nuestro Señor Jesucristo, el gran pastor de las ovejas, por la sangre del pacto eterno, os haga aptos en toda obra buena para que hagáis su voluntad, haciendo él en vosotros lo que es agradable delante de él por Jesucristo; al cual sea la gloria por los siglos de los siglos. Amén.',
      book: 'Hebreos',
      chapter: 13,
      verse: 20,
      relevanceScore: 0.88,
      connectionType: 'direct'
    }
  ],

  '1 Thessalonians 5:23-24': [
    {
      reference: 'Filipenses 1:6',
      text: 'estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.',
      book: 'Filipenses',
      chapter: 1,
      verse: 6,
      relevanceScore: 0.96,
      connectionType: 'direct'
    },
    {
      reference: '1 Corintios 1:8-9',
      text: 'el cual también os confirmará hasta el fin, para que seáis irreprensibles en el día de nuestro Señor Jesucristo. Fiel es Dios, por el cual fuisteis llamados a la comunión con su Hijo Jesucristo nuestro Señor.',
      book: '1 Corintios',
      chapter: 1,
      verse: 8,
      relevanceScore: 0.95,
      connectionType: 'direct'
    },
    {
      reference: '2 Timoteo 2:13',
      text: 'Si fuéremos infieles, él permanece fiel; El no puede negarse a sí mismo.',
      book: '2 Timoteo',
      chapter: 2,
      verse: 13,
      relevanceScore: 0.92,
      connectionType: 'thematic'
    },
    {
      reference: 'Números 23:19',
      text: 'Dios no es hombre, para que mienta, Ni hijo de hombre para que se arrepienta. El dijo, ¿y no hará? Habló, ¿y no lo ejecutará?',
      book: 'Números',
      chapter: 23,
      verse: 19,
      relevanceScore: 0.90,
      connectionType: 'thematic'
    }
  ],

  'Hebreos 4:6': [
    {
      reference: 'Hebreos 3:18-19',
      text: '¿Y a quiénes juró que no entrarían en su reposo, sino a aquellos que desobedecieron? Y vemos que no pudieron entrar a causa de incredulidad.',
      book: 'Hebreos',
      chapter: 3,
      verse: 18,
      relevanceScore: 0.98,
      connectionType: 'direct'
    },
    {
      reference: 'Hebreos 4:1-2',
      text: 'Temamos, pues, no sea que permaneciendo aún la promesa de entrar en su reposo, alguno de vosotros parezca no haberlo alcanzado. Porque también a nosotros se nos ha anunciado la buena nueva como a ellos; pero no les aprovechó el oír la palabra, por no ir acompañada de fe en los que la oyeron.',
      book: 'Hebreos',
      chapter: 4,
      verse: 1,
      relevanceScore: 0.97,
      connectionType: 'direct'
    },
    {
      reference: 'Números 14:22-23',
      text: 'todos los que vieron mi gloria y mis señales que he hecho en Egipto y en el desierto, y me han tentado ya diez veces, y no han oído mi voz, no verán la tierra de la cual juré a sus padres; no, ninguno de los que me han irritado la verá.',
      book: 'Números',
      chapter: 14,
      verse: 22,
      relevanceScore: 0.94,
      connectionType: 'typological'
    },
    {
      reference: 'Salmos 95:7-11',
      text: 'Porque él es nuestro Dios; nosotros el pueblo de su dehesa, y ovejas de su mano. Si oyereis hoy su voz, no endurezcáis vuestro corazón, como en Meriba, como en el día de Masah en el desierto, donde me tentaron vuestros padres, me probaron, y vieron mis obras. Cuarenta años estuve disgustado con la nación, y dije: Pueblo es que divaga de corazón, y no han conocido mis caminos. Por tanto, juré en mi furor que no entrarían en mi reposo.',
      book: 'Salmos',
      chapter: 95,
      verse: 7,
      relevanceScore: 0.92,
      connectionType: 'prophetic'
    },
    {
      reference: 'Deuteronomio 1:35',
      text: 'No verá hombre alguno de estos, de esta mala generación, la buena tierra que juré que había de dar a vuestros padres,',
      book: 'Deuteronomio',
      chapter: 1,
      verse: 35,
      relevanceScore: 0.88,
      connectionType: 'typological'
    }
  ],

  'Hebrews 4:6': [
    {
      reference: 'Hebrews 3:18-19',
      text: 'And to whom did he swear that they would not enter his rest, but to those who were disobedient? So we see that they were unable to enter because of unbelief.',
      book: 'Hebrews',
      chapter: 3,
      verse: 18,
      relevanceScore: 0.98,
      connectionType: 'direct'
    },
    {
      reference: 'Hebrews 4:1-2',
      text: 'Therefore, while the promise of entering his rest still stands, let us fear lest any of you should seem to have failed to reach it. For good news came to us just as to them, but the message they heard did not benefit them, because they were not united by faith with those who listened.',
      book: 'Hebrews',
      chapter: 4,
      verse: 1,
      relevanceScore: 0.97,
      connectionType: 'direct'
    },
    {
      reference: 'Numbers 14:22-23',
      text: 'none of the men who have seen my glory and my signs that I did in Egypt and in the wilderness, and yet have put me to the test these ten times and have not obeyed my voice, shall see the land that I swore to give to their fathers. And none of those who despised me shall see it.',
      book: 'Numbers',
      chapter: 14,
      verse: 22,
      relevanceScore: 0.94,
      connectionType: 'typological'
    },
    {
      reference: 'Psalm 95:7-11',
      text: 'For he is our God, and we are the people of his pasture, and the sheep of his hand. Today, if you hear his voice, do not harden your hearts, as at Meribah, as on the day at Massah in the wilderness, when your fathers put me to the test and put me to the proof, though they had seen my work. For forty years I loathed that generation and said, "They are a people who go astray in their heart, and they have not known my ways." Therefore I swore in my wrath, "They shall not enter my rest."',
      book: 'Psalms',
      chapter: 95,
      verse: 7,
      relevanceScore: 0.92,
      connectionType: 'prophetic'
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: 'Referencia bíblica es requerida' },
        { status: 400 }
      )
    }

    // Use enhanced theological cross-references 
    // In production, integrate with comprehensive Reformed theology database
    const crossReferences = REFORMED_CROSS_REFERENCES[reference] || []

    // If no cross-references found, provide helpful message instead of irrelevant generic ones
    if (crossReferences.length === 0) {
      return NextResponse.json({
        reference,
        crossReferences: [],
        message: 'Referencias cruzadas específicas no disponibles para este versículo. Use la función de Comparación para estudiar diferentes versiones bíblicas.',
        success: false
      })
    }

    return NextResponse.json({
      reference,
      crossReferences: crossReferences.sort((a, b) => b.relevanceScore - a.relevanceScore),
      success: true
    })

  } catch (error) {
    console.error('Cross-references error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
