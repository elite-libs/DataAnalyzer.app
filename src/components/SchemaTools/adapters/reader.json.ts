const jsonReader = {
  shouldParse(content: any) {
    return /^\s*(\[|\{).*(\}|\])\s*$/gims.test(content);
  },
  parse(content: string) {
    return JSON.parse(content);
  },
};

export default jsonReader;
