import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import ReadmePath from 'README.md';
export default class AboutPage extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { markdown: '' };
  }

  componentWillMount() {
    // Get the contents from the Markdown file and put them in the React state, so we can reference it in render() below.
    fetch(ReadmePath)
      .then((res) => res.text())
      .then((text) => this.setState({ markdown: text }));
  }

  render() {
    const { markdown } = this.state;
    return <ReactMarkdown plugins={[gfm]} source={markdown} />;
  }
}
