import csvParse from 'csv-parse'

export default {
  shouldParse (content) {
    const sample =
      (content && content.length > 500 ? content.slice(0, 500) : content) || ''
    return sample.split(',').length > 5
  },

  parse (content) {
    return new Promise((resolve, reject) => {
      csvParse(
        content,
        {
          columns: true,
          trim: true,
          skip_empty_lines: true
        },
        (err, results, info) => {
          if (err) return reject(err)
          resolve(results)
        }
      )
    })
  }
}
