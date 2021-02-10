import React from 'react';
import marked from 'marked';
import hljs from 'highlight.js';

type Props = {
  markedOptions?: any,
  gfm?: boolean; 
  tables?: boolean;  
  breaks?: boolean;  
  pedantic?: boolean;  
  sanitize?: boolean;  
  smartLists?: boolean;  
  smartypants?: boolean; 
  langPrefix?: string;
  children?: string;
  value?: string;
  className?: string;
}

/**
 * @deprecated
 */
export default class MarkdownPreview extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    let options = {};
    if (this.props.markedOptions) {
      options = this.props.markedOptions;
    }
    const languages = hljs.listLanguages()

    console.info('languages', languages);

    options = {
      ...options,
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false,
      langPrefix: 'hljs ',
      highlight: (code: any, lang: any) => {
        if (lang && languages.includes(lang)) {
          return hljs.highlight(lang, code).value;
        } else {
          return code;
        }
      }
    };
    marked.setOptions(options);
  }
  render() {
    const { value, className } = this.props;
    const renderer = new marked.Renderer();
    renderer.link = ( href, title, text ) => (
      `<a target="_blank" rel="noopener noreferrer" href="${ href }" title="${ title }">${ text }</a>`
    );
    const html = marked(value || '', { renderer });

    return (
      <div
        dangerouslySetInnerHTML={{__html: html}}
        className={className} />
    );
  }
}
