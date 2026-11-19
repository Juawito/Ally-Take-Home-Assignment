import type { ContextType } from '../../types'
import type {
  NearEarthObject,
  NearEarthObjectFeed,
  getNEOFeedArgs
} from './types'
import { GraphQLError } from 'graphql';

// Raw NASA NasaObject
type RawNasaObject = any;

const mapNasaObject = (a: RawNasaObject): NearEarthObject => {
  const km = a.estimated_diameter?.kilometers;
  const approach = a.close_approach_data?.[0];

  return {
    id: a.id,
    name: a.name,
    isPotentiallyHazardousAsteroid: a.is_potentially_hazardous_asteroid,
    estimatedDiameterMinKm: km?.estimated_diameter_min,
    estimatedDiameterMaxKm: km?.estimated_diameter_max,
    closeApproachDate: approach?.close_approach_date,
    relativeVelocityKph: approach?.relative_velocity?.kilometers_per_hour,
    missDistanceKm: approach?.miss_distance?.kilometers,
  };
};

export const getNearEarthObjects = async (
  _: any,
  args: getNEOFeedArgs,
  context: any,
): Promise<NearEarthObjectFeed> => {
  context.logger.info('getNearEarthObjects: Enter resolver');

  try {
    const { neoFeed } = await context.meshSDK.NeoFeed({
      startDate: args.startDate,
      endDate: args.endDate,
    });

    if (!neoFeed) {
      context.logger.error('getNearEarthObjects: No feed returned');
      throw new GraphQLError('No near earth objects found in getNearEarthObjects resolver');
    }

    const byDate = (neoFeed.near_earth_objects ?? {}) as Record<string, RawNasaObject[]>;
    const objects = Object.values(byDate).flat().map(mapNasaObject);

    context.logger.info('getNearEarthObjects: Returning feed');
    return {
      elementCount: neoFeed.element_count ?? objects.length,
      objects,
    };
  } catch (error) {
    if (error instanceof GraphQLError) throw error;
    context.logger.error(`getNearEarthObjects: NASA request failed: ${error}`);
    throw new GraphQLError('Failed to fetch near earth objects in getNearEarthObjects resolver');
  }
};