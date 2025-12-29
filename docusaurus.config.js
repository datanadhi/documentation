// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Data Nadhi Documentation',
  tagline: 'Direct. Transform. Deliver.',
  favicon: 'img/logo.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://datanadhi.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Data ARENA Space', // Usually your GitHub org/user name.
  projectName: 'Data Nadhi', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          lastVersion: '0.0.0',
          includeCurrentVersion: false,
          onlyIncludeVersions: ['0.0.0', 'PoC'],
          versions: {
            '0.0.0': {
              label: '0.0.0 (Beta)',
              banner: 'none',
            },
            'PoC': {
              label: 'PoC (Latest)',
              banner: 'none',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Data Nadhi',
        logo: {
          alt: 'Data Nadhi Logo',
          src: 'img/logo.png',
        },
        items: [
          {to: '/about', label: 'Why Data Nadhi?', position: 'left'},
          {to: '/features', label: 'Features', position: 'left'},
          {to: '/contributions', label: 'Contribute', position: 'left'},
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'docsVersionDropdown',
            position: 'left',
            dropdownActiveClassDisabled: true,
          },
          {to: '/contact', label: 'Contact', position: 'right'},
          {
            href: 'https://github.com/search?q=topic%3Adata-nadhi+org%3AData-ARENA-Space&type=Repositories',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Learn',
            items: [
              {
                label: 'About',
                to: '/about',
              },
              {
                label: 'Features',
                to: '/features',
              },
              {
                label: 'Documentation',
                to: '/docs',
              },
            ],
          },
          {
            title: 'Developers',
            items: [
              {
                label: 'Architecture',
                to: '/docs/architecture',
              },
              {
                label: 'Contribute',
                to: '/contributions',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Data-ARENA-Space',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/gMwdfGfnby',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Data Nadhi. Open Source Project.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
