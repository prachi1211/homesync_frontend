import { Link } from "react-router-dom";
import { ShoppingCart, CheckSquare, DollarSign, BarChart2, ArrowRight, Users, Home, Zap } from "lucide-react";
import { Logo } from "../components/ui/Logo";

const features = [
  {
    icon: ShoppingCart,
    title: "Smart Grocery Lists",
    description: "Add items, set priorities, and mark as bought. Starred items always rise to the top. Clear bought items with one tap.",
    color: "bg-primary-light",
    iconColor: "text-primary",
  },
  {
    icon: CheckSquare,
    title: "Chore Management",
    description: "Fixed assignments or auto-rotating schedules. The fairness tracker ensures everyone pulls equal weight.",
    color: "bg-info-light",
    iconColor: "text-info",
  },
  {
    icon: DollarSign,
    title: "Expense Splitting",
    description: "Split bills equally, by percentage, or exact amounts. Settlements simplify who owes what down to the fewest transfers.",
    color: "bg-warning-light",
    iconColor: "text-warning",
  },
  {
    icon: BarChart2,
    title: "Household Analytics",
    description: "Monthly spending trends, category breakdowns, and chore fairness charts — everything at a glance.",
    color: "bg-sage-light",
    iconColor: "text-sage",
  },
];

const steps = [
  {
    icon: Home,
    step: "01",
    title: "Create your household",
    description: "Set up in seconds. You'll get a unique invite code to share with your housemates.",
  },
  {
    icon: Users,
    step: "02",
    title: "Invite your people",
    description: "Anyone with the code can join instantly — no admin approval needed.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Manage together",
    description: "Groceries, chores, and expenses all in one place. Real-time updates for everyone.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-[#E8E6E1]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-charcoal-light hover:text-charcoal px-4 py-2 rounded-lg hover:bg-cream-dark transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary-light text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Free for households of any size
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-charcoal tracking-tight leading-tight mb-6">
            Your home.<br />
            <span className="text-primary">Organised.</span>
          </h1>
          <p className="text-xl text-charcoal-light leading-relaxed mb-10 max-w-xl mx-auto">
            HomeSync brings groceries, chores, and shared expenses into one clean app — so living together stays simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-[0_2px_8px_rgba(15,82,56,0.25)]"
            >
              Get started free
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-cream-dark text-charcoal font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-[#E8E6E1]"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-4">
              Everything your household needs
            </h2>
            <p className="text-charcoal-light text-lg max-w-xl mx-auto">
              Four tools, one app. No switching between tabs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color, iconColor }) => (
              <div
                key={title}
                className="bg-cream rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow"
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="font-bold text-charcoal text-lg mb-2">{title}</h3>
                <p className="text-charcoal-muted text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-4">
              Up and running in minutes
            </h2>
            <p className="text-charcoal-light text-lg">
              No complicated setup. Just create, invite, and go.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ icon: Icon, step, title, description }) => (
              <div key={step} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                    <Icon size={28} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-charcoal text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.replace("0", "")}
                  </span>
                </div>
                <h3 className="font-bold text-charcoal text-xl mb-3">{title}</h3>
                <p className="text-charcoal-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#141414] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Logo size="lg" light className="justify-center mb-6" />
          <p className="text-white/70 text-lg mb-8">
            Join households already managing their homes with HomeSync.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Create your household
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141414] border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} HomeSync. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Log in
            </Link>
            <Link to="/register" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
