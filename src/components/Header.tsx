import React from 'react';

export default function Header() {
  return (
    <div className="jumbotron jumbotron-fluid">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="head-text" style={{ flexGrow: 2 }}>
          <h1 className="display-4">DataAnalyzer.app</h1>
        </div>
      </div>
      <div className="container">
        <p className="lead">
          Paste JSON or CSV data to automatically generate typed code.
          <br />
          Supports <b>TypeScript, Mongoose, Knex, and SQL</b>
        </p>
        <p className="lead">100% local farm-to-table. (Data stays local)</p>
      </div>
    </div>
  );
}
