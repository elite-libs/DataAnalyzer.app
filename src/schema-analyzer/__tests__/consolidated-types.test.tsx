import { mapValues } from 'lodash';
import historicEvents from '../../../public/data/historic-events.json';
import pokemonCharmander from '../../../public/data/pokemon-charmander.json';
import {
  _assignInferredNames,
  _inferTypeNames,
} from '../utils/consolidate-nested-types';

describe('#consolidated-types', () => {
  it('#can resolve names for `EventResults` set', () => {
    const input = {
      'id|name': [
        'EventResults._embedded.events.classifications.segment',
        'EventResults._embedded.events.classifications.genre',
        'EventResults._embedded.events.classifications.subGenre',
        'EventResults._embedded.events._embedded.attractions.classifications.segment',
        'EventResults._embedded.events._embedded.attractions.classifications.genre',
        'EventResults._embedded.events._embedded.attractions.classifications.subGenre',
      ],
      href: [
        'EventResults._embedded.events._links.self',
        'EventResults._embedded.events._links.attractions',
        'EventResults._embedded.events._links.venues',
        'EventResults._embedded.events._embedded.venues._links.self',
        'EventResults._embedded.events._embedded.attractions._links.self',
      ],
    };
    const expected = {
      'id|name': 'id.name',
      href: 'href',
    };
    const results = mapValues(input, _inferTypeNames);
    expect(results).toMatchSnapshot();
    const assignedNames = _assignInferredNames(results, []);
    expect(assignedNames).toStrictEqual(expected);
    expect(assignedNames).toMatchSnapshot();
  });
  it('#can resolve names for `historicEvent` set', () => {
    const input = {
      'Births|Deaths|Events': ['historicEvent.data'],
      'html|links|no_year_html|text|year': [
        'historicEvent.data.Events',
        'historicEvent.data.Births',
        'historicEvent.data.Deaths',
      ],
      'link|title': [
        'historicEvent.data.Events.links',
        'historicEvent.data.Births.links',
        'historicEvent.data.Deaths.links',
      ],
      'id|title|description': [
        'historicEvent.data.Events.articles',
        'historicEvent.data.Births.articles',
        'historicEvent.data.Deaths.articles',
      ],
      'id|name|value': [
        'historicEvent.adminFields',
        'historicEvent.metadata',
        'historicEvent.data.Events.metadata',
      ],
      'address|address2|city|state|zip': [
        'historicEvent.copyright.owner',
        'historicEvent.data.Events.location',
      ],
    };
    const expected = {
      // single typePath, so use it w/o changes
      'Births|Deaths|Events': 'historicEvent.data',
      // fieldCount > 2 && XOR <= 4, then use XOR: 'Births.Deaths.Events',
      'html|links|no_year_html|text|year': 'Births.Deaths.Events',
      // suffixMatchLength === 1, prefixMatchLength === 0
      'link|title': 'links',
      // based on suffixLength === 1
      'id|title|description': 'articles',
      // name based on 2-column shape (minus ID)
      'id|name|value': 'name.value',
      // Unknown, return false
      'address|address2|city|state|zip': false,
    };
    const results = mapValues(input, _inferTypeNames);
    const assignedNames = _assignInferredNames(results, []);

    expect(assignedNames).toStrictEqual(expected);
    expect(results).toMatchSnapshot();
    expect(assignedNames).toMatchSnapshot();
  });

  it('#can resolve names for `pokemon` set', () => {
    const input = {
      'ability:Pokemon.abilities.ability|is_hidden:Boolean|slot:Number': [
        'Pokemon.abilities',
      ],
      'name:String|url:String': [
        'Pokemon.forms',
        'Pokemon.species',
        'Pokemon.abilities.ability',
        'Pokemon.game_indices.version',
        'Pokemon.moves.move',
        'Pokemon.moves.version_group_details.move_learn_method',
        'Pokemon.moves.version_group_details.version_group',
        'Pokemon.stats.stat',
        'Pokemon.types.type',
      ],
      'game_index:Number|version:Pokemon.game_indices.version': [
        'Pokemon.game_indices',
      ],
      'move:Pokemon.moves.move|version_group_details:Pokemon.moves.version_group_details': [
        'Pokemon.moves',
      ],
      'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null|other:Pokemon.sprites.other|versions:Pokemon.sprites.versions': [
        'Pokemon.sprites',
      ],
      'base_stat:Number|effort:Number|stat:Pokemon.stats.stat': [
        'Pokemon.stats',
      ],
      'slot:Number|type:Pokemon.types.type': ['Pokemon.types'],
      'level_learned_at:Number|move_learn_method:Pokemon.moves.version_group_details.move_learn_method|version_group:Pokemon.moves.version_group_details.version_group': [
        'Pokemon.moves.version_group_details',
      ],
      'dream_world:Pokemon.sprites.other.dream_world|official-artwork:Pokemon.sprites.other.official-artwork': [
        'Pokemon.sprites.other',
      ],
      'generation-i:Pokemon.sprites.versions.generation-i|generation-ii:Pokemon.sprites.versions.generation-ii|generation-iii:Pokemon.sprites.versions.generation-iii|generation-iv:Pokemon.sprites.versions.generation-iv|generation-v:Pokemon.sprites.versions.generation-v|generation-vi:Pokemon.sprites.versions.generation-vi|generation-vii:Pokemon.sprites.versions.generation-vii|generation-viii:Pokemon.sprites.versions.generation-viii': [
        'Pokemon.sprites.versions',
      ],
      'front_default:String|front_female:Null': [
        'Pokemon.sprites.other.dream_world',
        'Pokemon.sprites.versions.generation-vii.icons',
        'Pokemon.sprites.versions.generation-viii.icons',
      ],
    };

    const expected = {
      'ability:Pokemon.abilities.ability|is_hidden:Boolean|slot:Number':
        'Pokemon.abilities',
      'name:String|url:String': 'name.url',
      'game_index:Number|version:Pokemon.game_indices.version':
        'Pokemon.game_indices',
      'move:Pokemon.moves.move|version_group_details:Pokemon.moves.version_group_details':
        'Pokemon.moves',
      'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null|other:Pokemon.sprites.other|versions:Pokemon.sprites.versions':
        'Pokemon.sprites',
      'base_stat:Number|effort:Number|stat:Pokemon.stats.stat': 'Pokemon.stats',
      'slot:Number|type:Pokemon.types.type': 'Pokemon.types',
      'level_learned_at:Number|move_learn_method:Pokemon.moves.version_group_details.move_learn_method|version_group:Pokemon.moves.version_group_details.version_group':
        'Pokemon.moves.version_group_details',
      'dream_world:Pokemon.sprites.other.dream_world|official-artwork:Pokemon.sprites.other.official-artwork':
        'Pokemon.sprites.other',
      'generation-i:Pokemon.sprites.versions.generation-i|generation-ii:Pokemon.sprites.versions.generation-ii|generation-iii:Pokemon.sprites.versions.generation-iii|generation-iv:Pokemon.sprites.versions.generation-iv|generation-v:Pokemon.sprites.versions.generation-v|generation-vi:Pokemon.sprites.versions.generation-vi|generation-vii:Pokemon.sprites.versions.generation-vii|generation-viii:Pokemon.sprites.versions.generation-viii':
        'Pokemon.sprites.versions',
      'front_default:String|front_female:Null': 'front_default.front_female',
    };

    const results = mapValues(input, _inferTypeNames);
    const assignedNames = _assignInferredNames(results, []);
    // console.log(assignedNames);
    expect(assignedNames).toStrictEqual(expected);
    expect(results).toMatchSnapshot();
    expect(assignedNames).toMatchSnapshot();
  });
});
