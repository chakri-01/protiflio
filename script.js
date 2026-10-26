(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover)').matches;

  /* ---------- split hero letters ---------- */
  let idx = 0;
  $$('[data-split]').forEach(line => {
    const txt = line.textContent.trim();
    line.textContent = '';
    [...txt].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', idx++);
      s.textContent = c;
      line.appendChild(s);
    });
  });

  /* ---------- preloader ---------- */
  document.body.classList.add('loading');
  const num = $('#preNum'), bar = $('#preBar'), pre = $('#preloader');
  let n = 0;
  const tick = setInterval(() => {
    n += Math.ceil(Math.random() * 7);
    if (n >= 100) {
      n = 100;
      clearInterval(tick);
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.remove('loading');
        document.body.classList.add('ready');
        $$('.hero .reveal').forEach((el, i) => {
          el.style.setProperty('--d', (0.9 + i * 0.15) + 's');
          el.classList.add('in');
        });
      }, 250);
    }
    num.textContent = n;
    bar.style.width = n + '%';
  }, 40);

  /* ---------- custom cursor ---------- */
  if (fine && !reduce) {
    const c = $('#cursor'), d = $('#cursorDot');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      d.style.left = mx + 'px'; d.style.top = my + 'px';
    });
    (function loop() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      c.style.left = cx + 'px'; c.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
    $$('a, button, [data-magnetic], input, textarea, .proj').forEach(el => {
      el.addEventListener('mouseenter', () => c.classList.add('hover'));
      el.addEventListener('mouseleave', () => c.classList.remove('hover'));
    });
  }

  /* ---------- magnetic elements ---------- */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.2,2,.4,1)';
        el.style.transform = '';
        setTimeout(() => (el.style.transition = ''), 500);
      });
    });
  }

  /* ---------- tilt cards ---------- */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg) scale(1.02)`;
      });
      el.addEventListener('mouseleave', () => (el.style.transform = ''));
    });
  }

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      // skill bars
      $$('.bar i', e.target).forEach(b => (b.style.width = b.dataset.w + '%'));
      if (e.target.matches('.skill')) {
        const b = $('.bar i', e.target);
        if (b) b.style.width = b.dataset.w + '%';
      }
      // counters
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.matches('.stat')) countUp($('[data-count]', e.target));
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  // stagger siblings
  $$('.reveal').forEach(el => {
    if (el.closest('.hero')) return;
    const sibs = [...el.parentElement.children].filter(x => x.classList.contains('reveal'));
    el.style.setProperty('--d', sibs.indexOf(el) * 0.1 + 's');
    io.observe(el);
  });

  function countUp(el) {
    if (!el || el.dataset.done) return;
    el.dataset.done = 1;
    const target = +el.dataset.count, t0 = performance.now(), dur = 1800;
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- scroll: progress bar, nav hide, marquee speed ---------- */
  const prog = $('#progress'), nav = $('#nav');
  const m1 = $('#marquee1'), m2 = $('#marquee2');
  let lastY = scrollY, vel = 0, o1 = 0, o2 = 0;

  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (scrollY / h) * 100 + '%';
    if (scrollY > 200 && scrollY > lastY) nav.classList.add('hide');
    else nav.classList.remove('hide');
    vel = scrollY - lastY;
    lastY = scrollY;
  }, { passive: true });

  (function marquee() {
    o1 -= 1.2 + Math.abs(vel) * 0.25;
    o2 += 1.0 + Math.abs(vel) * 0.2;
    vel *= 0.9;
    [[m1, o1], [m2, o2]].forEach(([el, o], i) => {
      if (!el) return;
      const half = el.scrollWidth / 2;
      let x = o % half;
      if (i === 1) x = -((half - x) % half);
      el.style.transform = `translateX(${x}px)`;
    });
    if (!reduce) requestAnimationFrame(marquee);
  })();

  /* ---------- hero parallax on mouse ---------- */
  if (fine && !reduce) {
    const b1 = $('.b1'), b2 = $('.b2');
    addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      b1.style.translate = `${x * -60}px ${y * -60}px`;
      b2.style.translate = `${x * 80}px ${y * 80}px`;
    });
  }

  /* ---------- rotating words ---------- */
  const words = ['Java web apps', 'servlets that work', 'clean databases', 'bold interfaces'];
  const swap = $('#swap');
  let wi = 0;
  setInterval(() => {
    swap.style.transition = 'opacity .25s, transform .25s';
    swap.style.opacity = 0;
    swap.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      wi = (wi + 1) % words.length;
      swap.textContent = words[wi];
      swap.style.transform = 'translateY(10px)';
      requestAnimationFrame(() => {
        swap.style.opacity = 1;
        swap.style.transform = 'none';
      });
    }, 260);
  }, 2600);

  /* ---------- projects: thumb follows cursor vertical hint ---------- */
  $$('.proj').forEach(p => {
    const t = $('.p-thumb', p);
    p.addEventListener('mousemove', e => {
      const r = p.getBoundingClientRect();
      t.style.right = 'auto';
      t.style.left = Math.min(e.clientX - r.left + 30, r.width - 280) + 'px';
    });
  });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  const toggle = open => {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));

  /* ---------- misc ---------- */
  const yr = new Date().getFullYear();
  $('#year').textContent = yr;
  $$('.y2').forEach(e => (e.textContent = yr));
})();
