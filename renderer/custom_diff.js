//jai sri ram
/**
 * diff_creator.js
 * 
 * Creates a clean, table-free, flexbox-based line-by-line visual diff.
 * 
 * @param {string} oldText - The original text (non-null string)
 * @param {string} newText - The new/modified text (non-null string)
 * @param {HTMLElement} div - The parent element to render the diff inside
 */
function createDiff(oldText, newText, div) {
  if (typeof oldText !== 'string' || typeof newText !== 'string' || !div) {
    console.error("Invalid arguments provided to createDiff. Expected (string, string, HTMLElement)");
    return;
  }

  // Inject standard styling if not already present on page
  injectDiffStyles();

  // Step 1: Compute Line-by-Line Diff Data
  const diffLines = computeLineDiff(oldText, newText);

  // Step 2: Render using Flexbox Structure
  renderDiffUI(diffLines, div);
}

/**
 * Step 1: Simple Myers-inspired line-by-line diff algorithm
 */
function computeLineDiff(oldText, newText) {
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);

  const n = oldLines.length;
  const m = newLines.length;

  // Compute Longest Common Subsequence (LCS) matrix
  const lcs = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldLines[i] === newLines[j]) {
        lcs[i + 1][j + 1] = lcs[i][j] + 1;
      } else {
        lcs[i + 1][j + 1] = Math.max(lcs[i][j + 1], lcs[i + 1][j]);
      }
    }
  }

  // Backtrack from bottom-right to construct diff sequence
  let i = n, j = m;
  const result = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({ type: 'unchanged', oldLineNum: i, newLineNum: j, text: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      result.push({ type: 'added', oldLineNum: null, newLineNum: j, text: newLines[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
      result.push({ type: 'removed', oldLineNum: i, newLineNum: null, text: oldLines[i - 1] });
      i--;
    }
  }

  return result.reverse();
}

/**
 * Step 2: Render the DOM elements using Flexbox
 */
function renderDiffUI(diffLines, parentElement) {
  parentElement.innerHTML = ''; // Clear parent container

  const container = document.createElement('div');
  container.className = 'diff-container';

  diffLines.forEach(line => {
    const row = document.createElement('div');
    row.className = `diff-row ${line.type}`;

    // Line Number (Old)
    const oldNumEl = document.createElement('span');
    oldNumEl.className = 'diff-num old-num';
    oldNumEl.textContent = line.oldLineNum !== null ? line.oldLineNum : '';

    // Line Number (New)
    const newNumEl = document.createElement('span');
    newNumEl.className = 'diff-num new-num';
    newNumEl.textContent = line.newLineNum !== null ? line.newLineNum : '';

    // Marker (+ / - / space)
    const prefixEl = document.createElement('span');
    prefixEl.className = 'diff-prefix';
    prefixEl.textContent = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

    // Code/Text Content
    const contentEl = document.createElement('span');
    contentEl.className = 'diff-content';
    contentEl.textContent = line.text;

    row.appendChild(oldNumEl);
    row.appendChild(newNumEl);
    row.appendChild(prefixEl);
    row.appendChild(contentEl);

    container.appendChild(row);
  });

  parentElement.appendChild(container);
}

/**
 * Helper to auto-inject light CSS stylesheet into document head
 */
function injectDiffStyles() {
  if (document.getElementById('diff-creator-styles')) return;

  const style = document.createElement('style');
  style.id = 'diff-creator-styles';
  style.textContent = `
    .diff-container {
      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;
      font-size: 13px;
      line-height: 1.5;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      overflow-x: auto;
      background-color: #ffffff;
      color: #1f2328;
    }
    
    .diff-row {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      width: 100%;
      white-space: pre;
    }
    
    .diff-row.added {
      background-color: #e6ffec;
    }
    
    .diff-row.removed {
      background-color: #ffebe9;
    }
    
    .diff-row:hover {
      background-color: #f3f4f6;
    }
    .diff-row.added:hover {
      background-color: #ccffd8;
    }
    .diff-row.removed:hover {
      background-color: #ffd7d5;
    }

    .diff-num {
      width: 45px;
      min-width: 45px;
      padding: 0 8px;
      text-align: right;
      color: #6e7781;
      user-select: none;
      box-sizing: border-box;
      border-right: 1px solid #e1e4e8;
      background-color: rgba(246, 248, 250, 0.6);
    }

    .diff-prefix {
      width: 24px;
      min-width: 24px;
      text-align: center;
      user-select: none;
      font-weight: bold;
    }
    .diff-row.added .diff-prefix { color: #1a7f37; }
    .diff-row.removed .diff-prefix { color: #cf222e; }

    .diff-content {
      flex: 1;
      padding-right: 10px;
      overflow-x: auto;
    }
  `;
  document.head.appendChild(style);
}

// Export for Node.js / ES module compatibility if required
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createDiff };
}