import {
  ISchemaAnalyzerOptions,
  schemaAnalyzer,
  helpers,
  consolidateNestedTypes,
} from '../';
import historicEvents from '../../../public/data/historic-events.json';
// https://pokeapi.co/api/v2/pokemon/4
import pokemonCharmander from '../../../public/data/pokemon-charmander.json';
import usersNotes from '../../../public/data/user-notes.json';

describe('#nested objects', () => {
  // Uses data from http://history.muffinlabs.com/date/2/16
  it('can parse nested objects (non-array)', async () => {
    try {
      const result = await schemaAnalyzer('historicEvent', historicEvents);
      // console.log(JSON.stringify(result, null, 2));
      expect(result).toMatchSnapshot();
      expect(Object.keys(result.fields)).toStrictEqual(['date', 'url', 'data']);
      expect(result.nestedTypes).not.toBeNull();
      expect(result.nestedTypes?.['historicEvent.data']).toBeDefined();
      expect(Object.keys(result.nestedTypes)).toStrictEqual([
        'historicEvent.data',
        'historicEvent.data.Events',
        'historicEvent.data.Births',
        'historicEvent.data.Deaths',
        'historicEvent.data.Events.links',
        'historicEvent.data.Births.links',
        'historicEvent.data.Deaths.links',
      ]);
      expect(
        Object.keys(result.nestedTypes?.['historicEvent.data']?.fields!),
      ).toStrictEqual(['Events', 'Births', 'Deaths']);
    } catch (error) {
      console.error('ERROR:', error);
      throw error;
    }
  });
  describe('#de-duplicating subtypes', () => {
    // Uses data from http://history.muffinlabs.com/date/2/16
    it('can find similar types by field name', async () => {
      try {
        const summary = await schemaAnalyzer('historicEvent', historicEvents, {
          strictMatching: false,
        });
        const result = helpers.flattenTypes(summary, {
          nullableRowsThreshold: 0.0001,
          targetValue: 'p99',
          targetLength: 'p99',
          targetPrecision: 'p99',
          targetScale: 'p99',
        });
        const consolidatedTypes = consolidateNestedTypes(result.nestedTypes, {
          consolidateTypes: 'field-names',
        });
        result.nestedTypes = consolidatedTypes.nestedTypes;
        expect(result.nestedTypes).toMatchSnapshot();
        // console.log(JSON.stringify(result, null, 2));
        // expect(result).toMatchSnapshot();
        expect(Object.keys(result.fields)).toStrictEqual([
          'date',
          'url',
          'data',
        ]);
        expect(result.nestedTypes).not.toBeNull();
        expect(Object.keys(result.nestedTypes)).toStrictEqual([
          'historicEvent.data',
          'Births.Deaths.Events',
          'links',
        ]);
        expect(result.nestedTypes?.['historicEvent.data']).toBeDefined();
        expect(
          Object.keys(result.nestedTypes?.['historicEvent.data']?.fields!),
        ).toStrictEqual(['Events', 'Births', 'Deaths']);
        // expect(
        //   Object.keys(result.nestedTypes?.['historicEvent.data']?.fields!),
        // ).toStrictEqual(['year', 'text', 'html', 'no_year_html', 'links']);
      } catch (error) {
        console.error('ERROR:', error);
        throw error;
      }
    });
    it('can find similar types by field+type (mode: field-names-and-type)', async () => {
      try {
        const summary = await schemaAnalyzer('Pokemon', pokemonCharmander, {
          strictMatching: false,
        });
        const result = helpers.flattenTypes(summary, {
          nullableRowsThreshold: 0.0001,
          targetValue: 'p99',
          targetLength: 'p99',
          targetPrecision: 'p99',
          targetScale: 'p99',
        });
        expect(result.nestedTypes).toMatchSnapshot(
          'Before consolidating types',
        );
        const consolidatedTypeResults = consolidateNestedTypes(
          result.nestedTypes,
          {
            consolidateTypes: 'field-names-and-type',
          },
        );
        result.nestedTypes = consolidatedTypeResults.nestedTypes;
        expect(result.nestedTypes).toMatchSnapshot('After consolidating types');
        // console.log(JSON.stringify(result, null, 2));
        // expect(result).toMatchSnapshot();
        expect(Object.keys(result.fields)).toStrictEqual([
          'abilities',
          'base_experience',
          'forms',
          'game_indices',
          'height',
          'held_items',
          'id',
          'is_default',
          'location_area_encounters',
          'moves',
          'name',
          'order',
          'species',
          'sprites',
          'stats',
          'types',
          'weight',
        ]);
      } catch (error) {
        console.error('ERROR:', error);
        throw error;
      }
    });
    it('can find similar types by field+type (mode: field-names)', async () => {
      try {
        const summary = await schemaAnalyzer('Pokemon', pokemonCharmander, {
          strictMatching: false,
        });
        const result = helpers.flattenTypes(summary, {
          nullableRowsThreshold: 0.0001,
          targetValue: 'p99',
          targetLength: 'p99',
          targetPrecision: 'p99',
          targetScale: 'p99',
        });
        expect(result.nestedTypes).toMatchSnapshot(
          'Before consolidating types',
        );
        const consolidatedTypes = consolidateNestedTypes(result.nestedTypes, {
          consolidateTypes: 'field-names',
        });
        result.nestedTypes = consolidatedTypes.nestedTypes;
        expect(result.nestedTypes).toMatchSnapshot('After consolidating types');
        // console.log(JSON.stringify(result, null, 2));
        // expect(result).toMatchSnapshot();
        expect(Object.keys(result.fields)).toStrictEqual([
          'abilities',
          'base_experience',
          'forms',
          'game_indices',
          'height',
          'held_items',
          'id',
          'is_default',
          'location_area_encounters',
          'moves',
          'name',
          'order',
          'species',
          'sprites',
          'stats',
          'types',
          'weight',
        ]);
      } catch (error) {
        console.error('ERROR:', error);
        throw error;
      }
    });
  });
  it('can skip matching similar types (mode: disabled)', async () => {
    try {
      const summary = await schemaAnalyzer('Pokemon', pokemonCharmander, {
        strictMatching: false,
      });
      const result = helpers.flattenTypes(summary, {
        nullableRowsThreshold: 0.0001,
        targetValue: 'p99',
        targetLength: 'p99',
        targetPrecision: 'p99',
        targetScale: 'p99',
      });

      const consolidatedTypes = consolidateNestedTypes(result.nestedTypes, {
        consolidateTypes: undefined, //'field-names',
      });
    } catch (error) {
      console.error('ERROR:', error);
      throw error;
    }
  });
  it('can emit nested structs', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('User', usersNotes, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'max',
      targetPrecision: 'max',
      targetScale: 'max',
      targetValue: 'max',
      nullableRowsThreshold: 0.001,
    });
    expect(flatResult).toMatchSnapshot();
  });

  it('can emit deeply nested structs', async () => {
    const options = { strictMatching: false };
    const results = await schemaAnalyzer('Pokemon', pokemonCharmander, options);
    const flatResult = helpers.flattenTypes(results, {
      targetLength: 'max',
      targetPrecision: 'max',
      targetScale: 'max',
      targetValue: 'max',
      nullableRowsThreshold: 0.001,
    });
    expect(flatResult).toMatchSnapshot();
  });
});
