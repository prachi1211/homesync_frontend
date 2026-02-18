import { useHousehold } from "../hooks/useHousehold";
import { SinglePersonBanner } from "../components/household/SinglePersonBanner";

interface PlaceholderCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}

function PlaceholderCard({ icon, title, description, badge }: PlaceholderCardProps) {
  return (
    <div className="bg-white rounded-lg border border-charcoal-muted/10 shadow-sm p-6 flex flex-col gap-4 opacity-70">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-charcoal-muted">
          {icon}
        </div>
        <span className="text-xs font-medium text-charcoal-muted bg-cream-dark px-2.5 py-1 rounded-full">
          {badge}
        </span>
      </div>
      <div>
        <h3 className="font-semibold text-charcoal">{title}</h3>
        <p className="text-sm text-charcoal-muted mt-1">{description}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { activeHousehold } = useHousehold();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Heading */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-charcoal tracking-tight">
          {activeHousehold
            ? `Welcome to ${activeHousehold.name}`
            : "Welcome to HomeSync"}
        </h1>
        <p className="text-charcoal-muted mt-1">
          Manage your household in one place.
        </p>
      </div>

      {/* Solo banner */}
      <SinglePersonBanner />

      {/* Placeholder feature cards */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PlaceholderCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
            title="Groceries"
            description="Shared shopping lists for your household."
            badge="Epic 3"
          />
          <PlaceholderCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            }
            title="Chores"
            description="Assign and track household chores."
            badge="Epic 4"
          />
          <PlaceholderCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="12" x2="12" y1="1" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
            title="Expenses"
            description="Split bills and track shared spending."
            badge="Epic 5"
          />
        </div>
      </div>
    </div>
  );
}
