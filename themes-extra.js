(function installAdditionalThemes() {
  if (!window.THEMES) {
    let themes;
    Object.defineProperty(window, 'THEMES', {
      configurable: true,
      get: function getThemes() {
        return themes;
      },
      set: function setThemes(value) {
        themes = value;
        installAdditionalThemes();
      },
    });
    return;
  }

  if (!window.THEMES.celadon || !window.THEMES.study) {
    return;
  }

  delete window.THEMES.night;

  if (!window.THEMES.inkPlum) {
    window.THEMES.inkPlum = {
      ...window.THEMES.study,
      key: 'inkPlum',
      name: '墨梅',
      description: '宣纸留白，墨韵清雅',
      palette: {
        ...window.THEMES.study.palette,
        bg: '#eee9df',
        paper: '#faf6ed',
        card: '#faf6ed',
        surface: '#faf6ed',
        panel: '#f5eee2',
        ink: '#292b29',
        muted: '#77766f',
        accent: '#9f352b',
        accentSoft: '#ead7ce',
        line: '#b8b2a7',
        border: '#cfc7b8',
        nav: '#f8f2e8',
        seal: '#b43a2e',
      },
      fontSerif: '"Noto Serif SC", serif',
      fontWriting: '"LXGW WenKai", "Noto Serif SC", serif',
      fontBody: '"Noto Serif SC", serif',
      fontCanvas: '"Noto Serif SC", serif',
      writingSpacing: '0.08em',
      writingLineHeight: 2,
    };
  }

  if (!window.THEMES.mossGarden) {
    window.THEMES.mossGarden = {
      ...window.THEMES.celadon,
      key: 'mossGarden',
      name: '苔庭',
      description: '苔痕庭院，清静自然',
      palette: {
        ...window.THEMES.celadon.palette,
        bg: '#d9ddd3',
        paper: '#eeeee7',
        card: '#eeeee7',
        surface: '#eeeee7',
        panel: '#e4e7dd',
        ink: '#203f2a',
        muted: '#6e796d',
        accent: '#456646',
        accentSoft: '#c9d3c4',
        line: '#9ba99a',
        border: '#b3bcb0',
        nav: '#e8ece3',
        seal: '#476449',
      },
      fontSerif: '"Noto Serif SC", serif',
      fontWriting: '"LXGW WenKai", "Noto Serif SC", serif',
      fontBody: '"Noto Serif SC", serif',
      fontCanvas: '"Noto Serif SC", serif',
      writingSpacing: '0.06em',
      writingLineHeight: 1.95,
    };
  }
})();
