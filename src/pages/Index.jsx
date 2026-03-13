import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Users,
  CheckCircle,
  Shield,
  ArrowRight,
  Clock,
  Building,
  UserCheck
} from "lucide-react";
function Index() {
  const features = [
    {
      icon: FileText,
      title: "Easy Application",
      description: "Students can submit leave requests with just a few clicks, including date selection and reason."
    },
    {
      icon: Users,
      title: "3-Level Approval",
      description: "Requests flow through Class Advisor \u2192 HOD \u2192 Principal for comprehensive review."
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Track your leave status at every stage with instant notifications and updates."
    },
    {
      icon: Shield,
      title: "Role-based Access",
      description: "Secure dashboards for each role with appropriate permissions and visibility."
    }
  ];
  const roles = [
    { icon: UserCheck, title: "Students", description: "Apply for leave and track status" },
    { icon: Users, title: "Class Advisors", description: "First level of approval" },
    { icon: Building, title: "HOD", description: "Department head review" },
    { icon: CheckCircle, title: "Principal", description: "Final approval authority" }
  ];
  return <div className="min-h-screen bg-background">{
    /* Hero Section */
  }<section className="relative overflow-hidden bg-gradient-hero text-primary-foreground"><div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_50%)]" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)]" /><div className="container relative py-20 lg:py-32"><div className="max-w-3xl mx-auto text-center animate-fade-up"><div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/30 mb-6"><FileText className="h-4 w-4 text-white" /><span className="text-sm font-medium text-white">Digital Leave Management System</span></div><h1 className="text-4xl lg:text-6xl font-display font-bold mb-6 leading-tight text-white">
              Streamline Your
              <span className="block text-gradient bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Leave Approvals
              </span></h1><p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              A modern 3-step approval workflow designed for colleges. From student application to final approval – all in one seamless platform.
            </p><div className="flex flex-col sm:flex-row gap-4 justify-center"><Button asChild size="xl" variant="hero" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"><Link to="/login">
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" /></Link></Button><Button asChild size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90"><a href="#features">
                  Learn More
                </a></Button></div></div></div>{
    /* Wave decoration */
  }<div className="absolute bottom-0 left-0 right-0"><svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" /></svg></div></section>{
    /* Features Section */
  }<section id="features" className="container py-20"><div className="text-center mb-12"><h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            Why Choose ApproveIQ?
          </h2><p className="text-muted-foreground max-w-2xl mx-auto">
            Built specifically for educational institutions with a focus on simplicity and efficiency.
          </p></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{features.map((feature, index) => {
    const Icon = feature.icon;
    return <Card
      key={index}
      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    ><CardContent className="pt-6"><div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><Icon className="h-6 w-6" /></div><h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent></Card>;
  })}</div></section>{
    /* Workflow Section */
  }<section className="bg-muted py-20"><div className="container"><div className="text-center mb-12"><h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              Simple 3-Step Workflow
            </h2><p className="text-muted-foreground max-w-2xl mx-auto">
              Each leave request passes through a structured approval chain for proper authorization.
            </p></div><div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">{roles.map((role, index) => {
    const Icon = role.icon;
    return <div key={index} className="flex items-center gap-4"><Card className="w-56 text-center"><CardContent className="pt-6 pb-4"><div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Icon className="h-7 w-7 text-primary" /></div><h3 className="font-display font-semibold">{role.title}</h3><p className="text-xs text-muted-foreground mt-1">{role.description}</p></CardContent></Card>{index < roles.length - 1 && <ArrowRight className="h-6 w-6 text-muted-foreground hidden lg:block" />}</div>;
  })}</div></div></section>{
    /* CTA Section */
  }<section className="container py-20"><Card className="bg-gradient-primary text-primary-foreground overflow-hidden"><CardContent className="py-12 text-center relative"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_70%)]" /><div className="relative"><h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                Ready to Get Started?
              </h2><p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Sign in to access your personalized dashboard and start managing leave requests efficiently.
              </p><Button asChild size="lg" className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"><Link to="/login">
                  Sign In Now
                  <ArrowRight className="h-5 w-5 ml-2" /></Link></Button></div></CardContent></Card></section>{
    /* Footer */
  }<footer className="border-t py-8"><div className="container text-center text-sm text-muted-foreground"><p>© 2024 ApproveIQ. Digital Leave Approval System for Educational Institutions.</p></div></footer></div>;
}
export {
  Index as default
};
