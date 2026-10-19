import type { Scene } from "../scene";
import { boyScoutRule, codeSmells, refactoring, technicalDebt } from "./clean-code";
import { compositionOverInheritance, couplingCohesion, encapsulation, lawOfDemeter, separationOfConcerns, tellDontAsk } from "./design";
import { commandQuerySeparation, failFast, immutability, leastAstonishment, leastPrivilege } from "./reliability";
import { dry, kiss, prematureOptimization, yagni } from "./simplicity";
import { dependencyInversion, interfaceSegregation, liskovSubstitution, openClosed, singleResponsibility } from "./solid";

/** One animation per principle, keyed by the principle's slug in the registry. */
export const scenes: Record<string, Scene> = {
  "single-responsibility": singleResponsibility,
  "open-closed": openClosed,
  "liskov-substitution": liskovSubstitution,
  "interface-segregation": interfaceSegregation,
  "dependency-inversion": dependencyInversion,
  dry,
  kiss,
  yagni,
  "premature-optimization": prematureOptimization,
  "separation-of-concerns": separationOfConcerns,
  "coupling-cohesion": couplingCohesion,
  encapsulation,
  "composition-over-inheritance": compositionOverInheritance,
  "law-of-demeter": lawOfDemeter,
  "tell-dont-ask": tellDontAsk,
  "fail-fast": failFast,
  "least-astonishment": leastAstonishment,
  "command-query-separation": commandQuerySeparation,
  immutability,
  "least-privilege": leastPrivilege,
  "code-smells": codeSmells,
  refactoring,
  "technical-debt": technicalDebt,
  "boy-scout-rule": boyScoutRule,
};
