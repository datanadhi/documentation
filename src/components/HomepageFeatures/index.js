import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Direct',
    type: 'direct',
    imgSrc: require('@site/static/img/direct-icon.png').default,
    shortDescription: 'Connect the Logs',
    description: (
      <>
        Capture structured logs with our Python SDK. Define YAML rules to filter and route
        logs based on exact, partial, or regex matching. Direct your data intelligently.
      </>
    ),
    reverse: false,
  },
  {
    title: 'Transform',
    type: 'transform',
    imgSrc: require('@site/static/img/transform-icon.png').default,
    shortDescription: 'Shape the Data',
    description: (
      <>
        Process logs through powerful transformation workflows. Filter, modify, and enrich
        data using condition-based branching with reliable Temporal orchestration.
      </>
    ),
    reverse: true,
  },
  {
    title: 'Deliver',
    type: 'deliver',
    imgSrc: require('@site/static/img/deliver-icon.png').default,
    shortDescription: 'Stream to Any Target',
    description: (
      <>
        Send transformed data to multiple destinations. Connect to any integration target
        with configurable connectors and guaranteed delivery workflows.
      </>
    ),
    reverse: false,
  },
];

function Feature({imgSrc, title, type, shortDescription, description, reverse}) {
  const imageColumn = (
    <div className={clsx("col col--4", styles.imageCol)}>
      <div className={styles.imageContainer}>
        <img src={imgSrc} className={styles.featureSvg} alt={title} />
      </div>
    </div>
  );

  const headingColumn = (
    <div className={clsx("col col--4", styles.headingCol)}>
      <div className={styles.headingContainer}>
        <Heading as="h3">{title}</Heading>
        <p className={styles.shortDescription}>{shortDescription}</p>
      </div>
    </div>
  );

  const descriptionColumn = (
    <div className={clsx("col col--4", styles.descriptionCol)}>
      <div className={styles.descriptionContainer}>
        <p>{description}</p>
      </div>
    </div>
  );

  return (
    <div className={clsx(styles.featureRow, styles[type])}>
      <div className="container">
        <div className="row">
          {reverse ? (
            <>
              {descriptionColumn}
              {headingColumn}
              {imageColumn}
            </>
          ) : (
            <>
              {imageColumn}
              {headingColumn}
              {descriptionColumn}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      {FeatureList.map((props, idx) => (
        <Feature key={idx} {...props} />
      ))}
    </section>
  );
}
