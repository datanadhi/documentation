import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <img src="/img/logo.png" alt="Data Nadhi Icon" className={styles.heroIcon} />
        <Heading as="h1" className={styles.heroTitle}>
          Data Nadhi
        </Heading>
        <p className={styles.heroSlogan}>
          <span className={styles.sloganDirect}>Direct. </span>
          <span className={styles.sloganTransform}>Transform. </span>
          <span className={styles.sloganDeliver}>Deliver.</span>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/about">
            Why Data Nadhi? 📖
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Documentation 📚
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to Data Nadhi`}
      description="Data Nadhi - Direct. Transform. Deliver.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
