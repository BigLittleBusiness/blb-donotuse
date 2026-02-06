import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Users, Zap, Award, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">GrantThrive</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/grants">
              <a className="text-slate-600 hover:text-slate-900 font-medium">Browse Grants</a>
            </Link>
            <Link href="/roi-calculator">
              <a className="text-slate-600 hover:text-slate-900 font-medium">ROI Calculator</a>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <a>
                  <Button variant="default">Dashboard</Button>
                </a>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Transparent Grant Management for Australian Councils
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              GrantThrive streamlines the grant application process, increases community engagement, and brings transparency to government funding.
            </p>
            <div className="flex gap-4">
              <Link href="/grants">
                <a>
                  <Button size="lg" className="gap-2">
                    Explore Grants <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </Link>
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="outline">
                    Get Started
                  </Button>
                </a>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-white h-96 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-24 h-24 mx-auto mb-4 opacity-80" />
              <p className="text-lg font-semibold">Transparent. Efficient. Community-Driven.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
            Powerful Features for Grant Management
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Analytics Dashboard",
                description: "Real-time insights into grant distribution, application trends, and funding outcomes.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community Engagement",
                description: "Enable public voting, comments, and discussions on grants and applications.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Streamlined Workflow",
                description: "Automated application processing with status tracking and approval pipelines.",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Role-Based Access",
                description: "Secure admin, staff, and community member roles with granular permissions.",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Transparency Reports",
                description: "Public dashboards showing funded projects and grant outcomes.",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "ROI Calculator",
                description: "Demonstrate platform value and grant impact to stakeholders.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 border border-slate-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Grant Management?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join councils across Australia using GrantThrive to manage grants transparently and efficiently.
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary" className="gap-2">
                Sign In Now <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-white">GrantThrive</span>
              </div>
              <p className="text-sm">Transparent grant management for Australian councils.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/grants"><a className="hover:text-white">Browse Grants</a></Link></li>
                <li><Link href="/roi-calculator"><a className="hover:text-white">ROI Calculator</a></Link></li>
                <li><Link href="/public-dashboard"><a className="hover:text-white">Public Dashboard</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 GrantThrive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
