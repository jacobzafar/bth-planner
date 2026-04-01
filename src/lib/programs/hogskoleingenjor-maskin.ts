import { ProgramTemplate } from './types';

export const hogskoleingenjorMaskin: ProgramTemplate = {
  name: 'Högskoleingenjör i maskinteknik, 180 HP',
  courses: [
    // År 1
    { name: 'Teknisk introduktionskurs i maskinteknik', code: 'MT1567', hp: 6, year: 1, semester: 'HT' },
    { name: 'Algebra och analys', code: 'MA1509', hp: 18, year: 1, semester: 'HT' },
    { name: 'Mekanik', code: 'FY1435', hp: 6, year: 1, semester: 'VT' },
    { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'VT' },
    { name: 'MATLAB med tillämpningar inom matematik och teknik', code: 'ET1563', hp: 4, year: 1, semester: 'VT' },
    { name: 'Datorstöd för ingenjörsarbete 1', code: 'MT1549', hp: 8, year: 1, semester: 'VT' },
    { name: 'Tillverkningsteknik', code: 'MT1568', hp: 6, year: 1, semester: 'VT' },
    { name: 'Hållfasthetslära, grundkurs', code: 'MT1565', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Mekanik: dynamik', code: 'MT1573', hp: 6, year: 2, semester: 'HT' },
    { name: 'Maskinkonstruktion', code: 'MT1576', hp: 6, year: 2, semester: 'HT' },
    { name: 'Etik och hållbarhet för maskinteknik', code: 'SL1419', hp: 6, year: 2, semester: 'HT' },
    { name: 'Maskinelement', code: 'MT1571', hp: 6, year: 2, semester: 'HT' },
    { name: 'Innovativ och hållbar produktutveckling', code: 'MT1570', hp: 6, year: 2, semester: 'HT' },
    { name: 'Cirkulär produktutveckling', code: 'MT1589', hp: 4, year: 2, semester: 'VT' },
    { name: 'Maskinteknisk projektkurs 1 - konstruktion av mekatroniska system', code: 'MT1569', hp: 8, year: 2, semester: 'VT' },
    { name: 'Materiallära', code: 'MT1572', hp: 6, year: 2, semester: 'VT' },
    // År 3
    { name: 'Termodynamik', code: 'FY1438', hp: 6, year: 3, semester: 'HT' },
    { name: 'Ellära, grundkurs', code: 'ET1538', hp: 6, year: 3, semester: 'HT' },
    { name: 'Hållfasthetslära, fortsättningskurs med FEM', code: 'MT1566', hp: 6, year: 3, semester: 'HT' },
    { name: 'Elektronik med tillämpningar inom mätteknik', code: 'ET1535', hp: 6, year: 3, semester: 'HT' },
    { name: 'Matematisk statistik med programvara', code: 'MS1417', hp: 6, year: 3, semester: 'VT' },
    { name: 'Vågfysik', code: 'FY1437', hp: 6, year: 3, semester: 'VT' },
    { name: 'Examensarbete för högskoleingenjör i maskinteknik', code: 'MT1475', hp: 18, year: 3, semester: 'VT' },
    { name: 'Lean Produktion', code: 'MT1546', hp: 6, year: 3, semester: 'VT' },
  ],
};
