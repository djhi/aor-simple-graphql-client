import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    UPDATE,
    CREATE,
    DELETE,
} from './constants';

/**
 * @param {String} type The type of request (see https://marmelab.com/admin-on-rest/RestClients.html)
 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
 * @param {Object} params The REST request params, depending on the type
 * @returns {Object} apolloParams An object passed to either apolloClient.query or apolloClient.mutate
 */
export default (queries, type, resource, params) => {
    switch (type) {
    case GET_LIST: {
        return {
            query: queries[resource][GET_LIST],
            variables: {
                filter: params.filter,
                skip: (params.pagination.page - 1) * params.pagination.perPage,
                first: Number(params.pagination.perPage),
                orderBy: `${params.sort.field}_${params.sort.order}`
            },
        };
    }

    case GET_ONE:
        return {
            query: queries[resource][GET_ONE],
            variables: {
                id: params.id,
            },
        };

    case GET_MANY: {
        //console.log("aor-dc - buildApolloParams", params);
        let variables = {
            filter: { id_in: params.ids },
        };

        if (!queries[resource][GET_MANY]) {
            variables = {
                ...variables,
                perPage: 1000,
            };
        }

        return {
            query: queries[resource][GET_MANY] || queries[resource][GET_LIST],
            variables,
        };
    }

    case GET_MANY_REFERENCE: {
        let variables = {
            filter: { [params.target]: params.id },
        };

        if (!queries[resource][GET_MANY_REFERENCE]) {
            variables = {
                ...variables,
                perPage: 1000,
            };
        }

        return {
            query: queries[resource][GET_MANY_REFERENCE] || queries[resource][GET_LIST],
            variables,
        };
    }

    case UPDATE:
        return {
            mutation: queries[resource][UPDATE],
            variables: params.data,
        };

    case CREATE:
        return {
            mutation: queries[resource][CREATE],
            variables: params.data,
        };

    case DELETE:
        return {
            mutation: queries[resource][DELETE],
            variables: {
                id: params.id,
            },
        };

    default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
};
