import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import ReadmePath from 'README.md';
import Refresh from '@material-ui/icons/Refresh';
export default class AboutPage extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { markdown: '', loading: true };
  }

  componentWillMount() {
    // Get the contents from the Markdown file and put them in the React state, so we can reference it in render() below.
    fetch(ReadmePath)
      .then((res) => res.text())
      .then((text) => text.replace(/^# [\w\s\d.]+/i, ''))
      .then((text) => this.setState({ markdown: text, loading: false }));
  }

  render() {
    const { markdown, loading } = this.state;
    if (loading) return <Refresh fontSize="large" className="animate-spin" />;
    return <ReactMarkdown plugins={[gfm]} source={markdown} />;
  }
}
