import isNotGraphqlPrivateType from "../isNotGraphqlPrivateType";

const getFieldType = (base, fieldType, list, requierd) => {
  if (fieldType.kind === "NON_NULL") {
    requierd = true;
  }
  if (fieldType.kind === "LIST") {
    list = true;
  }

  if (fieldType.name) {
    if (list) {
      return `[${fieldType.name}]` + (requierd ? "!" : "");
    } else {
      return fieldType.name + (requierd ? "!" : "");
    }
  } else if (fieldType.ofType) {
    return getFieldType(base, fieldType.ofType, list, requierd);
  } else {
    console.error("getFieldType, failed to get field type", base);
    throw new Error("getFieldType, failed to get field type");
  }
};

const getFieldName = field => {
  if (relationship(field.type)) {
    return `${field.name} {id}`;
  } else {
    return field.name;
  }
};

const relationship = type =>
  type.kind === "OBJECT" || (type.ofType && relationship(type.ofType));

const scalar = field => !relationship(field.type);

const meta = ({ name }) => name.indexOf("_") === 0 && name.indexOf("Meta") > 0;

export default (resource, type, { excludeFields }) => {
  const fields = resource.fields
    .filter(isNotGraphqlPrivateType)
    .filter(field => {
      if (meta(field)) {
        return false;
      }

      if (excludeFields) {
        if (Array.isArray(excludeFields)) {
          return !excludeFields.includes(field.name);
        }

        if (typeof excludeFields === "function") {
          return !excludeFields(field, resource, type);
        }
      }

      return true;
    })
    .map(f => getFieldName(f))
    .join(" ");

  let fieldsAsParam = type.args
    .filter(scalar)
    .map(f => `\$${f.name}: ${getFieldType(f, f.type, false, false)}`)
    .join(" ");
  let fieldsAsValues = type.args
    .filter(scalar)
    .map(f => `${f.name}: \$${f.name}`)
    .join(" ");
  console.log(
    "AOR DBG - buildFieldList",
    fields,
    fieldsAsParam,
    fieldsAsValues
  );

  return { fields, fieldsAsParam, fieldsAsValues };
};
