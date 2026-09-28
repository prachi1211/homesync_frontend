import { Link } from "react-router-dom";
import {
  ShoppingCart, CheckSquare, DollarSign, BarChart2,
  ArrowRight, Users, Home, Zap, Star, Check,
  RefreshCw, Smartphone, Monitor, Shield,
} from "lucide-react";
import { Logo } from "../components/ui/Logo";

const serif = { fontFamily: '"DM Serif Display", Georgia, serif' };

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ── Hero mock UI ──────────────────────────────────────────────────────────────

function GroceryMock() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-5 w-72">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-light rounded-lg flex items-center justify-center">
            <ShoppingCart size={14} className="text-primary" />
          </div>
          <span className="text-sm font-bold text-charcoal">Grocery List</span>
        </div>
        <span className="text-xs text-charcoal-muted bg-cream-dark px-2 py-0.5 rounded-full">4 items</span>
      </div>
      <div className="space-y-2.5">
        {[
          { name: "Whole Milk", qty: "2L", done: true, badge: null },
          { name: "Sourdough Bread", qty: null, done: true, badge: null },
          { name: "Free Range Eggs", qty: "×12", done: false, badge: "HIGH" },
          { name: "Greek Yoghurt", qty: null, done: false, badge: "MED" },
        ].map(({ name, qty, done, badge }) => (
          <div key={name} className={`flex items-center gap-2.5 py-1.5 border-b border-line last:border-0 ${done ? "opacity-50" : ""}`}>
            <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border ${done ? "bg-sage border-sage" : "border-line"}`}>
              {done && <Check size={10} className="text-white" />}
            </div>
            <span className={`text-xs flex-1 ${done ? "line-through text-charcoal-muted" : "text-charcoal"}`}>{name}</span>
            {qty && <span className="text-xs text-charcoal-muted">{qty}</span>}
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge === "HIGH" ? "bg-error-light text-error" : "bg-warning-light text-warning"}`}>
                {badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChoreMock() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-5 w-64">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-primary-light rounded-lg flex items-center justify-center">
          <CheckSquare size={14} className="text-primary" />
        </div>
        <span className="text-sm font-bold text-charcoal">Chores</span>
      </div>
      <div className="space-y-3">
        <div className="bg-cream rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-charcoal">Clean Kitchen</span>
            <div className="flex items-center gap-1 bg-info-light px-1.5 py-0.5 rounded-full">
              <RefreshCw size={8} className="text-info" />
              <span className="text-[9px] text-info font-medium">Rotating</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[9px] text-white font-bold">S</span>
            </div>
            <span className="text-[11px] text-charcoal-light">Sara's turn</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] text-charcoal-muted">This month</span>
              <span className="text-[9px] text-charcoal-muted">4/5</span>
            </div>
            <div className="h-1 bg-cream-dark rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-sage rounded-full" />
            </div>
          </div>
        </div>
        <div className="bg-cream rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-charcoal">Take out Trash</span>
            <span className="text-[9px] bg-warning-light text-warning px-1.5 py-0.5 rounded-full font-medium">Overdue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-charcoal-light flex items-center justify-center">
              <span className="text-[9px] text-white font-bold">M</span>
            </div>
            <span className="text-[11px] text-charcoal-light">Mike's turn</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalancePill() {
  return (
    <div className="bg-primary rounded-2xl shadow-[0_12px_40px_rgba(15,82,56,0.35)] p-4 w-52">
      <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider mb-1">Net balance</p>
      <p className="text-white text-xl font-bold mb-3">+$83.00</p>
      <div className="space-y-1.5">
        {[{ name: "Sara", amt: "$41.50" }, { name: "Mike", amt: "$41.50" }].map(({ name, amt }) => (
          <div key={name} className="flex items-center justify-between bg-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-white/80 text-[11px]">{name} owes you</span>
            <span className="text-white text-[11px] font-semibold">{amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feature mock UIs ──────────────────────────────────────────────────────────

function GroceryFeatureMock() {
  const items = [
    { name: "Organic Oat Milk", cat: "Dairy", badge: null, done: false, star: true },
    { name: "Cherry Tomatoes", cat: "Produce", badge: "HIGH", done: false, star: false },
    { name: "Whole Grain Pasta", cat: "Pantry", badge: "MED", done: false, star: false },
    { name: "Almond Butter", cat: "Pantry", badge: null, done: true, star: false },
    { name: "Sparkling Water", cat: "Drinks", badge: null, done: true, star: false },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.10)] p-6 rotate-1 hover:rotate-0 transition-transform duration-500">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-charcoal">This Week's Shop</h3>
        <span className="text-xs text-charcoal-muted">3 unbought</span>
      </div>
      <div className="space-y-3">
        {items.map(({ name, cat, badge, done, star }) => (
          <div key={name} className={`flex items-center gap-3 pb-3 border-b border-line last:border-0 ${done ? "opacity-40" : ""}`}>
            <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${done ? "bg-sage border-sage" : "border-line"}`}>
              {done && <Check size={11} className="text-white" />}
            </div>
            {star && <span className="text-warning text-xs">★</span>}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${done ? "line-through text-charcoal-muted" : "text-charcoal"}`}>{name}</p>
              <p className="text-xs text-charcoal-muted">{cat}</p>
            </div>
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge === "HIGH" ? "bg-error-light text-error" : "bg-warning-light text-warning"}`}>
                {badge}
              </span>
            )}
          </div>
        ))}
      </div>
      <button className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold py-2 bg-primary-light rounded-xl hover:bg-primary hover:text-white transition-colors">
        + Add item
      </button>
    </div>
  );
}

function ChoreFeatureMock() {
  const members = [
    { name: "Sara", initial: "S", count: 8, color: "bg-primary" },
    { name: "Mike", initial: "M", count: 5, color: "bg-charcoal-light" },
    { name: "Priya", initial: "P", count: 7, color: "bg-info" },
  ];
  const max = Math.max(...members.map(m => m.count));
  return (
    <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.10)] p-6 -rotate-1 hover:rotate-0 transition-transform duration-500">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-charcoal">Fairness Tracker</h3>
        <span className="text-xs bg-primary-light text-primary font-medium px-2 py-0.5 rounded-full">This month</span>
      </div>
      <div className="space-y-3 mb-6">
        {members.map(({ name, initial, count, color }) => (
          <div key={name} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-bold">{initial}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-charcoal">{name}</span>
                <span className="text-xs text-charcoal-muted">{count} done</span>
              </div>
              <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${color === "bg-primary" ? "bg-primary" : color === "bg-info" ? "bg-info" : "bg-charcoal-light"}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-cream rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal">Dishes</p>
            <p className="text-xs text-charcoal-muted mt-0.5">Rotating assignment</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">S</span>
              </div>
              <span className="text-xs text-charcoal">Sara's turn</span>
            </div>
            <span className="text-[10px] text-sage font-medium">Due today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseFeatureMock() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.10)] p-6 rotate-1 hover:rotate-0 transition-transform duration-500">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-charcoal">October Expenses</h3>
        <span className="text-lg font-bold text-charcoal">$624</span>
      </div>
      <div className="space-y-3 mb-5">
        {[
          { desc: "Weekly Groceries", cat: "Groceries", amt: "$124.50", split: "3 ways" },
          { desc: "Electricity Bill", cat: "Utilities", amt: "$89.00", split: "Equal" },
          { desc: "Netflix & Spotify", cat: "Entertainment", amt: "$28.00", split: "3 ways" },
        ].map(({ desc, cat, amt, split }) => (
          <div key={desc} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
            <div className="w-8 h-8 bg-cream-dark rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign size={14} className="text-charcoal-light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal truncate">{desc}</p>
              <p className="text-xs text-charcoal-muted">{cat} · Split {split}</p>
            </div>
            <span className="text-sm font-semibold text-charcoal flex-shrink-0">{amt}</span>
          </div>
        ))}
      </div>
      <div className="bg-sage-light border border-sage/20 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-charcoal-muted">You are owed</p>
          <p className="text-lg font-bold text-sage">$83.00</p>
        </div>
        <button className="text-xs font-semibold text-white bg-sage hover:bg-sage-dark px-3 py-1.5 rounded-lg transition-colors">
          Settle up
        </button>
      </div>
    </div>
  );
}

function AnalyticsFeatureMock() {
  const bars = [
    { month: "Jun", h: 55, amt: "$680" },
    { month: "Jul", h: 72, amt: "$890" },
    { month: "Aug", h: 60, amt: "$740" },
    { month: "Sep", h: 85, amt: "$1,020" },
    { month: "Oct", h: 68, amt: "$830" },
  ];
  const cats = [
    { name: "Groceries", pct: 32, color: "bg-primary" },
    { name: "Utilities", pct: 24, color: "bg-info" },
    { name: "Dining", pct: 18, color: "bg-warning" },
    { name: "Other", pct: 26, color: "bg-charcoal-light" },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.10)] p-6 -rotate-1 hover:rotate-0 transition-transform duration-500">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-charcoal">Spending Trends</h3>
        <span className="text-xs bg-primary-light text-primary font-medium px-2 py-0.5 rounded-full">Last 5 months</span>
      </div>
      <div className="flex items-end gap-2 h-24 mb-2">
        {bars.map(({ month, h, amt }) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[9px] text-charcoal-muted opacity-0 group-hover:opacity-100 transition-opacity">{amt}</span>
            <div
              className="w-full bg-primary rounded-t-md hover:bg-primary-hover transition-colors"
              style={{ height: `${h}%` }}
            />
            <span className="text-[10px] text-charcoal-muted">{month}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-line pt-4 mt-4">
        <p className="text-xs font-semibold text-charcoal mb-3">This month by category</p>
        <div className="grid grid-cols-2 gap-2">
          {cats.map(({ name, pct, color }) => (
            <div key={name} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
              <span className="text-xs text-charcoal-muted">{name}</span>
              <span className="text-xs font-semibold text-charcoal ml-auto">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LandingPage() {
  const features = [
    {
      id: "groceries",
      icon: ShoppingCart,
      label: "Groceries",
      headline: "Never forget\nwhat you need",
      body: "Smart lists with priorities, one-tap duplicate merging, and starred essentials that never get buried. The bought history means you always know who grabbed what last.",
      bullets: ["Priority levels (High, Medium)", "Duplicate detection & qty merge", "Bought history with timestamps"],
      mock: <GroceryFeatureMock />,
      bg: "bg-white",
      reverse: false,
    },
    {
      id: "chores",
      icon: CheckSquare,
      label: "Chores",
      headline: "Fair chores,\nzero arguments",
      body: "Assign chores to specific people or let HomeSync rotate them automatically based on who has done the least. The fairness tracker keeps everyone honest.",
      bullets: ["Fixed or auto-rotating assignments", "Completion tracking per member", "Overdue alerts before things pile up"],
      mock: <ChoreFeatureMock />,
      bg: "bg-cream",
      reverse: true,
    },
    {
      id: "expenses",
      icon: DollarSign,
      label: "Expenses",
      headline: "Split bills without\nthe awkward asks",
      body: "Equal splits, percentage splits, or custom exact amounts — you choose. Settlements automatically simplify a tangled web of debts into the fewest possible transfers.",
      bullets: ["Three split modes: equal, %, exact", "Automatic debt simplification", "Full expense history with categories"],
      mock: <ExpenseFeatureMock />,
      bg: "bg-white",
      reverse: false,
    },
    {
      id: "analytics",
      icon: BarChart2,
      label: "Analytics",
      headline: "See where your\nmoney actually goes",
      body: "Monthly spending trends, category breakdowns, and a chore fairness chart all in one dashboard. No more guessing — just clear numbers your whole household can see.",
      bullets: ["6-month spending timeline", "Category pie breakdown", "Chore fairness per member"],
      mock: <AnalyticsFeatureMock />,
      bg: "bg-cream",
      reverse: true,
    },
  ];

  const steps = [
    { icon: Home, num: "1", title: "Create your household", body: "Name it, pick a colour, and get a 6-character invite code in seconds." },
    { icon: Users, num: "2", title: "Invite your housemates", body: "Share the code. Anyone can join instantly — no admin approval, no waiting." },
    { icon: Zap, num: "3", title: "Manage everything together", body: "Groceries, chores, expenses, analytics — all live, all shared, all in sync." },
  ];

  const testimonials = [
    {
      quote: "We stopped arguing about chores the day we started using HomeSync. The rotation feature is honestly genius — everyone knows it's fair because the app decides.",
      name: "Priya & Arun",
      role: "Roommates, 2 years",
      initial: "P",
      color: "bg-primary",
    },
    {
      quote: "Finally an app where splitting rent, groceries, and utilities doesn't require a spreadsheet, a calculator, and three passive-aggressive group chat messages.",
      name: "Jake Morrison",
      role: "Student house, 4 people",
      initial: "J",
      color: "bg-info",
    },
    {
      quote: "The analytics section showed us we were spending 40% more on dining out than we thought. Genuinely eye-opening. We cut it in half within a month.",
      name: "The Martin Family",
      role: "Family of 4",
      initial: "M",
      color: "bg-warning",
    },
  ];

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .float-a { animation: floatA 5s ease-in-out infinite; }
        .float-b { animation: floatB 6s ease-in-out infinite 1s; }
        .float-c { animation: floatC 4s ease-in-out infinite 0.5s; }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation: fadeUp 0.7s ease 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.7s ease 0.2s both; }
        .fade-up-3 { animation: fadeUp 0.7s ease 0.3s both; }
        .fade-up-4 { animation: fadeUp 0.7s ease 0.4s both; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-semibold text-charcoal-light hover:text-charcoal px-4 py-2 rounded-lg hover:bg-cream-dark transition-all"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-primary hover:bg-primary-hover px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="min-h-[calc(100vh-4rem)] flex items-center px-6 py-20"
        style={{ background: "radial-gradient(ellipse 80% 60% at 60% 40%, #edf7f0 0%, #f8faf6 70%)" }}
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="fade-up inline-flex items-center gap-2 bg-white border border-line text-charcoal-light text-sm font-medium px-4 py-2 rounded-full mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sage" />
              Free for every household · No credit card
            </div>
            <h1 className="fade-up-1 text-5xl sm:text-6xl font-extrabold text-charcoal leading-[1.05] mb-6" style={serif}>
              Shared living,<br />
              <span
                className="inline-block"
                style={{ background: "linear-gradient(135deg, #0f5238 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                finally
              </span>{" "}
              organised.
            </h1>
            <p className="fade-up-2 text-xl text-charcoal-light leading-relaxed mb-10 max-w-lg">
              Groceries forgotten. Chores unfair. Bills awkward. HomeSync brings your whole household onto the same page — beautifully.
            </p>
            <div className="fade-up-3 flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-[0_4px_20px_rgba(15,82,56,0.3)] hover:shadow-[0_6px_28px_rgba(15,82,56,0.4)] hover:-translate-y-0.5"
              >
                Get started free <ArrowRight size={18} />
              </Link>
              <button
                onClick={() => scrollTo("features")}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-cream-dark text-charcoal font-semibold px-8 py-4 rounded-xl text-base transition-all border border-line hover:border-primary/30"
              >
                See how it works
              </button>
            </div>
            <div className="fade-up-4 flex flex-wrap gap-x-6 gap-y-2">
              {["Setup in 2 minutes", "Works on any device", "Real-time sync"].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-charcoal-muted">
                  <Check size={14} className="text-sage" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — floating mock UIs */}
          <div className="relative hidden lg:flex items-center justify-center h-[520px]">
            {/* Background decorative circles */}
            <div className="absolute w-80 h-80 rounded-full bg-primary-light opacity-40 top-8 right-8" />
            <div className="absolute w-48 h-48 rounded-full bg-cream-dark opacity-60 bottom-4 left-4" />

            <div className="float-a absolute top-0 right-4" style={{ transform: "rotate(3deg)" }}>
              <GroceryMock />
            </div>
            <div className="float-b absolute bottom-4 left-4" style={{ transform: "rotate(-2deg)" }}>
              <ChoreMock />
            </div>
            <div className="float-c absolute top-1/2 right-0 -translate-y-1/2" style={{ zIndex: 10 }}>
              <BalancePill />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="bg-[#141414] py-6 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: Zap, label: "4 Modules", sub: "Groceries, Chores, Expenses & Analytics" },
            { icon: Shield, label: "Free Forever", sub: "No hidden fees, no paywalls" },
            { icon: Monitor, label: "Real-time Sync", sub: "Updates live across all devices" },
            { icon: Smartphone, label: "Any Device", sub: "Desktop, tablet, and mobile" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} className="text-white/70" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature sections ── */}
      <div id="features">
        {features.map(({ id, icon: Icon, label, headline, body, bullets, mock, bg, reverse }) => (
          <section key={id} className={`${bg} py-24 px-6`}>
            <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
              {/* Text */}
              <div>
                <div className="inline-flex items-center gap-2 bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                  <Icon size={12} />
                  {label}
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal leading-tight mb-6 whitespace-pre-line" style={serif}>
                  {headline}
                </h2>
                <p className="text-lg text-charcoal-light leading-relaxed mb-8">{body}</p>
                <ul className="space-y-3 mb-10">
                  {bullets.map(b => (
                    <li key={b} className="flex items-center gap-3 text-charcoal-light">
                      <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-primary" />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                  Try it free <ArrowRight size={16} />
                </Link>
              </div>
              {/* Mock */}
              <div className="flex justify-center">
                {mock}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── How it works ── */}
      <section className="bg-[#141414] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-white/40 text-sm font-semibold uppercase tracking-widest mb-4">Simple by design</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white" style={serif}>
              Up and running in 2 minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px border-t-2 border-dashed border-white/20" />
            {steps.map(({ icon: Icon, num, title, body }) => (
              <div key={num} className="text-center relative">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_8px_32px_rgba(15,82,56,0.4)]">
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-black text-charcoal">{num}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-cream py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-charcoal-muted text-sm font-semibold uppercase tracking-widest mb-4">Real households</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal" style={serif}>
              Loved by people<br />who live together
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, initial, color }) => (
              <div key={name} className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-shadow flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-charcoal-light leading-relaxed text-sm flex-1 mb-6">
                  <span className="text-3xl text-primary-light font-serif leading-none mr-1">"</span>
                  {quote}
                  <span className="text-3xl text-primary-light font-serif leading-none ml-1">"</span>
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-line">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{initial}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{name}</p>
                    <p className="text-charcoal-muted text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#141414] py-28 px-6 text-center">
        <Logo size="lg" light className="justify-center mb-8" />
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 max-w-2xl mx-auto leading-tight" style={serif}>
          Ready to bring order<br />to your home?
        </h2>
        <p className="text-white/50 text-lg mb-10 max-w-md mx-auto">
          Thousands of households already use HomeSync to stay organised, fair, and on budget.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-[0_4px_24px_rgba(15,82,56,0.5)] hover:shadow-[0_8px_36px_rgba(15,82,56,0.6)] hover:-translate-y-0.5"
        >
          Create your household <ArrowRight size={20} />
        </Link>
        <p className="text-white/30 text-sm mt-5">Free forever · Setup in 2 minutes · No credit card required</p>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#141414] border-t border-white/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <Logo light size="sm" />
            <p className="text-white/30 text-xs mt-2">Your home, organised together.</p>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-white/40 hover:text-white/80 text-sm transition-colors">Log in</Link>
            <Link to="/register" className="text-white/40 hover:text-white/80 text-sm transition-colors">Sign up</Link>
            <p className="text-white/20 text-sm">© {new Date().getFullYear()} HomeSync</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
