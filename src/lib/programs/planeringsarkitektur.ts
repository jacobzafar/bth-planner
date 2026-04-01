import { ProgramTemplate } from './types';

export const planeringsarkitektur: ProgramTemplate = {
  name: 'Planeringsarkitektur, 180 HP',
  courses: [
    // År 1
    { name: 'Introduktion till fysisk planering', code: 'FM1523', hp: 15, year: 1, semester: 'HT' },
    { name: 'Stadsrum 1', code: 'FM1524', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Stadsbyggnadshistoria', code: 'FM1525', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Geografiska informationssystem och statistik', code: 'FM1526', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Metoder i fysisk planering', code: 'FM1527', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Översiktlig planering och detaljplanering', code: 'FM1528', hp: 15, year: 1, semester: 'VT' },
    // År 2
    { name: 'Naturresurser och landskap', code: 'FM1518', hp: 15, year: 2, semester: 'HT' },
    { name: 'Planeringsteori', code: 'FM1529', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Planeringsekonomi och genomförande', code: 'FM1519', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Plan- och miljörätt', code: 'FM1488', hp: 7.5, year: 2, semester: 'VT' },
    { name: 'Stadsrum 2', code: 'FM1515', hp: 7.5, year: 2, semester: 'VT' },
    { name: 'Infrastruktur och mobilitet', code: 'FM1490', hp: 15, year: 2, semester: 'VT' },
    // År 3
    { name: 'Komplexa stadsbyggnadsprojekt', code: 'FM1492', hp: 15, year: 3, semester: 'HT' },
    { name: 'Strategisk planering', code: 'FM1510', hp: 15, year: 3, semester: 'HT' },
    { name: 'Vetenskapsteorins grunder', code: 'FM1504', hp: 7.5, year: 3, semester: 'VT' },
    { name: 'Tematisk litteraturkurs', code: 'FM1522', hp: 7.5, year: 3, semester: 'VT' },
    { name: 'Kandidatarbete, vetenskaplig uppsats', code: 'FM1496', hp: 15, year: 3, semester: 'VT' },
  ],
};
