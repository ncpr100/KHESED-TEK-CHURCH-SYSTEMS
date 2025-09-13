

import { Metadata } from 'next'
import { QRChildrenCheckInClient } from './_components/qr-children-checkin-client'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { qrcode: string }
}

export const metadata: Metadata = {
  title: 'Check-in de Niños | Kḥesed-tek',
  description: 'Registro de niños via código QR',
}

export default async function QRChildrenCheckInPage({ params }: PageProps) {
  try {
    // Verify QR code exists and get basic info
    const qrInfo = await db.childCheckIn.findUnique({
      where: {
        qrCode: params.qrcode
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true
          }
        }
      }
    })

    // If QR code doesn't exist, allow creation of new check-in
    const churchInfo = qrInfo?.church || null
    const eventInfo = qrInfo?.event || null

    return (
      <QRChildrenCheckInClient 
        qrCode={params.qrcode}
        churchInfo={churchInfo}
        eventInfo={eventInfo}
        existingCheckIn={qrInfo ? {
          id: qrInfo.id,
          childName: qrInfo.childName,
          childAge: qrInfo.childAge,
          parentName: qrInfo.parentName,
          parentPhone: qrInfo.parentPhone,
          parentEmail: qrInfo.parentEmail,
          checkedIn: qrInfo.checkedIn,
          checkedOut: qrInfo.checkedOut
        } : null}
      />
    )
  } catch (error) {
    console.error('Error loading QR check-in page:', error)
    notFound()
  }
}
