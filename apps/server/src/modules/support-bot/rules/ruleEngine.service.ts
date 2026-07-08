import { Engine, RuleProperties } from "json-rules-engine";
import { Policy } from "../types";

export class RuleEvaluationService {
  private engine: Engine;

  constructor() {
    this.engine = new Engine();
  }

  public addPolicyRules(policy: Policy) {
    if (Array.isArray(policy.rules)) {
      policy.rules.forEach((rule: RuleProperties) => {
        this.engine.addRule(rule);
      });
    } else if (policy.rules && typeof policy.rules === "object") {
      this.engine.addRule(policy.rules as RuleProperties);
    }
  }

  public async evaluate(factName: string, factValue: any): Promise<{ isEligible: boolean; events: any[] }> {
    try {
      this.engine.addFact(factName, factValue);
      const { events } = await this.engine.run({ [factName]: factValue });
      return {
        isEligible: events.length > 0,
        events,
      };
    } catch (error) {
      console.error("Rule evaluation error:", error);
      return { isEligible: false, events: [] };
    }
  }
}
