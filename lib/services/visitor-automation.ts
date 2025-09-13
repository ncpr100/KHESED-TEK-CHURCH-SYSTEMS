
import { prisma } from '@/lib/prisma'
import { AutomationEngine } from './automation-engine'
import { PrayerAutomation } from './prayer-automation'

export interface VisitorProfile {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  isFirstTime: boolean
  visitorType: string
  ministryInterest: string[]
  ageGroup?: string
  familyStatus?: string
  referredBy?: string
  engagementScore: number
}

export class VisitorAutomationService {
  private automationEngine: AutomationEngine
  private prayerAutomation: PrayerAutomation

  constructor() {
    this.automationEngine = new AutomationEngine()
    this.prayerAutomation = new PrayerAutomation()
  }

  /**
   * Main entry point - triggers appropriate automation based on visitor type
   */
  async triggerVisitorAutomation(checkInId: string): Promise<void> {
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId },
      include: {
        church: true,
        event: true
      }
    })

    if (!checkIn || checkIn.automationTriggered) return

    // Determine visitor type if not set
    const visitorType = this.determineVisitorType(checkIn)
    
    // Update visitor type and trigger automation
    await prisma.checkIn.update({
      where: { id: checkInId },
      data: { 
        visitorType,
        automationTriggered: true
      }
    })

    // Route to appropriate automation sequence
    switch (visitorType) {
      case 'FIRST_TIME':
        await this.triggerFirstTimeVisitorSequence(checkIn)
        break
      case 'RETURN':
        await this.triggerReturnVisitorSequence(checkIn)
        break
      case 'MINISTRY_INTEREST':
        await this.triggerMinistryConnectionSequence(checkIn)
        break
      case 'PRAYER_REQUEST':
        await this.triggerPrayerRequestSequence(checkIn)
        break
    }
  }

  /**
   * 5-Touch First-Time Visitor Welcome Sequence
   */
  private async triggerFirstTimeVisitorSequence(checkIn: any): Promise<void> {
    const touches = [
      { day: 0, type: 'IMMEDIATE_WELCOME', category: 'WELCOME' },
      { day: 2, type: 'PASTOR_WELCOME_VIDEO', category: 'WELCOME' },
      { day: 7, type: 'MINISTRY_OVERVIEW', category: 'MINISTRY_CONNECTION' },
      { day: 14, type: 'SMALL_GROUP_INVITATION', category: 'MINISTRY_CONNECTION' },
      { day: 30, type: 'SERVICE_FEEDBACK_REQUEST', category: 'WELCOME' }
    ]

    for (const touch of touches) {
      await this.scheduleFollowUp({
        checkInId: checkIn.id,
        followUpType: touch.type,
        category: touch.category,
        touchSequence: touches.indexOf(touch) + 1,
        scheduledAt: new Date(Date.now() + (touch.day * 24 * 60 * 60 * 1000)),
        priority: 'HIGH',
        churchId: checkIn.churchId
      })
    }
  }

  /**
   * Return Visitor Engagement Sequence
   */
  private async triggerReturnVisitorSequence(checkIn: any): Promise<void> {
    // Check engagement history and tailor response
    const previousVisits = await prisma.checkIn.count({
      where: {
        email: checkIn.email,
        churchId: checkIn.churchId,
        id: { not: checkIn.id }
      }
    })

    const followUpType = previousVisits > 5 ? 'COMMITTED_VISITOR_OUTREACH' : 'RETURN_VISITOR_ENGAGEMENT'
    
    await this.scheduleFollowUp({
      checkInId: checkIn.id,
      followUpType,
      category: 'MINISTRY_CONNECTION',
      scheduledAt: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days
      priority: 'MEDIUM',
      churchId: checkIn.churchId
    })
  }

  /**
   * Ministry Interest Connection Automation
   */
  private async triggerMinistryConnectionSequence(checkIn: any): Promise<void> {
    if (!checkIn.ministryInterest?.length) return

    for (const ministry of checkIn.ministryInterest) {
      // Match with ministry leaders
      const ministryMatch = await this.findMinistryMatch(ministry, checkIn.churchId)
      
      await this.scheduleFollowUp({
        checkInId: checkIn.id,
        followUpType: 'MINISTRY_LEADER_INTRODUCTION',
        category: 'MINISTRY_CONNECTION',
        ministryMatch,
        scheduledAt: new Date(Date.now() + (24 * 60 * 60 * 1000)), // 1 day
        priority: 'HIGH',
        assignedTo: ministryMatch?.leaderId,
        churchId: checkIn.churchId,
        responseData: { ministryName: ministry }
      })
    }
  }

  /**
   * Prayer Request Integration with Prayer Wall
   */
  private async triggerPrayerRequestSequence(checkIn: any): Promise<void> {
    if (!checkIn.prayerRequest) return

    // Create prayer request in Prayer Wall system
    const prayerRequestId = await this.prayerAutomation.createFromVisitor({
      visitorName: `${checkIn.firstName} ${checkIn.lastName}`,
      email: checkIn.email,
      phone: checkIn.phone,
      request: checkIn.prayerRequest,
      churchId: checkIn.churchId
    })

    await this.scheduleFollowUp({
      checkInId: checkIn.id,
      followUpType: 'PRAYER_REQUEST_FOLLOW_UP',
      category: 'PRAYER',
      scheduledAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 1 week
      priority: 'MEDIUM',
      churchId: checkIn.churchId,
      responseData: { prayerRequestId }
    })
  }

  /**
   * Smart visitor type determination
   */
  private determineVisitorType(checkIn: any): string {
    if (checkIn.prayerRequest) return 'PRAYER_REQUEST'
    if (checkIn.ministryInterest?.length > 0) return 'MINISTRY_INTEREST'
    if (checkIn.isFirstTime) return 'FIRST_TIME'
    return 'RETURN'
  }

  /**
   * Ministry matching algorithm
   */
  private async findMinistryMatch(ministryName: string, churchId: string) {
    // This would integrate with your ministry database
    // For now, return a placeholder structure
    return {
      ministryId: 'ministry-id',
      ministryName,
      leaderId: 'leader-user-id',
      leaderName: 'Ministry Leader',
      leaderEmail: 'leader@church.com'
    }
  }

  /**
   * Enhanced follow-up scheduling
   */
  private async scheduleFollowUp(data: any) {
    return await prisma.visitorFollowUp.create({
      data: {
        checkInId: data.checkInId,
        followUpType: data.followUpType,
        category: data.category || 'WELCOME',
        touchSequence: data.touchSequence,
        priority: data.priority || 'MEDIUM',
        scheduledAt: data.scheduledAt,
        assignedTo: data.assignedTo,
        ministryMatch: data.ministryMatch?.ministryName,
        responseData: data.responseData,
        nextActionDue: data.scheduledAt,
        churchId: data.churchId
      }
    })
  }

  /**
   * Generate follow-up forms with QR codes (leveraging Prayer Wall infrastructure)
   */
  async generateFollowUpForm(checkInId: string, formType: string): Promise<string> {
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: checkInId }
    })

    if (!checkIn) throw new Error('Check-in not found')

    // Create custom form using Prayer Wall form builder
    const formData = {
      title: this.getFormTitle(formType),
      fields: this.getFormFields(formType),
      visitorId: checkInId,
      churchId: checkIn.churchId
    }

    // This would integrate with your existing form builder
    const formUrl = await this.createForm(formData)
    const qrCodeUrl = await this.generateQRCode(formUrl)

    return qrCodeUrl
  }

  private getFormTitle(formType: string): string {
    const titles = {
      'MINISTRY_INTEREST': '¿En qué ministerios te interesaría participar?',
      'SERVICE_FEEDBACK': '¿Cómo fue tu experiencia en el servicio?',
      'SMALL_GROUP_INTEREST': '¿Te gustaría unirte a un grupo pequeño?',
      'VOLUNTEER_INTEREST': '¿Te interesaría servir como voluntario?'
    }
    return titles[formType as keyof typeof titles] || 'Formulario de seguimiento'
  }

  private getFormFields(formType: string): any[] {
    // Return appropriate form fields based on type
    const fieldSets = {
      'MINISTRY_INTEREST': [
        { type: 'checkbox-group', label: 'Ministerios de interés', options: ['Música', 'Niños', 'Jóvenes', 'Adultos Mayores', 'Cocina', 'Seguridad'] },
        { type: 'textarea', label: 'Comentarios adicionales' }
      ],
      'SERVICE_FEEDBACK': [
        { type: 'rating', label: 'Califica el servicio (1-5)' },
        { type: 'textarea', label: '¿Qué te gustó más?' },
        { type: 'textarea', label: '¿Cómo podemos mejorar?' }
      ]
    }
    return fieldSets[formType as keyof typeof fieldSets] || []
  }

  private async createForm(formData: any): Promise<string> {
    // Placeholder - integrate with existing form builder
    return `https://church.com/forms/${formData.visitorId}`
  }

  private async generateQRCode(url: string): Promise<string> {
    // Placeholder - integrate with existing QR generator
    return `https://church.com/qr/${btoa(url)}.png`
  }
}
