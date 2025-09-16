import { useState, useEffect } from 'react';
import { Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

const ContactPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Message sent successfully!');
      setForm({ fullName: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 tracking-tight" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
              Get in Touch
            </h1>
            <p className="text-base md:text-xl max-w-2xl mx-auto leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
              Have a question? Want to know more about Curtain Luxe or #BuiltForComfort? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              {/* Left Column - Info Cards */}
              <div className="space-y-3 md:space-y-4">
                <Card className="p-4 md:p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold mb-1" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Call Us</h3>
                      <p className="text-sm mb-1" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Ready to help you</p>
                      <a 
                        href="tel:+8809678076482" 
                        className="text-gray-700 font-medium hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                      >
                        +88 09678-076482
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 md:p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold mb-1" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Email Us</h3>
                      <p className="text-sm mb-1" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>We'll respond within 24 hours</p>
                      <a 
                        href="mailto:hello@sohub.com.bd" 
                        className="text-gray-700 font-medium hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                      >
                        hello@sohub.com.bd
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 md:p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold mb-1" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Response Time</h3>
                      <p className="text-sm mb-1" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Quick support</p>
                      <span className="text-gray-700 font-medium">Within 24 hours</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Form */}
              <Card className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg md:text-xl font-semibold" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Send us a message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-xs md:text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className={`mt-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm md:text-base ${errors.fullName ? 'border-red-500' : ''}`}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-1 text-sm text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`mt-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                      className={`mt-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.subject ? 'border-red-500' : ''}`}
                      aria-describedby={errors.subject ? 'subject-error' : undefined}
                    />
                    {errors.subject && (
                      <p id="subject-error" className="mt-1 text-sm text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                      className={`mt-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none ${errors.message ? 'border-red-500' : ''}`}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-1 text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black py-2 md:py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm md:text-base"
                  >
                    Send Message
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Your privacy is important to us. We'll never share your information.
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </section>

        {/* Promise Banner */}
        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <Card className="p-4 md:p-6 bg-gray-900 text-white rounded-xl shadow-lg">
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Our Promise</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  We believe in full transparency — your voice matters. Every message is read personally by our team.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;