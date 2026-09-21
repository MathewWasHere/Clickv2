/* services page: category tabs + hash deep link */
(function () {
  var sections = { main: document.getElementById('cat-main'), groom: document.getElementById('cat-groom') };
  var buttons = document.querySelectorAll('[data-cat]');

  window.showCategory = function (cat) {
    Object.keys(sections).forEach(function (k) {
      if (sections[k]) sections[k].style.display = (k === cat) ? '' : 'none';
    });
    buttons.forEach(function (b) {
      var active = b.getAttribute('data-cat') === cat;
      b.className = 'shrink-0 text-xs px-4 py-2 rounded-full ' + (active
        ? 'bg-primary text-[#F9F8F2] font-semibold'
        : 'bg-surface-light text-[#272727]/60 font-medium');
    });
  };

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { showCategory(b.getAttribute('data-cat')); });
  });

  showCategory(location.hash === '#groom' ? 'groom' : 'main');
})();
