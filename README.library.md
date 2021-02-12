# schema-analyzer

## For developers wishing to use the underlying `schema-analyzer` library!

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

| id  | name            | role      | email                        | createdAt  | accountConfirmed |
| --- | --------------- | --------- | ---------------------------- | ---------- | ---------------- |
| 1   | Eve             | poweruser | `eve@example.com`            | 01/20/2020 | undefined        |
| 2   | Alice           | user      | `ali@example.com`            | 02/02/2020 | true             |
| 3   | Bob             | user      | `robert@example.com`         | 12/31/2019 | true             |
| 4   | Elliot Alderson | admin     | `falkensmaze@protonmail.com` | 01/01/2001 | false            |
| 5   | Sam Sepiol      | admin     | `falkensmaze@hotmail.com`    | 9/9/99     | true             |

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
          "value": {
            "min": 1,
            "mean": 3,
            "max": 5,
            "p25": 2,
            "p33": 2,
            "p50": 3,
            "p66": 4,
            "p75": 4,
            "p99": 5
          }
        },
        "String": {
          "count": 5,
          "length": {
            "min": 1,
            "mean": 1,
            "max": 1,
            "p25": 1,
            "p33": 1,
            "p50": 1,
            "p66": 1,
            "p75": 1,
            "p99": 1
          }
        }
      }
    },
    "name": {
      "types": {
        "String": {
          "count": 5,
          "length": {
            "min": 3,
            "mean": 7.2,
            "max": 15,
            "p25": 3,
            "p33": 3,
            "p50": 5,
            "p66": 10,
            "p75": 10,
            "p99": 15
          }
        }
      }
    },
    "role": {
      "types": {
        "String": {
          "count": 5,
          "length": {
            "min": 4,
            "mean": 5.4,
            "max": 9,
            "p25": 4,
            "p33": 4,
            "p50": 5,
            "p66": 5,
            "p75": 5,
            "p99": 9
          }
        }
      }
    },
    "email": {
      "types": {
        "Email": {
          "count": 5,
          "length": {
            "min": 15,
            "mean": 19.4,
            "max": 26,
            "p25": 15,
            "p33": 15,
            "p50": 18,
            "p66": 23,
            "p75": 23,
            "p99": 26
          }
        }
      }
    },
    "createdAt": {
      "types": {
        "Date": {
          "count": 4,
          "value": {
            "min": "2001-01-01T00:00:00.000Z",
            "mean": "2015-04-14T18:00:00.000Z",
            "max": "2020-02-02T00:00:00.000Z",
            "p25": "2020-02-02T00:00:00.000Z",
            "p33": "2020-02-02T00:00:00.000Z",
            "p50": "2019-12-31T00:00:00.000Z",
            "p66": "2019-12-31T00:00:00.000Z",
            "p75": "2001-01-01T00:00:00.000Z",
            "p99": "2001-01-01T00:00:00.000Z"
          }
        },
        "String": {
          "count": 1,
          "length": {
            "min": 6,
            "mean": 6,
            "max": 6,
            "p25": 6,
            "p33": 6,
            "p50": 6,
            "p66": 6,
            "p75": 6,
            "p99": 6
          }
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
          "length": {
            "min": 9,
            "mean": 9,
            "max": 9,
            "p25": 9,
            "p33": 9,
            "p50": 9,
            "p66": 9,
            "p75": 9,
            "p99": 9
          }
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
