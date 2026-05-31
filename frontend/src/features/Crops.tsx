import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Leaf, 
  Droplet, 
  Sun, 
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const crops = [
  {
    id: 1,
    name: 'Rice (Paddy)',
    category: 'Cereals',
    season: 'Kharif',
    image: 'https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZHxlbnwxfHx8fDE3NjE1MjU5NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sowingTime: 'June-July',
    harvestTime: 'October-November',
    waterNeed: 'High',
    soilType: 'Clay loam, silt loam',
    avgYield: '25-30 quintals/acre',
    marketPrice: '₹2,100-2,300/quintal'
  },
  {
    id: 2,
    name: 'Wheat',
    category: 'Cereals',
    season: 'Rabi',
    image: 'https://images.unsplash.com/photo-1738640920336-26aae3e5db67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMHJpY2UlMjBjb3JuJTIwY3JvcHN8ZW58MXx8fHwxNzYxNjM3MDE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    sowingTime: 'November-December',
    harvestTime: 'March-April',
    waterNeed: 'Medium',
    soilType: 'Loamy, clay loam',
    avgYield: '18-22 quintals/acre',
    marketPrice: '₹2,000-2,200/quintal'
  },
  {
    id: 3,
    name: 'Cotton',
    category: 'Fiber',
    season: 'Kharif',
    image: 'https://images.unsplash.com/photo-1616504297622-a9819f1227e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBmaWVsZCUyMGFncmljdWx0dXJlfGVufDF8fHx8MTc2MTYzNzAyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    sowingTime: 'May-June',
    harvestTime: 'October-January',
    waterNeed: 'Medium',
    soilType: 'Black cotton soil, alluvial',
    avgYield: '8-12 quintals/acre',
    marketPrice: '₹5,800-6,200/quintal'
  },
  {
    id: 4,
    name: 'Tomato',
    category: 'Vegetables',
    season: 'Year-round',
    image: 'https://images.unsplash.com/photo-1755253351931-c0f7f0e44d21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjB2ZWdldGFibGUlMjBmYXJtfGVufDF8fHx8MTc2MTYzNzAyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    sowingTime: 'July-August, Jan-Feb',
    harvestTime: '90-120 days after sowing',
    waterNeed: 'High',
    soilType: 'Well-drained loamy',
    avgYield: '80-100 quintals/acre',
    marketPrice: '₹800-1,500/quintal'
  },
  {
    id: 5,
    name: 'Potato',
    category: 'Vegetables',
    season: 'Rabi',
    image: 'https://images.unsplash.com/photo-1622385889022-ab75227be50d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG8lMjBmYXJtaW5nJTIwaGFydmVzdHxlbnwxfHx8fDE3NjE2MzcwMjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sowingTime: 'October-November',
    harvestTime: 'January-February',
    waterNeed: 'Medium',
    soilType: 'Sandy loam, loamy',
    avgYield: '80-120 quintals/acre',
    marketPrice: '₹600-1,000/quintal'
  },
  {
    id: 6,
    name: 'Sugarcane',
    category: 'Cash Crops',
    season: 'Year-round',
    image: 'https://images.unsplash.com/photo-1620559290860-d1848adf78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9wJTIwZmllbGQlMjBncmVlbnxlbnwxfHx8fDE3NjE1OTU4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sowingTime: 'February-March, Oct-Nov',
    harvestTime: '10-12 months after planting',
    waterNeed: 'Very High',
    soilType: 'Loamy, clay loam',
    avgYield: '300-400 quintals/acre',
    marketPrice: '₹280-320/quintal'
  }
];

const categories = ['All', 'Cereals', 'Vegetables', 'Fiber', 'Cash Crops'];

export function Crops() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState(crops[0]);

  const filteredCrops = selectedCategory === 'All' 
    ? crops 
    : crops.filter(crop => crop.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-gray-900 mb-4">Crop Information Guide</h1>
        <p className="text-gray-600 text-xl">
          Comprehensive cultivation information for 150+ crops to help you make informed farming decisions
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Crops Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrops.map((crop) => (
          <Card 
            key={crop.id} 
            className="border-0 shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
            onClick={() => setSelectedCrop(crop)}
          >
            <div className="relative h-48">
              <ImageWithFallback
                src={crop.image}
                alt={crop.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-gray-700">
                  {crop.season}
                </span>
              </div>
            </div>
            <CardContent className="p-5">
              <h3 className="text-gray-900 mb-1">{crop.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{crop.category}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                  <span>Sowing: {crop.sowingTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                  <span>{crop.marketPrice}</span>
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Crop Information */}
      {selectedCrop && (
        <Card className="border-0 shadow-xl">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-96">
              <ImageWithFallback
                src={selectedCrop.image}
                alt={selectedCrop.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-white mb-2">{selectedCrop.name}</h2>
                <p className="text-green-200">{selectedCrop.category} • {selectedCrop.season}</p>
              </div>
            </div>

            <CardContent className="p-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="cultivation">Cultivation</TabsTrigger>
                  <TabsTrigger value="market">Market</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Droplet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Water Requirement</p>
                      <p className="text-gray-900">{selectedCrop.waterNeed}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sun className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Soil Type</p>
                      <p className="text-gray-900">{selectedCrop.soilType}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Average Yield</p>
                      <p className="text-gray-900">{selectedCrop.avgYield}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cultivation" className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 mb-2">Sowing Time</h4>
                    <p className="text-gray-600">{selectedCrop.sowingTime}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-2">Harvest Time</h4>
                    <p className="text-gray-600">{selectedCrop.harvestTime}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-gray-900 mb-1">Pro Tip</h4>
                        <p className="text-sm text-gray-600">
                          Consult local agricultural experts for region-specific cultivation practices and seed varieties.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="market" className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 mb-2">Current Market Price</h4>
                    <p className="text-2xl text-green-600">{selectedCrop.marketPrice}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-900 mb-2">Market Trend</h4>
                    <p className="text-gray-600">Prices are stable with seasonal fluctuations expected during harvest season.</p>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    View Detailed Market Analysis
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </Card>
      )}

      {/* CTA Section */}
      
    </div>
  );
}
