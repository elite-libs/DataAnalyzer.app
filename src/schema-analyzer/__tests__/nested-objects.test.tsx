import { schemaAnalyzer, extractNestedTypes } from '../';
import historicEvents from '../../../public/data/historic-events.json';
import pokemonCharmander from '../../../public/data/pokemon-charmander.json';

describe('#nested non-array object types', () => {
  // Uses data from http://history.muffinlabs.com/date/2/16
  it('can parse nested objects (non-array)', async () => {
    try {
      const result = await schemaAnalyzer('historicEvent', historicEvents);
      console.log(JSON.stringify(result, null, 2));
      expect(result).toMatchSnapshot();
      expect(Object.keys(result.fields)).toStrictEqual(['date', 'url', 'data']);
      expect(result.nestedTypes).not.toBeNull();
      expect(result.nestedTypes?.['historicEvent.data']).toBeDefined();
      expect(
        Object.keys(result.nestedTypes?.['historicEvent.data'].fields),
      ).toStrictEqual(['Events', 'Births', 'Deaths']);
    } catch (error) {
      console.error('ERROR:', error);
    }
  });
  // https://pokeapi.co/api/v2/pokemon/4
  // pokemonCharmander
});
