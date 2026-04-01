import { ProgramTemplate } from './types';

export const sjukskoterskeprogrammet: ProgramTemplate = {
  name: 'Sjuksköterskeprogrammet, 180 HP',
  courses: [
    // År 1
    { name: 'Introduktion till yrke och akademi', code: 'OM1533', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Det vårdande och lärande mötet', code: 'OM1534', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Grundläggande anatomi och fysiologi', code: 'KM1421', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Omvårdnadens grunder', code: 'OM1535', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Anatomi och fysiologi, fördjupning', code: 'KM1422', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Mikrobiologi, farmakologi och näringslära', code: 'KM1423', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Omvårdnad, fördjupning', code: 'OM1537', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Sjuksköterskans professionella grund', code: 'OM1536', hp: 7.5, year: 1, semester: 'VT' },
    // År 2
    { name: 'Patofysiologi I', code: 'KM1424', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Omvårdnad, metoder och tillämpning I', code: 'OM1538', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Patofysiologi II', code: 'KM1425', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Omvårdnad, metoder och tillämpning II', code: 'OM1539', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Sjuksköterskans professionella utveckling', code: 'OM1540', hp: 30, year: 2, semester: 'VT' },
    // År 3
    { name: 'Omvårdnad, vetenskapliga teorier och metoder', code: 'OM1547', hp: 7.5, year: 3, semester: 'HT' },
    { name: 'Självständigt arbete', code: 'OM1542', hp: 15, year: 3, semester: 'HT' },
    { name: 'Omvårdnad vid akuta situationer och komplexa ohälsotillstånd', code: 'OM1541', hp: 7.5, year: 3, semester: 'HT' },
    { name: 'Sjuksköterskans professionella kompetens', code: 'OM1543', hp: 30, year: 3, semester: 'VT' },
  ],
};
