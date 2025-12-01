import React from 'react';
import { Phone, MapPin, HeartHandshake, Banknote, ShieldCheck } from 'lucide-react';
import { HelpService } from '../types';

interface HelpCardProps {
  service: HelpService;
}

export const HelpCard: React.FC<HelpCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-4 hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-900">{service.orgName}</h3>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
          {service.helpType}
        </span>
      </div>

      <p className="text-slate-700 text-sm mb-4">{service.description}</p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-slate-600">
          <MapPin className="w-4 h-4 mr-2 text-slate-400" />
          {service.district}
        </div>
        
        <div className="flex items-center text-slate-600">
           {service.isFree ? (
             <div className="flex items-center text-green-600 font-medium">
               <HeartHandshake className="w-4 h-4 mr-2" />
               Бесплатно
             </div>
           ) : (
             <div className="flex items-center text-amber-600 font-medium">
               <Banknote className="w-4 h-4 mr-2" />
               Платно / Частично
             </div>
           )}
        </div>

        <div className="flex items-start text-slate-500 text-xs bg-slate-50 p-2 rounded">
          <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0 text-slate-400" />
          <span>{service.conditions}</span>
        </div>
      </div>

      <a
        href={`tel:${service.contacts.replace(/[^\d+]/g, '')}`}
        className="mt-4 w-full flex items-center justify-center py-2.5 border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
      >
        <Phone className="w-4 h-4 mr-2" />
        {service.contacts}
      </a>
    </div>
  );
};