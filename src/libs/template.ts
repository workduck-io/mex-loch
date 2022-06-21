import { customAlphabet } from 'nanoid'
import { nolookalikes } from 'nanoid-dictionary'

const NODE_PATH_SPACER = ' '
const NODE_PATH_WORD_LENGTH = 5
const NODE_PATH_CHAR_LENGTH = 40
const getSlug = (text: string, charLength = NODE_PATH_CHAR_LENGTH, wordLength = NODE_PATH_WORD_LENGTH) =>
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
const generateBlockId = () => `TEMP_${randomId()}`

export const randomId = customAlphabet(nolookalikes)
export const lambdaAppendTemplate = (config: { mexId: string; message: string; idToken: string }) => {
  const { mexId, message, idToken } = config
  return {
    headers: {
      authorization: idToken,
      'mex-workspace-id': mexId
    },
    body: {
      elements: [
        {
          id: generateBlockId(),
          content: '',
          children: [
            {
              id: generateBlockId(),
              content: message,
              children: null,
              elementType: 'p',
              properties: null,
              elementMetadata: null,
              createdBy: null,
              lastEditedBy: null,
              createdAt: null,
              updatedAt: null
            }
          ],
          elementType: 'p',
          properties: null,
          elementMetadata: null
        }
      ]
    }
  }
}

export const lambdaCreateTemplate = (config: {
  nodeId: string
  parentNodeId: string
  mexId: string
  message: string
  idToken: string
}) => {
  const { nodeId, mexId, message, idToken, parentNodeId } = config
  return {
    headers: {
      authorization: idToken,
      'mex-workspace-id': mexId
    },
    body: {
      title: getSlug(message),
      id: nodeId,
      referenceID: parentNodeId,
      data: [
        {
          id: generateBlockId(),
          content: '',
          children: [
            {
              id: generateBlockId(),
              content: message,
              children: null,
              elementType: 'p',
              properties: null,
              elementMetadata: null,
              createdBy: null,
              lastEditedBy: null,
              createdAt: null,
              updatedAt: null
            }
          ],
          elementType: 'p',
          properties: null,
          elementMetadata: null
        }
      ]
    }
  }
}
