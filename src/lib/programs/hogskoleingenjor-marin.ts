import { ProgramTemplate } from './types';

export const hogskoleingenjorMarin: ProgramTemplate = {
  name: 'Högskoleingenjör i marin teknik, 180 HP',
  courses: [
    // År 1
    { name: 'Teknisk introduktionskurs i maskinteknik', code: 'MT1567', hp: 6, year: 1, semester: 'HT' },
    { name: 'Algebra och analys', code: 'MA1509', hp: 18, year: 1, semester: 'HT' },
    { name: 'Mekanik', code: 'FY1435', hp: 6, year: 1, semester: 'VT' },
    { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'VT' },
    { name: 'MATLAB med tillämpningar inom matematik och teknik', code: 'ET1563', hp: 4, year: 1, semester: 'VT' },
    { name: 'Datorstöd för ingenjörsarbete 1', code: 'MT1549', hp: 8, year: 1, semester: 'VT' },
    { name: 'Nautisk introduktion', code: 'MT1557', hp: 6, year: 1, semester: 'VT' },
    { name: 'Hållfasthetslära, grundkurs', code: 'MT1565', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Mekanik: dynamik', code: 'MT1573', hp: 6, year: 2, semester: 'HT' },
    { name: 'Flervariabelanalys', code: 'MA1501', hp: 6, year: 2, semester: 'HT' },
    { name: 'Etik och hållbarhet för maskinteknik', code: 'SL1419', hp: 6, year: 2, semester: 'HT' },
    { name: 'Vågfysik', code: 'FY1437', hp: 6, year: 2, semester: 'VT' },
    { name: 'Teknikutveckling; marin teknik, hållbarhet och samhällsutveckling', code: 'MT1580', hp: 6, year: 2, semester: 'VT' },
    { name: 'Marinteknisk projektkurs med produktutveckling och projektledning', code: 'ET1559', hp: 8, year: 2, semester: 'VT' },
    { name: 'Envariabelanalys 2: differentialekvationer och integralkalkyl', code: 'MA1500', hp: 6, year: 2, semester: 'VT' },
    { name: 'Materiallära', code: 'MT1572', hp: 6, year: 2, semester: 'HT' },
    // År 3
    { name: 'Termodynamik', code: 'FY1439', hp: 4, year: 3, semester: 'HT' },
    { name: 'Ellära, grundkurs', code: 'ET1538', hp: 6, year: 3, semester: 'HT' },
    { name: 'Strömningslära', code: 'MT1563', hp: 6, year: 3, semester: 'HT' },
    { name: 'Datorstöd för ingenjörsarbete 2', code: 'MT1564', hp: 6, year: 3, semester: 'HT' },
    { name: 'Elektronik med tillämpningar inom mätteknik', code: 'ET1535', hp: 6, year: 3, semester: 'HT' },
    { name: 'Marin konstruktion', code: 'MT1561', hp: 6, year: 3, semester: 'VT' },
    { name: 'Matematisk statistik med programvara', code: 'MS1417', hp: 6, year: 3, semester: 'VT' },
    { name: 'Transformteori', code: 'MA1506', hp: 6, year: 3, semester: 'VT' },
    { name: 'Examensarbete för högskoleingenjör i maskinteknik', code: 'MT1475', hp: 18, year: 3, semester: 'VT' },
    { name: 'Reglerteknik, grundkurs', code: 'ET1561', hp: 6, year: 3, semester: 'VT' },
  ],
};
