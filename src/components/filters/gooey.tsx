const GooeyFilter = () => {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0 }}
      aria-hidden="true"
      focusable="false"
    >
      <title>Gooey Filter</title>
      <defs>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          <feColorMatrix
            values="
                      1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -10"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default GooeyFilter;
