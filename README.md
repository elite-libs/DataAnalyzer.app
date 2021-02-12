# DataAnalyzer.app

> **DataAnalyzer understands and converts any JSON (or CSV) data into type-aware code for any language!**

> A passion project by [Dan Levy](https://danlevy.net/) ✨

## Summary

If you consume popular APIs or utilize Component libraries, you've probably had the tedious task of re-implementing data structures you (hopefully) found in documentation.

What happens in the all-too-common case when the docs are wrong, outdated or missing?

With internal or private APIs the situation is generally worse.

When facing unreliable docs, often **all you can count on is the actual HTTP response data.**

## Solution

DataAnalyzer.app to the rescue!

It can ingest raw data and generate intelligent type-aware code.

The `schema-analyzer` uses a highly [extensible][1] [adapter/template][2] [pattern][3] which can accommodate almost any kind of output. (e.g. SQL, ORM, GraphQL, Classes/Interfaces, Swagger JSON, JSON Schema to Protocol Buffers, and much more.)

[View completed features](#completed)

> Issues/Requests/PRs welcome! :heart:

[View open tasks](#todo)

### Wait, there's more!

DataAnalyzer has 3 Powerful Features to Explore:

#### 1. Analyze column type & size stats from any JSON/CSV!

#### 2. Generate auto-typed code & database interfaces, instantly!

#### 3. Visualize results, explore & understand your data structure!

## Features

> The primary goal is to support any input JSON/CSV and infer as much as possible.
> More data will generally yield better results.

#### Completed

- [x] Heuristic type analysis for arrays of objects.
- [x] Nested data structure & multi-table relational output.
- [x] Browser-based (local, no server used.)
- [x] Automatic type detection for:
  - [x] ID - Identifier column, by name and unique Integer check (detects BigInteger)
  - [x] ObjectId (MongoDB's 96 bit/12 Byte ID. 32bit timestamp + 24bit MachineID + 16bit ProcessID + 24bit Counter)
  - [x] UUID/GUID (Common 128 bit/16 Byte ID. Stored as a hex string, dash delimited in parts: 8, 4, 4, 4, 12)
  - [x] Boolean (detects obvious strings `true`, `false`, `Y`, `N`)
  - [x] Date (Smart detection via comprehensive regex pattern)
  - [x] Timestamp (integer, number of milliseconds since unix epoch)
  - [x] Currency (62 currency symbols supported)
  - [x] Float (w/ scale & precision measurements)
  - [x] Number (Integers)
  - [x] Null (sparse column data helps w/ certain inferences)
  - [x] String (big text and variable character length awareness)
  - [x] Array (includes min/max/avg length)
  - [x] Object
  - **Specialty Types**
  - [x] Email (falls back to string)
- [x] Detects column size minimum, maximum and average
- [x] Includes data points at the 30th, 60th and 90th percentiles (for detecting outliers and enum types!)
- [x] Handles some error/outliers
- [x] Quantify # of unique values per column
- [x] Identify `enum` Fields w/ Values
- [x] Identify `Not Null` fields
- [x] _Normalize_ structured JSON into flat typed objects.

**Note:** CSV files must include column names.

#### TODO

**Bugs**

- [ ] Mongoose.writer: Nested types duplicate module imports.
- [ ] Mongoose.writer: Nested types don't use actual nested table's PRIMARY KEY (the $ref Name.)
- [ ] Knex.writer: Recursive nested table support (n-Depth.)
- [ ] SQL.writer: Recursive nested table support (n-Depth.)
- [ ] SQL.writer: Use actual nested table ID Column in FOREIGN KEY.
- [ ] SQL.writer: Null/nullable fields emit correctly.

**Better code generator support**

- [ ] Render output using [handlebars templates](https://handlebarsjs.com/guide/).
- [ ] Support multiple output files.

**Type inference & detection**

- [ ] BigInteger/BigNumber
- [ ] Latitude & Longitude (Coordinate pairs)

**Web App Interface**

- [ ] Migrate leftover Bootstrap utility classes to Material.
- [ ] [Fix options & overall menu](https://material-ui.com/components/drawers/#mini-variant-drawer)
- [ ] [Add App Bar](https://material-ui.com/components/app-bar/)
- [ ] Make the Input and Output sections collapse/toggle-able.
- [ ] Complete Web Worker for Background Processing.
- [ ] Add confirmation for processing lots of data. (Rows and raw MB limit?)

**Code Writers**

- [ ] SQL `CREATE TABLE` - **Coming soon**
- [ ] Code for Libraries like `Yup` or `Joi`
- [ ] JSON Schemas (for libraries like `ajv`)
- [ ] Swagger yaml Reader/Writer
- [ ] Binary Encoders (protocol buffers, thrift, avro)
- [ ] Java Persistence API
- [ ] Rails Models

### Project Goals

The primary goal is to support any input JSON/CSV and infer as much as possible. More data will generally yield better results.

- [x] Support SQL & noSQL systems!
- [x] Automatic type detection!
- [x] Detects String & Number size constraints (for SQL, Binary encoding)!
- [x] Handles error/outliers intelligently
- [x] Ignores error/outlier records!
- [x] Smart field name formatting, snake-case vs. camel-case!
- [x] Detects unique columns!
- [x] Detects enum Fields!
- [x] Detects `Not Null` fields!
- [x] Extensible design, add new output/target with ease!
- [x] Nested data structure & multi-table relational output!

### Output Support

- [x] Mongoose Schema definition - https://mongoosejs.com/
- [x] Knex Migration scripts - https://knexjs.org
- [x] TypeScript Types

## Tips & Notes

For `enum` detection, adjust the relevant thresholds if you know (approximately) the expected number of unique enum values. For more accurate results, provide a randomized sample of 100+ rows. Accuracy increases (and speed decreases) greatly with 1,000+ rows.

- Enumeration detection.
  - Can set a required row count (default 100 rows)
  - The next enum limit is the max number of unique values allowed?
    - For example, with `10` max enum items:
    - Only fields with a `uniqueCount <= 10` will 'match' as enumerations and include an `enum` property.
- `Not Null` detection.

> For more info on the **Schema Analyzer** (core library) powering the [DataAnalyzer.app](https://dataanalyzer.app/), check out the [`schema-analyzer` docs!](./README.library.md)

### Included Type Matchers

Some of these (`Email`) are aliases of a base type (`String`). See code for more details on structure/relationship.

- `Unknown`
- `ObjectId`
- `UUID`
- `Boolean`
- `Date`
- `Timestamp`
- `Currency`
- `Float`
- `Number`
- `Email`
- `String`
- `Array`
- `Object`
- `Null`

## Similar/Alternative Projects

- https://github.com/quicktype/quicktype
- https://github.com/jvilk/MakeTypes
- https://github.com/SweetIQ/schemats
- https://github.com/vojtechhabarta/typescript-generator

[1]: https://github.com/justsml/DataAnalyzer.app/blob/main/src/components/SchemaTools/adapters/writer.typescript.ts
[2]: https://github.com/justsml/DataAnalyzer.app/blob/main/src/components/SchemaTools/adapters/writer.knex.ts
[3]: https://github.com/justsml/DataAnalyzer.app/blob/main/src/components/SchemaTools/adapters/writer.mongoose.ts
