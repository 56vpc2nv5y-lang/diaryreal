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
    studyRoom: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><rect width="390" height="844" fill="#eddcb4"/><g fill="none" stroke="#9c7a3c" stroke-opacity=".07" stroke-width=".6"><path d="M0 188Q98 184 195 188T390 186"/><path d="M0 352Q98 348 195 352T390 350"/><path d="M0 520Q98 516 195 520T390 518"/><path d="M0 688Q98 684 195 688T390 686"/></g><g fill="#8c6530" fill-opacity=".13" stroke="none"><rect x="316" y="190" width="26" height="148" rx="3"/><rect x="344" y="214" width="30" height="124" rx="3"/><rect x="316" y="336" width="22" height="6" rx="1.5"/></g><g fill="#7c5828" fill-opacity=".09"><rect x="318" y="210" width="24" height="2" rx="1"/><rect x="318" y="248" width="24" height="2" rx="1"/><rect x="318" y="286" width="24" height="2" rx="1"/><rect x="346" y="228" width="26" height="2" rx="1"/><rect x="346" y="266" width="26" height="2" rx="1"/><rect x="346" y="304" width="26" height="2" rx="1"/></g><circle cx="72" cy="640" r="48" fill="none" stroke="#8c6530" stroke-opacity=".10" stroke-width="1.2"/><circle cx="72" cy="640" r="34" fill="none" stroke="#8c6530" stroke-opacity=".07" stroke-width=".7"/><g fill="#8c6530" fill-opacity=".16" stroke="none"><ellipse cx="55" cy="627" rx="11" ry="3" transform="rotate(-18 55 627)"/><ellipse cx="78" cy="620" rx="9" ry="2.5" transform="rotate(12 78 620)"/><ellipse cx="66" cy="648" rx="12" ry="3" transform="rotate(-8 66 648)"/></g><circle cx="224" cy="138" r="1.4" fill="#8c6530" fill-opacity=".20"/><circle cx="168" cy="562" r="1.1" fill="#8c6530" fill-opacity=".15"/><circle cx="302" cy="724" r="1.6" fill="#8c6530" fill-opacity=".14"/></svg>`),
    magazine: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><rect width="390" height="844" fill="#ede4cc"/><rect x="0" y="0" width="390" height="116" fill="#1a2540" fill-opacity=".90"/><rect x="0" y="116" width="390" height="4" fill="#b04435" fill-opacity=".82"/><rect x="28" y="46" width="224" height="7" rx="2" fill="#fff" fill-opacity=".90"/><rect x="28" y="68" width="148" height="3" rx="1.5" fill="#fff" fill-opacity=".52"/><rect x="28" y="82" width="96" height="2" rx="1" fill="#fff" fill-opacity=".30"/><rect x="308" y="38" width="54" height="54" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1"/><rect x="314" y="44" width="42" height="42" fill="#b04435" fill-opacity=".18"/><line x1="195" y1="136" x2="195" y2="700" stroke="#22201c" stroke-opacity=".09" stroke-width=".8"/><g fill="none" stroke="#22201c" stroke-opacity=".055" stroke-width=".5"><line x1="28" y1="186" x2="183" y2="186"/><line x1="28" y1="242" x2="183" y2="242"/><line x1="28" y1="298" x2="183" y2="298"/><line x1="28" y1="354" x2="183" y2="354"/><line x1="207" y1="186" x2="362" y2="186"/><line x1="207" y1="242" x2="362" y2="242"/><line x1="207" y1="298" x2="362" y2="298"/><line x1="207" y1="354" x2="362" y2="354"/></g><line x1="28" y1="740" x2="362" y2="740" stroke="#b04435" stroke-opacity=".28" stroke-width=".8"/><line x1="28" y1="744" x2="362" y2="744" stroke="#22201c" stroke-opacity=".12" stroke-width=".4"/></svg>`),
    seaFog: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" preserveAspectRatio="none"><rect width="390" height="220" fill="#e9f1ef"/><path d="M0 151c70-18 119 11 190-5 70-15 128 10 200-4v78H0z" fill="#c8ddd9" fill-opacity=".62"/><path d="M0 174c72-13 125 8 195-3 68-11 126 6 195-5v54H0z" fill="#9fbdc0" fill-opacity=".33"/><path d="M0 151c70-18 119 11 190-5 70-15 128 10 200-4M0 174c72-13 125 8 195-3 68-11 126 6 195-5" fill="none" stroke="#547f88" stroke-opacity=".25" stroke-width="1"/><g fill="none" stroke="#6e8f91" stroke-opacity=".28" stroke-linecap="round"><path d="M304 48c8-7 16-7 24 0 8-7 16-7 24 0M322 67c5-5 10-5 15 0 5-5 10-5 15 0"/></g></svg>`),
    waves: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 100" preserveAspectRatio="none"><path d="M0 58c68-25 123 21 191-3 68-24 119 17 199-4v49H0z" fill="#c9e5ef" fill-opacity=".75"/><path d="M0 73c67-21 126 18 194-4 69-22 122 15 196-1v32H0z" fill="#8cc3da" fill-opacity=".28"/><path d="M0 56c68-25 123 21 191-3 68-24 119 17 199-4" fill="none" stroke="#6eaac5" stroke-opacity=".42" stroke-width="1.2"/></svg>`),
    coastPaper: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" preserveAspectRatio="none"><path d="M0 192c70-14 117 8 190-4 70-12 126 8 200-5" fill="none" stroke="#6e9eac" stroke-opacity=".28" stroke-width="1.1"/><path d="M0 203c75-9 123 6 194-3 70-9 125 5 196-4" fill="none" stroke="#c2ab83" stroke-opacity=".22" stroke-width=".8"/><g fill="none" stroke="#557f8b" stroke-opacity=".28" stroke-width="1.1" stroke-linecap="round"><path d="M312 36c7-7 14-7 21 0 7-7 14-7 21 0M329 55c5-5 10-5 15 0 5-5 10-5 15 0"/></g></svg>`),
    snowPaper: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" preserveAspectRatio="none"><rect width="390" height="220" fill="#fbfcff"/><g fill="none" stroke="#8ca0d5" stroke-opacity=".30" stroke-width=".8"><path d="M330 21v42m-18-31 36 21m-36 0 36-21M58 54v30m-13-22 26 15m-26 0 26-15"/></g><g fill="#9fb0e8" fill-opacity=".18"><circle cx="42" cy="34" r="1.1"/><circle cx="118" cy="25" r=".8"/><circle cx="268" cy="52" r="1.2"/><circle cx="354" cy="83" r=".9"/></g><path d="M0 166c70-22 121 12 194-4 67-15 125 14 196-7v65H0z" fill="#fff" fill-opacity=".88"/><path d="M0 188c70-19 122 13 194-4 68-15 125 11 196-5v41H0z" fill="#e2e9fb" fill-opacity=".74"/><path d="M0 174c70-22 121 12 194-4 67-15 125 14 196-7" fill="none" stroke="#b4c3ee" stroke-opacity=".38" stroke-width="1.1"/></svg>`),
    frostPaper: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" preserveAspectRatio="none"><path d="M390 0c-28 21-42 43-52 75m52-49-28 8m12-25-6 27m-14 16-24 5m11-20-4 22" fill="none" stroke="#7891d0" stroke-opacity=".28" stroke-width="1.2" stroke-linecap="round"/><g fill="none" stroke="#91a7ef" stroke-opacity=".30" stroke-width=".75"><path d="M54 37v28m-12-21 24 14m-24 0 24-14M315 104v20m-9-15 18 10m-18 0 18-10M134 88v22m-10-16 20 11m-20 0 20-11"/></g><path d="M0 202c68-13 124 8 193-3 67-11 128 7 197-4v25H0z" fill="#dce8ff" fill-opacity=".46"/></svg>`),
    snow: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><g fill="#fff" fill-opacity=".74"><circle cx="21" cy="47" r="1.2"/><circle cx="76" cy="29" r=".8"/><circle cx="132" cy="63" r="1.1"/><circle cx="203" cy="31" r=".8"/><circle cx="261" cy="78" r="1.3"/><circle cx="349" cy="47" r=".9"/><circle cx="44" cy="154" r=".8"/><circle cx="101" cy="128" r="1.1"/><circle cx="178" cy="170" r=".8"/><circle cx="301" cy="148" r="1.1"/><circle cx="365" cy="202" r=".7"/><circle cx="27" cy="338" r="1"/><circle cx="126" cy="310" r=".7"/><circle cx="237" cy="354" r="1.1"/><circle cx="341" cy="315" r=".9"/><circle cx="65" cy="512" r=".8"/><circle cx="167" cy="548" r="1.2"/><circle cx="273" cy="493" r=".8"/><circle cx="362" cy="563" r="1.1"/><circle cx="32" cy="690" r="1.1"/><circle cx="141" cy="735" r=".8"/><circle cx="252" cy="682" r="1.2"/><circle cx="338" cy="752" r=".8"/></g><g fill="none" stroke="#fff" stroke-opacity=".62" stroke-width=".8"><path d="M337 167v48m-21-36 42 24m-42 0 42-24M91 270v30m-13-22 26 15m-26 0 26-15M308 430v24m-10-18 20 12m-20 0 20-12"/></g><path d="M-20 660c78-42 144 16 213-20 70-36 122 18 217-14v218H-20z" fill="#fff" fill-opacity=".38"/><path d="M-20 714c83-25 139 15 213-10 71-25 128 13 217-9v149H-20z" fill="#eef4ff" fill-opacity=".58"/></svg>`),
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
        borderRadius: 16, border: '1px solid rgba(63,118,104,.22)',
        backgroundImage: `${art.crackle}, linear-gradient(145deg, rgba(255,255,255,.88), rgba(244,250,246,.96))`,
        backgroundPosition: 'center, center', backgroundSize: 'cover, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 9px 20px rgba(36,79,70,.13)',
      },
      hero: {
        backgroundImage: `${art.crackle}, linear-gradient(145deg, rgba(255,255,255,.84), rgba(244,250,246,.96))`,
        backgroundPosition: 'center, center', backgroundSize: 'cover, auto', backgroundRepeat: 'no-repeat',
      },
      panel: {
        borderRadius: 16, border: '1px solid rgba(63,118,104,.20)',
        backgroundImage: `${art.crackle}, ${art.bamboo}, linear-gradient(145deg, rgba(255,255,255,.75), rgba(236,245,240,.92))`,
        backgroundPosition: 'center, right bottom, center', backgroundSize: 'cover, 94px auto, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 7px 18px rgba(36,79,70,.09)',
      },
      nav: { borderTop: '1px solid rgba(63,118,104,.18)', background: 'rgba(237,244,239,.96)', boxShadow: '0 -5px 18px rgba(36,79,70,.08)' },
      tabItem: { borderRadius: 20, background: 'rgba(255,255,255,.68)', boxShadow: '0 2px 8px rgba(36,79,70,.10)' },
      tabActive: { color: '#245f51' },
      primary: { background: 'linear-gradient(145deg, #c34d39, #963425)', borderRadius: 20, boxShadow: '0 7px 17px rgba(150,52,37,.28)' },
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
      screen: { backgroundImage: `${art.studyRoom}, linear-gradient(180deg, #e8d5a8 0%, #f2e4c0 50%, #e0cfa0 100%)`, backgroundPosition: 'center, center', backgroundSize: 'cover, cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 14, border: '1px solid rgba(100,72,36,.16)',
        backgroundImage: 'linear-gradient(150deg, rgba(255,251,238,.90), rgba(242,224,185,.88))',
        boxShadow: '0 10px 24px rgba(92,63,36,.13)',
      },
      hero: { backgroundImage: 'linear-gradient(150deg, rgba(255,251,238,.90), rgba(242,224,185,.88))' },
      panel: {
        borderRadius: 15, border: '1px solid rgba(100,72,36,.14)',
        backgroundImage: `${art.studyRoom}, linear-gradient(150deg, rgba(255,250,234,.80), rgba(238,216,172,.86))`,
        backgroundPosition: 'right bottom, center', backgroundSize: '140px auto, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 7px 18px rgba(92,63,36,.09)',
      },
      nav: { borderTop: '1px solid rgba(100,72,36,.22)', background: 'rgba(240,224,190,.94)', boxShadow: '0 -5px 18px rgba(92,63,36,.07)' },
      tabItem: { borderRadius: 20, background: 'rgba(255,250,234,.52)', boxShadow: '0 2px 8px rgba(92,63,36,.07)' },
      tabActive: { color: '#6b3e18' },
      primary: { borderRadius: 22, background: 'linear-gradient(145deg, #9c5c38, #6b3e18)', boxShadow: '0 7px 16px rgba(107,62,24,.24)' },
      preview: { borderRadius: 14, backgroundImage: `${art.studyRoom}, linear-gradient(180deg, #e8d5a8, #f2e4c0)`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
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
      screen: { backgroundImage: `${art.magazine}, linear-gradient(180deg, #ede4cc, #e5dcc4)`, backgroundPosition: 'center, center', backgroundSize: 'cover, cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 4, border: '1px solid rgba(34,32,28,.30)',
        backgroundImage: 'linear-gradient(180deg, rgba(255,252,244,.96), rgba(245,238,220,.94))',
        boxShadow: 'inset 0 4px 0 -1px #b04435, 0 8px 20px rgba(34,32,28,.09)',
      },
      hero: { backgroundImage: 'linear-gradient(180deg, rgba(255,252,244,.96), rgba(245,238,220,.94))', boxShadow: 'inset 0 4px 0 -1px #b04435' },
      panel: {
        borderRadius: 4, border: '1px solid rgba(34,32,28,.24)',
        backgroundImage: `${art.magazine}, linear-gradient(180deg, rgba(255,252,244,.88), rgba(242,234,214,.90))`,
        backgroundPosition: 'center top, center', backgroundSize: 'cover, auto', backgroundRepeat: 'no-repeat',
        boxShadow: 'inset 0 4px 0 -1px rgba(176,68,53,.60)',
      },
      nav: { borderTop: '2px solid rgba(26,37,64,.88)', background: 'rgba(245,240,228,.98)', paddingLeft: 20, paddingRight: 20 },
      tabItem: { borderRadius: 2, border: '1px solid rgba(26,37,64,.16)', background: 'rgba(255,252,244,.25)' },
      tabActive: { color: '#b53e32', borderBottom: '2px solid #b53e32' },
      primary: { borderRadius: 3, background: '#1a2540', boxShadow: '0 5px 12px rgba(26,37,64,.22)' },
      preview: { borderRadius: 4, backgroundImage: `${art.magazine}, linear-gradient(180deg, #ede4cc, #e5dcc4)`, backgroundPosition: 'center top, center', backgroundSize: 'cover, cover', backgroundRepeat: 'no-repeat', boxShadow: 'inset 0 4px 0 -1px #b04435' },
    },
    seaSalt: {
      screen: { backgroundImage: `${art.seaFog}, radial-gradient(circle at 82% 9%, rgba(244,231,187,.38), transparent 20%), linear-gradient(180deg, #d8e7e5 0%, #edf2ec 56%, #c8dddd 100%)`, backgroundPosition: 'center bottom, center, center', backgroundSize: '100% 210px, auto, cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 22, border: '1px solid rgba(83,128,135,.24)',
        backgroundImage: `${art.seaFog}, linear-gradient(155deg, rgba(250,251,244,.92), rgba(230,239,236,.94))`,
        backgroundPosition: 'center bottom, center', backgroundSize: '100% 126px, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 11px 26px rgba(58,96,104,.12)',
      },
      hero: { backgroundImage: `${art.seaFog}, linear-gradient(155deg, rgba(250,251,244,.92), rgba(230,239,236,.94))`, backgroundPosition: 'center bottom, center', backgroundSize: '100% 126px, auto', backgroundRepeat: 'no-repeat' },
      panel: {
        borderRadius: 18, border: '1px solid rgba(83,128,135,.20)',
        backgroundImage: `${art.seaFog}, linear-gradient(155deg, #f5f6ef, #e4efed)`,
        backgroundPosition: 'center bottom, center', backgroundSize: '100% 94px, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 8px 20px rgba(58,96,104,.09)',
      },
      nav: { borderTop: '1px solid rgba(83,128,135,.18)', background: 'rgba(233,242,240,.96)', boxShadow: '0 -5px 18px rgba(58,96,104,.07)' },
      tabItem: { borderRadius: 20, background: 'rgba(248,250,244,.62)', boxShadow: '0 3px 10px rgba(58,96,104,.08)' },
      tabActive: { color: '#315f69' },
      primary: { background: 'linear-gradient(145deg, #6e9aa0, #315f69)', borderRadius: 26, boxShadow: '0 7px 18px rgba(49,95,105,.20)' },
      preview: { borderRadius: 18, backgroundImage: `${art.seaFog}, linear-gradient(180deg, #d8e7e5, #edf2ec)`, backgroundPosition: 'center bottom, center', backgroundSize: '100% 48%, auto', backgroundRepeat: 'no-repeat' },
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
    description: '书窗旧纸，案头微光',
    fontSerif: fonts.song,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.08em',
    writingLineHeight: 2,
    palette: {
      bg: '#ead9bd',
      paper: '#f3e5ca',
      card: '#fff4df',
      surface: '#fff4df',
      panel: '#eedbbd',
      ink: '#3f2d20',
      muted: '#866d52',
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
    description: '刊头红线，今日新声',
    fontSerif: fonts.song,
    fontWriting: fonts.song,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.045em',
    writingLineHeight: 1.9,
    palette: {
      bg: '#ece1ce',
      paper: '#f3ecdc',
      card: '#f5edde',
      surface: '#f5edde',
      panel: '#eadfcd',
      ink: '#22201c',
      muted: '#746a5b',
      accent: '#b04435',
      accentSoft: '#ead8cb',
      line: '#7d7466',
      border: '#b9ad9b',
      nav: '#f1e7d5',
      seal: '#b04435',
    },
  });

  // 海盐：雾蓝灰海面、低亮度纸色与舒缓留白。
  window.THEMES.seaSalt = makeTheme(window.THEMES.celadon, {
    key: 'seaSalt',
    name: '海盐',
    description: '雾蓝海面，盐白微光',
    fontSerif: fonts.song,
    fontWriting: fonts.writing,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.075em',
    writingLineHeight: 2,
    palette: {
      bg: '#d8e7e5',
      paper: '#f5f6ef',
      card: '#f7f7f0',
      surface: '#f3f5ee',
      panel: '#e4efed',
      ink: '#315f69',
      muted: '#6f8f91',
      accent: '#547f88',
      accentSoft: '#c8ddd9',
      line: '#9bb9b7',
      border: '#bed1cd',
      nav: '#e9f2f0',
      seal: '#b8995d',
    },
  });

  // A single, calm reading voice across the app.
  Object.values(window.THEMES).forEach(theme => {
    theme.fontSerif = fonts.kai;
    theme.fontWriting = fonts.kai;
    theme.fontBody = fonts.kai;
    theme.fontCanvas = fonts.kai;
  });

  Object.entries(skins).forEach(([key, themeSkin]) => {
    if (window.THEMES[key]) window.THEMES[key].skin = themeSkin;
  });

  delete window.THEMES.night;
  delete window.THEMES.macaron;
  delete window.THEMES.mandela;
  delete window.THEMES.obsidianDawn;
  delete window.THEMES.snowNight;
})();
