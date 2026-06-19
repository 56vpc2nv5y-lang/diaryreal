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
    plum: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180"><g fill="none" stroke="#50483f" stroke-linecap="round"><path stroke-width="5" d="M288 149c-65-7-89-31-137-51-41-17-79-11-129-52"/><path stroke-width="2" d="M209 121c-1-43-25-68-52-91M158 100c-25-37-58-45-93-47M117 83c-9-31-29-50-52-63M235 132c-8-24-1-46 10-68"/></g><g fill="#f8efe4" stroke="#9b5b50" stroke-width="1.2"><g transform="translate(157 31)"><circle r="6"/><circle cx="8" cy="4" r="6"/><circle cx="5" cy="12" r="6"/><circle cx="-5" cy="12" r="6"/><circle cx="-8" cy="4" r="6"/></g><g transform="translate(66 53) scale(.8)"><circle r="6"/><circle cx="8" cy="4" r="6"/><circle cx="5" cy="12" r="6"/><circle cx="-5" cy="12" r="6"/><circle cx="-8" cy="4" r="6"/></g><g transform="translate(243 64) scale(.75)"><circle r="6"/><circle cx="8" cy="4" r="6"/><circle cx="5" cy="12" r="6"/><circle cx="-5" cy="12" r="6"/><circle cx="-8" cy="4" r="6"/></g></g><g fill="#a63d32"><circle cx="151" cy="36" r="2"/><circle cx="63" cy="57" r="2"/><circle cx="239" cy="67" r="2"/></g></svg>`),
    bamboo: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 230"><g fill="none" stroke="#557c55" stroke-opacity=".62" stroke-linecap="round"><path stroke-width="3" d="M155 238c-10-73-5-145 16-231M119 238c1-65 15-132 51-199"/><path stroke-width="1.3" d="m159 73-42-30m39 56 34-35m-39 64-48-21m44 48 38-20m-48 57-43-23m38-28-34-38m61-67-29-24"/></g><g fill="#6e936d" fill-opacity=".48"><ellipse cx="117" cy="42" rx="21" ry="5" transform="rotate(27 117 42)"/><ellipse cx="180" cy="61" rx="21" ry="5" transform="rotate(-45 180 61)"/><ellipse cx="105" cy="106" rx="23" ry="5" transform="rotate(17 105 106)"/><ellipse cx="182" cy="134" rx="21" ry="5" transform="rotate(-25 182 134)"/><ellipse cx="94" cy="167" rx="22" ry="5" transform="rotate(27 94 167)"/><ellipse cx="128" cy="14" rx="18" ry="4" transform="rotate(34 128 14)"/></g></svg>`),
    fern: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 150"><g fill="none" stroke="#597a58" stroke-opacity=".62" stroke-linecap="round"><path stroke-width="2" d="M190 145C140 124 98 91 53 18"/><g stroke-width="1.2"><path d="m163 131 2-42m-19 30-35-7m18-5 7-39m-24 25-37-8m21-5 1-36M82 63 47 57m24-9-5-29"/></g></g><g fill="#729170" fill-opacity=".42"><ellipse cx="164" cy="89" rx="19" ry="5" transform="rotate(-78 164 89)"/><ellipse cx="111" cy="112" rx="19" ry="5" transform="rotate(12 111 112)"/><ellipse cx="136" cy="68" rx="18" ry="5" transform="rotate(-75 136 68)"/><ellipse cx="76" cy="84" rx="18" ry="5" transform="rotate(12 76 84)"/><ellipse cx="96" cy="44" rx="17" ry="5" transform="rotate(-84 96 44)"/><ellipse cx="48" cy="57" rx="16" ry="4" transform="rotate(10 48 57)"/></g></svg>`),
    studyRoom: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><rect width="390" height="844" fill="#eddcb4"/><g fill="none" stroke="#9c7a3c" stroke-opacity=".07" stroke-width=".6"><path d="M0 188Q98 184 195 188T390 186"/><path d="M0 352Q98 348 195 352T390 350"/><path d="M0 520Q98 516 195 520T390 518"/><path d="M0 688Q98 684 195 688T390 686"/></g><g fill="#8c6530" fill-opacity=".13" stroke="none"><rect x="316" y="190" width="26" height="148" rx="3"/><rect x="344" y="214" width="30" height="124" rx="3"/><rect x="316" y="336" width="22" height="6" rx="1.5"/></g><g fill="#7c5828" fill-opacity=".09"><rect x="318" y="210" width="24" height="2" rx="1"/><rect x="318" y="248" width="24" height="2" rx="1"/><rect x="318" y="286" width="24" height="2" rx="1"/><rect x="346" y="228" width="26" height="2" rx="1"/><rect x="346" y="266" width="26" height="2" rx="1"/><rect x="346" y="304" width="26" height="2" rx="1"/></g><circle cx="72" cy="640" r="48" fill="none" stroke="#8c6530" stroke-opacity=".10" stroke-width="1.2"/><circle cx="72" cy="640" r="34" fill="none" stroke="#8c6530" stroke-opacity=".07" stroke-width=".7"/><g fill="#8c6530" fill-opacity=".16" stroke="none"><ellipse cx="55" cy="627" rx="11" ry="3" transform="rotate(-18 55 627)"/><ellipse cx="78" cy="620" rx="9" ry="2.5" transform="rotate(12 78 620)"/><ellipse cx="66" cy="648" rx="12" ry="3" transform="rotate(-8 66 648)"/></g><circle cx="224" cy="138" r="1.4" fill="#8c6530" fill-opacity=".20"/><circle cx="168" cy="562" r="1.1" fill="#8c6530" fill-opacity=".15"/><circle cx="302" cy="724" r="1.6" fill="#8c6530" fill-opacity=".14"/></svg>`),
    studyDesk: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><defs><radialGradient id="lamp" cx="25%" cy="16%" r="58%"><stop offset="0" stop-color="#fff4c7" stop-opacity=".62"/><stop offset=".45" stop-color="#e8b96f" stop-opacity=".18"/><stop offset="1" stop-color="#b3844c" stop-opacity="0"/></radialGradient><pattern id="wood" width="90" height="46" patternUnits="userSpaceOnUse"><path d="M0 20c23-8 45 8 90-3M0 38c34-6 53 5 90-6" fill="none" stroke="#6f4b2a" stroke-opacity=".055"/></pattern></defs><rect width="390" height="844" fill="#ecd4a8"/><rect width="390" height="844" fill="url(#wood)"/><rect width="390" height="844" fill="url(#lamp)"/><g fill="none" stroke="#6f4b2a" stroke-opacity=".16" stroke-width="1"><path d="M246 92h92v176h-92zM256 125h72M256 158h72M256 191h72M256 224h72"/><path d="M262 104v152M288 104v152M314 104v152"/></g><g transform="translate(40 575) rotate(-6)" fill="#fff0c8" stroke="#7b5432" stroke-opacity=".24"><path d="M0 38c44-28 88-28 132 0v116c-44-22-88-22-132 0z"/><path d="M132 38c44-28 88-28 132 0v116c-44-22-88-22-132 0z"/><path d="M132 38v116"/></g><g fill="none" stroke="#7b5432" stroke-opacity=".13"><path d="M58 642c32-10 62-10 94 0M188 642c32-10 62-10 94 0M70 682c24-6 46-6 70 0M202 682c24-6 46-6 70 0"/></g><g fill="#6f4b2a" fill-opacity=".12"><circle cx="88" cy="128" r="42"/><rect x="82" y="70" width="12" height="72" rx="6"/><path d="M56 92h64l-12-32H68z"/></g></svg>`),
    studyCard: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" fill="#fff2d2" fill-opacity=".54"/><path d="M26 24h308M26 30h308M26 190h308" stroke="#7b5432" stroke-opacity=".16"/><g fill="none" stroke="#7b5432" stroke-opacity=".10"><path d="M52 62h102M52 88h102M52 114h102M52 140h102M206 62h102M206 88h102M206 114h102M206 140h102"/><path d="M180 42v134"/></g><path d="M40 178c42-16 86-16 132 0M188 178c44-16 88-16 132 0" fill="none" stroke="#8a4a38" stroke-opacity=".12"/></svg>`),
    magazine: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><defs><pattern id="grain" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 8h9M8 0v9" stroke="#2a2823" stroke-opacity=".025" stroke-width=".55"/><circle cx="2" cy="3" r=".45" fill="#2a2823" fill-opacity=".05"/></pattern></defs><rect width="390" height="844" fill="#efe2c7"/><rect width="390" height="844" fill="url(#grain)"/><rect x="23" y="24" width="344" height="790" fill="none" stroke="#2a2823" stroke-opacity=".33" stroke-width="1"/><rect x="30" y="31" width="330" height="776" fill="none" stroke="#b43b30" stroke-opacity=".60" stroke-width="1.15"/><text x="195" y="88" text-anchor="middle" font-family="SimSun,serif" font-size="44" font-weight="700" letter-spacing="10" fill="#b43b30">晨报</text><text x="195" y="116" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="5" fill="#2a2823" fill-opacity=".72">MORNING PAPER</text><path d="M64 135h262M64 140h262" stroke="#2a2823" stroke-opacity=".42" stroke-width=".8"/><text x="82" y="164" font-family="Georgia,serif" font-size="9" letter-spacing="2.8" fill="#2a2823" fill-opacity=".66">VOL. II</text><text x="308" y="164" text-anchor="end" font-family="Georgia,serif" font-size="9" letter-spacing="2.8" fill="#2a2823" fill-opacity=".66">TODAY</text><rect x="61" y="190" width="268" height="292" fill="none" stroke="#2a2823" stroke-opacity=".42"/><path d="M195 190v292M61 247h268M61 304h268M61 361h268M61 418h268" stroke="#2a2823" stroke-opacity=".20"/><g font-family="SimSun,serif" font-size="21" fill="#2a2823" fill-opacity=".72"><text x="101" y="228">民主</text><text x="235" y="228">科学</text><text x="92" y="285">日记</text><text x="235" y="285">新声</text><text x="92" y="342">诗签</text><text x="235" y="342">今日</text><text x="92" y="399">拾句</text><text x="235" y="399">问卦</text><text x="92" y="456">自省</text><text x="235" y="456">前行</text></g><g fill="none" stroke="#b43b30" stroke-opacity=".52" stroke-width="1.2"><circle cx="195" cy="587" r="47"/><path d="M154 587h82M195 540c-14 24-14 70 0 94M195 540c14 24 14 70 0 94M156 570c26 8 52 8 78 0M156 604c26-8 52-8 78 0"/></g><text x="195" y="686" text-anchor="middle" font-family="Georgia,serif" font-size="10" letter-spacing="3.6" fill="#2a2823" fill-opacity=".58">DEMOCRACY · SCIENCE · DIARY</text><path d="M65 724h260M65 731h260M96 758h198" stroke="#2a2823" stroke-opacity=".28"/></svg>`),
    magazineCard: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><rect width="360" height="220" fill="#f4ead3" fill-opacity=".72"/><rect x="12" y="12" width="336" height="196" fill="none" stroke="#2a2823" stroke-opacity=".22"/><path d="M22 34h316M22 38h316" stroke="#b43b30" stroke-opacity=".58"/><text x="180" y="65" text-anchor="middle" font-family="SimSun,serif" font-size="28" font-weight="700" letter-spacing="7" fill="#b43b30" fill-opacity=".86">晨报</text><text x="180" y="86" text-anchor="middle" font-family="Georgia,serif" font-size="8" letter-spacing="4" fill="#2a2823" fill-opacity=".58">MORNING PAPER</text><rect x="66" y="108" width="228" height="58" fill="none" stroke="#2a2823" stroke-opacity=".18"/><path d="M180 108v58M66 137h228" stroke="#2a2823" stroke-opacity=".13"/><path d="M42 186h276M42 192h276" stroke="#2a2823" stroke-opacity=".16"/></svg>`),
    newspaper: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"><defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="#2a2823" stroke-opacity=".045" stroke-width=".7"/><circle cx="6" cy="6" r=".7" fill="#2a2823" fill-opacity=".035"/></pattern><pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="2" r=".45" fill="#2a2823" fill-opacity=".035"/><circle cx="5" cy="5" r=".38" fill="#2a2823" fill-opacity=".025"/></pattern></defs><rect width="390" height="844" fill="#ead8b8"/><rect width="390" height="844" fill="url(#grid)"/><rect width="390" height="844" fill="url(#grain)"/><path d="M0 116h390M0 121h390M0 706h390M0 713h390" stroke="#2a2823" stroke-opacity=".36"/><path d="M0 112h390" stroke="#b43b30" stroke-opacity=".78" stroke-width="3"/><rect x="106" y="22" width="178" height="136" fill="none" stroke="#2a2823" stroke-opacity=".18"/><rect x="116" y="32" width="158" height="116" fill="none" stroke="#b43b30" stroke-opacity=".23"/><text x="195" y="82" text-anchor="middle" font-family="SimSun,serif" font-size="38" font-weight="700" letter-spacing="10" fill="#b43b30" fill-opacity=".18">新青年</text><text x="195" y="105" text-anchor="middle" font-family="Georgia,serif" font-size="9" letter-spacing="4" fill="#2a2823" fill-opacity=".18">LA JEUNESSE</text><g fill="none" stroke="#2a2823" stroke-opacity=".14"><path d="M32 190h326M32 196h326M32 650h326M32 656h326"/><path d="M124 224v386M195 224v386M266 224v386"/><path d="M48 244h58M48 276h58M48 308h58M48 340h58M142 244h36M142 276h36M142 308h36M212 244h36M212 276h36M212 308h36M284 244h58M284 276h58M284 308h58M48 450h294M48 486h294M48 522h294"/></g><text x="66" y="736" font-family="Georgia,serif" font-size="11" letter-spacing="3" fill="#2a2823" fill-opacity=".28">DEMOCRACY</text><text x="324" y="736" text-anchor="end" font-family="Georgia,serif" font-size="11" letter-spacing="3" fill="#2a2823" fill-opacity=".28">SCIENCE</text></svg>`),
    newspaperCard: svgBg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220"><defs><pattern id="grain" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".45" fill="#2a2823" fill-opacity=".04"/></pattern></defs><rect width="360" height="220" fill="#f4e8d0"/><rect width="360" height="220" fill="url(#grain)"/><path d="M20 22h320M20 27h320" stroke="#b43b30" stroke-opacity=".70" stroke-width="1.3"/><path d="M20 50h320M20 184h320M20 190h320" stroke="#2a2823" stroke-opacity=".24"/><text x="180" y="44" text-anchor="middle" font-family="SimSun,serif" font-size="16" font-weight="700" letter-spacing="6" fill="#b43b30" fill-opacity=".42">新青年</text><text x="180" y="62" text-anchor="middle" font-family="Georgia,serif" font-size="6" letter-spacing="3" fill="#2a2823" fill-opacity=".28">LA JEUNESSE</text><g stroke="#2a2823" stroke-opacity=".12" stroke-width=".75"><path d="M118 76v92M240 76v92"/><path d="M30 90h76M30 112h76M30 134h76M30 156h76M130 90h98M130 112h98M130 134h98M130 156h98M252 90h78M252 112h78M252 134h78M252 156h78"/></g></svg>`),
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
        backgroundImage: 'linear-gradient(180deg, rgba(247,251,246,.26), rgba(229,239,232,.34)), url("assets/themes/generated/celadon-bg.webp")',
        backgroundPosition: 'center, center top',
        backgroundSize: 'cover, cover',
        backgroundRepeat: 'no-repeat',
      },
      poemCard: {
        borderRadius: 16, border: '1px solid rgba(63,118,104,.22)',
        backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.86), rgba(244,250,246,.94))',
        backgroundPosition: 'center', backgroundSize: 'auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 9px 20px rgba(36,79,70,.13)',
      },
      hero: {
        backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.82), rgba(244,250,246,.94))',
        backgroundPosition: 'center', backgroundSize: 'auto', backgroundRepeat: 'no-repeat',
      },
      panel: {
        borderRadius: 16, border: '1px solid rgba(63,118,104,.20)',
        backgroundImage: `${art.bamboo}, linear-gradient(145deg, rgba(255,255,255,.75), rgba(236,245,240,.92))`,
        backgroundPosition: 'right bottom, center', backgroundSize: '94px auto, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 7px 18px rgba(36,79,70,.09)',
      },
      nav: { borderTop: '1px solid rgba(63,118,104,.18)', background: 'rgba(237,244,239,.96)', boxShadow: '0 -5px 18px rgba(36,79,70,.08)' },
      tabItem: { borderRadius: 20, background: 'rgba(255,255,255,.68)', boxShadow: '0 2px 8px rgba(36,79,70,.10)' },
      tabActive: { color: '#245f51' },
      primary: { background: 'linear-gradient(145deg, #c34d39, #963425)', borderRadius: 20, boxShadow: '0 7px 17px rgba(150,52,37,.28)' },
      preview: { backgroundImage: 'url("assets/themes/generated/celadon-bg.webp")', backgroundPosition: 'center top', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
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
      screen: { backgroundImage: `${art.studyDesk}, linear-gradient(180deg, #e5c995 0%, #f1dcb3 52%, #d5b279 100%)`, backgroundPosition: 'center, center', backgroundSize: 'cover, cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 14, border: '1px solid rgba(100,72,36,.16)',
        backgroundImage: `${art.studyCard}, linear-gradient(150deg, rgba(255,247,224,.94), rgba(240,215,169,.90))`,
        backgroundPosition: 'center bottom, center',
        backgroundSize: '100% 132px, cover',
        backgroundRepeat: 'no-repeat',
        boxShadow: '0 10px 24px rgba(92,63,36,.13)',
      },
      hero: { backgroundImage: `${art.studyCard}, linear-gradient(150deg, rgba(255,247,224,.94), rgba(240,215,169,.90))`, backgroundPosition: 'center bottom, center', backgroundSize: '100% 132px, cover', backgroundRepeat: 'no-repeat' },
      panel: {
        borderRadius: 15, border: '1px solid rgba(100,72,36,.14)',
        backgroundImage: `${art.studyCard}, linear-gradient(150deg, rgba(255,247,224,.86), rgba(235,207,158,.88))`,
        backgroundPosition: 'center bottom, center', backgroundSize: '100% 110px, auto', backgroundRepeat: 'no-repeat',
        boxShadow: '0 7px 18px rgba(92,63,36,.09)',
      },
      nav: { borderTop: '1px solid rgba(100,72,36,.22)', background: 'rgba(240,224,190,.94)', boxShadow: '0 -5px 18px rgba(92,63,36,.07)' },
      tabItem: { borderRadius: 20, background: 'rgba(255,250,234,.52)', boxShadow: '0 2px 8px rgba(92,63,36,.07)' },
      tabActive: { color: '#6b3e18' },
      primary: { borderRadius: 22, background: 'linear-gradient(145deg, #9c5c38, #6b3e18)', boxShadow: '0 7px 16px rgba(107,62,24,.24)' },
      preview: { borderRadius: 14, backgroundImage: `${art.studyDesk}, linear-gradient(180deg, #e5c995, #f1dcb3)`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' },
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
      screen: { backgroundImage: `${art.newspaper}, linear-gradient(180deg, #ecdcbc, #e2cfab)`, backgroundPosition: 'center top, center', backgroundSize: 'cover, cover', backgroundRepeat: 'no-repeat' },
      poemCard: {
        borderRadius: 2, border: '1px solid rgba(42,40,35,.48)',
        backgroundImage: `${art.newspaperCard}, linear-gradient(180deg, rgba(255,249,236,.97), rgba(242,231,205,.96))`,
        backgroundPosition: 'center top, center',
        backgroundSize: '100% 126px, cover',
        backgroundRepeat: 'no-repeat',
        boxShadow: 'inset 0 5px 0 -2px #b43b30, inset 0 -3px 0 -2px rgba(42,40,35,.62), 0 8px 18px rgba(42,40,35,.10)',
      },
      hero: { backgroundImage: `${art.newspaperCard}, linear-gradient(180deg, rgba(255,249,236,.97), rgba(242,231,205,.96))`, backgroundPosition: 'center top, center', backgroundSize: '100% 150px, cover', backgroundRepeat: 'no-repeat', boxShadow: 'inset 0 5px 0 -2px #b43b30' },
      panel: {
        borderRadius: 2, border: '1px solid rgba(42,40,35,.34)',
        backgroundImage: `${art.newspaperCard}, linear-gradient(180deg, rgba(255,249,236,.92), rgba(238,226,198,.94))`,
        backgroundPosition: 'center top, center', backgroundSize: '100% 118px, auto', backgroundRepeat: 'no-repeat',
        boxShadow: 'inset 0 5px 0 -2px rgba(180,59,48,.66)',
      },
      nav: { borderTop: '2px solid rgba(42,40,35,.78)', background: 'rgba(244,234,211,.98)', paddingLeft: 20, paddingRight: 20 },
      tabItem: { borderRadius: 1, border: '1px solid rgba(42,40,35,.18)', background: 'rgba(255,249,236,.35)' },
      tabActive: { color: '#b43b30', borderBottom: '2px solid #b43b30' },
      primary: { borderRadius: 1, background: '#b43b30', boxShadow: '0 5px 12px rgba(180,59,48,.22)' },
      preview: { borderRadius: 2, backgroundImage: `${art.newspaper}, linear-gradient(180deg, #ecdcbc, #e2cfab)`, backgroundPosition: 'center top, center', backgroundSize: 'cover, cover', backgroundRepeat: 'no-repeat', boxShadow: 'inset 0 5px 0 -2px #b43b30' },
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

  // 晨报：新青年式报纸版面，红色栏线、旧纸纹和分栏排版。
  window.THEMES.morningPaper = makeTheme(window.THEMES.study, {
    key: 'morningPaper',
    name: '晨报',
    description: '新青年式报纸版，今日新声',
    fontSerif: fonts.song,
    fontWriting: fonts.song,
    fontBody: fonts.song,
    fontCanvas: fonts.song,
    writingSpacing: '0.045em',
    writingLineHeight: 1.9,
    palette: {
      bg: '#e8d6b8',
      paper: '#f3e7cf',
      card: '#f6ead4',
      surface: '#f6ead4',
      panel: '#ead8b8',
      ink: '#24221e',
      muted: '#6f6453',
      accent: '#b43b30',
      accentSoft: '#ecd3c9',
      line: '#6f6658',
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
