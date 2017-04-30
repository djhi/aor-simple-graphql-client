import {
    QUERY_TYPES,
    MUTATION_TYPES,
} from './constants';

export default client =>
    /**
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {Object} apolloParams The apollo request params, depending on the type
     * @returns {Promise} promise A promise from a call to either apolloClient.query
     *                    or apolloClient.mutate, depending on the type
     */
    (type, apolloParams) => {
        if (QUERY_TYPES.includes(type)) {
            console.log('aor-gc query', type, apolloParams);
            return client.query({
                ...apolloParams,
                fetchPolicy: 'network-only',
            });
        }

        if (MUTATION_TYPES.includes(type)) {
            return client.mutate(apolloParams);
        }

        throw new Error(`Unsupported fetch action type ${type}`);
    };
