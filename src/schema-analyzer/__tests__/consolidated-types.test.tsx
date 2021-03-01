import historicEvents from '../../../public/data/historic-events.json';
import pokemonCharmander from '../../../public/data/pokemon-charmander.json';

describe('#can resolve names for `historicEvent` set', () => {
  const typeShapeInfo = {
    shapeToType: {
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
    },
    typeToShape: {
      'historicEvent.data': 'Births|Deaths|Events',
      'historicEvent.data.Events': 'html|links|no_year_html|text|year',
      'historicEvent.data.Births': 'html|links|no_year_html|text|year',
      'historicEvent.data.Deaths': 'html|links|no_year_html|text|year',
      'historicEvent.data.Events.links': 'link|title',
      'historicEvent.data.Births.links': 'link|title',
      'historicEvent.data.Deaths.links': 'link|title',
    },
  };
});

describe('#can resolve names for `Pokemon` data', () => {
  const typeShapeInfo = {
    shapeToType: {
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
      'front_default:String': ['Pokemon.sprites.other.official-artwork'],
      'red-blue:Pokemon.sprites.versions.generation-i.red-blue|yellow:Pokemon.sprites.versions.generation-i.yellow': [
        'Pokemon.sprites.versions.generation-i',
      ],
      'crystal:Pokemon.sprites.versions.generation-ii.crystal|gold:Pokemon.sprites.versions.generation-ii.gold|silver:Pokemon.sprites.versions.generation-ii.silver': [
        'Pokemon.sprites.versions.generation-ii',
      ],
      'emerald:Pokemon.sprites.versions.generation-iii.emerald|firered-leafgreen:Pokemon.sprites.versions.generation-iii.firered-leafgreen|ruby-sapphire:Pokemon.sprites.versions.generation-iii.ruby-sapphire': [
        'Pokemon.sprites.versions.generation-iii',
      ],
      'diamond-pearl:Pokemon.sprites.versions.generation-iv.diamond-pearl|heartgold-soulsilver:Pokemon.sprites.versions.generation-iv.heartgold-soulsilver|platinum:Pokemon.sprites.versions.generation-iv.platinum': [
        'Pokemon.sprites.versions.generation-iv',
      ],
      'black-white:Pokemon.sprites.versions.generation-v.black-white': [
        'Pokemon.sprites.versions.generation-v',
      ],
      'omegaruby-alphasapphire:Pokemon.sprites.versions.generation-vi.omegaruby-alphasapphire|x-y:Pokemon.sprites.versions.generation-vi.x-y': [
        'Pokemon.sprites.versions.generation-vi',
      ],
      'icons:Pokemon.sprites.versions.generation-vii.icons|ultra-sun-ultra-moon:Pokemon.sprites.versions.generation-vii.ultra-sun-ultra-moon': [
        'Pokemon.sprites.versions.generation-vii',
      ],
      'icons:Pokemon.sprites.versions.generation-viii.icons': [
        'Pokemon.sprites.versions.generation-viii',
      ],
      'back_default:String|back_gray:String|front_default:String|front_gray:String': [
        'Pokemon.sprites.versions.generation-i.red-blue',
        'Pokemon.sprites.versions.generation-i.yellow',
      ],
      'back_default:String|back_shiny:String|front_default:String|front_shiny:String': [
        'Pokemon.sprites.versions.generation-ii.crystal',
        'Pokemon.sprites.versions.generation-ii.gold',
        'Pokemon.sprites.versions.generation-ii.silver',
        'Pokemon.sprites.versions.generation-iii.firered-leafgreen',
        'Pokemon.sprites.versions.generation-iii.ruby-sapphire',
      ],
      'front_default:String|front_shiny:String': [
        'Pokemon.sprites.versions.generation-iii.emerald',
      ],
      'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null': [
        'Pokemon.sprites.versions.generation-iv.diamond-pearl',
        'Pokemon.sprites.versions.generation-iv.heartgold-soulsilver',
        'Pokemon.sprites.versions.generation-iv.platinum',
        'Pokemon.sprites.versions.generation-v.black-white.animated',
      ],
      'animated:Pokemon.sprites.versions.generation-v.black-white.animated|back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null': [
        'Pokemon.sprites.versions.generation-v.black-white',
      ],
      'front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null': [
        'Pokemon.sprites.versions.generation-vi.omegaruby-alphasapphire',
        'Pokemon.sprites.versions.generation-vi.x-y',
        'Pokemon.sprites.versions.generation-vii.ultra-sun-ultra-moon',
      ],
    },
    typeToShape: {
      'Pokemon.abilities':
        'ability:Pokemon.abilities.ability|is_hidden:Boolean|slot:Number',
      'Pokemon.forms': 'name:String|url:String',
      'Pokemon.game_indices':
        'game_index:Number|version:Pokemon.game_indices.version',
      'Pokemon.moves':
        'move:Pokemon.moves.move|version_group_details:Pokemon.moves.version_group_details',
      'Pokemon.species': 'name:String|url:String',
      'Pokemon.sprites':
        'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null|other:Pokemon.sprites.other|versions:Pokemon.sprites.versions',
      'Pokemon.stats': 'base_stat:Number|effort:Number|stat:Pokemon.stats.stat',
      'Pokemon.types': 'slot:Number|type:Pokemon.types.type',
      'Pokemon.abilities.ability': 'name:String|url:String',
      'Pokemon.game_indices.version': 'name:String|url:String',
      'Pokemon.moves.move': 'name:String|url:String',
      'Pokemon.moves.version_group_details':
        'level_learned_at:Number|move_learn_method:Pokemon.moves.version_group_details.move_learn_method|version_group:Pokemon.moves.version_group_details.version_group',
      'Pokemon.moves.version_group_details.move_learn_method':
        'name:String|url:String',
      'Pokemon.moves.version_group_details.version_group':
        'name:String|url:String',
      'Pokemon.sprites.other':
        'dream_world:Pokemon.sprites.other.dream_world|official-artwork:Pokemon.sprites.other.official-artwork',
      'Pokemon.sprites.versions':
        'generation-i:Pokemon.sprites.versions.generation-i|generation-ii:Pokemon.sprites.versions.generation-ii|generation-iii:Pokemon.sprites.versions.generation-iii|generation-iv:Pokemon.sprites.versions.generation-iv|generation-v:Pokemon.sprites.versions.generation-v|generation-vi:Pokemon.sprites.versions.generation-vi|generation-vii:Pokemon.sprites.versions.generation-vii|generation-viii:Pokemon.sprites.versions.generation-viii',
      'Pokemon.sprites.other.dream_world':
        'front_default:String|front_female:Null',
      'Pokemon.sprites.other.official-artwork': 'front_default:String',
      'Pokemon.sprites.versions.generation-i':
        'red-blue:Pokemon.sprites.versions.generation-i.red-blue|yellow:Pokemon.sprites.versions.generation-i.yellow',
      'Pokemon.sprites.versions.generation-iii':
        'emerald:Pokemon.sprites.versions.generation-iii.emerald|firered-leafgreen:Pokemon.sprites.versions.generation-iii.firered-leafgreen|ruby-sapphire:Pokemon.sprites.versions.generation-iii.ruby-sapphire',
      'Pokemon.sprites.versions.generation-iv':
        'diamond-pearl:Pokemon.sprites.versions.generation-iv.diamond-pearl|heartgold-soulsilver:Pokemon.sprites.versions.generation-iv.heartgold-soulsilver|platinum:Pokemon.sprites.versions.generation-iv.platinum',
      'Pokemon.sprites.versions.generation-v':
        'black-white:Pokemon.sprites.versions.generation-v.black-white',
      'Pokemon.sprites.versions.generation-vi':
        'omegaruby-alphasapphire:Pokemon.sprites.versions.generation-vi.omegaruby-alphasapphire|x-y:Pokemon.sprites.versions.generation-vi.x-y',
      'Pokemon.sprites.versions.generation-vii':
        'icons:Pokemon.sprites.versions.generation-vii.icons|ultra-sun-ultra-moon:Pokemon.sprites.versions.generation-vii.ultra-sun-ultra-moon',
      'Pokemon.sprites.versions.generation-viii':
        'icons:Pokemon.sprites.versions.generation-viii.icons',
      'Pokemon.sprites.versions.generation-i.red-blue':
        'back_default:String|back_gray:String|front_default:String|front_gray:String',
      'Pokemon.sprites.versions.generation-i.yellow':
        'back_default:String|back_gray:String|front_default:String|front_gray:String',
      'Pokemon.sprites.versions.generation-ii.crystal':
        'back_default:String|back_shiny:String|front_default:String|front_shiny:String',
      'Pokemon.sprites.versions.generation-ii.gold':
        'back_default:String|back_shiny:String|front_default:String|front_shiny:String',
      'Pokemon.sprites.versions.generation-ii.silver':
        'back_default:String|back_shiny:String|front_default:String|front_shiny:String',
      'Pokemon.sprites.versions.generation-iii.emerald':
        'front_default:String|front_shiny:String',
      'Pokemon.sprites.versions.generation-iii.firered-leafgreen':
        'back_default:String|back_shiny:String|front_default:String|front_shiny:String',
      'Pokemon.sprites.versions.generation-iii.ruby-sapphire':
        'back_default:String|back_shiny:String|front_default:String|front_shiny:String',
      'Pokemon.sprites.versions.generation-iv.diamond-pearl':
        'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-iv.heartgold-soulsilver':
        'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-iv.platinum':
        'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-v.black-white':
        'animated:Pokemon.sprites.versions.generation-v.black-white.animated|back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-v.black-white.animated':
        'back_default:String|back_female:Null|back_shiny:String|back_shiny_female:Null|front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-vi.omegaruby-alphasapphire':
        'front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-vi.x-y':
        'front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-vii.icons':
        'front_default:String|front_female:Null',
      'Pokemon.sprites.versions.generation-vii.ultra-sun-ultra-moon':
        'front_default:String|front_female:Null|front_shiny:String|front_shiny_female:Null',
      'Pokemon.sprites.versions.generation-viii.icons':
        'front_default:String|front_female:Null',
      'Pokemon.stats.stat': 'name:String|url:String',
      'Pokemon.types.type': 'name:String|url:String',
    },
  };
});
