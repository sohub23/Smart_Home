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
    <section className="section-padding bg-white">
      <div className="container-width px-4 md:px-6">
        {/* Header */}
        <div className="text-center section-gap">
          <h2 className="text-headline text-primary content-gap px-4">
            Turn Everyday Hassles Into Instant Comfort
          </h2>
          <p className="text-body-large text-gray-500 max-w-3xl mx-auto px-4">
            Experience the transformation from frustration to effortless living.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-6xl mx-auto">
          {problemSolutions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-white rounded-2xl p-8 md:p-10 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:shadow-gray-100/50 h-64 md:h-72">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-8">
                      <IconComponent className="w-8 h-8 text-black" />
                    </div>

                    {/* Problem */}
                    <h3 className="text-title text-gray-900 mb-4 leading-tight">
                      {item.problem}
                    </h3>

                    {/* Solution */}
                    <p className="text-body text-gray-600 leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </section>
  );
};

export default ProblemSolutionSection;