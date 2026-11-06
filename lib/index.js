/**
 * Host loader entry for the browser-only Blue Archive theme plugin.
 *
 * The theme is a client-only feature: `lib/client.js` layers the
 * `bluearchive` light/dark token palette through the browser ThemeRuntime's
 * `overrideTokens`, injects its signature stylesheet, restyles the settings
 * dialog, and owns the Settings → 蔚蓝档案主题 section. It deliberately does
 * not register a third-party theme id, because DSH only persists the built-in
 * `light | dark | system` preference.
 *
 * This half exists only because a profile bundle must resolve on the host too.
 * It deliberately registers no Cordis service, no settings namespace, and no
 * Loader row of its own: the bundle patch already inserts the client plugin, so
 * adding a second entry here would load the package twice.
 *
 * The theme's choices live in browser localStorage plus a host-keyed cookie
 * because a client bundle cannot reach `ctx.configForms`; a cookie is keyed by
 * host, not by the random port DSH picks on each launch, which is the
 * durability a restart needs.
 *
 * @module dsh-bluearchive-theme
 */

/** Package id; also the client bundle's module-table id. */
export const PLUGIN_ID = 'dsh-bluearchive-theme';

/** Settings namespace the browser half persists under (documentation only). */
export const SETTINGS_NAMESPACE = 'bluearchive-theme';

/**
 * Compose the host half of the bundle.
 *
 * Intentionally empty — see the module notes. It exists so the Loader has a
 * real `apply` to mount and can report the bundle as loaded.
 */
export function apply() {}
