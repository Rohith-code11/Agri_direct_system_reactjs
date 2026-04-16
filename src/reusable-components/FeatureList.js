import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked, faGlobe, faTruckFast, faUsers } from '@fortawesome/free-solid-svg-icons';

const FeatureList = ({ title, subtitle, features }) => {
  const metrics = [
    { label: 'Active Regions', value: '18+', icon: faGlobe },
    { label: 'Avg. Fulfilment', value: '36 hrs', icon: faTruckFast },
    { label: 'Verified Growers', value: '250+', icon: faUsers }
  ];

  return (
    <section className="feature-panel">
      <div className="feature-orb feature-orb-one" aria-hidden="true" />
      <div className="feature-orb feature-orb-two" aria-hidden="true" />
      <p className="feature-eyebrow">AgriDirect Platform</p>
      <h1>{title}</h1>
      <p className="feature-subtitle">{subtitle}</p>

      <div className="feature-callout">
        <span className="feature-callout-label">Live Marketplace Stack</span>
        <p>
          <FontAwesomeIcon icon={faBoxesStacked} />
          Procurement, inventory control, delivery visibility, and buyer-grower coordination in one operational workspace.
        </p>
      </div>

      <ul className="feature-list">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <div className="feature-metrics">
        {metrics.map((metric) => (
          <article key={metric.label} className="feature-metric-card">
            <FontAwesomeIcon icon={metric.icon} />
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureList;
