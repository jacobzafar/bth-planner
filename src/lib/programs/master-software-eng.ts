import { ProgramTemplate } from './types';

export const masterSoftwareEng: ProgramTemplate = {
  name: 'Masterprogram i Software Engineering, 120 HP',
  courses: [
    // År 1
    { name: 'Agile och Lean Mjukvaruutveckling', code: 'PA2555', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Seminarier i Programvaruteknik', code: 'PA2550', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Programvaruarkitektur och kvalitet', code: 'PA1453', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Kravhantering och produkthantering', code: 'PA2591', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Mjukvarutestning', code: 'PA2552', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Forskningsmetodik i Programvaruteknik och Datavetenskap', code: 'PA2554', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Mätningar av programvara', code: 'PA2559', hp: 7.5, year: 1, semester: 'VT' },
    // År 2
    { name: 'Evolution och Underhåll av Mjukvara - Projekt', code: 'PA2558', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Fördjupningskurs i Programvaruteknik', code: 'PA2560', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Kvalitetsstyrning', code: 'PA2557', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Masterarbete i Programvaruteknik', code: 'PA2534', hp: 30, year: 2, semester: 'VT' },
  ],
};
