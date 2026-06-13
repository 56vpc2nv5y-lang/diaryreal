(function installExperienceEnhancements() {
  const STORAGE = {
    rejectedQuotes: 'diary-rejected-quotes',
    focusMode: 'diary-focus-mode',
  };

  const THEME_GROUPS = [
    ['清雅', ['青瓷', '墨梅', '苔庭']],
    ['温暖', ['旧书房', '晨报', '曜石晨光']],
    ['轻盈', ['暮云', '海盐', '雪夜']],
  ];
  const THEME_RECOMMENDATIONS = {
    celadon: '推荐：素雅浅色信纸 · 宋体或霞鹜文楷',
    inkPlum: '推荐：宣纸或留白信纸 · 霞鹜文楷',
    mossGarden: '推荐：植物边缘信纸 · 宋体',
    study: '推荐：米白旧纸 · 宋体或霞鹜文楷',
    dusk: '推荐：低对比浅色信纸 · 小薇体',
    morningPaper: '推荐：无图案信纸 · 宋体',
    seaSalt: '推荐：开阔浅蓝信纸 · 宋体',
    obsidianDawn: '推荐：暖白矿物纸 · 小薇体',
    snowNight: '推荐：月白或冰蓝信纸 · 小薇体',
  };

  const normalize = (value) => String(value || '').replace(/\s+/g, '').trim();
  const isVisible = (element) =>
    element &&
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== 'hidden';

  const findClickable = (label) =>
    [...document.querySelectorAll('button, [role="button"], a')]
      .find((element) => isVisible(element) && normalize(element.textContent) === normalize(label));

  const readRejectedQuotes = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.rejectedQuotes) || '[]');
    } catch (_) {
      return [];
    }
  };

  const storeRejectedQuote = (quote) => {
    const rejected = readRejectedQuotes();
    if (!rejected.includes(quote)) rejected.push(quote);
    localStorage.setItem(STORAGE.rejectedQuotes, JSON.stringify(rejected.slice(-200)));
  };

  const showToast = (message) => {
    const previous = document.querySelector('[data-experience-toast]');
    if (previous) previous.remove();
    const toast = document.createElement('div');
    toast.dataset.experienceToast = 'true';
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2200);
  };

  const showNextSteps = () => {
    if (document.querySelector('[data-save-next-steps]')) return;
    const wrap = document.createElement('div');
    wrap.dataset.saveNextSteps = 'true';
    wrap.innerHTML = `
      <div class="experience-sheet" role="dialog" aria-label="日记已保存">
        <button class="experience-close" type="button" aria-label="关闭">×</button>
        <p class="experience-kicker">今日已记下</p>
        <h2>日记保存好了</h2>
        <p class="experience-copy">先让文字安静地留下，再决定要不要继续。</p>
        <div class="experience-actions">
          <button type="button" data-next-action="拾句">让 AI 拾句</button>
          <button type="button" data-next-action="摇签">摇签选诗</button>
          <button type="button" data-next-action="完成">就到这里</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const close = () => wrap.remove();
    wrap.addEventListener('click', (event) => {
      if (event.target === wrap || event.target.closest('.experience-close')) close();
      const action = event.target.closest('[data-next-action]')?.dataset.nextAction;
      if (!action) return;
      if (action === '拾句') {
        (findClickable('让 AI 拾句') || findClickable('重新拾句'))?.click();
      } else if (action === '摇签') {
        (findClickable('摇签选诗') || findClickable('摇签求诗') || findClickable('保存后起卦'))?.click();
      }
      close();
    });
  };

  const enhanceSaveFlow = () => {
    document.querySelectorAll('button, [role="button"]').forEach((button) => {
      const label = normalize(button.textContent);
      if (!['保存', '保存日记'].includes(label) || button.dataset.saveFlowEnhanced) return;
      button.dataset.saveFlowEnhanced = 'true';
      button.addEventListener('click', () => {
        if (![...document.querySelectorAll('textarea')].some(isVisible)) return;
        window.setTimeout(showNextSteps, 450);
      });
    });
  };

  const enhanceQuoteCards = () => {
    document.querySelectorAll('button, [role="button"]').forEach((collectButton) => {
      if (normalize(collectButton.textContent) !== '收入拾句册' || collectButton.dataset.quoteFeedbackEnhanced) return;
      collectButton.dataset.quoteFeedbackEnhanced = 'true';
      const card = collectButton.closest('[class*="card"], [class*="panel"], article, section, li, div');
      if (!card) return;

      const quoteCandidate = [...card.querySelectorAll('p, blockquote, h3, h4, div')]
        .map((element) => element.textContent?.trim())
        .find((text) => text && text !== collectButton.textContent && text.length >= 4 && text.length <= 180);
      if (!quoteCandidate) return;

      const reject = document.createElement('button');
      reject.type = 'button';
      reject.className = 'experience-quote-reject';
      reject.textContent = '不值得';
      reject.addEventListener('click', () => {
        storeRejectedQuote(quoteCandidate);
        card.classList.add('experience-rejected');
        showToast('已记住：以后少推荐这样的句子');
        window.setTimeout(() => card.remove(), 220);
      });
      collectButton.insertAdjacentElement('afterend', reject);

      const rejected = readRejectedQuotes();
      if (rejected.includes(quoteCandidate)) card.classList.add('experience-rejected');
    });
  };

  const deEmphasizeAiReasons = () => {
    document.querySelectorAll('*').forEach((element) => {
      if (element.children.length || element.dataset.aiReasonEnhanced) return;
      const text = element.textContent?.trim() || '';
      if (!/^(概括|点明|生动|体现|表达|直接点明|根据本篇日记)/.test(text)) return;
      element.dataset.aiReasonEnhanced = 'true';
      element.classList.add('experience-ai-reason');
    });
  };

  const enhanceReadingHierarchy = () => {
    document.querySelectorAll('h1, h2, h3, h4, p, span, div').forEach((element) => {
      if (element.children.length > 3) return;
      const text = normalize(element.textContent);
      if (text === 'AI拾句' || text === '拾句') {
        element.closest('section, article, [class*="card"], [class*="panel"], div')
          ?.classList.add('experience-quote-section');
      }
      if (text === '回看点评') {
        element.closest('section, article, [class*="card"], [class*="panel"], div')
          ?.classList.add('experience-review-section');
      }
      if (text === '本篇诗签' || text === '诗签') {
        element.closest('section, article, [class*="card"], [class*="panel"], div')
          ?.classList.add('experience-poem-section');
      }
    });
  };

  const enhanceCollections = () => {
    const tabs = [...document.querySelectorAll('button, [role="button"]')];
    const collectionTabs = tabs.filter((button) =>
      ['诗册', '拾句册', '里程碑'].some((label) => normalize(button.textContent).startsWith(label))
    );
    if (collectionTabs.length < 3) {
      document.documentElement.classList.remove('experience-collections-visible');
      delete document.documentElement.dataset.collectionKind;
      return;
    }
    collectionTabs.forEach((button) => {
      button.classList.add('experience-collection-tab');
      if (button.dataset.collectionEnhanced) return;
      button.dataset.collectionEnhanced = 'true';
      button.addEventListener('click', () => {
        const label = normalize(button.textContent);
        document.documentElement.dataset.collectionKind =
          label.startsWith('拾句册') ? 'quotes' : label.startsWith('里程碑') ? 'milestones' : 'poems';
      });
    });
    collectionTabs[0].parentElement?.classList.add('experience-collection-tabs');
    document.documentElement.classList.add('experience-collections-visible');
    if (!document.documentElement.dataset.collectionKind) {
      document.documentElement.dataset.collectionKind = 'poems';
    }
  };

  const groupThemeCards = () => {
    if (document.querySelector('[data-theme-group-guide]')) return;
    const labels = [...document.querySelectorAll('button, [role="button"], h3, h4, p, span')]
      .map((element) => normalize(element.textContent));
    const presentGroups = THEME_GROUPS.filter(([, themes]) => themes.some((name) => labels.includes(name)));
    if (presentGroups.length < 2) return;

    const heading = [...document.querySelectorAll('h1, h2, h3, p')]
      .find((element) => normalize(element.textContent).includes('主题皮肤'));
    if (!heading) return;
    const guide = document.createElement('div');
    guide.dataset.themeGroupGuide = 'true';
    guide.className = 'experience-theme-guide';
    guide.innerHTML = presentGroups
      .map(([group, themes]) => `<span><strong>${group}</strong> · ${themes.join(' / ')}</span>`)
      .join('');
    heading.insertAdjacentElement('afterend', guide);
  };

  const showThemeRecommendation = () => {
    const heading = [...document.querySelectorAll('h1, h2, h3, p')]
      .find((element) => normalize(element.textContent).includes('主题皮肤'));
    if (!heading) return;
    const theme = localStorage.getItem('diary-theme') || 'celadon';
    const text = THEME_RECOMMENDATIONS[theme];
    if (!text) return;
    const recommendation = document.querySelector('[data-theme-recommendation]') || document.createElement('p');
    if (!recommendation.dataset.themeRecommendation) {
      recommendation.dataset.themeRecommendation = 'true';
      recommendation.className = 'experience-theme-recommendation';
      heading.insertAdjacentElement('afterend', recommendation);
    }
    recommendation.textContent = text;
  };

  const installFocusMode = () => {
    const existing = document.querySelector('[data-focus-toggle]');
    if (existing) {
      const available = [...document.querySelectorAll('textarea')].some(isVisible);
      existing.classList.toggle('experience-focus-available', available);
      if (!available) document.documentElement.classList.remove('experience-focus-mode');
      return;
    }
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.dataset.focusToggle = 'true';
    toggle.className = 'experience-focus-toggle';
    toggle.textContent = '专注';
    toggle.title = '电脑端专注写作';
    toggle.classList.toggle(
      'experience-focus-available',
      [...document.querySelectorAll('textarea')].some(isVisible)
    );
    toggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('experience-focus-mode');
      const active = document.documentElement.classList.contains('experience-focus-mode');
      localStorage.setItem(STORAGE.focusMode, active ? '1' : '0');
      toggle.textContent = active ? '退出专注' : '专注';
    });
    document.body.appendChild(toggle);
  };

  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return;
    const save = findClickable('保存日记') || findClickable('保存');
    if (!save) return;
    event.preventDefault();
    save.click();
    showToast('已使用快捷键保存');
  });

  const enhance = () => {
    enhanceSaveFlow();
    enhanceQuoteCards();
    deEmphasizeAiReasons();
    enhanceReadingHierarchy();
    enhanceCollections();
    groupThemeCards();
    showThemeRecommendation();
    installFocusMode();
  };

  const start = () => {
    if (localStorage.getItem(STORAGE.focusMode) === '1') {
      document.documentElement.classList.add('experience-focus-mode');
    }
    enhance();
    new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
