import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Target, Eye, Heart, Users, Award, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function About() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl mt-12">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1759410865331-9c541e043c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXJzJTIwdGVhbSUyMGFncmljdWx0dXJlfGVufDF8fHx8MTc2MTYzNzAxOHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Agri Sarathi Team"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-700/70" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-white mb-4">About Agri Sarathi</h1>
            <p className="text-white/90 text-xl max-w-2xl">
              Empowering farmers with technology, knowledge, and support to transform Indian agriculture
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-gray-900 mb-4 text-center">Our Story</h2>
        <p className="text-gray-600 mb-4">
          Agri Sarathi was born from a simple observation: farmers are the backbone of our nation, yet they often lack access to the modern tools and information that could transform their livelihoods. We started this journey in 2020 with a small team of agricultural experts and technology enthusiasts who believed that farming could be smarter, more profitable, and sustainable.
        </p>
        <p className="text-gray-600">
          Today, we're proud to serve over 50,000 farmers across India, providing them with real-time weather updates, market information, expert consultations, and AI-powered recommendations. Our platform has helped farmers increase their yields by an average of 30% and reduce crop losses significantly through early disease detection and weather alerts.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To democratize agricultural technology and make world-class farming knowledge accessible to every farmer, regardless of their location or resources. We believe every farmer deserves the tools to succeed.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-gray-900 mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To create a future where Indian agriculture is technologically advanced, environmentally sustainable, and economically rewarding for every farmer. We envision smart farms powered by AI and guided by human expertise.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div>
        <h2 className="text-gray-900 mb-8 text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-gray-900 mb-2">Farmer-First</h4>
              <p className="text-sm text-gray-600">
                Every decision we make puts farmers' needs and success at the center
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-gray-900 mb-2">Collaboration</h4>
              <p className="text-sm text-gray-600">
                We bring together experts, farmers, and technology to create better solutions
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-gray-900 mb-2">Excellence</h4>
              <p className="text-sm text-gray-600">
                We strive for the highest quality in every feature and service we provide
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-gray-900 mb-4 text-center">Meet Our Team</h2>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Our team combines decades of agricultural expertise with cutting-edge technology skills
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: 'Dr. Rajesh Kumar', role: 'Chief Agricultural Advisor', initials: 'RK', color: 'bg-green-600' },
            { name: 'Priya Sharma', role: 'Technology Lead', initials: 'PS', color: 'bg-blue-600' },
            { name: 'Amit Patel', role: 'Data Science Head', initials: 'AP', color: 'bg-purple-600' },
            { name: 'Meera Singh', role: 'Farmer Relations', initials: 'MS', color: 'bg-orange-600' },
          ].map((member, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`w-20 h-20 ${member.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl`}>
                  {member.initials}
                </div>
                <h4 className="text-gray-900 mb-1">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-green-50 rounded-2xl p-8">
        <h3 className="text-gray-900 mb-3">Join Our Mission</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Whether you're a farmer looking for support or an expert who wants to contribute, we'd love to have you as part of the Agri Sarathi family.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Get Started Today
          </button>
          <button className="px-6 py-3 bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 rounded-lg transition-colors">
            Become a Partner
          </button>
        </div>
      </div>
    </div>
  );
}
