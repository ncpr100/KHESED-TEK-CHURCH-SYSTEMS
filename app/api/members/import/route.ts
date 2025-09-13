

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

interface ImportRow {
  [key: string]: any
}

interface ImportResult {
  success: boolean
  imported: number
  updated: number
  failed: number
  errors: Array<{
    row: number
    field: string
    value: any
    error: string
  }>
}

// Standard field mappings from common church systems
const COMMON_FIELD_MAPPINGS: Record<string, string> = {
  // Names
  'first name': 'firstName',
  'firstname': 'firstName',
  'first_name': 'firstName',
  'last name': 'lastName', 
  'lastname': 'lastName',
  'last_name': 'lastName',
  'name': 'firstName', // Will need parsing
  'full name': 'firstName', // Will need parsing
  
  // Contact
  'email': 'email',
  'email address': 'email',
  'e-mail': 'email',
  'phone': 'phone',
  'phone number': 'phone',
  'mobile': 'phone',
  'cell': 'phone',
  'telephone': 'phone',
  
  // Address
  'address': 'address',
  'street address': 'address',
  'street': 'address',
  'city': 'city',
  'state': 'state',
  'zip': 'zipCode',
  'zip code': 'zipCode',
  'zipcode': 'zipCode',
  'postal code': 'zipCode',
  
  // Personal
  'birth date': 'birthDate',
  'birthdate': 'birthDate',
  'date of birth': 'birthDate',
  'dob': 'birthDate',
  'gender': 'gender',
  'sex': 'gender',
  'marital status': 'maritalStatus',
  'occupation': 'occupation',
  'job': 'occupation',
  
  // Church specific
  'membership date': 'membershipDate',
  'join date': 'membershipDate',
  'baptism date': 'baptismDate',
  'baptized': 'baptismDate',
  'notes': 'notes',
  'comments': 'notes',
}

function parseFullName(fullName: string): { firstName: string, lastName: string } {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  }
}

function normalizeFieldName(fieldName: string): string {
  return fieldName.toLowerCase().trim()
}

function mapFields(row: ImportRow): any {
  const mappedRow: any = {}
  
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined || value === '') continue
    
    const normalizedKey = normalizeFieldName(key)
    const mappedField = COMMON_FIELD_MAPPINGS[normalizedKey] || normalizedKey
    
    // Handle special cases
    if (mappedField === 'firstName' && key.toLowerCase().includes('full') || key.toLowerCase() === 'name') {
      const { firstName, lastName } = parseFullName(String(value))
      mappedRow.firstName = firstName
      if (lastName) mappedRow.lastName = lastName
    } else if (mappedField === 'birthDate' || mappedField === 'baptismDate' || mappedField === 'membershipDate') {
      // Handle date parsing
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          mappedRow[mappedField] = date.toISOString()
        }
      } catch (e) {
        // Invalid date, skip
      }
    } else if (mappedField === 'gender') {
      // Normalize gender values
      const genderValue = String(value).toLowerCase()
      if (genderValue.startsWith('m') || genderValue.startsWith('h')) {
        mappedRow[mappedField] = 'Masculino'
      } else if (genderValue.startsWith('f') || genderValue.startsWith('w')) {
        mappedRow[mappedField] = 'Femenino'
      }
    } else {
      mappedRow[mappedField] = value
    }
  }
  
  return mappedRow
}

function validateMemberData(data: any): string[] {
  const errors: string[] = []
  
  if (!data.firstName) {
    errors.push('Nombre es requerido')
  }
  
  if (!data.lastName) {
    errors.push('Apellido es requerido')
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email inválido')
  }
  
  if (data.phone && !/^[\d\s\-\+\(\)\.]+$/.test(data.phone)) {
    errors.push('Teléfono inválido')
  }
  
  return errors
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos para importar' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const updateExisting = formData.get('updateExisting') === 'true'

    if (!file) {
      return NextResponse.json({ message: 'No se recibió archivo' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        message: 'Tipo de archivo no soportado. Use Excel (.xlsx, .xls) o CSV (.csv)' 
      }, { status: 400 })
    }

    // Validate file size (max 10MB for data files)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        message: 'El archivo debe ser menor a 10MB' 
      }, { status: 400 })
    }

    // Parse file
    const buffer = Buffer.from(await file.arrayBuffer())
    let workbook: XLSX.WorkBook

    try {
      if (file.type === 'text/csv' || file.type === 'application/csv') {
        // Parse CSV
        const csvText = buffer.toString('utf8')
        workbook = XLSX.read(csvText, { type: 'string' })
      } else {
        // Parse Excel
        workbook = XLSX.read(buffer, { type: 'buffer' })
      }
    } catch (error) {
      return NextResponse.json({ 
        message: 'Error al leer el archivo. Verifique que sea un archivo válido.' 
      }, { status: 400 })
    }

    // Get first worksheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData: ImportRow[] = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      return NextResponse.json({ 
        message: 'El archivo está vacío o no contiene datos válidos' 
      }, { status: 400 })
    }

    if (jsonData.length > 1000) {
      return NextResponse.json({ 
        message: 'Máximo 1000 registros por importación' 
      }, { status: 400 })
    }

    // Process import
    const result: ImportResult = {
      success: true,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: []
    }

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      const rowNumber = i + 2 // Account for header row
      
      try {
        // Map and normalize fields
        const mappedData = mapFields(row)
        mappedData.churchId = session.user.churchId
        mappedData.isActive = true

        // Validate data
        const validationErrors = validateMemberData(mappedData)
        if (validationErrors.length > 0) {
          validationErrors.forEach(error => {
            result.errors.push({
              row: rowNumber,
              field: 'validation',
              value: mappedData,
              error
            })
          })
          result.failed++
          continue
        }

        // Check if member exists (by email or name combination)
        let existingMember = null
        if (mappedData.email) {
          existingMember = await db.member.findFirst({
            where: {
              churchId: session.user.churchId,
              email: mappedData.email,
              isActive: true
            }
          })
        }

        // If not found by email, try by name
        if (!existingMember && mappedData.firstName && mappedData.lastName) {
          existingMember = await db.member.findFirst({
            where: {
              churchId: session.user.churchId,
              firstName: mappedData.firstName,
              lastName: mappedData.lastName,
              isActive: true
            }
          })
        }

        if (existingMember && !updateExisting) {
          result.errors.push({
            row: rowNumber,
            field: 'duplicate',
            value: `${mappedData.firstName} ${mappedData.lastName}`,
            error: 'Miembro ya existe. Active "Actualizar existentes" para sobreescribir.'
          })
          result.failed++
          continue
        }

        // Create or update member
        if (existingMember && updateExisting) {
          await db.member.update({
            where: { id: existingMember.id },
            data: mappedData
          })
          result.updated++
        } else {
          const member = await db.member.create({
            data: mappedData
          })

          // Trigger automation for new member
          try {
            const { AutomationTriggers } = await import('@/lib/automation-engine')
            await AutomationTriggers.memberJoined({
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              phone: member.phone,
              membershipDate: member.membershipDate,
              isActive: member.isActive
            }, session.user.churchId)
          } catch (automationError) {
            console.error('Error triggering automation:', automationError)
          }

          result.imported++
        }

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error)
        result.errors.push({
          row: rowNumber,
          field: 'system',
          value: row,
          error: 'Error interno del sistema'
        })
        result.failed++
      }
    }

    // Set overall success status
    result.success = result.failed < jsonData.length

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error importing members:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

