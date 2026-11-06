// dsh-bluearchive-theme — browser half.
//
// Blue Archive (蔚蓝档案) theme for the DeepSeek Harness Web GUI.
//
// Three cooperating layers, in order:
//
//   1. ctx.theme.overrideTokens() — the full 113-token alias palette from the
//      VitePress Blue Archive theme is applied as a token layer above the
//      built-in light/dark themes, so every DSH surface (menus, code blocks,
//      settings rows, composer) follows the sky-blue / midnight palette.
//      The plugin never changes the user's saved theme preference; the
//      Appearance setting above the card keeps choosing light, dark or system.
//   2. Plain CSS gated on `body[data-ba-theme]` — the parts an alias token
//      cannot express: the sky backdrop, the low-poly pattern, the sidebar
//      mascot, the frosted composer, and the Blue Archive dialog treatment.
//   3. The Settings → General card — the switch, palette, backdrop swatches and
//      ornament toggles.
//
// The bundle is generated: `lib/client.js` is `src/client.js` with the token,
// stylesheet and asset markers replaced. Run `node build.mjs` after editing.
window.__ModuleLoader__.load({
	id: 'dsh-bluearchive-theme',
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

		const React = require('react');
		const runtime = require('react/jsx-runtime');
		// The automatic runtime takes `(type, props, key)`; this plugin writes
		// children as the third argument, so adapt it once here instead of
		// repeating `props.children` in every element.
		const jsx = (type, props, children, key) =>
			runtime.jsx(type, children === undefined ? props : { ...props, children }, key);
		const jsxs = (type, props, children, key) =>
			runtime.jsxs(type, children === undefined ? props : { ...props, children }, key);
		const Fragment = runtime.Fragment;

		//#region identity
		const PLUGIN_ID = 'dsh-bluearchive-theme';
		const SETTINGS_NS = 'bluearchive-theme';
		const STORAGE_KEY = 'dsh.bluearchive-theme.settings.v1';
		const COOKIE_KEY = 'bluearchive-theme';
		const BACKGROUNDS = ['sky', 'classroom', 'sunset', 'twilight'];
		const VARIANTS = ['system', 'light', 'dark'];

		const DEFAULT_SETTINGS = {
			enabled: true,
			variant: 'system',
			background: 'sky',
			mascot: true,
			pattern: true,
			glass: true,
			dialogArt: true,
			clickFx: false,
		};
		//#endregion

		//#region palette
		const ASSETS = __BA_ASSETS__;
		/*__TOKENS__*/
		const TOKEN_OVERRIDES = Object.fromEntries(
			Object.keys(LIGHT).map((name) => [name, { light: LIGHT[name], dark: DARK[name] }]),
		);
		//#endregion

		//#region localized copy
		const ZH = {
			nav: '蔚蓝档案主题',
			title: '蔚蓝档案',
			subtitle: '把基沃托斯的天空搬进 Harness',
			enabled: '启用主题',
			background: '背景',
			backgroundHint: '选择画布背后的基沃托斯风景',
			backgroundTag: '4 个场景',
			sky: '天空',
			classroom: '教室',
			sunset: '黄昏',
			twilight: '星夜',
			decor: '装饰',
			decorHint: '按喜好叠加侧栏、纹理与弹窗装饰',
			mascot: '侧栏立绘',
			mascotDesc: '在侧栏底部显示 Arona / Plana 线稿',
			pattern: '低多边形纹理',
			patternDesc: '叠加 VitePress 低多边形城市纹理',
			glass: '玻璃质感',
			glassDesc: '输入框与浮层使用磨砂玻璃',
			dialogArt: '弹窗插画',
			dialogArtDesc: '设置弹窗顶部使用低多边形插画带',
			clickFx: '点击特效',
			clickFxDesc: '点击时播放蔚蓝档案风格的光环、碎片与拖尾',
			hint: '深浅色跟随上方「外观」设置，其余选项即时生效。',
		};
		const EN = {
			nav: 'Blue Archive',
			title: 'Blue Archive',
			subtitle: 'Kivotos skies, one Harness away',
			enabled: 'Enable theme',
			background: 'Background',
			backgroundHint: 'Choose the Kivotos view behind the canvas',
			backgroundTag: '4 scenes',
			sky: 'Sky',
			classroom: 'Classroom',
			sunset: 'Sunset',
			twilight: 'Twilight',
			decor: 'Ornament',
			decorHint: 'Layer the sidebar, texture and dialog artwork',
			mascot: 'Sidebar mascot',
			mascotDesc: 'Show Arona / Plana line art at the sidebar foot',
			pattern: 'Low-poly texture',
			patternDesc: 'Overlay the VitePress low-poly city texture',
			glass: 'Glass surfaces',
			glassDesc: 'Frosted glass for the composer and popovers',
			dialogArt: 'Dialog artwork',
			dialogArtDesc: 'Use the low-poly band on the settings dialog',
			clickFx: 'Click effects',
			clickFxDesc: 'Play Blue Archive halos, shards and trails on click',
			hint: 'Light and dark follow the Appearance setting above; other options apply instantly.',
		};
		//#endregion

		//#region settings state
		function readCookie(name) {
			const prefix = `${name}=`;
			for (const part of document.cookie.split('; ')) {
				if (part.startsWith(prefix)) {
					try {
						return decodeURIComponent(part.slice(prefix.length));
					} catch {
						return '';
					}
				}
			}
			return '';
		}

		function sanitize(raw) {
			let parsed = {};
			try {
				parsed = raw ? JSON.parse(raw) : {};
			} catch {
				parsed = {};
			}
			const next = { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
			if (!BACKGROUNDS.includes(next.background)) next.background = DEFAULT_SETTINGS.background;
			if (!VARIANTS.includes(next.variant)) next.variant = DEFAULT_SETTINGS.variant;
			for (const key of ['enabled', 'mascot', 'pattern', 'glass', 'dialogArt', 'clickFx']) {
				next[key] = next[key] !== false;
			}
			return next;
		}

		let settings = sanitize(localStorage.getItem(STORAGE_KEY) || readCookie(COOKIE_KEY));
		const listeners = new Set();
		let engine = null;

		function subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		}

		function emit() {
			for (const listener of [...listeners]) {
				try {
					listener();
				} catch (error) {
					console.error('[bluearchive] settings listener failed', error);
				}
			}
		}

		function persist() {
			const raw = JSON.stringify(settings);
			try {
				localStorage.setItem(STORAGE_KEY, raw);
			} catch {
				/* private mode: the cookie below is the fallback */
			}
			document.cookie = `${COOKIE_KEY}=${encodeURIComponent(raw)}; path=/; max-age=31536000; SameSite=Lax`;
		}

		function updateSettings(patch) {
			const previous = settings;
			settings = { ...settings, ...patch };
			persist();
			emit();
			if (engine) engine(previous);
		}

		function useSettings() {
			return React.useSyncExternalStore(subscribe, () => settings, () => settings);
		}
		//#endregion

		//#region small helpers
		const BACKGROUND_ASSET = {
			classroom: 'bgClassroom',
			sunset: 'bgSunset',
			twilight: 'bgTwilight',
		};

		const BG_SWATCH = {
			sky: 'radial-gradient(90px 60px at 72% -10%, #fff 0%, rgba(255,255,255,0) 66%), linear-gradient(165deg, #bfe9ff 0%, #7ccfff 46%, #e9f8ff 100%)',
			classroom: `url("${ASSETS.bgClassroom}")`,
			sunset: `url("${ASSETS.bgSunset}")`,
			twilight: `url("${ASSETS.bgTwilight}")`,
		};
		//#endregion

		//#region stylesheet
		const FONT_CSS = [
			`@font-face{font-family:"Blueaka";src:url("${ASSETS.fontRegular}") format("woff2");font-style:normal;font-weight:400;font-display:swap;}`,
			`@font-face{font-family:"Blueaka";src:url("${ASSETS.fontBold}") format("woff2");font-style:normal;font-weight:700;font-display:swap;}`,
		].join('\n');
		const STYLE_CSS = String.raw`/*__CSS__*/`;
		//#endregion

		//#region settings section
		function BlueArchiveSection(props) {
			const state = useSettings();
			const t = typeof props.t === 'function' ? props.t : (key) => key;
			const set = updateSettings;

			const swatches = BACKGROUNDS.map((id) =>
				jsxs(
					'button',
					{
						type: 'button',
						className: 'ba-swatch',
						'data-bg': id,
						'aria-pressed': state.background === id,
						title: t(id),
						style: {
							backgroundImage: BG_SWATCH[id],
							backgroundSize: id === 'sky' ? 'auto' : 'cover',
							backgroundPosition: 'center',
						},
						onClick: () => set({ background: id }),
					},
					[
						jsx('span', { className: 'ba-swatch-check', 'aria-hidden': 'true' }),
						jsx('span', { className: 'ba-swatch-name' }, t(id)),
					],
					`swatch-${id}`,
				),
			);

			const options = [
				['mascot', 'mascot', 'mascotDesc'],
				['pattern', 'pattern', 'patternDesc'],
				['glass', 'glass', 'glassDesc'],
				['dialogArt', 'dialogArt', 'dialogArtDesc'],
			].map(([key, label, desc]) =>
				jsxs(
					'div',
					{ className: 'ba-option' },
					[
						jsxs('div', { className: 'ba-option-copy' }, [
							jsx('div', { className: 'ba-option-title' }, t(label)),
							jsx('div', { className: 'ba-option-desc' }, t(desc)),
						]),
						jsx(
							'button',
							{
								type: 'button',
								className: 'ba-switch ba-switch-sm',
								role: 'switch',
								'aria-checked': Boolean(state[key]),
								'aria-label': t(label),
								onClick: () => set({ [key]: !state[key] }),
							},
							jsx('span', { className: 'ba-knob', 'aria-hidden': 'true' }),
						),
					],
					`option-${key}`,
				),
			);

			return jsxs(
				'div',
				{ className: 'ba-page', 'data-ba-enabled': state.enabled ? 'true' : 'false' },
				[
					jsxs('header', { className: 'ba-page-head' }, [
						jsx('span', { className: 'ba-logo-plate' }, jsx('img', {
							className: 'ba-logo',
							src: ASSETS.schale,
							alt: '',
							draggable: false,
						})),
						jsxs('div', { className: 'ba-page-copy' }, [
							jsxs('div', { className: 'ba-page-title-row' }, [
								jsx('h2', { className: 'ba-page-title' }, t('title')),
								jsx('span', { className: 'ba-badge' }, 'KIVOTOS'),
							]),
							jsx('p', { className: 'ba-page-sub' }, t('subtitle')),
						]),
						jsx(
							'button',
							{
								type: 'button',
								className: 'ba-switch',
								role: 'switch',
								'aria-checked': state.enabled,
								'aria-label': t('enabled'),
								onClick: () => set({ enabled: !state.enabled }),
							},
							jsx('span', { className: 'ba-knob', 'aria-hidden': 'true' }),
						),
					]),
					jsxs('section', { className: 'ba-block' }, [
						jsxs('div', { className: 'ba-block-head' }, [
							jsxs('div', null, [
								jsx('h3', { className: 'ba-block-title' }, t('background')),
								jsx('p', { className: 'ba-block-desc' }, t('backgroundHint')),
							]),
							jsx('span', { className: 'ba-block-tag' }, t('backgroundTag')),
						]),
						jsx('div', { className: 'ba-grid' }, swatches),
					]),
					jsxs('section', { className: 'ba-block' }, [
						jsxs('div', { className: 'ba-block-head' }, [
							jsxs('div', null, [
								jsx('h3', { className: 'ba-block-title' }, t('decor')),
								jsx('p', { className: 'ba-block-desc' }, t('decorHint')),
							]),
						]),
						jsx('div', { className: 'ba-options' }, options),
					]),
					jsxs('section', { className: 'ba-block ba-block-fx' }, [
						jsxs('div', { className: 'ba-block-head' }, [
							jsxs('div', null, [
								jsx('h3', { className: 'ba-block-title' }, t('clickFx')),
								jsx('p', { className: 'ba-block-desc' }, t('clickFxDesc')),
							]),
							jsx(
								'button',
								{
									type: 'button',
									className: 'ba-switch',
									role: 'switch',
									'aria-checked': Boolean(state.clickFx),
									'aria-label': t('clickFx'),
									onClick: () => set({ clickFx: !state.clickFx }),
								},
								jsx('span', { className: 'ba-knob', 'aria-hidden': 'true' }),
							),
						]),
					]),
					jsx('p', { className: 'ba-page-hint' }, t('hint')),
				],
			);
		}
		//#endregion

		//#region plugin body
		function apply(ctx) {
			const body = document.body;
			const style = document.createElement('style');
			style.dataset.plugin = PLUGIN_ID;
			style.dataset.pluginCss = 'bluearchive';
			style.textContent = `${FONT_CSS}\n${STYLE_CSS}`;
			document.head.appendChild(style);

			let tokenDisposer = null;
			let clickFx = null;
			let disposed = false;

			function applyTokens() {
				if (tokenDisposer) return;
				try {
					tokenDisposer = ctx.theme.overrideTokens(PLUGIN_ID, TOKEN_OVERRIDES);
				} catch (error) {
					body.dataset.baError = `override: ${error && error.message ? error.message : String(error)}`;
					console.error('[bluearchive] token override failed', error);
				}
			}

			function removeTokens() {
				if (!tokenDisposer) return;
				try {
					tokenDisposer();
				} catch {
					/* the service already dropped the layer */
				}
				tokenDisposer = null;
			}

			function clearPaint() {
				for (const key of ['baTheme', 'baBg', 'baMascot', 'baPattern', 'baGlass', 'baDialog', 'baNarrow', 'baClickFx']) {
					delete body.dataset[key];
				}
				for (const name of ['--ba-mascot', '--ba-photo', '--ba-pattern-img', '--ba-deco-img', '--ba-banner-img', '--ba-card-art']) {
					body.style.removeProperty(name);
				}
			}

			function stopClickFx() {
				if (!clickFx) return;
				try {
					clickFx.destroy();
				} catch {
					/* already destroyed */
				}
				clickFx = null;
				delete body.dataset.baClickFx;
			}

			function syncClickFx() {
				if (disposed) return;
				if (!settings.enabled || !settings.clickFx) {
					stopClickFx();
					return;
				}
				if (clickFx) return;
				const Runtime = globalThis.__baClickFX;
				if (typeof Runtime !== 'function') {
					body.dataset.baClickFx = 'missing';
					console.warn('[bluearchive] ba-click-fx runtime is unavailable');
					return;
				}
				try {
					clickFx = new Runtime({
						onError: (error) => console.warn('[bluearchive] ba-click-fx', error),
					});
					body.dataset.baClickFx = 'on';
				} catch (error) {
					clickFx = null;
					body.dataset.baClickFx = 'error';
					console.warn('[bluearchive] ba-click-fx failed to start', error);
				}
			}

			function paint() {
				if (disposed) return;
				if (!settings.enabled) {
					clearPaint();
					return;
				}
				const scheme = ctx.theme.getTheme().active.colorScheme;
				body.dataset.baTheme = scheme;
				body.dataset.baBg = settings.background;
				body.dataset.baMascot = settings.mascot ? 'on' : 'off';
				body.dataset.baPattern = settings.pattern ? 'on' : 'off';
				body.dataset.baGlass = settings.glass ? 'on' : 'off';
				body.dataset.baDialog = settings.dialogArt ? 'on' : 'off';
				body.dataset.baNarrow = document.documentElement.clientWidth < 900 ? 'on' : 'off';
				body.style.setProperty('--ba-mascot', `url("${scheme === 'dark' ? ASSETS.plana : ASSETS.arona}")`);
				body.style.setProperty('--ba-pattern-img', `url("${ASSETS.pattern}")`);
				body.style.setProperty('--ba-deco-img', `url("${ASSETS.deco}")`);
				body.style.setProperty('--ba-banner-img', `url("${ASSETS.banner}")`);
				body.style.setProperty('--ba-card-art', `url("${ASSETS.card}")`);
				const photo = BACKGROUND_ASSET[settings.background];
				body.style.setProperty('--ba-photo', photo ? `url("${ASSETS[photo]}")` : 'none');
			}

			function enable() {
				applyTokens();
			}

			function disable() {
				removeTokens();
				clearPaint();
				stopClickFx();
			}

			function sync(previous) {
				if (disposed) return;
				if (settings.enabled) {
					enable();
				} else if (previous && previous.enabled) {
					disable();
				}
				paint();
				syncClickFx();
			}
			engine = sync;

			const onThemeChange = () => {
				if (!disposed && settings.enabled) paint();
			};

			const media = window.matchMedia('(prefers-color-scheme: dark)');
			if (media.addEventListener) media.addEventListener('change', onThemeChange);
			else if (media.addListener) media.addListener(onThemeChange);

			const onResize = () => {
				if (disposed) return;
				body.dataset.baNarrow = document.documentElement.clientWidth < 900 ? 'on' : 'off';
				if (clickFx && typeof clickFx.resize === 'function') {
					try {
						clickFx.resize();
					} catch {
						/* the runtime rebuilds itself on the next frame */
					}
				}
			};
			window.addEventListener('resize', onResize, { passive: true });

			function boot() {
				if (settings.enabled) applyTokens();
				else removeTokens();
				paint();
				syncClickFx();
			}

			try {
				boot();
			} catch (error) {
				body.dataset.baError = `boot: ${error && error.message ? error.message : String(error)}`;
				console.error('[bluearchive] boot failed', error);
			}

			ctx.on('theme/change', onThemeChange);

			const t = ctx.locale.bind(SETTINGS_NS);
			ctx.slots.inject('settings.section', () =>
				ctx.slots.register(
					{
						name: 'settings.section',
						id: 'bluearchive-theme',
						order: 95,
						label: () => t('nav'),
						locale: SETTINGS_NS,
					},
					BlueArchiveSection,
				),
			);

			let navObserver = null;
			let navRaf = 0;
			const markNavIcon = () => {
				if (disposed) return;
				const label = t('nav');
				const button = [...document.querySelectorAll('[data-shortcut-modal="settings"] nav button')].find(
					(node) => node.textContent.trim() === label,
				);
				if (!button || button.querySelector('.ba-nav-icon')) return;
				const svg = button.querySelector('svg');
				if (!svg) return;
				const icon = document.createElement('img');
				icon.className = 'ba-nav-icon';
				icon.src = ASSETS.schale;
				icon.alt = '';
				icon.draggable = false;
				svg.replaceWith(icon);
				button.dataset.baNav = 'true';
			};
			const scheduleNavIcon = () => {
				if (navRaf || disposed) return;
				navRaf = requestAnimationFrame(() => {
					navRaf = 0;
					markNavIcon();
				});
			};
			if (document.body) {
				navObserver = new MutationObserver(scheduleNavIcon);
				navObserver.observe(document.body, { childList: true, subtree: true });
				scheduleNavIcon();
			}

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh: ZH, en: EN }));

			ctx.effect(() => () => {
				disposed = true;
				engine = null;
				if (navObserver) navObserver.disconnect();
				if (navRaf) cancelAnimationFrame(navRaf);
				if (media.removeEventListener) media.removeEventListener('change', onThemeChange);
				else if (media.removeListener) media.removeListener(onThemeChange);
				window.removeEventListener('resize', onResize);
				stopClickFx();
				removeTokens();
				clearPaint();
				style.remove();
			});
		}

		const inject = ['theme', 'slots', 'locale'];

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
