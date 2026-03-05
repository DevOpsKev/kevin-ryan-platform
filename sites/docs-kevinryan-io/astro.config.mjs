import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://docs.kevinryan.io',
  integrations: [
    mermaid(),
    starlight({
      title: 'Kevin Ryan — Docs',
      favicon: '/favicon-dark.ico',
      head: [
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://analytics.kevinryan.io/script.js',
            'data-website-id': '7982fbc0-012b-4c04-8ec3-a9de42462351',
          },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/DevOpsKev/kevin-ryan-platform',
        },
      ],
      customCss: ['./src/styles/custom.css'],
      components: {
        Footer: './src/components/Footer.astro',
      },
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Architecture Decisions',
          autogenerate: { directory: 'adr' },
        },
      ],
    }),
  ],
});
