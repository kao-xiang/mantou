import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import './global.css';
import toast, { Toaster } from 'react-hot-toast';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero hero--primary bg-primary text-white min-h-[60vh]">
      <div className="container mx-auto text-center">
        <Heading as="h1" className="text-4xl font-bold">
          {siteConfig.title}
        </Heading>
        <p className="text-xl mt-4">{siteConfig.tagline}</p>
        <div className="flex gap-4 justify-center p-4 mt-6">
          <Link className="bg-gray-800 text-white py-2 px-4 rounded" to="/docs/intro">
            Get Started
          </Link>
          <button className="bg-primary text-white py-2 px-4 rounded" onClick={() => {
            navigator.clipboard.writeText('bunx create-mantou-app my-app');
            toast.success('Copied to clipboard');
          }}>
            bunx create-mantou-app my-app
          </button>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
      <Toaster/>
    </Layout>
  );
}
