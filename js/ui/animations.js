(function initScrollReveal() {
  var els = document.querySelectorAll('.eb-reveal');
  if (!els.length) return;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('eb-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(el, i) {
      var parent = el.parentElement;
      var siblings = parent ? parent.querySelectorAll(':scope > .eb-reveal') : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (idx > 0 && !el.style.transitionDelay) {
        el.style.transitionDelay = (idx * 60) + 'ms';
      }
      io.observe(el);
    });
  } else {
    els.forEach(function(el) { el.classList.add('eb-in'); });
  }
})();

(function initSectionEnter() {
  var sections = document.querySelectorAll('.eb-section');
  if (!sections.length || !('IntersectionObserver' in window)) return;
  var sio = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('eb-section-entered');
        sio.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  sections.forEach(function(s) { sio.observe(s); });
})();
