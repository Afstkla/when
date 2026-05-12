/**
 * Base class for every node in the parsed AST.
 *
 * Each concrete node implements `evaluate(ctx)`, returning a {@link WhenResult}
 * or `null` for nodes that fail to resolve (e.g. an invalid day-of-month).
 * The polymorphic `evaluate` lets us add new constructs by adding a new class
 * — no central switch to update.
 */

import type { EvalContext, WhenResult } from '../types.js';

export abstract class AstNode {
  abstract evaluate(ctx: EvalContext): WhenResult | null;
}
