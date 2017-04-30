import {
    GET_LIST,
    GET_MANY,
    GET_MANY_REFERENCE,
    QUERY_TYPES,
} from './constants';

/**
 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
 * @param {Object} apolloParams The apollo request params
 * @returns {Object} The key to look for in the response data, depending on the type
 *                   (this is the name of the operation defined in the graphql query or mutation)
 */
const getApolloResultKey = (type, apolloParams) => (
    QUERY_TYPES.includes(type)
    ? apolloParams.query.definitions[0].selectionSet.selections[0].name.value
    : apolloParams.mutation.definitions[0].selectionSet.selections[0].name.value
);

export const buildGetListErrorMessage = resource =>
    `The data returned by the graphql endpoint for the GET_LIST query on resource ${resource} does not contains a \`totalCount\` property which is needed to build the pagination. The query result must conform to this schema: \`{ totalCount: Int, items: [] }\``; // eslint-disable-line

/**
 * @param {Object} response Apollo response
 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
 * @param {Object} apolloParams The apollo request params, depending on the type
 * @returns {Object} REST response
 */
export default (response, type, resource, apolloParams) => {
    const { data } = response;

    switch (type) {
    case GET_LIST: {
      const dataForType = data;
        if (typeof dataForType.totalCount.count !== 'number') {
            throw new Error(buildGetListErrorMessage(resource));
        }
        return {
            data: dataForType.items.map(x => x),
            total: dataForType.totalCount.count,
        };
    }

    case GET_MANY:
    case GET_MANY_REFERENCE: {
        const dataForType = data;
        if (dataForType.totalCount && dataForType.totalCount.count) {
            return { data: dataForType.items.map(x => x) };
        }

        return { data: dataForType };
    }

    default: {
      const dataKey = getApolloResultKey(type, apolloParams);
      const dataForType = data[dataKey];

      return {data: dataForType};
    }
    }
};
