// data.js — sample diary entries + theme tokens
// Base themes. Additional themes are installed by themes-extra.js.

window.THEMES = {
  celadon: {
    name: '青瓷',
    bg: '#E2EDE5',          // brighter pale mint
    surface: '#EEF6EF',
    surfaceSoft: '#CCDFD2',
    text: '#1F2C24',
    textSoft: '#5A7263',
    textMute: '#90A595',
    line: 'rgba(30,70,45,0.10)',
    accent: '#4D9A76',      // vivid celadon green
    seal: '#D14A3D',        // brighter cinnabar
    paper: '#F4FAF5',
    fontSerif: "'Noto Serif SC', 'Songti SC', serif",
    fontWriting: "'Noto Serif SC', 'Songti SC', serif",
    fontBody: "'Noto Sans SC', 'PingFang SC', sans-serif",
    fontCanvas: "'Noto Serif SC', serif",
    writingSpacing: 0.4,
    writingLineHeight: 2,
  },
  study: {
    name: '旧书房',
    bg: '#D8C5A6',
    surface: '#E7D8BC',
    surfaceSoft: '#C9B18C',
    text: '#34271D',
    textSoft: '#705943',
    textMute: '#9B8162',
    line: 'rgba(75,50,29,0.14)',
    accent: '#98724B',
    seal: '#7E3428',
    paper: '#F0E4CC',
    fontSerif: "'FangSong', 'STFangsong', 'Noto Serif SC', serif",
    fontWriting: "'FangSong', 'STFangsong', 'Noto Serif SC', serif",
    fontBody: "'FangSong', 'STFangsong', 'Noto Serif SC', serif",
    fontCanvas: "'FangSong', 'Noto Serif SC', serif",
    writingSpacing: 0.9,
    writingLineHeight: 2.1,
  },
  dusk: {
    name: '暮云',
    bg: '#E8E3ED',
    surface: '#F2EEF5',
    surfaceSoft: '#D8CFE0',
    text: '#302A38',
    textSoft: '#70647C',
    textMute: '#A79BB1',
    line: 'rgba(66,48,82,0.11)',
    accent: '#8C79A4',
    seal: '#A75D65',
    paper: '#FAF7FB',
    fontSerif: "'LXGW WenKai', 'KaiTi', 'STKaiti', 'Noto Serif SC', serif",
    fontWriting: "'LXGW WenKai', 'KaiTi', 'STKaiti', 'Noto Serif SC', serif",
    fontBody: "'LXGW WenKai', 'Noto Serif SC', serif",
    fontCanvas: "'LXGW WenKai', 'Noto Serif SC', serif",
    writingSpacing: 0.7,
    writingLineHeight: 2.05,
  },
};

// Sample entries. flag = milestone. order newest→oldest.
// inlineNotes — comments anchored on a substring of the body
// tags — collections (电影 / 大学 / 研究生 / ...)
window.ENTRIES = [
  {
    id: 'e0', date: '2026-05-15', weekday: '周五', time: '15:42',
    mood: '☕',
    place: '上海 · 永康路',
    flag: false,
    tags: ['朋友'],
    body: '下午三点的咖啡馆。雨终于停了，光从窗外斜斜地落下来。她迟到了二十分钟，但笑起来还是像高中那年的样子。我们没怎么说话，只是把杯子里的冰块捞出来，一颗一颗，像在偷偷数着什么。',
    photos: ['cafe'],
    poem: {
      title: '旧约',
      form: '七绝',
      lines: ['雨歇斜阳过午迟', '帘前犹是少年时', '冰沉杯底无人语', '笑里偷藏一寸丝'],
    },
    inlineNotes: [
      { id: 'n1', anchor: '高中那年的样子', date: '2026-05-22', text: '其实她那天跟我说她要结婚了。我假装很高兴。' },
      { id: 'n2', anchor: '把杯子里的冰块捞出来', date: '2026-06-01', text: '现在想起来，那时候手在抖。' },
    ],
    notes: [],
  },
  {
    id: 'e1', date: '2026-05-14', weekday: '周四', time: '23:11',
    mood: '🌙',
    place: '上海 · 张江',
    flag: false,
    tags: ['工作'],
    body: '加班到很晚。办公室空空的，只有打印机偶尔嗡嗡两声。窗外的霓虹比白天的太阳还要凶。',
    poem: { title: '夜直', form: '五绝', lines: ['人静机声远', '霓虹烁夜阑', '一楼灯尽处', '独我未归还'] },
    inlineNotes: [],
    notes: [],
  },
  {
    id: 'e2', date: '2026-05-12', weekday: '周二', time: '07:08',
    mood: '🏃',
    place: '上海 · 世纪公园',
    flag: true,
    tags: ['跑步', '里程碑'],
    body: '第一次跑完五公里。最后一百米想哭。回来的路上买了一杯豆浆，从来没觉得豆浆这么甜。',
    photos: ['park'],
    poem: { title: '五里', form: '五绝', lines: ['晓雾破微凉', '归途五里长', '浆生甘一盏', '甜处泪盈眶'] },
    inlineNotes: [
      { id: 'n3', anchor: '最后一百米想哭', date: '2026-05-13', text: '后来才发现是因为憋气憋的。' },
    ],
    notes: [
      { date: '2026-05-13 09:00', text: '今天又跑了一次，舒服多了。' },
      { date: '2026-05-20 07:30', text: '已经坚持一周。' },
    ],
  },
  {
    id: 'e3', date: '2026-05-09', weekday: '周六', time: '21:30',
    mood: '🌿',
    place: '上海 · 家',
    flag: false,
    tags: ['家人'],
    body: '妈妈打来电话，问什么时候回家。说前院的栀子开了。我说五月底吧，其实不知道。',
    poem: { title: '远讯', form: '五绝', lines: ['栀子初开日', '慈亲问几时', '身羁江左客', '心已到南篱'] },
    inlineNotes: [],
    notes: [],
  },
  {
    id: 'e4', date: '2026-05-05', weekday: '周二', time: '18:50',
    mood: '💐',
    place: '上海 · 公司',
    flag: false,
    tags: ['工作'],
    body: '今天发奖金。比想象的多一点。下楼买了一束花，自己也不知道送给谁。',
    poem: { title: '持花', form: '五绝', lines: ['五月薪初厚', '持花过晚桥', '路人皆有寄', '独我立春潮'] },
    inlineNotes: [],
    notes: [],
  },
  {
    id: 'e5', date: '2026-05-01', weekday: '周五', time: '14:20',
    mood: '🌊',
    place: '宁波 · 象山',
    flag: true,
    tags: ['旅行', '里程碑'],
    body: '请了三天假，跟朋友去海边。涨潮的时候坐在礁石上，浪一波一波。有的时候你会觉得，原来时间是被海推着走的。',
    photos: ['sea1', 'sea2'],
    poem: { title: '观潮', form: '五绝', lines: ['潮来千万叠', '礁上久无言', '不是身随浪', '是光被浪迁'] },
    inlineNotes: [
      { id: 'n4', anchor: '时间是被海推着走的', date: '2026-05-08', text: '一周后再看这句，还是觉得是这样。' },
    ],
    notes: [
      { date: '2026-05-02 22:00', text: '走的时候捡了一块贝壳，现在放在书桌上。' },
    ],
  },
  {
    id: 'e6', date: '2026-04-28', weekday: '周一', time: '20:15',
    mood: '📖',
    place: '上海 · 福州路',
    flag: false,
    tags: ['阅读'],
    body: '在旧书店翻到一本九十年代的散文集，扉页上写着"赠林姐，1996"。我把它带回了家。',
    poem: { title: '扉页', form: '五绝', lines: ['书肆灯如豆', '扉头九六春', '异乡人代读', '墨色未离尘'] },
    inlineNotes: [],
    notes: [],
  },
  {
    id: 'e7', date: '2026-04-22', weekday: '周二', time: '03:14',
    mood: '🌫',
    place: '上海 · 家',
    flag: false,
    tags: [],
    body: '又失眠了。两点开始想这几年的事，越想越清醒。窗帘缝里有一线天光，原来已经快天亮了。',
    poem: { title: '不寐', form: '五绝', lines: ['两点心潮起', '回声满枕函', '纱窗微吐白', '天已先成眠'] },
    inlineNotes: [],
    notes: [],
  },
  {
    id: 'e8', date: '2026-04-15', weekday: '周二', time: '22:00',
    mood: '🌳',
    place: '上海 · 武康路',
    flag: false,
    tags: ['朋友'],
    body: '跟老周吵了一架，又和好。走在梧桐底下的时候，他说"我们都是傻子"，我说"是啊"。',
    poem: { title: '暮言', form: '五绝', lines: ['梧桐三月暮', '言尽月生痕', '傻语无人听', '今宵作晚云'] },
    inlineNotes: [],
    notes: [],
  },
  {
    id: 'e9', date: '2026-04-08', weekday: '周二', time: '19:00',
    mood: '🎯',
    place: '上海 · 公司',
    flag: true,
    tags: ['工作', '里程碑'],
    body: '升职面谈通过。走出会议室的时候很平静，反而是回家路上，在地铁里突然鼻子一酸。',
    poem: { title: '拾阶', form: '五绝', lines: ['拾阶经岁久', '登顶始觉寒', '地铁声如铁', '鼻间泛酸澜'] },
    inlineNotes: [],
    notes: [],
  },
];

// Drafts — fragments saved without a complete diary entry yet
window.DRAFTS = [
  {
    id: 'd1', kind: 'photo',
    date: '2026-05-15', time: '12:30',
    place: '上海 · 安福路',
    title: '中午的猫',
    photos: ['cat'],
    body: '',
  },
  {
    id: 'd2', kind: 'title',
    date: '2026-05-15', time: '09:18',
    place: '上海 · 地铁2号线',
    title: '今早地铁里的老人',
    body: '',
  },
];

// 六爻 readings — question + time + hexagram + interpretation
// Hexagram = 6 lines bottom-up. Line: { type: 'yang'|'yin', changing: bool }
window.HEXAGRAMS = [
  {
    id: 'h0', date: '2026-05-14', time: '23:45',
    name: '泽天夬',
    question: '这份工作还要做下去吗？',
    lines: [
      { type: 'yang' }, { type: 'yang' }, { type: 'yang' },
      { type: 'yang' }, { type: 'yang' }, { type: 'yin', changing: true },
    ],
    interp: '决而又决，宜断不宜疑。上爻有动象，旧局将变，但不可急。',
    mood: '焦虑',
  },
  {
    id: 'h1', date: '2026-05-02', time: '07:30',
    name: '天泽履',
    question: '要不要跟妈妈说实话？',
    lines: [
      { type: 'yang' }, { type: 'yang' }, { type: 'yang' },
      { type: 'yin' }, { type: 'yang' }, { type: 'yang' },
    ],
    interp: '履虎尾，不咥人。行险而能避，宜柔不宜刚。',
    mood: '犹豫',
  },
  {
    id: 'h2', date: '2026-04-12', time: '21:00',
    name: '水山蹇',
    question: '这段感情怎么办？',
    lines: [
      { type: 'yin' }, { type: 'yang' }, { type: 'yin' },
      { type: 'yin' }, { type: 'yang' }, { type: 'yin' },
    ],
    interp: '蹇，难也。利西南，不利东北。当止则止，往而无功。',
    mood: '低落',
  },
];

// Tag collections — group icon + sample count
window.TAGS = [
  { name: '工作',     count: 47, icon: '⌬' },
  { name: '朋友',     count: 23, icon: '◐' },
  { name: '家人',     count: 18, icon: '○' },
  { name: '旅行',     count: 12, icon: '◇' },
  { name: '跑步',     count: 31, icon: '▷' },
  { name: '阅读',     count: 19, icon: '▭' },
  { name: '电影',     count: 8,  icon: '▶' },
  { name: '大学',     count: 64, icon: '◬' },
  { name: '研究生',   count: 22, icon: '◭' },
  { name: '里程碑',   count: 9,  icon: '✦' },
];

// Common mood emojis for the picker
window.MOOD_EMOJIS = ['☕','🌙','🏃','🌿','💐','🌊','📖','🌫','🌳','🎯','✨','🌸','😴','🥲','🤍','🌧','🍃','🍷','📷','🎵','💌','🪷','🍂','⛅'];
