"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 hover:scale-[1.02] border-0",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800 hover:text-white hover:border-zinc-500",
      ghost: "hover:bg-indigo-500/10 hover:text-indigo-400",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-6",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
            "relative inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none",
            variants[variant],
            sizes[size],
            className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-inherit border-t-transparent opacity-80" />
          </div>
        ) : null}
        <span className={cn("flex items-center justify-center gap-2", isLoading && "opacity-0")}>{children}</span>
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
