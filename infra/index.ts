import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import axios from 'axios';
import { parse } from 'node-html-parser';

const releaseHandler = new aws.lambda.CallbackFunction('release-handler', {
  runtime: aws.lambda.Runtime.NodeJS14dX,
  callback: async (event: any, context: aws.lambda.Context) => {
    let buffer = new Buffer(event.body, 'base64');
    const { owner, repo, commit } = JSON.parse(buffer.toString('ascii'));
    let tag;

    try {
      const res = await axios.get(`https://github.com/${owner}/${repo}/branch_commits/${commit}`);
      const html = parse(res.data);
      tag = html.querySelector('.branches-tag-list li')!.childNodes[0].childNodes.toString();
    } catch (error) {
      console.log(error);

      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
          'Access-Control-Allow-Headers':
            'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        },
      };
    }

    return {
      statusCode: 200,
      body: tag,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      },
    };
  },
});

const alertHandler = new aws.lambda.CallbackFunction('alert-handler', {
  runtime: aws.lambda.Runtime.NodeJS14dX,
  callback: async (event: any, context: aws.lambda.Context) => {
    let buffer = new Buffer(event.body, 'base64');
    const { owner, repo, commit } = JSON.parse(buffer.toString('ascii'));
    let tag;

    try {
      const res = await axios.get(`https://github.com/${owner}/${repo}/branch_commits/${commit}`);
      const html = parse(res.data);
      tag = html.querySelector('.branches-tag-list li')!.childNodes[0].childNodes.toString();
    } catch (error) {
      console.log(error);

      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
          'Access-Control-Allow-Headers':
            'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        },
      };
    }

    return {
      statusCode: 200,
      body: tag,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      },
    };
  },
});

const endpoint = new awsx.apigateway.API('pr-release', {
  routes: [
    {
      path: '/',
      method: 'GET',
      localPath: '../build',
      index: true,
    },
    {
      path: '/release',
      method: 'OPTIONS',
      eventHandler: async () => {
        return {
          headers: {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET',
          },
          statusCode: 200,
          body: '',
        };
      },
    },
    {
      path: '/release',
      method: 'POST',
      eventHandler: releaseHandler,
    },
    {
      path: '/alert',
      method: 'OPTIONS',
      eventHandler: async () => {
        return {
          headers: {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET',
          },
          statusCode: 200,
          body: '',
        };
      },
    },
    {
      path: '/alert',
      method: 'POST',
      eventHandler: alertHandler,
    },
  ],
});

exports.url = endpoint.url;
