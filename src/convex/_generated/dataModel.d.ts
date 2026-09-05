import type { DataModelFromSchemaDefinition, GenericId as Id } from "convex/server";
import schema from "../schema";

/**
 * Généré manuellement (pas de codegen réseau disponible), à partir de src/convex/schema.ts.
 */
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export type TableNames = keyof DataModel["tableNames"] extends never
  ? string
  : Extract<keyof DataModel, string>;
export type Doc<T extends string> = DataModel[T] extends { document: infer D } ? D : any;
export type { Id };
