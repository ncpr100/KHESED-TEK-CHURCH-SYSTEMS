
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const { topic, scripture, audience, duration, language } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { message: 'El tema es requerido' },
        { status: 400 }
      )
    }

    // Build the prompt for the AI
    const audienceText = audience ? ` para ${audience}` : ''
    const scriptureText = scripture ? ` basado en ${scripture}` : ''
    const durationText = duration ? ` de ${duration} minutos` : ''
    const languageText = language === 'en' ? 'en inglés' : 'en español'

    const prompt = `Crea un sermón completo basado en TEOLOGÍA DEL PACTO (Covenant Theology)${audienceText}${scriptureText}${durationText} ${languageText} sobre el tema: "${topic}".

MARCO TEOLÓGICO: Teología del Pacto Reformada
- Enfoque en los pactos bíblicos (Obras, Gracia, Redención)
- Perspectiva cristocéntrica en toda exposición
- Aplicación práctica desde la gracia soberana
- Énfasis en la santificación progresiva

El sermón debe incluir:

1. INTRODUCCIÓN (2-3 párrafos)
   - Una historia, ilustración o pregunta que capture la atención
   - Conexión con la vida cotidiana desde una perspectiva reformada
   - Presentación clara del tema principal dentro del pacto de gracia

2. CONTEXTO BÍBLICO Y PACTUAL (2-3 párrafos)
   - Trasfondo histórico y cultural del pasaje${scriptureText ? ` (${scripture})` : ''}
   - Ubicación dentro del desarrollo del pacto de gracia
   - Conexión cristológica del texto
   - Explicación del significado original y su cumplimiento en Cristo

3. PUNTOS PRINCIPALES (3 puntos principales desde perspectiva reformada)
   - Cada punto debe tener:
     * Un título claro y memorable
     * Explicación bíblica (2-3 párrafos)
     * Aplicación práctica para la vida diaria
     * Una ilustración o ejemplo contemporáneo

4. CONCLUSIÓN REFORMADA (2-3 párrafos)
   - Resumen de los puntos principales dentro del marco del pacto
   - Exaltación de la gracia soberana de Dios
   - Llamado a la fe y obediencia en Cristo
   - Aplicación práctica de la santificación
   - Oración pastoral final

5. ESQUEMA ESTRUCTURAL
   - Proporciona un esquema breve al final con:
     * Tema central
     * Texto principal
     * 3 puntos principales (títulos solamente)
     * Aplicación clave

FORMATO: Escribe el sermón en formato de prosa reformada, con párrafos bien estructurados. Usa un lenguaje bíblicamente fiel, doctrinalmente sólido pero pastoralmente cálido. Incluye referencias bíblicas abundantes, especialmente conexiones cristológicas. Asegúrate de que sea aplicable a la vida cristiana moderna desde una perspectiva pactual.

ÉNFASIS TEOLÓGICO: 
- Sola Scriptura, Sola Gratia, Sola Fide, Solus Christus, Soli Deo Gloria
- Enfoque en la gloria de Dios en la salvación
- Equilibrio entre doctrina y aplicación práctica

DURACIÓN: El sermón debe ser apropiado para${durationText} de predicación.

Por favor, crea el sermón completo siguiendo esta estructura reformada:`

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        stream: false,
        max_tokens: 3000,
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('API Error:', errorData)
      throw new Error(`Error en la API de LLM: ${response.status}`)
    }

    const data = await response.json()
    const generatedContent = data.choices?.[0]?.message?.content || 'No se pudo generar el contenido'

    return NextResponse.json({
      content: generatedContent,
      usage: data.usage
    })

  } catch (error) {
    console.error('Error generating sermon:', error)
    return NextResponse.json(
      { message: 'Error generando el sermón' },
      { status: 500 }
    )
  }
}
