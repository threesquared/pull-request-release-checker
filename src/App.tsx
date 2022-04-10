import React, { useState } from 'react';
import { Octokit } from '@octokit/rest';
import axios from 'axios';
import './App.css';

const octokit = new Octokit();

function App() {
  const [prLink, setPrLink] = useState<string>('');
  const [info, setInfo] = useState<string>('Check if a PR has made it into a tagged release');

  async function getPR({ owner, repo, number }: { owner: string; repo: string; number: number }) {
    const res = await octokit.request('GET /repos/{owner}/{repo}/pulls/{number}', {
      owner,
      repo,
      number,
    });

    return res.data;
  }

  async function getRelease({
    owner,
    repo,
    commit,
  }: {
    owner: string;
    repo: string;
    commit: string;
  }) {
    const response = await axios.post(
      'https://mn4nb8kweh.execute-api.eu-west-1.amazonaws.com/stage/release',
      { owner, repo, commit }
    );

    return response.data;
  }

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    const url = new URL(prLink);
    const path = url.pathname.split('/');

    const owner = path[1];
    const repo = path[2];
    const number = parseInt(path[4]);

    let pr;
    let release;

    try {
      pr = await getPR({ owner, repo, number });
    } catch (e) {
      setInfo('Could not find that PR');
      return;
    }

    if (pr.merged_at === null) {
      setInfo('PR has not been merged yet');
      return;
    }

    const commit = pr.merge_commit_sha;

    try {
      release = await getRelease({ owner, repo, commit });
    } catch (e) {
      setInfo('PR is not part of a release version yet');
      return;
    }

    setInfo(
      `PR is part of the <a href="https://github.com/${owner}/${repo}/releases/tag/${release}">${release}</a> release`
    );
  }

  return (
    <div className="body">
      <div className="App">
        <div className="container">
          <div className="row logo">
            <div className="col-md-12 mt-4 text-center">
              <h1 className="h1">
                <a href="/">Pull Request Release Checker</a>
              </h1>
            </div>
          </div>
          <div className="row info">
            <div className="col-md-12 text-center">
              <p dangerouslySetInnerHTML={{ __html: info }}></p>
            </div>
          </div>
          <div className="row">
            <div className="col-6 mt-4 offset-3">
              <form className="form" onSubmit={handleSubmit}>
                <div className="input-group input-group-sm mb-3">
                  <input
                    type="text"
                    className="form-control url"
                    placeholder="Enter Github PR URL"
                    value={prLink}
                    onChange={(e) => setPrLink(e.target.value)}
                  ></input>
                  <button className="btn btn-outline-secondary" type="submit" id="submit">
                    Check
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
