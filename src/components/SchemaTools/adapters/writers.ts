import mongooseWriter from './writer.mongoose'
import knexWriter from './writer.knex'

const writers = {
  mongoose: mongooseWriter,
  knex: knexWriter
}

export const render = ({ schemaName, options, writer }) => (content) => {
  const renderer = writers[writer]
  if (!renderer) throw new Error(`Invalid Render Adapter Specified: ${writer}`)

  return renderer.render({ schemaName, options, results: content })
}
