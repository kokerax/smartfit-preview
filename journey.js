'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const story = document.getElementById('benefit-story');
  const sticky = story.querySelector('.benefit-sticky');
  const chapters = [...story.querySelectorAll('.benefit-chapter')];
  const count = document.getElementById('benefit-count');
  const running = new Set();
  let frame = 0, current = 0, target = 0, active = -1;
  let storyStart = 0, storyDistance = 1;
  const clamp = value => Math.min(1, Math.max(0, value));
  const paused = () => preference.matches || document.body.classList.contains('motion-paused');
  const targets = [
    ...[...document.querySelectorAll('.models-section .card-image')].map(anchor => ({anchor,node:anchor.querySelector('img'),from:.82,to:1.08,travel:40,turn:-13})),
    {anchor:document.querySelector('.how-photo'),node:document.querySelector('.how-photo img'),from:1,to:1.15,travel:0,turn:0},
    {anchor:document.querySelector('.anatomy-art'),node:document.querySelector('.anatomy-art>img'),from:.85,to:1.07,travel:25,turn:-5},
    {anchor:document.querySelector('.return-days'),node:document.querySelector('.return-days strong'),from:.84,to:1.04,travel:0,turn:0},
    {anchor:document.querySelector('.closing'),node:document.querySelector('.closing h2'),from:.94,to:1.02,travel:28,turn:0}
  ].filter(item => item.anchor && item.node);
  function measure() {
    storyStart = story.getBoundingClientRect().top + scrollY;
    storyDistance = Math.max(1, story.offsetHeight - sticky.offsetHeight);
    targets.forEach(item => {
      const box = item.anchor.getBoundingClientRect();
      item.top = box.top + scrollY; item.height = box.height;
    });
    target = scrollY;
    schedule();
  }
  function selectChapter(index) {
    if (active === index) return;
    const focusWasInside = active >= 0 && chapters[active].contains(document.activeElement);
    active = index;
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle('is-current', i === index);
      chapter.inert = i !== index;
      chapter.setAttribute('aria-hidden', String(i !== index));
    });
    sticky.dataset.active = index;
    count.textContent = `0${index + 1} / 03`;
    if (focusWasInside) chapters[index].querySelector('a').focus({preventScroll: true});
  }
  function draw(y) {
    const progress = clamp((y - storyStart) / storyDistance);
    const index = Math.min(2, Math.floor(progress * 3));
    const local = clamp(progress * 3 - index);
    selectChapter(index);
    sticky.style.setProperty('--benefit-progress', progress.toFixed(4));
    sticky.style.setProperty('--benefit-scale', (.83 + .24 * local).toFixed(4));
    sticky.style.setProperty('--benefit-y', `${28 - 48 * local}px`);
    sticky.style.setProperty('--benefit-turn', `${-8 + 12 * local}deg`);
    targets.forEach(item => {
      const p = clamp((y + innerHeight - item.top) / (innerHeight + item.height));
      item.node.style.setProperty('--zoom', (item.from + (item.to - item.from) * p).toFixed(4));
      item.node.style.setProperty('--travel', `${item.travel * (1 - 2 * p)}px`);
      item.node.style.setProperty('--turn', `${item.turn * (1 - p)}deg`);
    });
  }
  function tick() {
    frame = 0;
    if (paused() || document.hidden) return;
    current += (target - current) * .16;
    if (Math.abs(target - current) < .15) current = target;
    draw(current);
    if (current !== target) schedule();
  }
  function schedule() {
    if (!frame && !paused() && !document.hidden) frame = requestAnimationFrame(tick);
  }
  // Stagger text in document order. Content remains visible when JS/motion is off.
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      reveal.unobserve(entry.target);
      if (paused() || !entry.target.animate) return;
      const parts = [...entry.target.children].filter(node => node.matches('h2,h3,p,.card-content,.steps,.feature-line,.fit-check,.detail-model-switch,.text-button,.button'));
      (parts.length ? parts : [entry.target]).forEach((node, i) => {
        const animation = node.animate([{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'translateY(0)'}], {duration:750,delay:Math.min(i,5)*100,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'});
        running.add(animation); animation.onfinish = animation.oncancel = () => running.delete(animation);
      });
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal-item').forEach(node => reveal.observe(node));
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    document.body.classList.toggle('journey-motion', !preference.matches);
    if (preference.matches) {
      chapters.forEach(chapter => {chapter.inert=false;chapter.removeAttribute('aria-hidden');});
      active = -1;
      running.forEach(animation => animation.cancel());
    } else if (paused()) running.forEach(animation => animation.pause());
    else {running.forEach(animation => animation.play());measure();}
    const control = document.getElementById('journey-motion-toggle');
    control.textContent = paused() ? '▷ Hareketi başlat' : 'Ⅱ Hareketi durdur';
    control.setAttribute('aria-pressed', String(paused()));
  }
  document.getElementById('journey-motion-toggle').addEventListener('click', () => document.getElementById('motion-toggle').click());
  window.addEventListener('scroll', () => {target=scrollY;schedule();}, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  document.addEventListener('smartfit:motion', sync);
  document.addEventListener('visibilitychange', () => {if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else schedule();});
  preference.addEventListener('change', sync);
  new ResizeObserver(measure).observe(document.querySelector('main'));
  document.fonts.ready.then(measure);
  current = target = scrollY;
  sync();
})();
