import React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-3 sm:p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-1px] sm:[&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 sm:[&>svg]:top-4 [&>svg]:text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-sm sm:text-[0.95rem] [&_p]:leading-relaxed", className)}
        {...props}
      />
    );
  }
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
