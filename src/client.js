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
		// The picked wallpaper is megabytes of base64, so it lives in its own key:
		// the settings JSON stays small enough for the cookie fallback, and a
		// quota error can only ever cost the image, never the rest of the settings.
		const WALLPAPER_KEY = 'dsh.bluearchive-theme.wallpaper.v1';
		const WALLPAPER_BLUR_MAX = 24;
		const WALLPAPER_SIDEBAR_BONUS = 5;
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
			globalFont: false,
			wallpaper: null,
			wallpaperBlur: 0,
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
			globalFont: '全局蔚蓝档案字体',
			globalFontDesc: '开启后界面里的所有文字都会换成 Blueaka 字体族；代码块、终端与数学公式保持原样。',
			clickFx: '点击特效',
			clickFxDesc: '点击时播放蔚蓝档案风格的光环、碎片与拖尾',
			wallpaper: '界面背景壁纸',
			wallpaperHint: '选择一张图片作为整个界面的背景，并调节毛玻璃的模糊强度。侧边栏会自动比会话窗口更朦胧。',
			wallpaperTagOn: '已启用',
			wallpaperTagOff: '自定义',
			wallpaperEmpty: '尚未选择图片',
			wallpaperChoose: '选择图片',
			wallpaperChange: '更换图片',
			wallpaperClear: '移除背景',
			blurLabel: '磨砂程度',
			blurChat: '会话',
			blurSidebar: '侧边栏',
			blurHint: '侧边栏自动加深 5 px；数值越大，背景越朦胧。选择上方场景会移除自定义壁纸。',
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
			globalFont: 'Global Blueaka font',
			globalFontDesc: 'Render every label and paragraph in the Blueaka family; code blocks, terminals and math keep their own fonts.',
			clickFx: 'Click effects',
			clickFxDesc: 'Play Blue Archive halos, shards and trails on click',
			wallpaper: 'Wallpaper',
			wallpaperHint: 'Use a picture as the backdrop for the whole UI and tune the frosted blur. The sidebar stays one step hazier than the conversation.',
			wallpaperTagOn: 'Active',
			wallpaperTagOff: 'Custom',
			wallpaperEmpty: 'No image yet',
			wallpaperChoose: 'Choose image',
			wallpaperChange: 'Change image',
			wallpaperClear: 'Remove',
			blurLabel: 'Frost',
			blurChat: 'Chat',
			blurSidebar: 'Sidebar',
			blurHint: 'The sidebar adds 5 px on top; higher values make the backdrop hazier. Picking a scene above removes the custom wallpaper.',
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
			for (const key of ['enabled', 'mascot', 'pattern', 'glass', 'dialogArt', 'clickFx', 'globalFont']) {
				next[key] = next[key] !== false;
			}
			next.wallpaper = typeof next.wallpaper === 'string' && next.wallpaper.startsWith('data:image/') ? next.wallpaper : null;
			const blur = Number(next.wallpaperBlur);
			next.wallpaperBlur = Number.isFinite(blur) ? Math.min(WALLPAPER_BLUR_MAX, Math.max(0, Math.round(blur))) : DEFAULT_SETTINGS.wallpaperBlur;
			return next;
		}

		function readStoredWallpaper() {
			try {
				const value = localStorage.getItem(WALLPAPER_KEY);
				return typeof value === 'string' && value.startsWith('data:image/') ? value : null;
			} catch {
				return null;
			}
		}

		let settings = sanitize(localStorage.getItem(STORAGE_KEY) || readCookie(COOKIE_KEY));
		if (settings.wallpaper === null) settings.wallpaper = readStoredWallpaper();
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
			const { wallpaper, ...rest } = settings;
			const raw = JSON.stringify(rest);
			try {
				localStorage.setItem(STORAGE_KEY, raw);
			} catch {
				/* private mode: the cookie below is the fallback */
			}
			document.cookie = `${COOKIE_KEY}=${encodeURIComponent(raw)}; path=/; max-age=31536000; SameSite=Lax`;
			try {
				if (typeof wallpaper === 'string' && wallpaper.startsWith('data:image/')) localStorage.setItem(WALLPAPER_KEY, wallpaper);
				else localStorage.removeItem(WALLPAPER_KEY);
			} catch (error) {
				// Quota exhausted: the image stays for this tab, the rest is unaffected.
				console.warn('[bluearchive] wallpaper could not be stored', error);
			}
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

		// A wallpaper is stored as a data URL so it survives a reload without a
		// host round-trip. Camera JPEGs are far too large for storage, so the file
		// is decoded once and re-encoded down a ladder until it fits comfortably.
		const WALLPAPER_LADDER = [
			[1600, 0.82],
			[1280, 0.78],
			[1024, 0.72],
			[768, 0.66],
		];
		const WALLPAPER_TARGET_CHARS = 900000;

		function decodeWallpaper(file) {
			if (typeof createImageBitmap === 'function') {
				return createImageBitmap(file).catch(() => loadImageElement(file));
			}
			return loadImageElement(file);
		}

		function loadImageElement(file) {
			return new Promise((resolve, reject) => {
				const url = URL.createObjectURL(file);
				const image = new Image();
				image.onload = () => {
					URL.revokeObjectURL(url);
					resolve(image);
				};
				image.onerror = () => {
					URL.revokeObjectURL(url);
					reject(new Error('image decode failed'));
				};
				image.src = url;
			});
		}

		function drawWallpaper(source, maxEdge, quality) {
			const width = source.width || source.naturalWidth || 0;
			const height = source.height || source.naturalHeight || 0;
			if (width === 0 || height === 0) return '';
			const scale = Math.min(1, maxEdge / Math.max(width, height));
			const canvas = document.createElement('canvas');
			canvas.width = Math.max(1, Math.round(width * scale));
			canvas.height = Math.max(1, Math.round(height * scale));
			const context = canvas.getContext('2d');
			if (!context) return '';
			context.imageSmoothingEnabled = true;
			context.imageSmoothingQuality = 'high';
			context.drawImage(source, 0, 0, canvas.width, canvas.height);
			let url = '';
			try {
				url = canvas.toDataURL('image/webp', quality);
			} catch {
				url = '';
			}
			if (!url.startsWith('data:image/webp')) {
				try {
					url = canvas.toDataURL('image/jpeg', quality);
				} catch {
					url = '';
				}
			}
			return url;
		}

		async function encodeWallpaper(file) {
			const source = await decodeWallpaper(file);
			try {
				let url = '';
				for (const [maxEdge, quality] of WALLPAPER_LADDER) {
					url = drawWallpaper(source, maxEdge, quality);
					if (url && url.length <= WALLPAPER_TARGET_CHARS) break;
				}
				return url.startsWith('data:image/') ? url : '';
			} finally {
				if (typeof source.close === 'function') source.close();
			}
		}
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

			const wallpaper = typeof state.wallpaper === 'string' && state.wallpaper.startsWith('data:image/') ? state.wallpaper : null;
			const blur = Math.min(WALLPAPER_BLUR_MAX, Math.max(0, Number(state.wallpaperBlur) || 0));
			const sidebarBlur = blur + WALLPAPER_SIDEBAR_BONUS;

			// The picker is created on demand inside the click gesture: a detached
			// input still opens the chooser, and nothing has to survive a re-render.
			const onPickWallpaper = () => {
				const input = document.createElement('input');
				input.type = 'file';
				input.accept = 'image/*';
				input.addEventListener('change', async () => {
					const file = input.files && input.files[0];
					if (!file) return;
					try {
						const url = await encodeWallpaper(file);
						if (url) set({ wallpaper: url });
						else console.warn('[bluearchive] wallpaper encode produced no image');
					} catch (error) {
						console.warn('[bluearchive] wallpaper failed', error);
					}
				}, { once: true });
				input.click();
			};

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
						onClick: () => set({ background: id, wallpaper: null }),
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
								jsx('h3', { className: 'ba-block-title' }, t('wallpaper')),
								jsx('p', { className: 'ba-block-desc' }, t('wallpaperHint')),
							]),
							jsx('span', { className: 'ba-block-tag' }, t(wallpaper === null ? 'wallpaperTagOff' : 'wallpaperTagOn')),
						]),
						jsxs('div', { className: 'ba-wall' }, [
							jsx(
								'div',
								{ className: 'ba-wall-thumb', 'data-empty': wallpaper === null },
								wallpaper === null
									? jsx('span', { className: 'ba-wall-empty' }, t('wallpaperEmpty'))
									: jsx('img', { src: wallpaper, alt: '', draggable: false }),
							),
							jsxs('div', { className: 'ba-wall-copy' }, [
								jsxs('div', { className: 'ba-wall-actions' }, [
									jsx(
										'button',
										{ type: 'button', className: 'ba-chip', onClick: onPickWallpaper },
										t(wallpaper === null ? 'wallpaperChoose' : 'wallpaperChange'),
									),
									jsx(
										'button',
										{
											type: 'button',
											className: 'ba-chip',
											disabled: wallpaper === null,
											onClick: () => set({ wallpaper: null }),
										},
										t('wallpaperClear'),
									),
								]),
								jsxs('div', { className: 'ba-wall-slider' }, [
									jsxs('div', { className: 'ba-wall-values' }, [
										jsx('span', null, t('blurLabel')),
										jsx('span', null, `${t('blurChat')} ${blur} px · ${t('blurSidebar')} ${sidebarBlur} px`),
									]),
									jsx('input', {
										type: 'range',
										className: 'ba-wall-range',
										min: 0,
										max: WALLPAPER_BLUR_MAX,
										step: 1,
										value: blur,
										disabled: wallpaper === null,
										'aria-label': t('blurLabel'),
										style: { '--ba-wall-fill': `${(blur / WALLPAPER_BLUR_MAX) * 100}%` },
										onChange: (event) => set({ wallpaperBlur: Number(event.currentTarget.value) }),
									}),
								]),
								jsx('p', { className: 'ba-wall-hint' }, t('blurHint')),
							]),
						]),
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
								jsx('h3', { className: 'ba-block-title' }, t('globalFont')),
								jsx('p', { className: 'ba-block-desc' }, t('globalFontDesc')),
							]),
							jsx(
								'button',
								{
									type: 'button',
									className: 'ba-switch',
									role: 'switch',
									'aria-checked': Boolean(state.globalFont),
									'aria-label': t('globalFont'),
									onClick: () => set({ globalFont: !state.globalFont }),
								},
								jsx('span', { className: 'ba-knob', 'aria-hidden': 'true' }),
							),
						]),
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
				for (const key of ['baTheme', 'baBg', 'baMascot', 'baPattern', 'baGlass', 'baDialog', 'baNarrow', 'baClickFx', 'baWall', 'baFont']) {
					delete body.dataset[key];
				}
				for (const name of ['--ba-mascot', '--ba-photo', '--ba-pattern-img', '--ba-deco-img', '--ba-banner-img', '--ba-card-art', '--ba-wall', '--ba-wall-blur', '--ba-wall-blur-side', '--ba-wall-inset']) {
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
				body.dataset.baFont = settings.globalFont ? 'on' : 'off';
				body.dataset.baNarrow = document.documentElement.clientWidth < 900 ? 'on' : 'off';
				body.style.setProperty('--ba-mascot', `url("${scheme === 'dark' ? ASSETS.plana : ASSETS.arona}")`);
				body.style.setProperty('--ba-pattern-img', `url("${ASSETS.pattern}")`);
				body.style.setProperty('--ba-deco-img', `url("${ASSETS.deco}")`);
				body.style.setProperty('--ba-banner-img', `url("${ASSETS.banner}")`);
				body.style.setProperty('--ba-card-art', `url("${ASSETS.card}")`);
				const photo = BACKGROUND_ASSET[settings.background];
				body.style.setProperty('--ba-photo', photo ? `url("${ASSETS[photo]}")` : 'none');
				const wallpaper = typeof settings.wallpaper === 'string' && settings.wallpaper.startsWith('data:image/') ? settings.wallpaper : null;
				const blur = wallpaper ? Math.min(WALLPAPER_BLUR_MAX, Math.max(0, settings.wallpaperBlur)) : 0;
				body.dataset.baWall = wallpaper ? 'on' : 'off';
				if (wallpaper) {
					body.style.setProperty('--ba-wall', `url("${wallpaper}")`);
					body.style.setProperty('--ba-wall-blur', `${blur}px`);
					body.style.setProperty('--ba-wall-blur-side', `${blur + WALLPAPER_SIDEBAR_BONUS}px`);
					// The layer is oversized so the blur's transparent halo stays off-screen.
					body.style.setProperty('--ba-wall-inset', `${-(blur * 2 + 12)}px`);
				} else {
					body.style.removeProperty('--ba-wall');
					body.style.removeProperty('--ba-wall-blur');
					body.style.removeProperty('--ba-wall-blur-side');
					body.style.removeProperty('--ba-wall-inset');
				}
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

			// Some markdown renderers mark code blocks draggable; Chromium then
			// suppresses text selection inside them. Keep the blocks selectable.
			const unlockCodeBlocks = () => {
				if (disposed) return;
				for (const block of document.querySelectorAll('.md-code-block[draggable]')) {
					block.removeAttribute('draggable');
				}
			};
			let codeObserver = null;
			if (document.body) {
				codeObserver = new MutationObserver(unlockCodeBlocks);
				codeObserver.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ['draggable'],
				});
				unlockCodeBlocks();
			}

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
				if (codeObserver) codeObserver.disconnect();
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
