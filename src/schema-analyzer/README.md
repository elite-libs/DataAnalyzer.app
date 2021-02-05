[![Build Status](https://travis-ci.org/justsml/schema-analyzer.svg?branch=master)](https://travis-ci.org/justsml/schema-analyzer)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b2c9bcb087db456a991655c3e87126a7)](https://www.codacy.com/manual/justsml/schema-analyzer?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=justsml/schema-analyzer&amp;utm_campaign=Badge_Grade)
[![GitHub package version](https://img.shields.io/github/package-json/v/justsml/schema-analyzer.svg?style=flat)](https://github.com/justsml/schema-analyzer)
[![GitHub stars](https://img.shields.io/github/stars/justsml/schema-analyzer.svg?label=Stars&style=flat)](https://github.com/justsml/schema-analyzer)
[![Node.js CI](https://github.com/justsml/schema-analyzer/workflows/Node.js%20CI/badge.svg)](https://github.com/justsml/schema-analyzer/actions)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/schema-analyzer?color=green)
![npm downloads](https://img.shields.io/npm/dm/schema-analyzer?color=yellow&label=npm%20downloads&logo=npm)
[![codecov](https://codecov.io/gh/justsml/schema-analyzer/branch/master/graph/badge.svg)](https://codecov.io/gh/justsml/schema-analyzer)
<!-- ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/justsml/schema-analyzer) -->
<!-- ![GitHub All Releases](https://img.shields.io/github/downloads/justsml/schema-analyzer/total?color=cyan&label=github%20release%20downloads) -->

# Schema Analyzer

> An Open Source joint by [Dan Levy](https://danlevy.net/) ✨

## Analyze column type & size summary from any input JSON array

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

## Similar/Alternative Projects

- https://github.com/quicktype/quicktype
- https://github.com/SweetIQ/schemats
- https://github.com/vojtechhabarta/typescript-generator
