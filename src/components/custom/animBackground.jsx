const AnimBackground = ({ className, children }) => {
  return (
    <div className={className + " relative min-h-screen flex"}>
      <img
        className="w-full h-full object-cover absolute -z-10 brightness-[0.1]"
        src="/images/animBackground.gif"
        alt="cube background image"
      />
      {children}
    </div>
  );
};

export default AnimBackground;
