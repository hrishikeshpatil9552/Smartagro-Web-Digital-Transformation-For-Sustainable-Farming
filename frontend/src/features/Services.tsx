import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  CloudSun, 
  TrendingUp, 
  Building2, 
  Sprout, 
  Bug, 
  Users, 
  Calendar, 
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface ServicesProps {
  onServiceClick?: (serviceId: number) => void;
  onAddConsultant?: () => void;
}

const services = [
  {
    id: 1,
    title: 'Weather Forecasting',
    description: 'Make informed farming decisions with accurate, hyperlocal weather predictions.',
    icon: CloudSun,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    image: 'https://images.unsplash.com/photo-1592601250984-da0dc45e25f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWF0aGVyJTIwY2xvdWRzJTIwc2t5fGVufDF8fHx8MTc2MTU3ODkzOXww&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      '15-day detailed weather forecast',
      'Rainfall predictions with 95% accuracy',
      'Custom alerts for extreme weather',
      'Historical weather data analysis',
      'Best planting and harvesting dates'
    ]
  },
  {
    id: 2,
    title: 'Market Information',
    description: 'Stay ahead with real-time market prices and demand trends.',
    icon: TrendingUp,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    image: 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjB2ZWdldGFibGVzJTIwZnJlc2h8ZW58MXx8fHwxNzYxNjM0MjIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Live mandi prices for 100+ crops',
      'Price trend analysis and predictions',
      'Best time to sell recommendations',
      'Compare prices across different markets',
      'Direct buyer connection platform'
    ]
  },
  {
    id: 3,
    title: 'Government Schemes Portal',
    description: 'Access and apply for government benefits easily.',
    icon: Building2,
    color: 'bg-purple-100',
    iconColor: 'text-purple-600',
    image: 'https://images.unsplash.com/photo-1666987571351-737b29874697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzYxNjM0MjIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Complete database of 50+ schemes',
      'Instant eligibility checker',
      'Step-by-step application guidance',
      'Document preparation assistance',
      'Application status tracking'
    ]
  },
  {
    id: 4,
    title: 'Crop Recommendation System',
    description: 'Get AI-powered recommendations for maximum profitability.',
    icon: Sprout,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    image: 'https://images.unsplash.com/photo-1620559290860-d1848adf78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9wJTIwZmllbGQlMjBncmVlbnxlbnwxfHx8fDE3NjE1OTU4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Soil test report analysis',
      'Climate-based recommendations',
      'Market demand consideration',
      'Crop rotation planning',
      'Yield optimization strategies'
    ]
  },
  {
    id: 5,
    title: 'Disease Detection & Prediction',
    description: 'Protect your crops with early disease detection.',
    icon: Bug,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    image: 'https://images.unsplash.com/photo-1761338894194-1f3a9e73aecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGRpc2Vhc2UlMjBsZWFmfGVufDF8fHx8MTc2MTYzNDIyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'AI image recognition (98% accuracy)',
      'Identifies 200+ diseases and pests',
      'Organic & chemical treatment options',
      'Regional disease outbreak alerts',
      'Preventive care recommendations'
    ]
  },
  {
    id: 6,
    title: 'AI + Human Consultant',
    description: 'Get expert advice 24/7 from AI and real consultants.',
    icon: Users,
    color: 'bg-orange-100',
    iconColor: 'text-orange-600',
    image: 'https://images.unsplash.com/photo-1760821668278-51b9a987ce1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBjb25zdWx0YXRpb24lMjBhZHZpY2V8ZW58MXx8fHwxNzYxNjM0MjI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Instant AI chatbot support',
      'Video consultations with experts',
      'Community forum access',
      'Personalized farming advice',
      'Free monthly expert sessions'
    ]
  },
  {
    id: 7,
    title: 'Crop Information & Cultivation',
    description: 'Complete cultivation guides for 150+ crops.',
    icon: Calendar,
    color: 'bg-teal-100',
    iconColor: 'text-teal-600',
    image: 'https://images.unsplash.com/photo-1590324778348-5f5abb63bb07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtaW5nJTIwY2FsZW5kYXIlMjBwbGFudGluZ3xlbnwxfHx8fDE3NjE2MzQyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Detailed crop encyclopedias',
      'Custom cultivation schedules',
      'Fertilizer and irrigation guides',
      'Task reminders and notifications',
      'Weather-adjusted scheduling'
    ]
  },
  {
    id: 8,
    title: 'AgriGyaan Knowledge Hub',
    description: 'Learn modern farming from experts and peers.',
    icon: BookOpen,
    color: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    image: 'https://images.unsplash.com/photo-1758582171503-ce7b5c28bb4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MTYzNDIyNXww&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      '500+ video tutorials',
      'Real farmer success stories',
      'Interactive online courses',
      'Live expert training sessions',
      'Certificates upon completion'
    ]
  }
];

export function Services({ onServiceClick, onAddConsultant }: ServicesProps = {}) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-gray-900 mb-4">Our Services</h1>
        <p className="text-gray-600 text-xl">
          Comprehensive agricultural solutions designed to support you at every stage of farming
        </p>
      </div>

      {/* Services Grid */}
      <div className="space-y-8">
        {services.map((service, index) => {
          const Icon = service.icon;
          const isEven = index % 2 === 0;
          
          return (
            <Card key={service.id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className={`grid md:grid-cols-2 gap-0 ${!isEven ? 'md:grid-flow-dense' : ''}`}>
                {/* Image */}
                <div className={`relative h-64 md:h-auto ${!isEven ? 'md:col-start-2' : ''}`}>
                  <ImageWithFallback
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Content */}
                <CardContent className="p-8 flex flex-col justify-center">
                  <div className={`w-14 h-14 ${service.color} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${service.iconColor}`} />
                  </div>
                  
                  <h3 className="text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className={`flex gap-2 ${service.id === 5 ? 'flex-col sm:flex-row' : ''}`}>
                    <Button 
                      onClick={() => onServiceClick?.(service.id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      Learn More
                    </Button>
                    {service.id === 5 && (
                      <Button 
                        onClick={onAddConsultant}
                        className="bg-orange-600 hover:bg-orange-700 text-white flex-1 flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Add Consultant
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-white mb-4">Ready to Transform Your Farming?</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Join thousands of farmers who are already using Agri Sarathi to increase their yields and profits
        </p>
        <Button className="bg-white text-green-600 hover:bg-green-50">
          Start Free Trial
        </Button>
      </div>
    </div>
  );
}
