import { Clock, Smartphone, VolumeX, Settings } from 'lucide-react';

const problemSolutions = [
  {
    problem: "Miss the perfect timing?",
    solution: "Automated schedules that match sunrise and sunset.",
    icon: Clock
  },
  {
    problem: "Not at home?",
    solution: "Control anytime, anywhere via app or voice.",
    icon: Smartphone
  },
  {
    problem: "Tired of pulling and noisy movement?",
    solution: "Whisper-quiet motor with smooth glide.",
    icon: VolumeX
  },
  {
    problem: "Forget to adjust your curtains?",
    solution: "Custom scenes that do it for you.",
    icon: Settings
  }
];

const ProblemSolutionSection = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-headline text-primary mb-4 px-4">
            Turn Everyday Hassles Into Instant Comfort
          </h2>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-light px-4">
            Experience the transformation from frustration to effortless living.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {problemSolutions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:shadow-gray-100/50">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6">
                      <IconComponent className="w-6 h-6 text-black" />
                    </div>

                    {/* Problem */}
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 leading-tight">
                      {item.problem}
                    </h3>

                    {/* Solution */}
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed font-light">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-12 md:mt-16 px-4">
          <div className="inline-flex items-center justify-center px-4 md:px-6 py-3 bg-black text-white rounded-full text-sm md:text-base font-medium hover:bg-gray-800 transition-colors duration-300 cursor-pointer">
            Experience #BuiltForComfort Today
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;