import { LastMessageDAO } from '../db/message'

class MessageService {
  async handleMessage(message: string, serviceId: string, serviceType: string) {
    const lastMessage = new LastMessageDAO()
    await lastMessage.init(serviceId)
    if (!lastMessage.getNodeId()) return 'This chat is not connected to Mex. Use /start command'
    const time = lastMessage.getLastRecordTime()
    if (time + 5 * 60 * 1000 <= Date.now()) {
      console.log('Creating new node')
      try {
        const node = await lastMessage.createNewNode(
          {
            serviceId,
            serviceType,
            parentNodeId: lastMessage.getParentNodeId(),
            mexId: lastMessage.getMexId(),
            sessionStartTime: Date.now()
          },
          message
        )
        console.log(`New node created: ${node.nodeId}`)
        return 'New Note Created'
      } catch (err) {
        console.error(err)
        return 'Problem creating new note. Please try again!'
      }
    } else {
      console.log(`Append : `, lastMessage.getMexId())
      try {
        await lastMessage.appendToNode(
          {
            serviceId,
            serviceType,
            nodeId: lastMessage.getNodeId(),
            mexId: lastMessage.getMexId(),
            sessionStartTime: Date.now()
          },
          message
        )
      } catch (err) {
        console.error(err)
        return 'Problem creating new note. Please try again!'
      }
    }
  }
}

export const messageService = new MessageService()
