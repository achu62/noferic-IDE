const source = document.querySelector('#source');

function send(type, details = {}) {
  window.parent.postMessage({ type, ...details }, window.location.origin);
}

function updateCursor() {
  const beforeCursor = source.value.slice(0, source.selectionStart);
  const lines = beforeCursor.split('\n');
  send('editor-cursor', {
    line: lines.length,
    column: lines.at(-1).length + 1,
    text: source.value,
  });
}

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.origin !== window.location.origin) return;

  if (event.data?.type === 'editor-set-content') {
    source.value = event.data.text ?? '';
    source.focus();
    updateCursor();
  }

  if (event.data?.type === 'editor-set-theme') {
    document.documentElement.dataset.theme = event.data.theme;
  }
});

source.addEventListener('input', updateCursor);
source.addEventListener('click', updateCursor);
source.addEventListener('keyup', updateCursor);
source.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && ['s', 'o'].includes(event.key.toLowerCase())) {
    event.preventDefault();
    send('editor-shortcut', { key: event.key.toLowerCase() });
  }

  if (event.key === 'Tab') {
    event.preventDefault();
    const start = source.selectionStart;
    const end = source.selectionEnd;
    source.setRangeText('  ', start, end, 'end');
    updateCursor();
  }
});

updateCursor();