import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookLogo, doodleBorder, StarDoodle, CatDoodle, BeeDoodle } from '../components/Doodles';
import { PenTool, Globe, ArrowRight } from 'lucide-react';


export default function HowItWorks() {
  const steps = [
    {
      title: "1. Join the Club",
      description: "Sign up and get instant access to the Creator Studio. It's completely free to start sharing your imagination with the world.",
      icon: <CatDoodle className="w-16 h-16" />,
      color: "bg-[#fbcfe8]",
    },
    {
      title: "2. Write or Upload",
      description: "Use our distraction-free, lined-paper writing pad to craft your story, or upload your pre-made scripts and gorgeous cover art.",
      icon: <PenTool className="w-12 h-12" />,
      color: "bg-[#fef08a]",
    },
    {
      title: "3. Publish & Share",
      description: "Hit publish and your book instantly goes live in our global library! Readers can discover, read, and fall in love with your work.",
      icon: <Globe className="w-12 h-12" />,
      color: "bg-[#bbf7d0]",
    }
  ];

  return (
    <div className="pt-24 pb-32 bg-[#fffdfa] min-h-screen font-sans relative overflow-hidden">
      {/* Background Doodles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <StarDoodle className="absolute top-20 left-10 w-12 h-12" />
          <StarDoodle className="absolute bottom-40 right-20 w-16 h-16" />
      </div>

      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-[#fffdfa]/80 backdrop-blur-sm border-b-2 border-black">
        <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter cursor-pointer">
          <BookLogo className="w-8 h-8" />
          mentozy.blook.
        </Link>
        <div className="flex items-center gap-4 font-bold">
          <Link to="/" className={`px-4 py-2 bg-white text-sm ${doodleBorder} hover:bg-gray-50`}>Back to Home</Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 relative z-10 max-w-4xl mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-4 relative">
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tight relative z-10">
              How it Works
            </h1>
            <div className="absolute -bottom-4 left-0 w-full h-8 bg-[#bfdbfe] -z-10 transform -rotate-1"></div>
            <BeeDoodle className="absolute -top-10 -right-12 w-16 h-16" />
          </div>
          <p className="text-2xl font-bold text-gray-600 mt-8 max-w-2xl mx-auto">
            From a tiny spark of an idea to a published masterpiece in three simple steps.
          </p>
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}
            >
              <div className={`w-40 h-40 md:w-56 md:h-56 ${step.color} ${doodleBorder} shadow-[8px_8px_0px_#000] flex items-center justify-center flex-shrink-0 transform ${index % 2 === 0 ? 'rotate-3' : '-rotate-3'}`}>
                {step.icon}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-black mb-4">{step.title}</h2>
                <p className="text-xl font-medium text-gray-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`mt-32 p-12 bg-black text-white text-center ${doodleBorder} shadow-[12px_12px_0px_#fef08a]`}
        >
          <h2 className="text-4xl font-black mb-6">Ready to start creating?</h2>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-3 bg-[#bbf7d0] text-black px-8 py-4 text-2xl font-black hover:scale-105 transition-transform"
            style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px', border: '3px solid black' }}
          >
            Go to Creator Studio <ArrowRight className="w-8 h-8" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
