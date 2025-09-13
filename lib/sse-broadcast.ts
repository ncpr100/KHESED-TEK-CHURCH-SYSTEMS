
// Global connection store (in production, use Redis or similar)
const connections = new Map<string, { 
  id: string
  userId: string
  churchId: string
  role: string
  name: string
  controller: ReadableStreamDefaultController
  startTime: Date
}>()

// Utility to send message to all connections
export function broadcastToConnections(message: any, filter?: (conn: any) => boolean) {
  const data = `data: ${JSON.stringify(message)}\n\n`
  
  connections.forEach((connection) => {
    if (!filter || filter(connection)) {
      try {
        connection.controller.enqueue(new TextEncoder().encode(data))
      } catch (error) {
        console.error('Error sending SSE message:', error)
        // Connection might be closed, remove it
        connections.delete(connection.id)
      }
    }
  })
}

// Broadcast to specific user
export function broadcastToUser(userId: string, message: any) {
  broadcastToConnections(message, (conn) => conn.userId === userId)
}

// Broadcast to church
export function broadcastToChurch(churchId: string, message: any) {
  broadcastToConnections(message, (conn) => conn.churchId === churchId)
}

// Broadcast to role
export function broadcastToRole(role: string, message: any) {
  broadcastToConnections(message, (conn) => conn.role === role)
}

// Get connection statistics
export function getConnectionStats() {
  const uniqueUsers = new Set()
  connections.forEach(conn => uniqueUsers.add(conn.userId))
  
  return {
    totalConnections: connections.size,
    uniqueUsers: uniqueUsers.size,
    averageConnectionsPerUser: connections.size / Math.max(uniqueUsers.size, 1)
  }
}

// Get connected users
export function getConnectedUsers(churchId?: string) {
  const users = new Map()
  
  connections.forEach(connection => {
    if (churchId && connection.churchId !== churchId) return
    
    if (!users.has(connection.userId)) {
      users.set(connection.userId, {
        userId: connection.userId,
        churchId: connection.churchId,
        role: connection.role,
        name: connection.name,
        status: 'online',
        lastSeen: connection.startTime,
        connectionCount: 1
      })
    } else {
      const user = users.get(connection.userId)
      user.connectionCount++
    }
  })
  
  return Array.from(users.values())
}

// Connection management functions
export function addConnection(connectionId: string, connectionInfo: {
  userId: string
  churchId: string
  role: string
  name: string
  controller: ReadableStreamDefaultController
  startTime: Date
}) {
  connections.set(connectionId, {
    id: connectionId,
    ...connectionInfo
  })
}

export function removeConnection(connectionId: string) {
  connections.delete(connectionId)
}

export function getConnection(connectionId: string) {
  return connections.get(connectionId)
}

export function hasUserConnections(userId: string): boolean {
  return Array.from(connections.values()).some(conn => conn.userId === userId)
}
