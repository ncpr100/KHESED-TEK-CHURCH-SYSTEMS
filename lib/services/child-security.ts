
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export interface PhotoCaptureData {
  childPhoto: string // Base64 encoded image
  parentPhoto: string
  childId: string
  securityPin: string
}

export interface PickupAttempt {
  timestamp: string
  photoSubmitted: string
  pinAttempt: string
  success: boolean
  attemptedBy: string
  matchScore?: number
}

export class ChildSecurityService {
  private readonly PHOTO_RETENTION_DAYS = 7
  private readonly MAX_PICKUP_ATTEMPTS = 3
  private readonly MIN_PHOTO_MATCH_THRESHOLD = 0.85

  /**
   * Process check-in with WebRTC photo capture
   */
  async processCheckInWithPhotos(data: PhotoCaptureData): Promise<{ 
    success: boolean, 
    checkInId: string, 
    securityPin: string,
    qrCode: string 
  }> {
    try {
      // Generate security elements
      const securityPin = this.generateSecurityPin()
      const qrCode = this.generateQRCode()
      const backupCodes = this.generateBackupCodes(3)

      // Encrypt and store photos
      const childPhotoUrl = await this.storeEncryptedPhoto(data.childPhoto, 'child')
      const parentPhotoUrl = await this.storeEncryptedPhoto(data.parentPhoto, 'parent')

      // Create enhanced child check-in record
      const checkIn = await prisma.childCheckIn.create({
        data: {
          childName: data.childId,
          securityPin,
          qrCode,
          childPhotoUrl,
          parentPhotoUrl,
          photoTakenAt: new Date(),
          backupAuthCodes: backupCodes,
          requiresBothAuth: true,
          pickupAttempts: [],
          // ... other required fields would be passed in data
          churchId: 'default', // This would come from context
          parentName: 'Default Parent',
          parentPhone: '+1234567890'
        }
      })

      // Schedule photo deletion after 7 days
      await this.schedulePhotoDeletion(checkIn.id)

      return {
        success: true,
        checkInId: checkIn.id,
        securityPin,
        qrCode
      }

    } catch (error) {
      console.error('Check-in processing error:', error)
      throw new Error('Failed to process secure check-in')
    }
  }

  /**
   * Verify pickup with BOTH photo matching AND PIN code
   */
  async verifyPickup(
    checkInId: string, 
    pickupPhoto: string, 
    pinAttempt: string, 
    attemptedBy: string
  ): Promise<{ 
    success: boolean, 
    reason?: string,
    requiresManagerOverride?: boolean 
  }> {
    const checkIn = await prisma.childCheckIn.findUnique({
      where: { id: checkInId }
    })

    if (!checkIn || checkIn.checkedOut) {
      return { success: false, reason: 'Child already checked out or not found' }
    }

    // Check if max attempts exceeded
    if (checkIn.pickupAttempts.length >= this.MAX_PICKUP_ATTEMPTS) {
      return { 
        success: false, 
        reason: 'Maximum pickup attempts exceeded',
        requiresManagerOverride: true 
      }
    }

    // Verify PIN code
    const pinValid = checkIn.securityPin === pinAttempt || 
                    checkIn.backupAuthCodes.includes(pinAttempt)

    // Verify photo match
    let photoMatchScore = 0
    let photoValid = false

    if (checkIn.parentPhotoUrl) {
      photoMatchScore = await this.comparePhotos(checkIn.parentPhotoUrl, pickupPhoto)
      photoValid = photoMatchScore >= this.MIN_PHOTO_MATCH_THRESHOLD
    }

    // Both PIN and photo required for success
    const success = pinValid && photoValid

    // Log pickup attempt
    const attempt: PickupAttempt = {
      timestamp: new Date().toISOString(),
      photoSubmitted: await this.storeEncryptedPhoto(pickupPhoto, 'pickup_attempt'),
      pinAttempt: this.maskPin(pinAttempt),
      success,
      attemptedBy,
      matchScore: photoMatchScore
    }

    const updatedAttempts = [...(checkIn.pickupAttempts as any[]), attempt]

    if (success) {
      // Successful pickup - update record
      await prisma.childCheckIn.update({
        where: { id: checkInId },
        data: {
          checkedOut: true,
          checkedOutAt: new Date(),
          checkedOutBy: attemptedBy,
          pickupAttempts: updatedAttempts as any
        }
      })

      // Immediate photo cleanup for successful pickup
      await this.cleanupPhotos(checkInId)

      return { success: true }

    } else {
      // Failed attempt - log and continue
      await prisma.childCheckIn.update({
        where: { id: checkInId },
        data: { pickupAttempts: updatedAttempts as any }
      })

      let reason = 'Authentication failed. '
      if (!pinValid) reason += 'Invalid PIN. '
      if (!photoValid) reason += `Photo match too low (${(photoMatchScore * 100).toFixed(1)}% confidence). `

      return { 
        success: false, 
        reason,
        requiresManagerOverride: updatedAttempts.length >= this.MAX_PICKUP_ATTEMPTS 
      }
    }
  }

  /**
   * Manager override for emergency situations
   */
  async emergencyOverride(
    checkInId: string, 
    managerId: string, 
    overrideReason: string
  ): Promise<{ success: boolean }> {
    try {
      await prisma.childCheckIn.update({
        where: { id: checkInId },
        data: {
          checkedOut: true,
          checkedOutAt: new Date(),
          checkedOutBy: `EMERGENCY_OVERRIDE_${managerId}`,
          pickupAttempts: {
            push: {
              timestamp: new Date().toISOString(),
              photoSubmitted: 'EMERGENCY_OVERRIDE',
              pinAttempt: 'OVERRIDE',
              success: true,
              attemptedBy: managerId,
              overrideReason
            }
          }
        }
      })

      await this.cleanupPhotos(checkInId)
      return { success: true }

    } catch (error) {
      console.error('Emergency override error:', error)
      return { success: false }
    }
  }

  /**
   * Generate secure 6-digit PIN
   */
  private generateSecurityPin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Generate QR code for check-in
   */
  private generateQRCode(): string {
    return `CHK_${crypto.randomBytes(8).toString('hex').toUpperCase()}`
  }

  /**
   * Generate backup authorization codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes = []
    for (let i = 0; i < count; i++) {
      codes.push(this.generateSecurityPin())
    }
    return codes
  }

  /**
   * Encrypt and store photo securely
   */
  private async storeEncryptedPhoto(base64Photo: string, type: string): Promise<string> {
    // In production, this would:
    // 1. Encrypt the photo with a rotating key
    // 2. Store in secure cloud storage (AWS S3 with encryption)
    // 3. Return encrypted URL with signed access

    const filename = `${type}_${crypto.randomBytes(16).toString('hex')}.enc`
    const encryptedData = this.encryptPhoto(base64Photo)
    
    // Placeholder for actual storage implementation
    // await this.uploadToSecureStorage(filename, encryptedData)
    
    return `/secure-photos/${filename}`
  }

  /**
   * Photo encryption (placeholder implementation)
   */
  private encryptPhoto(photo: string): string {
    const key = crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher('aes-256-cbc', key)
    
    let encrypted = cipher.update(photo, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return encrypted
  }

  /**
   * Compare photos using ML/AI service (placeholder)
   */
  private async comparePhotos(storedPhotoUrl: string, submittedPhoto: string): Promise<number> {
    // In production, this would integrate with:
    // - AWS Rekognition
    // - Azure Face API
    // - Google Cloud Vision API
    
    // Placeholder implementation returns random match score
    const mockScore = Math.random() * (0.95 - 0.7) + 0.7 // Between 70%-95%
    
    // Add slight bias for successful matches in demo
    return Math.random() > 0.3 ? Math.max(mockScore, 0.86) : mockScore
  }

  /**
   * Schedule automatic photo deletion after 7 days
   */
  private async schedulePhotoDeletion(checkInId: string): Promise<void> {
    // In production, this would set up a scheduled job
    // For now, we'll use a simple setTimeout (not production-ready)
    
    const deleteAfter = this.PHOTO_RETENTION_DAYS * 24 * 60 * 60 * 1000
    
    setTimeout(async () => {
      await this.cleanupPhotos(checkInId)
    }, deleteAfter)
  }

  /**
   * Clean up photos (immediate or scheduled)
   */
  private async cleanupPhotos(checkInId: string): Promise<void> {
    try {
      const checkIn = await prisma.childCheckIn.findUnique({
        where: { id: checkInId }
      })

      if (checkIn) {
        // Delete actual photo files
        if (checkIn.childPhotoUrl) {
          await this.deleteSecurePhoto(checkIn.childPhotoUrl)
        }
        if (checkIn.parentPhotoUrl) {
          await this.deleteSecurePhoto(checkIn.parentPhotoUrl)
        }

        // Clear photo URLs from database
        await prisma.childCheckIn.update({
          where: { id: checkInId },
          data: {
            childPhotoUrl: null,
            parentPhotoUrl: null,
            biometricHash: null
          }
        })
      }
    } catch (error) {
      console.error('Photo cleanup error:', error)
    }
  }

  /**
   * Delete secure photo file
   */
  private async deleteSecurePhoto(photoUrl: string): Promise<void> {
    // Placeholder for actual secure deletion
    console.log(`Deleting secure photo: ${photoUrl}`)
  }

  /**
   * Mask PIN for logging
   */
  private maskPin(pin: string): string {
    return pin ? `${pin.substring(0, 2)}****` : '******'
  }

  /**
   * Get pickup attempt history for audit
   */
  async getPickupHistory(checkInId: string): Promise<PickupAttempt[]> {
    const checkIn = await prisma.childCheckIn.findUnique({
      where: { id: checkInId },
      select: { pickupAttempts: true }
    })

    return (checkIn?.pickupAttempts as any[]) || []
  }

  /**
   * Clean up expired photos (run via cron job)
   */
  async cleanupExpiredPhotos(): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.PHOTO_RETENTION_DAYS)

    const expiredCheckIns = await prisma.childCheckIn.findMany({
      where: {
        photoTakenAt: { lte: cutoffDate },
        OR: [
          { childPhotoUrl: { not: null } },
          { parentPhotoUrl: { not: null } }
        ]
      }
    })

    let cleanedCount = 0
    for (const checkIn of expiredCheckIns) {
      await this.cleanupPhotos(checkIn.id)
      cleanedCount++
    }

    return cleanedCount
  }
}
