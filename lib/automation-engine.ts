
import { prisma } from '@/lib/prisma'
import { 
  AutomationTriggerType, 
  AutomationConditionType, 
  AutomationActionType,
  AutomationRule,
  AutomationTrigger,
  AutomationCondition,
  AutomationAction
} from '@prisma/client'
import { broadcastToUser, broadcastToChurch, broadcastToRole } from '@/lib/sse-broadcast'
import { PushNotificationService, NotificationTemplates } from '@/lib/push-notifications'

// Types for trigger data
export interface TriggerData {
  type: AutomationTriggerType
  entityId?: string
  entityType?: string
  data: Record<string, any>
  userId?: string
  churchId: string
  timestamp: Date
}

// Types for expanded rule data
export interface AutomationRuleWithDetails extends AutomationRule {
  triggers: AutomationTrigger[]
  conditions: AutomationCondition[]
  actions: AutomationAction[]
}

export class AutomationEngine {
  
  /**
   * Process a trigger event and execute matching automation rules
   */
  static async processTrigger(triggerData: TriggerData): Promise<void> {
    try {
      console.log(`🔄 Processing automation trigger: ${triggerData.type}`, { 
        entityId: triggerData.entityId,
        churchId: triggerData.churchId 
      })

      // Find matching automation rules for this trigger type and church
      const matchingRules = await this.findMatchingRules(triggerData)

      if (matchingRules.length === 0) {
        console.log(`📋 No automation rules found for trigger: ${triggerData.type}`)
        return
      }

      console.log(`🎯 Found ${matchingRules.length} matching automation rules`)

      // Process each matching rule
      for (const rule of matchingRules) {
        await this.executeRule(rule, triggerData)
      }

    } catch (error) {
      console.error('Error processing automation trigger:', error)
      throw error
    }
  }

  /**
   * Find automation rules that match the trigger type and church
   */
  private static async findMatchingRules(triggerData: TriggerData): Promise<AutomationRuleWithDetails[]> {
    const rules = await prisma.automationRule.findMany({
      where: {
        churchId: triggerData.churchId,
        isActive: true,
        triggers: {
          some: {
            type: triggerData.type,
            isActive: true
          }
        }
      },
      include: {
        triggers: {
          where: { isActive: true }
        },
        conditions: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' }
        },
        actions: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { priority: 'desc' } // Higher priority first
    })

    return rules as AutomationRuleWithDetails[]
  }

  /**
   * Execute a single automation rule
   */
  private static async executeRule(rule: AutomationRuleWithDetails, triggerData: TriggerData): Promise<void> {
    // Create execution record
    const execution = await prisma.automationRuleExecution.create({
      data: {
        ruleId: rule.id,
        triggerData: triggerData as any,
        status: 'RUNNING'
      }
    })

    try {

      const startTime = Date.now()

      // Check execution limits
      if (rule.maxExecutions && rule.executionCount >= rule.maxExecutions) {
        await this.updateExecution(execution.id, 'FAILED', null, 'Maximum executions reached')
        return
      }

      // Check if rule should execute only once and has already been executed
      if (rule.executeOnce && rule.lastExecuted) {
        await this.updateExecution(execution.id, 'FAILED', null, 'Rule set to execute only once and has already been executed')
        return
      }

      // Evaluate conditions
      const conditionsMet = await this.evaluateConditions(rule.conditions, triggerData)
      if (!conditionsMet) {
        await this.updateExecution(execution.id, 'FAILED', null, 'Conditions not met')
        return
      }

      console.log(`✅ Conditions met for rule: ${rule.name}`)

      // Execute actions
      const actionResults = await this.executeActions(rule.actions, triggerData)

      // Update execution record
      const duration = Date.now() - startTime
      await this.updateExecution(execution.id, 'SUCCESS', actionResults, null, duration)

      // Update rule execution count and last executed time
      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          executionCount: { increment: 1 },
          lastExecuted: new Date()
        }
      })

      console.log(`🎉 Successfully executed automation rule: ${rule.name}`)

    } catch (error) {
      console.error(`Error executing automation rule ${rule.name}:`, error)
      
      // Update execution record with error
      await prisma.automationRuleExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          executedAt: new Date()
        }
      })
    }
  }

  /**
   * Evaluate rule conditions
   */
  private static async evaluateConditions(conditions: AutomationCondition[], triggerData: TriggerData): Promise<boolean> {
    if (conditions.length === 0) return true

    // Group conditions by groupId for proper logical evaluation
    const conditionGroups = new Map<string, AutomationCondition[]>()
    
    conditions.forEach(condition => {
      const groupKey = condition.groupId || 'default'
      if (!conditionGroups.has(groupKey)) {
        conditionGroups.set(groupKey, [])
      }
      conditionGroups.get(groupKey)!.push(condition)
    })

    // Evaluate each group (groups are OR'd together, conditions within groups are AND/OR'd based on logicalOperator)
    const groupResults: boolean[] = []

    for (const [groupKey, groupConditions] of conditionGroups) {
      const groupResult = await this.evaluateConditionGroup(groupConditions, triggerData)
      groupResults.push(groupResult)
    }

    // If there's only one group, return its result
    if (groupResults.length === 1) return groupResults[0]

    // Multiple groups are OR'd together
    return groupResults.some(result => result)
  }

  /**
   * Evaluate a group of conditions
   */
  private static async evaluateConditionGroup(conditions: AutomationCondition[], triggerData: TriggerData): Promise<boolean> {
    if (conditions.length === 0) return true

    let result = true
    let isFirstCondition = true

    for (const condition of conditions) {
      const conditionResult = await this.evaluateCondition(condition, triggerData)
      
      if (isFirstCondition) {
        result = conditionResult
        isFirstCondition = false
      } else {
        if (condition.logicalOperator === 'OR') {
          result = result || conditionResult
        } else { // Default to AND
          result = result && conditionResult
        }
      }
    }

    return result
  }

  /**
   * Evaluate a single condition
   */
  private static async evaluateCondition(condition: AutomationCondition, triggerData: TriggerData): Promise<boolean> {
    try {
      // Get the value from trigger data
      const fieldValue = this.getFieldValue(condition.field, triggerData)
      const conditionValue = condition.value
      
      switch (condition.type) {
        case 'EQUALS':
          return fieldValue === conditionValue
          
        case 'NOT_EQUALS':
          return fieldValue !== conditionValue
          
        case 'GREATER_THAN':
          return Number(fieldValue) > Number(conditionValue)
          
        case 'LESS_THAN':
          return Number(fieldValue) < Number(conditionValue)
          
        case 'CONTAINS':
          return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())
          
        case 'NOT_CONTAINS':
          return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())
          
        case 'IN':
          return Array.isArray(conditionValue) && conditionValue.includes(fieldValue)
          
        case 'NOT_IN':
          return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue)
          
        case 'EXISTS':
          return fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
          
        case 'NOT_EXISTS':
          return fieldValue === undefined || fieldValue === null || fieldValue === ''
          
        case 'DATE_BEFORE':
          return new Date(fieldValue) < new Date(conditionValue as string)
          
        case 'DATE_AFTER':
          return new Date(fieldValue) > new Date(conditionValue as string)
          
        case 'DATE_BETWEEN':
          const dates = conditionValue as [string, string]
          const fieldDate = new Date(fieldValue)
          return fieldDate >= new Date(dates[0]) && fieldDate <= new Date(dates[1])
          
        default:
          console.warn(`Unknown condition type: ${condition.type}`)
          return false
      }
    } catch (error) {
      console.error('Error evaluating condition:', error)
      return false
    }
  }

  /**
   * Get field value from trigger data using dot notation
   */
  private static getFieldValue(fieldPath: string, triggerData: TriggerData): any {
    const parts = fieldPath.split('.')
    let value: any = triggerData

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  /**
   * Execute automation actions
   */
  private static async executeActions(actions: AutomationAction[], triggerData: TriggerData): Promise<any[]> {
    const results: any[] = []

    for (const action of actions) {
      try {
        // Apply delay if specified
        if (action.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, action.delay * 1000))
        }

        const result = await this.executeAction(action, triggerData)
        results.push({ actionId: action.id, success: true, result })
        
      } catch (error) {
        console.error(`Error executing action ${action.id}:`, error)
        results.push({ 
          actionId: action.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return results
  }

  /**
   * Execute a single action
   */
  private static async executeAction(action: AutomationAction, triggerData: TriggerData): Promise<any> {
    const config = action.configuration as any

    switch (action.type) {
      case 'SEND_NOTIFICATION':
        return await this.executeNotificationAction(config, triggerData)
        
      case 'SEND_EMAIL':
        return await this.executeEmailAction(config, triggerData)

      case 'SEND_PUSH':
        return await this.executePushNotificationAction(config, triggerData)
        
      case 'CREATE_FOLLOW_UP':
        return await this.executeFollowUpAction(config, triggerData)
        
      default:
        console.warn(`Unknown action type: ${action.type}`)
        return { message: 'Action type not implemented' }
    }
  }

  /**
   * Execute notification action
   */
  private static async executeNotificationAction(config: any, triggerData: TriggerData): Promise<any> {
    try {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          title: this.interpolateTemplate(config.title, triggerData),
          message: this.interpolateTemplate(config.message, triggerData),
          type: config.type || 'INFO',
          category: config.category || 'AUTOMATION',
          priority: config.priority || 'NORMAL',
          churchId: triggerData.churchId,
          targetUser: config.targetUser,
          targetRole: config.targetRole,
          isGlobal: config.isGlobal || false,
          actionUrl: config.actionUrl,
          actionLabel: config.actionLabel,
          createdBy: 'automation-engine'
        }
      })

      // Send real-time notification
      const realtimeMessage = {
        id: `automation-${Date.now()}`,
        type: 'notification',
        data: {
          notificationId: notification.id,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          category: notification.category,
          actionUrl: notification.actionUrl,
          actionLabel: notification.actionLabel,
          senderId: 'automation-engine',
          senderName: 'Sistema de Automatización',
          churchId: triggerData.churchId
        },
        churchId: triggerData.churchId,
        timestamp: Date.now()
      }

      // Broadcast based on target
      if (config.targetUser) {
        broadcastToUser(config.targetUser, realtimeMessage)
      } else if (config.targetRole) {
        broadcastToRole(config.targetRole, realtimeMessage)
      } else {
        broadcastToChurch(triggerData.churchId, realtimeMessage)
      }

      return { notificationId: notification.id, sent: true }

    } catch (error) {
      console.error('Error executing notification action:', error)
      throw error
    }
  }

  /**
   * Execute email action
   */
  private static async executeEmailAction(config: any, triggerData: TriggerData): Promise<any> {
    // This would integrate with your email system
    // For now, just log the action
    console.log('📧 Email action executed:', {
      to: config.to,
      subject: this.interpolateTemplate(config.subject, triggerData),
      template: config.template
    })
    
    return { sent: true, method: 'email' }
  }

  /**
   * Execute push notification action
   */
  private static async executePushNotificationAction(config: any, triggerData: TriggerData): Promise<any> {
    try {
      // Create push notification payload
      const payload = {
        title: this.interpolateTemplate(config.title || 'Notificación de la Iglesia', triggerData),
        body: this.interpolateTemplate(config.message || config.body || 'Nueva notificación', triggerData),
        icon: config.icon || '/icons/icon-192.png',
        badge: config.badge || '/icons/badge-72.png',
        tag: config.tag || 'automation',
        url: config.url || '/dashboard',
        actionUrl: config.actionUrl,
        actions: config.actions || [],
        requireInteraction: config.requireInteraction || false,
        silent: config.silent || false,
        data: {
          automationId: triggerData.type,
          triggerData: triggerData.data,
          timestamp: Date.now(),
          ...config.data
        }
      }

      let result: { success: number; failed: number; totalUsers?: number }

      // Send based on target configuration
      if (config.targetUser) {
        result = await PushNotificationService.sendToUser(config.targetUser, payload)
        result.totalUsers = 1
      } else if (config.targetUsers && Array.isArray(config.targetUsers)) {
        result = await PushNotificationService.sendToUsers(config.targetUsers, payload)
      } else if (config.targetRole) {
        result = await PushNotificationService.sendToRole(triggerData.churchId, config.targetRole, payload)
      } else {
        // Default: send to all church members
        result = await PushNotificationService.sendToChurch(triggerData.churchId, payload)
      }

      console.log(`📱 Push notification sent - Success: ${result.success}, Failed: ${result.failed}`)

      return { 
        sent: true, 
        method: 'push',
        success: result.success,
        failed: result.failed,
        totalUsers: result.totalUsers || 0
      }

    } catch (error) {
      console.error('Error executing push notification action:', error)
      return { 
        sent: false, 
        method: 'push',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: 0,
        failed: 1
      }
    }
  }

  /**
   * Execute follow-up action
   */
  private static async executeFollowUpAction(config: any, triggerData: TriggerData): Promise<any> {
    // Note: This is a placeholder implementation
    // In a real scenario, you would need to connect this to a CheckIn record
    // or create a different type of follow-up task
    
    console.log('📝 Follow-up action executed:', {
      type: config.followUpType || 'LLAMADA',
      notes: this.interpolateTemplate(config.notes || 'Seguimiento automático generado', triggerData),
      assignedTo: config.assignedTo,
      scheduledAt: config.scheduledAt
    })
    
    return { 
      message: 'Follow-up task created (placeholder)',
      type: config.followUpType || 'LLAMADA',
      created: true 
    }
  }

  /**
   * Interpolate template strings with trigger data
   */
  private static interpolateTemplate(template: string, triggerData: TriggerData): string {
    if (!template) return ''
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getFieldValue(path.trim(), triggerData)
      return value !== undefined ? String(value) : match
    })
  }

  /**
   * Update automation execution record
   */
  private static async updateExecution(
    executionId: string, 
    status: string, 
    result?: any, 
    error?: string | null,
    duration?: number
  ): Promise<void> {
    await prisma.automationRuleExecution.update({
      where: { id: executionId },
      data: {
        status,
        result: result || null,
        error,
        executedAt: new Date(),
        duration
      }
    })
  }
}

// Helper functions to trigger automation from various parts of the application

export async function triggerAutomation(
  type: AutomationTriggerType,
  data: Record<string, any>,
  churchId: string,
  entityId?: string,
  entityType?: string,
  userId?: string
): Promise<void> {
  const triggerData: TriggerData = {
    type,
    entityId,
    entityType,
    data,
    userId,
    churchId,
    timestamp: new Date()
  }

  await AutomationEngine.processTrigger(triggerData)
}

// Specific trigger functions for common events
export const AutomationTriggers = {
  memberJoined: (memberData: any, churchId: string) => 
    triggerAutomation('MEMBER_JOINED', memberData, churchId, memberData.id, 'member'),

  donationReceived: (donationData: any, churchId: string) =>
    triggerAutomation('DONATION_RECEIVED', donationData, churchId, donationData.id, 'donation'),

  eventCreated: (eventData: any, churchId: string, userId: string) =>
    triggerAutomation('EVENT_CREATED', eventData, churchId, eventData.id, 'event', userId),

  attendanceRecorded: (attendanceData: any, churchId: string) =>
    triggerAutomation('ATTENDANCE_RECORDED', attendanceData, churchId, attendanceData.id, 'attendance'),

  birthdayToday: (memberData: any, churchId: string) =>
    triggerAutomation('BIRTHDAY', memberData, churchId, memberData.id, 'member'),

  anniversaryToday: (memberData: any, churchId: string) =>
    triggerAutomation('ANNIVERSARY', memberData, churchId, memberData.id, 'member'),

  sermonPublished: (sermonData: any, churchId: string, userId: string) =>
    triggerAutomation('SERMON_PUBLISHED', sermonData, churchId, sermonData.id, 'sermon', userId),

  followUpDue: (followUpData: any, churchId: string) =>
    triggerAutomation('FOLLOW_UP_DUE', followUpData, churchId, followUpData.id, 'followUp')
}
