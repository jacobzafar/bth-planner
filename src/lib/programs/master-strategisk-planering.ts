import { ProgramTemplate } from './types';

export const masterStrategiskPlanering: ProgramTemplate = {
  name: 'Masterprogram i strategisk fysisk planering, 120 HP',
  courses: [
    // År 1
    { name: 'Introduktion till strategisk fysisk planering', code: 'FM2550', hp: 15, year: 1, semester: 'HT' },
    { name: 'Framtidsbilder', code: 'FM2620', hp: 15, year: 1, semester: 'HT' },
    { name: 'Vetenskapligt arbete: teoretiska utgångspunkter och undersökningsmetoder', code: 'FM2597', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Regional planering med internationella perspektiv', code: 'FM2624', hp: 15, year: 1, semester: 'VT' },
    { name: 'Projektarbete i strategisk fysisk planering', code: 'FM2627', hp: 7.5, year: 1, semester: 'VT' },
    // År 2
    { name: 'Samhällsorganisation och styrformer', code: 'FM2625', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Projektledning', code: 'FM2623', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Aktuell planeringsforskning', code: 'FM2622', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Tematiska studier i fysisk planering', code: 'FM2626', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Masterarbete i fysisk planering', code: 'FM2612', hp: 30, year: 2, semester: 'VT' },
  ],
};
