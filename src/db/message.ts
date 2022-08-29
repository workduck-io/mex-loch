// Importing node.js file system module
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import Lambda from '../libs/lambda'
import { lambdaAppendTemplate, lambdaCreateTemplate, randomId } from '../libs/template'
import { getCreds } from '../libs/tokenHandler'
import { messageEntity } from './entities'
import { LastMessage } from './interface'
export class LastMessageDAO {
  private record: Partial<LastMessage>

  async init(serviceId: string) {
    try {
      //@ts-ignore
      this.record = (await messageEntity.get({ pk: serviceId }))?.Item
      if (!this.record) {
        this.record = {}
      }
      console.log('Last message: ', this.record)
    } catch (err) {
      console.error(err)
      this.record = {}
    }
  }

  getMexId() {
    return this.record.mexId
  }

  // Logic to add data
  async createNewNode(attributes: Partial<LastMessage>, message: string, source?: string) {
    const newNodeId = `NODE_${randomId()}`
    const { headers, body } = lambdaCreateTemplate({
      mexId: attributes.mexId,
      nodeId: newNodeId,
      parentNodeId: attributes.parentNodeId,
      message: message,
      idToken: (await getCreds()).idToken,
      source
    })
    await Lambda.createNodeRequest(headers, body)
    return (
      (await messageEntity.update(
        { ...attributes, nodeId: newNodeId },
        {
          returnValues: 'ALL_NEW',
          conditions: {
            attr: 'serviceId',
            exists: true
          }
        }
      )) as DocumentClient.UpdateItemOutput
    ).Attributes
  }

  async appendToNode(attributes: Partial<LastMessage>, message: string, source?: string) {
    const { headers, body } = lambdaAppendTemplate({
      mexId: attributes.mexId,
      message: message,
      source,
      idToken: (await getCreds()).idToken
    })
    await Lambda.appendNodeRequest(attributes.nodeId, headers, body)

    await messageEntity.update(attributes, {
      conditions: {
        attr: 'serviceId',
        exists: true
      }
    })

    return attributes
  }

  getLastRecordTime() {
    // // Get last record
    if (Object.keys(this.record).length > 0) {
      return this.record.sessionStartTime ?? 0
    }
    return 0
  }

  getNodeId() {
    // // Get last record
    if (Object.keys(this.record).length > 0) {
      return this.record.nodeId
    }
  }

  getParentNodeId() {
    // // Get last record
    if (Object.keys(this.record).length > 0) {
      return this.record.parentNodeId
    }
  }
}
