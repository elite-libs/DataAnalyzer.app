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

interface IConsolidateTypesResults {
  nestedTypes: KeyValPair<TypeSummary<CombinedFieldInfo>>;
  changes: ChangeFieldDescription[];
}
interface ChangeFieldDescription {
  alias: string;
  shape: string;
  targetTypes: string[];
}

export default function consolidateNestedTypes(
  nestedTypes: KeyValPair<TypeSummary<CombinedFieldInfo>>,
  { consolidateTypes }: IConsolidateTypesOptions,
): IConsolidateTypesResults {
  const nestedTypePairs = Object.entries(nestedTypes);

  let getKey: any = null;
  if (consolidateTypes === 'field-names') {
    getKey = (typeSummary: TypeSummary<CombinedFieldInfo>) =>
      Object.keys(typeSummary.fields).sort().join('|');
  } else if (consolidateTypes === 'field-names-and-type') {
    getKey = (typeSummary: TypeSummary<CombinedFieldInfo>) =>
      Object.keys(typeSummary.fields)
        .sort()
        .map(
          (name) =>
            // @ts-ignore
            `${name}:${
              typeSummary != null &&
              typeSummary.fields != null &&
              typeSummary.fields[name] != null
                ? typeSummary?.fields[name]?.typeRef ||
                  typeSummary?.fields[name]?.type
                : ''
            }`,
        )
        .join('|');
  } else {
    return { nestedTypes, changes: [] }; // bail out
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
  // console.log('typeAliases', typeAliases);

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
  // console.log('shapeMapOfTypes', shapeMapOfTypes);

  const typesToRemap = shapeMapOfTypes.filter(
    ([shape, typeNames]) => typeNames.length > 1,
  );

  const existingTypeNames = []; // TODO: seed with type names which will not be messed with.
  const remapedShapeNames = fromPairs(
    typesToRemap.map(([shape, typePaths]) => [
      shape,
      inferTypeNames(typePaths, shape),
    ]),
  );
  if (process.env.NODE_ENV === 'development')
    console.log(
      'remapedShapeNamesStats',
      JSON.stringify(remapedShapeNames, null, 2),
    );

  const fieldsToReplace: ChangeFieldDescription[] = [];
  mapValues(
    assignInferredNames(remapedShapeNames, existingTypeNames),
    (suggestedName, fieldShape) => {
      // Ensure we got a name, and it's currently unused.
      if (
        suggestedName != null &&
        suggestedName != false &&
        !nestedTypes[suggestedName]
      ) {
        fieldsToReplace.push({
          shape: fieldShape,
          targetTypes: typeAliases.shapeToType[fieldShape],
          alias: suggestedName,
        });
      }
    },
  );
  // console.log('fieldsToReplace', fieldsToReplace);
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
  // console.log(`FINAL KEYS:`, Object.keys(updatedTypes), fieldsToReplace);
  return { nestedTypes: updatedTypes, changes: fieldsToReplace };

  /*
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
  // function determinePossibleNames({
  //   fieldShape,
  //   prefixMatches,
  //   suffixMatches,
  //   pathSplitByLastCommonSubstring,
  // }: TypeNameSuggestion & { fieldShape: string }): string | false {
  //   if (suffixMatches.length > 0) return suffixMatches.join('.');
  //   if (pathSplitByLastCommonSubstring && pathSplitByLastCommonSubstring[1])
  //     return pathSplitByLastCommonSubstring[1]; //.join('.');
  //   if (prefixMatches.length > 0) return prefixMatches.join('.');
  //   return false;
  // }

  function replaceTypeAliases(
    nestedTypes: KeyValPair<TypeSummary<CombinedFieldInfo>>,
    matchNames: string[],
    alias: string,
  ) {
    const updatedTypes = cloneDeep(nestedTypes)!;
    // get field with longest fields, to help with name collisions
    const longestFields = matchNames
      .map((m) => {
        return {
          name: m,
          count:
            // @ts-ignore
            updatedTypes![m].fields != null &&
            // @ts-ignore
            Object.keys(updatedTypes![m].fields).length,
        };
      })
      .slice()
      .sort((a, b) => Number(a.count) - Number(b.count))
      .slice(0, 1);
    // 1. Re-assign typeName to alias (of first similar field)
    if (
      longestFields.length > 0 &&
      longestFields[0]?.name != undefined &&
      updatedTypes[longestFields[0].name] != undefined
    ) {
      updatedTypes[alias] = updatedTypes[longestFields[0].name!]!;
    }
    // 2. Delete extra sub types
    if (matchNames.length >= 1) {
      matchNames.slice().forEach((typeToDelete) => {
        delete updatedTypes[typeToDelete];
      });
    }
    // 3. Replace all typeAliases
    return mapValues(updatedTypes, (subTypeSummary) => {
      subTypeSummary.fields = mapValues(subTypeSummary.fields, (fieldInfo) => {
        if (matchNames.includes(`${fieldInfo.typeRef}`)) {
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

  const firstTypePath = splitTypeNamePaths[0]!;
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
  // console.log(
  //   'suffixMatches',
  //   lastCommonIndex,
  //   firstTypePath.join('.'),
  //   suffixMatches.toString(),
  // );
  const shapeParts = shape.split(/\|/gim).sort();
  let shapeBasedName = shapeParts.length <= 2 ? shapeParts.join('.') : null;

  return {
    shapeBasedName,
    shape,
    typePaths,
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
      lastCommonKey: suffixMatches ? suffixMatches[0] : null,
      nextToLastCommonKey:
        suffixMatches && suffixMatches.length >= 2 ? suffixMatches[1] : null,
    },
    setOperations: {
      intersection: intersection(...splitTypeNamePaths).join('.'),
      difference:
        splitTypeNamePaths.length > 0
          ? // @ts-ignore
            difference(...splitTypeNamePaths)
          : undefined,
      union: union(...splitTypeNamePaths).join('.'),
      xor: xor(...splitTypeNamePaths)
        .slice()
        .sort()
        .join('.'),
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

/**
 * assignInferredNames applies 'logic rules' as follows:
 * - if suffixMatchLength === 1, prefixMatchLength === 0
 * - if typePaths.length === 1, use it w/o changes.
 * - if shape has 2-columns (minus ID or _ID)
 * - if fieldCount > 2 && XOR <= 4
 *
 *
 * @param shapeAndNameSuggestions
 * Example input:
 * ```
 * {
 *    'Births|Deaths|Events': ['historicEvent.data'],
 *    'html|links|no_year_html|text|year': [
 *      'historicEvent.data.Events',
 *      'historicEvent.data.Births',
 *      'historicEvent.data.Deaths',
 *    ],
 *    'link|title': [
 *      'historicEvent.data.Events.links',
 *      'historicEvent.data.Births.links',
 *      'historicEvent.data.Deaths.links',
 *    ],
 *    'id|link|title': [
 *      'historicEvent.data.Events.articles',
 *      'historicEvent.data.Births.articles',
 *      'historicEvent.data.Deaths.articles',
 *    ],
 *    'address|address2|city|state|zip': [
 *      'historicEvent.copyright.owner',
 *      'historicEvent.data.Events.location',
 *    ],
 *  }
 * ```
 */
function assignInferredNames(
  shapeAndNameSuggestions: Record<string, TypeNameSuggestion>,
  excludeNames: string[],
) {
  const resolvedShapeNames = mapValues(
    shapeAndNameSuggestions,
    (suggestionInfo, shape) => {
      const simplifiedShape = __getShapePartsWithoutId(shape).map(
        __removeShapeTypeSpecifier,
      );
      // 1.
      const { suffixMatches } = suggestionInfo;
      if (suffixMatches.length === 1 && __isNameFree(suffixMatches[0]))
        return suffixMatches[0];
      //// Now only change when typePaths.len >= 2 ////
      const { typePaths } = suggestionInfo;
      if (typePaths.length >= 1) {
        // 2.
        if (typePaths.length === 1 && __isNameFree(typePaths[0]))
          return typePaths[0];
        // 2.5
        const {
          exactMatches: { lastCommonKey, nextToLastCommonKey },
        } = suggestionInfo;
        if (lastCommonKey != null && nextToLastCommonKey == null) {
          return lastCommonKey;
        }
        // 3.
        if (
          simplifiedShape.length === 2 &&
          __isNameFree(simplifiedShape.join('.'))
        )
          return simplifiedShape.join('.');
        // 4.
        const {
          setOperations: { xor: xorPath },
        } = suggestionInfo;
        let xorPathKeys = xorPath != null ? xorPath.split('.') : [];
        if (
          xorPathKeys.length <= 4 &&
          simplifiedShape.length >= 3 &&
          __isNameFree(xorPathKeys.join('.'))
        )
          return xorPathKeys.join('.');
      }

      return false;
    },
  );
  function __removeShapeTypeSpecifier(shapeExp) {
    return shapeExp != null && shapeExp.split(':')[0];
  }

  function __getShapePartsWithoutId(shape: string) {
    return shape.split('|').filter((field) => !/^((id)|(_id))/gim.test(field));
  }
  function __isNameFree(proposedTypeName) {
    const inUseAlready = excludeNames.includes(proposedTypeName);
    if (inUseAlready) {
      console.warn(`WARN: Name is in use already: ${proposedTypeName}`);
    } else {
      // not in use, but add to excludeNames
      excludeNames.push(proposedTypeName);
    }
    return !inUseAlready;
  }
  return resolvedShapeNames;
}

export {
  inferTypeNames as _inferTypeNames,
  assignInferredNames as _assignInferredNames,
};
