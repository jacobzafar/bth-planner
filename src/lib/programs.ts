export type { ProgramCourse, ProgramTemplate } from './programs/types';
export { civilingenjorIndustriell } from './programs/civilingenjor-industriell';
export { civilingenjorAI } from './programs/civilingenjor-ai';
export { civilingenjorDatasakerhet } from './programs/civilingenjor-datasakerhet';
export { civilingenjorMarin } from './programs/civilingenjor-marin';
export { civilingenjorMaskin } from './programs/civilingenjor-maskin';
export { civilingenjorMjukvaru } from './programs/civilingenjor-mjukvaru';
export { civilingenjorSpelteknik } from './programs/civilingenjor-spelteknik';
export { datavetenskapSpel120, datavetenskapSpel180 } from './programs/datavetenskap-spel';
export { hogskoleingenjorIT } from './programs/hogskoleingenjor-it';

import { ProgramTemplate } from './programs/types';
import { civilingenjorIndustriell } from './programs/civilingenjor-industriell';
import { civilingenjorAI } from './programs/civilingenjor-ai';
import { civilingenjorDatasakerhet } from './programs/civilingenjor-datasakerhet';
import { civilingenjorMarin } from './programs/civilingenjor-marin';
import { civilingenjorMaskin } from './programs/civilingenjor-maskin';
import { civilingenjorMjukvaru } from './programs/civilingenjor-mjukvaru';
import { civilingenjorSpelteknik } from './programs/civilingenjor-spelteknik';
import { datavetenskapSpel120, datavetenskapSpel180 } from './programs/datavetenskap-spel';
import { hogskoleingenjorIT } from './programs/hogskoleingenjor-it';

export const bthPrograms: ProgramTemplate[] = [
  civilingenjorIndustriell,
  civilingenjorAI,
  civilingenjorDatasakerhet,
  civilingenjorMarin,
  civilingenjorMaskin,
  civilingenjorMjukvaru,
  civilingenjorSpelteknik,
  datavetenskapSpel120,
  datavetenskapSpel180,
  hogskoleingenjorIT,
];
