import mongoose from "mongoose";
import { randomUUID } from "crypto";

const MONGODB_URI = process.env.MONGODB_URI?.trim() || "";
// Safe default: this project uses built-in seed data unless MongoDB is explicitly enabled.
// To use MongoDB, set DATABASE_MODE=mongodb and provide a valid MONGODB_URI.
const DATABASE_MODE = (process.env.DATABASE_MODE || "seed").trim().toLowerCase();
const HAS_MONGO_URL = DATABASE_MODE === "mongodb" && Boolean(MONGODB_URI);
function isMongoEnabled() {
  return HAS_MONGO_URL && !globalThis.__magazineMongoDisabled;
}

const now = () => new Date();
const id = () => randomUUID();

function textBlock(text) {
  return { type: "paragraph", content: [{ type: "text", text, styles: {} }] };
}

function articleHtml(title, body, categoryName) {
  return `
    <h2>${title}</h2>
    <p>${body}</p>
    <p>This seed article is included so the magazine has enough real-looking content before you connect MongoDB. You can edit, delete, or replace it from the dashboard after login.</p>
    <h3>Why it matters</h3>
    <p>${categoryName} stories help readers quickly understand what is changing, what matters now, and what to watch next.</p>
  `;
}

const models = HAS_MONGO_URL
  ? globalThis.__magazineMongoModels || (() => {
      const baseSchema = new mongoose.Schema({}, { strict: false, timestamps: false, versionKey: false });
      const get = (name, collection) => mongoose.models[name] || mongoose.model(name, baseSchema, collection);
      const value = {
        user: get("MagazineUser", "users"),
        category: get("MagazineCategory", "categories"),
        tag: get("MagazineTag", "tags"),
        article: get("MagazineArticle", "articles"),
        comment: get("MagazineComment", "comments"),
        bookmark: get("MagazineBookmark", "bookmarks"),
        session: get("MagazineSession", "sessions"),
        media: get("MagazineMedia", "media"),
        siteSettings: get("MagazineSiteSettings", "siteSettings"),
      };
      globalThis.__magazineMongoModels = value;
      return value;
    })()
  : {};

function seedData() {
  const adminId = id();
  const writerId = id();
  const readerId = id();
  const categories = [
    ["Politics", "politics", "Power, policy and the state."],
    ["Technology", "technology", "Startups, science and the digital shift."],
    ["Culture", "culture", "Art, music, film and identity."],
    ["Business", "business", "Markets, enterprise and the economy."],
    ["Sports", "sports", "Cricket, football and beyond."],
    ["Opinion", "opinion", "Analysis, essays and arguments."],
  ].map(([name, slug, description]) => ({ id: id(), name, slug, description, createdAt: now(), updatedAt: now() }));

  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const postIdeas = {
    politics: [
      ["Inside the New Conversation About Local Government", "local-government-conversation", "City services, local accountability and digital systems are becoming central to how voters judge public leadership.", ["Politics", "Local Government", "Policy"]],
      ["What Young Voters Want From Public Leaders", "young-voters-public-leaders", "A new generation is asking for jobs, fairness, climate action and clearer communication from every level of government.", ["Youth", "Election", "Civic"]],
      ["The Policy Debate Around Safer Cities", "policy-debate-safer-cities", "Urban safety now includes transport design, lighting, emergency response and stronger community trust.", ["Cities", "Safety", "Policy"]],
      ["How Digital Services Are Changing Government Access", "digital-services-government-access", "From online forms to mobile-first portals, public services are moving closer to everyday citizens.", ["Digital", "Government", "Services"]],
      ["Why Transparency Still Defines Political Trust", "transparency-political-trust", "Open data, clear budgets and regular communication remain essential for rebuilding confidence in institutions.", ["Transparency", "Trust", "Governance"]],
      ["The Rise of Climate Policy in Everyday Politics", "climate-policy-everyday-politics", "Flooding, heat and energy costs are bringing environmental policy into ordinary household decisions.", ["Climate", "Policy", "Environment"]],
      ["A Practical Guide to Understanding Public Budgets", "understanding-public-budgets", "Budgets reveal priorities more clearly than slogans, showing what leaders plan to protect, reduce or expand.", ["Budget", "Policy", "Explainer"]],
      ["Why Civic Education Needs a Modern Refresh", "civic-education-modern-refresh", "Media literacy, rights, responsibilities and local participation should be easier for young people to learn.", ["Education", "Civic", "Youth"]],
      ["The New Role of Mayors in Growing Cities", "new-role-of-mayors-growing-cities", "Mayors are increasingly expected to solve transport, housing, waste and digital service problems at the same time.", ["Cities", "Leadership", "Urban"]],
      ["How Public Communication Can Reduce Confusion", "public-communication-reduce-confusion", "Clear, timely and human communication can make policies easier to understand and follow.", ["Communication", "Government", "Public"]],
      ["The Case for Better Citizen Feedback Systems", "better-citizen-feedback-systems", "When complaints and suggestions are tracked properly, government can respond faster and more fairly.", ["Feedback", "Services", "Governance"]],
      ["What Policy Reform Looks Like Beyond Headlines", "policy-reform-beyond-headlines", "Real reform often depends on boring but important improvements in process, staffing and accountability.", ["Reform", "Analysis", "Policy"]],
    ],
    technology: [
      ["Dhaka's Startup Boom: Inside the City's New Tech Corridor", "dhaka-startup-boom", "From Banani to Bashundhara, a generation of founders is rewriting what a Bangladeshi tech company can be.", ["Startups", "Dhaka", "Innovation"]],
      ["How AI Tools Are Changing Small Business Workflows", "ai-tools-small-business-workflows", "Small teams are using AI to write, design, support customers and automate repetitive daily work.", ["AI", "Business", "Automation"]],
      ["The Quiet Growth of Local SaaS Products", "local-saas-products-growth", "Subscription software built for local needs is becoming a serious opportunity for technical founders.", ["SaaS", "Startups", "Software"]],
      ["Why Cybersecurity Is Now a Family Issue", "cybersecurity-family-issue", "Passwords, scams and device safety are no longer only office concerns; they affect every connected household.", ["Cybersecurity", "Safety", "Digital"]],
      ["Inside the Creator Economy Tech Stack", "creator-economy-tech-stack", "Creators now rely on payments, newsletters, analytics, design tools and community platforms to grow sustainably.", ["Creators", "Tools", "Platforms"]],
      ["What Makes a Good Government Tech Platform", "good-government-tech-platform", "Reliable identity, simple forms and accessible design can make public services easier for millions.", ["GovTech", "UX", "Services"]],
      ["The Return of Hardware Startups", "hardware-startups-return", "Affordable sensors, 3D printing and local manufacturing are giving hardware founders a new opening.", ["Hardware", "Startups", "Manufacturing"]],
      ["How Remote Teams Stay Productive Across Time Zones", "remote-teams-time-zones", "Documentation, async updates and clear ownership are becoming the backbone of global teams.", ["Remote Work", "Teams", "Productivity"]],
      ["Why Product Design Matters More Than Ever", "product-design-matters-more", "Users have more options than before, so clarity and speed now decide whether products survive.", ["Design", "UX", "Product"]],
      ["The Next Wave of Fintech for Everyday Users", "next-wave-fintech-everyday-users", "Financial apps are moving toward simpler savings, faster payments and safer access for first-time users.", ["Fintech", "Payments", "Apps"]],
      ["Open Source Tools Every Developer Should Know", "open-source-tools-developers-know", "Modern development depends on frameworks, libraries and communities that make building faster.", ["Open Source", "Developers", "Tools"]],
      ["Why Data Skills Are Becoming Career Basics", "data-skills-career-basics", "Spreadsheets, dashboards and basic analysis are now useful across marketing, operations, finance and media.", ["Data", "Careers", "Skills"]],
    ],
    culture: [
      ["The Quiet Revolution in Bangladeshi Cinema", "bangladeshi-cinema-revolution", "A new wave of indie filmmakers is challenging decades of formula and finding audiences both at home and abroad.", ["Film", "Culture", "Cinema"]],
      ["Why Independent Music Scenes Keep Growing", "independent-music-scenes-growing", "Bedroom studios, streaming platforms and small venues are giving new artists a direct route to listeners.", ["Music", "Artists", "Streaming"]],
      ["The New Language of Urban Fashion", "new-language-urban-fashion", "Streetwear, thrift culture and local labels are changing how young people express identity.", ["Fashion", "Identity", "Urban"]],
      ["How Food Content Became Cultural Memory", "food-content-cultural-memory", "Recipes, restaurant videos and family cooking stories are preserving culture in a new digital format.", ["Food", "Memory", "Digital"]],
      ["The Rise of Small Book Communities", "small-book-communities-rise", "Readers are gathering online and offline to discuss books, translation, ideas and personal growth.", ["Books", "Community", "Reading"]],
      ["Why Public Art Changes How Cities Feel", "public-art-cities-feel", "Murals, installations and small design details can make neighborhoods feel more human and memorable.", ["Art", "Cities", "Design"]],
      ["The Digital Archive of Everyday Life", "digital-archive-everyday-life", "Photos, posts and voice notes are becoming the informal archive of how people live now.", ["Archive", "Digital", "Society"]],
      ["How Festivals Are Adapting for Younger Audiences", "festivals-younger-audiences", "Organizers are mixing tradition with digital promotion, better design and more inclusive experiences.", ["Festivals", "Youth", "Tradition"]],
      ["The Changing Meaning of Home", "changing-meaning-of-home", "Migration, remote work and rising costs are reshaping how people think about belonging and stability.", ["Home", "Society", "Identity"]],
      ["Why Comedy Travels Faster Online", "comedy-travels-faster-online", "Short videos and memes let jokes cross regions quickly, but context still shapes what feels funny.", ["Comedy", "Internet", "Media"]],
      ["The Local Designers Building Global Taste", "local-designers-global-taste", "A new generation of designers is blending local craft with international visual language.", ["Design", "Craft", "Global"]],
      ["How Culture Pages Can Serve Serious Journalism", "culture-pages-serious-journalism", "Arts coverage can reveal power, economy, identity and social change as clearly as hard news.", ["Journalism", "Culture", "Analysis"]],
    ],
    business: [
      ["The Garment Industry's Green Factory Movement", "green-garment-factories", "Bangladesh now leads the world in green garment factories. We look at what that means in practice.", ["Garments", "Sustainability", "Business"]],
      ["How Small Exporters Build Trust With Buyers", "small-exporters-build-trust", "Quality control, clear communication and reliable timelines are helping smaller exporters compete internationally.", ["Export", "Trust", "Trade"]],
      ["The New Playbook for Local Retail Brands", "local-retail-brands-playbook", "Retailers are combining social content, better packaging and online checkout to grow beyond one location.", ["Retail", "Brands", "Commerce"]],
      ["Why Cash Flow Still Beats Big Revenue Numbers", "cash-flow-beats-revenue", "Healthy cash flow gives companies the breathing room to survive delays, discounts and sudden costs.", ["Finance", "Cash Flow", "Business"]],
      ["Inside the Rise of Service-Based Startups", "service-based-startups-rise", "Agencies, consulting firms and niche operators are becoming important engines for young entrepreneurs.", ["Services", "Startups", "Entrepreneurship"]],
      ["The Logistics Challenge Behind Fast Commerce", "logistics-challenge-fast-commerce", "Delivery speed depends on warehouses, routing, inventory accuracy and customer communication.", ["Logistics", "Commerce", "Operations"]],
      ["Why Brand Trust Is Built After the Sale", "brand-trust-after-sale", "Returns, support and follow-up service often determine whether a customer comes back.", ["Brand", "Customer", "Trust"]],
      ["How Family Businesses Prepare for the Next Generation", "family-business-next-generation", "Succession planning, digital systems and clearer roles can help family companies stay competitive.", ["Family Business", "Leadership", "Growth"]],
      ["The Practical Value of Better Business Data", "better-business-data-value", "Simple dashboards can help owners see profit, stock, customer trends and operational problems earlier.", ["Data", "Operations", "SME"]],
      ["Why Pricing Strategy Is Harder Than It Looks", "pricing-strategy-harder", "Good pricing balances cost, value, competition, confidence and the story a brand wants to tell.", ["Pricing", "Strategy", "Sales"]],
      ["What Makes a Marketplace Work", "what-makes-marketplace-work", "Marketplaces need trust, liquidity, quality control and strong incentives on both sides.", ["Marketplace", "Platforms", "Growth"]],
      ["The New Respect for Boring Businesses", "respect-for-boring-businesses", "Laundry, logistics, repair and maintenance companies can be attractive when operations are excellent.", ["SME", "Operations", "Investment"]],
    ],
    sports: [
      ["Why Bangladesh's Cricket Fast-Bowling Assembly Line Finally Works", "cricket-fast-bowling", "After decades of spin dependence, a generation of genuine quicks is changing how Bangladesh plays cricket.", ["Cricket", "Sports", "Bowling"]],
      ["The Fitness Habits Behind Modern Athletes", "fitness-habits-modern-athletes", "Training now includes sleep, nutrition, recovery, mobility and data-driven workload management.", ["Fitness", "Athletes", "Training"]],
      ["How Women's Sport Is Building Bigger Audiences", "womens-sport-bigger-audiences", "Better coverage, school participation and role models are helping women's sport reach more fans.", ["Women", "Sport", "Audience"]],
      ["The Local Football Academies Changing Youth Sport", "football-academies-youth-sport", "Structured coaching and competition pathways are giving young footballers clearer development routes.", ["Football", "Youth", "Academy"]],
      ["Why Sports Analytics Is No Longer Optional", "sports-analytics-no-longer-optional", "Teams use data to plan selections, manage risk and understand performance in finer detail.", ["Analytics", "Teams", "Performance"]],
      ["The Business of Match-Day Experience", "business-match-day-experience", "Food, seating, ticketing, security and digital content all shape how fans remember a game.", ["Fans", "Business", "Stadium"]],
      ["How School Sports Can Improve Public Health", "school-sports-public-health", "Regular participation builds fitness, confidence, teamwork and healthier long-term habits.", ["School", "Health", "Youth"]],
      ["The Comeback of Traditional Games", "traditional-games-comeback", "Local games are finding new life through festivals, schools and social media storytelling.", ["Tradition", "Games", "Culture"]],
      ["Why Mental Strength Is Part of Elite Performance", "mental-strength-elite-performance", "Pressure, focus and recovery are as important as physical talent at the highest level.", ["Mental", "Performance", "Elite"]],
      ["The Coaching Lessons Every Team Can Use", "coaching-lessons-every-team", "Clear roles, honest feedback and shared standards matter in sport, business and community work.", ["Coaching", "Leadership", "Teams"]],
      ["How Fans Shape the Future of Sports Media", "fans-future-sports-media", "Highlights, podcasts and creator commentary are changing how supporters follow teams.", ["Fans", "Media", "Creators"]],
      ["The Long Road From Talent to Professional Sport", "talent-to-professional-sport", "Talent helps, but coaching, family support, facilities and discipline decide who reaches the next level.", ["Talent", "Development", "Professional"]],
    ],
    opinion: [
      ["Opinion: The Internet Is Now Our Main Public Square", "internet-public-square", "What Bangladesh needs from digital platforms, civic rules and online literacy.", ["Opinion", "Internet", "Society"]],
      ["Opinion: We Need Better Digital Manners", "better-digital-manners", "Online debate would improve if more people treated disagreement as a conversation, not a performance.", ["Opinion", "Digital", "Debate"]],
      ["Opinion: Cities Should Be Designed for People First", "cities-designed-for-people-first", "Roads, parks, footpaths and public transport should begin with the daily needs of residents.", ["Opinion", "Cities", "Design"]],
      ["Opinion: Education Must Teach Adaptability", "education-teach-adaptability", "Fast-changing work requires curiosity, communication and the ability to learn new tools quickly.", ["Opinion", "Education", "Skills"]],
      ["Opinion: Small Businesses Deserve Better Systems", "small-businesses-better-systems", "Simple digital services, fair finance and practical training could unlock huge local productivity.", ["Opinion", "SME", "Systems"]],
      ["Opinion: Newsrooms Should Explain More", "newsrooms-should-explain-more", "Readers need context, timelines and plain language alongside breaking updates.", ["Opinion", "Journalism", "Explainer"]],
      ["Opinion: Public Trust Starts With Listening", "public-trust-starts-listening", "Institutions become stronger when feedback is welcomed instead of treated as an attack.", ["Opinion", "Trust", "Public"]],
      ["Opinion: Creativity Is Economic Infrastructure", "creativity-economic-infrastructure", "Design, film, music and storytelling can create jobs, exports and a stronger national image.", ["Opinion", "Creative", "Economy"]],
      ["Opinion: Technology Should Feel Less Complicated", "technology-less-complicated", "The best digital products remove confusion and respect the user's time.", ["Opinion", "Technology", "UX"]],
      ["Opinion: Every City Needs Quiet Spaces", "cities-need-quiet-spaces", "Parks, libraries and walkable streets provide relief in increasingly noisy urban life.", ["Opinion", "Urban", "Wellbeing"]],
      ["Opinion: Sports Can Teach Better Leadership", "sports-teach-leadership", "Teams show how discipline, accountability and trust can turn individual talent into collective results.", ["Opinion", "Sports", "Leadership"]],
      ["Opinion: The Future Belongs to Useful Media", "future-useful-media", "Audiences will reward media that helps them decide, learn, compare and understand with less noise.", ["Opinion", "Media", "Future"]],
    ],
  };

  const articles = Object.entries(postIdeas).flatMap(([categorySlug, ideas], catIndex) => {
    const category = categoryMap[categorySlug];
    return ideas.map(([title, slug, excerpt, tags], idx) => {
      const created = new Date(Date.now() - (catIndex * 12 + idx + 1) * 86400000);
      const featured = idx === 0 && ["technology", "culture"].includes(categorySlug);
      const views = 4500 - catIndex * 350 - idx * 73;
      return {
        id: id(),
        title,
        slug,
        excerpt,
        contentJson: JSON.stringify([textBlock(excerpt)]),
        contentHtml: articleHtml(title, excerpt, category.name),
        thumbnail: `https://picsum.photos/seed/${slug}/1200/700`,
        seoTitle: null,
        seoDescription: null,
        ogImage: `https://picsum.photos/seed/${slug}/1200/700`,
        status: "PUBLISHED",
        featured,
        views,
        tags: JSON.stringify(tags),
        authorId: writerId,
        authorName: "Nadia Rahman",
        categoryId: category.id,
        publishedAt: created,
        createdAt: created,
        updatedAt: created,
      };
    });
  });

  return {
    users: [
      { id: adminId, email: "admin@example.com", name: "Editor in Chief", password: "plain:12345678", role: "ADMIN", image: null, bio: "Editor-in-chief at Bangladeshist Magazine.", googleId: null, createdAt: now(), updatedAt: now() },
      { id: writerId, email: "writer@example.com", name: "Nadia Rahman", password: "plain:12345678", role: "WRITER", image: null, bio: "Staff writer covering technology and culture.", googleId: null, createdAt: now(), updatedAt: now() },
      { id: readerId, email: "reader@example.com", name: "Demo Reader", password: null, role: "READER", image: "https://picsum.photos/seed/readeravatar/200/200", bio: null, googleId: "demo-reader-001", createdAt: now(), updatedAt: now() },
    ],
    categories,
    articles,
    tags: [],
    comments: [],
    bookmarks: [],
    sessions: [],
    media: [],
    siteSettings: [],
  };
}

function memoryStore() {
  if (!globalThis.__magazineMemoryDb) globalThis.__magazineMemoryDb = seedData();
  return globalThis.__magazineMemoryDb;
}

async function seedIfEmpty() {
  if (!isMongoEnabled()) return;
  const count = await models.user.countDocuments({});
  if (count > 0) return;
  const seed = seedData();
  await Promise.all([
    models.user.insertMany(seed.users),
    models.category.insertMany(seed.categories),
    models.article.insertMany(seed.articles),
  ]);
}

async function connectMongo() {
  if (!isMongoEnabled()) {
    memoryStore();
    return null;
  }
  if (globalThis.__magazineMongoConnection) return globalThis.__magazineMongoConnection;
  globalThis.__magazineMongoConnection = mongoose
    .connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 3000 })
    .then(async () => {
      await seedIfEmpty();
      return mongoose;
    })
    .catch((error) => {
      console.warn("[database] MongoDB connection failed. Falling back to seed data.", error?.message || error);
      globalThis.__magazineMongoDisabled = true;
      globalThis.__magazineMongoConnection = null;
      memoryStore();
      return null;
    });
  return globalThis.__magazineMongoConnection;
}

function collectionName(model) {
  const names = {
    user: "users",
    category: "categories",
    tag: "tags",
    article: "articles",
    comment: "comments",
    bookmark: "bookmarks",
    session: "sessions",
    media: "media",
    siteSettings: "siteSettings",
  };
  return names[model];
}

function toPlain(doc) {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  delete obj._id;
  return obj;
}

function cmpVal(val, cond) {
  if (cond && typeof cond === "object" && !Array.isArray(cond) && !(cond instanceof Date)) {
    if ("in" in cond) return cond.in.includes(val);
    if ("not" in cond) return val !== cond.not;
    if ("notIn" in cond) return !cond.notIn.includes(val);
    if ("increment" in cond) return true;
  }
  return val === cond;
}

async function getById(model, idValue) {
  await connectMongo();
  if (isMongoEnabled()) return toPlain(await models[model].findOne({ id: idValue }));
  return memoryStore()[collectionName(model)].find((row) => row.id === idValue) || null;
}

async function match(model, item, where = {}) {
  if (!where || Object.keys(where).length === 0) return true;
  for (const [key, cond] of Object.entries(where)) {
    if (key === "OR") {
      const results = await Promise.all(cond.map((w) => match(model, item, w)));
      if (!results.some(Boolean)) return false;
      continue;
    }
    if (key === "AND") {
      const results = await Promise.all(cond.map((w) => match(model, item, w)));
      if (!results.every(Boolean)) return false;
      continue;
    }
    if (key === "userId_articleId") {
      if (item.userId !== cond.userId || item.articleId !== cond.articleId) return false;
      continue;
    }
    if (key === "category" && cond?.slug) {
      const category = await getById("category", item.categoryId);
      if (!category || category.slug !== cond.slug) return false;
      continue;
    }
    if (!cmpVal(item[key], cond)) return false;
  }
  return true;
}

function sortRows(rows, orderBy) {
  if (!orderBy) return rows;
  const [[field, dir]] = Object.entries(orderBy);
  return [...rows].sort((a, b) => {
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    if (av < bv) return dir === "desc" ? 1 : -1;
    if (av > bv) return dir === "desc" ? -1 : 1;
    return 0;
  });
}

async function countRelations(model, obj, select) {
  await connectMongo();
  const out = {};
  if (select.articles) {
    if (isMongoEnabled()) {
      out.articles = model === "user"
        ? await models.article.countDocuments({ authorId: obj.id })
        : await models.article.countDocuments({ categoryId: obj.id });
    } else {
      const rows = memoryStore().articles;
      out.articles = rows.filter((a) => model === "user" ? a.authorId === obj.id : a.categoryId === obj.id).length;
    }
  }
  return out;
}

async function applySelect(obj, select, model) {
  if (!obj) return obj;
  if (!select) return obj;
  const out = {};
  for (const [key, val] of Object.entries(select)) {
    if (key === "_count") {
      out._count = await countRelations(model, obj, val.select || {});
      continue;
    }
    if (val === true) out[key] = obj[key];
  }
  return out;
}

async function includeRelations(model, obj, include) {
  if (!obj || !include) return obj;
  await connectMongo();
  const out = { ...obj };
  if (include.category && model === "article") {
    out.category = await getById("category", obj.categoryId);
  }
  if (include.author && model === "article") {
    const user = await getById("user", obj.authorId);
    out.author = include.author.select ? await applySelect(user || {}, include.author.select, "user") : user;
  }
  if (include.user && model === "session") {
    out.user = await getById("user", obj.userId);
  }
  if (include.article && model === "bookmark") {
    let article = await getById("article", obj.articleId);
    if (article && include.article.include) article = await includeRelations("article", article, include.article.include);
    out.article = article;
  }
  if (include.article && model === "comment") {
    let article = await getById("article", obj.articleId);
    if (article && include.article.select) article = await applySelect(article, include.article.select, "article");
    out.article = article;
  }
  if (include._count) out._count = await countRelations(model, obj, include._count.select || {});
  return out;
}

function normalizeData(model, data) {
  const base = { id: id(), createdAt: now(), ...data, updatedAt: now() };
  if (model === "article") {
    base.views ??= 0;
    base.featured ??= false;
    base.status ??= "DRAFT";
  }
  if (model === "comment") base.status ??= "PENDING";
  return base;
}

function applyData(item, data) {
  const out = { ...item };
  for (const [key, val] of Object.entries(data || {})) {
    if (val && typeof val === "object" && "increment" in val) out[key] = (out[key] || 0) + val.increment;
    else out[key] = val;
  }
  out.updatedAt = now();
  return out;
}

async function allRows(model) {
  await connectMongo();
  if (isMongoEnabled()) return (await models[model].find({})).map(toPlain);
  return [...memoryStore()[collectionName(model)]];
}

async function idsMatching(model, where = {}) {
  const rows = await allRows(model);
  const checked = await Promise.all(rows.map(async (row) => ((await match(model, row, where)) ? row.id : null)));
  return checked.filter(Boolean);
}

function modelApi(model) {
  const Model = models[model] || null;
  return {
    async findMany(opts = {}) {
      let rows = await allRows(model);
      const checks = await Promise.all(rows.map((row) => match(model, row, opts.where)));
      rows = rows.filter((_, i) => checks[i]);
      rows = sortRows(rows, opts.orderBy);
      if (opts.skip) rows = rows.slice(opts.skip);
      if (opts.take !== undefined) rows = rows.slice(0, opts.take);
      return Promise.all(rows.map((row) => opts.select ? applySelect(row, opts.select, model) : includeRelations(model, row, opts.include)));
    },
    async findFirst(opts = {}) {
      const rows = await this.findMany({ ...opts, take: 1 });
      return rows[0] || null;
    },
    async findUnique(opts = {}) {
      return this.findFirst(opts);
    },
    async count(opts = {}) {
      const rows = await this.findMany({ where: opts.where });
      return rows.length;
    },
    async create(opts = {}) {
      await connectMongo();
      const row = normalizeData(model, opts.data || {});
      if (isMongoEnabled()) {
        await Model.create(row);
        return toPlain(await Model.findOne({ id: row.id }));
      }
      memoryStore()[collectionName(model)].push(row);
      return row;
    },
    async update(opts = {}) {
      await connectMongo();
      const ids = await idsMatching(model, opts.where);
      if (!ids.length) throw new Error(`${model} not found`);
      if (isMongoEnabled()) {
        const current = toPlain(await Model.findOne({ id: ids[0] }));
        const next = applyData(current, opts.data || {});
        await Model.updateOne({ id: ids[0] }, { $set: next });
        const fresh = toPlain(await Model.findOne({ id: ids[0] }));
        return opts.select ? applySelect(fresh, opts.select, model) : includeRelations(model, fresh, opts.include);
      }
      const rows = memoryStore()[collectionName(model)];
      const index = rows.findIndex((row) => row.id === ids[0]);
      rows[index] = applyData(rows[index], opts.data || {});
      return opts.select ? applySelect(rows[index], opts.select, model) : includeRelations(model, rows[index], opts.include);
    },
    async delete(opts = {}) {
      await connectMongo();
      const ids = await idsMatching(model, opts.where);
      if (!ids.length) throw new Error(`${model} not found`);
      if (isMongoEnabled()) {
        const deleted = toPlain(await Model.findOne({ id: ids[0] }));
        await Model.deleteOne({ id: ids[0] });
        return deleted;
      }
      const rows = memoryStore()[collectionName(model)];
      const index = rows.findIndex((row) => row.id === ids[0]);
      const [deleted] = rows.splice(index, 1);
      return deleted;
    },
    async deleteMany(opts = {}) {
      await connectMongo();
      const ids = await idsMatching(model, opts.where);
      if (!ids.length) return { count: 0 };
      if (isMongoEnabled()) {
        const res = await Model.deleteMany({ id: { $in: ids } });
        return { count: res.deletedCount || 0 };
      }
      const rows = memoryStore()[collectionName(model)];
      const before = rows.length;
      memoryStore()[collectionName(model)] = rows.filter((row) => !ids.includes(row.id));
      return { count: before - memoryStore()[collectionName(model)].length };
    },
    async upsert(opts = {}) {
      const existing = await this.findUnique({ where: opts.where });
      if (existing) return this.update({ where: { id: existing.id }, data: opts.update || {} });
      return this.create({ data: opts.create || {} });
    },
    async aggregate(opts = {}) {
      const rows = await this.findMany({ where: opts.where });
      const out = {};
      if (opts._sum) {
        out._sum = {};
        for (const key of Object.keys(opts._sum)) {
          out._sum[key] = rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
        }
      }
      return out;
    },
  };
}

export const db = {
  user: modelApi("user"),
  category: modelApi("category"),
  tag: modelApi("tag"),
  article: modelApi("article"),
  comment: modelApi("comment"),
  bookmark: modelApi("bookmark"),
  session: modelApi("session"),
  media: modelApi("media"),
  siteSettings: modelApi("siteSettings"),
  connect: connectMongo,
};
