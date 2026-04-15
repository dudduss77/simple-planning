import {
  allSteps,
  mainSteps,
  sideSteps,
  type FeatureState,
  type MainStep,
  type Step,
  type StepDefinition,
} from "./contracts.js";

export const stepDefinitions: Record<Step, StepDefinition> = {
  idea: {
    step: "idea",
    kind: "main",
    title: "Idea",
    filename: "01-idea.md",
    dependencies: [],
    requiresUserConfirmation: false,
  },
  discovery: {
    step: "discovery",
    kind: "main",
    title: "Discovery",
    filename: "02-discovery.md",
    commandGuide: "Discovery.md",
    dependencies: ["idea"],
    requiresUserConfirmation: true,
  },
  "product-spec": {
    step: "product-spec",
    kind: "main",
    title: "Product Spec",
    filename: "03-product-spec.md",
    commandGuide: "ProductSpec.md",
    dependencies: ["idea", "discovery"],
    requiresUserConfirmation: true,
  },
  mvp: {
    step: "mvp",
    kind: "main",
    title: "MVP",
    filename: "04-mvp.md",
    commandGuide: "MVP.md",
    dependencies: ["product-spec"],
    requiresUserConfirmation: true,
  },
  "tech-spec": {
    step: "tech-spec",
    kind: "main",
    title: "Tech Spec",
    filename: "05-tech-spec.md",
    commandGuide: "TechSpec.md",
    dependencies: ["product-spec", "mvp"],
    requiresUserConfirmation: true,
  },
  tasks: {
    step: "tasks",
    kind: "main",
    title: "Tasks",
    filename: "06-tasks.md",
    commandGuide: "Tasks.md",
    dependencies: ["mvp", "tech-spec"],
    requiresUserConfirmation: true,
  },
  "decision-log": {
    step: "decision-log",
    kind: "side",
    title: "Decision Log",
    filename: "07-decision-log.md",
    commandGuide: "DecisionLog.md",
    dependencies: [],
    requiresUserConfirmation: true,
  },
  "parking-lot": {
    step: "parking-lot",
    kind: "side",
    title: "Parking Lot",
    filename: "08-parking-lot.md",
    commandGuide: "ParkingLot.md",
    dependencies: [],
    requiresUserConfirmation: true,
  },
};

export function getNextMainStep(state: FeatureState): MainStep | null {
  for (const step of mainSteps) {
    if (!state.documents[step].completed) {
      return step;
    }
  }

  return null;
}

export function getTargetFilename(step: Step): string {
  return stepDefinitions[step].filename;
}

export function isMainStep(step: Step): step is MainStep {
  return (mainSteps as readonly string[]).includes(step);
}

export function isSideStep(step: Step): step is (typeof sideSteps)[number] {
  return (sideSteps as readonly string[]).includes(step);
}

export function assertKnownStep(value: string): Step {
  if (!(allSteps as readonly string[]).includes(value)) {
    throw new Error(
      `Nieznany etap '${value}'. Użyj jednego z: ${allSteps.join(", ")}.`,
    );
  }

  return value as Step;
}

export function collectMissingDependencies(
  state: FeatureState,
  step: Step,
): Step[] {
  return stepDefinitions[step].dependencies.filter(
    (dependency) => !state.documents[dependency].completed,
  );
}

export function shouldBlockForApproval(
  state: FeatureState,
  step: Step,
  confirmedByUser: boolean,
): boolean {
  if (!state.awaitingUserConfirmation) {
    return false;
  }

  if (!isMainStep(step)) {
    return false;
  }

  return !confirmedByUser;
}
