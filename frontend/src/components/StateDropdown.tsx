import React from 'react';
import { allStates } from 'indian-states-cities';

interface StateDropdownProps {
  value?: string;
  onChange: (state: string) => void;
  placeholder?: string;
  className?: string;
}

const StateDropdown: React.FC<StateDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select State",
  className = ""
}) => {
  const states = allStates();

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`}
    >
      <option value="">{placeholder}</option>
      {states.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  );
};

export default StateDropdown;