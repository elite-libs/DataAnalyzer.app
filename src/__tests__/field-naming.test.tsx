import eventSearch from '../../public/data/ticketmaster-event-results.json';
import { consolidateNestedTypes, schemaAnalyzer } from '../schema-analyzer/index';

it('can handle _ prefixed names', async () => {
  const results = await schemaAnalyzer('EventResults', eventSearch, {
    strictMatching: false,
    // consolidateTypes: 'field-names',
    debug: true,
  });
  const consolidatedTypes = consolidateNestedTypes(results.flatTypeSummary.nestedTypes!, {
    consolidateTypes: 'field-names',
  });
  // results.nestedTypes = consolidatedTypes.nestedTypes;
  expect(consolidatedTypes.nestedTypes).toMatchSnapshot();
  expect(consolidatedTypes.nestedTypes).toHaveProperty('classifications');
  expect(consolidatedTypes.nestedTypes).toHaveProperty('_links');
});

// it('can transform highly nested types', () => {
//   const typeAliases = {
//     shapeToType: {
//       'next|self': ['EventResults._links'],
//       events: ['EventResults._embedded'],
//       'number|size|totalElements|totalPages': ['EventResults.page'],
//       'href|templated': ['EventResults._links.self', 'EventResults._links.next'],
//       '_embedded|_links|classifications|dates|id|images|locale|name|promoter|sales|test|type|url': [
//         'EventResults._embedded.events',
//       ],
//       'fallback|height|ratio|url|width': [
//         'EventResults._embedded.events.images',
//         'EventResults._embedded.events._embedded.attractions.images',
//       ],
//       public: ['EventResults._embedded.events.sales'],
//       'start|status|timezone': ['EventResults._embedded.events.dates'],
//       'genre|primary|segment|subGenre': [
//         'EventResults._embedded.events.classifications',
//         'EventResults._embedded.events._embedded.attractions.classifications',
//       ],
//       id: [
//         'EventResults._embedded.events.promoter',
//         'EventResults._embedded.events._embedded.venues.markets',
//       ],
//       'attractions|self|venues': ['EventResults._embedded.events._links'],
//       'attractions|venues': ['EventResults._embedded.events._embedded'],
//       'endDateTime|startDateTime|startTBD': [
//         'EventResults._embedded.events.sales.public',
//       ],
//       'dateTBA|dateTBD|localDate|noSpecificTime|timeTBA': [
//         'EventResults._embedded.events.dates.start',
//       ],
//       code: ['EventResults._embedded.events.dates.status'],
//       'id|name': [
//         'EventResults._embedded.events.classifications.segment',
//         'EventResults._embedded.events.classifications.genre',
//         'EventResults._embedded.events.classifications.subGenre',
//         'EventResults._embedded.events._embedded.attractions.classifications.segment',
//         'EventResults._embedded.events._embedded.attractions.classifications.genre',
//         'EventResults._embedded.events._embedded.attractions.classifications.subGenre',
//       ],
//       href: [
//         'EventResults._embedded.events._links.self',
//         'EventResults._embedded.events._links.attractions',
//         'EventResults._embedded.events._links.venues',
//         'EventResults._embedded.events._embedded.venues._links.self',
//         'EventResults._embedded.events._embedded.attractions._links.self',
//       ],
//       '_links|address|city|country|id|locale|location|markets|name|postalCode|state|test|timezone|type': [
//         'EventResults._embedded.events._embedded.venues',
//       ],
//       '_links|classifications|id|images|locale|name|test|type': [
//         'EventResults._embedded.events._embedded.attractions',
//       ],
//       name: ['EventResults._embedded.events._embedded.venues.city'],
//       'name|stateCode': ['EventResults._embedded.events._embedded.venues.state'],
//       'countryCode|name': ['EventResults._embedded.events._embedded.venues.country'],
//       line1: ['EventResults._embedded.events._embedded.venues.address'],
//       'latitude|longitude': ['EventResults._embedded.events._embedded.venues.location'],
//       self: [
//         'EventResults._embedded.events._embedded.venues._links',
//         'EventResults._embedded.events._embedded.attractions._links',
//       ],
//     },
//     typeToShape: {
//       'EventResults._links': 'next|self',
//       'EventResults._embedded': 'events',
//       'EventResults.page': 'number|size|totalElements|totalPages',
//       'EventResults._links.self': 'href|templated',
//       'EventResults._links.next': 'href|templated',
//       'EventResults._embedded.events':
//         '_embedded|_links|classifications|dates|id|images|locale|name|promoter|sales|test|type|url',
//       'EventResults._embedded.events.images': 'fallback|height|ratio|url|width',
//       'EventResults._embedded.events.sales': 'public',
//       'EventResults._embedded.events.dates': 'start|status|timezone',
//       'EventResults._embedded.events.classifications': 'genre|primary|segment|subGenre',
//       'EventResults._embedded.events.promoter': 'id',
//       'EventResults._embedded.events._links': 'attractions|self|venues',
//       'EventResults._embedded.events._embedded': 'attractions|venues',
//       'EventResults._embedded.events.sales.public': 'endDateTime|startDateTime|startTBD',
//       'EventResults._embedded.events.dates.start':
//         'dateTBA|dateTBD|localDate|noSpecificTime|timeTBA',
//       'EventResults._embedded.events.dates.status': 'code',
//       'EventResults._embedded.events.classifications.segment': 'id|name',
//       'EventResults._embedded.events.classifications.genre': 'id|name',
//       'EventResults._embedded.events.classifications.subGenre': 'id|name',
//       'EventResults._embedded.events._links.self': 'href',
//       'EventResults._embedded.events._links.attractions': 'href',
//       'EventResults._embedded.events._links.venues': 'href',
//       'EventResults._embedded.events._embedded.venues':
//         '_links|address|city|country|id|locale|location|markets|name|postalCode|state|test|timezone|type',
//       'EventResults._embedded.events._embedded.attractions':
//         '_links|classifications|id|images|locale|name|test|type',
//       'EventResults._embedded.events._embedded.venues.city': 'name',
//       'EventResults._embedded.events._embedded.venues.state': 'name|stateCode',
//       'EventResults._embedded.events._embedded.venues.country': 'countryCode|name',
//       'EventResults._embedded.events._embedded.venues.address': 'line1',
//       'EventResults._embedded.events._embedded.venues.location': 'latitude|longitude',
//       'EventResults._embedded.events._embedded.venues.markets': 'id',
//       'EventResults._embedded.events._embedded.venues._links': 'self',
//       'EventResults._embedded.events._embedded.venues._links.self': 'href',
//       'EventResults._embedded.events._embedded.attractions.images':
//         'fallback|height|ratio|url|width',
//       'EventResults._embedded.events._embedded.attractions.classifications':
//         'genre|primary|segment|subGenre',
//       'EventResults._embedded.events._embedded.attractions._links': 'self',
//       'EventResults._embedded.events._embedded.attractions.classifications.segment':
//         'id|name',
//       'EventResults._embedded.events._embedded.attractions.classifications.genre':
//         'id|name',
//       'EventResults._embedded.events._embedded.attractions.classifications.subGenre':
//         'id|name',
//       'EventResults._embedded.events._embedded.attractions._links.self': 'href',
//     },
//     shapeAlias: {},
//   };
// });
