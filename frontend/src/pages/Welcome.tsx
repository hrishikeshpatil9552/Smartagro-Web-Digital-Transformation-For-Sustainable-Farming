import React from 'react';
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, CheckCircle, Clock, Droplets, Thermometer, Activity, Eye, FileText } from 'lucide-react';

interface WelcomeProps {
  email: string;
  onLogout: () => void;
}

// More realistic login data with natural variations
const recentLogins = [
  { date: 'Today, 8:47 AM', device: 'iPhone Safari', location: 'Main Barn' },
  { date: 'Yesterday, 7:23 PM', device: 'Chrome', location: 'Home Office' },
  { date: '3 days ago, 1:15 PM', device: 'iPad', location: 'South Pasture' },
];

export function Welcome({ email, onLogout }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header with agriculture branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Agriculture Project</h1>
          <p className="text-gray-600">Your farm, your way</p>
        </div>

        {/* Welcome Card */}
        <Card className="shadow-lg border-0 text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Welcome back!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-lg text-gray-700 mb-2">
                Good to see you again! 
              </p>
              <p className="text-gray-600">
                Logged in as:
              </p>
              <p className="text-green-700 font-medium mt-2">
                {email}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                Everything's running smoothly on the farm. Check out what's been happening while you were away.
              </p>
            </div>

            {/* Recent Logins */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Access</h4>
              <div className="space-y-2">
                {recentLogins.map((login, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-700">{login.date}</span>
                      <span className="text-gray-500 ml-2">• {login.device}</span>
                    </div>
                    <span className="text-gray-500">{login.location}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => alert('Taking you to the main dashboard...')}
              >
                Let's Go!
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                onClick={onLogout}
              >
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Preview - more realistic numbers */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
            Farm Overview
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-medium text-green-600">7</div>
              <div className="text-sm text-gray-600">Fields Active</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-medium text-green-600">78%</div>
              <div className="text-sm text-gray-600">Crop Health</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-medium text-green-600">22°C</div>
              <div className="text-sm text-gray-600">Right Now</div>
            </div>
          </div>
        </div>

        {/* Recent Activities Section - more natural activities */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              What's Been Happening
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:text-green-700"
              onClick={() => alert('Full activity log coming soon!')}
            >
              See All
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Recent Activity Items - more realistic and varied */}
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Sprinklers ran in back field</p>
                <p className="text-xs text-gray-500">Mike checked the corn - looking good!</p>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  3 hours ago
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Hot day coming up tomorrow</p>
                <p className="text-xs text-gray-500">Might want to water the tomatoes early</p>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  6 hours ago
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Sarah walked the wheat field</p>
                <p className="text-xs text-gray-500">Found a small pest issue near the fence - noted for treatment</p>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Yesterday, 4:15 PM
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Finished harvest summary</p>
                <p className="text-xs text-gray-500">Summer potatoes - better yield than expected!</p>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Tuesday
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section - more casual language */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Tasks</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="flex items-center justify-center space-x-2 py-3"
              onClick={() => alert('Field check feature coming soon!')}
            >
              <Eye className="w-4 h-4" />
              <span>Check Fields</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center space-x-2 py-3"
              onClick={() => alert('Weather update coming soon!')}
            >
              <Thermometer className="w-4 h-4" />
              <span>Weather</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center space-x-2 py-3"
              onClick={() => alert('Water controls coming soon!')}
            >
              <Droplets className="w-4 h-4" />
              <span>Water System</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center space-x-2 py-3"
              onClick={() => alert('Reports coming soon!')}
            >
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </Button>
          </div>
        </div>

        {/* Features Preview - more casual */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">Everything you need to manage your farm</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Track Crops
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Watch Weather
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Plan Harvests
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}