import { ProgramTemplate } from './types';

export const masterAI: ProgramTemplate = {
  name: 'Masterprogram i AI och maskininlärning, 120 HP',
  courses: [
    // År 1
    { name: 'Programvaruarkitektur', code: 'PA1483', hp: 6, year: 1, semester: 'HT' },
    { name: 'Beslutsstödjande system', code: 'DV2643', hp: 6, year: 1, semester: 'HT' },
    { name: 'Tillämpad artificiell intelligens', code: 'DV2659', hp: 6, year: 1, semester: 'HT' },
    { name: 'Bayesiansk statistik', code: 'MS2506', hp: 6, year: 1, semester: 'HT' },
    { name: 'Robusta metoder', code: 'MS1415', hp: 6, year: 1, semester: 'HT' },
    { name: 'Maskininlärning', code: 'DV2638', hp: 6, year: 1, semester: 'VT' },
    { name: 'ICT startups och högteknologiskt entreprenörskap', code: 'IY2645', hp: 6, year: 1, semester: 'VT' },
    { name: 'Avancerad maskininlärning', code: 'DV2640', hp: 6, year: 1, semester: 'VT' },
    { name: 'Djup maskininlärning', code: 'DV2646', hp: 6, year: 1, semester: 'VT' },
    { name: 'Robotik', code: 'ET2627', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Avancerat mjukvaruutvecklingsprojekt i team', code: 'PA2611', hp: 18, year: 2, semester: 'HT' },
    { name: 'Forskningsmetodik i datavetenskap', code: 'DV2654', hp: 6, year: 2, semester: 'HT' },
    { name: 'Masterarbete i datavetenskap', code: 'DV2649', hp: 30, year: 2, semester: 'VT' },
  ],
};

export const masterBA: ProgramTemplate = {
  name: 'Masterprogram i Business Analytics, 120 HP',
  courses: [
    // År 1
    { name: 'Business Analytics', code: 'IY2640', hp: 6, year: 1, semester: 'HT' },
    { name: 'Ledarskap i högteknologiska och kunskapsintensiva organisationer', code: 'IY2653', hp: 6, year: 1, semester: 'HT' },
    { name: 'Industriell organisation', code: 'IY2634', hp: 6, year: 1, semester: 'VT' },
    { name: 'Avancerad ekonometri', code: 'IY2637', hp: 6, year: 1, semester: 'VT' },
    { name: 'Mål- och prestationsstyrning inom industriell verksamhet', code: 'IY2647', hp: 6, year: 1, semester: 'VT' },
    { name: 'Industriell projektledning inom Business Analytics', code: 'IY2646', hp: 6, year: 1, semester: 'VT' },
    { name: 'Tillämpad konkurrens- och marknadsanalys', code: 'IY2648', hp: 6, year: 1, semester: 'VT' },
    { name: 'Datastrukturer och algoritmer', code: 'DV1682', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Tillämpad artificiell intelligens', code: 'DV2659', hp: 6, year: 2, semester: 'HT' },
    { name: 'Avancerad forskningsmetod och design', code: 'IY2638', hp: 6, year: 2, semester: 'HT' },
    { name: 'Produktivitet och teknikskiften', code: 'IY2639', hp: 6, year: 2, semester: 'HT' },
    { name: 'Företagsvärdering och analys', code: 'IY2643', hp: 6, year: 2, semester: 'VT' },
    { name: 'Finansiell modellering', code: 'IY2642', hp: 6, year: 2, semester: 'VT' },
    { name: 'Masterarbete i industriell ekonomi och management', code: 'IY2651', hp: 30, year: 2, semester: 'VT' },
  ],
};

export const masterDatavetenskap: ProgramTemplate = {
  name: 'Masterprogram i datavetenskap, 120 HP',
  courses: [
    // År 1
    { name: 'Programmering i UNIX-miljö', code: 'DV1457', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Tillämpad artificiell intelligens', code: 'DV2618', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Introduktion till Cloud Computing', code: 'DV1566', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Nätverks- och systemsäkerhet', code: 'DV2636', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Forskningsmetodik', code: 'DV2657', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Hållbar utveckling av informations- och kommunikationsteknik', code: 'SL2572', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Fördjupningskurs i datavetenskap och kommunikation', code: 'DV2635', hp: 7.5, year: 1, semester: 'VT' },
    // År 2
    { name: 'Masterarbete i datavetenskap', code: 'DV2572', hp: 30, year: 2, semester: 'HT' },
  ],
};

export const masterStadsplanering: ProgramTemplate = {
  name: 'Masterprogram i hållbar stadsplanering, 120 HP',
  courses: [
    // År 1
    { name: 'Introduktion till hållbar stadsplanering', code: 'FM2621', hp: 15, year: 1, semester: 'HT' },
    { name: 'Urban modellering och digitala verktyg', code: 'FM2638', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Stadsplaneringsteori och -historia', code: 'FM2637', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Vetenskapligt arbete: teoretiska utgångspunkter och undersökningsmetoder', code: 'FM2597', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Urbana infrastrukturer i omvandling', code: 'FM2639', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Urban ekologi', code: 'FM2640', hp: 15, year: 1, semester: 'VT' },
    // År 2
    { name: 'Samhällsorganisation och styrformer', code: 'FM2625', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Globala utmaningar och perspektiv inom stadsplanering', code: 'FM2641', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Den globala metropolen', code: 'FM2642', hp: 15, year: 2, semester: 'HT' },
    { name: 'Masterarbete i fysisk planering', code: 'FM2643', hp: 30, year: 2, semester: 'VT' },
  ],
};

export const masterInnovation: ProgramTemplate = {
  name: 'Masterprogram i Innovation Management, 150 HP',
  courses: [
    // År 1 (Utbytesstudier Bergamo)
    { name: 'Utbytesstudier, Bergamo', code: 'UB0001', hp: 60, year: 1, semester: 'HT' },
    // År 2
    { name: 'Avancerad forskningsmetod och design', code: 'IY2638', hp: 6, year: 2, semester: 'HT' },
    { name: 'Produktivitet och teknikskiften', code: 'IY2639', hp: 6, year: 2, semester: 'HT' },
    { name: 'Technology venture 1: Innovation och affärsutveckling', code: 'IY2649', hp: 6, year: 2, semester: 'VT' },
    { name: 'Technology venture 2: kommersialisering av innovationer', code: 'IY2650', hp: 6, year: 2, semester: 'VT' },
    { name: 'ICT startups och högteknologiskt entreprenörskap', code: 'IY2645', hp: 6, year: 2, semester: 'VT' },
    { name: 'Avancerad ekonometri', code: 'IY2637', hp: 6, year: 2, semester: 'VT' },
    { name: 'Affärsstrategier för digital transformation', code: 'IY2652', hp: 6, year: 2, semester: 'VT' },
    { name: 'Tillämpad konkurrens- och marknadsanalys', code: 'IY2648', hp: 6, year: 2, semester: 'VT' },
    // År 3
    { name: 'Masterarbete i industriell ekonomi och management', code: 'IY2651', hp: 30, year: 3, semester: 'VT' },
  ],
};
