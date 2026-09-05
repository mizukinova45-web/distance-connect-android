import type { AnyApi } from "convex/server";

/**
 * Généré manuellement (pas de codegen réseau disponible).
 * Non typé finement : `api.xxx.yyy(...)` fonctionne à l'exécution
 * (anyApi construit dynamiquement le bon chemin) mais sans autocomplete/typecheck strict.
 */
export declare const api: AnyApi;
export declare const internal: AnyApi;
