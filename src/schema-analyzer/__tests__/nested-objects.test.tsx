import {
  ISchemaAnalyzerOptions,
  schemaAnalyzer,
  helpers,
  consolidateNestedTypes,
} from '../';
import historicEvents from '../../../public/data/historic-events.json';
import pokemonCharmander from '../../../public/data/pokemon-charmander.json';

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
        result.nestedTypes = consolidateNestedTypes(result.nestedTypes, {
          consolidateTypes: 'field-names',
        });
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
          'links',
        ]);
        expect(result.nestedTypes?.['historicEvent.data']).toBeDefined();
        expect(
          Object.keys(result.nestedTypes?.['historicEvent.data']?.fields!),
        ).toStrictEqual(['year', 'text', 'html', 'no_year_html', 'links']);
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
        result.nestedTypes = consolidateNestedTypes(result.nestedTypes, {
          consolidateTypes: 'field-names-and-type',
        });
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
        result.nestedTypes = consolidateNestedTypes(result.nestedTypes, {
          consolidateTypes: 'field-names',
        });
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
  // https://pokeapi.co/api/v2/pokemon/4
  // pokemonCharmander
});
