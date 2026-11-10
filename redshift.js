'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('motion-toggle');
  const story = document.getElementById('hero-story');
  const hero = story.querySelector('.hero');
  const heroCopy = hero.querySelector('.hero-copy');
  const layerStory = hero.querySelector('.layer-story');
  const stack = hero.querySelector('.layer-stack');
  const pieces = ['textile', 'foam', 'support', 'base'].map(name => stack.querySelector(`.layer-${name}`));
  const phase = document.getElementById('scene-phase');
  const pins = [...hero.querySelectorAll('.part-label')];
  const step = document.getElementById('layer-step');
  const title = document.getElementById('layer-story-title');
  const description = document.getElementById('layer-story-description');
  let paused = false;
  let current = 0;
  let target = 0;
  let frame = 0;
  let activeCopy = true;
  let activeChapter = -1;
  let model = document.getElementById('hero-visual').dataset.model;
  let geometry = {start: 0, distance: 1, x: 0, y: 0, gap: 100};
  const clamp = value => Math.min(1, Math.max(0, value));
  const ease = value => {const t = clamp(value); return t * t * (3 - 2 * t);};
  const range = (value, start, end) => ease((value - start) / (end - start));
  const content = {
    comfort: [['İlk temas, yumuşak.', 'Ayağınla temas eden tekstil yüzey. Günlük kullanım için tasarlandı.'], ['Yumuşaklığı hisset.', 'Konfor’un yüksek yastıklaması, daha yumuşak bir basış hissi tercih edenler için.'], ['Esnek kavis desteği.', 'Esnek kavis yapısı, günlük adımlarına eşlik eden destek hissini sunar.'], ['Topuktan başlayan destek.', 'Topuk bölgesindeki destekleyici yapı, tabanlığın alt yapısını tamamlar.']],
    energy: [['Harekete hazır bir yüzey.', 'Ayağınla temas eden tekstil yüzey. Hareketli günlerde sana eşlik eder.'], ['Tempona eşlik eden denge.', 'Dinamik yastıklama, aktif kullanımda yastıklama ile desteği bir arada sunar.'], ['Hareketin içinde destek.', 'Dengeli kavis desteği, hareketli günlerde kontrollü bir basış hissi için tasarlandı.'], ['Topukta destekleyici yapı.', 'Topuk bölgesi, Energy’nin yastıklama ve destek yapısının bir parçasıdır.']],
    support: [['Her şey ilk temasla başlar.', 'Ayağınla temas eden tekstil yüzey. Günlük kullanım için tasarlandı.'], ['Destek odaklı bir denge.', 'Yastıklamadan çok belirgin destek hissine öncelik verenler için.'], ['Daha belirgin kavis desteği.', 'Güçlendirilmiş kavis yapısı, daha stabil bir kullanım hissi tercih edenler için.'], ['Desteği tamamlayan topuk.', 'Topuk bölgesindeki yapı, modelin belirgin destek yaklaşımını tamamlar.']]
  };
  function set(name, value) {hero.style.setProperty(name, value);}
  function updateCopy(showHero) {
    if (activeCopy === showHero) return;
    activeCopy = showHero;
    // Inactive scenes cannot receive keyboard focus or remain in the accessibility tree.
    const outgoing = showHero ? layerStory : heroCopy;
    const incoming = showHero ? heroCopy : layerStory;
    const moveFocus = outgoing.contains(document.activeElement);
    incoming.inert = false;
    incoming.removeAttribute('aria-hidden');
    outgoing.inert = true;
    outgoing.setAttribute('aria-hidden', 'true');
    heroCopy.classList.toggle('is-inactive', !showHero);
    if (moveFocus) incoming.querySelector('[data-buy]').focus({preventScroll: true});
  }
  function render(progress) {
    const turn = range(progress, .02, .24);
    const open = range(progress, .18, .44);
    const crossfade = range(progress, .10, .24); // Family campaign gives way to the selected model’s layer scene.
    const introExit = range(progress, .02, .22);
    const copyEnter = range(progress, .14, .24);
    set('--scene-progress', progress.toFixed(4));
    set('--stage-left', `${50 + (geometry.left - 50) * turn}%`);
    set('--stage-top', `${geometry.initialTop + (geometry.top - geometry.initialTop) * turn}%`);
    set('--stage-width', `${geometry.initialWidth + (geometry.width - geometry.initialWidth) * turn}px`);
    hero.classList.toggle('layers-focused', progress >= .29);
    set('--visual-x', `${geometry.x * turn}px`);
    set('--visual-y', `${geometry.y * turn}px`);
    set('--visual-scale', (1 + .24 * turn).toFixed(4));
    set('--product-rotation', `${-8 + 83 * turn}deg`);
    set('--product-y', `${-28 * turn}deg`);
    set('--product-x', `${18 * turn}deg`);
    set('--product-opacity', (1 - crossfade).toFixed(4));
    set('--layers-opacity', crossfade.toFixed(4));
    set('--opening-opacity', (1 - range(progress, .06, .22)).toFixed(4));
    set('--opening-shift', `${-35 * turn}px`);
    set('--pins-opacity', range(progress, .41, .46).toFixed(4));
    set('--pin-line', range(progress, .41, .46).toFixed(4));
    set('--stack-rotation', `${-8 + 13 * turn}deg`);
    set('--stack-y', `${-8 + 16 * turn}deg`);
    set('--hero-copy-opacity', (1 - introExit).toFixed(4));
    set('--hero-copy-y', `${55 * introExit}px`);
    set('--story-opacity', copyEnter.toFixed(4));
    set('--story-y', `${25 * (1 - copyEnter)}px`);
    set('--scene-dim', (.48 * range(progress, .10, .48)).toFixed(4));
    set('--landscape-scale', (1.04 + .18 * turn).toFixed(4));
    set('--landscape-y', `${-25 * turn}px`);
    set('--progress-opacity', range(progress, .07, .19).toFixed(4));
    pieces.forEach((piece, index) => {
      piece.style.setProperty('--piece-reveal', index === 0 ? '1' : range(progress, .16, .28).toFixed(4));
      piece.style.setProperty('--piece-y', `${(index - 1.5) * (geometry.gap * open)}px`);
      piece.style.setProperty('--piece-x', `${(index - 1.5) * 11 * open}px`);
      pins[index].style.setProperty('--pin-y', `${(index - 1.5) * (geometry.labelGap * open)}px`);
    });
    updateCopy(progress < .20);
    const chapter = progress < .46 ? 0 : progress < .64 ? 1 : progress < .82 ? 2 : 3;
    if (chapter !== activeChapter) {
      activeChapter = chapter;
      const data = content[model][chapter];
      step.textContent = ['01 / TEMAS', '02 / YASTIKLAMA', '03 / KAVİS', '04 / TOPUK'][chapter];
      title.textContent = data[0];
      description.textContent = data[1];
      pins.forEach((pin, index) => pin.classList.toggle('is-active', index === chapter));
      pieces.forEach((piece, index) => piece.classList.toggle('is-active', index === chapter));
      document.getElementById('pin-cushion').textContent = {comfort:'Yumuşak basış',energy:'Dinamik yastıklama',support:'Destek dengesi'}[model];
      document.getElementById('pin-support').textContent = {comfort:'Esnek destek',energy:'Dengeli destek',support:'Güçlü destek'}[model];
    }
    // Phase boundaries differ from the copy chapters.
    phase.textContent = progress < .29 ? 'KAYDIR · KATMANLARI AÇ' : ['01 — TEMAS', '02 — YASTIKLAMA', '03 — KAVİS', '04 — TOPUK'][chapter];
  }
  function measure() {
    const bounds = story.getBoundingClientRect();
    const mobile = innerWidth <= 700;
    const narrow = innerWidth <= 360;
    const short = mobile && innerHeight <= 740;
    geometry = {
      start: bounds.top + scrollY,
      distance: Math.max(1, story.offsetHeight - hero.offsetHeight),
      x: mobile ? 0 : innerWidth * .15,
      y: mobile ? hero.offsetHeight * .01 : hero.offsetHeight * .08,
      gap: short ? 49 : mobile ? 57 : innerWidth <= 1000 ? 105 : 135,
      labelGap: short ? 60 : mobile ? 70 : innerWidth <= 1000 ? 105 : 135,
      left: mobile ? 32 : innerWidth <= 1000 ? 55 : 58,
      top: mobile ? (short ? 23 : 27) : 44,
      initialTop: mobile ? (short ? 23 : 28) : 27,
      initialWidth: mobile ? Math.min(innerWidth * .77, 330) : Math.min(innerWidth * .37, 480),
      width: mobile ? innerWidth * .52 : innerWidth <= 1000 ? innerWidth * .40 : Math.min(innerWidth * .36, 520)
    };
    target = clamp((scrollY - geometry.start) / geometry.distance);
  }
  function tick() {
    frame = 0;
    if (paused || preference.matches || document.hidden) return;
    current += (target - current) * .14;
    if (Math.abs(target - current) < .0003) current = target;
    render(current);
    if (current !== target) frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (!frame && !paused && !preference.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function onScroll() {
    target = clamp((scrollY - geometry.start) / geometry.distance);
    schedule();
  }
  function sync() {
    const reduced = preference.matches;
    document.body.classList.toggle('scroll-ready', !reduced);
    document.body.classList.toggle('motion-paused', paused || reduced);
    button.setAttribute('aria-pressed', String(paused || reduced));
    button.textContent = reduced ? 'Hareket azaltıldı' : paused ? '▷ Hareketi başlat' : 'Ⅱ Hareketi durdur';
    button.disabled = reduced;
    hero.querySelector('.scroll-cue').href = reduced || paused ? '#fark' : '#katmanlar';
    button.title = reduced ? 'Sistem hareket azaltma tercihin etkin.' : 'Ürün ve manzara hareketini durdur veya başlat.';
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    measure();
    if (reduced) {current = 0; render(0);}
    else schedule();
    document.dispatchEvent(new CustomEvent('smartfit:motion'));
  }
  button.addEventListener('click', () => {paused = !paused; sync();});
  preference.addEventListener('change', () => {paused = false; sync();});
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', () => {measure(); if (paused) render(current); else schedule();}, {passive: true});
  window.addEventListener('pageshow', () => {measure(); schedule();});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {cancelAnimationFrame(frame); frame = 0;}
    else {measure(); schedule();}
  });
  document.addEventListener('smartfit:model', event => {
    if (!Object.hasOwn(content, event.detail.model)) return;
    model = event.detail.model;
    stack.dataset.model = model;
    activeChapter = -1;
    render(current);
  });
  stack.dataset.model = model;
  sync();
  render(0);
})();
