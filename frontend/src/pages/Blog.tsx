import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const blogPosts = [
  {
    id: 1,
    title: '10 Tips to Increase Rice Yield This Kharif Season',
    excerpt: 'Learn practical strategies that helped farmers in Punjab increase their paddy yield by 25% last season. These time-tested methods combine traditional wisdom with modern techniques.',
    author: 'Dr. Rajesh Kumar',
    date: 'October 15, 2025',
    readTime: '5 min read',
    category: 'Cultivation Tips',
    image: 'https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZHxlbnwxfHx8fDE3NjE1MjU5NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    featured: true
  },
  {
    id: 2,
    title: 'How Smart Irrigation Cut Water Costs by 40%',
    excerpt: 'A case study from Maharashtra showing how drip irrigation and moisture sensors transformed water management on a 10-acre farm.',
    author: 'Priya Sharma',
    date: 'October 12, 2025',
    readTime: '7 min read',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1761455953103-788d1018f174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMHRlY2hub2xvZ3klMjBtb2Rlcm58ZW58MXx8fHwxNzYxNjExNjA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    featured: false
  },
  {
    id: 3,
    title: 'Organic Farming: A Complete Guide for Beginners',
    excerpt: 'Everything you need to know to start organic farming - from soil preparation to certification. Real experiences from farmers who made the switch.',
    author: 'Meera Singh',
    date: 'October 10, 2025',
    readTime: '10 min read',
    category: 'Organic Farming',
    image: 'https://images.unsplash.com/photo-1715194717972-bc42451ec72c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwZmllbGQlMjBhZ3JpY3VsdHVyZXxlbnwxfHx8fDE3NjE2MzM5NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    featured: false
  },
  {
    id: 4,
    title: 'Understanding the PM-KISAN Scheme: Benefits & Application',
    excerpt: 'A detailed breakdown of the PM-KISAN direct benefit transfer scheme and how to ensure you receive all benefits without delays.',
    author: 'Amit Patel',
    date: 'October 8, 2025',
    readTime: '6 min read',
    category: 'Government Schemes',
    image: 'https://images.unsplash.com/photo-1666987571351-737b29874697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzYxNjM0MjIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    featured: false
  },
  {
    id: 5,
    title: 'Pest Management Without Harmful Chemicals',
    excerpt: 'Natural and bio-pesticide solutions that protect your crops while keeping the soil healthy. Tested methods from successful farmers across India.',
    author: 'Dr. Rajesh Kumar',
    date: 'October 5, 2025',
    readTime: '8 min read',
    category: 'Crop Protection',
    image: 'https://images.unsplash.com/photo-1761338894194-1f3a9e73aecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGRpc2Vhc2UlMjBsZWFmfGVufDF8fHx8MTc2MTYzNDIyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    featured: false
  },
  {
    id: 6,
    title: 'Market Timing: When to Sell for Maximum Profit',
    excerpt: 'Learn to read market signals and price trends to decide the best time to sell your produce. Includes real examples from the last harvest season.',
    author: 'Priya Sharma',
    date: 'October 3, 2025',
    readTime: '5 min read',
    category: 'Market Insights',
    image: 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjB2ZWdldGFibGVzJTIwZnJlc2h8ZW58MXx8fHwxNzYxNjM0MjIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    featured: false
  },
  {
    id: 7,
    title: 'Soil Health Card: How to Read and Use It Effectively',
    excerpt: 'A simple guide to understanding your soil health card report and making the right fertilizer decisions based on the results.',
    author: 'Meera Singh',
    date: 'September 30, 2025',
    readTime: '6 min read',
    category: 'Soil Management',
    image: 'https://images.unsplash.com/photo-1620559290860-d1848adf78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9wJTIwZmllbGQlMjBncmVlbnxlbnwxfHx8fDE3NjE1OTU4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    featured: false
  },
  {
    id: 8,
    title: 'Success Story: From Traditional to Smart Farming',
    excerpt: 'How Ramesh Patil from Nashik doubled his income in 2 years by adopting smart farming techniques. An inspiring journey worth reading.',
    author: 'Amit Patel',
    date: 'September 28, 2025',
    readTime: '12 min read',
    category: 'Success Stories',
    image: 'https://images.unsplash.com/photo-1759410865331-9c541e043c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXJzJTIwdGVhbSUyMGFncmljdWx0dXJlfGVufDF8fHx8MTc2MTYzNzAxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    featured: false
  }
];

const categories = ['All', 'Cultivation Tips', 'Technology', 'Organic Farming', 'Government Schemes', 'Market Insights', 'Success Stories'];

export function Blog() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-gray-900 mb-4">AgriGyaan Blog</h1>
        <p className="text-gray-600 text-xl">
          Expert insights, practical tips, and success stories from the farming community
        </p>
      </div>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'All' && (
        <Card className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-96">
              <ImageWithFallback
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-600 text-white">Featured</Badge>
              </div>
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <Badge className="w-fit mb-3 bg-green-100 text-green-700 hover:bg-green-100">
                {featuredPost.category}
              </Badge>
              <h2 className="text-gray-900 mb-4">{featuredPost.title}</h2>
              <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {featuredPost.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {featuredPost.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {featuredPost.readTime}
                </div>
              </div>

              <button className="flex items-center text-green-600 hover:text-green-700 transition-colors group">
                Read Full Article
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularPosts.map((post) => (
          <Card 
            key={post.id} 
            className="border-0 shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
          >
            <div className="relative h-48 overflow-hidden">
              <ImageWithFallback
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            
            <CardContent className="p-5">
              <Badge className="mb-3 bg-green-100 text-green-700 hover:bg-green-100">
                {post.category}
              </Badge>
              
              <h3 className="text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {post.author}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {post.readTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-white mb-4">Stay Updated with Latest Farming Tips</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Get weekly insights, expert advice, and success stories delivered straight to your inbox
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900"
          />
          <button className="px-6 py-3 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
