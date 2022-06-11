// Importing node.js file system module
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { nanoid } from 'nanoid'
import Lambda from '../libs/lambda'
import { lambdaAppendTemplate, lambdaCreateTemplate } from '../libs/template'
import { getCreds } from '../libs/tokenHandler'
import { messageEntity } from './entities'
import { LastMessage } from './interface'
export class LastMessageDAO {
  private record: Partial<LastMessage>

  async init(serviceId: string) {
    try {
      this.record = (await messageEntity.get({ serviceId })).Item
      if (!this.record) {
        this.record = {}
      }
    } catch (err) {
      this.record = {}
      console.error(err)
    }
  }

  getMexId() {
    return this.record.mexId
  }

  // Logic to add data
  async createNewNode(attributes: Partial<LastMessage>, message: string) {
    const newNodeId = `NODE_${nanoid()}`

    await Lambda.invokeMexNode(
      lambdaCreateTemplate({
        mexId: attributes.mexId,
        nodeId: newNodeId,
        parentNodeId: attributes.parentNodeId,
        message: message,
        idToken: (await getCreds()).idToken
      })
    )
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

  async appendToNode(attributes: Partial<LastMessage>, message: string) {
    await Lambda.invokeMexNode(
      lambdaAppendTemplate({
        nodeId: attributes.nodeId,
        mexId: attributes.mexId,
        message: message,
        idToken: (await getCreds()).idToken
      })
    )

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
