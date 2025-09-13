
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface TopicalReference {
  topic: string
  references: {
    reference: string
    text: string
    book: string
    chapter: number
    verse: number
  }[]
  relatedTopics: string[]
}

// Enhanced Reformed theological topical concordance
const REFORMED_TOPICAL_CONCORDANCE: { [key: string]: TopicalReference[] } = {
  'Juan 3:16': [
    {
      topic: 'Amor de Dios',
      references: [
        {
          reference: '1 Juan 4:8',
          text: 'El que no ama, no ha conocido a Dios; porque Dios es amor.',
          book: '1 Juan',
          chapter: 4,
          verse: 8
        },
        {
          reference: 'Jeremías 31:3',
          text: 'Jehová se manifestó a mí hace ya mucho tiempo, diciendo: Con amor eterno te he amado; por tanto, te prolongué mi misericordia.',
          book: 'Jeremías',
          chapter: 31,
          verse: 3
        },
        {
          reference: 'Romanos 5:8',
          text: 'Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.',
          book: 'Romanos',
          chapter: 5,
          verse: 8
        }
      ],
      relatedTopics: ['Gracia', 'Misericordia', 'Salvación', 'Sacrificio de Cristo']
    },
    {
      topic: 'Vida Eterna',
      references: [
        {
          reference: 'Juan 17:3',
          text: 'Y esta es la vida eterna: que te conozcan a ti, el único Dios verdadero, y a Jesucristo, a quien has enviado.',
          book: 'Juan',
          chapter: 17,
          verse: 3
        },
        {
          reference: '1 Juan 5:13',
          text: 'Estas cosas os he escrito a vosotros que creéis en el nombre del Hijo de Dios, para que sepáis que tenéis vida eterna, y para que creáis en el nombre del Hijo de Dios.',
          book: '1 Juan',
          chapter: 5,
          verse: 13
        },
        {
          reference: 'Romanos 6:23',
          text: 'Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro.',
          book: 'Romanos',
          chapter: 6,
          verse: 23
        }
      ],
      relatedTopics: ['Salvación', 'Fe', 'Reino de Dios', 'Resurrección']
    },
    {
      topic: 'Fe y Creencia',
      references: [
        {
          reference: 'Efesios 2:8-9',
          text: 'Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe.',
          book: 'Efesios',
          chapter: 2,
          verse: 8
        },
        {
          reference: 'Hebreos 11:6',
          text: 'Pero sin fe es imposible agradar a Dios; porque es necesario que el que se acerca a Dios crea que le hay, y que es galardonador de los que le buscan.',
          book: 'Hebreos',
          chapter: 11,
          verse: 6
        },
        {
          reference: 'Marcos 16:16',
          text: 'El que creyere y fuere bautizado, será salvo; mas el que no creyere, será condenado.',
          book: 'Marcos',
          chapter: 16,
          verse: 16
        }
      ],
      relatedTopics: ['Salvación', 'Gracia', 'Justificación', 'Arrepentimiento']
    }
  ],
  'Salmos 23:1': [
    {
      topic: 'Dios como Pastor',
      references: [
        {
          reference: 'Juan 10:14',
          text: 'Yo soy el buen pastor; y conozco mis ovejas, y las mías me conocen.',
          book: 'Juan',
          chapter: 10,
          verse: 14
        },
        {
          reference: 'Ezequiel 34:15',
          text: 'Yo apacentaré mis ovejas, y yo les daré aprisco, dice Jehová el Señor.',
          book: 'Ezequiel',
          chapter: 34,
          verse: 15
        },
        {
          reference: '1 Pedro 5:4',
          text: 'Y cuando aparezca el Príncipe de los pastores, vosotros recibiréis la corona incorruptible de gloria.',
          book: '1 Pedro',
          chapter: 5,
          verse: 4
        }
      ],
      relatedTopics: ['Cuidado de Dios', 'Protección Divina', 'Guía de Dios', 'Oveja']
    },
    {
      topic: 'Provisión de Dios',
      references: [
        {
          reference: 'Filipenses 4:19',
          text: 'Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.',
          book: 'Filipenses',
          chapter: 4,
          verse: 19
        },
        {
          reference: 'Mateo 6:26',
          text: 'Mirad las aves del cielo, que no siembran, ni siegan, ni recogen en graneros; y vuestro Padre celestial las alimenta. ¿No valéis vosotros mucho más que ellas?',
          book: 'Mateo',
          chapter: 6,
          verse: 26
        },
        {
          reference: '2 Corintios 9:8',
          text: 'Y poderoso es Dios para hacer que abunde en vosotros toda gracia, a fin de que, teniendo siempre en todas las cosas todo lo suficiente, abundéis para toda buena obra.',
          book: '2 Corintios',
          chapter: 9,
          verse: 8
        }
      ],
      relatedTopics: ['Bendiciones', 'Confianza', 'Necesidades', 'Abundancia']
    }
  ],
  'Romanos 8:28': [
    {
      topic: 'Soberanía de Dios',
      references: [
        {
          reference: 'Isaías 55:8-9',
          text: 'Porque mis pensamientos no son vuestros pensamientos, ni vuestros caminos mis caminos, dijo Jehová. Como son más altos los cielos que la tierra, así son mis caminos más altos que vuestros caminos, y mis pensamientos más que vuestros pensamientos.',
          book: 'Isaías',
          chapter: 55,
          verse: 8
        },
        {
          reference: 'Daniel 4:35',
          text: 'Todos los habitantes de la tierra son considerados como nada; y él hace según su voluntad en el ejército del cielo, y en los habitantes de la tierra, y no hay quien detenga su mano, y le diga: ¿Qué haces?',
          book: 'Daniel',
          chapter: 4,
          verse: 35
        },
        {
          reference: 'Proverbios 19:21',
          text: 'Muchos pensamientos hay en el corazón del hombre; mas el consejo de Jehová permanecerá.',
          book: 'Proverbios',
          chapter: 19,
          verse: 21
        }
      ],
      relatedTopics: ['Propósito de Dios', 'Voluntad Divina', 'Predestinación', 'Plan de Dios']
    },
    {
      topic: 'Confianza en las Pruebas',
      references: [
        {
          reference: '1 Pedro 1:6-7',
          text: 'En lo cual vosotros os alegráis, aunque ahora por un poco de tiempo, si es necesario, tengáis que ser afligidos en diversas pruebas, para que sometida a prueba vuestra fe, mucho más preciosa que el oro, el cual aunque perecedero se prueba con fuego, sea hallada en alabanza, gloria y honra cuando sea manifestado Jesucristo.',
          book: '1 Pedro',
          chapter: 1,
          verse: 6
        },
        {
          reference: 'Santiago 1:2-4',
          text: 'Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas, sabiendo que la prueba de vuestra fe produce paciencia. Mas tenga la paciencia su obra completa, para que seáis perfectos y cabales, sin que os falte cosa alguna.',
          book: 'Santiago',
          chapter: 1,
          verse: 2
        }
      ],
      relatedTopics: ['Pruebas', 'Paciencia', 'Crecimiento Espiritual', 'Perseverancia']
    }
  ],

  '1 thessalonians 5:23': [
    {
      topic: 'Santificación Total',
      references: [
        {
          reference: '2 Tesalonicenses 2:13',
          text: 'Pero nosotros debemos dar siempre gracias a Dios respecto a vosotros, hermanos amados por el Señor, de que Dios os haya escogido desde el principio para salvación, mediante la santificación por el Espíritu y la fe en la verdad.',
          book: '2 Tesalonicenses',
          chapter: 2,
          verse: 13
        },
        {
          reference: '1 Pedro 1:2',
          text: 'elegidos según la presciencia de Dios Padre en santificación del Espíritu, para obedecer y ser rociados con la sangre de Jesucristo: Gracia y paz os sean multiplicadas.',
          book: '1 Pedro',
          chapter: 1,
          verse: 2
        },
        {
          reference: 'Efesios 4:24',
          text: 'y vestíos del nuevo hombre, creado según Dios en la justicia y santidad de la verdad.',
          book: 'Efesios',
          chapter: 4,
          verse: 24
        }
      ],
      relatedTopics: ['Espíritu-Alma-Cuerpo', 'Perfección Cristiana', 'Obra del Espíritu Santo', 'Segunda Venida']
    },
    {
      topic: 'Preservación Divina',
      references: [
        {
          reference: 'Judas 1:24-25',
          text: 'Y a aquel que es poderoso para guardaros sin caída, y presentaros sin mancha delante de su gloria con gran alegría, al único y sabio Dios, nuestro Salvador, sea gloria y majestad, imperio y potencia, ahora y por todos los siglos. Amén.',
          book: 'Judas',
          chapter: 1,
          verse: 24
        },
        {
          reference: '1 Pedro 1:5',
          text: 'que sois guardados por el poder de Dios mediante la fe, para alcanzar la salvación que está preparada para ser manifestada en el tiempo postrero.',
          book: '1 Pedro',
          chapter: 1,
          verse: 5
        },
        {
          reference: 'Juan 10:28-29',
          text: 'y yo les doy vida eterna; y no perecerán jamás, ni nadie las arrebatará de mi mano. Mi Padre que me las dio, es mayor que todos, y nadie las puede arrebatar de la mano de mi Padre.',
          book: 'Juan',
          chapter: 10,
          verse: 28
        }
      ],
      relatedTopics: ['Perseverancia de los Santos', 'Seguridad Eterna', 'Omnipotencia de Dios', 'Fidelidad Divina']
    },
    {
      topic: 'Tricotomía Humana',
      references: [
        {
          reference: 'Hebreos 4:12',
          text: 'Porque la palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos; y penetra hasta partir el alma y el espíritu, las coyunturas y los tuétanos, y discierne los pensamientos y las intenciones del corazón.',
          book: 'Hebreos',
          chapter: 4,
          verse: 12
        },
        {
          reference: '1 Corintios 2:14-15',
          text: 'Pero el hombre natural no percibe las cosas que son del Espíritu de Dios, porque para él son locura, y no las puede entender, porque se han de discernir espiritualmente. En cambio el espiritual juzga todas las cosas; pero él no es juzgado de nadie.',
          book: '1 Corintios',
          chapter: 2,
          verse: 14
        }
      ],
      relatedTopics: ['Antropología Bíblica', 'Naturaleza Humana', 'Espíritu vs Alma', 'Santificación Integral']
    }
  ],

  '1 Thessalonians 5:23-24': [
    {
      topic: 'Fidelidad de Dios',
      references: [
        {
          reference: '2 Timoteo 2:13',
          text: 'Si fuéremos infieles, él permanece fiel; El no puede negarse a sí mismo.',
          book: '2 Timoteo',
          chapter: 2,
          verse: 13
        },
        {
          reference: 'Lamentaciones 3:22-23',
          text: 'Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.',
          book: 'Lamentaciones',
          chapter: 3,
          verse: 22
        },
        {
          reference: '1 Corintios 10:13',
          text: 'No os ha sobrevenido ninguna tentación que no sea humana; pero fiel es Dios, que no os dejará ser tentados más de lo que podéis resistir, sino que dará también juntamente con la tentación la salida, para que podáis soportar.',
          book: '1 Corintios',
          chapter: 10,
          verse: 13
        }
      ],
      relatedTopics: ['Inmutabilidad de Dios', 'Confiabilidad Divina', 'Promesas de Dios', 'Carácter de Dios']
    },
    {
      topic: 'Perseverancia de los Santos',
      references: [
        {
          reference: 'Filipenses 1:6',
          text: 'estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.',
          book: 'Filipenses',
          chapter: 1,
          verse: 6
        },
        {
          reference: 'Romanos 8:30',
          text: 'Y a los que predestinó, a éstos también llamó; y a los que llamó, a éstos también justificó; y a los que justificó, a éstos también glorificó.',
          book: 'Romanos',
          chapter: 8,
          verse: 30
        },
        {
          reference: 'Efesios 1:13-14',
          text: 'En él también vosotros, habiendo oído la palabra de verdad, el evangelio de vuestra salvación, y habiendo creído en él, fuisteis sellados con el Espíritu Santo de la promesa, que es las arras de nuestra herencia hasta la redención de la posesión adquirida, para alabanza de su gloria.',
          book: 'Efesios',
          chapter: 1,
          verse: 13
        }
      ],
      relatedTopics: ['Seguridad Eterna', 'Ordo Salutis', 'Predestinación', 'Sello del Espíritu Santo']
    }
  ],

  'Hebreos 4:6': [
    {
      topic: 'Reposo de Dios',
      references: [
        {
          reference: 'Hebreos 4:1',
          text: 'Temamos, pues, no sea que permaneciendo aún la promesa de entrar en su reposo, alguno de vosotros parezca no haberlo alcanzado.',
          book: 'Hebreos',
          chapter: 4,
          verse: 1
        },
        {
          reference: 'Hebreos 4:9-10',
          text: 'Por tanto, queda un reposo para el pueblo de Dios. Porque el que ha entrado en su reposo, también ha reposado de sus obras, como Dios de las suyas.',
          book: 'Hebreos',
          chapter: 4,
          verse: 9
        },
        {
          reference: 'Mateo 11:28',
          text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.',
          book: 'Mateo',
          chapter: 11,
          verse: 28
        }
      ],
      relatedTopics: ['Descanso Espiritual', 'Paz con Dios', 'Cese de Obras', 'Sabbath Espiritual']
    },
    {
      topic: 'Consecuencias de la Desobediencia',
      references: [
        {
          reference: 'Hebreos 3:18',
          text: '¿Y a quiénes juró que no entrarían en su reposo, sino a aquellos que desobedecieron?',
          book: 'Hebreos',
          chapter: 3,
          verse: 18
        },
        {
          reference: 'Números 14:29',
          text: 'En este desierto caerán vuestros cuerpos; todo el número de los que fueron contados de entre vosotros, de veinte años arriba, los cuales han murmurado contra mí.',
          book: 'Números',
          chapter: 14,
          verse: 29
        },
        {
          reference: '1 Corintios 10:5',
          text: 'Pero de los más de ellos no se agradó Dios; por lo cual quedaron postrados en el desierto.',
          book: '1 Corintios',
          chapter: 10,
          verse: 5
        }
      ],
      relatedTopics: ['Juicio Divino', 'Incredulidad', 'Generación del Desierto', 'Advertencias Bíblicas']
    },
    {
      topic: 'Fe vs Incredulidad',
      references: [
        {
          reference: 'Hebreos 3:19',
          text: 'Y vemos que no pudieron entrar a causa de incredulidad.',
          book: 'Hebreos',
          chapter: 3,
          verse: 19
        },
        {
          reference: 'Hebreos 11:6',
          text: 'Pero sin fe es imposible agradar a Dios; porque es necesario que el que se acerca a Dios crea que le hay, y que es galardonador de los que le buscan.',
          book: 'Hebreos',
          chapter: 11,
          verse: 6
        },
        {
          reference: 'Romanos 4:20',
          text: 'Tampoco dudó, por incredulidad, de la promesa de Dios, sino que se fortaleció en fe, dando gloria a Dios.',
          book: 'Romanos',
          chapter: 4,
          verse: 20
        }
      ],
      relatedTopics: ['Justificación por Fe', 'Dureza de Corazón', 'Confianza en Dios', 'Promesas Divinas']
    }
  ],

  'Hebrews 4:6': [
    {
      topic: 'God\'s Rest',
      references: [
        {
          reference: 'Hebrews 4:1',
          text: 'Therefore, while the promise of entering his rest still stands, let us fear lest any of you should seem to have failed to reach it.',
          book: 'Hebrews',
          chapter: 4,
          verse: 1
        },
        {
          reference: 'Hebrews 4:9-10',
          text: 'So then, there remains a Sabbath rest for the people of God, for whoever has entered God\'s rest has also rested from his works as God did from his.',
          book: 'Hebrews',
          chapter: 4,
          verse: 9
        },
        {
          reference: 'Matthew 11:28',
          text: 'Come to me, all who labor and are heavy laden, and I will give you rest.',
          book: 'Matthew',
          chapter: 11,
          verse: 28
        }
      ],
      relatedTopics: ['Spiritual Rest', 'Peace with God', 'Cessation from Works', 'Sabbath Rest']
    },
    {
      topic: 'Consequences of Disobedience',
      references: [
        {
          reference: 'Hebrews 3:18',
          text: 'And to whom did he swear that they would not enter his rest, but to those who were disobedient?',
          book: 'Hebrews',
          chapter: 3,
          verse: 18
        },
        {
          reference: 'Numbers 14:29',
          text: 'And your dead bodies shall fall in this wilderness, and of all your number, listed in the census from twenty years old and upward, who have grumbled against me,',
          book: 'Numbers',
          chapter: 14,
          verse: 29
        },
        {
          reference: '1 Corinthians 10:5',
          text: 'Nevertheless, with most of them God was not pleased, for they were overthrown in the wilderness.',
          book: '1 Corinthians',
          chapter: 10,
          verse: 5
        }
      ],
      relatedTopics: ['Divine Judgment', 'Unbelief', 'Wilderness Generation', 'Biblical Warnings']
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

    // Use enhanced Reformed theological concordance
    // In production, integrate with comprehensive Reformed systematic theology database
    const topicalReferences = REFORMED_TOPICAL_CONCORDANCE[reference] || []

    // If no topical references found, generate generic ones
    if (topicalReferences.length === 0) {
      const genericTopical: TopicalReference[] = [
        {
          topic: 'Palabra de Dios',
          references: [
            {
              reference: 'Salmos 119:105',
              text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.',
              book: 'Salmos',
              chapter: 119,
              verse: 105
            },
            {
              reference: 'Isaías 55:11',
              text: 'Así será mi palabra que sale de mi boca; no volverá a mí vacía, sino que hará lo que yo quiero, y será prosperada en aquello para que la envié.',
              book: 'Isaías',
              chapter: 55,
              verse: 11
            }
          ],
          relatedTopics: ['Verdad', 'Guía Divina', 'Escrituras', 'Revelación']
        }
      ]
      
      return NextResponse.json({
        reference,
        topicalReferences: genericTopical,
        note: 'Referencias temáticas generales - Base de datos de concordancia en desarrollo'
      })
    }

    return NextResponse.json({
      reference,
      topicalReferences,
      success: true
    })

  } catch (error) {
    console.error('Topical concordance error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
