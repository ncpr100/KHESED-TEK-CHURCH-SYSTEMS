
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Column,
  Row,
} from '@react-email/components'
import * as React from 'react'

interface DigestEmailProps {
  userName?: string
  churchName: string
  notifications: Array<{
    title: string
    message: string
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
    category?: string
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    actionUrl?: string
    actionLabel?: string
    createdAt: string
  }>
  period: 'DAILY' | 'WEEKLY'
  date: string
  baseUrl?: string
}

const notificationColors = {
  INFO: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
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

export function DigestEmail({
  userName = 'Estimado miembro',
  churchName,
  notifications,
  period,
  date,
  baseUrl = 'https://khesed-tek.com',
}: DigestEmailProps) {
  const periodLabel = period === 'DAILY' ? 'diario' : 'semanal'
  const previewText = `Resumen ${periodLabel} de ${churchName} - ${notifications.length} notificaciones`

  // Group notifications by category and priority
  const urgentNotifications = notifications.filter(n => n.priority === 'URGENT')
  const normalNotifications = notifications.filter(n => n.priority !== 'URGENT')

  // Statistics
  const stats = {
    total: notifications.length,
    urgent: urgentNotifications.length,
    byType: {
      INFO: notifications.filter(n => n.type === 'INFO').length,
      SUCCESS: notifications.filter(n => n.type === 'SUCCESS').length,
      WARNING: notifications.filter(n => n.type === 'WARNING').length,
      ERROR: notifications.filter(n => n.type === 'ERROR').length,
    },
    byCategory: {
      events: notifications.filter(n => n.category === 'events').length,
      donations: notifications.filter(n => n.category === 'donations').length,
      communications: notifications.filter(n => n.category === 'communications').length,
      systemUpdates: notifications.filter(n => n.category === 'systemUpdates').length,
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              📊 Resumen {periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)}
            </Heading>
            <Heading style={h2}>
              {churchName}
            </Heading>
            <Text style={subtitle}>
              {date} • {notifications.length} notificaciones
            </Text>
          </Section>

          {/* Statistics Overview */}
          <Section style={statsSection}>
            <Heading style={h3}>Resumen de Actividad</Heading>
            
            <Row style={{ marginBottom: '16px' }}>
              <Column style={statColumn}>
                <div style={{ ...statBox, borderColor: '#3b82f6' }}>
                  <Text style={statNumber}>{stats.total}</Text>
                  <Text style={statLabel}>Total</Text>
                </div>
              </Column>
              <Column style={statColumn}>
                <div style={{ ...statBox, borderColor: '#ef4444' }}>
                  <Text style={statNumber}>{stats.urgent}</Text>
                  <Text style={statLabel}>Urgentes</Text>
                </div>
              </Column>
              <Column style={statColumn}>
                <div style={{ ...statBox, borderColor: '#10b981' }}>
                  <Text style={statNumber}>{stats.byType.SUCCESS}</Text>
                  <Text style={statLabel}>Éxitos</Text>
                </div>
              </Column>
              <Column style={statColumn}>
                <div style={{ ...statBox, borderColor: '#f59e0b' }}>
                  <Text style={statNumber}>{stats.byType.WARNING}</Text>
                  <Text style={statLabel}>Avisos</Text>
                </div>
              </Column>
            </Row>
          </Section>

          {/* Urgent Notifications */}
          {urgentNotifications.length > 0 && (
            <>
              <Section style={urgentSection}>
                <Heading style={h3}>
                  🚨 Notificaciones Urgentes
                </Heading>
                {urgentNotifications.map((notification, index) => (
                  <div key={index} style={notificationCard}>
                    <div style={{ ...notificationHeader, backgroundColor: notificationColors[notification.type] }}>
                      <Text style={notificationTitle}>
                        {notification.type === 'INFO' && '📢'}
                        {notification.type === 'SUCCESS' && '✅'}
                        {notification.type === 'WARNING' && '⚠️'}
                        {notification.type === 'ERROR' && '❌'}
                        {' '}{notification.title}
                      </Text>
                      <Text style={notificationDate}>
                        {formatDate(notification.createdAt)}
                      </Text>
                    </div>
                    <div style={notificationBody}>
                      <Text style={notificationMessage}>
                        {notification.message}
                      </Text>
                      {notification.actionUrl && (
                        <Link href={notification.actionUrl} style={inlineLink}>
                          {notification.actionLabel || 'Ver más'} →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </Section>
              <Hr style={hr} />
            </>
          )}

          {/* Regular Notifications */}
          <Section>
            <Heading style={h3}>
              📋 Todas las Notificaciones
            </Heading>
            
            {normalNotifications.length === 0 && urgentNotifications.length === 0 ? (
              <div style={emptyState}>
                <Text style={emptyStateText}>
                  🎉 ¡Excelente! No tienes notificaciones pendientes en este período.
                </Text>
              </div>
            ) : (
              <div style={notificationsList}>
                {normalNotifications.map((notification, index) => (
                  <div key={index} style={compactNotificationCard}>
                    <Row>
                      <Column style={{ width: '60px' }}>
                        <div style={{ ...priorityBadge, backgroundColor: notificationColors[notification.type] }}>
                          {notification.type === 'INFO' && '📢'}
                          {notification.type === 'SUCCESS' && '✅'}
                          {notification.type === 'WARNING' && '⚠️'}
                          {notification.type === 'ERROR' && '❌'}
                        </div>
                      </Column>
                      <Column>
                        <Text style={compactTitle}>
                          {notification.title}
                        </Text>
                        <Text style={compactMessage}>
                          {notification.message.length > 100 
                            ? notification.message.substring(0, 100) + '...'
                            : notification.message}
                        </Text>
                        <Text style={compactMeta}>
                          {formatDate(notification.createdAt)}
                          {notification.category && ` • ${categoryLabels[notification.category as keyof typeof categoryLabels] || notification.category}`}
                        </Text>
                      </Column>
                      <Column style={{ width: '100px', textAlign: 'right' as const }}>
                        {notification.actionUrl && (
                          <Link href={notification.actionUrl} style={compactLink}>
                            Ver →
                          </Link>
                        )}
                      </Column>
                    </Row>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Quick Actions */}
          <Section style={actionsSection}>
            <Heading style={h3}>Acciones Rápidas</Heading>
            <Row>
              <Column style={{ textAlign: 'center' as const }}>
                <Button href={`${baseUrl}/notifications`} style={primaryButton}>
                  Ver Todas las Notificaciones
                </Button>
              </Column>
              <Column style={{ textAlign: 'center' as const }}>
                <Button href={`${baseUrl}/settings/notifications`} style={secondaryButton}>
                  Configurar Preferencias
                </Button>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Hola {userName},
            </Text>
            <Text style={footerText}>
              Este es tu resumen {periodLabel} de <strong>{churchName}</strong>. 
              Recibes este correo porque tienes habilitados los resúmenes {period === 'DAILY' ? 'diarios' : 'semanales'} 
              en tus preferencias de notificación.
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/settings/notifications`} style={footerLink}>
                Cambiar frecuencia de resumen
              </Link>
              {' • '}
              <Link href={`${baseUrl}/notifications`} style={footerLink}>
                Ver histórico completo
              </Link>
            </Text>
            <Text style={disclaimerText}>
              Sistema de Gestión Kḥesed-tek • Para cambiar estas preferencias, visita tu perfil en la plataforma.
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
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const h2 = {
  color: '#374151',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const h3 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const subtitle = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
}

const statsSection = {
  marginBottom: '32px',
}

const statColumn = {
  width: '25%',
  paddingRight: '8px',
}

const statBox = {
  border: '2px solid',
  borderRadius: '8px',
  padding: '16px 8px',
  textAlign: 'center' as const,
}

const statNumber = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 4px 0',
}

const statLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
  textTransform: 'uppercase' as const,
}

const urgentSection = {
  marginBottom: '32px',
}

const notificationCard = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  marginBottom: '16px',
  overflow: 'hidden',
}

const notificationHeader = {
  padding: '12px 16px',
  color: '#ffffff',
}

const notificationTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
  color: '#ffffff',
}

const notificationDate = {
  fontSize: '12px',
  margin: '0',
  color: 'rgba(255, 255, 255, 0.8)',
}

const notificationBody = {
  padding: '16px',
}

const notificationMessage = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
}

const inlineLink = {
  color: '#3b82f6',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const notificationsList = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden',
}

const compactNotificationCard = {
  padding: '16px',
  borderBottom: '1px solid #f3f4f6',
}

const priorityBadge = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
}

const compactTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 4px 0',
}

const compactMessage = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0 0 4px 0',
  lineHeight: '1.4',
}

const compactMeta = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
}

const compactLink = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'none',
  fontWeight: 'bold',
}

const actionsSection = {
  marginTop: '32px',
  marginBottom: '32px',
}

const primaryButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  margin: '0 8px',
}

const secondaryButton = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  color: '#374151',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 20px',
  margin: '0 8px',
  border: '1px solid #d1d5db',
}

const emptyState = {
  textAlign: 'center' as const,
  padding: '40px 20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
}

const emptyStateText = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
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

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const disclaimerText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '16px 0 0 0',
  textAlign: 'center' as const,
}

export default DigestEmail
