import { getPermalink, getBlogPermalink, getAsset, getHomePermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getHomePermalink(),
    },
    {
      text: 'More',
      links: [
        {
          text: 'About us',
          href: getPermalink('/#aboutUs'),
        },
        {
          text: 'Services',
          href: getPermalink('/services'),
        },
        {
          text: 'FAQ',
          href: getPermalink('/faq'),
        },
        {
          text: 'Progress Since 2021',
          href: getPermalink('/progress'),
        },
        {
          text: 'Selection Process',
          href: getPermalink('/process'),
        },
        {
          text: 'Contact',
          href: getPermalink('/contact'),
        },
        {
          text: 'Terms',
          href: getPermalink('/terms'),
        },
        {
          text: 'Privacy policy',
          href: getPermalink('/privacy'),
        },
      ],
    },
    {
      text: 'Aaptha Stories',
      links: [
        {
          text: 'Client Testimonials',
          href: getPermalink('/clientTestimonials'),
        },
        {
          text: 'Blog List',
          href: getBlogPermalink(),
        },
      ],
    },
    {
      text: 'Careers',
      href: getPermalink('/careers'),
    },
  ],
  actions: [{ text: 'Contact Us', href: getPermalink('/contact') }],
};

export const footerData = {
  links: [
    {
      title: 'Company',
      links: [
        { text: 'Home', href: getPermalink('/') },
        { text: 'About', href: getPermalink('/#aboutUs') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Careers', href: getPermalink('/careers') },
        { text: 'Services', href: getPermalink('/services') },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Register', href: getPermalink('/careers#registrationForm') },
        { text: 'FAQ', href: getPermalink('/faq') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: 'https://twitter.com/AapthaC', target: '_blank' },
    {
      ariaLabel: 'Instagram',
      icon: 'tabler:brand-instagram',
      href: 'https://www.instagram.com/aapthacare',
      target: '_blank',
    },
    {
      ariaLabel: 'Facebook',
      icon: 'tabler:brand-facebook',
      href: 'https://www.facebook.com/Aapthaeldercare',
      target: '_blank',
    },
    {
      ariaLabel: 'LinkedIn',
      icon: 'tabler:brand-linkedin',
      href: 'https://www.linkedin.com/company/aaptha-eldercare-service',
      target: '_blank',
    },
    {
      ariaLabel: 'Google Map',
      icon: 'tabler:brand-google-maps',
      href: 'https://www.google.com/maps/dir/?api=1&destination=500080',
      target: '_blank',
    },
    {
      ariaLabel: 'Github',
      icon: 'tabler:brand-github',
      href: 'https://github.com/sandeepreddy1945/aaptha-main-website-app',
      target: '_blank',
    },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml'), target: '_blank' },
  ],
  footNote: `
    ©2021 by Aaptha Elder-Care Services · All rights reserved.
  `,
};
