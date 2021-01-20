import mongooseWriter from './writer.mongoose.js'
import knexWriter from './writer.knex.js'

const writers = {
  mongoose: mongooseWriter,
  knex: knexWriter
}

export const render = ({ schemaName, options, writer }) => (content) => {
  const renderer = writers[writer]
  if (!renderer) throw new Error(`Invalid Render Adapter Specified: ${writer}`)

  return renderer.render({ schemaName, options, results: content })
}
