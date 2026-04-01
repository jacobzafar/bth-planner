import { ProgramTemplate } from './types';

export const masterMarinTeknik: ProgramTemplate = {
  name: 'Masterprogram i marin teknik, 120 HP',
  courses: [
    // År 1
    { name: 'Signaler och system, grundkurs', code: 'ET1557', hp: 6, year: 1, semester: 'HT' },
    { name: 'Fartygstillsyn och marina regelverk', code: 'MT1560', hp: 6, year: 1, semester: 'HT' },
    { name: 'Strömningslära', code: 'MT1563', hp: 6, year: 1, semester: 'HT' },
    { name: 'Marin konstruktion', code: 'MT1561', hp: 6, year: 1, semester: 'HT' },
    { name: 'Signaler och system, fortsättningskurs', code: 'ET2626', hp: 6, year: 1, semester: 'HT' },
    { name: 'Hydroakustik', code: 'FY2506', hp: 6, year: 1, semester: 'VT' },
    { name: 'Marinteknisk projektkurs med industriell ekonomi och affärsplanering', code: 'ET2632', hp: 12, year: 1, semester: 'VT' },
    { name: 'Tillämpad maskininlärning', code: 'MT1575', hp: 6, year: 1, semester: 'VT' },
    { name: 'Reglerteknik, fortsättningskurs', code: 'ET2630', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Sensorsystem', code: 'ET2628', hp: 6, year: 2, semester: 'HT' },
    { name: 'Undervattensteknik', code: 'MT2581', hp: 6, year: 2, semester: 'HT' },
    { name: 'Forskningsmetodik för ingenjörer', code: 'MT2585', hp: 6, year: 2, semester: 'HT' },
    { name: 'Säkerhet, ergonomi och människa-system-interaktion', code: 'MT2580', hp: 6, year: 2, semester: 'HT' },
    { name: 'Mekatronik med robotik', code: 'ET2629', hp: 6, year: 2, semester: 'HT' },
    { name: 'Masterarbete i maskinteknik', code: 'MT2600', hp: 30, year: 2, semester: 'VT' },
  ],
};
