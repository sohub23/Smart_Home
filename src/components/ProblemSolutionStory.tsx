import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Lock, Zap, Shield, X, Check } from 'lucide-react';

const problems = [
  {
    icon: Lock,
    problem: "Forgetting to lock the door",
    solution: "One-tap remote lock",
    before: "Rush back home to check if door is locked",
    after: "Lock/unlock from anywhere with your phone"
  },
  {
    icon: Zap,
    problem: "High electricity bills",
    solution: "AI-powered energy savings",
    before: "Lights and fans running unnecessarily",
    after: "30% reduction in energy consumption"
  },
  {
    icon: Shield,
    problem: "Security worries",
    solution: "Live camera monitoring",
    before: "No idea what's happening at home",
    after: "24/7 monitoring, anytime, anywhere"
  }
];

const ProblemSolutionStory = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-width px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-headline text-primary mb-4">Your life. Simplified.</h2>
          <p className="text-body text-muted-foreground">See how SOHUB transforms everyday challenges into effortless solutions</p>
        </div>

        <div className="space-y-8">
          {problems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Before */}
                  <div className="p-8 bg-red-50 border-r border-red-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-red-800">Before SOHUB</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-6 h-6 text-red-600" />
                        <span className="font-medium text-red-800">{item.problem}</span>
                      </div>
                      <p className="text-red-700 text-sm pl-9">{item.before}</p>
                    </div>
                  </div>

                  {/* After */}
                  <div className="p-8 bg-green-50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-800">After SOHUB</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-6 h-6 text-green-600" />
                        <span className="font-medium text-green-800">{item.solution}</span>
                      </div>
                      <p className="text-green-700 text-sm pl-9">{item.after}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            Experience Smart Living
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionStory;