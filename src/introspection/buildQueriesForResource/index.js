import gql from 'graphql-tag';
import {
    CREATE,
    DELETE,
    GET_LIST,
    GET_ONE,
    UPDATE,
} from '../../constants';

import buildQuery from './buildQuery';
import pluralize from 'pluralize';

export const defaultTypes = {
    [GET_LIST]: {
        name: GET_LIST,
        returnsFields: true,
        query: (operationName, fields) => gql`
        query ${operationName}($skip: Int, $first: Int, $orderBy: ${operationName}OrderBy, $filter: ${operationName}Filter) {
            items: all${pluralize(operationName)}(skip: $skip, first: $first, orderBy: $orderBy, filter: $filter) {
                ${fields.fields}
            }
            
            totalCount: _all${pluralize(operationName)}Meta(filter: $filter) {count} 
        }`,
    },
    [GET_ONE]: {
        name: GET_ONE,
        returnsFields: true,
        query: (operationName, fields) => gql`
        query ${operationName}($id: ID!) {
            ${operationName}(id: $id) {
                ${fields.fields}
            }
        }`,
    },
    [CREATE]: {
        name: CREATE,
        returnsFields: true,
        query: (operationName, fields) => gql`
        mutation ${operationName}(${fields.fieldsAsParam}) {
            ${operationName}(${fields.fieldsAsValues}) {
                ${fields.fields}
            }
        }`,
    },
    [UPDATE]: {
        name: UPDATE,
        returnsFields: true,
        query: (operationName, fields) => gql`
        mutation ${operationName}(${fields.fieldsAsParam}) {
            ${operationName}(${fields.fieldsAsValues}) {
              ${fields.fields}
            }
        }`,
    },
    [DELETE]: {
        name: DELETE,
        returnsFields: false,
        query: operationName => gql`
        mutation ${operationName}($id: ID!) {
            ${operationName}(id: $id) {
                id
            }
        }`,
    },
};


export const buildQueriesForResourceFactory = buildQueryImpl => types =>
    (resource, queriesAndMutations, options) =>
        Object.keys(types).reduce((result, type) => ({
            ...result,
            [type]: buildQueryImpl(resource, types[type], queriesAndMutations, options),
        }), {});

export default (resource, queriesAndMutations, options) =>
    buildQueriesForResourceFactory(buildQuery)(defaultTypes)(resource, queriesAndMutations, options);
