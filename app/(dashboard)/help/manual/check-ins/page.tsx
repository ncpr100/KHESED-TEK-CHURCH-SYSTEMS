
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Shield, Camera, Users, Zap, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CheckInsManual() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link href="/help/manual/complete">
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Manual
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manual: Sistema de Check-In Seguro</h1>
          <p className="text-muted-foreground">WebRTC, Automatización de Visitantes y Seguridad Infantil</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Visión General del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>El Sistema de Check-In Seguro incluye cuatro funcionalidades principales:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <Badge className="mb-2">Visitantes</Badge>
                <h4 className="font-semibold">Check-In Tradicional</h4>
                <p className="text-sm text-muted-foreground">Registro básico de visitantes con QR codes</p>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50">
                <Badge variant="secondary" className="mb-2">🆕 Automatización</Badge>
                <h4 className="font-semibold">Sistema Inteligente de Visitantes</h4>
                <p className="text-sm text-muted-foreground">Registro avanzado con seguimiento automático y conexión ministerial</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Badge className="mb-2">Niños</Badge>
                <h4 className="font-semibold">Check-In Básico</h4>
                <p className="text-sm text-muted-foreground">Registro tradicional con códigos QR</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <Badge variant="secondary" className="mb-2">🆕 WebRTC</Badge>
                <h4 className="font-semibold">Seguridad Biométrica</h4>
                <p className="text-sm text-muted-foreground">Captura de fotos en tiempo real con verificación dual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Feature: Visitor Automation */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              🆕 Sistema de Automatización Inteligente de Visitantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">¿Qué es nuevo?</h4>
              <p className="text-sm">Sistema avanzado que categoriza automáticamente a los visitantes y activa secuencias de seguimiento personalizadas según su perfil e intereses ministeriales.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Características Principales:</h4>
              
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">Categorización Automática</h5>
                    <p className="text-sm text-muted-foreground">Clasifica visitantes como: Primeira Vez, Recurrente, Interés Ministerial, o Petición de Oración</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">Secuencia de 5 Toques (Primeras Visitas)</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside ml-2">
                      <li>Día 0: Bienvenida inmediata por email</li>
                      <li>Día 2: Video de bienvenida del pastor</li>
                      <li>Día 7: Presentación de ministerios</li>
                      <li>Día 14: Invitación a grupo pequeño</li>
                      <li>Día 30: Solicitud de retroalimentación</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">Conexión Ministerial Automática</h5>
                    <p className="text-sm text-muted-foreground">Conecta automáticamente con líderes ministeriales basado en intereses expresados</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium">Puntuación de Compromiso</h5>
                    <p className="text-sm text-muted-foreground">Sistema de 0-100 puntos que mide el nivel de compromiso del visitante</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-yellow-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Cómo usar la Automatización
              </h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Vaya a <strong>Check-In → Automatización</strong></li>
                <li>Complete el formulario avanzado de visitante</li>
                <li>Seleccione los ministerios de interés</li>
                <li>Incluya peticiones de oración si aplica</li>
                <li>El sistema activará automáticamente las secuencias apropiadas</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* New Feature: Children WebRTC Security */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              🆕 Sistema WebRTC de Seguridad Infantil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">¿Qué es nuevo?</h4>
              <p className="text-sm">Sistema de verificación biométrica que requiere AMBOS: código PIN de 6 dígitos Y verificación fotográfica para recoger a los niños.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Proceso de Check-In Seguro:</h4>
              
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <div className="bg-blue-100 rounded-full p-1 text-xs font-bold text-blue-700 w-6 h-6 flex items-center justify-center">1</div>
                  <div>
                    <h5 className="font-medium">Información del Niño</h5>
                    <p className="text-sm text-muted-foreground">Nombre, edad, alergias, necesidades especiales</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-blue-100 rounded-full p-1 text-xs font-bold text-blue-700 w-6 h-6 flex items-center justify-center">2</div>
                  <div>
                    <h5 className="font-medium">Datos del Padre/Madre</h5>
                    <p className="text-sm text-muted-foreground">Contacto principal y de emergencia</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="bg-green-100 rounded-full p-1 text-xs font-bold text-green-700 w-6 h-6 flex items-center justify-center">3</div>
                  <div>
                    <h5 className="font-medium">Captura de Fotos WebRTC</h5>
                    <p className="text-sm text-muted-foreground">Foto del niño/a + Foto del padre/madre (cámara web en tiempo real)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="bg-green-100 rounded-full p-1 text-xs font-bold text-green-700 w-6 h-6 flex items-center justify-center">4</div>
                  <div>
                    <h5 className="font-medium">Generación de PIN Seguro</h5>
                    <p className="text-sm text-muted-foreground">Código de 6 dígitos + códigos de respaldo de emergencia</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-red-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Proceso de Recogida Segura
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>AMBOS son requeridos para recoger:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>PIN de 6 dígitos (proporcionado en el check-in)</li>
                  <li>Verificación fotográfica en tiempo real</li>
                </ol>
                <p className="text-red-700 font-medium">Si falla cualquiera de los dos, se requiere autorización del supervisor.</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-blue-200">
              <h4 className="font-semibold mb-2">Características de Seguridad:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li><strong>Fotos Cifradas:</strong> Almacenadas con encriptación avanzada</li>
                <li><strong>Auto-eliminación:</strong> Fotos se eliminan automáticamente después de 7 días</li>
                <li><strong>Códigos de Respaldo:</strong> 3 códigos adicionales para emergencias</li>
                <li><strong>Registro de Intentos:</strong> Todas las tentativas se registran con timestamp</li>
                <li><strong>Límite de Intentos:</strong> Máximo 3 intentos fallidos antes de requerir supervisor</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-yellow-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Camera className="h-4 w-4 text-yellow-600" />
                Cómo usar el Sistema WebRTC
              </h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Vaya a <strong>Check-In → Seguridad WebRTC</strong></li>
                <li>Complete la información del niño y padre/madre</li>
                <li>Active la cámara web y capture ambas fotos</li>
                <li>Guarde el PIN de 6 dígitos proporcionado</li>
                <li>Para recoger: Presente el PIN + verificación fotográfica</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Integration with Prayer Wall */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Integración con Muro de Oración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Las peticiones de oración de visitantes se integran automáticamente con el Muro de Oración:</p>
            <div className="space-y-2">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm">Peticiones se crean automáticamente en el sistema</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm">Seguimiento automático después de 7 días</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <p className="text-sm">Conexión con equipos de intercesión</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>🆘 Soporte y Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Para Visitantes (Automatización)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Verificar configuración de ministerios</li>
                  <li>• Revisar plantillas de email</li>
                  <li>• Configurar líderes ministeriales</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Para Niños (WebRTC)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Verificar permisos de cámara</li>
                  <li>• Probar calidad de fotos</li>
                  <li>• Configurar códigos de emergencia</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => window.open('https://wa.me/573003435733', '_blank')}>
                💬 Contactar Soporte WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
