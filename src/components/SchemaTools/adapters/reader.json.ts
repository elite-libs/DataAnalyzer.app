export default {
  shouldParse (content) {
    return /^\s*(\[|\{).*(\}|\])\s*$/gims.test(content)
  },
  parse (content) {
    return JSON.parse(content)
  }
}
