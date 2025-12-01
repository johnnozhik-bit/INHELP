import { AppEvent, HelpService } from '../types';
import { MOCK_EVENTS, MOCK_HELP } from '../constants';

/**
 * DATABASE SERVICE
 * 
 * 1. Create Google Sheet (sheets.new)
 * 2. Extensions > Apps Script > Paste code provided in instructions.
 * 3. Deploy as Web App (Who has access: ANYONE).
 * 4. Paste URL below.
 */

// ВСТАВЬТЕ СЮДА ССЫЛКУ НА ВАШ СКРИПТ (которая заканчивается на /exec)
const API_URL = "https://script.google.com/macros/s/AKfycbxi4ocFzh01XKYDOSqikVSGuBHLfzhTG59qirnAWP8Wd2mMhwi6vZXRLTb4II8Vmf9-ug/exec"; 

export interface DatabaseData {
  events: AppEvent[];
  help: HelpService[];
}

class DatabaseService {
  
  // --- REMOTE API MODE (Google Sheets) ---
  
  private async fetchFromApi(): Promise<DatabaseData | null> {
    if (!API_URL) return null;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("DB Fetch Error:", error);
      return null;
    }
  }

  private async saveToApi(data: DatabaseData): Promise<boolean> {
    if (!API_URL) return false;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 'text/plain' prevents CORS preflight issues with GAS
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error("DB Save Error:", error);
      return false;
    }
  }

  // --- LOCAL FALLBACK MODE ---
  
  private loadFromFallback(): DatabaseData {
    try {
      const events = localStorage.getItem('invahelp_events');
      const help = localStorage.getItem('invahelp_services');
      return {
        events: events ? JSON.parse(events) : MOCK_EVENTS,
        help: help ? JSON.parse(help) : MOCK_HELP
      };
    } catch (e) {
      return { events: MOCK_EVENTS, help: MOCK_HELP };
    }
  }

  private saveToFallback(data: DatabaseData) {
    localStorage.setItem('invahelp_events', JSON.stringify(data.events));
    localStorage.setItem('invahelp_services', JSON.stringify(data.help));
  }

  // --- PUBLIC METHODS ---

  async load(): Promise<DatabaseData> {
    const cloudData = await this.fetchFromApi();
    if (cloudData && (cloudData.events || cloudData.help)) {
       return cloudData;
    }
    console.warn("Using Local Storage (API_URL not set or returned empty)");
    return this.loadFromFallback();
  }

  // FORCE SYNC: Takes current app state and pushes it to Google Sheet
  async overrideCloudData(data: DatabaseData): Promise<boolean> {
    if (!API_URL) {
      alert("Ошибка: URL скрипта не настроен в services/db.ts");
      return false;
    }
    return this.saveToApi(data);
  }

  async saveEvent(event: AppEvent, currentEvents: AppEvent[], currentHelp: HelpService[]): Promise<AppEvent[]> {
    let newEvents = [...currentEvents];
    const index = newEvents.findIndex(e => e.id === event.id);
    if (index >= 0) newEvents[index] = event;
    else newEvents.push(event);

    const fullData = { events: newEvents, help: currentHelp };
    
    // Optimistic UI update: save locally first, then try cloud
    this.saveToFallback(fullData);
    this.saveToApi(fullData); 
    
    return newEvents;
  }

  async saveHelp(service: HelpService, currentEvents: AppEvent[], currentHelp: HelpService[]): Promise<HelpService[]> {
    let newHelp = [...currentHelp];
    const index = newHelp.findIndex(h => h.id === service.id);
    if (index >= 0) newHelp[index] = service;
    else newHelp.push(service);

    const fullData = { events: currentEvents, help: newHelp };

    this.saveToFallback(fullData);
    this.saveToApi(fullData);

    return newHelp;
  }

  async deleteItem(id: string, type: 'event' | 'help', currentEvents: AppEvent[], currentHelp: HelpService[]): Promise<{events: AppEvent[], help: HelpService[]}> {
    let newEvents = [...currentEvents];
    let newHelp = [...currentHelp];

    if (type === 'event') newEvents = newEvents.filter(e => e.id !== id);
    else newHelp = newHelp.filter(h => h.id !== id);

    const fullData = { events: newEvents, help: newHelp };
    
    this.saveToFallback(fullData);
    this.saveToApi(fullData);

    return fullData;
  }
}

export const db = new DatabaseService();