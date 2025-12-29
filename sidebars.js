// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // Documentation sidebar with organized structure
  tutorialSidebar: [
    'index',
    {
      type: 'category',
      label: 'Architecture',
      link: {
        type: 'doc',
        id: 'architecture/index',
      },
      items: [
        {
          type: 'category',
          label: 'Data',
          link: {
            type: 'doc',
            id: 'architecture/data/index',
          },
          items: [
            'architecture/data/mongo',
            'architecture/data/redis',
            'architecture/data/minio'
          ],
        },
        {
          type: 'category',
          label: 'SDK',
          link: {
            type: 'doc',
            id: 'architecture/sdk/index',
          },
          items: [
            'architecture/sdk/log-structure',
            'architecture/sdk/log-config'
          ],
        },
        {
          type: 'category',
          label: 'Server',
          link: {
            type: 'doc',
            id: 'architecture/server/index',
          },
          items: [
            'architecture/server/api-key'
          ],
        },
        {
          type: 'category',
          label: 'Temporal',
          link: {
            type: 'doc',
            id: 'architecture/temporal/index',
          },
          items: [
            'architecture/temporal/main-worker',
            'architecture/temporal/transformation-worker',
            'architecture/temporal/destination-worker'
          ],
        }
      ],
    },
    'setup',
    'internal-server-apis'
  ],
};

export default sidebars;
