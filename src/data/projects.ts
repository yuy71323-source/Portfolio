// Placeholder content. Replace `cover` / `images` with imported image URLs, e.g.
//   import poster from '@/assets/works/poster.jpg'
//   cover: poster, images: [img1, img2]
// When an image is missing, a styled placeholder is rendered instead.

import avatar from '@/assets/avatar.jpg'
import brochureCover from '@/assets/works/brochure-cover.png'
import brochure02 from '@/assets/works/brochure-02.png'
import brochure03 from '@/assets/works/brochure-03.png'
import brochure04 from '@/assets/works/brochure-04.png'
import marsVideoPoster from '@/assets/works/packaging-motion/frame1.png'
import marsDaily from '@/assets/works/mars-daily.png'
import marsDisplay from '@/assets/works/mars-display.png'
import marsMain from '@/assets/works/mars-main.png'
import marsScene from '@/assets/works/mars-scene.png'
import kvCover from '@/assets/works/kv-cover.png'
import kvSecond from '@/assets/works/kv-second.png'
import kvCat from '@/assets/works/kv-cat.png'
import posterCover from '@/assets/works/posters/01.webp'
import uiCover from '@/assets/works/ui-cover.png'
import uiFrame2 from '@/assets/works/ui-frame-2.jpg'
import uiFrame4 from '@/assets/works/ui-frame-4.jpg'
import uiFrame3 from '@/assets/works/ui-frame-3.jpg'
import uiFrame15011 from '@/assets/works/ui-frame-15011.jpg'
import webHome from '@/assets/works/web-home.png'
import webContact from '@/assets/works/web-contact.png'
import webKnowledge from '@/assets/works/web-knowledge.png'
import webConsulting from '@/assets/works/web-consulting.png'
import webActivity from '@/assets/works/web-activity.png'
import brandPackagingCover from '@/assets/works/mars-portfolio.png'
import aigcCover from '@/assets/works/aigc-cover.png'
import aigc02 from '@/assets/works/aigc-02.png'
import aigc03 from '@/assets/works/aigc-03.png'
import courseworkCover from '@/assets/works/coursework-cover.png'
import courseworkExtra1 from '@/assets/works/coursework-extra-1.png'
import courseworkExtra2 from '@/assets/works/coursework-extra-2.png'
import courseworkExtra3 from '@/assets/works/coursework-extra-3.png'
import courseworkExtra4 from '@/assets/works/coursework-extra-4.png'
import courseworkExtra5 from '@/assets/works/coursework-extra-5.png'

export type Motif = 'pixels' | 'orbit' | 'stripes' | 'window' | 'blob' | 'type'

export interface Project {
  id: string
  title: string
  titleEn: string
  category: string
  year: string
  role: string
  tools: string[]
  summary: string
  intro: string[]
  palette: [string, string, string]
  motif: Motif
  cover?: string
  images?: string[]
  galleryCount: number
}

const posterImages = Object.entries(import.meta.glob<string>('../assets/works/posters/*.{webp,png}', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

export const projects: Project[] = [
  {
    id: 'spec-brochure',
    cover: brochureCover,
    images: [brochure02, brochure03, brochure04],
    title: '新能源产品规格书画册',
    titleEn: 'New Energy Product Brochure',
    category: '画册设计',
    year: '实际委托',
    role: '版式设计 / 图片处理 / 封面设计',
    tools: ['Ai', 'Ps'],
    summary: '为［雷凌能源科技有限公司］设计的［海外产品规格书］画册，全程由个人完成。',
    intro: [
      '为［雷凌能源科技有限公司］设计一本［海外产品规格书］画册，负责［版式设计、图片处理、封面设计］。',
      '根据画册内容梳理页面信息，运用色彩、字体和图片建立统一的视觉风格，完成画册设计与交付。全程由个人完成。',
    ],
    palette: ['#2c3cb0', '#86ddff', '#ffd93b'],
    motif: 'stripes',
    galleryCount: 5,
  },
  {
    id: 'ui-design',
    cover: uiCover,
    images: [uiCover, uiFrame2, uiFrame4, uiFrame3, uiFrame15011],
    title: 'UI 界面设计',
    titleEn: 'UI Design',
    category: 'UI 设计',
    year: '2025',
    role: '交互与界面设计',
    tools: ['Figma', 'Ae'],
    summary: '睡眠状态和日常情绪常常相互影响，但零散的记录容易让人难以观察自己的变化。本项目围绕睡眠与情绪记录展开，尝试将睡眠数据、情绪记录和日常陪伴整合到同一个界面中，让信息更容易理解和查看。',
    intro: [
      '设计以柔和的紫色为主，结合圆润的图标、角色形象和卡片式布局，营造轻松、温暖的使用氛围。项目涵盖引导、睡眠记录、数据查看和情绪记录等界面，并对图标、组件和页面风格进行了统一设计。',
    ],
    palette: ['#0b1460', '#86ddff', '#e8e4ff'],
    motif: 'window',
    galleryCount: 4,
  },
  {
    id: 'brand-packaging',
    cover: brandPackagingCover,
    images: [marsVideoPoster, marsDaily, marsDisplay, marsMain, marsScene],
    title: '品牌包装设计',
    titleEn: 'Brand & Packaging',
    category: '包装设计',
    year: '2025',
    role: '品牌策略 / 标志设计',
    tools: ['Ai', 'Ps'],
    summary: 'MARS 是一组以宠物零食礼盒为主题的品牌包装设计。项目从宠物与主人之间的陪伴关系出发，希望通过活泼的角色和丰富的色彩，让产品传达轻松、愉快的品牌形象。',
    intro: [
      '设计以不同口味为线索，为系列包装搭配不同的角色与配色，同时保持标志、字体和版式的统一。视觉进一步延伸到礼盒、手提袋及周边应用中，呈现从单品包装到整体礼盒的设计效果。',
    ],
    palette: ['#3a2a9e', '#ff9ec7', '#ffd93b'],
    motif: 'orbit',
    galleryCount: 4,
  },
  {
    id: 'poster',
    cover: posterCover,
    images: posterImages,
    title: '平面海报设计',
    titleEn: 'Poster Design',
    category: '平面设计',
    year: '2026',
    role: '概念 / 动效',
    tools: ['AI'],
    summary: '这组作品围绕日常生活、环保议题和情感关怀等主题展开，尝试用不同的视觉语言表达内容。从轻松活泼的市集主题，到简洁直接的公益表达，每组海报都根据主题选择相应的画面风格。',
    intro: [
      '创作中注重文字、色彩与图像之间的关系，通过版式编排和视觉层级突出主题，让海报在传递信息的同时保留各自的情绪与个性。',
    ],
    palette: ['#1a1f7a', '#c6a8ff', '#7ff0d8'],
    motif: 'blob',
    galleryCount: 5,
  },
  {
    id: 'kv-ai',
    cover: kvCover,
    images: [kvSecond, kvCat],
    title: '主视觉 KV 设计 × AI',
    titleEn: 'Key Visual × AI',
    category: '主视觉设计',
    year: '2026',
    role: '主视觉设计',
    tools: ['AI', 'Figma'],
    summary: '这组主视觉作品结合节日促销和趣味故事场景，探索 AI 辅助下的视觉创作方式。设计围绕“双 11 购物节”和“云朵邮局”等主题，分别塑造热闹的促销氛围与轻快的冒险画面。',
    intro: ['在创作中，通过主题构思、画面生成与视觉整理，协调主体、色彩、文字和装饰元素之间的关系，形成适用于活动宣传的完整主视觉画面。'],
    palette: ['#24318f', '#ffd93b', '#86ddff'],
    motif: 'stripes',
    galleryCount: 4,
  },
  {
    id: 'aigc',
    cover: aigcCover,
    images: [aigc02, aigc03],
    title: 'AIGC 内容设计展示',
    titleEn: 'AIGC Content Design',
    category: 'AIGC',
    year: '2026',
    role: '版式 / IP',
    tools: ['ChatGPT', 'Figma'],
    summary: '“雨芽”是一位以天气为主题的小小探险家。项目从晴天、雨天和云朵等日常元素中寻找灵感，塑造一个充满好奇心、愿意发现生活中小惊喜的角色形象。',
    intro: ['围绕角色设定，作品进一步展示了主题海报、不同场景下的形象以及包装、手提袋和贴纸等应用，尝试运用 AI 辅助创作，探索角色形象与视觉内容的延展方式。'],
    palette: ['#2a1e7c', '#b9a8ff', '#ff9ec7'],
    motif: 'type',
    galleryCount: 4,
  },
  {
    id: 'web-design',
    cover: webHome,
    images: [webContact, webKnowledge, webConsulting, webActivity],
    title: '网页设计',
    titleEn: 'Web Design',
    category: '网页设计',
    year: '2025',
    role: '网页设计',
    tools: ['Axure'],
    summary: '本项目以自然环境保护为主题，通过网页介绍环保知识、相关活动和咨询服务，让不同类型的内容能够以清晰、易浏览的方式呈现。',
    intro: ['整体视觉以绿色和白色为主，结合自然摄影、动物形象与图形装饰，建立贴近自然的页面氛围。设计包含首页、环保知识、环保咨询、活动及联系我们等页面，并通过导航、卡片和按钮组织信息，保持多页面之间的视觉一致性。'],
    palette: ['#202c80', '#a898ff', '#86ddff'],
    motif: 'window',
    galleryCount: 1,
  },
  {
    id: 'coursework',
    cover: courseworkCover,
    images: [courseworkExtra1, courseworkExtra2, courseworkExtra3, courseworkExtra4, courseworkExtra5],
    title: '其余课程作业',
    titleEn: 'Coursework',
    category: '课程作业',
    year: '2026',
    role: '课程作业',
    tools: ['Figma'],
    summary: '课程作业作品',
    intro: [],
    palette: ['#30217b', '#b9a8ff', '#86ddff'],
    motif: 'pixels',
    galleryCount: 1,
  },
]

export const profile = {
  name: '曹沁雨',
  nameEn: 'CAO QINYU',
  title: '视觉传达设计 · 本科在读',
  location: '重庆城市科技学院 · 2027 届',
  bio: [
    // 标题已显示“你好，我是曹沁雨”，正文从第二句开始
    '重庆城市科技学院视觉传达设计专业本科生，预计 2027 年毕业。',
    '在校期间，我学习了 UI 界面设计、网页设计、VI 设计、插画及包装设计等课程，注重运用版式、色彩和细节进行视觉表达。同时，我也尝试将 AI 工具融入创意构思与设计探索中，为设计过程寻找更多可能性。',
  ],
  email: 'hello@yourname.design',
  avatar: avatar as string | undefined,
  socials: [
    { label: '小红书', handle: '@yourname', href: '#' },
    { label: 'Behance', handle: 'behance.net/yourname', href: '#' },
    { label: '站酷', handle: 'zcool.com.cn/u/yourname', href: '#' },
    { label: 'Dribbble', handle: 'dribbble.com/yourname', href: '#' },
  ],
}

export const education = {
  school: '重庆城市科技学院',
  major: '视觉传达设计 · 本科',
  period: '2023.09—2027.06',
  courses: '主修课程：UI 界面设计、网页设计、VI 设计、书籍设计、包装设计等。',
}

export const experience = [
  {
    title: '画册设计',
    tag: '实际委托项目',
    body: '为［雷凌能源科技有限公司］设计一本［海外产品规格书］画册，负责［版式设计、图片处理、封面设计］。根据画册内容梳理页面信息，运用色彩、字体和图片建立统一的视觉风格，完成画册设计与交付。为他人完成画册设计，在项目实践中积累了画册设计经验。',
    note: '全程由个人完成',
  },
]

export const skills = [
  { group: '界面设计', items: ['UI 界面设计', '网页设计', '交互原型'] },
  { group: '品牌与包装', items: ['VI 设计', '包装设计', '书籍设计'] },
  { group: '视觉表达', items: ['版式', '色彩', '插画'] },
  { group: 'AI 辅助创作', items: ['创意构思', '视觉探索', '设计表达'] },
]

export const tools = [
  { name: 'Figma', bg: '#1e1e1e', fg: '#a259ff' },
  { name: 'Ps', bg: '#001e36', fg: '#31a8ff' },
  { name: 'Ai', bg: '#330000', fg: '#ff9a00' },
  { name: 'Ae', bg: '#00005b', fg: '#9999ff' },
  { name: 'Axure', bg: '#0b1a3a', fg: '#ff4f7b' },
  { name: 'ChatGPT', bg: '#0f2a24', fg: '#5ee6b8' },
  { name: 'Codex', bg: '#142a29', fg: '#8ee8ce' },
  { name: '即梦', bg: '#1b1446', fg: '#86ddff' },
  { name: 'Lovart', bg: '#2a1036', fg: '#ff9ec7' },
]
