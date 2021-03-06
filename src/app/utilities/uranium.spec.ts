import Fraction from 'fraction.js';

import * as Mocks from 'src/mocks';
import { ItemId, RecipeId, Step } from '~/models';
import * as Recipe from '~/store/recipe';
import { UraniumUtility } from './uranium';

/** These tests check basic functionality, not specific math results. */
describe('UraniumUtility', () => {
  const matrix = UraniumUtility.getMatrix(Mocks.RecipeFactors, Mocks.Data);

  describe('getProductionData', () => {
    it('should return uranium processing info', () => {
      const result = UraniumUtility.getProductionData(
        Mocks.RecipeFactors,
        Mocks.Data
      );
      expect(result.recipe).toBeTruthy();
      expect(result.u238.n).toBeGreaterThan(0);
      expect(result.u235.n).toBeGreaterThan(0);
    });
  });

  describe('getConversionData', () => {
    it('should return kovarex processing info', () => {
      const result = UraniumUtility.getConversionData(
        new Fraction(1),
        new Fraction(1),
        Mocks.RecipeFactors,
        Mocks.Data
      );
      expect(result.recipe).toBeTruthy();
      expect(result.input.n).toBeGreaterThan(0);
      expect(result.output.n).toBeGreaterThan(0);
      expect(result.factories.n).toBeGreaterThan(0);
      expect(result.max.n).toBeGreaterThan(0);
    });
  });

  describe('getMatrix', () => {
    it('should return a matrix of processing info', () => {
      const result = UraniumUtility.getMatrix(Mocks.RecipeFactors, Mocks.Data);
      expect(result.prod).toBeTruthy();
      expect(result.conv).toBeTruthy();
    });
  });

  describe('getStep', () => {
    it('should find a step', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.Uranium238,
          recipeId: null,
          items: new Fraction(1),
          settings: {},
        },
      ];
      const result = UraniumUtility.getStep(
        ItemId.Uranium238,
        RecipeId.UraniumProcessing,
        steps,
        Mocks.RecipeSettingsEntities
      );
      expect(result.surplus).toEqual(new Fraction(0));
      expect(result.recipeId).toEqual(RecipeId.UraniumProcessing);
    });

    it('should create a step', () => {
      const steps = [];
      const result = UraniumUtility.getStep(
        ItemId.Uranium238,
        RecipeId.UraniumProcessing,
        steps,
        Mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(1);
      expect(result.surplus).toEqual(new Fraction(0));
      expect(result.recipeId).toEqual(RecipeId.UraniumProcessing);
    });
  });

  describe('getSteps', () => {
    it('should create steps for uranium products', () => {
      const steps = [];
      const result = UraniumUtility.getSteps(
        steps,
        matrix,
        Mocks.RecipeSettingsEntities
      );
      expect(steps.length).toEqual(2);
      expect(result.u235).toBeTruthy();
      expect(result.u238).toBeTruthy();
    });
  });

  describe('calculateUranium238', () => {
    it('should skip if no u238 required', () => {
      const step: any = {
        u238: { items: new Fraction(0), factories: null },
      };
      UraniumUtility.calculateUranium238(step, matrix);
      expect(step.u238.factories).toBeNull();
    });

    it('should calculate for required u238', () => {
      const step: any = {
        u238: {
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
        u235: { surplus: new Fraction(0) },
      };
      UraniumUtility.calculateUranium238(step, matrix);
      expect(step.u235.surplus.n).toBeGreaterThan(0);
      expect(step.u238.factories.n).toBeGreaterThan(0);
    });
  });

  describe('calculateUranium235', () => {
    it('should skip if no u235 required', () => {
      const step: any = {
        u235: { items: new Fraction(0), factories: null },
      };
      UraniumUtility.calculateUranium235(step, matrix);
      expect(step.u235.factories).toBeNull();
    });

    it('should subtract from surplus if sufficient', () => {
      const step: any = {
        u235: {
          items: new Fraction(1),
          surplus: new Fraction(2),
          settings: {},
        },
      };
      UraniumUtility.calculateUranium235(step, matrix);
      expect(step.u235.surplus).toEqual(new Fraction(1));
    });

    it('should calculate for required u235', () => {
      const step: any = {
        u238: { factories: new Fraction(0) },
        u235: {
          items: new Fraction(2),
          surplus: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      };
      UraniumUtility.calculateUranium235(step, matrix);
      expect(step.u235.surplus).toEqual(new Fraction(0));
      expect(step.u238.factories.n).toBeGreaterThan(0);
      expect(step.u235.factories.n).toBeGreaterThan(0);
    });
  });

  describe('calculateItems', () => {
    it('should calculate total items from factories', () => {
      const step: any = {
        u238: { items: new Fraction(0), factories: new Fraction(1) },
        u235: { items: new Fraction(0), factories: new Fraction(1) },
      };
      UraniumUtility.calculateItems(step, matrix);
      expect(step.u238.items.n).toBeGreaterThan(0);
      expect(step.u235.items.n).toBeGreaterThan(0);
    });
  });

  describe('calculateInputs', () => {
    it('should calculate inputs for required factories', () => {
      const step: any = { u238: { factories: new Fraction(1) } };
      const steps = [];
      UraniumUtility.calculateInputs(
        step,
        matrix,
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.Data
      );
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('calculateFactories', () => {
    it('should calculate factories based on speed factors', () => {
      const step: any = {
        u238: { factories: new Fraction(1) },
        u235: { factories: new Fraction(1) },
      };
      UraniumUtility.calculateFactories(step, matrix, Mocks.RecipeFactors);
      expect(step.u238.factories.n).toBeGreaterThan(0);
      expect(step.u235.factories.n).toBeGreaterThan(0);
    });
  });

  describe('addSteps', () => {
    it('should do nothing if no uranium products are found', () => {
      const steps = [];
      const result = UraniumUtility.addSteps(
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.Data
      );
      expect(result.length).toEqual(0);
    });

    it('should do nothing if uranium products are ignored', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.Uranium235,
          recipeId: null,
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      ];
      const settings = Recipe.recipeReducer(
        Mocks.RecipeSettingsEntities,
        new Recipe.IgnoreAction(RecipeId.KovarexEnrichmentProcess)
      );
      const result = UraniumUtility.addSteps(
        steps,
        settings,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.Data
      );
      expect(result.length).toEqual(1);
    });

    it('should calculate steps for uranium products', () => {
      const steps: Step[] = [
        {
          itemId: ItemId.Uranium235,
          recipeId: null,
          items: new Fraction(1),
          factories: new Fraction(0),
          settings: {},
        },
      ];
      const result = UraniumUtility.addSteps(
        steps,
        Mocks.RecipeSettingsEntities,
        Mocks.RecipeFactors,
        ItemId.Coal,
        RecipeId.AdvancedOilProcessing,
        Mocks.Data
      );
      expect(result.length).toBeGreaterThan(1);
    });
  });
});
