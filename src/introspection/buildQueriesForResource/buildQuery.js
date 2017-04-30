import buildFieldList from './buildFieldList';

export const buildQueryFactory = buildFieldListImpl => (resource, type, queries, options) => {
    const operationName = options.templates[type.name](resource);
    const query = queries.find(q => q.name === operationName);

    if (!query) {
        return undefined;
    }

    let fields;
    if (type.returnsFields) {
        console.log('buildQueryFactory', resource, type.name, options, query);
        fields = buildFieldListImpl(resource, query, type.name, options);
    }

    return type.query(operationName, fields);
};

export default buildQueryFactory(buildFieldList);
