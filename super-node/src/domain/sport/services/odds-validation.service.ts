/**
 * Domain Service — Odds Validation Service
 * Contains domain logic that doesn't naturally fit in a single entity.
 * Pure business rules, no infrastructure dependencies.
 */
import type { Odds } from "../value-objects/odds";

export class OddsValidationService {
  private static readonly MIN_ODDS = 1.01;
  private static readonly MAX_ODDS = 1000;
  private static readonly MAX_SPREAD_PERCENTAGE = 50;

  /**
   * Validates that odds are within acceptable ranges
   */
  static isValidOdds(odds: Odds): boolean {
    return (
      odds.back >= OddsValidationService.MIN_ODDS &&
      odds.back <= OddsValidationService.MAX_ODDS &&
      odds.lay >= OddsValidationService.MIN_ODDS &&
      odds.lay <= OddsValidationService.MAX_ODDS &&
      odds.lay >= odds.back
    );
  }

  /**
   * Checks if the spread between back and lay is acceptable
   */
  static hasAcceptableSpread(odds: Odds): boolean {
    if (odds.back === 0) return false;
    const spreadPercentage = (odds.spread / odds.back) * 100;
    return spreadPercentage <= OddsValidationService.MAX_SPREAD_PERCENTAGE;
  }

  /**
   * Detects suspicious odds movements (potential manipulation)
   */
  static isSignificantMovement(
    previousOdds: Odds,
    currentOdds: Odds,
    thresholdPercentage = 20,
  ): boolean {
    if (previousOdds.back === 0) return false;
    const movement =
      Math.abs(currentOdds.back - previousOdds.back) / previousOdds.back;
    return movement * 100 > thresholdPercentage;
  }
}
