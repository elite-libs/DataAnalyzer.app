// import globals from 'rollup-plugin-node-globals';
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
// https://github.com/rollup/plugins/tree/master/packages/typescript
import typescript from '@rollup/plugin-typescript'

import { terser } from 'rollup-plugin-terser'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import pkg from './package.json'
// import { ModuleKind } from 'typescript'

const includePackages = {
  'lodash.isdate': 'isDate',
  debug: 'debug',
}
const isProduction = process.env.NODE_ENV === 'production'
const extraPlugins = isProduction ? [terser()] : []
const fileExtension = isProduction ? '.min' : ''
const envOptions = isProduction
  ? {
      compact: true, // DEV MODE
      sourcemap: false,
    }
  : {
      compact: true, // PRODUCTION MODE
      sourcemap: true,
    }

/*
READ MORE: https://medium.com/@martin_hotell/tree-shake-lodash-with-webpack-jest-and-typescript-2734fa13b5cd

https://stackoverflow.com/questions/52852167/how-to-use-lodash-es-in-typescript-correctly
*/

export default [
  {
    input: './index.ts',
    output: {
      name: 'schemaAnalyzer',
      file: `${pkg.browser}`.replace('.js', `${fileExtension}.js`),
      format: 'umd',
      globals: includePackages,
      exports: 'named',
      ...envOptions,
    },
    plugins: [
      typescript({ sourceMap: !isProduction, esModuleInterop: true, outDir: null }),
      // globals({} ),
      globals(),
      builtins(),
      resolve({
        // pass custom options to the resolve plugin
        customResolveOptions: {
          moduleDirectory: 'node_modules',
        },
        browser: true
      }), // so Rollup can find `ms`
      commonjs({ extensions: ['.js', '.ts'] }),
    ].concat(...extraPlugins),
  },

  {
    input: './index.ts',
    output: {
      name: 'schemaAnalyzer',
      file: `${pkg.main.replace('.js', '')}${fileExtension}.js`,
      format: 'cjs',
      globals: includePackages,
      exports: 'named',
      ...envOptions,
    },
    // external: [/lodash.*/, 'debug'],
    plugins: [
      typescript({ sourceMap: !isProduction, esModuleInterop: true, outDir: null }),
      // globals({} ),
      globals(),
      builtins(),
      resolve({
        // pass custom options to the resolve plugin
        customResolveOptions: {
          moduleDirectory: 'node_modules',
        },
        browser: true
      }), // so Rollup can find `ms`
      commonjs({ extensions: ['.js', '.ts'] }),
    ].concat(...extraPlugins),
  },
  // {
  //   input: './index.ts',
  //   output: {
  //     name: 'schemaAnalyzer',
  //     file: `${pkg.module.replace('.js', '')}${fileExtension}.js`,
  //     format: 'es',
  //     globals: {}, // includePackages,
  //     exports: 'named',
  //     ...envOptions,
  //   },
  //   // external: [/lodash.*/, 'debug'],
  //   plugins: [
  //     typescript({
  //       sourceMap: !isProduction,
  //       module: ModuleKind.ES2020,
  //       esModuleInterop: true,
  //     }),
  //     globals(),
  //     builtins(),
  //     // globals({} ),
  //     resolve({
  //       // pass custom options to the resolve plugin
  //       customResolveOptions: {
  //         moduleDirectory: 'node_modules',
  //       },
  //     }), // so Rollup can find `ms`
  //     commonjs({ extensions: ['.js', '.ts'] }),
  //   ].concat(...extraPlugins),
  // },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  // {
  //   input: './index.ts',
  //   external: [],
  //   output: [
  //     {
  //       file: pkg.main, format: 'cjs', globals: includePackages,
  //       plugins: [
  //         // globals({} ),
  //         resolve({
  //           // pass custom options to the resolve plugin
  //           customResolveOptions: {
  //             moduleDirectory: 'node_modules'
  //           },
  //           browser: true
  //         }), // so Rollup can find `ms`
  //         commonjs({extensions: ['.js', '.ts']})
  //       ]
  //     },
  //     {
  //       file: pkg.module, format: 'es', globals: includePackages,
  //       plugins: [
  //         // globals({} ),
  //         resolve({
  //           // pass custom options to the resolve plugin
  //           customResolveOptions: {
  //             moduleDirectory: 'node_modules'
  //           },
  //           browser: true
  //         }), // so Rollup can find `ms`
  //         commonjs({extensions: ['.js', '.ts']})
  //       ]
  //     }
  //   ]
  // }
]
