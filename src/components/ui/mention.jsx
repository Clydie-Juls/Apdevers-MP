import * as React from "react"

const Mention = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <span ref={ref} className={className} {...props} style={{ fontWeight: 'bold', color: '#5E51FF' }}>
      {children}
    </span>
  );
});

Mention.displayName = "Mention";

export { Mention };
