"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function combineLocalCaches(origin, override) {
    for (const key of ['name', 'tag', 'sound']) {
        origin.definitions[key].push(...override.definitions[key]);
    }
    for (const key of ['name', 'tag', 'sound', 'advancement', 'recipe', 'loot_table',
        'function', 'block_tag', 'entity_type_tag', 'fluid_tag', 'function_tag', 'item_tag']) {
        origin.references[key].push(...override.references[key]);
    }
}
exports.combineLocalCaches = combineLocalCaches;
//# sourceMappingURL=utils.js.map