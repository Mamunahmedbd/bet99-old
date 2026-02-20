/**
 * Presentation — Match Routes
 * ElysiaJS route definitions for match endpoints.
 * Controllers are thin — they delegate to use cases and map results to HTTP.
 */
import { Elysia, t } from "elysia";
import type { AppContainer } from "@config/container";

export function matchRoutes(container: AppContainer) {
  return new Elysia({ prefix: "/api/matches" })
    // ── GET /api/matches/live ──
    .get(
      "/live",
      async ({ query, set }) => {
        const result = await container.getLiveMatchesUseCase.execute({
          sport: query.sport as Parameters<typeof container.getLiveMatchesUseCase.execute>[0]["sport"],
        });

        if (!result.ok) {
          set.status = result.error.statusCode;
          return {
            success: false,
            error: {
              code: result.error.code,
              message: result.error.message,
            },
          };
        }

        return {
          success: true,
          data: result.value,
        };
      },
      {
        query: t.Object({
          sport: t.Optional(
            t.Union([
              t.Literal("cricket"),
              t.Literal("soccer"),
              t.Literal("tennis"),
            ]),
          ),
        }),
        detail: {
          summary: "Get Live Matches",
          description: "Retrieve all currently live matches, optionally filtered by sport.",
          tags: ["Matches"],
        },
      },
    )
    // ── GET /api/matches/:id ──
    .get(
      "/:id",
      async ({ params, set }) => {
        const result = await container.getMatchDetailUseCase.execute({
          matchId: params.id,
        });

        if (!result.ok) {
          set.status = result.error.statusCode;
          return {
            success: false,
            error: {
              code: result.error.code,
              message: result.error.message,
            },
          };
        }

        return {
          success: true,
          data: result.value,
        };
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        detail: {
          summary: "Get Match Detail",
          description: "Retrieve a specific match with all associated markets.",
          tags: ["Matches"],
        },
      },
    )
    // ── POST /api/matches/sync ──
    .post(
      "/sync",
      async ({ body, set }) => {
        const result = await container.syncProviderDataUseCase.execute({
          sport: body.sport,
          providerName: body.provider,
        });

        if (!result.ok) {
          set.status = result.error.statusCode;
          return {
            success: false,
            error: {
              code: result.error.code,
              message: result.error.message,
            },
          };
        }

        return {
          success: true,
          data: result.value,
        };
      },
      {
        body: t.Object({
          sport: t.Union([
            t.Literal("cricket"),
            t.Literal("soccer"),
            t.Literal("tennis"),
          ]),
          provider: t.String(),
        }),
        detail: {
          summary: "Sync Provider Data",
          description: "Trigger a manual sync from an external data provider.",
          tags: ["Sync"],
        },
      },
    );
}
