import {
  fromPairs,
  mapValues,
  cloneDeep,
  intersection,
  union,
  difference,
  xor,
} from 'lodash';
import { helpers } from '..';
import type {
  CombinedFieldInfo,
  IConsolidateTypesOptions,
  TypeSummary,
} from '..';
import type { KeyValPair, TypeNameSuggestion } from '../../types';
import { initialify } from './helpers';

export default function consolidateNestedTypes(
  nestedTypes: KeyValPair<TypeSummary<CombinedFieldInfo>>,
  { consolidateTypes }: IConsolidateTypesOptions,
) {
  const nestedTypePairs = Object.entries(nestedTypes);

  let getKey = null;
  if (consolidateTypes === 'field-names') {
    getKey = (typeSummary: TypeSummary<CombinedFieldInfo>) =>
      Object.keys(typeSummary.fields).sort().join('|');
  } else if (consolidateTypes === 'field-names-and-type') {
    getKey = (typeSummary: TypeSummary<CombinedFieldInfo>) =>
      Object.keys(typeSummary.fields)
        .sort()
        .map(
          (name) =>
            `${name}:${
              typeSummary.fields[name].typeRef || typeSummary.fields[name].type
            }`,
        )
        .join('|');
  } else {
    return nestedTypes; // bail out
  }

  const typeAliases = nestedTypePairs.reduce(
    (typeAliases, [subTypeName, subTypeSummary]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      if (subTypeSummary) {
        const shape = getKey(subTypeSummary);
        typeAliases.typeToShape[subTypeName] = shape;
        // add to the the array for shape keys:
        if (Array.isArray(typeAliases.shapeToType[shape])) {
          typeAliases.shapeToType[shape].push(subTypeName);
        } else {
          typeAliases.shapeToType[shape] = [subTypeName];
        }
      }
      return typeAliases;
    },
    { shapeToType: {}, typeToShape: {}, shapeAlias: {} },
  );
  console.log('typeAliases', typeAliases);

  /**
   * Now typeAliases will look like:
   *
   * ```json
   * {
   *   "typeToShape": {
   *     "event.links": "title|url",
   *     "location.links": "title|url"
   *   },
   *   "shapeToType": {
   *     "title|url": ["event.links", "location.links"]
   *   }
   * }
   * ```
   *
   * We need a name for the new type,
   * 2 strategies for MVP:
   *   1. Use last part of the typeName string (if they match)
   *   2. Use LCS algorithm to find best name
   *    (possibly cleanup by eliminating duplicate words/substrings?
   *     or by using only the last 1-2 word parts?)
   */
  const shapeMapOfTypes = Object.entries<string[]>(typeAliases.shapeToType);
  console.log('shapeMapOfTypes', shapeMapOfTypes);

  const typesToRemap = shapeMapOfTypes.filter(
    ([shape, typeNames]) => typeNames.length > 1,
  );

  const remapedShapeNames = fromPairs(
    typesToRemap.map(([shape, typePaths]) => [
      shape,
      inferTypeNames(typePaths, shape),
    ]),
  );
  console.log('remapedShapeNames', JSON.stringify(remapedShapeNames, null, 2));

  const fieldsToReplace = [];
  // const namedShapeAliases =
  const suggestedNames = mapValues(remapedShapeNames, (typePaths, fieldShape) =>
    determinePossibleNames({
      ...typePaths,
      fieldShape,
    }),
  );

  mapValues(suggestedNames, (suggestedName, fieldShape) => {
    // Ensure we got a name, and it's currently unused.
    if (suggestedName != false && !nestedTypes[suggestedName]) {
      fieldsToReplace.push({
        shape: fieldShape,
        targetTypes: typeAliases.shapeToType[fieldShape],
        alias: suggestedName,
      });
    }
  });
  console.log('fieldsToReplace', fieldsToReplace);
  //// console.log('remapedShapeNames', {
  ////   fieldsToReplace,
  ////   namedShapeAliases,
  ////   remapedShapeNames,
  ////   typesToRemap,
  //// });

  /*
   * Then we can reassign the names of typeAliases in each typeSummary.fields
   * And finally we return the simplified nestedTypes
   */
  let updatedTypes = nestedTypes;
  fieldsToReplace.forEach((aliasInfo) => {
    const matchNames = typeAliases.shapeToType[aliasInfo.shape];
    updatedTypes = replaceTypeAliases(
      updatedTypes,
      matchNames,
      aliasInfo.alias,
    );
  });
  console.log(`FINAL KEYS:`, Object.keys(updatedTypes), fieldsToReplace);
  return updatedTypes;

  /**
   * Implement the logic to choose a name from available prefix/suffix strings.
   *
   * 2021-02 Logic:
   * 1. If suffixMatches, return that.
   * ```
   * 'Site.links' => "links"
   * 'Game.links' => "links"
   * ```
   * 2. Fallback to a mode where we take the Type Path starting from the last common subpath prefix,
   * ```
   * 'Pokemon.sprites.versions.generation-i' => "versions.generation-i"
   * 'Pokemon.sprites.versions.generation-v' => "versions.generation-v"
   * ```

   * 3. Or, fail with `false`
   *
   */
  function determinePossibleNames({
    fieldShape,
    prefixMatches,
    suffixMatches,
    pathSplitByLastCommonSubstring,
  }: TypeNameSuggestion & { fieldShape: string }): string | false {
    if (suffixMatches.length > 0) return suffixMatches.join('.');
    if (pathSplitByLastCommonSubstring && pathSplitByLastCommonSubstring[1])
      return pathSplitByLastCommonSubstring[1]; //.join('.');
    if (prefixMatches.length > 0) return prefixMatches.join('.');
    return false;
  }

  function replaceTypeAliases(
    nestedTypes: KeyValPair<TypeSummary<CombinedFieldInfo>>,
    matchNames: string[],
    alias: string,
  ) {
    const updatedTypes = cloneDeep(nestedTypes);
    // get field with longest fields, to help with name collisions
    const longestFields = matchNames
      .map((m) => {
        return { name: m, count: Object.keys(updatedTypes[m].fields).length };
      })
      .slice()
      .sort((a, b) => a.count - b.count)
      .slice(0, 1);
    // 1. Re-assign typeName to alias (of first similar field)
    updatedTypes[alias] = updatedTypes[longestFields[0].name];
    // 2. Delete extra sub types
    if (matchNames.length >= 1) {
      matchNames.slice().forEach((typeToDelete) => {
        delete updatedTypes[typeToDelete];
      });
    }
    // 3. Replace all typeAliases
    return mapValues(updatedTypes, (subTypeSummary) => {
      subTypeSummary.fields = mapValues(subTypeSummary.fields, (fieldInfo) => {
        if (matchNames.includes(fieldInfo.typeRef)) {
          fieldInfo.typeRef = alias;
        }
        return fieldInfo;
      });
      return subTypeSummary;
    });
  }
}

/**
   * @private
   * @param 
   * Input for `inferTypeName(typePaths)` will look like either:
   * ```
   * [
   *   "historicEvent.data.Events",
   *   "historicEvent.data.Births",
   *   "historicEvent.data.Deaths"
   * ]
   * ```
   * 
   * Or
   * 
   * ```
   * [
   *  "historicEvent.data.Events.links",
   *  "historicEvent.data.Births.links",
   *  "historicEvent.data.Deaths.links"
   * ]
   * ```
   * 
   * And should return:
   * 
   * ```
   * {
   *   'html|links|no_year_html|text|year': { 
   *     prefixMatches: [ 'historicEvent', 'data' ], 
   *     suffixMatches: []
   *   },
   *   'link|title': {
   *     prefixMatches: [ 'historicEvent', 'data' ],
   *     suffixMatches: [ 'links' ]
   *   }
   * }
   * ```

   */
function inferTypeNames(
  typePaths: string[],
  shape: string,
): TypeNameSuggestion {
  // first try find similar ending parts, then similar beginning parts
  const splitTypeNamePaths = typePaths.map((p) => p.split('.'));

  const firstTypePath = splitTypeNamePaths[0];
  const lastCommonIndex = firstTypePath.findIndex(
    (pathPart, pathIndex) =>
      !splitTypeNamePaths.every((parts) => parts[pathIndex] === pathPart),
  );
  const prefixMatches = firstTypePath.map((pathPart, pathIndex) => {
    return splitTypeNamePaths.every((parts) => parts[pathIndex] === pathPart)
      ? pathPart
      : null;
  });
  const suffixMatches = firstTypePath
    .slice()
    .reverse()
    .map((pathPart, pathIndex) => {
      return splitTypeNamePaths.every(
        (parts) => parts.slice().reverse()[pathIndex] === pathPart,
      )
        ? pathPart
        : null;
    });
  console.log(
    'suffixMatches',
    lastCommonIndex,
    firstTypePath.join('.'),
    suffixMatches.toString(),
  );
  const shapeParts = shape.split(/\|/gim);
  let shapeBasedName = shapeParts.length <= 2 ? shapeParts.join('.') : null;

  return {
    shapeBasedName,
    sourceTypePaths: typePaths,
    prefixMatches: helpers.takeUntilNull(prefixMatches),
    suffixMatches: helpers.takeUntilNull(suffixMatches),
    pathSplitByLastCommonSubstring:
      lastCommonIndex >= 1
        ? [
            firstTypePath.slice(0, lastCommonIndex - 1).join('.'),
            firstTypePath.slice(lastCommonIndex - 1).join('.'),
          ]
        : null,
    exactMatches: {
      lastCommonKey: suffixMatches && suffixMatches[0],
      nextToLastCommonKey:
        suffixMatches && suffixMatches.length >= 2 && suffixMatches[1],
    },
    setOperations: {
      intersection: intersection(...splitTypeNamePaths).join('.'),
      difference:
        splitTypeNamePaths.length > 0
          ? // @ts-ignore
            difference(...splitTypeNamePaths)
          : undefined,
      union: union(...splitTypeNamePaths).join('.'),
      xor: xor(...splitTypeNamePaths).join('.'),
    },
    alternatePrefixes: {
      initials:
        prefixMatches.length > 0
          ? prefixMatches.map(initialify).join('.')
          : null,
      abbreviated:
        prefixMatches.length > 0
          ? prefixMatches.map((p, i) => (i === 0 ? initialify(p) : p)).join('.')
          : null,
      truncated:
        prefixMatches.length > 0
          ? prefixMatches.filter((p, i) => i !== 0).join('.')
          : null,
    },
  };
}

export { inferTypeNames as _inferTypeNames };
