import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container = ({ children, className, size = "lg" }: ContainerProps) => {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full"
  };

  return (
    <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </div>
  );
};

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export const Page = ({ children, className }: PageProps) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
};

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "surface";
}

export const Section = ({ children, className, variant = "default" }: SectionProps) => {
  const variantClasses = {
    default: "bg-background",
    gradient: "bg-gradient-subtle",
    surface: "bg-gradient-surface"
  };

  return (
    <section className={cn("py-16 lg:py-24", variantClasses[variant], className)}>
      {children}
    </section>
  );
};