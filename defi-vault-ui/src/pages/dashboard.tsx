import { DashboardLayout } from "@/components/DashboardFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Lock, Waves } from "lucide-react";
import { Link } from "react-router-dom";

const journeys = [
  {
    title: "Vault BTC",
    description:
      "Commit BTC to the trustless vault to earn automated yield with on-chain transparency and rapid settlement.",
    icon: <Lock className="h-10 w-10 text-indigo-500" />,
    href: "/dashboard/vault",
    cta: "Open Vault Dashboard",
  },
  {
    title: "Provide Liquidity",
    description:
      "Supply stablecoins to the Babylon pool and earn yield from BTC swaps while maintaining deep liquidity.",
    icon: <Waves className="h-10 w-10 text-emerald-500" />,
    href: "/dashboard/liquidity",
    cta: "Go to LP Dashboard",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Protocol Control Center"
      description="Select a role-based workspace to manage vault commitments or liquidity positions."
    >
      <section className="grid gap-6 lg:grid-cols-2">
        {journeys.map((journey) => (
          <Card
            key={journey.title}
            className="group border-none bg-white/80 shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/70"
          >
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="rounded-2xl bg-gray-100 p-3 text-indigo-600 dark:bg-gray-800">
                {journey.icon}
              </div>
              <div className="space-y-2">
                <CardTitle>{journey.title}</CardTitle>
                <CardDescription className="max-w-md text-sm leading-relaxed">
                  {journey.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="group/button">
                <Link to={journey.href} className="flex items-center gap-2">
                  {journey.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </DashboardLayout>
  );
}