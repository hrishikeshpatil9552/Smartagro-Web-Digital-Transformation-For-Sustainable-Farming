import React from 'react';

// Indian crops data - no npm package exists for this
const INDIAN_CROPS = [
  // Cereals
  'Rice', 'Wheat', 'Maize', 'Barley', 'Millet', 'Sorghum',
  // Pulses
  'Chickpea', 'Lentil', 'Black Gram', 'Green Gram', 'Pigeon Pea',
  // Cash Crops
  'Cotton', 'Sugarcane', 'Jute', 'Tea', 'Coffee', 'Rubber',
  // Oilseeds
  'Groundnut', 'Mustard', 'Sesame', 'Sunflower', 'Safflower',
  // Spices
  'Turmeric', 'Coriander', 'Cumin', 'Fenugreek', 'Black Pepper',
  // Fruits
  'Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate',
  // Vegetables
  'Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal'
].sort();

interface CropDropdownProps {
  value?: string;
  onChange: (crop: string) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

const CropDropdown: React.FC<CropDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select Crop",
  className = "",
  multiple = false
}) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      multiple={multiple}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`}
    >
      <option value="">{placeholder}</option>
      {INDIAN_CROPS.map((crop) => (
        <option key={crop} value={crop}>
          {crop}
        </option>
      ))}
    </select>
  );
};

export default CropDropdown;