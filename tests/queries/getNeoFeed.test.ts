import { parse, ExecutionResult } from 'graphql';
const mockNeoFeed = jest.fn();
jest.mock('../../.mesh', () => ({
  getMeshSDK: () => ({
    NeoFeed: mockNeoFeed,
  }),
}));
import { executor } from '../exectuor';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type CustomExecutionResults<TData = Record<string, any>> = ExecutionResult<TData> & {
  metadata?: {
    requestId: string;
  }
}

describe('getNeoFeed', () => {
  beforeEach(() => {
    mockNeoFeed.mockReset();
  });

  test('Success', async () => {
    const query = `
            query GetNeoFeed($startDate: String!, $endDate: String!) {
                nearEarthObjects(startDate: $startDate, endDate: $endDate) {
                    elementCount
                    objects {
                        id
                        name
                        isPotentiallyHazardousAsteroid
                        estimatedDiameterMinKm
                        estimatedDiameterMaxKm
                        closeApproachDate
                        relativeVelocityKph
                        missDistanceKm
                    }
                }
            }
        `;

    const variables = { startDate: '2015-09-07', endDate: '2015-09-08' };

    mockNeoFeed.mockResolvedValueOnce({
      neoFeed: {
        element_count: 1,
        near_earth_objects: {
          '2026-01-01': [
            {
              id: '2000433',
              name: '433 Eros (A898 PA)',
              is_potentially_hazardous_asteroid: false,
              estimated_diameter: {
                kilometers: {
                  estimated_diameter_min: 11.56,
                  estimated_diameter_max: 25.86,
                },
              },
              close_approach_data: [
                {
                  close_approach_date: '2026-01-01',
                  relative_velocity: {
                    kilometers_per_hour: '55000.5',
                  },
                  miss_distance: {
                    kilometers: '12345678.9',
                  },
                },
              ],
            },
          ],
        },
      },
    });

    const result = await executor({
      document: parse(query),
      variables,
      context: {
        clientHeader: {
          'x-client': 'strata'
        }
      }
    }) as CustomExecutionResults;

    expect(result.data).toEqual({
      nearEarthObjects: {
        elementCount: 1,
        objects: [
          {
            id: '2000433',
            name: '433 Eros (A898 PA)',
            isPotentiallyHazardousAsteroid: false,
            estimatedDiameterMinKm: 11.56,
            estimatedDiameterMaxKm: 25.86,
            closeApproachDate: '2026-01-01',
            relativeVelocityKph: '55000.5',
            missDistanceKm: '12345678.9',
          },
        ],
      },
    });
    expect(result.metadata).toEqual({
      requestId: expect.stringMatching(UUID_REGEX)
    });
  });

  test('Error', async () => {
    const query = `
            query GetNeoFeed($startDate: String!, $endDate: String!) {
                nearEarthObjects(startDate: $startDate, endDate: $endDate) {
                    elementCount
                    objects {
                        id
                    }
                }
            }
        `;

    const variables = { startDate: '2026-01-01', endDate: '2026-01-02' };

    mockNeoFeed.mockRejectedValueOnce(new Error('NASA API request failed'));

    const result = await executor({
      document: parse(query),
      variables,
      context: {
        clientHeader: {
          'x-client': 'strata'
        }
      }
    });

    expect(result).toEqual(
      expect.objectContaining(
        {
          "errors": expect.arrayContaining([expect.objectContaining({
            "message": "Failed to fetch near earth objects in getNearEarthObjects resolver"
          })])
        }
      )
    );
  });
});
