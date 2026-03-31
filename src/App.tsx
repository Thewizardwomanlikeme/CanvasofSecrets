import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar, Topbar } from './components/Layout';
import { Entrance } from './components/Entrance';
import { Inscribe } from './components/Inscribe';
import { Reveal } from './components/Reveal';
import { Forge } from './components/Forge';
import { Vault } from './components/Vault';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex bg-surface selection:bg-secondary/20">
        {/* Paper Grain Overlay */}
        <div className="fixed inset-0 paper-grain z-[100]" />
        
        <Sidebar />
        
        <div className="flex-1 lg:pl-80 flex flex-col min-h-screen">
          <Topbar />
          
          {/* Separation Line */}
          <div className="bg-surface-low dark:bg-primary h-[2px] w-full" />
          
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Entrance />} />
              <Route path="/inscribe" element={<Inscribe />} />
              <Route path="/reveal" element={<Reveal />} />
              <Route path="/forge" element={<Forge />} />
              <Route path="/vault" element={<Vault />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="w-full py-12 px-8 flex flex-col items-center gap-4 bg-surface-low dark:bg-tertiary border-t border-primary/10">
            <nav className="flex flex-wrap justify-center gap-8 mb-4">
              {['Manifesto', 'The Cipher', 'Privacy of the Soul'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className="font-body text-xs uppercase tracking-[0.2em] text-primary opacity-50 hover:opacity-100 transition-opacity duration-300"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="font-body text-xs uppercase tracking-[0.2em] text-primary opacity-50">
              © MCCCCLII Vitra Arcana. All secrets reserved.
            </div>
          </footer>
        </div>

        {/* Decorative Background Flourishes */}
        <div className="fixed bottom-[-10%] left-[-5%] w-1/3 opacity-5 pointer-events-none rotate-12 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeltpv52IVcOXMWUNyHhp6IcqOJsQlamVVGMgrEyIGDuMO6PBI5sJzupA9CvIdfLnzffsS23ZJVtBKt3yr7evUAC0a9vT0B_PfLpcZdN30ayU2AhOGn_wKmQPkcAio0B3aibtMLjMVuXPLQg2XguIrAc24y0owvzuTGxQi2QzUSIVQ-wE4IFX4oIMK_moE6ym0gdrWX3UGi5nr3W4Pa2tdT-9PcX021PIk3wClgea_9f53Vk2KGe7qblLFDfN0ldz5_KqPNK6qCGk" 
            alt="Scroll"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="fixed top-[-5%] right-[-5%] w-1/4 opacity-5 pointer-events-none -rotate-12 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA131RzmQdybRnZCZH2maQz56Dny3biW3JJjtyyecaHjelD-SP8s_VukhnMFAM4-bVHjomjmOlm764ytT29Ghxh1UVha4pwzh3CmeMl_o1Ge3dhHBBjR28Mmm8aWeJmB2Kq2zowDT9qqAA1HF1epg2edco3r1cAa_KPafNwIvHqu9C496wTKHxkISbTjebq4dc8BtsH9d3TKphnwQiKiwxMeVvF_2xknZExx_DujNZnOyZ4EeBcL0mRItS3UGwDu1AicTED78d6wjo" 
            alt="Compass"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </Router>
  );
}
