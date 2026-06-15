(function installSelectedThemes() {
  if (!window.THEMES.celadon || !window.THEMES.study || !window.THEMES.dusk) {
    return;
  }

  const fonts = {
    song: '"Noto Serif SC", "Songti SC", "SimSun", serif',
    kai: '"KaiTi", "STKaiti", "Kaiti SC", "Noto Serif SC", serif',
    writing: '"LXGW WenKai", "KaiTi", "STKaiti", "Noto Serif SC", serif',
    refined: '"ZCOOL XiaoWei", "Noto Serif SC", serif',
    calligraphy: '"Ma Shan Zheng", "LXGW WenKai", serif',
    body: '"Noto Sans SC", sans-serif',
  };
  const svgBg = source => `url("data:image/svg+xml,${encodeURIComponent(source)}")`;
  const art = {
    crackle: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 240"><g fill="none" stroke="#628d82" stroke-opacity=".1" stroke-width=".7"><path d="M-8 21 23 14l18 15 31-9 21 18 38-11 23 18 34-4M5 72l25-17 23 20 31-11 28 21 34-15 41 18M-9 128l34-18 22 18 31-15 25 19 38-16 38 21M-5 181l31-17 26 21 29-16 30 20 34-18 39 17M29-8l-8 38 18 25-13 37 20 27-17 42 22 28-11 42M88-6l-6 30 19 28-12 34 20 31-14 35 21 30-12 43M147-8l-10 33 19 31-14 34 22 30-17 39 21 28-14 48"/></g></svg>`),
    plum: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180"><g fill="none" stroke="#50483f" stroke-linecap="round"><path stroke-width="5" d="M288 149c-65-7-89-31-137-51-41-17-79-11-129-52"/><path stroke-width="2" d="M209 121c-1-43-25-68-52-91M158 100c-25-37-58-45-93-47M117 83c-9-31-29-50-52-63M235 132c-8-24-1-46 10-68"/></g><g fill="#f8efe4" stroke="#9b5b50" stroke-width="1.2"><g transform="translate(157 31)"><circle r="6"/><circle cx="8" cy="4" r="6"/><circle cx="5" cy="12" r="6"/><circle cx="-5" cy="12" r="6"/><circle cx="-8" cy="4" r="6"/></g><g transform="translate(66 53) scale(.8)"><circle r="6"/><circle cx="8" cy="4" r="6"/><circle cx="5" cy="12" r="6"/><circle cx="-5" cy="12" r="6"/><circle cx="-8" cy="4" r="6"/></g><g transform="translate(243 64) scale(.75)"><circle r="6"/><circle cx="8" cy="4" r="6"/><circle cx="5" cy="12" r="6"/><circle cx="-5" cy="12" r="6"/><circle cx="-8" cy="4" r="6"/></g></g><g fill="#a63d32"><circle cx="151" cy="36" r="2"/><circle cx="63" cy="57" r="2"/><circle cx="239" cy="67" r="2"/></g></svg>`),
    bamboo: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 230"><g fill="none" stroke="#557c55" stroke-opacity=".62" stroke-linecap="round"><path stroke-width="3" d="M155 238c-10-73-5-145 16-231M119 238c1-65 15-132 51-199"/><path stroke-width="1.3" d="m159 73-42-30m39 56 34-35m-39 64-48-21m44 48 38-20m-48 57-43-23m38-28-34-38m61-67-29-24"/></g><g fill="#6e936d" fill-opacity=".48"><ellipse cx="117" cy="42" rx="21" ry="5" transform="rotate(27 117 42)"/><ellipse cx="180" cy="61" rx="21" ry="5" transform="rotate(-45 180 61)"/><ellipse cx="105" cy="106" rx="23" ry="5" transform="rotate(17 105 106)"/><ellipse cx="182" cy="134" rx="21" ry="5" transform="rotate(-25 182 134)"/><ellipse cx="94" cy="167" rx="22" ry="5" transform="rotate(27 94 167)"/><ellipse cx="128" cy="14" rx="18" ry="4" transform="rotate(34 128 14)"/></g></svg>`),
    fern: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 150"><g fill="none" stroke="#597a58" stroke-opacity=".62" stroke-linecap="round"><path stroke-width="2" d="M190 145C140 124 98 91 53 18"/><g stroke-width="1.2"><path d="m163 131 2-42m-19 30-35-7m18-5 7-39m-24 25-37-8m21-5 1-36M82 63 47 57m24-9-5-29"/></g></g><g fill="#729170" fill-opacity=".42"><ellipse cx="164" cy="89" rx="19" ry="5" transform="rotate(-78 164 89)"/><ellipse cx="111" cy="112" rx="19" ry="5" transform="rotate(12 111 112)"/><ellipse cx="136" cy="68" rx="18" ry="5" transform="rotate(-75 136 68)"/><ellipse cx="76" cy="84" rx="18" ry="5" transform="rotate(12 76 84)"/><ellipse cx="96" cy="44" rx="17" ry="5" transform="rotate(-84 96 44)"/><ellipse cx="48" cy="57" rx="16" ry="4" transform="rotate(10 48 57)"/></g></svg>`),
    waves: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 100" preserveAspectRatio="none"><path d="M0 58c68-25 123 21 191-3 68-24 119 17 199-4v49H0z" fill="#c9e5ef" fill-opacity=".75"/><path d="M0 73c67-21 126 18 194-4 69-22 122 15 196-1v32H0z" fill="#8cc3da" fill-opacity=".28"/><path d="M0 56c68-25 123 21 191-3 68-24 119 17 199-4" fill="none" stroke="#6eaac5" stroke-opacity=".42" stroke-width="1.2"/></svg>`),
    coastPaper: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" preserveAspectRatio="none"><path d="M0 192c70-14 117 8 190-4 70-12 126 8 200-5" fill="none" stroke="#6e9eac" stroke-opacity=".28" stroke-width="1.1"/><path d="M0 203c75-9 123 6 194-3 70-9 125 5 196-4" fill="none" stroke="#c2ab83" stroke-opacity=".22" stroke-width=".8"/><g fill="none" stroke="#557f8b" stroke-opacity=".28" stroke-width="1.1" stroke-linecap="round"><path d="M312 36c7-7 14-7 21 0 7-7 14-7 21 0M329 55c5-5 10-5 15 0 5-5 10-5 15 0"/></g></svg>`),
    snowPaper: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" preserveAspectRatio="none"><g fill="none" stroke="#8ca0d5" stroke-opacity=".28" stroke-width=".8"><path d="M330 21v42m-18-31 36 21m-36 0 36-21"/></g><path d="M0 177c70-24 122 17 194-3 68-19 125 16 196-5v51H0z" fill="#fff" fill-opacity=".58"/><path d="M0 192c70-18 122 15 194-2 68-16 125 13 196-4v34H0z" fill="#d9e0f6" fill-opacity=".48"/></svg>`),
    frostPaper: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" preserveAspectRatio="none"><path d="M390 0c-28 21-42 43-52 75m52-49-28 8m12-25-6 27m-14 16-24 5m11-20-4 22" fill="none" stroke="#91a9b9" stroke-opacity=".25" stroke-width="1.2" stroke-linecap="round"/><g fill="none" stroke="#9ab1c1" stroke-opacity=".24" stroke-width=".75"><path d="M54 37v28m-12-21 24 14m-24 0 24-14M315 104v20m-9-15 18 10m-18 0 18-10"/></g><path d="M0 202c68-13 124 8 193-3 67-11 128 7 197-4v25H0z" fill="#dce8ef" fill-opacity=".34"/></svg>`),
    snow: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><g fill="#fff" fill-opacity=".68"><circle cx="21" cy="47" r="1.2"/><circle cx="76" cy="29" r=".8"/><circle cx="132" cy="63" r="1.1"/><circle cx="203" cy="31" r=".8"/><circle cx="261" cy="78" r="1.3"/><circle cx="349" cy="47" r=".9"/><circle cx="44" cy="154" r=".8"/><circle cx="101" cy="128" r="1.1"/><circle cx="178" cy="170" r=".8"/><circle cx="301" cy="148" r="1.1"/><circle cx="365" cy="202" r=".7"/><circle cx="27" cy="338" r="1"/><circle cx="126" cy="310" r=".7"/><circle cx="237" cy="354" r="1.1"/><circle cx="341" cy="315" r=".9"/><circle cx="65" cy="512" r=".8"/><circle cx="167" cy="548" r="1.2"/><circle cx="273" cy="493" r=".8"/><circle cx="362" cy="563" r="1.1"/><circle cx="32" cy="690" r="1.1"/><circle cx="141" cy="735" r=".8"/><circle cx="252" cy="682" r="1.2"/><circle cx="338" cy="752" r=".8"/></g><g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".8"><path d="M337 167v48m-21-36 42 24m-42 0 42-24M91 270v30m-13-22 26 15m-26 0 26-15"/></g></svg>`),
  };
  const skins = {
    celadon: {
      screen: {
        backgroundImage: 'url("assets/themes/generated/celadon-bg.webp")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      },
      poemCard: {
        borderRadius: 18, border: '1px solid rgba(63,118,104,.22)',
        backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.82), rgba(247,247,241,.94))',
        boxShadow: '0 9px 20px rgba(36,79,70,.13)',
      },
      hero: { backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.78), rgba(247,247,241,.94))' },
      panel: {
        borderRadius: 18, border: '1px solid rgba(63,118,104,.20)',
        backgroundImage: `${art.bamboo}, linear-gradient(145deg, rgba(255,255,255,.75), rgba(239,246,241,.90))`,
        backgroundPosition: 'right bottom, center', backgroundSize: '100px auto, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 7px 18px rgba(36,79,70,.09)',
      },
      nav: { borderTop: '1px solid rgba(63,118,104,.18)', background: 'rgba(239,245,241,.94)', boxShadow: '0 -5px 18px rgba(36,79,70,.08)' },
      tabItem: { borderRadius: 22, background: 'rgba(255,255,255,.72)', boxShadow: '0 2px 8px rgba(36,79,70,.10)' },
      tabActive: { color: '#245f51' },
      primary: { background: 'linear-gradient(145deg, #c34d39, #963425)', borderRadius: 27, boxShadow: '0 7px 17px rgba(150,52,37,.28)' },
      preview: { backgroundImage: 'url("assets/themes/generated/celadon-bg.webp")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
    },
    inkPlum: {
      screen: { backgroundImage: 'url("assets/themes/generated/ink-plum-bg.webp")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 8, border: '1px solid rgba(94,72,56,.22)',
        backgroundImage: 'linear-gradient(150deg, rgba(255,255,255,.75), rgba(252,247,237,.94))',
        boxShadow: '0 9px 20px rgba(79,58,43,.12)',
      },
      hero: { backgroundImage: 'linear-gradient(150deg, rgba(255,255,255,.75), rgba(252,247,237,.94))' },
      panel: {
        borderRadius: 8, border: '1px solid rgba(94,72,56,.18)',
        backgroundImage: 'radial-gradient(circle at 18px calc(100% - 18px), #b5342c 0 2px, transparent 2.5px), linear-gradient(150deg, rgba(255,255,255,.70), rgba(251,246,236,.92))',
        boxShadow: '0 6px 16px rgba(79,58,43,.08)',
      },
      nav: { borderTop: '1px solid rgba(45,43,41,.35)', background: 'rgba(250,246,237,.96)' },
      tabItem: { borderRadius: 8 },
      tabActive: { borderBottom: '2px solid #a43a2e' },
      primary: { borderRadius: 8, background: '#b7352d', boxShadow: '0 6px 14px rgba(183,53,45,.24)' },
      preview: { borderRadius: 7, backgroundImage: 'url("assets/themes/generated/ink-plum-bg.webp")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
    },
    mossGarden: {
      screen: { backgroundImage: 'url("assets/themes/generated/moss-garden-bg.webp")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 12, border: '1px solid rgba(54,92,62,.20)',
        backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.74), rgba(243,244,237,.92))',
        boxShadow: '0 9px 21px rgba(42,72,48,.12)',
      },
      hero: { backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.74), rgba(243,244,237,.92))' },
      panel: {
        borderRadius: 15, border: '1px solid rgba(54,92,62,.23)',
        backgroundImage: `${art.fern}, linear-gradient(145deg, rgba(255,255,255,.66), rgba(235,239,229,.90))`,
        backgroundPosition: 'right bottom, center', backgroundSize: '105px auto, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 6px 16px rgba(42,72,48,.09)',
      },
      nav: { borderTop: '1px solid rgba(54,92,62,.25)', background: 'rgba(229,232,222,.96)' },
      tabItem: { borderRadius: 22, background: 'rgba(255,255,255,.55)' },
      tabActive: { color: '#395a3d' },
      primary: { background: 'linear-gradient(145deg, #6f8b55, #395a3d)', borderRadius: 27, boxShadow: '0 7px 17px rgba(57,90,61,.25)' },
      preview: { backgroundImage: 'url("assets/themes/generated/moss-garden-bg.webp")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
    },
    study: {
      screen: { backgroundImage: 'none', backgroundColor: '#d8c5a6' },
      poemCard: {
        borderRadius: 12, border: '1px solid rgba(75,50,29,.13)',
        background: '#f0e4cc', backgroundImage: 'none',
        boxShadow: '0 5px 12px rgba(75,50,29,.06)',
      },
      hero: { background: '#f0e4cc', backgroundImage: 'none' },
      panel: {
        borderRadius: 12, border: '1px solid rgba(75,50,29,.13)',
        background: '#f0e4cc', backgroundImage: 'none',
        boxShadow: '0 5px 12px rgba(75,50,29,.05)',
      },
      nav: { borderTop: '1px solid rgba(75,50,29,.42)', background: 'transparent', boxShadow: 'none' },
      tabItem: { borderRadius: 0, background: 'transparent', boxShadow: 'none' },
      tabActive: { color: '#75451f' },
      primary: { borderRadius: 0, background: 'transparent', boxShadow: 'none' },
      preview: { borderRadius: 12, background: '#f0e4cc', backgroundImage: 'none' },
    },
    dusk: {
      screen: { backgroundImage: 'none', backgroundColor: '#e8e3ed' },
      poemCard: {
        borderRadius: 14, border: '1px solid rgba(66,48,82,.10)',
        background: '#faf7fb', backgroundImage: 'none',
        boxShadow: '0 5px 12px rgba(66,48,82,.05)',
      },
      hero: { background: '#faf7fb', backgroundImage: 'none' },
      panel: {
        borderRadius: 14, border: '1px solid rgba(66,48,82,.10)',
        background: '#faf7fb', backgroundImage: 'none',
        boxShadow: '0 5px 12px rgba(66,48,82,.05)',
      },
      nav: { borderTop: '1px solid rgba(66,48,82,.30)', background: 'transparent', boxShadow: 'none' },
      tabItem: { borderRadius: 0, background: 'transparent', boxShadow: 'none' },
      tabActive: { color: '#655374' },
      primary: { background: 'transparent', borderRadius: 0, boxShadow: 'none' },
      preview: { borderRadius: 14, background: '#faf7fb', backgroundImage: 'none' },
    },
    morningPaper: {
      screen: { backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.64), transparent 48%), linear-gradient(180deg, #fbf8f1, #f8f3e9)' },
      poemCard: {
        borderRadius: 3, border: '1px solid rgba(41,39,35,.46)',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(41,39,35,.022) 0 1px, transparent 1px 5px)',
        boxShadow: 'inset 0 4px 0 -2px #b53e32, inset 0 -4px 0 -2px rgba(41,39,35,.70)',
      },
      hero: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(41,39,35,.035) 0 1px, transparent 1px 5px)', boxShadow: 'inset 0 4px 0 -2px #b53e32, inset 0 -4px 0 -2px rgba(41,39,35,.65)' },
      panel: {
        borderRadius: 2, border: '1px solid rgba(41,39,35,.34)',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(41,39,35,.035) 0 1px, transparent 1px 5px)',
        boxShadow: 'inset 0 4px 0 -2px rgba(181,62,50,.70)',
      },
      nav: { borderTop: '3px double rgba(41,39,35,.62)', background: 'rgba(251,247,238,.98)', paddingLeft: 20, paddingRight: 20 },
      tabItem: { borderRadius: 0, border: '1px solid rgba(41,39,35,.25)', background: 'rgba(255,255,255,.18)' },
      tabActive: { color: '#b53e32', borderBottom: '2px solid #b53e32' },
      primary: { borderRadius: 2, background: '#b53e32', boxShadow: 'none' },
      preview: { borderRadius: 3, backgroundImage: 'repeating-linear-gradient(0deg, rgba(41,39,35,.12) 0 1px, transparent 1px 6px)', boxShadow: 'inset 0 4px 0 -2px #b53e32' },
    },
    seaSalt: {
      screen: { backgroundImage: 'radial-gradient(circle at 88% 7%, rgba(255,250,232,.85), transparent 25%), linear-gradient(180deg, #eef4f2 0%, #f7f5ed 68%, #e4ecea 100%)', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 16, border: '1px solid rgba(80,121,130,.22)',
        backgroundImage: `${art.coastPaper}, linear-gradient(145deg, #fffdf8, #fbfcf8)`,
        backgroundPosition: 'center bottom, center', backgroundSize: '100% 180px, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 8px 20px rgba(70,101,106,.10)',
      },
      hero: { backgroundImage: `${art.coastPaper}, linear-gradient(145deg, #fffdf8, #fbfcf8)`, backgroundPosition: 'center bottom, center', backgroundSize: '100% 180px, auto', backgroundRepeat: 'no-repeat' },
      panel: {
        borderRadius: 14, border: '1px solid rgba(80,121,130,.18)',
        backgroundImage: `${art.coastPaper}, linear-gradient(145deg, #fffdf8, #f5faf8)`,
        backgroundPosition: 'center bottom, center', backgroundSize: '100% 120px, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 5px 14px rgba(70,101,106,.08)',
      },
      nav: { borderTop: '1px solid rgba(80,121,130,.24)', background: '#f7faf7', boxShadow: '0 -4px 14px rgba(70,101,106,.06)' },
      tabItem: { borderRadius: 8, background: 'transparent', boxShadow: 'none' },
      tabActive: { color: '#356f7d', borderBottom: '2px solid #6e9eac' },
      primary: { background: '#477f8d', borderRadius: 10, boxShadow: '0 5px 12px rgba(53,111,125,.20)' },
      preview: { borderRadius: 14, backgroundImage: 'linear-gradient(180deg, #eef4f2, #f7f5ed)', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
    },
    obsidianDawn: {
      screen: { backgroundImage: 'radial-gradient(circle at 88% 5%, rgba(238,196,119,.20), transparent 24%), linear-gradient(180deg, #f8f6f0, #eeeae2)' },
      poemCard: {
        borderRadius: 14, border: '1px solid rgba(41,43,42,.22)',
        backgroundImage: 'radial-gradient(circle at 91% 8%, rgba(232,186,105,.32), transparent 23%), linear-gradient(145deg, #fffefa, #f7f3eb)',
        boxShadow: 'inset 0 1px 0 rgba(185,139,69,.36), 0 7px 18px rgba(41,43,42,.09)',
      },
      hero: { backgroundImage: 'radial-gradient(circle at 91% 8%, rgba(232,186,105,.32), transparent 23%), linear-gradient(145deg, #fffefa, #f7f3eb)' },
      panel: {
        borderRadius: 12, border: '1px solid rgba(41,43,42,.18)',
        backgroundImage: 'radial-gradient(circle at 93% 10%, rgba(232,186,105,.24), transparent 25%), linear-gradient(145deg, #fffefa, #f7f3eb)',
        boxShadow: 'inset 0 1px 0 rgba(185,139,69,.24), 0 5px 14px rgba(41,43,42,.07)',
      },
      nav: { borderTop: '1px solid rgba(41,43,42,.20)', background: 'rgba(246,242,234,.95)', boxShadow: '0 -5px 18px rgba(41,43,42,.07)' },
      tabItem: { borderRadius: 9, border: '1px solid rgba(41,43,42,.20)', background: 'rgba(255,255,255,.42)' },
      tabActive: { color: '#292b2a' },
      primary: { borderRadius: 9, background: '#292b2a', boxShadow: 'inset 0 0 0 1px rgba(240,195,104,.58), 0 7px 17px rgba(41,43,42,.25)' },
      preview: { borderRadius: 10, backgroundImage: 'radial-gradient(circle at 88% 9%, rgba(234,190,112,.26), transparent 25%), linear-gradient(145deg, #fffdf8, #f5f1e8)', boxShadow: 'inset 0 1px 0 rgba(196,143,65,.40)' },
    },
    snowNight: {
      screen: { backgroundImage: `${art.snow}, radial-gradient(circle at 78% 8%, rgba(255,255,255,.96), transparent 21%), linear-gradient(180deg, #dbe8f0 0%, #eff5f7 43%, #f7f8f5 72%, #dfeaf0 100%)`, backgroundPosition: 'center, center', backgroundSize: 'cover, cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 18, border: '1px solid rgba(137,164,180,.28)',
        backgroundColor: '#fbfcfa',
        backgroundImage: `${art.frostPaper}, linear-gradient(155deg, #fff, #f5f8f8)`,
        backgroundPosition: 'center, center', backgroundSize: '100% 100%, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 9px 22px rgba(74,105,122,.11)',
      },
      hero: { backgroundImage: `${art.frostPaper}, linear-gradient(155deg, #fff, #f5f8f8)`, backgroundPosition: 'center, center', backgroundSize: '100% 100%, auto', backgroundRepeat: 'no-repeat' },
      panel: {
        borderRadius: 15, border: '1px solid rgba(137,164,180,.24)', backgroundColor: '#f9fbfa',
        backgroundImage: `${art.frostPaper}, linear-gradient(155deg, #fff, #f2f7f8)`,
        backgroundPosition: 'center, center', backgroundSize: '100% 100%, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 6px 16px rgba(74,105,122,.09)',
      },
      nav: { borderTop: '1px solid rgba(117,148,165,.24)', background: '#f5f8f8', boxShadow: '0 -4px 14px rgba(74,105,122,.07)' },
      tabItem: { borderRadius: 8, border: '1px solid transparent', background: 'transparent', boxShadow: 'none' },
      tabActive: { color: '#496f83', borderBottom: '2px solid #86a6b7' },
      primary: { background: '#668da1', borderRadius: 10, boxShadow: '0 5px 13px rgba(73,111,131,.22)' },
      preview: { borderRadius: 14, backgroundImage: 'linear-gradient(180deg, #dbe8f0, #f7f8f5)', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
    },
  };

  const makeTheme = (base, definition) => {
    const palette = definition.palette || {};
    return {
      ...base,
      ...definition,
      bg: palette.bg || definition.bg || base.bg,
      surface: palette.surface || palette.card || definition.surface || base.surface,
      surfaceSoft: palette.panel || palette.accentSoft || definition.surfaceSoft || base.surfaceSoft,
      text: palette.ink || definition.text || base.text,
      textSoft: palette.muted || definition.textSoft || base.textSoft,
      textMute: palette.muted || definition.textMute || base.textMute,
      line: palette.line || definition.line || base.line,
      accent: palette.accent || definition.accent || base.accent,
      seal: palette.seal || definition.seal || base.seal,
      paper: palette.paper || definition.paper || base.paper,
      palette: { ...(base.palette || {}), ...palette },
    };
  };

  // 青瓷：浅青釉色、象牙纸面、深玉墨色与克制朱砂。
  window.THEMES.celadon = makeTheme(window.THEMES.celadon, {
    key: 'celadon',
    name: '青瓷',
    description: '青瓷釉色，温润如玉',
    fontSerif: fonts.kai,
    fontWriting: fonts.kai,
    fontBody: fonts.body,
    fontCanvas: fonts.kai,
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
    fontSerif: fonts.song,
    fontWriting: fonts.song,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
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
    fontSerif: fonts.kai,
    fontWriting: fonts.kai,
    fontBody: fonts.song,
    fontCanvas: fonts.kai,
    writingSpacing: '0.065em',
    writingLineHeight: 1.95,
    palette: {
      bg: '#e4e6dc',
      paper: '#f4f3ec',
      card: '#f7f5ee',
      surface: '#f7f5ee',
      panel: '#eceee5',
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
      bg: '#f3e7d1',
      paper: '#fff6e5',
      card: '#fff9ed',
      surface: '#fff9ed',
      panel: '#f8ecd8',
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

  // 晨报：清晨报纸的清醒秩序，保留温暖与朝气。
  window.THEMES.morningPaper = makeTheme(window.THEMES.study, {
    key: 'morningPaper',
    name: '晨报',
    description: '晨光拂纸，清明有信',
    fontSerif: fonts.song,
    fontWriting: fonts.song,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.045em',
    writingLineHeight: 1.9,
    palette: {
      bg: '#f0e9dc',
      paper: '#fbf7ee',
      card: '#fcf8ef',
      surface: '#fcf8ef',
      panel: '#f5eee2',
      ink: '#292723',
      muted: '#81796d',
      accent: '#b64a3b',
      accentSoft: '#ead8cb',
      line: '#8f887d',
      border: '#c9c0b2',
      nav: '#f8f2e8',
      seal: '#b53e32',
    },
  });

  // 海盐：明亮海风、开阔留白与清澈海蓝。
  window.THEMES.seaSalt = makeTheme(window.THEMES.celadon, {
    key: 'seaSalt',
    name: '海盐',
    description: '海风轻拂，心境通明',
    fontSerif: fonts.song,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.075em',
    writingLineHeight: 2,
    palette: {
      bg: '#edf3f0',
      paper: '#fffdf8',
      card: '#fffdf8',
      surface: '#fffdf8',
      panel: '#f4f8f5',
      ink: '#355f68',
      muted: '#789097',
      accent: '#477f8d',
      accentSoft: '#dce9e7',
      line: '#b3c8c6',
      border: '#cfdbd7',
      nav: '#f7faf7',
      seal: '#b68a58',
    },
  });

  // 曜石晨光：暖白为主，黑曜只作为小面积坚定点缀。
  window.THEMES.obsidianDawn = makeTheme(window.THEMES.celadon, {
    key: 'obsidianDawn',
    name: '曜石晨光',
    description: '温润如晨，内敛有光',
    fontSerif: fonts.refined,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.refined,
    writingSpacing: '0.07em',
    writingLineHeight: 1.95,
    palette: {
      bg: '#eeeae2',
      paper: '#fbf8f1',
      card: '#fffdf8',
      surface: '#fffdf8',
      panel: '#f4efe6',
      ink: '#292b2a',
      muted: '#7e7c76',
      accent: '#303332',
      accentSoft: '#e2ddd3',
      line: '#b8ad99',
      border: '#d1c8ba',
      nav: '#f8f4ec',
      seal: '#b98b45',
    },
  });

  // 雪夜：月光映雪的明亮安宁，而非沉重深夜。
  window.THEMES.snowNight = makeTheme(window.THEMES.dusk, {
    key: 'snowNight',
    name: '雪夜',
    description: '月色如雪，心静自明',
    fontSerif: fonts.refined,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.refined,
    writingSpacing: '0.095em',
    writingLineHeight: 2.05,
    palette: {
      bg: '#e4edf1',
      paper: '#fbfcfa',
      card: '#fbfcfa',
      surface: '#fbfcfa',
      panel: '#f1f6f7',
      ink: '#496f83',
      muted: '#829ca9',
      accent: '#668da1',
      accentSoft: '#dce8ed',
      line: '#b9cbd3',
      border: '#d3dfe3',
      nav: '#f5f8f8',
      seal: '#86a6b7',
    },
  });

  Object.entries(skins).forEach(([key, themeSkin]) => {
    if (window.THEMES[key]) window.THEMES[key].skin = themeSkin;
  });

  delete window.THEMES.night;
  delete window.THEMES.macaron;
  delete window.THEMES.mandela;
})();
