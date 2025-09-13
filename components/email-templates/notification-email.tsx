
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface NotificationEmailProps {
  userName?: string
  churchName: string
  notification: {
    title: string
    message: string
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
    category?: string
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    actionUrl?: string
    actionLabel?: string
    createdAt: string
  }
  baseUrl?: string
}

const notificationColors = {
  INFO: '#3b82f6',      // Blue
  SUCCESS: '#10b981',   // Green
  WARNING: '#f59e0b',   // Yellow
  ERROR: '#ef4444',     // Red
}

const priorityLabels = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const categoryLabels = {
  events: 'Eventos',
  donations: 'Donaciones',
  communications: 'Comunicaciones',
  systemUpdates: 'Sistema',
}

export function NotificationEmail({
  userName = 'Estimado miembro',
  churchName,
  notification,
  baseUrl = 'https://khesed-tek.com',
}: NotificationEmailProps) {
  const previewText = `${notification.title} - ${churchName}`
  const accentColor = notificationColors[notification.type]
  const priorityLabel = priorityLabels[notification.priority]
  const categoryLabel = notification.category 
    ? categoryLabels[notification.category as keyof typeof categoryLabels] || notification.category
    : undefined

  const formattedDate = new Date(notification.createdAt).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              🏛️ {churchName}
            </Heading>
            <Text style={subtitle}>
              Sistema de Gestión Kḥesed-tek
            </Text>
          </Section>

          {/* Priority Alert (for urgent notifications) */}
          {notification.priority === 'URGENT' && (
            <Section style={{ ...alertBox, backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
              <Text style={{ ...alertText, color: '#dc2626' }}>
                🚨 <strong>NOTIFICACIÓN URGENTE</strong>
              </Text>
            </Section>
          )}

          {/* Main Content */}
          <Section style={content}>
            <div style={{ ...badge, backgroundColor: accentColor }}>
              {notification.type === 'INFO' && '📢'}
              {notification.type === 'SUCCESS' && '✅'}
              {notification.type === 'WARNING' && '⚠️'}
              {notification.type === 'ERROR' && '❌'}
              <span style={{ marginLeft: '8px' }}>
                {notification.type}
              </span>
            </div>

            <Heading style={h2}>
              {notification.title}
            </Heading>

            <Text style={message}>
              {notification.message}
            </Text>

            {/* Metadata */}
            <Section style={metadata}>
              <Text style={metadataText}>
                <strong>Fecha:</strong> {formattedDate}
              </Text>
              {categoryLabel && (
                <Text style={metadataText}>
                  <strong>Categoría:</strong> {categoryLabel}
                </Text>
              )}
              <Text style={metadataText}>
                <strong>Prioridad:</strong> {priorityLabel}
              </Text>
            </Section>

            {/* Action Button */}
            {notification.actionUrl && (
              <Section style={buttonContainer}>
                <Button href={notification.actionUrl} style={button}>
                  {notification.actionLabel || 'Ver más detalles'}
                </Button>
              </Section>
            )}
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Hola {userName},
            </Text>
            <Text style={footerText}>
              Has recibido esta notificación de <strong>{churchName}</strong> a través del 
              Sistema de Gestión Kḥesed-tek.
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/settings/notifications`} style={link}>
                Configurar preferencias de notificación
              </Link>
              {' • '}
              <Link href={`${baseUrl}/notifications`} style={link}>
                Ver todas las notificaciones
              </Link>
            </Text>
            <Text style={{ ...footerText, fontSize: '12px', color: '#6b7280' }}>
              Si ya no deseas recibir estas notificaciones, puedes actualizar tus preferencias 
              en tu perfil de usuario.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '20px',
  width: '600px',
  maxWidth: '100%',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid #e5e7eb',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
}

const alertBox = {
  padding: '12px 16px',
  borderRadius: '6px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const alertText = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const content = {
  padding: '0',
}

const badge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 12px',
  borderRadius: '20px',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  marginBottom: '16px',
  textTransform: 'uppercase' as const,
}

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 16px 0',
}

const message = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
}

const metadata = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '6px',
  marginBottom: '24px',
}

const metadataText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
}

const footerText = {
  margin: '0 0 12px 0',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

export default NotificationEmail
