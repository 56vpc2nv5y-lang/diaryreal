(function installSelectedThemes() {
  if (!window.THEMES) {
    let themes;
    Object.defineProperty(window, 'THEMES', {
      configurable: true,
      get: function getThemes() {
        return themes;
      },
      set: function setThemes(value) {
        themes = value;
        installSelectedThemes();
      },
    });
    return;
  }

  if (!window.THEMES.celadon || !window.THEMES.study || !window.THEMES.dusk) {
    return;
  }

  const fonts = {
    song: '"Noto Serif SC", serif',
    writing: '"LXGW WenKai", "Noto Serif SC", serif',
    refined: '"ZCOOL XiaoWei", "Noto Serif SC", serif',
    body: '"Noto Sans SC", sans-serif',
  };

  const makeTheme = (base, definition) => ({
    ...base,
    ...definition,
    palette: {
      ...base.palette,
      ...definition.palette,
    },
  });

  // 青瓷：浅青釉色、象牙纸面、深玉墨色与克制朱砂。
  window.THEMES.celadon = makeTheme(window.THEMES.celadon, {
    key: 'celadon',
    name: '青瓷',
    description: '青瓷釉色，温润如玉',
    fontSerif: fonts.song,
    fontWriting: fonts.writing,
    fontBody: fonts.body,
    fontCanvas: fonts.song,
    writingSpacing: '0.075em',
    writingLineHeight: 1.95,
    palette: {
      bg: '#e7eee9',
      paper: '#f7f7f1',
      card: '#fbfaf5',
      surface: '#fbfaf5',
      panel: '#eef3ef',
      ink: '#244f46',
      muted: '#78958b',
      accent: '#3f7668',
      accentSoft: '#d7e5df',
      line: '#aec8be',
      border: '#c8d8d1',
      nav: '#f3f6f2',
      seal: '#b84b3e',
    },
  });

  // 墨梅：宣纸留白为主，墨色清峭，只留一点朱砂。
  window.THEMES.inkPlum = makeTheme(window.THEMES.study, {
    key: 'inkPlum',
    name: '墨梅',
    description: '宣纸留白，墨韵清雅',
    fontSerif: fonts.refined,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.refined,
    writingSpacing: '0.085em',
    writingLineHeight: 2,
    palette: {
      bg: '#eee9df',
      paper: '#faf6ed',
      card: '#fdf9f0',
      surface: '#fdf9f0',
      panel: '#f5eee2',
      ink: '#292b29',
      muted: '#77766f',
      accent: '#a43a2e',
      accentSoft: '#ead7ce',
      line: '#bbb4a7',
      border: '#d2c9bb',
      nav: '#f8f2e8',
      seal: '#b43a2e',
    },
  });

  // 苔庭：苔痕、石色与幽深庭院绿，保持安静而非繁茂。
  window.THEMES.mossGarden = makeTheme(window.THEMES.celadon, {
    key: 'mossGarden',
    name: '苔庭',
    description: '苔痕庭院，清静自然',
    fontSerif: fonts.song,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.065em',
    writingLineHeight: 1.95,
    palette: {
      bg: '#d8ddd3',
      paper: '#efefe8',
      card: '#f2f2eb',
      surface: '#f2f2eb',
      panel: '#e5e8de',
      ink: '#23442c',
      muted: '#718071',
      accent: '#496b4b',
      accentSoft: '#cbd6c6',
      line: '#9eae9e',
      border: '#b7c1b5',
      nav: '#e9ece4',
      seal: '#476449',
    },
  });

  // 旧书房：保留原本朴素的暖棕与大块奶油纸面。
  window.THEMES.study = makeTheme(window.THEMES.study, {
    key: 'study',
    name: '旧书房',
    description: '旧纸暖光，安静书写',
    fontSerif: fonts.song,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.08em',
    writingLineHeight: 2,
    palette: {
      bg: '#d9c5a3',
      paper: '#f4e8ce',
      card: '#f7ecd5',
      surface: '#f7ecd5',
      panel: '#ecddc2',
      ink: '#403126',
      muted: '#927b61',
      accent: '#8a4a38',
      accentSoft: '#dec7a8',
      line: '#bba17c',
      border: '#ccb58f',
      nav: '#f1e4cc',
      seal: '#8f3329',
    },
  });

  // 暮云：极浅雾紫与留白，不添加云纹或渐变装饰。
  window.THEMES.dusk = makeTheme(window.THEMES.dusk, {
    key: 'dusk',
    name: '暮云',
    description: '雾紫微光，柔静留白',
    fontSerif: fonts.refined,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.refined,
    writingSpacing: '0.09em',
    writingLineHeight: 2.05,
    palette: {
      bg: '#e8e3ed',
      paper: '#f8f5fa',
      card: '#fbf9fc',
      surface: '#fbf9fc',
      panel: '#f0ebf3',
      ink: '#44394e',
      muted: '#988ca2',
      accent: '#806d91',
      accentSoft: '#ded5e5',
      line: '#c7bbd0',
      border: '#d8cfdf',
      nav: '#f4f0f6',
      seal: '#a8525b',
    },
  });

  delete window.THEMES.night;
  delete window.THEMES.macaron;
  delete window.THEMES.mandela;
})();
