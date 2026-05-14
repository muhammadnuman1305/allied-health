import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: LucideIcon;
  variant?: "default" | "primary" | "secondary" | "destructive";
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  loading = false,
}: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "border-primary/20 bg-primary/5";
      case "secondary":
        return "border-secondary/20 bg-secondary/5";
      case "destructive":
        return "border-destructive/20 bg-destructive/5";
      default:
        return "";
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-medium">
          {loading ? <Skeleton className="h-7 w-12" /> : value}
        </div>
        {loading ? (
          <Skeleton className="mt-1 h-3 w-24" />
        ) : description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
