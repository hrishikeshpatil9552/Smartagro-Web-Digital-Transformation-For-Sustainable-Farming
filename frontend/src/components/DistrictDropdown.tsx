import React from 'react';
import { citiesForState } from 'indian-states-cities';

// Additional districts not in the package
const additionalDistricts: Record<string, string[]> = {
  'Maharashtra': ['Kolhapur', 'Sangli', 'Satara', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Solapur', 'Osmanabad', 'Beed', 'Parbhani', 'Hingoli', 'Nanded', 'Yavatmal', 'Washim', 'Buldhana', 'Jalgaon', 'Nashik', 'Thane', 'Mumbai City', 'Mumbai Suburban', 'Pune', 'Wardha', 'Nagpur', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar']
};

interface DistrictDropdownProps {
  selectedState: string;
  value?: string;
  onChange: (district: string) => void;
  placeholder?: string;
  className?: string;
}

const DistrictDropdown: React.FC<DistrictDropdownProps> = ({
  selectedState,
  value,
  onChange,
  placeholder = "Select District",
  className = ""
}) => {
  const packageDistricts = selectedState ? citiesForState(selectedState) : [];
  const extraDistricts = selectedState ? (additionalDistricts[selectedState] || []) : [];
  const districts = [...new Set([...packageDistricts, ...extraDistricts])].sort();

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={!selectedState}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    >
      <option value="">{placeholder}</option>
      {districts.map((district) => (
        <option key={district} value={district}>
          {district}
        </option>
      ))}
    </select>
  );
};

export default DistrictDropdown;