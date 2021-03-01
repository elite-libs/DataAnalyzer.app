import { fromPairs, mapValues, cloneDeep } from 'lodash';
import { helpers } from '..';
import type {
  CombinedFieldInfo,
  IConsolidateTypesOptions,
  TypeSummary,
} from '..';
import type { KeyValPair, SubstringMatchDetails } from '../../types';

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
  //// console.log('shapeMapOfTypes', shapeMapOfTypes);
  const typesToRemap = shapeMapOfTypes.filter(
    ([shape, typeNames]) => typeNames.length > 1,
  );

  const remapedShapeNames = fromPairs(
    typesToRemap.map(([shape, typePaths]) => [
      shape,
      inferTypeNames(typePaths),
    ]),
  );
  const fieldsToReplace = [];
  const longestShapeAliases = {};
  // const namedShapeAliases =
  mapValues(remapedShapeNames, (typePaths, key) => {
    const suggestedName = determineSuggestedName(typePaths);
    if (suggestedName) {
      fieldsToReplace.push({ shape: key, alias: suggestedName });
      if (
        !longestShapeAliases[suggestedName] ||
        longestShapeAliases[suggestedName].length < key.length
      ) {
        longestShapeAliases[suggestedName] = key;
      }
    }

    // TODO: Add name collision avoidance before over-writing back into the TypeSummary
    // Idea: We can possibly trust the longest shape to be a superset of other smaller shapes - when colliding suggested names
    //    Trying with `longestShapeAliases`
    return suggestedName;
  });
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
   * @private
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
  function inferTypeNames(typePaths: string[]): SubstringMatchDetails {
    // first try find similar ending parts, then similar beginning parts
    const splitTypeNamePaths = typePaths.map((p) => p.split('.'));
    const firstTypePath = splitTypeNamePaths[0];
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
          (parts) => parts.reverse()[pathIndex] === pathPart,
        )
          ? pathPart
          : null;
      });
    // .reverse();
    return {
      prefixMatches: helpers.takeUntilNull(prefixMatches),
      suffixMatches: helpers.takeUntilNull(suffixMatches),
    };
  }
  /**
   * Implement the logic to choose a name from available prefix/suffix strings.
   *
   * 2021-02 Logic:
   * 1. If suffixMatches, return that.
   * 2. Fallback to prefix,
   * 3. Or, fail with `false`
   *
   */
  function determineSuggestedName({
    prefixMatches,
    suffixMatches,
  }: SubstringMatchDetails): string | false {
    if (suffixMatches.length > 0) return suffixMatches.join('.');
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
