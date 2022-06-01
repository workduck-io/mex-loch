import { nanoid } from 'nanoid'

export const NODE_PATH_SPACER = ' '
export const NODE_PATH_WORD_LENGTH = 5
export const NODE_PATH_CHAR_LENGTH = 40

export const getSlug = (text: string, charLength = NODE_PATH_CHAR_LENGTH, wordLength = NODE_PATH_WORD_LENGTH) =>
  // trims leading and trailing spacers
  text
    .trim()
    // Replace all non-alphanumeric characters with spacer
    .replace(/[\W_]+/g, NODE_PATH_SPACER)
    // Split on spacer
    .split(NODE_PATH_SPACER)
    // Remove empty texts and repeated uses of spacer
    .filter((t) => t !== '')
    // Slice till the allowed limit
    .slice(0, wordLength)
    // Join
    .join(NODE_PATH_SPACER)
    .slice(0, charLength)

export const lambdaAppendTemplate = (config: { nodeId: string; mexId: string; message: string; idToken: string }) => {
  const { nodeId, mexId, message, idToken } = config
  return {
    FunctionName: `mex-backend-${process.env.SLS_STAGE ?? 'local'}-Node`,
    Payload: {
      headers: {
        authorization: idToken,
        'mex-workspace-id': mexId
      },
      version: '2.0',
      rawPath: '/node/{id}/append',
      rawQueryString: '',
      routeKey: 'POST /node/{id}/append',
      isBase64Encoded: false,
      pathParameters: { id: nodeId },
      queryStringParameters: null,
      stageVariables: null,
      requestContext: null,
      body: JSON.stringify({
        type: 'ElementRequest',
        elements: [
          {
            id: `TEMP_${nanoid()}`,
            elementType: 'paragraph',
            lastEditedBy: 'Mex-Loch',
            content: message,
            children: []
          }
        ]
      })
    },
    InvocationType: 'Event'
  }
}

export const lambdaCreateTemplate = (config: { nodeId: string; mexId: string; message: string; idToken: string }) => {
  const { nodeId, mexId, message, idToken } = config
  return {
    FunctionName: `mex-backend-${process.env.SLS_STAGE ?? 'local'}-Node`,
    Payload: {
      headers: {
        authorization: idToken,
        'mex-workspace-id': mexId
      },
      version: '2.0',
      rawPath: '/node',
      rawQueryString: '',
      routeKey: 'POST /node',
      isBase64Encoded: false,
      queryStringParameters: null,
      stageVariables: null,
      requestContext: null,
      body: JSON.stringify({
        type: 'NodeRequest',
        title: getSlug(message),
        id: nodeId,
        data: [
          {
            id: `TEMP_${nanoid()}`,
            elementType: 'paragraph',
            lastEditedBy: 'Mex-Loch',
            content: message,
            children: []
          }
        ]
      })
    },
    InvocationType: 'Event'
  }
}
