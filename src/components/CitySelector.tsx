import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCities } from '@/hooks/useAQI';

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const CitySelector = ({ selectedCity, onCityChange }: CitySelectorProps) => {
  const { data: cities, isLoading } = useCities();

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-primary" />
      <Select value={selectedCity} onValueChange={onCityChange}>
        <SelectTrigger className="w-[180px] bg-card border-border">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select a city"} />
        </SelectTrigger>
        <SelectContent>
          {cities?.map((city) => (
            <SelectItem key={city.id} value={city.name}>
              {city.name}, {city.country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySelector;
