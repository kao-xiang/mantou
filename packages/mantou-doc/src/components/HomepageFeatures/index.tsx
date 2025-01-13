import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { cn } from '@site/src/lib/utils';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Use',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Mantou is a simple and easy to create effortlessly maintainable Fullstack applications.
      </>
    ),
  },
  {
    title: 'Super Fast',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Built on top of Bun, mantou delivers exceptional performance with
        near-instant startup times and blazing-fast hot module
        replacement.
      </>
    ),
  },
  {
    title: 'Powered by React',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Mantou is powered by React, the most popular frontend library for building user interfaces.
      </>
    ),
  },
  {
    title: 'Typesafe API Routes',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        TypeScript first, zero-config, and built-in support for typesafe
        API routes, ensuring robust and maintainable code.
      </>
    ),
  },
  {
    title: 'Auto OpenAPI Docs',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Automatically generate OpenAPI documentation for your API routes,
        making it easy to keep your API docs up-to-date.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={cn('flex flex-col items-center')}>
      <div className="text-center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text-center py-4">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
