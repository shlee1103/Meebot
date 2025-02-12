import Hero from './Hero';
import Features from './Features';
import ScrollIndicator from './ScrollIndicator';
import Header from '../common/Header';

const MainSection = () => {
  return (
    <main className="relative overflow-hidden">
      <section className="h-screen flex flex-col relative">
        <Header />
        <div className="flex-1 flex items-center">
          <Hero />
        </div>
        <ScrollIndicator />
      </section>
      <Features />
    </main>
  );
};

export default MainSection;