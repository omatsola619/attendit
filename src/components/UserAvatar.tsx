import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const UserAvatar = ({ name, email, size = "md", className }: UserAvatarProps) => {
  // Get initials from name or email
  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if (email) {
      const emailName = email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + (emailName.charAt(1) || '').toUpperCase();
    }
    
    return 'U';
  };

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm", 
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
  };

  // Generate consistent colors based on name/email
  const getAvatarColor = () => {
    const text = name || email || 'user';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL color with good contrast
    const hue = Math.abs(hash) % 360;
    return {
      backgroundColor: `hsl(${hue}, 60%, 50%)`,
      color: 'white'
    };
  };

  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center font-semibold select-none",
        sizeClasses[size],
        className
      )}
      style={getAvatarColor()}
      title={name || email || 'User'}
    >
      {getInitials()}
    </div>
  );
};
