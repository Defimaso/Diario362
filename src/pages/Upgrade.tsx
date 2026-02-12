import { PremiumGate } from '@/components/PremiumGate';
import BottomDock from '@/components/BottomDock';
import Footer from '@/components/legal/Footer';

const Upgrade = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-24">
        <PremiumGate />
      </div>

      <BottomDock />
      <Footer />
    </div>
  );
};

export default Upgrade;
