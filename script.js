(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const pad = (value) => String(value).padStart(2, '0');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const published = (items) => Array.isArray(items) ? items.filter((item) => item && item.published !== false) : [];

  function safeUrl(value, allowHash = false) {
    if (!value) return '';
    if (allowHash && String(value).startsWith('#')) return value;
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function text(parent, tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value || '';
    parent.appendChild(el);
    return el;
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
  }

  function renderHero(site, data) {
    const hero = site?.hero;
    if (hero) {
      const image = $('#heroImage');
      if (image && hero.image) image.src = hero.image;
      if (image && hero.alt) image.alt = hero.alt;
      const label = $('#heroLabel');
      if (label && hero.label) label.textContent = hero.label;
    }

    const stats = $('#heroStats');
    if (stats) {
      const values = [published(data.photography).length, published(data.film).length, published(data.projects).length, published(data.posts).length];
      stats.querySelectorAll('strong').forEach((el, index) => { el.textContent = pad(values[index] || 0); });
    }
  }

  function renderPhotos(items) {
    const grid = $('#proofGrid');
    if (!grid) return;
    const photos = published(items);
    grid.replaceChildren();
    $('#photoCount').textContent = `Proof Sheet — ${pad(photos.length)} ${photos.length === 1 ? 'Frame' : 'Frames'}`;

    photos.forEach((item, index) => {
      const figure = document.createElement('figure');
      figure.className = 'frame reveal';
      figure.dataset.layout = ['wide', 'tall', 'standard'].includes(item.layout) ? item.layout : 'standard';

      const shot = document.createElement('div');
      shot.className = 'shot';
      const image = document.createElement('img');
      image.src = item.image || '';
      image.alt = item.alt || item.title || `Portfolio frame ${index + 1}`;
      image.loading = index < 2 ? 'eager' : 'lazy';
      image.decoding = 'async';
      shot.appendChild(image);

      const caption = document.createElement('figcaption');
      caption.className = 'frame-caption';
      text(caption, 'span', 'num', `Frame ${pad(index + 1)}`);
      text(caption, 'span', 'title', item.title || 'Untitled');
      figure.append(shot, caption);
      grid.appendChild(figure);
    });
  }

  function renderFilm(items) {
    const reel = $('#reel');
    if (!reel) return;
    const cuts = published(items);
    reel.replaceChildren();
    $('#filmCount').textContent = `Reel — ${pad(cuts.length)} ${cuts.length === 1 ? 'Cut' : 'Cuts'}`;

    cuts.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'cut reveal';
      const screen = document.createElement('div');
      screen.className = 'screen';

      if (item.sourceType === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        video.src = item.source || '';
        screen.appendChild(video);
      } else {
        const iframe = document.createElement('iframe');
        iframe.src = safeUrl(item.source) || 'about:blank';
        iframe.allow = 'autoplay; fullscreen';
        iframe.loading = 'lazy';
        iframe.title = item.title || `Film cut ${index + 1}`;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        screen.appendChild(iframe);
      }

      const caption = document.createElement('div');
      caption.className = 'cut-caption';
      text(caption, 'span', 'num', `Cut ${pad(index + 1)}`);
      text(caption, 'span', 'title', item.title || 'Untitled');
      article.append(screen, caption);
      if (item.description) text(article, 'p', 'cut-desc', item.description);
      reel.appendChild(article);
    });
  }

  function renderProjects(items) {
    const list = $('#buildList');
    if (!list) return;
    const projects = published(items);
    list.replaceChildren();
    $('#projectCount').textContent = `Build Log — ${pad(projects.length)} ${projects.length === 1 ? 'Project' : 'Projects'}`;

    projects.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = `build-card reveal${item.coverImage ? ' has-cover' : ''}`;

      if (item.coverImage) {
        const media = document.createElement('div');
        media.className = 'build-cover';
        const image = document.createElement('img');
        image.src = item.coverImage;
        image.alt = item.title ? `${item.title} project preview` : 'Project preview';
        image.loading = 'lazy';
        media.appendChild(image);
        article.appendChild(media);
      }

      const content = document.createElement('div');
      content.className = 'build-content';
      const main = document.createElement('div');
      main.className = 'build-main';
      text(main, 'span', 'num', `Build ${pad(index + 1)}`);
      text(main, 'h3', '', item.title || 'Untitled Project');
      text(main, 'p', '', item.description || '');

      const links = document.createElement('div');
      links.className = 'build-links';
      const url = safeUrl(item.url);
      if (url) {
        const link = document.createElement('a');
        link.className = 'build-link';
        link.href = url; link.target = '_blank'; link.rel = 'noopener';
        link.textContent = `${item.linkLabel || 'View project'} ↗`;
        links.appendChild(link);
      }
      const sourceUrl = safeUrl(item.sourceUrl);
      if (sourceUrl) {
        const source = document.createElement('a');
        source.className = 'build-link muted';
        source.href = sourceUrl; source.target = '_blank'; source.rel = 'noopener';
        source.textContent = 'Source ↗';
        links.appendChild(source);
      }
      if (links.childElementCount) main.appendChild(links);

      const meta = document.createElement('div');
      meta.className = 'build-meta';
      [['Status', item.status], ['Stack', item.stack], ['Platform / Host', item.hosted], ['Type', item.type], ['Role', item.role], ['Property', item.ownership], ['Credit', item.credit]].forEach(([label, value]) => {
        if (!value) return;
        const row = document.createElement('div');
        text(row, 'span', 'label', label);
        row.appendChild(document.createTextNode(value));
        meta.appendChild(row);
      });

      content.append(main, meta);
      article.appendChild(content);
      list.appendChild(article);
    });
  }

  function renderPosts(items) {
    const grid = $('#postGrid');
    if (!grid) return;
    const posts = published(items);
    grid.replaceChildren();
    $('#postCount').textContent = `Studio Log — ${pad(posts.length)} ${posts.length === 1 ? 'Update' : 'Updates'}`;

    posts.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = `post-card reveal${item.coverImage ? ' has-image' : ' text-only'}`;

      if (item.coverImage) {
        const media = document.createElement('div');
        media.className = 'post-media';
        const image = document.createElement('img');
        image.src = item.coverImage;
        image.alt = item.title ? `${item.title} cover` : 'Latest work cover';
        image.loading = 'lazy';
        media.appendChild(image);
        article.appendChild(media);
      } else {
        const visual = document.createElement('div');
        visual.className = 'post-placeholder';
        text(visual, 'span', '', item.type || 'New Work');
        text(visual, 'strong', '', pad(index + 1));
        article.appendChild(visual);
      }

      const body = document.createElement('div');
      body.className = 'post-body';
      const meta = document.createElement('div');
      meta.className = 'post-meta';
      text(meta, 'span', 'post-type', item.type || 'Work');
      const date = formatDate(item.date);
      if (date) text(meta, 'span', 'post-date', date);
      body.appendChild(meta);
      text(body, 'h3', '', item.title || 'Untitled update');
      if (item.excerpt) text(body, 'p', '', item.excerpt);

      if (Array.isArray(item.tags) && item.tags.length) {
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        item.tags.slice(0, 5).forEach((tag) => text(tags, 'span', '', tag));
        body.appendChild(tags);
      }

      const url = safeUrl(item.url, true);
      if (url) {
        const link = document.createElement('a');
        link.className = 'post-link';
        link.href = url;
        if (!url.startsWith('#')) { link.target = '_blank'; link.rel = 'noopener'; }
        link.textContent = `${item.linkLabel || 'View work'} →`;
        body.appendChild(link);
      }

      article.appendChild(body);
      grid.appendChild(article);
    });
  }

  function installReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
      targets.forEach((el) => observer.observe(el));
    } else targets.forEach((el) => el.classList.add('is-visible'));
    window.setTimeout(() => targets.forEach((el) => el.classList.add('is-visible')), 1600);
  }

  function showLoadError() {
    const message = document.createElement('p');
    message.className = 'load-error';
    message.textContent = 'Portfolio content could not be loaded. If previewing locally, use a local web server instead of opening index.html directly.';
    $('#proofGrid')?.replaceChildren(message);
  }

  async function loadPortfolio() {
    try {
      const response = await fetch('content/portfolio.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      renderHero(data.site, data);
      renderPhotos(data.photography);
      renderFilm(data.film);
      renderProjects(data.projects);
      renderPosts(data.posts);
      installReveal();
    } catch (error) {
      console.error('Unable to load portfolio content:', error);
      showLoadError();
    }
  }

  loadPortfolio();
})();
