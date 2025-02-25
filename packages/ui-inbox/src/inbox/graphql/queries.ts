import conversationFields from './conversationFields';
import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import messageFields from './messageFields';

export const paramsDef = `
  $channelId: String
  $status: String
  $unassigned: String
  $awaitingResponse: String
  $brandId: String
  $tag: String
  $integrationType: String
  $participating: String
  $starred: String
  $startDate: String
  $endDate: String
  $segment: String
`;
const listParamsDef = `
  $limit: Int
  $ids: [String]
  ${paramsDef}
`;

export const paramsValue = `
  channelId: $channelId
  status: $status
  unassigned: $unassigned
  awaitingResponse: $awaitingResponse
  brandId: $brandId
  tag: $tag
  integrationType: $integrationType
  participating: $participating
  starred: $starred
  startDate: $startDate
  endDate: $endDate
  segment: $segment
`;

const listParamsValue = `
  limit: $limit
  ids: $ids
  ${paramsValue}
`;

const conversationList = `
  query objects(${listParamsDef}) {
    conversations(${listParamsValue}) {
      ${conversationFields}
    }
  }
`;

const sidebarConversations = `
  query conversations(${listParamsDef}) {
    conversations(${listParamsValue}) {
      _id
      content
      status
      updatedAt
      idleTime
      messageCount
      assignedUser {
        _id
        details {
          avatar
          fullName
        }
      }
      integration {
        _id
        kind
        name
        brand {
          _id
          name
        }
        channels {
          _id
          name
        }
      }
      ${
        isEnabled('contacts')
          ? `
      customer {
        _id
        firstName
        middleName
        lastName
        primaryEmail
        primaryPhone
        state
        avatar
        visitorContactInfo
      }
      `
          : ``
      }
      tagIds
      ${
        isEnabled('tags')
          ? `
      tags {
        _id
        name
        colorCode
      }
      `
          : ``
      }
      readUserIds
    }
  }
`;

export const conversationDetail = `
  query conversationDetail($_id: String!) {
    conversationDetail(_id: $_id) {
      ${conversationFields}
    }
  }
`;

const conversationDetailMarkAsRead = `
  query conversationDetail($_id: String!) {
    conversationDetail(_id: $_id) {
      _id
      readUserIds
    }
  }
`;

export const conversationMessages = `
  query conversationMessages($conversationId: String!, $skip: Int, $limit: Int, $getFirst: Boolean) {
    conversationMessages(conversationId: $conversationId, skip: $skip, limit: $limit, getFirst: $getFirst) {
      ${messageFields}
    }
  }
`;

const conversationMessagesTotalCount = `
  query conversationMessagesTotalCount($conversationId: String!) {
    conversationMessagesTotalCount(conversationId: $conversationId)
  }
`;

const userList = `
  query objects($searchValue: String, $requireUsername: Boolean) {
    users(searchValue: $searchValue, requireUsername: $requireUsername) {
      _id
      username
      email
      details {
        avatar
        fullName
        position
      }
    }
  }
`;

const channelList = `
  query channels($memberIds: [String]) {
    channels(memberIds: $memberIds) {
      _id
      name
    }
  }
`;

const channelsByMembers = `
  query channelsByMembers($memberIds: [String]) {
    channelsByMembers(memberIds: $memberIds) {
      _id
      name
    }
  }
`;

const integrationsGetUsedTypes = `
  query integrationsGetUsedTypes {
    integrationsGetUsedTypes {
      _id
      name
    }
  }
`;

const brandList = `
  query brands {
    brands {
      _id
      name
    }
  }
`;

const allBrands = `
  query allBrands {
    allBrands {
      _id
      name
    }
  }
`;

const tagList = `
  query tags($type: String) {
    ${
      isEnabled('tags')
        ? `
    tags(type: $type) {
      _id
      name
      colorCode
      order
      parentId
      relatedIds
    }
    `
        : ``
    }
  }
`;

// subOf alais as parentId
const segmentList = `
  query segments($contentTypes: [String]!) {
    ${
      isEnabled('segments')
        ? `
        segments(contentTypes: $contentTypes) {
          _id
          contentType
          name
          parentId: subOf
        }
    `
        : ``
    }
  }
`;

const conversationCounts = `
  query conversationCounts(${listParamsDef}, $only: String) {
    conversationCounts(${listParamsValue}, only: $only)
  }
`;

const totalConversationsCount = `
  query totalConversationsCount(${listParamsDef}) {
    conversationsTotalCount(${listParamsValue})
  }
`;

const unreadConversationsCount = `
  query conversationsTotalUnreadCount {
    conversationsTotalUnreadCount
  }
`;

const lastConversation = `
  query conversationsGetLast(${listParamsDef}) {
    conversationsGetLast(${listParamsValue}) {
      _id
    }
  }
`;

const responseTemplateList = `
  query responseTemplates($perPage: Int) {
    responseTemplates(perPage: $perPage) {
      _id
      name
      brandId
      content
    }
  }
`;

const convertToInfo = `
  query convertToInfo($conversationId: String!) {
    convertToInfo(conversationId: $conversationId) {
      ticketUrl
      dealUrl
      taskUrl
    }
  }
`;

const generateCustomerDetailQuery = params => {
  const {
    showDeviceProperties = false,
    showTrackedData = false,
    showCustomFields = false,
    showCompanies = false,
    showTags = false,
    showSegments = false
  } = params || {};

  let fields = `
    _id
    integration {
      kind
    }
    urlVisits
    ${customerQueries.basicFields}
  `;

  if (showTrackedData) {
    fields = `
      ${fields}
      trackedData
    `;
  }

  if (showCustomFields) {
    fields = `
      ${fields}
      customFieldsData
    `;
  }

  if (showDeviceProperties) {
    fields = `
      ${fields}
      location
    `;
  }

  if (showCompanies) {
    fields = `
      ${fields}
      ${
        isEnabled('contacts')
          ? `companies {
          _id
          primaryName
          website
          customers {
            _id
            avatar
            firstName
            middleName
            lastName
            primaryEmail
          }
        }`
          : ``
      }
    `;
  }

  if (showTags) {
    fields = `
      ${fields}
      tagIds
      ${
        isEnabled('tags')
          ? `
          getTags {
            _id
            name
            colorCode
          }
        `
          : ``
      }
    `;
  }

  if (showSegments) {
    fields = `
      ${fields}
      getSubSegments {
        _id
        contentType
        name
      }
    `;
  }

  return `
    query customerDetail($_id: String!) {
      customerDetail(_id: $_id) {
        ${fields}
      }
    }
  `;
};

export default {
  conversationList,
  sidebarConversations,
  conversationDetail,
  conversationDetailMarkAsRead,
  conversationMessages,
  conversationMessagesTotalCount,
  userList,
  channelList,
  integrationsGetUsedTypes,
  brandList,
  allBrands,
  tagList,
  segmentList,
  responseTemplateList,
  conversationCounts,
  totalConversationsCount,
  unreadConversationsCount,
  lastConversation,
  channelsByMembers,
  generateCustomerDetailQuery,
  convertToInfo
};
