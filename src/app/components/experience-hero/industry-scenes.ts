import { buildRestaurant } from './restaurant-scene';
import { buildIntroScene } from './intro-scene';
import { buildAppointmentStudio } from './appointment-scene';
import { buildWorkshop } from './workshop-scene';
import { IndustryId } from './configurator.store';
import { IndustrySceneBuilder } from './scene-types';

export const INDUSTRY_SCENE_BUILDERS: Record<IndustryId, IndustrySceneBuilder> = {
  gastronomia: buildRestaurant,
  wizyty: buildAppointmentStudio,
  fachowcy: buildWorkshop,
};

export const buildCoreScene = buildIntroScene;

