const FeatureList = ({ title, subtitle, features }) => {
  return (
    <section className="feature-panel">
      <p className="feature-eyebrow">AgriDirect Platform</p>
      <h1>{title}</h1>
      <p className="feature-subtitle">{subtitle}</p>
      <ul className="feature-list">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </section>
  );
};

export default FeatureList;
