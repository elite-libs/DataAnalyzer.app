# DataStep.io



> An Open Source joint by [Dan Levy](https://danlevy.net/) ✨

## 1. Analyze column type & size from any input JSON array!
## 2. Generate magical auto-typed code & database interfaces!


Schema **Analyzer** is the core library behind Dan's [Schema **Generator**](https://github.com/justsml/schema-generator).

### Features

The primary goal is to support any input JSON/CSV and infer as much as possible. More data will generally yield better results.

- [x] Heuristic type analysis for arrays of objects.
- [x] Nested data structure & multi-table relational output.
- [x] Browser-based (local, no server used)
- [x] Automatic type detection:
    - [x] ID - Identifier column, by name and unique Integer check (detects BigInteger)
    - [x] ObjectId (MongoDB's 96 bit/12 Byte ID. 32bit timestamp + 24bit MachineID + 16bit ProcessID + 24bit Counter)
    - [x] UUID/GUID (Common 128 bit/16 Byte ID. Stored as a hex string, dash delimited in parts: 8, 4, 4, 4, 12)
    - [x] Boolean (detects obvious strings `true`, `false`, `Y`, `N`)
    - [x] Date (Smart detection via comprehensive regex pattern)
    - [x] Timestamp (integer, number of milliseconds since unix epoch)
    - [x] Currency (62 currency symbols supported)
    - [x] Float (w/ scale & precision measurements)
    - [x] Number (Integers)
    - [ ] BigInteger/BigNumber
    - [x] Null (sparse column data helps w/ certain inferences)
    - [x] String (big text and varchar awareness)
    - [x] Array (includes min/max/avg length)
    - [x] Object
    - **Specialty Types**
    - [ ] Latitude & Longitude (Coordinate pairs)
    - [x] Email (falls back to string)
- [x] Detects column size minimum, maximum and average
- [x] Includes data points at the 30th, 60th and 90th percentiles (for detecting outliers and enum types!)
- [x] Handles some error/outliers
- [x] Quantify # of unique values per column
- [x] Identify `enum` Fields w/ Values
- [x] Identify `Not Null` fields
- [x] _Normalize_ structured JSON into flat typed objects.



> An Open Source joint by [Dan Levy](https://danlevy.net/) ✨

This project ([DataStep.io](https://github.com/justsml/data-step-io)) is a web app with usage example for it's sibling library [Schema **Analyzer**](https://github.com/justsml/schema-analyzer).

The _Analyzer_ library provides an automatic data type analysis on any given array of objects.

The components included here support **JSON/CSV data!**

## Mini Demo

![./demo_80.gif](./demo_80.gif "using built-in sample analysis")

### Features

The primary goal is to support any input JSON/CSV and infer as much as possible. More data will generally yield better results.

- [x] Support SQL & noSQL systems!
- [x] Automatic type detection!
- [x] Detects String & Number size constraints (for SQL backends)!
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
- [ ] SQL DDL script (Data-definition language) - **Coming soon**
- [ ] Validation Code for Libraries like `Yup` or `Joi`
- [ ] JSON Schemas (for libraries like `ajv`)
- [ ] Outputs for other languages/tools!
- [ ] Binary Encoders (protobufs, thrift, avro?)
- [ ] JPA
- [ ] Models/Ruby



### Using the Library

```bash
npm install schema-analyzer
```

```ts
import { schemaAnalyzer } from 'schema-analyzer'

schemaAnalyzer(schemaName: string, data: any[]): TypeSummary
```

### Preview Analysis Results

> What does this library's analysis look like?

It consists of a few top-level properties:

- `fields: FieldTypeSummary` - a map of field names with all detected types ([includes meta-data](#aggregatesummary) for each type detected, with possible overlaps. e.g. an `Email` is also a `String`, `"42"` is a String and Number)
- `nestedTypes: { [typeAlias: string]: TypeSummary }` - a nested dictionary of sub-types
- `totalRows` - # of rows analyzed.


#### Example Dataset

| id | name            | role      | email                        | createdAt  | accountConfirmed |
|----|-----------------|-----------|------------------------------|------------|------------------|
| 1  | Eve             | poweruser | `eve@example.com`            | 01/20/2020 | undefined        |
| 2  | Alice           | user      | `ali@example.com`            | 02/02/2020 | true             |
| 3  | Bob             | user      | `robert@example.com`         | 12/31/2019 | true             |
| 4  | Elliot Alderson | admin     | `falkensmaze@protonmail.com` | 01/01/2001 | false            |
| 5  | Sam Sepiol      | admin     | `falkensmaze@hotmail.com`    | 9/9/99     | true             |


#### Analysis Results

```json
{
  "schemaName": "sampleUsers",
  "totalRows": 5,
  "fields": {
    "id": {
      "identity": true,
      "types": {
        "Number": {
          "count": 5,
          "value": { "min": 1, "mean": 3, "max": 5, "p25": 2, "p33": 2, "p50": 3, "p66": 4, "p75": 4, "p99": 5 }
        },
        "String": {
          "count": 5,
          "length": { "min": 1, "mean": 1, "max": 1, "p25": 1, "p33": 1, "p50": 1, "p66": 1, "p75": 1, "p99": 1 }
        }
      }
    },
    "name": {
      "types": {
        "String": {
          "count": 5,
          "length": { "min": 3, "mean": 7.2, "max": 15, "p25": 3, "p33": 3, "p50": 5, "p66": 10, "p75": 10, "p99": 15 }
        }
      }
    },
    "role": {
      "types": {
        "String": {
          "count": 5,
          "length": { "min": 4, "mean": 5.4, "max": 9, "p25": 4, "p33": 4, "p50": 5, "p66": 5, "p75": 5, "p99": 9 }
        }
      }
    },
    "email": {
      "types": {
        "Email": {
          "count": 5,
          "length": { "min": 15, "mean": 19.4, "max": 26, "p25": 15, "p33": 15, "p50": 18, "p66": 23, "p75": 23, "p99": 26 }
        }
      }
    },
    "createdAt": {
      "types": {
        "Date": {
          "count": 4,
          "value": { "min": "2001-01-01T00:00:00.000Z", "mean": "2015-04-14T18:00:00.000Z", "max": "2020-02-02T00:00:00.000Z", "p25": "2020-02-02T00:00:00.000Z", "p33": "2020-02-02T00:00:00.000Z", "p50": "2019-12-31T00:00:00.000Z", "p66": "2019-12-31T00:00:00.000Z", "p75": "2001-01-01T00:00:00.000Z", "p99": "2001-01-01T00:00:00.000Z" }
        },
        "String": {
          "count": 1,
          "length": { "min": 6, "mean": 6, "max": 6, "p25": 6, "p33": 6, "p50": 6, "p66": 6, "p75": 6, "p99": 6 }
        }
      }
    },
    "accountConfirmed": {
      "types": {
        "Unknown": {
          "count": 1
        },
        "String": {
          "count": 1,
          "length": { "min": 9, "mean": 9, "max": 9, "p25": 9, "p33": 9, "p50": 9, "p66": 9, "p75": 9, "p99": 9 }
        },
        "Boolean": {
          "count": 4
        }
      }
    }
  },
  "nestedTypes": {}
}
```


#### `AggregateSummary`

Numeric and String types include a summary of the observed field sizes:

> Number & String Range Object Details

##### Properties

- `min` the minimum number or string length
- `max` the maximum number or string length
- `mean` the average number or string length
- `percentiles[25th, 33th, 50th, 66th, 75th, 99th]` values from the `Nth` percentile (number or string length)

Percentile is based on input data, as-is with out sorting.

##### Length Range Data

Range data for the `length` of a `String` field type:

```js
{
  "count": 5,
  "length": { "min": 15, "mean": 19.4, "max": 26, "p25": 15, "p33": 15, "p50": 18, "p66": 23, "p75": 23, "p99": 26 }
}
```

This is useful for defining strict length limits or minimums, for example as SQL servers often require..

Range data for a `Date` fields `value`:

```js
{
  "count": 4,
  "value": { "min": "2001-01-01T00:00:00.000Z", "mean": "2015-04-14T18:00:00.000Z", "max": "2020-02-02T00:00:00.000Z", "p25": "2020-02-02T00:00:00.000Z", "p33": "2020-02-02T00:00:00.000Z", "p50": "2019-12-31T00:00:00.000Z", "p66": "2019-12-31T00:00:00.000Z", "p75": "2001-01-01T00:00:00.000Z", "p99": "2001-01-01T00:00:00.000Z" }
}
```


## Notes

We recommend you provide at least 100+ rows. Accuracy increases greatly with 1,000+ rows.

The following features require a certain minimum # of records:

- Enumeration detection.
  - Requires at least 100 rows, with 10 or fewer unique values.
  - Number of unique values must not exceed 20 or 5% of the total number of records. (100 records will identify as Enum w/ 5 values. Up to 20 are possible given 400 or 1,000+.)
- `Not Null` detection.
  - where `emptyRowCount < (total rows - threshold)`

### Full List of Detected Types

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
