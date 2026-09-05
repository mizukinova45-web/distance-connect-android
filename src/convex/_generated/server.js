import {
  query as queryGeneric,
  mutation as mutationGeneric,
  action as actionGeneric,
  internalQuery as internalQueryGeneric,
  internalMutation as internalMutationGeneric,
  internalAction as internalActionGeneric,
  httpActionGeneric,
  componentsGeneric,
} from "convex/server";

export const query = queryGeneric;
export const mutation = mutationGeneric;
export const action = actionGeneric;
export const internalQuery = internalQueryGeneric;
export const internalMutation = internalMutationGeneric;
export const internalAction = internalActionGeneric;
export const httpAction = httpActionGeneric;
export const components = componentsGeneric();
