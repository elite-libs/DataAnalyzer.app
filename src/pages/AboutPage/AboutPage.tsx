import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import ReadmePath from 'README.md';
import LoadingSpinner from 'components/LoadingSpinner';

import 'github-markdown-css';
import './AboutPage.scss';

function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

function HeadingRenderer(props) {
  var children = React.Children.toArray(props.children);
  var text = children.reduce(flatten, '');
  var slug = text.toLowerCase().replace(/\W/g, '-');
  return React.createElement('h' + props.level, { id: slug }, props.children);
}

export default class AboutPage extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { markdown: '', loading: true };
  }

  componentWillMount() {
    // Get the contents from the Markdown file and put them in the React state, so we can reference it in render() below.
    fetch(ReadmePath)
      .then((res) => res.text())
      .then((text) => text.replace(/^# DataAnalyzer.app/i, ''))
      .then((text) => this.setState({ markdown: text, loading: false }));
  }

  render() {
    const { markdown, loading } = this.state;
    if (loading) return <LoadingSpinner />;
    return (
      <div className="markdown-body">
        <ReactMarkdown plugins={[gfm]} renderers={{ heading: HeadingRenderer }} source={markdown} />
      </div>
    );
  }
}
