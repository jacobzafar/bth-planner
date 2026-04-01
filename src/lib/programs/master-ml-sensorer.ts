import { ProgramTemplate } from './types';

export const masterMLSensorerCOMP: ProgramTemplate = {
  name: 'Masterprogram i maskininlärning, sensorer och system (Datavetenskap), 120 HP',
  courses: [
    // År 1
    { name: 'Signaler och system, grundkurs', code: 'ET1557', hp: 6, year: 1, semester: 'HT' },
    { name: 'Introduktionskurs i maskininlärning, sensorer och system', code: 'ET1562', hp: 3, year: 1, semester: 'HT' },
    { name: 'Tillämpad artificiell intelligens', code: 'DV2659', hp: 6, year: 1, semester: 'HT' },
    { name: 'Maskininlärning', code: 'DV2638', hp: 6, year: 1, semester: 'HT' },
    { name: 'Introduktion till Bayesiansk statistik', code: 'MS2507', hp: 3, year: 1, semester: 'HT' },
    { name: 'Signaler och system, fortsättningskurs', code: 'ET2626', hp: 6, year: 1, semester: 'HT' },
    { name: 'Projektkurs i dataanalys', code: 'ET2633', hp: 6, year: 1, semester: 'VT' },
    { name: 'Tidsserier och prediktiva metoder', code: 'MS2508', hp: 6, year: 1, semester: 'VT' },
    { name: 'Avancerad maskininlärning', code: 'DV2640', hp: 6, year: 1, semester: 'VT' },
    { name: 'Reglerteknik, fortsättningskurs', code: 'ET2630', hp: 6, year: 1, semester: 'VT' },
    { name: 'Djup maskininlärning', code: 'DV2646', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Sensorsystem', code: 'ET2628', hp: 6, year: 2, semester: 'HT' },
    { name: 'Säkerhet i AI-system', code: 'DV2607', hp: 6, year: 2, semester: 'HT' },
    { name: 'Forskningsmetodik i datavetenskap', code: 'DV2654', hp: 6, year: 2, semester: 'HT' },
    { name: 'Datorseende', code: 'ET2635', hp: 6, year: 2, semester: 'HT' },
    { name: 'Mekatronik med robotik', code: 'ET2629', hp: 6, year: 2, semester: 'HT' },
    { name: 'Masterarbete i datavetenskap', code: 'DV2649', hp: 30, year: 2, semester: 'VT' },
  ],
};

export const masterMLSensorerELEC: ProgramTemplate = {
  name: 'Masterprogram i maskininlärning, sensorer och system (Elektroteknik), 120 HP',
  courses: [
    // År 1
    { name: 'Signaler och system, grundkurs', code: 'ET1557', hp: 6, year: 1, semester: 'HT' },
    { name: 'Introduktionskurs i maskininlärning, sensorer och system', code: 'ET1562', hp: 3, year: 1, semester: 'HT' },
    { name: 'Elektromagnetisk fältteori', code: 'FY2505', hp: 6, year: 1, semester: 'HT' },
    { name: 'Optimering', code: 'MA1502', hp: 6, year: 1, semester: 'HT' },
    { name: 'Introduktion till Bayesiansk statistik', code: 'MS2507', hp: 3, year: 1, semester: 'HT' },
    { name: 'Signaler och system, fortsättningskurs', code: 'ET2626', hp: 6, year: 1, semester: 'HT' },
    { name: 'Projektkurs i dataanalys', code: 'ET2633', hp: 6, year: 1, semester: 'VT' },
    { name: 'Tidsserier och prediktiva metoder', code: 'MS2508', hp: 6, year: 1, semester: 'VT' },
    { name: 'Tillämpad maskininlärning', code: 'MT1575', hp: 6, year: 1, semester: 'VT' },
    { name: 'Reglerteknik, fortsättningskurs', code: 'ET2630', hp: 6, year: 1, semester: 'VT' },
    { name: 'Djupinlärning', code: 'ET2638', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Sensorsystem', code: 'ET2628', hp: 6, year: 2, semester: 'HT' },
    { name: 'Radarsystem', code: 'ET2634', hp: 6, year: 2, semester: 'HT' },
    { name: 'Forskningsmetodik för ingenjörer', code: 'MT2585', hp: 6, year: 2, semester: 'HT' },
    { name: 'Datorseende', code: 'ET2635', hp: 6, year: 2, semester: 'HT' },
    { name: 'Mekatronik med robotik', code: 'ET2629', hp: 6, year: 2, semester: 'HT' },
    { name: 'Masterarbete i elektroteknik', code: 'ET2631', hp: 30, year: 2, semester: 'VT' },
  ],
};
