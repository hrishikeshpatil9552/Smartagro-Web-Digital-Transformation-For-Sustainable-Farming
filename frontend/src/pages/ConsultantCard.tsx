import { Consultant } from "../types/Consultatnt";

interface Props {
  consultant: Consultant;
}

const ConsultantCard = ({ consultant }: Props) => {
  return (
    <div className="border border-gray-300 p-4 mb-3 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{consultant.name}</h3>
      <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Expertise:</span> {consultant.expertise}</p>
      <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Area:</span> {consultant.area}</p>
      <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Phone:</span> {consultant.phone}</p>
      <p className="text-sm text-gray-700">{consultant.description}</p>
    </div>
  );
};

export default ConsultantCard;
