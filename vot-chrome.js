if (typeof GM_addStyle > "u") {
	function GM_addStyle(p) {
		let m = document.createElement("style");
		m.textContent = p, (document.head || document.documentElement).appendChild(m);
	}
}
(() => {
	var p = {
		"./node_modules/@vot.js/core/dist/client.js": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						Ay: () => VOTClient,
						Pu: () => VOTWorkerClient
					});
					var x = g("./node_modules/@vot.js/shared/dist/data/config.js"), w = g("./node_modules/@vot.js/shared/dist/utils/logger.js"), D = g("./node_modules/@vot.js/shared/dist/protos/yandex.js"), O = g("./node_modules/@vot.js/shared/dist/secure.js"), A = g("./node_modules/@vot.js/shared/dist/utils/utils.js"), F = g("./node_modules/@vot.js/core/dist/protobuf.js"), U = g("./node_modules/@vot.js/core/dist/types/yandex.js"), K = g("./node_modules/@vot.js/core/dist/utils/vot.js"), oe = g("./src/utils/VOTLocalizedError.js"), le = p([oe]);
					oe = (le.then ? (await le)() : le)[0];
					class VOTJSError extends Error {
						data;
						constructor(p, m = void 0) {
							super(p), this.data = m, this.name = "VOTJSError", this.message = p;
						}
					}
					class MinimalClient {
						host;
						schema;
						fetch;
						fetchOpts;
						sessions = {};
						userAgent = x.A.userAgent;
						headers = {
							"User-Agent": this.userAgent,
							Accept: "application/x-protobuf",
							"Accept-Language": "en",
							"Content-Type": "application/x-protobuf",
							Pragma: "no-cache",
							"Cache-Control": "no-cache"
						};
						hostSchemaRe = /(http(s)?):\/\//;
						constructor({ host: p = x.A.host, fetchFn: m = A.u9, fetchOpts: g = {}, headers: _ = {} } = {}) {
							let w = this.hostSchemaRe.exec(p)?.[1];
							this.host = w ? p.replace(`${w}://`, "") : p, this.schema = w ?? "https", this.fetch = m, this.fetchOpts = g, this.headers = {
								...this.headers,
								..._
							};
						}
						async request(p, m, g = {}, _ = "POST") {
							let x = this.getOpts(new Blob([m]), g, _);
							try {
								let m = await this.fetch(`${this.schema}://${this.host}${p}`, x), g = await m.arrayBuffer();
								return {
									success: m.status === 200,
									data: g
								};
							} catch (p) {
								return {
									success: !1,
									data: p?.message
								};
							}
						}
						async requestJSON(p, m = null, g = {}, _ = "POST") {
							let x = this.getOpts(m, {
								"Content-Type": "application/json",
								...g
							}, _);
							try {
								let m = await this.fetch(`${this.schema}://${this.host}${p}`, x), g = await m.json();
								return {
									success: m.status === 200,
									data: g
								};
							} catch (p) {
								return {
									success: !1,
									data: p?.message
								};
							}
						}
						getOpts(p, m = {}, g = "POST") {
							return {
								method: g,
								headers: {
									...this.headers,
									...m
								},
								body: p,
								...this.fetchOpts
							};
						}
						async getSession(p) {
							let m = (0, A.lg)(), g = this.sessions[p];
							if (g && g.timestamp + g.expires > m) return g;
							let { secretKey: _, expires: x, uuid: w } = await this.createSession(p);
							return this.sessions[p] = {
								secretKey: _,
								expires: x,
								timestamp: m,
								uuid: w
							}, this.sessions[p];
						}
						async createSession(p) {
							let m = (0, O.yk)(), g = F.P.encodeSessionRequest(m, p), _ = await this.request("/session/create", g, { "Vtrans-Signature": await (0, O.dD)(g) });
							if (!_.success) throw new VOTJSError("Failed to request create session", _);
							let x = F.P.decodeSessionResponse(_.data);
							return {
								...x,
								uuid: m
							};
						}
					}
					class VOTClient extends MinimalClient {
						hostVOT;
						schemaVOT;
						apiToken;
						requestLang;
						responseLang;
						paths = {
							videoTranslation: "/video-translation/translate",
							videoTranslationFailAudio: "/video-translation/fail-audio-js",
							videoTranslationAudio: "/video-translation/audio",
							videoTranslationCache: "/video-translation/cache",
							videoSubtitles: "/video-subtitles/get-subtitles",
							streamPing: "/stream-translation/ping-stream",
							streamTranslation: "/stream-translation/translate-stream"
						};
						isCustomLink(p) {
							return !!(/\.(m3u8|m4(a|v)|mpd)/.exec(p) ?? /^https:\/\/cdn\.qstv\.on\.epicgames\.com/.exec(p));
						}
						headersVOT = {
							"User-Agent": `vot.js/${x.A.version}`,
							"Content-Type": "application/json",
							Pragma: "no-cache",
							"Cache-Control": "no-cache"
						};
						constructor({ host: p, hostVOT: m = x.A.hostVOT, fetchFn: g, fetchOpts: _, requestLang: w = "en", responseLang: D = "ru", apiToken: O, headers: A } = {}) {
							super({
								host: p,
								fetchFn: g,
								fetchOpts: _,
								headers: A
							});
							let F = this.hostSchemaRe.exec(m)?.[1];
							this.hostVOT = F ? m.replace(`${F}://`, "") : m, this.schemaVOT = F ?? "https", this.requestLang = w, this.responseLang = D, this.apiToken = O;
						}
						get apiTokenHeader() {
							return this.apiToken ? { Authorization: `OAuth ${this.apiToken}` } : {};
						}
						async requestVOT(p, m, g = {}) {
							let _ = this.getOpts(JSON.stringify(m), {
								...this.headersVOT,
								...g
							});
							try {
								let m = await this.fetch(`${this.schemaVOT}://${this.hostVOT}${p}`, _), g = await m.json();
								return {
									success: m.status === 200,
									data: g
								};
							} catch (p) {
								return {
									success: !1,
									data: p?.message
								};
							}
						}
						async translateVideoYAImpl({ videoData: p, requestLang: m = this.requestLang, responseLang: g = this.responseLang, translationHelp: _ = null, headers: D = {}, extraOpts: A = {}, shouldSendFailedAudio: K = !0 }) {
							let { url: le, duration: ue = x.A.defaultDuration } = p, we = await this.getSession("video-translation"), je = F.S.encodeTranslationRequest(le, ue, m, g, _, A), Ie = this.paths.videoTranslation, Be = await (0, O.C0)("Vtrans", we, je, Ie), Ve = A.useLivelyVoice ? this.apiTokenHeader : {}, Ue = await this.request(Ie, je, {
								...Be,
								...Ve,
								...D
							});
							if (!Ue.success) throw new oe.n("requestTranslationFailed");
							let We = F.S.decodeTranslationResponse(Ue.data);
							w.A.log("translateVideo", We);
							let { status: Ke, translationId: qe } = We;
							switch (Ke) {
								case U.v.FAILED: throw We?.message ? new VOTJSError("Yandex couldn't translate video", We) : new oe.n("requestTranslationFailed");
								case U.v.FINISHED:
								case U.v.PART_CONTENT:
									if (!We.url) throw new oe.n("audioNotReceived");
									return {
										translationId: qe,
										translated: !0,
										url: We.url,
										status: Ke,
										remainingTime: We.remainingTime ?? -1
									};
								case U.v.WAITING:
								case U.v.LONG_WAITING: return {
									translationId: qe,
									translated: !1,
									status: Ke,
									remainingTime: We.remainingTime
								};
								case U.v.AUDIO_REQUESTED: return le.startsWith("https://youtu.be/") && K ? (await this.requestVtransFailAudio(le), await this.requestVtransAudio(le, We.translationId, {
									audioFile: new Uint8Array(),
									fileId: U.J.WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME
								}), await this.translateVideoYAImpl({
									videoData: p,
									requestLang: m,
									responseLang: g,
									translationHelp: _,
									headers: D,
									shouldSendFailedAudio: !1
								})) : {
									translationId: qe,
									translated: !1,
									status: Ke,
									remainingTime: We.remainingTime ?? -1
								};
								case U.v.SESSION_REQUIRED: throw new VOTJSError("Yandex auth required to translate video. See docs for more info", We);
								default: throw w.A.error("Unknown response", We), new VOTJSError("Unknown response from Yandex", We);
							}
						}
						async translateVideoVOTImpl({ url: p, videoId: m, service: g, requestLang: _ = this.requestLang, responseLang: x = this.responseLang, headers: w = {}, provider: D = "yandex" }) {
							let O = (0, K.p)(g, m, p), A = await this.requestVOT(this.paths.videoTranslation, {
								provider: D,
								service: O.service,
								video_id: O.videoId,
								from_lang: _,
								to_lang: x,
								raw_video: p
							}, { ...w });
							if (!A.success) throw new oe.n("requestTranslationFailed");
							let F = A.data;
							switch (F.status) {
								case "failed": throw new VOTJSError("Yandex couldn't translate video", F);
								case "success":
									if (!F.translated_url) throw new oe.n("audioNotReceived");
									return {
										translationId: String(F.id),
										translated: !0,
										url: F.translated_url,
										status: 1,
										remainingTime: -1
									};
								case "waiting": return {
									translationId: "",
									translated: !1,
									remainingTime: F.remaining_time,
									status: 2,
									message: F.message
								};
							}
						}
						async requestVtransFailAudio(p) {
							let m = await this.requestJSON(this.paths.videoTranslationFailAudio, JSON.stringify({ video_url: p }), void 0, "PUT");
							if (!m.data || typeof m.data == "string" || m.data.status !== 1) throw new VOTJSError("Failed to request to fake video translation fail audio js", m);
							return m;
						}
						async requestVtransAudio(p, m, g, _, x = {}) {
							let w = await this.getSession("video-translation"), D = F.S.isPartialAudioBuffer(g) ? F.S.encodeTranslationAudioRequest(p, m, g, _) : F.S.encodeTranslationAudioRequest(p, m, g, void 0), A = this.paths.videoTranslationAudio, U = await (0, O.C0)("Vtrans", w, D, A), K = await this.request(A, D, {
								...U,
								...x
							}, "PUT");
							if (!K.success) throw new VOTJSError("Failed to request video translation audio", K);
							return F.S.decodeTranslationAudioResponse(K.data);
						}
						async translateVideoCache({ videoData: p, requestLang: m = this.requestLang, responseLang: g = this.responseLang, headers: _ = {} }) {
							let { url: w, duration: D = x.A.defaultDuration } = p, A = await this.getSession("video-translation"), U = F.S.encodeTranslationCacheRequest(w, D, m, g), K = this.paths.videoTranslationCache, oe = await (0, O.C0)("Vtrans", A, U, K), le = await this.request(K, U, {
								...oe,
								..._
							}, "POST");
							if (!le.success) throw new VOTJSError("Failed to request video translation cache", le);
							return F.S.decodeTranslationCacheResponse(le.data);
						}
						async translateVideo({ videoData: p, requestLang: m = this.requestLang, responseLang: g = this.responseLang, translationHelp: _ = null, headers: x = {}, extraOpts: w = {}, shouldSendFailedAudio: D = !0 }) {
							let { url: O, videoId: A, host: F } = p;
							return this.isCustomLink(O) ? await this.translateVideoVOTImpl({
								url: O,
								videoId: A,
								service: F,
								requestLang: m,
								responseLang: g,
								headers: x,
								provider: w.useLivelyVoice ? "yandex_lively" : "yandex"
							}) : await this.translateVideoYAImpl({
								videoData: p,
								requestLang: m,
								responseLang: g,
								translationHelp: _,
								headers: x,
								extraOpts: w,
								shouldSendFailedAudio: D
							});
						}
						async getSubtitlesYAImpl({ videoData: p, requestLang: m = this.requestLang, headers: g = {} }) {
							let { url: _ } = p, x = await this.getSession("video-translation"), w = F.S.encodeSubtitlesRequest(_, m), D = this.paths.videoSubtitles, A = await (0, O.C0)("Vsubs", x, w, D), U = await this.request(D, w, {
								...A,
								...g
							});
							if (!U.success) throw new VOTJSError("Failed to request video subtitles", U);
							let K = F.S.decodeSubtitlesResponse(U.data), oe = K.subtitles.map((p) => {
								let { language: m, url: g, translatedLanguage: _, translatedUrl: x } = p;
								return {
									language: m,
									url: g,
									translatedLanguage: _,
									translatedUrl: x
								};
							});
							return {
								waiting: K.waiting,
								subtitles: oe
							};
						}
						async getSubtitlesVOTImpl({ url: p, videoId: m, service: g, headers: _ = {} }) {
							let x = (0, K.p)(g, m, p), w = await this.requestVOT(this.paths.videoSubtitles, {
								provider: "yandex",
								service: x.service,
								video_id: x.videoId
							}, _);
							if (!w.success) throw new VOTJSError("Failed to request video subtitles", w);
							let D = w.data, O = D.reduce((p, m) => {
								if (!m.lang_from) return p;
								let g = D.find((p) => p.lang === m.lang_from);
								return g && p.push({
									language: g.lang,
									url: g.subtitle_url,
									translatedLanguage: m.lang,
									translatedUrl: m.subtitle_url
								}), p;
							}, []);
							return {
								waiting: !1,
								subtitles: O
							};
						}
						async getSubtitles({ videoData: p, requestLang: m = this.requestLang, headers: g = {} }) {
							let { url: _, videoId: x, host: w } = p;
							return this.isCustomLink(_) ? await this.getSubtitlesVOTImpl({
								url: _,
								videoId: x,
								service: w,
								headers: g
							}) : await this.getSubtitlesYAImpl({
								videoData: p,
								requestLang: m,
								headers: g
							});
						}
						async pingStream({ pingId: p, headers: m = {} }) {
							let g = await this.getSession("video-translation"), _ = F.S.encodeStreamPingRequest(p), x = this.paths.streamPing, w = await (0, O.C0)("Vtrans", g, _, x), D = await this.request(x, _, {
								...w,
								...m
							});
							if (!D.success) throw new VOTJSError("Failed to request stream ping", D);
							return !0;
						}
						async translateStream({ videoData: p, requestLang: m = this.requestLang, responseLang: g = this.responseLang, headers: _ = {} }) {
							let { url: x } = p;
							if (this.isCustomLink(x)) throw new oe.n("VOTStreamNotSupportedUrl");
							let A = await this.getSession("video-translation"), U = F.S.encodeStreamRequest(x, m, g), K = this.paths.streamTranslation, le = await (0, O.C0)("Vtrans", A, U, K), ue = await this.request(K, U, {
								...le,
								..._
							});
							if (!ue.success) throw new VOTJSError("Failed to request stream translation", ue);
							let we = F.S.decodeStreamResponse(ue.data), je = we.interval;
							switch (je) {
								case D.q8.NO_CONNECTION:
								case D.q8.TRANSLATING: return {
									translated: !1,
									interval: je,
									message: je === D.q8.NO_CONNECTION ? "streamNoConnectionToServer" : "translationTakeFewMinutes"
								};
								case D.q8.STREAMING: return {
									translated: !0,
									interval: je,
									pingId: we.pingId,
									result: we.translatedInfo
								};
								default: throw w.A.error("Unknown response", we), new VOTJSError("Unknown response from Yandex", we);
							}
						}
					}
					class VOTWorkerClient extends VOTClient {
						constructor(p = {}) {
							p.host = p.host ?? x.A.hostWorker, super(p);
						}
						async request(p, m, g = {}, _ = "POST") {
							let x = this.getOpts(JSON.stringify({
								headers: {
									...this.headers,
									...g
								},
								body: Array.from(m)
							}), { "Content-Type": "application/json" }, _);
							try {
								let m = await this.fetch(`${this.schema}://${this.host}${p}`, x), g = await m.arrayBuffer();
								return {
									success: m.status === 200,
									data: g
								};
							} catch (p) {
								return {
									success: !1,
									data: p?.message
								};
							}
						}
						async requestJSON(p, m = null, g = {}, _ = "POST") {
							let x = this.getOpts(JSON.stringify({
								headers: {
									...this.headers,
									"Content-Type": "application/json",
									Accept: "application/json",
									...g
								},
								body: m
							}), {
								Accept: "application/json",
								"Content-Type": "application/json"
							}, _);
							try {
								let m = await this.fetch(`${this.schema}://${this.host}${p}`, x), g = await m.json();
								return {
									success: m.status === 200,
									data: g
								};
							} catch (p) {
								return {
									success: !1,
									data: p?.message
								};
							}
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./node_modules/@vot.js/core/dist/protobuf.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				P: () => YandexSessionProtobuf,
				S: () => YandexVOTProtobuf
			});
			var _ = g("./node_modules/@vot.js/shared/dist/protos/yandex.js");
			class YandexVOTProtobuf {
				static encodeTranslationRequest(p, m, g, x, w, { forceSourceLang: D = !1, wasStream: O = !1, videoTitle: A = "", bypassCache: F = !1, useLivelyVoice: U = !1, firstRequest: K = !0 } = {}) {
					return _.yy.encode({
						url: p,
						firstRequest: K,
						duration: m,
						unknown0: 1,
						language: g,
						forceSourceLang: D,
						unknown1: 0,
						translationHelp: w ?? [],
						responseLanguage: x,
						wasStream: O,
						unknown2: 1,
						unknown3: 2,
						bypassCache: F,
						useLivelyVoice: U,
						videoTitle: A
					}).finish();
				}
				static decodeTranslationResponse(p) {
					return _.AJ.decode(new Uint8Array(p));
				}
				static encodeTranslationCacheRequest(p, m, g, x) {
					return _.Yx.encode({
						url: p,
						duration: m,
						language: g,
						responseLanguage: x
					}).finish();
				}
				static decodeTranslationCacheResponse(p) {
					return _.ZK.decode(new Uint8Array(p));
				}
				static isPartialAudioBuffer(p) {
					return "chunkId" in p;
				}
				static encodeTranslationAudioRequest(p, m, g, x) {
					return x && YandexVOTProtobuf.isPartialAudioBuffer(g) ? _.Y7.encode({
						url: p,
						translationId: m,
						partialAudioInfo: {
							...x,
							audioBuffer: g
						}
					}).finish() : _.Y7.encode({
						url: p,
						translationId: m,
						audioInfo: g
					}).finish();
				}
				static decodeTranslationAudioResponse(p) {
					return _.Wi.decode(new Uint8Array(p));
				}
				static encodeSubtitlesRequest(p, m) {
					return _.P4.encode({
						url: p,
						language: m
					}).finish();
				}
				static decodeSubtitlesResponse(p) {
					return _.LD.decode(new Uint8Array(p));
				}
				static encodeStreamPingRequest(p) {
					return _.kO.encode({ pingId: p }).finish();
				}
				static encodeStreamRequest(p, m, g) {
					return _.Xv.encode({
						url: p,
						language: m,
						responseLanguage: g,
						unknown0: 1,
						unknown1: 0
					}).finish();
				}
				static decodeStreamResponse(p) {
					return _.n_.decode(new Uint8Array(p));
				}
			}
			class YandexSessionProtobuf {
				static encodeSessionRequest(p, m) {
					return _.ls.encode({
						uuid: p,
						module: m
					}).finish();
				}
				static decodeSessionResponse(p) {
					return _.Bv.decode(new Uint8Array(p));
				}
			}
		},
		"./node_modules/@vot.js/core/dist/types/service.js": (p, m, g) => {
			"use strict";
			g.d(m, { r: () => _ });
			var _;
			(function(p) {
				p.custom = "custom", p.directlink = "custom", p.youtube = "youtube", p.piped = "piped", p.invidious = "invidious", p.vk = "vk", p.nine_gag = "nine_gag", p.gag = "nine_gag", p.twitch = "twitch", p.proxitok = "proxitok", p.tiktok = "tiktok", p.vimeo = "vimeo", p.xvideos = "xvideos", p.pornhub = "pornhub", p.twitter = "twitter", p.x = "twitter", p.rumble = "rumble", p.facebook = "facebook", p.rutube = "rutube", p.coub = "coub", p.bilibili = "bilibili", p.mail_ru = "mailru", p.mailru = "mailru", p.bitchute = "bitchute", p.eporner = "eporner", p.peertube = "peertube", p.dailymotion = "dailymotion", p.trovo = "trovo", p.yandexdisk = "yandexdisk", p.ok_ru = "okru", p.okru = "okru", p.googledrive = "googledrive", p.bannedvideo = "bannedvideo", p.weverse = "weverse", p.newgrounds = "newgrounds", p.egghead = "egghead", p.youku = "youku", p.archive = "archive", p.kodik = "kodik", p.patreon = "patreon", p.reddit = "reddit", p.kick = "kick", p.apple_developer = "apple_developer", p.appledeveloper = "apple_developer", p.poketube = "poketube", p.epicgames = "epicgames", p.odysee = "odysee", p.coursehunterLike = "coursehunterLike", p.sap = "sap", p.watchpornto = "watchpornto", p.linkedin = "linkedin", p.ricktube = "ricktube", p.incestflix = "incestflix", p.porntn = "porntn", p.dzen = "dzen", p.cloudflarestream = "cloudflarestream", p.loom = "loom", p.rtnews = "rtnews", p.bitview = "bitview", p.thisvid = "thisvid", p.ign = "ign", p.bunkr = "bunkr", p.imdb = "imdb", p.telegram = "telegram";
			})(_ ||= {});
		},
		"./node_modules/@vot.js/core/dist/types/yandex.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				J: () => x,
				v: () => _
			});
			var _;
			(function(p) {
				p[p.FAILED = 0] = "FAILED", p[p.FINISHED = 1] = "FINISHED", p[p.WAITING = 2] = "WAITING", p[p.LONG_WAITING = 3] = "LONG_WAITING", p[p.PART_CONTENT = 5] = "PART_CONTENT", p[p.AUDIO_REQUESTED = 6] = "AUDIO_REQUESTED", p[p.SESSION_REQUIRED = 7] = "SESSION_REQUIRED";
			})(_ ||= {});
			var x;
			(function(p) {
				p.WEB_API_VIDEO_SRC_FROM_IFRAME = "web_api_video_src_from_iframe", p.WEB_API_VIDEO_SRC = "web_api_video_src", p.WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME = "web_api_get_all_generating_urls_data_from_iframe", p.WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME_TMP_EXP = "web_api_get_all_generating_urls_data_from_iframe_tmp_exp", p.WEB_API_REPLACED_FETCH_INSIDE_IFRAME = "web_api_replaced_fetch_inside_iframe", p.ANDROID_API = "android_api", p.WEB_API_SLOW = "web_api_slow", p.WEB_API_STEAL_SIG_AND_N = "web_api_steal_sig_and_n", p.WEB_API_COMBINED = "web_api_get_all_generating_urls_data_from_iframe,web_api_steal_sig_and_n";
			})(x ||= {});
		},
		"./node_modules/@vot.js/core/dist/utils/videoData.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				$: () => _,
				A: () => VideoDataError
			});
			class VideoDataError extends Error {
				constructor(p) {
					super(p), this.name = "VideoDataError", this.message = p;
				}
			}
			let _ = /(file:\/\/(\/)?|(http(s)?:\/\/)(127\.0\.0\.1|localhost|192\.168\.(\d){1,3}\.(\d){1,3}))/;
		},
		"./node_modules/@vot.js/core/dist/utils/vot.js": (p, m, g) => {
			"use strict";
			g.d(m, { p: () => convertVOT });
			var _ = g("./node_modules/@vot.js/core/dist/types/service.js");
			function convertVOT(p, m, g) {
				return p === _.r.patreon ? {
					service: "mux",
					videoId: new URL(g).pathname.slice(1)
				} : {
					service: p,
					videoId: m
				};
			}
		},
		"./node_modules/@vot.js/ext/dist/client.js": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						A: () => VOTClient,
						P: () => VOTWorkerClient
					});
					var x = g("./node_modules/@vot.js/core/dist/client.js"), w = g("./node_modules/@vot.js/shared/dist/secure.js"), D = p([x]);
					x = (D.then ? (await D)() : D)[0];
					class VOTClient extends x.Ay {
						constructor(p) {
							super(p), this.headers = {
								...w.MG,
								...this.headers
							};
						}
					}
					class VOTWorkerClient extends x.Pu {
						constructor(p) {
							super(p), this.headers = {
								...w.MG,
								...this.headers
							};
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./node_modules/@vot.js/ext/dist/data/sites.js": (p, m, g) => {
			"use strict";
			g.d(m, { A: () => D });
			var _ = g("./node_modules/@vot.js/core/dist/types/service.js"), x = g("./node_modules/@vot.js/shared/dist/data/alternativeUrls.js"), w = g("./node_modules/@vot.js/ext/dist/types/service.js");
			let D = [
				{
					additionalData: "mobile",
					host: _.r.youtube,
					url: "https://youtu.be/",
					match: /^m.youtube.com$/,
					selector: ".player-container",
					needExtraData: !0
				},
				{
					host: _.r.youtube,
					url: "https://youtu.be/",
					match: /^(www.)?youtube(-nocookie|kids)?.com$/,
					selector: ".html5-video-container:not(#inline-player *)",
					needExtraData: !0
				},
				{
					host: _.r.invidious,
					url: "https://youtu.be/",
					match: x.Xm,
					selector: "#player",
					needBypassCSP: !0
				},
				{
					host: _.r.piped,
					url: "https://youtu.be/",
					match: x.Jo,
					selector: ".shaka-video-container",
					needBypassCSP: !0
				},
				{
					host: _.r.poketube,
					url: "https://youtu.be/",
					match: x.sx,
					selector: ".video-player-container"
				},
				{
					host: _.r.ricktube,
					url: "https://youtu.be/",
					match: x.My,
					selector: "#oframeplayer > pjsdiv:has(video)"
				},
				{
					additionalData: "mobile",
					host: _.r.vk,
					url: "https://vk.com/video?z=",
					match: [/^m.vk.(com|ru)$/, /^m.vkvideo.ru$/],
					selector: "vk-video-player",
					shadowRoot: !0,
					needExtraData: !0
				},
				{
					additionalData: "clips",
					host: _.r.vk,
					url: "https://vk.com/video?z=",
					match: /^(www.|m.)?vk.(com|ru)$/,
					selector: "div[data-testid=\"clipcontainer-video\"]",
					needExtraData: !0
				},
				{
					host: _.r.vk,
					url: "https://vk.com/video?z=",
					match: [/^(www.|m.)?vk.(com|ru)$/, /^(www.|m.)?vkvideo.ru$/],
					selector: ".videoplayer_media",
					needExtraData: !0
				},
				{
					host: _.r.nine_gag,
					url: "https://9gag.com/gag/",
					match: /^9gag.com$/,
					selector: ".video-post",
					needExtraData: !0
				},
				{
					host: _.r.twitch,
					url: "https://twitch.tv/",
					match: [
						/^m.twitch.tv$/,
						/^(www.)?twitch.tv$/,
						/^clips.twitch.tv$/,
						/^player.twitch.tv$/
					],
					needExtraData: !0,
					selector: ".video-ref, main > div > section > div > div > div"
				},
				{
					host: _.r.proxitok,
					url: "https://www.tiktok.com/",
					match: x.TP,
					selector: ".column.has-text-centered"
				},
				{
					host: _.r.tiktok,
					url: "https://www.tiktok.com/",
					match: /^(www.)?tiktok.com$/,
					selector: null
				},
				{
					host: w.Q.douyin,
					url: "https://www.douyin.com/",
					match: /^(www.)?douyin.com/,
					selector: ".xg-video-container",
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: _.r.vimeo,
					url: "https://vimeo.com/",
					match: /^vimeo.com$/,
					needExtraData: !0,
					selector: ".player"
				},
				{
					host: _.r.vimeo,
					url: "https://player.vimeo.com/",
					match: /^player.vimeo.com$/,
					additionalData: "embed",
					needExtraData: !0,
					needBypassCSP: !0,
					selector: ".player"
				},
				{
					host: _.r.xvideos,
					url: "https://www.xvideos.com/",
					match: [
						/^(www.)?xvideos(-ar)?.com$/,
						/^(www.)?xvideos(\d\d\d).com$/,
						/^(www.)?xv-ru.com$/
					],
					selector: "#hlsplayer",
					needBypassCSP: !0
				},
				{
					host: _.r.pornhub,
					url: "https://rt.pornhub.com/view_video.php?viewkey=",
					match: /^[a-z]+.pornhub.(com|org)$/,
					selector: ".mainPlayerDiv > .video-element-wrapper-js > div",
					eventSelector: ".mgp_eventCatcher"
				},
				{
					additionalData: "embed",
					host: _.r.pornhub,
					url: "https://rt.pornhub.com/view_video.php?viewkey=",
					match: (p) => /^[a-z]+.pornhub.(com|org)$/.exec(p.host) && p.pathname.startsWith("/embed/"),
					selector: "#player"
				},
				{
					host: _.r.twitter,
					url: "https://twitter.com/i/status/",
					match: /^(twitter|x).com$/,
					selector: "div[data-testid=\"videoComponent\"] > div:nth-child(1) > div",
					eventSelector: "div[data-testid=\"videoPlayer\"]",
					needBypassCSP: !0
				},
				{
					host: _.r.rumble,
					url: "https://rumble.com/",
					match: /^rumble.com$/,
					selector: "#videoPlayer > .videoPlayer-Rumble-cls > div"
				},
				{
					host: _.r.facebook,
					url: "https://facebook.com/",
					match: (p) => p.host.includes("facebook.com") && p.pathname.includes("/videos/"),
					selector: "div[role=\"main\"] div[data-pagelet$=\"video\" i]",
					needBypassCSP: !0
				},
				{
					additionalData: "reels",
					host: _.r.facebook,
					url: "https://facebook.com/",
					match: (p) => p.host.includes("facebook.com") && p.pathname.includes("/reel/"),
					selector: "div[role=\"main\"]",
					needBypassCSP: !0
				},
				{
					host: _.r.rutube,
					url: "https://rutube.ru/video/",
					match: /^rutube.ru$/,
					selector: ".video-player > div > div > div:nth-child(2)"
				},
				{
					additionalData: "embed",
					host: _.r.rutube,
					url: "https://rutube.ru/video/",
					match: /^rutube.ru$/,
					selector: "#app > div > div"
				},
				{
					host: _.r.bilibili,
					url: "https://www.bilibili.com/",
					match: /^(www|m|player).bilibili.com$/,
					selector: ".bpx-player-video-wrap"
				},
				{
					additionalData: "old",
					host: _.r.bilibili,
					url: "https://www.bilibili.com/",
					match: /^(www|m).bilibili.com$/,
					selector: null
				},
				{
					host: _.r.mailru,
					url: "https://my.mail.ru/",
					match: /^my.mail.ru$/,
					selector: "#b-video-wrapper"
				},
				{
					host: _.r.bitchute,
					url: "https://www.bitchute.com/video/",
					match: /^(www.)?bitchute.com$/,
					selector: ".video-js"
				},
				{
					host: _.r.eporner,
					url: "https://www.eporner.com/",
					match: /^(www.)?eporner.com$/,
					selector: ".vjs-v7"
				},
				{
					host: _.r.peertube,
					url: "stub",
					match: x.fV,
					selector: ".vjs-v7"
				},
				{
					host: _.r.dailymotion,
					url: "https://dai.ly/",
					match: /^geo([\d]+)?.dailymotion.com$/,
					selector: ".player"
				},
				{
					host: _.r.trovo,
					url: "https://trovo.live/s/",
					match: /^trovo.live$/,
					selector: ".player-video"
				},
				{
					host: _.r.yandexdisk,
					url: "https://yadi.sk/",
					match: /^disk.yandex.(ru|kz|com(\.(am|ge|tr))?|by|az|co\.il|ee|lt|lv|md|net|tj|tm|uz)$/,
					selector: ".video-player__player > div:nth-child(1)",
					eventSelector: ".video-player__player",
					needBypassCSP: !0,
					needExtraData: !0
				},
				{
					host: _.r.okru,
					url: "https://ok.ru/video/",
					match: /^ok.ru$/,
					selector: "vk-video-player",
					shadowRoot: !0
				},
				{
					host: _.r.googledrive,
					url: "https://drive.google.com/file/d/",
					match: /^youtube.googleapis.com$/,
					selector: ".html5-video-container"
				},
				{
					host: _.r.bannedvideo,
					url: "https://madmaxworld.tv/watch?id=",
					match: /^(www.)?banned.video|madmaxworld.tv$/,
					selector: ".vjs-v7",
					needExtraData: !0
				},
				{
					host: _.r.weverse,
					url: "https://weverse.io/",
					match: /^weverse.io$/,
					selector: ".webplayer-internal-source-wrapper",
					needExtraData: !0
				},
				{
					host: _.r.newgrounds,
					url: "https://www.newgrounds.com/",
					match: /^(www.)?newgrounds.com$/,
					selector: ".ng-video-player"
				},
				{
					host: _.r.egghead,
					url: "https://egghead.io/",
					match: /^egghead.io$/,
					selector: ".cueplayer-react-video-holder"
				},
				{
					host: _.r.youku,
					url: "https://v.youku.com/",
					match: /^v.youku.com$/,
					selector: "#ykPlayer"
				},
				{
					host: _.r.archive,
					url: "https://archive.org/details/",
					match: /^archive.org$/,
					selector: ".jw-media"
				},
				{
					host: _.r.kodik,
					url: "stub",
					match: /^kodik.(info|biz|cc)$/,
					selector: ".fp-player",
					needExtraData: !0
				},
				{
					host: _.r.patreon,
					url: "stub",
					match: /^(www.)?patreon.com$/,
					selector: "div[data-tag=\"post-card\"] div[elevation=\"subtle\"] > div > div > div > div",
					needExtraData: !0
				},
				{
					additionalData: "old",
					host: _.r.reddit,
					url: "stub",
					match: /^old.reddit.com$/,
					selector: ".reddit-video-player-root",
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: _.r.reddit,
					url: "stub",
					match: /^(www.|new.)?reddit.com$/,
					selector: "div[slot=post-media-container]",
					shadowRoot: !0,
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: _.r.kick,
					url: "https://kick.com/",
					match: /^kick.com$/,
					selector: "#injected-embedded-channel-player-video > div",
					needExtraData: !0
				},
				{
					host: _.r.appledeveloper,
					url: "https://developer.apple.com/",
					match: /^developer.apple.com$/,
					selector: ".developer-video-player",
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: _.r.epicgames,
					url: "https://dev.epicgames.com/community/learning/",
					match: /^dev.epicgames.com$/,
					selector: ".vjs-v7",
					needExtraData: !0
				},
				{
					host: _.r.odysee,
					url: "stub",
					match: /^odysee.com$/,
					selector: ".vjs-v7",
					needExtraData: !0
				},
				{
					host: _.r.coursehunterLike,
					url: "stub",
					match: x.r,
					selector: "#oframeplayer > pjsdiv:has(video)",
					needExtraData: !0
				},
				{
					host: _.r.sap,
					url: "https://learning.sap.com/courses/",
					match: /^learning.sap.com$/,
					selector: ".playkit-container",
					eventSelector: ".playkit-player",
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: w.Q.udemy,
					url: "https://www.udemy.com/",
					match: /udemy.com$/,
					selector: "div[data-purpose=\"curriculum-item-viewer-content\"] > section > div > div > div > div:nth-of-type(2)",
					needExtraData: !0
				},
				{
					host: w.Q.coursera,
					url: "https://www.coursera.org/",
					match: /coursera.org$/,
					selector: ".vjs-v8",
					needExtraData: !0
				},
				{
					host: _.r.watchpornto,
					url: "https://watchporn.to/",
					match: /^watchporn.to$/,
					selector: ".fp-player"
				},
				{
					host: _.r.linkedin,
					url: "https://www.linkedin.com/learning/",
					match: /^(www.)?linkedin.com$/,
					selector: ".vjs-v7",
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: _.r.incestflix,
					url: "https://www.incestflix.net/watch/",
					match: /^(www.)?incestflix.(net|to|com)$/,
					selector: "#incflix-stream",
					needExtraData: !0
				},
				{
					host: _.r.porntn,
					url: "https://porntn.com/videos/",
					match: /^porntn.com$/,
					selector: ".fp-player",
					needExtraData: !0
				},
				{
					host: _.r.dzen,
					url: "https://dzen.ru/video/watch/",
					match: /^dzen.ru$/,
					selector: ".zen-ui-video-video-player"
				},
				{
					host: _.r.cloudflarestream,
					url: "stub",
					match: /^(watch|embed|iframe|customer-[^.]+).cloudflarestream.com$/,
					selector: null
				},
				{
					host: _.r.loom,
					url: "https://www.loom.com/share/",
					match: /^(www.)?loom.com$/,
					selector: ".VideoLayersContainer",
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: w.Q.artstation,
					url: "https://www.artstation.com/learning/",
					match: /^(www.)?artstation.com$/,
					selector: ".vjs-v7",
					needExtraData: !0
				},
				{
					host: _.r.rtnews,
					url: "https://www.rt.com/",
					match: /^(www.)?rt.com$/,
					selector: ".jw-media",
					needExtraData: !0
				},
				{
					host: _.r.bitview,
					url: "https://www.bitview.net/watch?v=",
					match: /^(www.)?bitview.net$/,
					selector: ".vlScreen",
					needExtraData: !0
				},
				{
					host: w.Q.kickstarter,
					url: "https://www.kickstarter.com/",
					match: /^(www.)?kickstarter.com/,
					selector: ".ksr-video-player",
					needExtraData: !0
				},
				{
					host: _.r.thisvid,
					url: "https://thisvid.com/",
					match: /^(www.)?thisvid.com$/,
					selector: ".fp-player"
				},
				{
					additionalData: "regional",
					host: _.r.ign,
					url: "https://de.ign.com/",
					match: /^(\w{2}.)?ign.com$/,
					needExtraData: !0,
					selector: ".video-container"
				},
				{
					host: _.r.ign,
					url: "https://www.ign.com/",
					match: /^(www.)?ign.com$/,
					selector: ".player",
					needExtraData: !0
				},
				{
					host: _.r.bunkr,
					url: "https://bunkr.site/",
					match: /^bunkr\.(site|black|cat|media|red|site|ws|org|s[kiu]|c[ir]|fi|p[hks]|ru|la|is|to|a[cx])$/,
					needExtraData: !0,
					selector: ".plyr__video-wrapper"
				},
				{
					host: _.r.imdb,
					url: "https://www.imdb.com/video/",
					match: /^(www\.)?imdb\.com$/,
					selector: ".jw-media"
				},
				{
					host: _.r.telegram,
					url: "https://t.me/",
					match: (p) => /^web\.telegram\.org$/.test(p.hostname) && p.pathname.startsWith("/k"),
					selector: ".ckin__player"
				},
				{
					host: w.Q.oraclelearn,
					url: "https://mylearn.oracle.com/ou/course/",
					match: /^mylearn\.oracle\.com/,
					selector: ".vjs-v7",
					needExtraData: !0,
					needBypassCSP: !0
				},
				{
					host: w.Q.deeplearningai,
					url: "https://learn.deeplearning.ai/courses/",
					match: /^learn(-dev|-staging)?\.deeplearning\.ai/,
					selector: ".lesson-video-player",
					needExtraData: !0
				},
				{
					host: w.Q.netacad,
					url: "https://www.netacad.com/",
					match: /^(www\.)?netacad\.com/,
					selector: ".vjs-v8",
					needExtraData: !0
				},
				{
					host: _.r.custom,
					url: "stub",
					match: (p) => /([^.]+)\.(mp4|webm)/.test(p.pathname),
					rawResult: !0
				}
			];
		},
		"./node_modules/@vot.js/ext/dist/helpers/base.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				a: () => VideoHelperError,
				q: () => BaseHelper
			});
			var _ = g("./node_modules/@vot.js/shared/dist/utils/utils.js");
			class VideoHelperError extends Error {
				constructor(p) {
					super(p), this.name = "VideoHelper", this.message = p;
				}
			}
			class BaseHelper {
				API_ORIGIN = window.location.origin;
				fetch;
				extraInfo;
				referer;
				origin;
				service;
				video;
				language;
				constructor({ fetchFn: p = _.u9, extraInfo: m = !0, referer: g = document.referrer ?? `${window.location.origin}/`, origin: x = window.location.origin, service: w, video: D, language: O = "en" } = {}) {
					this.fetch = p, this.extraInfo = m, this.referer = g, this.origin = /^(http(s)?):\/\//.test(String(x)) ? x : window.location.origin, this.service = w, this.video = D, this.language = O;
				}
				async getVideoData(p) {}
				async getVideoId(p) {}
				returnBaseData(p) {
					if (this.service) return {
						url: this.service.url + p,
						videoId: p,
						host: this.service.host,
						duration: void 0
					};
				}
			}
		},
		"./node_modules/@vot.js/ext/dist/helpers/index.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				JW: () => ue,
				Ay: () => VideoHelper
			});
			var _ = g("./node_modules/@vot.js/core/dist/types/service.js"), x = g("./node_modules/@vot.js/ext/dist/types/service.js"), w = g("./node_modules/@vot.js/ext/dist/helpers/base.js"), D = g("./node_modules/@vot.js/shared/dist/utils/logger.js");
			class AppleDeveloperHelper extends w.q {
				API_ORIGIN = "https://developer.apple.com";
				async getVideoData(p) {
					try {
						let p = document.querySelector("meta[property='og:video']")?.content;
						if (!p) throw new w.a("Failed to find content url");
						return { url: p };
					} catch (m) {
						D.A.error(`Failed to get apple developer video data by video ID: ${p}`, m.message);
						return;
					}
				}
				async getVideoId(p) {
					return /videos\/play\/([^/]+)\/([\d]+)/.exec(p.pathname)?.[0];
				}
			}
			class ArchiveHelper extends w.q {
				async getVideoId(p) {
					return /(details|embed)\/([^/]+)/.exec(p.pathname)?.[2];
				}
			}
			var O = g("./node_modules/@vot.js/shared/dist/utils/utils.js");
			class ArtstationHelper extends w.q {
				API_ORIGIN = "https://www.artstation.com/api/v2/learning";
				getCSRFToken() {
					return document.querySelector("meta[name=\"public-csrf-token\"]")?.content;
				}
				async getCourseInfo(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/courses/${p}/autoplay.json`, {
							method: "POST",
							headers: { "PUBLIC-CSRF-TOKEN": this.getCSRFToken() }
						});
						return await m.json();
					} catch (m) {
						return D.A.error(`Failed to get artstation course info by courseId: ${p}.`, m.message), !1;
					}
				}
				async getVideoUrl(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/quicksilver/video_url.json?chapter_id=${p}`), g = await m.json();
						return g.url.replace("qsep://", "https://");
					} catch (m) {
						return D.A.error(`Failed to get artstation video url by chapterId: ${p}.`, m.message), !1;
					}
				}
				async getVideoData(p) {
					let [, m, , , g] = p.split("/"), _ = await this.getCourseInfo(m);
					if (!_) return;
					let x = _.chapters.find((p) => p.hash_id === g);
					if (!x) return;
					let w = await this.getVideoUrl(x.id);
					if (!w) return;
					let { title: D, duration: A, subtitles: F } = x, U = F.filter((p) => p.format === "vtt").map((p) => ({
						language: (0, O.ec)(p.locale),
						source: "artstation",
						format: "vtt",
						url: p.file_url
					}));
					return {
						url: w,
						title: D,
						duration: A,
						subtitles: U
					};
				}
				async getVideoId(p) {
					return /courses\/(\w{3,5})\/([^/]+)\/chapters\/(\w{3,5})/.exec(p.pathname)?.[0];
				}
			}
			class BannedVideoHelper extends w.q {
				API_ORIGIN = "https://api.banned.video";
				async getVideoInfo(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/graphql`, {
							method: "POST",
							body: JSON.stringify({
								operationName: "GetVideo",
								query: "query GetVideo($id: String!) {\n            getVideo(id: $id) {\n              title\n              description: summary\n              duration: videoDuration\n              videoUrl: directUrl\n              isStream: live\n            }\n          }",
								variables: { id: p }
							}),
							headers: {
								"User-Agent": "bannedVideoFrontEnd",
								"apollographql-client-name": "banned-web",
								"apollographql-client-version": "1.3",
								"content-type": "application/json"
							}
						});
						return await m.json();
					} catch (m) {
						return console.error(`Failed to get bannedvideo video info by videoId: ${p}.`, m.message), !1;
					}
				}
				async getVideoData(p) {
					let m = await this.getVideoInfo(p);
					if (!m) return;
					let { videoUrl: g, duration: _, isStream: x, description: w, title: D } = m.data.getVideo;
					return {
						url: g,
						duration: _,
						isStream: x,
						title: D,
						description: w
					};
				}
				async getVideoId(p) {
					return p.searchParams.get("id") ?? void 0;
				}
			}
			class BilibiliHelper extends w.q {
				async getVideoId(p) {
					let m = /bangumi\/play\/([^/]+)/.exec(p.pathname)?.[0];
					if (m) return m;
					let g = p.searchParams.get("bvid");
					if (g) return `video/${g}`;
					let _ = /video\/([^/]+)/.exec(p.pathname)?.[0];
					return _ && p.searchParams.get("p") !== null && (_ += `/?p=${p.searchParams.get("p")}`), _;
				}
			}
			class BitchuteHelper extends w.q {
				async getVideoId(p) {
					return /(video|embed)\/([^/]+)/.exec(p.pathname)?.[2];
				}
			}
			class BitviewHelper extends w.q {
				async getVideoData(p) {
					try {
						let p = document.querySelector(".vlScreen > video")?.src;
						if (!p) throw new w.a("Failed to find video URL");
						return { url: p };
					} catch (m) {
						D.A.error(`Failed to get Bitview data by videoId: ${p}`, m.message);
						return;
					}
				}
				async getVideoId(p) {
					return p.searchParams.get("v");
				}
			}
			class BunkrHelper extends w.q {
				async getVideoData(p) {
					let m = document.querySelector("#player > source[type=\"video/mp4\"]")?.src;
					if (m) return { url: m };
				}
				async getVideoId(p) {
					return /\/f\/([^/]+)/.exec(p.pathname)?.[1];
				}
			}
			class CloudflareStreamHelper extends w.q {
				async getVideoId(p) {
					return p.pathname + p.search;
				}
			}
			class CoursehunterLikeHelper extends w.q {
				API_ORIGIN = this.origin ?? "https://coursehunter.net";
				async getCourseId() {
					let p = window.course_id;
					return p === void 0 ? document.querySelector("input[name=\"course_id\"]")?.value : String(p);
				}
				async getLessonsData(p) {
					let m = window.lessons;
					if (m?.length) return m;
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/api/v1/course/${p}/lessons`);
						return await m.json();
					} catch (m) {
						D.A.error(`Failed to get CoursehunterLike lessons data by courseId: ${p}, because ${m.message}`);
						return;
					}
				}
				getLessondId(p) {
					let m = p.split("?lesson=")?.[1];
					if (m) return +m;
					let g = document.querySelector(".lessons-item_active");
					return m = g?.dataset?.index, m ? +m : 1;
				}
				async getVideoData(p) {
					let m = await this.getCourseId();
					if (!m) return;
					let g = await this.getLessonsData(m);
					if (!g) return;
					let _ = this.getLessondId(p), x = g?.[_ - 1], { file: w, duration: D, title: A } = x;
					if (w) return {
						url: (0, O.fl)(w),
						duration: D,
						title: A
					};
				}
				async getVideoId(p) {
					let m = /course\/([^/]+)/.exec(p.pathname)?.[0];
					return m ? m + p.search : void 0;
				}
			}
			class VideoJSHelper extends w.q {
				SUBTITLE_SOURCE = "videojs";
				SUBTITLE_FORMAT = "vtt";
				static getPlayer() {
					return document.querySelector(".video-js")?.player;
				}
				getVideoDataByPlayer(p) {
					try {
						let m = VideoJSHelper.getPlayer();
						if (!m) throw Error(`Video player doesn't have player option, videoId ${p}`);
						let g = m.duration(), _ = Array.isArray(m.currentSources) ? m.currentSources : m.getCache()?.sources, { tracks_: x } = m.textTracks(), w = _.find((p) => p.type === "video/mp4" || p.type === "video/webm");
						if (!w) throw Error(`Failed to find video url for videoID ${p}`);
						let D = x.filter((p) => p.src && p.kind !== "metadata").map((p) => ({
							language: (0, O.ec)(p.language),
							source: this.SUBTITLE_SOURCE,
							format: this.SUBTITLE_FORMAT,
							url: p.src
						}));
						return {
							url: w.src,
							duration: g,
							subtitles: D
						};
					} catch (p) {
						D.A.error("Failed to get videojs video data", p.message);
						return;
					}
				}
			}
			var A = g("./node_modules/@vot.js/shared/dist/data/consts.js");
			class CourseraHelper extends VideoJSHelper {
				API_ORIGIN = "https://www.coursera.org/api";
				SUBTITLE_SOURCE = "coursera";
				async getCourseData(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/onDemandCourses.v1/${p}`), g = await m.json();
						return g?.elements?.[0];
					} catch (m) {
						D.A.error(`Failed to get course data by courseId: ${p}`, m.message);
						return;
					}
				}
				static getPlayer() {
					return VideoJSHelper.getPlayer();
				}
				async getVideoData(p) {
					let m = this.getVideoDataByPlayer(p);
					if (!m) return;
					let { options_: g } = CourseraHelper.getPlayer() ?? {};
					!m.subtitles?.length && g && (m.subtitles = g.tracks.map((p) => ({
						url: p.src,
						language: (0, O.ec)(p.srclang),
						source: this.SUBTITLE_SOURCE,
						format: this.SUBTITLE_FORMAT
					})));
					let _ = g?.courseId;
					if (!_) return m;
					let x = "en", w = await this.getCourseData(_);
					if (w) {
						let { primaryLanguageCodes: [p] } = w;
						x = p ? (0, O.ec)(p) : "en";
					}
					A.xm.includes(x) || (x = "en");
					let F = m.subtitles.find((p) => p.language === x) ?? m.subtitles?.[0], U = F?.url;
					U || D.A.warn("Failed to find any subtitle file");
					let { url: K, duration: oe } = m, le = U ? [{
						target: "subtitles_file_url",
						targetUrl: U
					}, {
						target: "video_file_url",
						targetUrl: K
					}] : null;
					return {
						...U ? {
							url: this.service?.url + p,
							translationHelp: le
						} : {
							url: K,
							translationHelp: le
						},
						detectedLanguage: x,
						duration: oe
					};
				}
				async getVideoId(p) {
					let m = /learn\/([^/]+)\/lecture\/([^/]+)/.exec(p.pathname) ?? /lecture\/([^/]+)\/([^/]+)/.exec(p.pathname);
					return m?.[0];
				}
			}
			class DailymotionHelper extends w.q {
				async getVideoId(p) {
					let m = Array.from(document.querySelectorAll("*")).filter((p) => p.innerHTML.trim().includes(".m3u8")), g = m?.[1]?.lastChild?.src;
					return g ? /\/video\/(\w+)\.m3u8/.exec(g)?.[1] : void 0;
				}
			}
			class DeeplearningAIHelper extends w.q {
				async getVideoData(p) {
					if (!this.video) return;
					let m = this.video.querySelector("source[type=\"application/x-mpegurl\"]")?.src;
					if (m) return { url: m };
				}
				async getVideoId(p) {
					return /courses\/(([^/]+)\/lesson\/([^/]+)\/([^/]+))/.exec(p.pathname)?.[1];
				}
			}
			class DouyinHelper extends w.q {
				static getPlayer() {
					if (!(typeof player > "u")) return player;
				}
				async getVideoData(p) {
					let m = DouyinHelper.getPlayer();
					if (!m) return;
					let { config: { url: g, duration: _, lang: x, isLive: w } } = m;
					if (!g) return;
					let D = g.find((p) => p.src.includes("www.douyin.com/aweme/v1/play/"));
					if (D) return {
						url: (0, O.fl)(D.src),
						duration: _,
						isStream: w,
						...A.xm.includes(x) ? { detectedLanguage: x } : {}
					};
				}
				async getVideoId(p) {
					let m = /video\/([\d]+)/.exec(p.pathname)?.[0];
					return m || DouyinHelper.getPlayer()?.config.vid;
				}
			}
			class DzenHelper extends w.q {
				async getVideoId(p) {
					return /video\/watch\/([^/]+)/.exec(p.pathname)?.[1];
				}
			}
			class EggheadHelper extends w.q {
				async getVideoId(p) {
					return p.pathname.slice(1);
				}
			}
			class EpicGamesHelper extends w.q {
				API_ORIGIN = "https://dev.epicgames.com/community/api/learning";
				async getPostInfo(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/post.json?hash_id=${p}`);
						return await m.json();
					} catch (m) {
						return D.A.error(`Failed to get epicgames post info by videoId: ${p}.`, m.message), !1;
					}
				}
				getVideoBlock() {
					let p = /videoUrl\s?=\s"([^"]+)"?/, m = Array.from(document.body.querySelectorAll("script")).find((m) => p.exec(m.innerHTML));
					if (!m) return;
					let g = m.innerHTML.trim(), _ = p.exec(g)?.[1]?.replace("qsep://", "https://");
					if (!_) return;
					let x = /sources\s?=\s(\[([^\]]+)\])?/.exec(g)?.[1];
					if (!x) return {
						playlistUrl: _,
						subtitles: []
					};
					try {
						x = (x.replace(/src:(\s)+?(videoUrl)/g, "src:\"removed\"").substring(0, x.lastIndexOf("},")) + "]").split("\n").map((p) => p.replace(/([^\s]+):\s?(?!.*\1)/, "\"$1\":")).join("\n");
						let p = JSON.parse(x), m = p.filter((p) => p.type === "captions");
						return {
							playlistUrl: _,
							subtitles: m
						};
					} catch {
						return {
							playlistUrl: _,
							subtitles: []
						};
					}
				}
				async getVideoData(p) {
					let m = p.split(":")?.[1], g = await this.getPostInfo(m);
					if (!g) return;
					let _ = this.getVideoBlock();
					if (!_) return;
					let { playlistUrl: x, subtitles: w } = _, { title: D, description: A } = g, F = w.map((p) => ({
						language: (0, O.ec)(p.srclang),
						source: "epicgames",
						format: "vtt",
						url: p.src
					}));
					return {
						url: x,
						title: D,
						description: A,
						subtitles: F
					};
				}
				async getVideoId(p) {
					return new Promise((p) => {
						let m = "https://dev.epicgames.com", g = btoa(window.location.href);
						window.addEventListener("message", (g) => {
							if (g.origin !== m || !(typeof g.data == "string" && g.data.startsWith("getVideoId:"))) return;
							let _ = g.data.replace("getVideoId:", "");
							return p(_);
						}), window.top.postMessage(`getVideoId:${g}`, m);
					});
				}
			}
			class EpornerHelper extends w.q {
				async getVideoId(p) {
					return /video-([^/]+)\/([^/]+)/.exec(p.pathname)?.[0];
				}
			}
			class FacebookHelper extends w.q {
				async getVideoId(p) {
					return p.pathname.slice(1);
				}
			}
			class GoogleDriveHelper extends w.q {
				getPlayerData() {
					let p = document.querySelector("#movie_player");
					return p?.getVideoData?.call() ?? void 0;
				}
				async getVideoId(p) {
					return this.getPlayerData()?.video_id;
				}
			}
			var F = g("./node_modules/@vot.js/core/dist/utils/videoData.js");
			class IgnHelper extends w.q {
				getVideoDataBySource(p) {
					let m = document.querySelector(".icms.video > source[type=\"video/mp4\"][data-quality=\"360\"]")?.src;
					return m ? { url: (0, O.fl)(m) } : this.returnBaseData(p);
				}
				getVideoDataByNext(p) {
					try {
						let p = document.getElementById("__NEXT_DATA__")?.textContent;
						if (!p) throw new F.A("Not found __NEXT_DATA__ content");
						let m = JSON.parse(p), { props: { pageProps: { page: { description: g, title: _, video: { videoMetadata: { duration: x }, assets: w } } } } } = m, D = w.find((p) => p.height === 360 && p.url.includes(".mp4"))?.url;
						if (!D) throw new F.A("Not found video URL in assets");
						return {
							url: (0, O.fl)(D),
							duration: x,
							title: _,
							description: g
						};
					} catch (m) {
						return D.A.warn(`Failed to get ign video data by video ID: ${p}, because ${m.message}. Using clear link instead...`), this.returnBaseData(p);
					}
				}
				async getVideoData(p) {
					return document.getElementById("__NEXT_DATA__") ? this.getVideoDataByNext(p) : this.getVideoDataBySource(p);
				}
				async getVideoId(p) {
					return /([^/]+)\/([\d]+)\/video\/([^/]+)/.exec(p.pathname)?.[0] ?? /\/videos\/([^/]+)/.exec(p.pathname)?.[0];
				}
			}
			class IMDbHelper extends w.q {
				async getVideoId(p) {
					return /video\/([^/]+)/.exec(p.pathname)?.[1];
				}
			}
			class IncestflixHelper extends w.q {
				async getVideoData(p) {
					try {
						let p = document.querySelector("#incflix-stream source:first-of-type");
						if (!p) throw new w.a("Failed to find source element");
						let m = p.getAttribute("src");
						if (!m) throw new w.a("Failed to find source link");
						let g = new URL(m.startsWith("//") ? `https:${m}` : m);
						return g.searchParams.append("media-proxy", "video.mp4"), { url: (0, O.fl)(g) };
					} catch (m) {
						D.A.error(`Failed to get Incestflix data by videoId: ${p}`, m.message);
						return;
					}
				}
				async getVideoId(p) {
					return /\/watch\/([^/]+)/.exec(p.pathname)?.[1];
				}
			}
			class KickHelper extends w.q {
				API_ORIGIN = "https://kick.com/api";
				async getClipInfo(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/v2/clips/${p}`), g = await m.json(), { clip_url: _, duration: x, title: w } = g.clip;
						return {
							url: _,
							duration: x,
							title: w
						};
					} catch (m) {
						D.A.error(`Failed to get kick clip info by clipId: ${p}.`, m.message);
						return;
					}
				}
				async getVideoInfo(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/v1/video/${p}`), g = await m.json(), { source: _, livestream: x } = g, { session_title: w, duration: D } = x;
						return {
							url: _,
							duration: Math.round(D / 1e3),
							title: w
						};
					} catch (m) {
						D.A.error(`Failed to get kick video info by videoId: ${p}.`, m.message);
						return;
					}
				}
				async getVideoData(p) {
					return p.startsWith("videos") ? await this.getVideoInfo(p.replace("videos/", "")) : await this.getClipInfo(p.replace("clips/", ""));
				}
				async getVideoId(p) {
					return /([^/]+)\/((videos|clips)\/([^/]+))/.exec(p.pathname)?.[2];
				}
			}
			class KickstarterHelper extends w.q {
				async getVideoData(p) {
					try {
						let p = document.querySelector(".ksr-video-player > video"), m = p?.querySelector("source[type^='video/mp4']")?.src;
						if (!m) throw new w.a("Failed to find video URL");
						let g = p?.querySelectorAll("track") ?? [];
						return {
							url: m,
							subtitles: Array.from(g).reduce((p, m) => {
								let g = m.getAttribute("srclang"), _ = m.getAttribute("src");
								return !g || !_ || p.push({
									language: (0, O.ec)(g),
									url: _,
									format: "vtt",
									source: "kickstarter"
								}), p;
							}, [])
						};
					} catch (m) {
						D.A.error(`Failed to get Kickstarter data by videoId: ${p}`, m.message);
						return;
					}
				}
				async getVideoId(p) {
					return p.pathname.slice(1);
				}
			}
			var U = g("./node_modules/@vot.js/shared/dist/data/config.js");
			class KodikHelper extends w.q {
				API_ORIGIN = window.location.origin;
				getSecureData(p) {
					try {
						let [m, g, _] = p.split("/").filter((p) => p), x = Array.from(document.getElementsByTagName("script")), D = x.filter((p) => p.innerHTML.includes(`videoId = "${g}"`) || p.innerHTML.includes(`serialId = Number(${g})`));
						if (!D.length) throw new w.a("Failed to find secure script");
						let O = /'{[^']+}'/.exec(D[0].textContent.trim())?.[0];
						if (!O) throw new w.a("Secure json wasn't found in secure script");
						let A = JSON.parse(O.replaceAll("'", ""));
						if (m !== "serial") return {
							videoType: m,
							videoId: g,
							hash: _,
							...A
						};
						let F = x.find((p) => p.innerHTML.includes("var videoInfo = {}"))?.textContent?.trim();
						if (!F) throw new w.a("Failed to find videoInfo content");
						let U = /videoInfo\.type\s+?=\s+?'([^']+)'/.exec(F)?.[1], K = /videoInfo\.id\s+?=\s+?'([^']+)'/.exec(F)?.[1], oe = /videoInfo\.hash\s+?=\s+?'([^']+)'/.exec(F)?.[1];
						if (!U || !K || !oe) throw new w.a("Failed to parse videoInfo content");
						return {
							videoType: U,
							videoId: K,
							hash: oe,
							...A
						};
					} catch (m) {
						return D.A.error(`Failed to get kodik secure data by videoPath: ${p}.`, m.message), !1;
					}
				}
				async getFtor(p) {
					let { videoType: m, videoId: g, hash: _, d: x, d_sign: w, pd: O, pd_sign: A, ref: F, ref_sign: K } = p;
					try {
						let p = await this.fetch(this.API_ORIGIN + "/ftor", {
							method: "POST",
							headers: {
								"User-Agent": U.A.userAgent,
								Origin: this.API_ORIGIN,
								Referer: `${this.API_ORIGIN}/${m}/${g}/${_}/360p`
							},
							body: new URLSearchParams({
								d: x,
								d_sign: w,
								pd: O,
								pd_sign: A,
								ref: decodeURIComponent(F),
								ref_sign: K,
								bad_user: "false",
								cdn_is_working: "true",
								info: "{}",
								type: m,
								hash: _,
								id: g
							})
						});
						return await p.json();
					} catch (p) {
						return D.A.error(`Failed to get kodik video data (type: ${m}, id: ${g}, hash: ${_})`, p.message), !1;
					}
				}
				decryptUrl(p) {
					let m = atob(p.replace(/[a-zA-Z]/g, function(p) {
						let m = p.charCodeAt(0) + 18, g = p <= "Z" ? 90 : 122;
						return String.fromCharCode(g >= m ? m : m - 26);
					}));
					return "https:" + m;
				}
				async getVideoData(p) {
					let m = this.getSecureData(p);
					if (!m) return;
					let g = await this.getFtor(m);
					if (!g) return;
					let _ = Object.entries(g.links[g.default.toString()]), x = _.find(([, p]) => p.type === "application/x-mpegURL")?.[1];
					if (x) return { url: x.src.startsWith("//") ? `https:${x.src}` : this.decryptUrl(x.src) };
				}
				async getVideoId(p) {
					return /\/(uv|video|seria|episode|season|serial)\/([^/]+)\/([^/]+)\/([\d]+)p/.exec(p.pathname)?.[0];
				}
			}
			class LinkedinHelper extends VideoJSHelper {
				SUBTITLE_SOURCE = "linkedin";
				async getVideoData(p) {
					let m = this.getVideoDataByPlayer(p);
					if (!m) return;
					let { url: g, duration: _, subtitles: x } = m;
					return {
						url: (0, O.fl)(new URL(g)),
						duration: _,
						subtitles: x
					};
				}
				async getVideoId(p) {
					return /\/learning\/(([^/]+)\/([^/]+))/.exec(p.pathname)?.[1];
				}
			}
			var K = g("./node_modules/@vot.js/shared/dist/index.js");
			class LoomHelper extends w.q {
				getClientVersion() {
					if (!(typeof SENTRY_RELEASE > "u")) return SENTRY_RELEASE.id;
				}
				async getVideoData(p) {
					try {
						let m = this.getClientVersion();
						if (!m) throw new w.a("Failed to get client version");
						let g = await this.fetch("https://www.loom.com/graphql", {
							headers: {
								"User-Agent": K.$W.userAgent,
								"content-type": "application/json",
								"x-loom-request-source": `loom_web_${m}`,
								"apollographql-client-name": "web",
								"apollographql-client-version": m,
								"Alt-Used": "www.loom.com"
							},
							body: `{"operationName":"FetchCaptions","variables":{"videoId":"${p}"},"query":"query FetchCaptions($videoId: ID!, $password: String) {\\n  fetchVideoTranscript(videoId: $videoId, password: $password) {\\n    ... on VideoTranscriptDetails {\\n      id\\n      captions_source_url\\n      language\\n      __typename\\n    }\\n    ... on GenericError {\\n      message\\n      __typename\\n    }\\n    __typename\\n  }\\n}"}`,
							method: "POST"
						});
						if (g.status !== 200) throw new w.a("Failed to get data from graphql");
						let _ = await g.json(), x = _.data.fetchVideoTranscript;
						if (x.__typename === "GenericError") throw new w.a(x.message);
						return {
							url: this.service.url + p,
							subtitles: [{
								format: "vtt",
								language: (0, O.ec)(x.language),
								source: "loom",
								url: x.captions_source_url
							}]
						};
					} catch (m) {
						return D.A.error(`Failed to get Loom video data, because: ${m.message}`), this.returnBaseData(p);
					}
				}
				async getVideoId(p) {
					return /(embed|share)\/([^/]+)?/.exec(p.pathname)?.[2];
				}
			}
			class MailRuHelper extends w.q {
				API_ORIGIN = "https://my.mail.ru";
				async getVideoMeta(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/+/video/meta/${p}?xemail=&ajax_call=1&func_name=&mna=&mnb=&ext=1&_=${new Date().getTime()}`);
						return await m.json();
					} catch (p) {
						D.A.error("Failed to get mail.ru video data", p.message);
						return;
					}
				}
				async getVideoId(p) {
					let m = p.pathname;
					if (/\/(v|mail|bk|inbox)\//.exec(m)) return m.slice(1);
					let g = /video\/embed\/([^/]+)/.exec(m)?.[1];
					if (!g) return;
					let _ = await this.getVideoMeta(g);
					if (_) return _.meta.url.replace("//my.mail.ru/", "");
				}
			}
			class NetacadHelper extends VideoJSHelper {
				SUBTITLE_SOURCE = "netacad";
				async getVideoData(p) {
					let m = this.getVideoDataByPlayer(p);
					if (!m) return;
					let { url: g, duration: _, subtitles: x } = m;
					return {
						url: (0, O.fl)(new URL(g)),
						duration: _,
						subtitles: x
					};
				}
				async getVideoId(p) {
					return p.pathname + p.search;
				}
			}
			class NewgroundsHelper extends w.q {
				async getVideoId(p) {
					return /([^/]+)\/(view)\/([^/]+)/.exec(p.pathname)?.[0];
				}
			}
			class NineGAGHelper extends w.q {
				async getVideoData(p) {
					let m = this.returnBaseData(p);
					if (!m) return m;
					try {
						if (!this.video) throw Error("Video element not found");
						let p = this.video.querySelector("source[type^=\"video/mp4\"], source[type^=\"video/webm\"]")?.src;
						if (!p || !/^https?:\/\//.test(p)) throw Error("Video source not found");
						return {
							...m,
							translationHelp: [{
								target: "video_file_url",
								targetUrl: p
							}]
						};
					} catch {
						return m;
					}
				}
				async getVideoId(p) {
					return /gag\/([^/]+)/.exec(p.pathname)?.[1];
				}
			}
			class OdyseeHelper extends w.q {
				API_ORIGIN = "https://odysee.com";
				async getVideoData(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/${p}`), g = await m.text(), _ = /"contentUrl":(\s)?"([^"]+)"/.exec(g)?.[2];
						if (!_) throw new w.a("Odysee url doesn't parsed");
						return { url: _ };
					} catch (m) {
						D.A.error(`Failed to get odysee video data by video ID: ${p}`, m.message);
						return;
					}
				}
				async getVideoId(p) {
					return p.pathname.slice(1);
				}
			}
			class OKRuHelper extends w.q {
				async getVideoId(p) {
					return /\/video\/(\d+)/.exec(p.pathname)?.[1];
				}
			}
			class OracleLearnHelper extends VideoJSHelper {
				SUBTITLE_SOURCE = "oraclelearn";
				async getVideoData(p) {
					let m = this.getVideoDataByPlayer(p);
					if (!m) return;
					let { url: g, duration: _, subtitles: x } = m, w = this.returnBaseData(p), D = (0, O.fl)(new URL(g));
					return w ? {
						url: w.url,
						duration: _,
						subtitles: x,
						translationHelp: [{
							target: "video_file_url",
							targetUrl: D
						}]
					} : {
						url: D,
						duration: _,
						subtitles: x
					};
				}
				async getVideoId(p) {
					return /\/ou\/course\/(([^/]+)\/(\d+)\/(\d+))/.exec(p.pathname)?.[1];
				}
			}
			class PatreonHelper extends w.q {
				API_ORIGIN = "https://www.patreon.com/api";
				async getPosts(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/posts/${p}?json-api-use-default-includes=false`);
						return await m.json();
					} catch (m) {
						return D.A.error(`Failed to get patreon posts by postId: ${p}.`, m.message), !1;
					}
				}
				async getVideoData(p) {
					let m = await this.getPosts(p);
					if (!m) return;
					let g = m.data.attributes.post_file.url;
					if (g) return { url: g };
				}
				async getVideoId(p) {
					let m = /posts\/([^/]+)/.exec(p.pathname)?.[1];
					if (m) return m.replace(/[^\d.]/g, "");
				}
			}
			class PeertubeHelper extends w.q {
				async getVideoId(p) {
					return /\/w\/([^/]+)/.exec(p.pathname)?.[0];
				}
			}
			class PornhubHelper extends w.q {
				async getVideoId(p) {
					return p.searchParams.get("viewkey") ?? /embed\/([^/]+)/.exec(p.pathname)?.[1];
				}
			}
			class PornTNHelper extends w.q {
				async getVideoData(p) {
					try {
						if (typeof flashvars > "u") return;
						let { rnd: p, video_url: m, video_title: g } = flashvars;
						if (!m || !p) throw new w.a("Failed to find video source or rnd");
						let _ = new URL(m);
						_.searchParams.append("rnd", p), D.A.log("PornTN get_file link", _.href);
						let x = await this.fetch(_.href, { method: "head" }), A = new URL(x.url);
						D.A.log("PornTN cdn link", A.href);
						let F = (0, O.fl)(A);
						return {
							url: F,
							title: g
						};
					} catch (m) {
						D.A.error(`Failed to get PornTN data by videoId: ${p}`, m.message);
						return;
					}
				}
				async getVideoId(p) {
					return /\/videos\/(([^/]+)\/([^/]+))/.exec(p.pathname)?.[1];
				}
			}
			class RedditHelper extends w.q {
				API_ORIGIN = "https://www.reddit.com";
				async getContentUrl(p) {
					if (this.service?.additionalData !== "old") return document.querySelector("shreddit-player-2")?.src;
					let m = document.querySelector("[data-hls-url]");
					return m?.dataset.hlsUrl?.replaceAll("&amp;", "&");
				}
				async getVideoData(p) {
					try {
						let m = await this.getContentUrl(p);
						if (!m) throw new w.a("Failed to find content url");
						return { url: decodeURIComponent(m) };
					} catch (m) {
						D.A.error(`Failed to get reddit video data by video ID: ${p}`, m.message);
						return;
					}
				}
				async getVideoId(p) {
					return /\/r\/(([^/]+)\/([^/]+)\/([^/]+)\/([^/]+))/.exec(p.pathname)?.[1];
				}
			}
			class RtNewsHelper extends w.q {
				async getVideoData(p) {
					let m = document.querySelector(".jw-video, .media__video_noscript");
					if (!m) return;
					let g = m.getAttribute("src");
					if (g) return g.endsWith(".MP4") && (g = (0, O.fl)(g)), {
						videoId: p,
						url: g
					};
				}
				async getVideoId(p) {
					return p.pathname.slice(1);
				}
			}
			class RumbleHelper extends w.q {
				async getVideoId(p) {
					return p.pathname.slice(1);
				}
			}
			class RutubeHelper extends w.q {
				async getVideoId(p) {
					return /(?:video|embed)\/([^/]+)/.exec(p.pathname)?.[1];
				}
			}
			class SapHelper extends w.q {
				API_ORIGIN = "https://learning.sap.com/";
				async requestKaltura(p, m, g) {
					let _ = "html5:v3.17.22", x = "3.3.0";
					try {
						let w = await this.fetch(`https://${p}/api_v3/service/multirequest`, {
							method: "POST",
							body: JSON.stringify({
								1: {
									service: "session",
									action: "startWidgetSession",
									widgetId: `_${m}`
								},
								2: {
									service: "baseEntry",
									action: "list",
									ks: "{1:result:ks}",
									filter: { redirectFromEntryId: g },
									responseProfile: {
										type: 1,
										fields: "id,referenceId,name,description,dataUrl,duration,flavorParamsIds,type,dvrStatus,externalSourceType,createdAt,updatedAt,endDate,plays,views,downloadUrl,creatorId"
									}
								},
								3: {
									service: "baseEntry",
									action: "getPlaybackContext",
									entryId: "{2:result:objects:0:id}",
									ks: "{1:result:ks}",
									contextDataParams: {
										objectType: "KalturaContextDataParams",
										flavorTags: "all"
									}
								},
								apiVersion: x,
								format: 1,
								ks: "",
								clientTag: _,
								partnerId: m
							}),
							headers: { "Content-Type": "application/json" }
						});
						return await w.json();
					} catch (p) {
						D.A.error("Failed to request kaltura data", p.message);
						return;
					}
				}
				async getKalturaData(p) {
					try {
						let m = document.querySelector("script[data-nscript=\"beforeInteractive\"]");
						if (!m) throw new w.a("Failed to find script element");
						let g = /https:\/\/([^"]+)\/p\/([^"]+)\/embedPlaykitJs\/uiconf_id\/([^"]+)/.exec(m?.src);
						if (!g) throw new w.a(`Failed to get sap data for videoId: ${p}`);
						let [, _, x] = g, D = document.querySelector("#shadow")?.firstChild?.getAttribute("id");
						if (!D) {
							let p = document.querySelector("#__NEXT_DATA__");
							if (!p) throw new w.a("Failed to find next data element");
							D = /"sourceId":\s?"([^"]+)"/.exec(p.innerText)?.[1];
						}
						if (!_ || Number.isNaN(+x) || !D) throw new w.a(`One of the necessary parameters for getting a link to a sap video in wasn't found for ${p}. Params: kalturaDomain = ${_}, partnerId = ${x}, entryId = ${D}`);
						return await this.requestKaltura(_, x, D);
					} catch (p) {
						D.A.error("Failed to get kaltura data", p.message);
						return;
					}
				}
				async getVideoData(p) {
					let m = await this.getKalturaData(p);
					if (!m) return;
					let [, g, _] = m, { duration: x } = g.objects[0], w = _.sources.find((p) => p.format === "url" && p.protocols === "http,https" && p.url.includes(".mp4"))?.url;
					if (!w) return;
					let D = _.playbackCaptions.map((p) => ({
						language: (0, O.ec)(p.languageCode),
						source: "sap",
						format: "vtt",
						url: p.webVttUrl,
						isAutoGenerated: p.label.includes("auto-generated")
					}));
					return {
						url: w,
						subtitles: D,
						duration: x
					};
				}
				async getVideoId(p) {
					return /((courses|learning-journeys)\/([^/]+)(\/[^/]+)?)/.exec(p.pathname)?.[1];
				}
			}
			class TelegramHelper extends w.q {
				static getMediaViewer() {
					if (!(typeof appMediaViewer > "u")) return appMediaViewer;
				}
				async getVideoId(p) {
					let m = TelegramHelper.getMediaViewer();
					if (!m || m.live) return;
					let g = m.target.message;
					if (g.peer_id._ !== "peerChannel") return;
					let _ = g.media;
					if (_._ !== "messageMediaDocument" || _.document.type !== "video") return;
					let x = g.mid & 4294967295, w = await m.managers.appPeersManager.getPeerUsername(g.peerId);
					return `${w}/${x}`;
				}
			}
			class ThisVidHelper extends w.q {
				async getVideoId(p) {
					return /(videos|embed)\/[^/]+/.exec(p.pathname)?.[0];
				}
			}
			class TikTokHelper extends w.q {
				async getVideoId(p) {
					return /([^/]+)\/video\/([^/]+)/.exec(p.pathname)?.[0];
				}
			}
			class TrovoHelper extends w.q {
				async getVideoId(p) {
					let m = p.searchParams.get("vid"), g = /([^/]+)\/([\d]+)/.exec(p.pathname)?.[0];
					if (!(!m || !g)) return `${g}?vid=${m}`;
				}
			}
			class TwitchHelper extends w.q {
				API_ORIGIN = "https://clips.twitch.tv";
				async getClipLink(p, m) {
					let g = document.querySelector("script[type='application/ld+json']"), _ = p.slice(1);
					if (g) {
						let p = JSON.parse(g.innerText), m = p["@graph"].find((p) => p["@type"] === "VideoObject")?.creator.url;
						if (!m) throw new w.a("Failed to find channel link");
						let x = m.replace("https://www.twitch.tv/", "");
						return `${x}/clip/${_}`;
					}
					let x = _ === "embed", D = document.querySelector(x ? ".tw-link[data-test-selector='stream-info-card-component__stream-avatar-link']" : ".clips-player a:not([class])");
					if (!D) return;
					let O = D.href.replace("https://www.twitch.tv/", "");
					return `${O}/clip/${x ? m : _}`;
				}
				async getVideoData(p) {
					let m = document.querySelector("[data-a-target=\"stream-title\"], [data-test-selector=\"stream-info-card-component__subtitle\"]")?.innerText, g = !!document.querySelector("[data-a-target=\"animated-channel-viewers-count\"], .channel-status-info--live, .top-bar--pointer-enabled .tw-channel-status-text-indicator");
					return {
						url: this.service.url + p,
						isStream: g,
						title: m
					};
				}
				async getVideoId(p) {
					let m = p.pathname;
					if (/^m\.twitch\.tv$/.test(m)) return /videos\/([^/]+)/.exec(p.href)?.[0] ?? m.slice(1);
					if (/^player\.twitch\.tv$/.test(p.hostname)) return `videos/${p.searchParams.get("video")}`;
					let g = /([^/]+)\/(?:clip)\/([^/]+)/.exec(m);
					if (g) return g[0];
					let _ = /^clips\.twitch\.tv$/.test(p.hostname);
					if (_) return await this.getClipLink(m, p.searchParams.get("clip"));
					let x = /(?:videos)\/([^/]+)/.exec(m);
					if (x) return x[0];
					let w = document.querySelector(".home-offline-hero .tw-link");
					if (w?.href) {
						let p = new URL(w.href);
						return /(?:videos)\/([^/]+)/.exec(p.pathname)?.[0];
					}
					return document.querySelector(".persistent-player") ? m : void 0;
				}
			}
			class TwitterHelper extends w.q {
				async getVideoId(p) {
					let m = /status\/([^/]+)/.exec(p.pathname)?.[1];
					if (m) return m;
					let g = this.video?.closest("[data-testid=\"tweet\"]"), _ = g?.querySelector("a[role=\"link\"][aria-label]")?.href;
					return _ ? /status\/([^/]+)/.exec(_)?.[1] : void 0;
				}
			}
			class UdemyHelper extends w.q {
				API_ORIGIN = "https://www.udemy.com/api-2.0";
				getModuleData() {
					let p = document.querySelector(".ud-app-loader[data-module-id='course-taking']"), m = p?.dataset?.moduleArgs;
					if (m) return JSON.parse(m);
				}
				getLectureId() {
					return /learn\/lecture\/([^/]+)/.exec(window.location.pathname)?.[1];
				}
				isErrorData(p) {
					return Object.hasOwn(p, "error");
				}
				async getLectureData(p, m) {
					try {
						let g = await this.fetch(`${this.API_ORIGIN}/users/me/subscribed-courses/${p}/lectures/${m}/?` + new URLSearchParams({
							"fields[lecture]": "title,description,asset",
							"fields[asset]": "length,media_sources,captions"
						}).toString()), _ = await g.json();
						if (this.isErrorData(_)) throw new w.a(_.detail ?? "unknown error");
						return _;
					} catch (g) {
						D.A.error(`Failed to get lecture data by courseId: ${p} and lectureId: ${m}`, g.message);
						return;
					}
				}
				async getCourseLang(p) {
					try {
						let m = await this.fetch(`${this.API_ORIGIN}/users/me/subscribed-courses/${p}?` + new URLSearchParams({ "fields[course]": "locale" }).toString()), g = await m.json();
						if (this.isErrorData(g)) throw new w.a(g.detail ?? "unknown error");
						return g;
					} catch (m) {
						D.A.error(`Failed to get course lang by courseId: ${p}`, m.message);
						return;
					}
				}
				findVideoUrl(p) {
					return p?.find((p) => p.type === "video/mp4")?.src;
				}
				findSubtitleUrl(p, m) {
					let g = p?.find((p) => (0, O.ec)(p.locale_id) === m) ?? p?.find((p) => (0, O.ec)(p.locale_id) === "en") ?? p?.[0];
					return g?.url;
				}
				async getVideoData(p) {
					let m = this.getModuleData();
					if (!m) return;
					let { courseId: g } = m, _ = this.getLectureId();
					if (D.A.log(`[Udemy] courseId: ${g}, lectureId: ${_}`), !_) return;
					let x = await this.getLectureData(g, _);
					if (!x) return;
					let { title: w, description: F, asset: U } = x, { length: K, media_sources: oe, captions: le } = U, ue = this.findVideoUrl(oe);
					if (!ue) {
						D.A.log("Failed to find .mp4 video file in media_sources", oe);
						return;
					}
					let we = "en", je = await this.getCourseLang(g);
					if (je) {
						let { locale: { locale: p } } = je;
						we = p ? (0, O.ec)(p) : we;
					}
					A.xm.includes(we) || (we = "en");
					let Ie = this.findSubtitleUrl(le, we);
					return Ie || D.A.log("Failed to find subtitle file in captions", le), {
						...Ie ? {
							url: this.service?.url + p,
							translationHelp: [{
								target: "subtitles_file_url",
								targetUrl: Ie
							}, {
								target: "video_file_url",
								targetUrl: ue
							}],
							detectedLanguage: we
						} : {
							url: ue,
							translationHelp: null
						},
						duration: K,
						title: w,
						description: F
					};
				}
				async getVideoId(p) {
					return p.pathname.slice(1);
				}
			}
			class VimeoHelper extends w.q {
				API_KEY = "";
				DEFAULT_SITE_ORIGIN = "https://vimeo.com";
				SITE_ORIGIN = this.service?.url?.slice(0, -1) ?? this.DEFAULT_SITE_ORIGIN;
				isErrorData(p) {
					return Object.hasOwn(p, "error");
				}
				isPrivatePlayer() {
					return this.referer && !this.referer.includes("vimeo.com") && this.origin.endsWith("player.vimeo.com");
				}
				async getViewerData() {
					try {
						let p = await this.fetch("https://vimeo.com/_next/viewer"), m = await p.json(), { apiUrl: g, jwt: _ } = m;
						return this.API_ORIGIN = `https://${g}`, this.API_KEY = `jwt ${_}`, m;
					} catch (p) {
						return D.A.error("Failed to get default viewer data.", p.message), !1;
					}
				}
				async getVideoInfo(p) {
					try {
						let m = new URLSearchParams({ fields: "name,link,description,duration" }).toString(), g = await this.fetch(`${this.API_ORIGIN}/videos/${p}?${m}`, { headers: { Authorization: this.API_KEY } }), _ = await g.json();
						if (this.isErrorData(_)) throw Error(_.developer_message ?? _.error);
						return _;
					} catch (m) {
						return D.A.error(`Failed to get video info by video ID: ${p}`, m.message), !1;
					}
				}
				async getPrivateVideoSource(p) {
					try {
						let { default_cdn: m, cdns: g } = p.dash, _ = g[m].url, x = await this.fetch(_);
						if (x.status !== 200) throw new w.a(await x.text());
						let D = await x.json(), O = new URL(D.base_url, _), A = D.audio.find((p) => p.mime_type === "audio/mp4" && p.format === "dash");
						if (!A) throw new w.a("Failed to find video data");
						let F = A.segments?.[0]?.url;
						if (!F) throw new w.a("Failed to find first segment url");
						let [U, K] = F.split("?", 2), oe = new URLSearchParams(K);
						return oe.delete("range"), new URL(`${A.base_url}${U}?${oe.toString()}`, O).href;
					} catch (p) {
						return D.A.error("Failed to get private video source", p.message), !1;
					}
				}
				async getPrivateVideoInfo(p) {
					try {
						if (typeof playerConfig > "u") return;
						let m = await this.getPrivateVideoSource(playerConfig.request.files);
						if (!m) throw new w.a("Failed to get private video source");
						let { video: { title: g, duration: _ }, request: { text_tracks: x } } = playerConfig;
						return {
							url: `${this.SITE_ORIGIN}/${p}`,
							video_url: m,
							title: g,
							duration: _,
							subs: x
						};
					} catch (m) {
						return D.A.error(`Failed to get private video info by video ID: ${p}`, m.message), !1;
					}
				}
				async getSubsInfo(p) {
					try {
						let m = new URLSearchParams({
							per_page: "100",
							fields: "language,type,link"
						}).toString(), g = await this.fetch(`${this.API_ORIGIN}/videos/${p}/texttracks?${m}`, { headers: { Authorization: this.API_KEY } }), _ = await g.json();
						if (this.isErrorData(_)) throw Error(_.developer_message ?? _.error);
						return _.data;
					} catch (m) {
						return D.A.error(`Failed to get subtitles info by video ID: ${p}`, m.message), [];
					}
				}
				async getVideoData(p) {
					let m = this.isPrivatePlayer();
					if (m) {
						let m = await this.getPrivateVideoInfo(p);
						if (!m) return;
						let { url: g, subs: _, video_url: x, title: w, duration: D } = m, A = _.map((p) => ({
							language: (0, O.ec)(p.lang),
							source: "vimeo",
							format: "vtt",
							url: this.SITE_ORIGIN + p.url,
							isAutoGenerated: p.lang.includes("autogenerated")
						})), F = A.length ? [{
							target: "video_file_url",
							targetUrl: x
						}, {
							target: "subtitles_file_url",
							targetUrl: A[0].url
						}] : null;
						return {
							...F ? {
								url: g,
								translationHelp: F
							} : { url: x },
							subtitles: A,
							title: w,
							duration: D
						};
					}
					if (!this.extraInfo) return this.returnBaseData(p);
					p.includes("/") && (p = p.replace("/", ":"));
					let g = await this.getViewerData();
					if (!g) return this.returnBaseData(p);
					let _ = await this.getVideoInfo(p);
					if (!_) return this.returnBaseData(p);
					let x = await this.getSubsInfo(p), w = x.map((p) => ({
						language: (0, O.ec)(p.language),
						source: "vimeo",
						format: "vtt",
						url: p.link,
						isAutoGenerated: p.language.includes("autogen")
					})), { link: D, duration: A, name: F, description: U } = _;
					return {
						url: D,
						title: F,
						description: U,
						subtitles: w,
						duration: A
					};
				}
				async getVideoId(p) {
					let m = /video\/[^/]+$/.exec(p.pathname)?.[0];
					if (this.isPrivatePlayer()) return m;
					if (m) {
						let g = p.searchParams.get("h"), _ = m.replace("video/", "");
						return g ? `${_}/${g}` : _;
					}
					let g = /channels\/[^/]+\/([^/]+)/.exec(p.pathname)?.[1] ?? /groups\/[^/]+\/videos\/([^/]+)/.exec(p.pathname)?.[1] ?? /(showcase|album)\/[^/]+\/video\/([^/]+)/.exec(p.pathname)?.[2];
					return g || /([^/]+\/)?[^/]+$/.exec(p.pathname)?.[0];
				}
			}
			class VKHelper extends w.q {
				static getPlayer() {
					if (!(typeof Videoview > "u")) return Videoview?.getPlayerObject?.call(void 0);
				}
				async getVideoData(p) {
					let m = VKHelper.getPlayer();
					if (!m) return this.returnBaseData(p);
					try {
						let { description: g, duration: _, md_title: x } = m.vars, w = new DOMParser(), D = w.parseFromString(g, "text/html"), A = Array.from(D.body.childNodes).filter((p) => p.nodeName !== "BR").map((p) => p.textContent).join("\n"), F;
						return Object.hasOwn(m.vars, "subs") && (F = m.vars.subs.map((p) => ({
							language: (0, O.ec)(p.lang),
							source: "vk",
							format: "vtt",
							url: p.url,
							isAutoGenerated: !!p.is_auto
						}))), {
							url: this.service.url + p,
							title: x,
							description: A,
							duration: _,
							subtitles: F
						};
					} catch (m) {
						return D.A.error(`Failed to get VK video data, because: ${m.message}`), this.returnBaseData(p);
					}
				}
				async getVideoId(p) {
					let m = /^\/(video|clip)-?\d{8,9}_\d{9}$/.exec(p.pathname);
					if (m) return m[0].slice(1);
					let g = /\/playlist\/[^/]+\/(video-?\d{8,9}_\d{9})/.exec(p.pathname);
					if (g) return g[1];
					let _ = p.searchParams.get("z");
					if (_) return _.split("/")[0];
					let x = p.searchParams.get("oid"), w = p.searchParams.get("id");
					if (x && w) return `video-${Math.abs(parseInt(x))}_${w}`;
				}
			}
			class WatchPornToHelper extends w.q {
				async getVideoId(p) {
					return /(video|embed)\/(\d+)(\/[^/]+\/)?/.exec(p.pathname)?.[0];
				}
			}
			var oe = g("./node_modules/@vot.js/shared/dist/secure.js");
			class WeverseHelper extends w.q {
				API_ORIGIN = "https://global.apis.naver.com/weverse/wevweb";
				API_APP_ID = "be4d79eb8fc7bd008ee82c8ec4ff6fd4";
				API_HMAC_KEY = "1b9cb6378d959b45714bec49971ade22e6e24e42";
				HEADERS = {
					Accept: "application/json, text/plain, */*",
					Origin: "https://weverse.io",
					Referer: "https://weverse.io/"
				};
				getURLData() {
					return {
						appId: this.API_APP_ID,
						language: "en",
						os: "WEB",
						platform: "WEB",
						wpf: "pc"
					};
				}
				async createHash(p) {
					let m = Date.now(), g = p.substring(0, Math.min(255, p.length)) + m, _ = await (0, oe.bT)(this.API_HMAC_KEY, g);
					if (!_) throw new w.a("Failed to get weverse HMAC signature");
					return {
						wmsgpad: m.toString(),
						wmd: _
					};
				}
				async getHashURLParams(p) {
					let m = await this.createHash(p);
					return new URLSearchParams(m).toString();
				}
				async getPostPreview(p) {
					let m = `/post/v1.0/post-${p}/preview?` + new URLSearchParams({
						fieldSet: "postForPreview",
						...this.getURLData()
					}).toString();
					try {
						let p = await this.getHashURLParams(m), g = await this.fetch(this.API_ORIGIN + m + "&" + p, { headers: this.HEADERS });
						return await g.json();
					} catch (m) {
						return D.A.error(`Failed to get weverse post preview by postId: ${p}`, m.message), !1;
					}
				}
				async getVideoInKey(p) {
					let m = `/video/v1.1/vod/${p}/inKey?` + new URLSearchParams({
						gcc: "RU",
						...this.getURLData()
					}).toString();
					try {
						let p = await this.getHashURLParams(m), g = await this.fetch(this.API_ORIGIN + m + "&" + p, {
							method: "POST",
							headers: this.HEADERS
						});
						return await g.json();
					} catch (m) {
						return D.A.error(`Failed to get weverse InKey by videoId: ${p}`, m.message), !1;
					}
				}
				async getVideoInfo(p, m, g) {
					let _ = Date.now();
					try {
						let x = new URLSearchParams({
							key: m,
							sid: g,
							nonce: _.toString(),
							devt: "html5_pc",
							prv: "N",
							aup: "N",
							stpb: "N",
							cpl: "en",
							env: "prod",
							lc: "en",
							adi: JSON.stringify([{ adSystem: null }]),
							adu: "/"
						}).toString(), w = await this.fetch(`https://global.apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/${p}?` + x, { headers: this.HEADERS });
						return await w.json();
					} catch (_) {
						return D.A.error(`Failed to get weverse video info (infraVideoId: ${p}, inkey: ${m}, serviceId: ${g}`, _.message), !1;
					}
				}
				extractVideoInfo(p) {
					return p.find((p) => p.useP2P === !1 && p.source.includes(".mp4"));
				}
				async getVideoData(p) {
					let m = await this.getPostPreview(p);
					if (!m) return;
					let { videoId: g, serviceId: _, infraVideoId: x } = m.extension.video;
					if (!(g && _ && x)) return;
					let w = await this.getVideoInKey(g);
					if (!w) return;
					let D = await this.getVideoInfo(x, w.inKey, _);
					if (!D) return;
					let O = this.extractVideoInfo(D.videos.list);
					if (O) return {
						url: O.source,
						duration: O.duration
					};
				}
				async getVideoId(p) {
					return /([^/]+)\/(live|media)\/([^/]+)/.exec(p.pathname)?.[3];
				}
			}
			class XVideosHelper extends w.q {
				async getVideoId(p) {
					return /[^/]+\/[^/]+$/.exec(p.pathname)?.[0];
				}
			}
			class YandexDiskHelper extends w.q {
				API_ORIGIN = window.location.origin;
				CLIENT_PREFIX = "/client/disk";
				INLINE_PREFIX = "/i/";
				DISK_PREFIX = "/d/";
				isErrorData(p) {
					return Object.hasOwn(p, "error");
				}
				async getClientVideoData(p) {
					let m = new URL(window.location.href), g = m.searchParams.get("idDialog");
					if (!g) return;
					let _ = document.querySelector("#preloaded-data");
					if (_) try {
						let p = JSON.parse(_.innerText), { idClient: m, sk: x } = p.config, D = await this.fetch(this.API_ORIGIN + "/models-v2?m=mpfs/info", {
							method: "POST",
							body: JSON.stringify({
								apiMethod: "mpfs/info",
								connection_id: m,
								requestParams: { path: g },
								sk: x
							}),
							headers: { "Content-Type": "application/json" }
						}), O = await D.json();
						if (this.isErrorData(O)) throw new w.a(O.error?.message ?? O.error?.code);
						if (O?.type !== "file") throw new w.a("Failed to get resource info");
						let { meta: { short_url: A, video_info: F }, name: U } = O;
						if (!F) throw new w.a("There's no video open right now");
						if (!A) throw new w.a("Access to the video is limited");
						let K = this.clearTitle(U), oe = Math.round(F.duration / 1e3);
						return {
							url: A,
							title: K,
							duration: oe
						};
					} catch (m) {
						D.A.error(`Failed to get yandex disk video data by video ID: ${p}, because ${m.message}`);
						return;
					}
				}
				clearTitle(p) {
					return p.replace(/(\.[^.]+)$/, "");
				}
				getBodyHash(p, m) {
					let g = JSON.stringify({
						hash: p,
						sk: m
					});
					return encodeURIComponent(g);
				}
				async fetchList(p, m) {
					let g = this.getBodyHash(p, m), _ = await this.fetch(this.API_ORIGIN + "/public/api/fetch-list", {
						method: "POST",
						body: g
					}), x = await _.json();
					if (Object.hasOwn(x, "error")) throw new w.a("Failed to fetch folder list");
					return x.resources;
				}
				async getDownloadUrl(p, m) {
					let g = this.getBodyHash(p, m), _ = await this.fetch(this.API_ORIGIN + "/public/api/download-url", {
						method: "POST",
						body: g
					}), x = await _.json();
					if (x.error) throw new w.a("Failed to get download url");
					return x.data.url;
				}
				async getDiskVideoData(p) {
					try {
						let m = document.getElementById("store-prefetch");
						if (!m) throw new w.a("Failed to get prefetch data");
						let g = p.split("/").slice(3);
						if (!g.length) throw new w.a("Failed to find video file path");
						let _ = JSON.parse(m.innerText), { resources: x, rootResourceId: D, environment: { sk: A } } = _, F = x[D], U = g.length - 1, K = g.filter((p, m) => m !== U).join("/"), oe = Object.values(x);
						K.includes("/") && (oe = await this.fetchList(`${F.hash}:/${K}`, A));
						let le = oe.find((p) => p.name === g[U]);
						if (!le) throw new w.a("Failed to find resource");
						if (le && le.type === "dir") throw new w.a("Path is dir, but expected file");
						let { meta: { short_url: ue, mediatype: we, videoDuration: je }, path: Ie, name: Be } = le;
						if (we !== "video") throw new w.a("Resource isn't a video");
						let Ve = this.clearTitle(Be), Ue = Math.round(je / 1e3);
						if (ue) return {
							url: ue,
							duration: Ue,
							title: Ve
						};
						let We = await this.getDownloadUrl(Ie, A);
						return {
							url: (0, O.fl)(new URL(We)),
							duration: Ue,
							title: Ve
						};
					} catch (m) {
						D.A.error(`Failed to get yandex disk video data by disk video ID: ${p}`, m.message);
						return;
					}
				}
				async getVideoData(p) {
					return p.startsWith(this.INLINE_PREFIX) || /^\/d\/([^/]+)$/.exec(p) ? { url: this.service.url + p.slice(1) } : (p = decodeURIComponent(p), p.startsWith(this.CLIENT_PREFIX) ? await this.getClientVideoData(p) : await this.getDiskVideoData(p));
				}
				async getVideoId(p) {
					if (p.pathname.startsWith(this.CLIENT_PREFIX)) return p.pathname + p.search;
					let m = /\/i\/([^/]+)/.exec(p.pathname)?.[0];
					return m || (/\/d\/([^/]+)/.exec(p.pathname) ? p.pathname : void 0);
				}
			}
			class YoukuHelper extends w.q {
				async getVideoId(p) {
					return /v_show\/id_[\w=]+/.exec(p.pathname)?.[0];
				}
			}
			var le = g("./node_modules/@vot.js/ext/dist/helpers/youtube.js");
			let ue = {
				[_.r.mailru]: MailRuHelper,
				[_.r.weverse]: WeverseHelper,
				[_.r.kodik]: KodikHelper,
				[_.r.patreon]: PatreonHelper,
				[_.r.reddit]: RedditHelper,
				[_.r.bannedvideo]: BannedVideoHelper,
				[_.r.kick]: KickHelper,
				[_.r.appledeveloper]: AppleDeveloperHelper,
				[_.r.epicgames]: EpicGamesHelper,
				[_.r.odysee]: OdyseeHelper,
				[_.r.coursehunterLike]: CoursehunterLikeHelper,
				[_.r.twitch]: TwitchHelper,
				[_.r.sap]: SapHelper,
				[_.r.linkedin]: LinkedinHelper,
				[_.r.vimeo]: VimeoHelper,
				[_.r.yandexdisk]: YandexDiskHelper,
				[_.r.vk]: VKHelper,
				[_.r.trovo]: TrovoHelper,
				[_.r.incestflix]: IncestflixHelper,
				[_.r.porntn]: PornTNHelper,
				[_.r.googledrive]: GoogleDriveHelper,
				[_.r.bilibili]: BilibiliHelper,
				[_.r.xvideos]: XVideosHelper,
				[_.r.watchpornto]: WatchPornToHelper,
				[_.r.archive]: ArchiveHelper,
				[_.r.dailymotion]: DailymotionHelper,
				[_.r.youku]: YoukuHelper,
				[_.r.egghead]: EggheadHelper,
				[_.r.newgrounds]: NewgroundsHelper,
				[_.r.okru]: OKRuHelper,
				[_.r.peertube]: PeertubeHelper,
				[_.r.eporner]: EpornerHelper,
				[_.r.bitchute]: BitchuteHelper,
				[_.r.rutube]: RutubeHelper,
				[_.r.facebook]: FacebookHelper,
				[_.r.rumble]: RumbleHelper,
				[_.r.twitter]: TwitterHelper,
				[_.r.pornhub]: PornhubHelper,
				[_.r.tiktok]: TikTokHelper,
				[_.r.proxitok]: TikTokHelper,
				[_.r.nine_gag]: NineGAGHelper,
				[_.r.youtube]: le.A,
				[_.r.ricktube]: le.A,
				[_.r.invidious]: le.A,
				[_.r.poketube]: le.A,
				[_.r.piped]: le.A,
				[_.r.dzen]: DzenHelper,
				[_.r.cloudflarestream]: CloudflareStreamHelper,
				[_.r.loom]: LoomHelper,
				[_.r.rtnews]: RtNewsHelper,
				[_.r.bitview]: BitviewHelper,
				[_.r.thisvid]: ThisVidHelper,
				[_.r.ign]: IgnHelper,
				[_.r.bunkr]: BunkrHelper,
				[_.r.imdb]: IMDbHelper,
				[_.r.telegram]: TelegramHelper,
				[x.Q.udemy]: UdemyHelper,
				[x.Q.coursera]: CourseraHelper,
				[x.Q.douyin]: DouyinHelper,
				[x.Q.artstation]: ArtstationHelper,
				[x.Q.kickstarter]: KickstarterHelper,
				[x.Q.oraclelearn]: OracleLearnHelper,
				[x.Q.deeplearningai]: DeeplearningAIHelper,
				[x.Q.netacad]: NetacadHelper
			};
			class VideoHelper {
				helpersData;
				constructor(p = {}) {
					this.helpersData = p;
				}
				getHelper(p) {
					return new ue[p](this.helpersData);
				}
			}
		},
		"./node_modules/@vot.js/ext/dist/helpers/youtube.js": (p, m, g) => {
			"use strict";
			g.d(m, { A: () => YoutubeHelper });
			var _ = g("./node_modules/@vot.js/ext/dist/helpers/base.js"), x = g("./node_modules/@vot.js/shared/dist/data/consts.js"), w = g("./node_modules/@vot.js/shared/dist/utils/logger.js"), D = g("./node_modules/@vot.js/shared/dist/utils/utils.js");
			class YoutubeHelper extends _.q {
				static isMobile() {
					return /^m\.youtube\.com$/.test(window.location.hostname);
				}
				static getPlayer() {
					return window.location.pathname.startsWith("/shorts/") && !YoutubeHelper.isMobile() ? document.querySelector("#shorts-player") : document.querySelector("#movie_player");
				}
				static getPlayerResponse() {
					return YoutubeHelper.getPlayer()?.getPlayerResponse?.call(void 0);
				}
				static getPlayerData() {
					return YoutubeHelper.getPlayer()?.getVideoData?.call(void 0);
				}
				static getVolume() {
					let p = YoutubeHelper.getPlayer();
					return p?.getVolume ? p.getVolume() / 100 : 1;
				}
				static setVolume(p) {
					let m = YoutubeHelper.getPlayer();
					return m?.setVolume ? (m.setVolume(Math.round(p * 100)), !0) : !1;
				}
				static isMuted() {
					let p = YoutubeHelper.getPlayer();
					return p?.isMuted ? p.isMuted() : !1;
				}
				static videoSeek(p, m) {
					w.A.log("videoSeek", m);
					let g = YoutubeHelper.getPlayer()?.getProgressState()?.seekableEnd ?? p.currentTime, _ = g - m;
					p.currentTime = _;
				}
				static getPoToken() {
					let p = YoutubeHelper.getPlayer();
					if (!p) return;
					let m = p.getAudioTrack?.call(void 0);
					if (!m?.captionTracks?.length) return;
					let g = m.captionTracks.find((p) => p.url.includes("&pot="));
					if (g) return /&pot=([^&]+)/.exec(g.url)?.[1];
				}
				static getGlobalConfig() {
					return typeof yt < "u" ? yt?.config_ : typeof ytcfg < "u" ? ytcfg?.data_ : void 0;
				}
				static getDeviceParams() {
					let p = YoutubeHelper.getGlobalConfig();
					if (!p) return "c=WEB";
					let m = p.INNERTUBE_CONTEXT?.client, g = new URLSearchParams(p.DEVICE);
					return g.delete("ceng"), g.delete("cengver"), g.set("c", m?.clientName ?? p.INNERTUBE_CLIENT_NAME), g.set("cver", m?.clientVersion ?? p.INNERTUBE_CLIENT_VERSION), g.set("cplayer", "UNIPLAYER"), g.toString();
				}
				static getSubtitles(p) {
					let m = YoutubeHelper.getPlayerResponse(), g = m?.captions?.playerCaptionsTracklistRenderer;
					if (!g) return [];
					let _ = g.captionTracks ?? [], x = g.translationLanguages ?? [], O = x.find((m) => m.languageCode === p), A = _.find((p) => p?.kind === "asr"), F = A?.languageCode ?? "en", U = _.reduce((m, g) => {
						if (!("languageCode" in g)) return m;
						let _ = g.languageCode ? (0, D.ec)(g.languageCode) : void 0, x = g.baseUrl;
						if (!_ || !x) return m;
						let w = `${x.startsWith("http") ? x : `${window.location.origin}/${x}`}&fmt=json3`;
						return m.push({
							source: "youtube",
							format: "json",
							language: _,
							isAutoGenerated: g?.kind === "asr",
							url: w
						}), O && g.isTranslatable && g.languageCode === F && p !== _ && m.push({
							source: "youtube",
							format: "json",
							language: p,
							isAutoGenerated: g?.kind === "asr",
							translatedFromLanguage: _,
							url: `${w}&tlang=${p}`
						}), m;
					}, []);
					return w.A.log("youtube subtitles:", U), U;
				}
				static getLanguage() {
					if (!YoutubeHelper.isMobile()) {
						let p = YoutubeHelper.getPlayer(), m = p?.getAudioTrack?.call(void 0)?.getLanguageInfo();
						if (m && m.id !== "und") return (0, D.ec)(m.id.split(".")[0]);
					}
					let p = YoutubeHelper.getPlayerResponse(), m = p?.captions?.playerCaptionsTracklistRenderer.captionTracks.find((p) => p.kind === "asr" && p.languageCode);
					return m ? (0, D.ec)(m.languageCode) : void 0;
				}
				async getVideoData(p) {
					let { title: m } = YoutubeHelper.getPlayerData() ?? {}, { shortDescription: g, isLive: _, title: w } = YoutubeHelper.getPlayerResponse()?.videoDetails ?? {}, D = YoutubeHelper.getSubtitles(this.language), O = YoutubeHelper.getLanguage();
					O && !x.xm.includes(O) && (O = void 0);
					let A = YoutubeHelper.getPlayer()?.getDuration?.call(void 0) ?? void 0;
					return {
						url: this.service.url + p,
						isStream: _,
						title: w,
						localizedTitle: m,
						detectedLanguage: O,
						description: g,
						subtitles: D,
						duration: A
					};
				}
				async getVideoId(p) {
					if (p.hostname === "youtu.be" && (p.search = `?v=${p.pathname.replace("/", "")}`, p.pathname = "/watch"), p.searchParams.has("enablejsapi")) {
						let m = YoutubeHelper.getPlayer()?.getVideoUrl();
						p = m ? new URL(m) : p;
					}
					return /(?:watch|embed|shorts|live)\/([^/]+)/.exec(p.pathname)?.[1] ?? p.searchParams.get("v");
				}
			}
		},
		"./node_modules/@vot.js/ext/dist/index.js": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						Ay: () => x.A,
						Pu: () => x.P
					});
					var x = g("./node_modules/@vot.js/ext/dist/client.js"), w = g("./node_modules/@vot.js/ext/dist/utils/videoData.js"), D = g("./node_modules/@vot.js/ext/dist/data/sites.js"), O = g("./node_modules/@vot.js/ext/dist/types/index.js"), A = g("./node_modules/@vot.js/ext/dist/helpers/index.js"), F = p([x]);
					x = (F.then ? (await F)() : F)[0], _();
				} catch (p) {
					_(p);
				}
			});
		},
		"./node_modules/@vot.js/ext/dist/types/index.js": (p, m, g) => {
			"use strict";
			var _ = g("./node_modules/@vot.js/ext/dist/types/service.js");
		},
		"./node_modules/@vot.js/ext/dist/types/service.js": (p, m, g) => {
			"use strict";
			g.d(m, { Q: () => x });
			var _ = g("./node_modules/@vot.js/core/dist/types/service.js"), x;
			(function(p) {
				p.udemy = "udemy", p.coursera = "coursera", p.douyin = "douyin", p.artstation = "artstation", p.kickstarter = "kickstarter", p.oraclelearn = "oraclelearn", p.deeplearningai = "deeplearningai", p.netacad = "netacad";
			})(x ||= {});
			let w = {
				..._.r,
				...x
			};
		},
		"./node_modules/@vot.js/ext/dist/utils/videoData.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				cQ: () => getService,
				jY: () => getVideoID,
				o4: () => getVideoData
			});
			var _ = g("./node_modules/@vot.js/core/dist/types/service.js"), x = g("./node_modules/@vot.js/core/dist/utils/videoData.js"), w = g("./node_modules/@vot.js/ext/dist/data/sites.js"), D = g("./node_modules/@vot.js/ext/dist/helpers/index.js");
			function getService() {
				if (x.$.exec(window.location.href)) return [];
				let p = window.location.hostname, m = new URL(window.location.href), isMatches = (g) => g instanceof RegExp ? g.test(p) : typeof g == "string" ? p.includes(g) : typeof g == "function" ? g(m) : !1;
				return w.A.filter((p) => (Array.isArray(p.match) ? p.match.some(isMatches) : isMatches(p.match)) && p.host && p.url);
			}
			async function getVideoID(p, m = {}) {
				let g = new URL(window.location.href), x = p.host;
				if (Object.keys(D.JW).includes(x)) {
					let p = new D.Ay(m).getHelper(x);
					return await p.getVideoId(g);
				}
				return x === _.r.custom ? g.href : void 0;
			}
			async function getVideoData(p, m = {}) {
				let g = await getVideoID(p, m);
				if (!g) throw new x.A(`Entered unsupported link: "${p.host}"`);
				let w = window.location.origin;
				if ([
					_.r.peertube,
					_.r.coursehunterLike,
					_.r.cloudflarestream
				].includes(p.host) && (p.url = w), p.rawResult) return {
					url: g,
					videoId: g,
					host: p.host,
					duration: void 0
				};
				if (!p.needExtraData) return {
					url: p.url + g,
					videoId: g,
					host: p.host,
					duration: void 0
				};
				let O = new D.Ay({
					...m,
					service: p,
					origin: w
				}).getHelper(p.host), A = await O.getVideoData(g);
				if (!A) throw new x.A(`Failed to get video raw url for ${p.host}`);
				return {
					...A,
					videoId: g,
					host: p.host
				};
			}
		},
		"./node_modules/@vot.js/shared/dist/data/alternativeUrls.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				Jo: () => x,
				My: () => A,
				TP: () => w,
				Xm: () => _,
				fV: () => D,
				r: () => U,
				sx: () => O
			});
			let _ = [
				"yewtu.be",
				"yt.artemislena.eu",
				"invidious.flokinet.to",
				"iv.melmac.space",
				"inv.nadeko.net",
				"inv.tux.pizza",
				"invidious.private.coffee",
				"yt.drgnz.club",
				"vid.puffyan.us",
				"invidious.dhusch.de"
			], x = "piped.video,piped.tokhmi.xyz,piped.moomoo.me,piped.syncpundit.io,piped.mha.fi,watch.whatever.social,piped.garudalinux.org,efy.piped.pages.dev,watch.leptons.xyz,piped.lunar.icu,yt.dc09.ru,piped.mint.lgbt,il.ax,piped.privacy.com.de,piped.esmailelbob.xyz,piped.projectsegfau.lt,piped.in.projectsegfau.lt,piped.us.projectsegfau.lt,piped.privacydev.net,piped.palveluntarjoaja.eu,piped.smnz.de,piped.adminforge.de,piped.qdi.fi,piped.hostux.net,piped.chauvet.pro,piped.jotoma.de,piped.pfcd.me,piped.frontendfriendly.xyz".split(","), w = [
				"proxitok.pabloferreiro.es",
				"proxitok.pussthecat.org",
				"tok.habedieeh.re",
				"proxitok.esmailelbob.xyz",
				"proxitok.privacydev.net",
				"tok.artemislena.eu",
				"tok.adminforge.de",
				"tt.vern.cc",
				"cringe.whatever.social",
				"proxitok.lunar.icu",
				"proxitok.privacy.com.de"
			], D = [
				"peertube.1312.media",
				"tube.shanti.cafe",
				"bee-tube.fr",
				"video.sadmin.io",
				"dalek.zone",
				"review.peertube.biz",
				"peervideo.club",
				"tube.la-dina.net",
				"peertube.tmp.rcp.tf",
				"peertube.su",
				"video.blender.org",
				"videos.viorsan.com",
				"tube-sciences-technologies.apps.education.fr",
				"tube-numerique-educatif.apps.education.fr",
				"tube-arts-lettres-sciences-humaines.apps.education.fr",
				"beetoons.tv",
				"comics.peertube.biz",
				"makertube.net"
			], O = [
				"poketube.fun",
				"pt.sudovanilla.org",
				"poke.ggtyler.dev",
				"poke.uk2.littlekai.co.uk",
				"poke.blahai.gay"
			], A = ["ricktube.ru"], F = null, U = ["coursehunter.net", "coursetrain.net"];
		},
		"./node_modules/@vot.js/shared/dist/data/config.js": (p, m, g) => {
			"use strict";
			g.d(m, { A: () => _ });
			let _ = {
				host: "api.browser.yandex.ru",
				hostVOT: "vot.toil.cc/v1",
				hostWorker: "vot-worker.toil.cc",
				mediaProxy: "media-proxy.toil.cc",
				userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 YaBrowser/25.4.0.0 Safari/537.36",
				componentVersion: "25.6.0.2259",
				hmac: "bt8xH3VOlb4mqf0nqAibnDOoiPlXsisf",
				defaultDuration: 343,
				minChunkSize: 5295308,
				loggerLevel: 1,
				version: "2.4.12"
			};
		},
		"./node_modules/@vot.js/shared/dist/data/consts.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				EG: () => w,
				Xh: () => x,
				xm: () => _
			});
			let _ = [
				"auto",
				"ru",
				"en",
				"zh",
				"ko",
				"lt",
				"lv",
				"ar",
				"fr",
				"it",
				"es",
				"de",
				"ja"
			], x = [
				"ru",
				"en",
				"kk"
			], w = [
				"srt",
				"vtt",
				"json"
			];
		},
		"./node_modules/@vot.js/shared/dist/index.js": (p, m, g) => {
			"use strict";
			g.d(m, { $W: () => _.A });
			var _ = g("./node_modules/@vot.js/shared/dist/data/config.js"), x = g("./node_modules/@vot.js/shared/dist/protos/yandex.js"), w = g("./node_modules/@vot.js/shared/dist/utils/logger.js"), D = g("./node_modules/@vot.js/shared/dist/utils/utils.js"), O = g("./node_modules/@vot.js/shared/dist/types/logger.js"), A;
			(function(p) {
				p.Channel = "Channel", p.Video = "Video";
			})(A ||= {});
		},
		"./node_modules/@vot.js/shared/dist/protos/yandex.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				q8: () => le,
				kO: () => st,
				Xv: () => at,
				n_: () => ot,
				P4: () => nt,
				LD: () => rt,
				Y7: () => qe,
				Wi: () => Ye,
				Yx: () => Be,
				ZK: () => Ve,
				yy: () => we,
				AJ: () => je,
				ls: () => ct,
				Bv: () => dt
			});
			function varint64read() {
				let p = 0, m = 0;
				for (let g = 0; g < 28; g += 7) {
					let _ = this.buf[this.pos++];
					if (p |= (_ & 127) << g, !(_ & 128)) return this.assertBounds(), [p, m];
				}
				let g = this.buf[this.pos++];
				if (p |= (g & 15) << 28, m = (g & 112) >> 4, !(g & 128)) return this.assertBounds(), [p, m];
				for (let g = 3; g <= 31; g += 7) {
					let _ = this.buf[this.pos++];
					if (m |= (_ & 127) << g, !(_ & 128)) return this.assertBounds(), [p, m];
				}
				throw Error("invalid varint");
			}
			function varint64write(p, m, g) {
				for (let _ = 0; _ < 28; _ += 7) {
					let x = p >>> _, w = !(!(x >>> 7) && m == 0), D = (w ? x | 128 : x) & 255;
					if (g.push(D), !w) return;
				}
				let _ = p >>> 28 & 15 | (m & 7) << 4, x = !!(m >> 3);
				if (g.push((x ? _ | 128 : _) & 255), x) {
					for (let p = 3; p < 31; p += 7) {
						let _ = m >>> p, x = !!(_ >>> 7), w = (x ? _ | 128 : _) & 255;
						if (g.push(w), !x) return;
					}
					g.push(m >>> 31 & 1);
				}
			}
			let _ = 4294967296;
			function int64FromString(p) {
				let m = p[0] === "-";
				m && (p = p.slice(1));
				let g = 1e6, x = 0, w = 0;
				function add1e6digit(m, D) {
					let O = Number(p.slice(m, D));
					w *= g, x = x * g + O, x >= _ && (w += x / _ | 0, x %= _);
				}
				return add1e6digit(-24, -18), add1e6digit(-18, -12), add1e6digit(-12, -6), add1e6digit(-6), m ? negate(x, w) : newBits(x, w);
			}
			function int64ToString(p, m) {
				let g = newBits(p, m), _ = g.hi & 2147483648;
				_ && (g = negate(g.lo, g.hi));
				let x = uInt64ToString(g.lo, g.hi);
				return _ ? "-" + x : x;
			}
			function uInt64ToString(p, m) {
				if ({lo: p, hi: m} = toUnsigned(p, m), m <= 2097151) return String(_ * m + p);
				let g = p & 16777215, x = (p >>> 24 | m << 8) & 16777215, w = m >> 16 & 65535, D = g + x * 6777216 + w * 6710656, O = x + w * 8147497, A = w * 2, F = 1e7;
				return D >= F && (O += Math.floor(D / F), D %= F), O >= F && (A += Math.floor(O / F), O %= F), A.toString() + decimalFrom1e7WithLeadingZeros(O) + decimalFrom1e7WithLeadingZeros(D);
			}
			function toUnsigned(p, m) {
				return {
					lo: p >>> 0,
					hi: m >>> 0
				};
			}
			function newBits(p, m) {
				return {
					lo: p | 0,
					hi: m | 0
				};
			}
			function negate(p, m) {
				return m = ~m, p ? p = ~p + 1 : m += 1, newBits(p, m);
			}
			let decimalFrom1e7WithLeadingZeros = (p) => {
				let m = String(p);
				return "0000000".slice(m.length) + m;
			};
			function varint32write(p, m) {
				if (p >= 0) {
					for (; p > 127;) m.push(p & 127 | 128), p >>>= 7;
					m.push(p);
				} else {
					for (let g = 0; g < 9; g++) m.push(p & 127 | 128), p >>= 7;
					m.push(1);
				}
			}
			function varint32read() {
				let p = this.buf[this.pos++], m = p & 127;
				if (!(p & 128) || (p = this.buf[this.pos++], m |= (p & 127) << 7, !(p & 128)) || (p = this.buf[this.pos++], m |= (p & 127) << 14, !(p & 128)) || (p = this.buf[this.pos++], m |= (p & 127) << 21, !(p & 128))) return this.assertBounds(), m;
				p = this.buf[this.pos++], m |= (p & 15) << 28;
				for (let m = 5; p & 128 && m < 10; m++) p = this.buf[this.pos++];
				if (p & 128) throw Error("invalid varint");
				return this.assertBounds(), m >>> 0;
			}
			let x = makeInt64Support();
			function makeInt64Support() {
				let p = new DataView(new ArrayBuffer(8)), m = typeof BigInt == "function" && typeof p.getBigInt64 == "function" && typeof p.getBigUint64 == "function" && typeof p.setBigInt64 == "function" && typeof p.setBigUint64 == "function" && (!!globalThis.Deno || typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1");
				if (m) {
					let m = BigInt("-9223372036854775808"), g = BigInt("9223372036854775807"), _ = BigInt("0"), x = BigInt("18446744073709551615");
					return {
						zero: BigInt(0),
						supported: !0,
						parse(p) {
							let _ = typeof p == "bigint" ? p : BigInt(p);
							if (_ > g || _ < m) throw Error(`invalid int64: ${p}`);
							return _;
						},
						uParse(p) {
							let m = typeof p == "bigint" ? p : BigInt(p);
							if (m > x || m < _) throw Error(`invalid uint64: ${p}`);
							return m;
						},
						enc(m) {
							return p.setBigInt64(0, this.parse(m), !0), {
								lo: p.getInt32(0, !0),
								hi: p.getInt32(4, !0)
							};
						},
						uEnc(m) {
							return p.setBigInt64(0, this.uParse(m), !0), {
								lo: p.getInt32(0, !0),
								hi: p.getInt32(4, !0)
							};
						},
						dec(m, g) {
							return p.setInt32(0, m, !0), p.setInt32(4, g, !0), p.getBigInt64(0, !0);
						},
						uDec(m, g) {
							return p.setInt32(0, m, !0), p.setInt32(4, g, !0), p.getBigUint64(0, !0);
						}
					};
				}
				return {
					zero: "0",
					supported: !1,
					parse(p) {
						return typeof p != "string" && (p = p.toString()), assertInt64String(p), p;
					},
					uParse(p) {
						return typeof p != "string" && (p = p.toString()), assertUInt64String(p), p;
					},
					enc(p) {
						return typeof p != "string" && (p = p.toString()), assertInt64String(p), int64FromString(p);
					},
					uEnc(p) {
						return typeof p != "string" && (p = p.toString()), assertUInt64String(p), int64FromString(p);
					},
					dec(p, m) {
						return int64ToString(p, m);
					},
					uDec(p, m) {
						return uInt64ToString(p, m);
					}
				};
			}
			function assertInt64String(p) {
				if (!/^-?[0-9]+$/.test(p)) throw Error("invalid int64: " + p);
			}
			function assertUInt64String(p) {
				if (!/^[0-9]+$/.test(p)) throw Error("invalid uint64: " + p);
			}
			let w = Symbol.for("@bufbuild/protobuf/text-encoding");
			function configureTextEncoding(p) {
				globalThis[w] = p;
			}
			function getTextEncoding() {
				if (globalThis[w] == null) {
					let p = new globalThis.TextEncoder(), m = new globalThis.TextDecoder();
					globalThis[w] = {
						encodeUtf8(m) {
							return p.encode(m);
						},
						decodeUtf8(p) {
							return m.decode(p);
						},
						checkUtf8(p) {
							try {
								return encodeURIComponent(p), !0;
							} catch {
								return !1;
							}
						}
					};
				}
				return globalThis[w];
			}
			var D;
			(function(p) {
				p[p.Varint = 0] = "Varint", p[p.Bit64 = 1] = "Bit64", p[p.LengthDelimited = 2] = "LengthDelimited", p[p.StartGroup = 3] = "StartGroup", p[p.EndGroup = 4] = "EndGroup", p[p.Bit32 = 5] = "Bit32";
			})(D ||= {});
			let O = 34028234663852886e22, A = -34028234663852886e22, F = 4294967295, U = 2147483647, K = -2147483648;
			class BinaryWriter {
				constructor(p = getTextEncoding().encodeUtf8) {
					this.encodeUtf8 = p, this.stack = [], this.chunks = [], this.buf = [];
				}
				finish() {
					this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []);
					let p = 0;
					for (let m = 0; m < this.chunks.length; m++) p += this.chunks[m].length;
					let m = new Uint8Array(p), g = 0;
					for (let p = 0; p < this.chunks.length; p++) m.set(this.chunks[p], g), g += this.chunks[p].length;
					return this.chunks = [], m;
				}
				fork() {
					return this.stack.push({
						chunks: this.chunks,
						buf: this.buf
					}), this.chunks = [], this.buf = [], this;
				}
				join() {
					let p = this.finish(), m = this.stack.pop();
					if (!m) throw Error("invalid state, fork stack empty");
					return this.chunks = m.chunks, this.buf = m.buf, this.uint32(p.byteLength), this.raw(p);
				}
				tag(p, m) {
					return this.uint32((p << 3 | m) >>> 0);
				}
				raw(p) {
					return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(p), this;
				}
				uint32(p) {
					for (assertUInt32(p); p > 127;) this.buf.push(p & 127 | 128), p >>>= 7;
					return this.buf.push(p), this;
				}
				int32(p) {
					return assertInt32(p), varint32write(p, this.buf), this;
				}
				bool(p) {
					return this.buf.push(p ? 1 : 0), this;
				}
				bytes(p) {
					return this.uint32(p.byteLength), this.raw(p);
				}
				string(p) {
					let m = this.encodeUtf8(p);
					return this.uint32(m.byteLength), this.raw(m);
				}
				float(p) {
					assertFloat32(p);
					let m = new Uint8Array(4);
					return new DataView(m.buffer).setFloat32(0, p, !0), this.raw(m);
				}
				double(p) {
					let m = new Uint8Array(8);
					return new DataView(m.buffer).setFloat64(0, p, !0), this.raw(m);
				}
				fixed32(p) {
					assertUInt32(p);
					let m = new Uint8Array(4);
					return new DataView(m.buffer).setUint32(0, p, !0), this.raw(m);
				}
				sfixed32(p) {
					assertInt32(p);
					let m = new Uint8Array(4);
					return new DataView(m.buffer).setInt32(0, p, !0), this.raw(m);
				}
				sint32(p) {
					return assertInt32(p), p = (p << 1 ^ p >> 31) >>> 0, varint32write(p, this.buf), this;
				}
				sfixed64(p) {
					let m = new Uint8Array(8), g = new DataView(m.buffer), _ = x.enc(p);
					return g.setInt32(0, _.lo, !0), g.setInt32(4, _.hi, !0), this.raw(m);
				}
				fixed64(p) {
					let m = new Uint8Array(8), g = new DataView(m.buffer), _ = x.uEnc(p);
					return g.setInt32(0, _.lo, !0), g.setInt32(4, _.hi, !0), this.raw(m);
				}
				int64(p) {
					let m = x.enc(p);
					return varint64write(m.lo, m.hi, this.buf), this;
				}
				sint64(p) {
					let m = x.enc(p), g = m.hi >> 31, _ = m.lo << 1 ^ g, w = (m.hi << 1 | m.lo >>> 31) ^ g;
					return varint64write(_, w, this.buf), this;
				}
				uint64(p) {
					let m = x.uEnc(p);
					return varint64write(m.lo, m.hi, this.buf), this;
				}
			}
			class BinaryReader {
				constructor(p, m = getTextEncoding().decodeUtf8) {
					this.decodeUtf8 = m, this.varint64 = varint64read, this.uint32 = varint32read, this.buf = p, this.len = p.length, this.pos = 0, this.view = new DataView(p.buffer, p.byteOffset, p.byteLength);
				}
				tag() {
					let p = this.uint32(), m = p >>> 3, g = p & 7;
					if (m <= 0 || g < 0 || g > 5) throw Error("illegal tag: field no " + m + " wire type " + g);
					return [m, g];
				}
				skip(p, m) {
					let g = this.pos;
					switch (p) {
						case D.Varint:
							for (; this.buf[this.pos++] & 128;);
							break;
						case D.Bit64: this.pos += 4;
						case D.Bit32:
							this.pos += 4;
							break;
						case D.LengthDelimited:
							let g = this.uint32();
							this.pos += g;
							break;
						case D.StartGroup:
							for (;;) {
								let [p, g] = this.tag();
								if (g === D.EndGroup) {
									if (m !== void 0 && p !== m) throw Error("invalid end group tag");
									break;
								}
								this.skip(g, p);
							}
							break;
						default: throw Error("cant skip wire type " + p);
					}
					return this.assertBounds(), this.buf.subarray(g, this.pos);
				}
				assertBounds() {
					if (this.pos > this.len) throw RangeError("premature EOF");
				}
				int32() {
					return this.uint32() | 0;
				}
				sint32() {
					let p = this.uint32();
					return p >>> 1 ^ -(p & 1);
				}
				int64() {
					return x.dec(...this.varint64());
				}
				uint64() {
					return x.uDec(...this.varint64());
				}
				sint64() {
					let [p, m] = this.varint64(), g = -(p & 1);
					return p = (p >>> 1 | (m & 1) << 31) ^ g, m = m >>> 1 ^ g, x.dec(p, m);
				}
				bool() {
					let [p, m] = this.varint64();
					return p !== 0 || m !== 0;
				}
				fixed32() {
					return this.view.getUint32((this.pos += 4) - 4, !0);
				}
				sfixed32() {
					return this.view.getInt32((this.pos += 4) - 4, !0);
				}
				fixed64() {
					return x.uDec(this.sfixed32(), this.sfixed32());
				}
				sfixed64() {
					return x.dec(this.sfixed32(), this.sfixed32());
				}
				float() {
					return this.view.getFloat32((this.pos += 4) - 4, !0);
				}
				double() {
					return this.view.getFloat64((this.pos += 8) - 8, !0);
				}
				bytes() {
					let p = this.uint32(), m = this.pos;
					return this.pos += p, this.assertBounds(), this.buf.subarray(m, m + p);
				}
				string() {
					return this.decodeUtf8(this.bytes());
				}
			}
			function assertInt32(p) {
				if (typeof p == "string") p = Number(p);
				else if (typeof p != "number") throw Error("invalid int32: " + typeof p);
				if (!Number.isInteger(p) || p > U || p < K) throw Error("invalid int32: " + p);
			}
			function assertUInt32(p) {
				if (typeof p == "string") p = Number(p);
				else if (typeof p != "number") throw Error("invalid uint32: " + typeof p);
				if (!Number.isInteger(p) || p > F || p < 0) throw Error("invalid uint32: " + p);
			}
			function assertFloat32(p) {
				if (typeof p == "string") {
					let m = p;
					if (p = Number(p), Number.isNaN(p) && m !== "NaN") throw Error("invalid float32: " + m);
				} else if (typeof p != "number") throw Error("invalid float32: " + typeof p);
				if (Number.isFinite(p) && (p > O || p < A)) throw Error("invalid float32: " + p);
			}
			let oe = "";
			var le;
			(function(p) {
				p[p.NO_CONNECTION = 0] = "NO_CONNECTION", p[p.TRANSLATING = 10] = "TRANSLATING", p[p.STREAMING = 20] = "STREAMING", p[p.UNRECOGNIZED = -1] = "UNRECOGNIZED";
			})(le ||= {});
			function streamIntervalFromJSON(p) {
				switch (p) {
					case 0:
					case "NO_CONNECTION": return le.NO_CONNECTION;
					case 10:
					case "TRANSLATING": return le.TRANSLATING;
					case 20:
					case "STREAMING": return le.STREAMING;
					case -1:
					case "UNRECOGNIZED":
					default: return le.UNRECOGNIZED;
				}
			}
			function streamIntervalToJSON(p) {
				switch (p) {
					case le.NO_CONNECTION: return "NO_CONNECTION";
					case le.TRANSLATING: return "TRANSLATING";
					case le.STREAMING: return "STREAMING";
					case le.UNRECOGNIZED:
					default: return "UNRECOGNIZED";
				}
			}
			function createBaseVideoTranslationHelpObject() {
				return {
					target: "",
					targetUrl: ""
				};
			}
			let ue = {
				encode(p, m = new BinaryWriter()) {
					return p.target !== "" && m.uint32(10).string(p.target), p.targetUrl !== "" && m.uint32(18).string(p.targetUrl), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationHelpObject();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.target = g.string();
								continue;
							case 2:
								if (p !== 18) break;
								x.targetUrl = g.string();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						target: isSet(p.target) ? globalThis.String(p.target) : "",
						targetUrl: isSet(p.targetUrl) ? globalThis.String(p.targetUrl) : ""
					};
				},
				toJSON(p) {
					let m = {};
					return p.target !== "" && (m.target = p.target), p.targetUrl !== "" && (m.targetUrl = p.targetUrl), m;
				},
				create(p) {
					return ue.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationHelpObject();
					return m.target = p.target ?? "", m.targetUrl = p.targetUrl ?? "", m;
				}
			};
			function createBaseVideoTranslationRequest() {
				return {
					url: "",
					deviceId: void 0,
					firstRequest: !1,
					duration: 0,
					unknown0: 0,
					language: "",
					forceSourceLang: !1,
					unknown1: 0,
					translationHelp: [],
					wasStream: !1,
					responseLanguage: "",
					unknown2: 0,
					unknown3: 0,
					bypassCache: !1,
					useLivelyVoice: !1,
					videoTitle: ""
				};
			}
			let we = {
				encode(p, m = new BinaryWriter()) {
					p.url !== "" && m.uint32(26).string(p.url), p.deviceId !== void 0 && m.uint32(34).string(p.deviceId), p.firstRequest !== !1 && m.uint32(40).bool(p.firstRequest), p.duration !== 0 && m.uint32(49).double(p.duration), p.unknown0 !== 0 && m.uint32(56).int32(p.unknown0), p.language !== "" && m.uint32(66).string(p.language), p.forceSourceLang !== !1 && m.uint32(72).bool(p.forceSourceLang), p.unknown1 !== 0 && m.uint32(80).int32(p.unknown1);
					for (let g of p.translationHelp) ue.encode(g, m.uint32(90).fork()).join();
					return p.wasStream !== !1 && m.uint32(104).bool(p.wasStream), p.responseLanguage !== "" && m.uint32(114).string(p.responseLanguage), p.unknown2 !== 0 && m.uint32(120).int32(p.unknown2), p.unknown3 !== 0 && m.uint32(128).int32(p.unknown3), p.bypassCache !== !1 && m.uint32(136).bool(p.bypassCache), p.useLivelyVoice !== !1 && m.uint32(144).bool(p.useLivelyVoice), p.videoTitle !== "" && m.uint32(154).string(p.videoTitle), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationRequest();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 3:
								if (p !== 26) break;
								x.url = g.string();
								continue;
							case 4:
								if (p !== 34) break;
								x.deviceId = g.string();
								continue;
							case 5:
								if (p !== 40) break;
								x.firstRequest = g.bool();
								continue;
							case 6:
								if (p !== 49) break;
								x.duration = g.double();
								continue;
							case 7:
								if (p !== 56) break;
								x.unknown0 = g.int32();
								continue;
							case 8:
								if (p !== 66) break;
								x.language = g.string();
								continue;
							case 9:
								if (p !== 72) break;
								x.forceSourceLang = g.bool();
								continue;
							case 10:
								if (p !== 80) break;
								x.unknown1 = g.int32();
								continue;
							case 11:
								if (p !== 90) break;
								x.translationHelp.push(ue.decode(g, g.uint32()));
								continue;
							case 13:
								if (p !== 104) break;
								x.wasStream = g.bool();
								continue;
							case 14:
								if (p !== 114) break;
								x.responseLanguage = g.string();
								continue;
							case 15:
								if (p !== 120) break;
								x.unknown2 = g.int32();
								continue;
							case 16:
								if (p !== 128) break;
								x.unknown3 = g.int32();
								continue;
							case 17:
								if (p !== 136) break;
								x.bypassCache = g.bool();
								continue;
							case 18:
								if (p !== 144) break;
								x.useLivelyVoice = g.bool();
								continue;
							case 19:
								if (p !== 154) break;
								x.videoTitle = g.string();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						url: isSet(p.url) ? globalThis.String(p.url) : "",
						deviceId: isSet(p.deviceId) ? globalThis.String(p.deviceId) : void 0,
						firstRequest: isSet(p.firstRequest) ? globalThis.Boolean(p.firstRequest) : !1,
						duration: isSet(p.duration) ? globalThis.Number(p.duration) : 0,
						unknown0: isSet(p.unknown0) ? globalThis.Number(p.unknown0) : 0,
						language: isSet(p.language) ? globalThis.String(p.language) : "",
						forceSourceLang: isSet(p.forceSourceLang) ? globalThis.Boolean(p.forceSourceLang) : !1,
						unknown1: isSet(p.unknown1) ? globalThis.Number(p.unknown1) : 0,
						translationHelp: globalThis.Array.isArray(p?.translationHelp) ? p.translationHelp.map((p) => ue.fromJSON(p)) : [],
						wasStream: isSet(p.wasStream) ? globalThis.Boolean(p.wasStream) : !1,
						responseLanguage: isSet(p.responseLanguage) ? globalThis.String(p.responseLanguage) : "",
						unknown2: isSet(p.unknown2) ? globalThis.Number(p.unknown2) : 0,
						unknown3: isSet(p.unknown3) ? globalThis.Number(p.unknown3) : 0,
						bypassCache: isSet(p.bypassCache) ? globalThis.Boolean(p.bypassCache) : !1,
						useLivelyVoice: isSet(p.useLivelyVoice) ? globalThis.Boolean(p.useLivelyVoice) : !1,
						videoTitle: isSet(p.videoTitle) ? globalThis.String(p.videoTitle) : ""
					};
				},
				toJSON(p) {
					let m = {};
					return p.url !== "" && (m.url = p.url), p.deviceId !== void 0 && (m.deviceId = p.deviceId), p.firstRequest !== !1 && (m.firstRequest = p.firstRequest), p.duration !== 0 && (m.duration = p.duration), p.unknown0 !== 0 && (m.unknown0 = Math.round(p.unknown0)), p.language !== "" && (m.language = p.language), p.forceSourceLang !== !1 && (m.forceSourceLang = p.forceSourceLang), p.unknown1 !== 0 && (m.unknown1 = Math.round(p.unknown1)), p.translationHelp?.length && (m.translationHelp = p.translationHelp.map((p) => ue.toJSON(p))), p.wasStream !== !1 && (m.wasStream = p.wasStream), p.responseLanguage !== "" && (m.responseLanguage = p.responseLanguage), p.unknown2 !== 0 && (m.unknown2 = Math.round(p.unknown2)), p.unknown3 !== 0 && (m.unknown3 = Math.round(p.unknown3)), p.bypassCache !== !1 && (m.bypassCache = p.bypassCache), p.useLivelyVoice !== !1 && (m.useLivelyVoice = p.useLivelyVoice), p.videoTitle !== "" && (m.videoTitle = p.videoTitle), m;
				},
				create(p) {
					return we.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationRequest();
					return m.url = p.url ?? "", m.deviceId = p.deviceId ?? void 0, m.firstRequest = p.firstRequest ?? !1, m.duration = p.duration ?? 0, m.unknown0 = p.unknown0 ?? 0, m.language = p.language ?? "", m.forceSourceLang = p.forceSourceLang ?? !1, m.unknown1 = p.unknown1 ?? 0, m.translationHelp = p.translationHelp?.map((p) => ue.fromPartial(p)) || [], m.wasStream = p.wasStream ?? !1, m.responseLanguage = p.responseLanguage ?? "", m.unknown2 = p.unknown2 ?? 0, m.unknown3 = p.unknown3 ?? 0, m.bypassCache = p.bypassCache ?? !1, m.useLivelyVoice = p.useLivelyVoice ?? !1, m.videoTitle = p.videoTitle ?? "", m;
				}
			};
			function createBaseVideoTranslationResponse() {
				return {
					url: void 0,
					duration: void 0,
					status: 0,
					remainingTime: void 0,
					unknown0: void 0,
					translationId: "",
					language: void 0,
					message: void 0,
					isLivelyVoice: !1,
					unknown2: void 0,
					shouldRetry: void 0,
					unknown3: void 0
				};
			}
			let je = {
				encode(p, m = new BinaryWriter()) {
					return p.url !== void 0 && m.uint32(10).string(p.url), p.duration !== void 0 && m.uint32(17).double(p.duration), p.status !== 0 && m.uint32(32).int32(p.status), p.remainingTime !== void 0 && m.uint32(40).int32(p.remainingTime), p.unknown0 !== void 0 && m.uint32(48).int32(p.unknown0), p.translationId !== "" && m.uint32(58).string(p.translationId), p.language !== void 0 && m.uint32(66).string(p.language), p.message !== void 0 && m.uint32(74).string(p.message), p.isLivelyVoice !== !1 && m.uint32(80).bool(p.isLivelyVoice), p.unknown2 !== void 0 && m.uint32(88).int32(p.unknown2), p.shouldRetry !== void 0 && m.uint32(96).int32(p.shouldRetry), p.unknown3 !== void 0 && m.uint32(104).int32(p.unknown3), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationResponse();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.url = g.string();
								continue;
							case 2:
								if (p !== 17) break;
								x.duration = g.double();
								continue;
							case 4:
								if (p !== 32) break;
								x.status = g.int32();
								continue;
							case 5:
								if (p !== 40) break;
								x.remainingTime = g.int32();
								continue;
							case 6:
								if (p !== 48) break;
								x.unknown0 = g.int32();
								continue;
							case 7:
								if (p !== 58) break;
								x.translationId = g.string();
								continue;
							case 8:
								if (p !== 66) break;
								x.language = g.string();
								continue;
							case 9:
								if (p !== 74) break;
								x.message = g.string();
								continue;
							case 10:
								if (p !== 80) break;
								x.isLivelyVoice = g.bool();
								continue;
							case 11:
								if (p !== 88) break;
								x.unknown2 = g.int32();
								continue;
							case 12:
								if (p !== 96) break;
								x.shouldRetry = g.int32();
								continue;
							case 13:
								if (p !== 104) break;
								x.unknown3 = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						url: isSet(p.url) ? globalThis.String(p.url) : void 0,
						duration: isSet(p.duration) ? globalThis.Number(p.duration) : void 0,
						status: isSet(p.status) ? globalThis.Number(p.status) : 0,
						remainingTime: isSet(p.remainingTime) ? globalThis.Number(p.remainingTime) : void 0,
						unknown0: isSet(p.unknown0) ? globalThis.Number(p.unknown0) : void 0,
						translationId: isSet(p.translationId) ? globalThis.String(p.translationId) : "",
						language: isSet(p.language) ? globalThis.String(p.language) : void 0,
						message: isSet(p.message) ? globalThis.String(p.message) : void 0,
						isLivelyVoice: isSet(p.isLivelyVoice) ? globalThis.Boolean(p.isLivelyVoice) : !1,
						unknown2: isSet(p.unknown2) ? globalThis.Number(p.unknown2) : void 0,
						shouldRetry: isSet(p.shouldRetry) ? globalThis.Number(p.shouldRetry) : void 0,
						unknown3: isSet(p.unknown3) ? globalThis.Number(p.unknown3) : void 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.url !== void 0 && (m.url = p.url), p.duration !== void 0 && (m.duration = p.duration), p.status !== 0 && (m.status = Math.round(p.status)), p.remainingTime !== void 0 && (m.remainingTime = Math.round(p.remainingTime)), p.unknown0 !== void 0 && (m.unknown0 = Math.round(p.unknown0)), p.translationId !== "" && (m.translationId = p.translationId), p.language !== void 0 && (m.language = p.language), p.message !== void 0 && (m.message = p.message), p.isLivelyVoice !== !1 && (m.isLivelyVoice = p.isLivelyVoice), p.unknown2 !== void 0 && (m.unknown2 = Math.round(p.unknown2)), p.shouldRetry !== void 0 && (m.shouldRetry = Math.round(p.shouldRetry)), p.unknown3 !== void 0 && (m.unknown3 = Math.round(p.unknown3)), m;
				},
				create(p) {
					return je.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationResponse();
					return m.url = p.url ?? void 0, m.duration = p.duration ?? void 0, m.status = p.status ?? 0, m.remainingTime = p.remainingTime ?? void 0, m.unknown0 = p.unknown0 ?? void 0, m.translationId = p.translationId ?? "", m.language = p.language ?? void 0, m.message = p.message ?? void 0, m.isLivelyVoice = p.isLivelyVoice ?? !1, m.unknown2 = p.unknown2 ?? void 0, m.shouldRetry = p.shouldRetry ?? void 0, m.unknown3 = p.unknown3 ?? void 0, m;
				}
			};
			function createBaseVideoTranslationCacheItem() {
				return {
					status: 0,
					remainingTime: void 0,
					message: void 0,
					unknown0: void 0
				};
			}
			let Ie = {
				encode(p, m = new BinaryWriter()) {
					return p.status !== 0 && m.uint32(8).int32(p.status), p.remainingTime !== void 0 && m.uint32(16).int32(p.remainingTime), p.message !== void 0 && m.uint32(26).string(p.message), p.unknown0 !== void 0 && m.uint32(32).int32(p.unknown0), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationCacheItem();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 8) break;
								x.status = g.int32();
								continue;
							case 2:
								if (p !== 16) break;
								x.remainingTime = g.int32();
								continue;
							case 3:
								if (p !== 26) break;
								x.message = g.string();
								continue;
							case 4:
								if (p !== 32) break;
								x.unknown0 = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						status: isSet(p.status) ? globalThis.Number(p.status) : 0,
						remainingTime: isSet(p.remainingTime) ? globalThis.Number(p.remainingTime) : void 0,
						message: isSet(p.message) ? globalThis.String(p.message) : void 0,
						unknown0: isSet(p.unknown0) ? globalThis.Number(p.unknown0) : void 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.status !== 0 && (m.status = Math.round(p.status)), p.remainingTime !== void 0 && (m.remainingTime = Math.round(p.remainingTime)), p.message !== void 0 && (m.message = p.message), p.unknown0 !== void 0 && (m.unknown0 = Math.round(p.unknown0)), m;
				},
				create(p) {
					return Ie.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationCacheItem();
					return m.status = p.status ?? 0, m.remainingTime = p.remainingTime ?? void 0, m.message = p.message ?? void 0, m.unknown0 = p.unknown0 ?? void 0, m;
				}
			};
			function createBaseVideoTranslationCacheRequest() {
				return {
					url: "",
					duration: 0,
					language: "",
					responseLanguage: ""
				};
			}
			let Be = {
				encode(p, m = new BinaryWriter()) {
					return p.url !== "" && m.uint32(10).string(p.url), p.duration !== 0 && m.uint32(17).double(p.duration), p.language !== "" && m.uint32(26).string(p.language), p.responseLanguage !== "" && m.uint32(34).string(p.responseLanguage), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationCacheRequest();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.url = g.string();
								continue;
							case 2:
								if (p !== 17) break;
								x.duration = g.double();
								continue;
							case 3:
								if (p !== 26) break;
								x.language = g.string();
								continue;
							case 4:
								if (p !== 34) break;
								x.responseLanguage = g.string();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						url: isSet(p.url) ? globalThis.String(p.url) : "",
						duration: isSet(p.duration) ? globalThis.Number(p.duration) : 0,
						language: isSet(p.language) ? globalThis.String(p.language) : "",
						responseLanguage: isSet(p.responseLanguage) ? globalThis.String(p.responseLanguage) : ""
					};
				},
				toJSON(p) {
					let m = {};
					return p.url !== "" && (m.url = p.url), p.duration !== 0 && (m.duration = p.duration), p.language !== "" && (m.language = p.language), p.responseLanguage !== "" && (m.responseLanguage = p.responseLanguage), m;
				},
				create(p) {
					return Be.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationCacheRequest();
					return m.url = p.url ?? "", m.duration = p.duration ?? 0, m.language = p.language ?? "", m.responseLanguage = p.responseLanguage ?? "", m;
				}
			};
			function createBaseVideoTranslationCacheResponse() {
				return {
					default: void 0,
					cloning: void 0
				};
			}
			let Ve = {
				encode(p, m = new BinaryWriter()) {
					return p.default !== void 0 && Ie.encode(p.default, m.uint32(10).fork()).join(), p.cloning !== void 0 && Ie.encode(p.cloning, m.uint32(18).fork()).join(), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationCacheResponse();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.default = Ie.decode(g, g.uint32());
								continue;
							case 2:
								if (p !== 18) break;
								x.cloning = Ie.decode(g, g.uint32());
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						default: isSet(p.default) ? Ie.fromJSON(p.default) : void 0,
						cloning: isSet(p.cloning) ? Ie.fromJSON(p.cloning) : void 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.default !== void 0 && (m.default = Ie.toJSON(p.default)), p.cloning !== void 0 && (m.cloning = Ie.toJSON(p.cloning)), m;
				},
				create(p) {
					return Ve.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationCacheResponse();
					return m.default = p.default !== void 0 && p.default !== null ? Ie.fromPartial(p.default) : void 0, m.cloning = p.cloning !== void 0 && p.cloning !== null ? Ie.fromPartial(p.cloning) : void 0, m;
				}
			};
			function createBaseAudioBufferObject() {
				return {
					audioFile: new Uint8Array(),
					fileId: ""
				};
			}
			let Ue = {
				encode(p, m = new BinaryWriter()) {
					return p.audioFile.length !== 0 && m.uint32(18).bytes(p.audioFile), p.fileId !== "" && m.uint32(10).string(p.fileId), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseAudioBufferObject();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 2:
								if (p !== 18) break;
								x.audioFile = g.bytes();
								continue;
							case 1:
								if (p !== 10) break;
								x.fileId = g.string();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						audioFile: isSet(p.audioFile) ? bytesFromBase64(p.audioFile) : new Uint8Array(),
						fileId: isSet(p.fileId) ? globalThis.String(p.fileId) : ""
					};
				},
				toJSON(p) {
					let m = {};
					return p.audioFile.length !== 0 && (m.audioFile = base64FromBytes(p.audioFile)), p.fileId !== "" && (m.fileId = p.fileId), m;
				},
				create(p) {
					return Ue.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseAudioBufferObject();
					return m.audioFile = p.audioFile ?? new Uint8Array(), m.fileId = p.fileId ?? "", m;
				}
			};
			function createBasePartialAudioBufferObject() {
				return {
					audioFile: new Uint8Array(),
					chunkId: 0
				};
			}
			let We = {
				encode(p, m = new BinaryWriter()) {
					return p.audioFile.length !== 0 && m.uint32(18).bytes(p.audioFile), p.chunkId !== 0 && m.uint32(8).int32(p.chunkId), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBasePartialAudioBufferObject();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 2:
								if (p !== 18) break;
								x.audioFile = g.bytes();
								continue;
							case 1:
								if (p !== 8) break;
								x.chunkId = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						audioFile: isSet(p.audioFile) ? bytesFromBase64(p.audioFile) : new Uint8Array(),
						chunkId: isSet(p.chunkId) ? globalThis.Number(p.chunkId) : 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.audioFile.length !== 0 && (m.audioFile = base64FromBytes(p.audioFile)), p.chunkId !== 0 && (m.chunkId = Math.round(p.chunkId)), m;
				},
				create(p) {
					return We.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBasePartialAudioBufferObject();
					return m.audioFile = p.audioFile ?? new Uint8Array(), m.chunkId = p.chunkId ?? 0, m;
				}
			};
			function createBaseChunkAudioObject() {
				return {
					audioBuffer: void 0,
					audioPartsLength: 0,
					fileId: "",
					version: 0
				};
			}
			let Ke = {
				encode(p, m = new BinaryWriter()) {
					return p.audioBuffer !== void 0 && We.encode(p.audioBuffer, m.uint32(10).fork()).join(), p.audioPartsLength !== 0 && m.uint32(16).int32(p.audioPartsLength), p.fileId !== "" && m.uint32(26).string(p.fileId), p.version !== 0 && m.uint32(32).int32(p.version), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseChunkAudioObject();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.audioBuffer = We.decode(g, g.uint32());
								continue;
							case 2:
								if (p !== 16) break;
								x.audioPartsLength = g.int32();
								continue;
							case 3:
								if (p !== 26) break;
								x.fileId = g.string();
								continue;
							case 4:
								if (p !== 32) break;
								x.version = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						audioBuffer: isSet(p.audioBuffer) ? We.fromJSON(p.audioBuffer) : void 0,
						audioPartsLength: isSet(p.audioPartsLength) ? globalThis.Number(p.audioPartsLength) : 0,
						fileId: isSet(p.fileId) ? globalThis.String(p.fileId) : "",
						version: isSet(p.version) ? globalThis.Number(p.version) : 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.audioBuffer !== void 0 && (m.audioBuffer = We.toJSON(p.audioBuffer)), p.audioPartsLength !== 0 && (m.audioPartsLength = Math.round(p.audioPartsLength)), p.fileId !== "" && (m.fileId = p.fileId), p.version !== 0 && (m.version = Math.round(p.version)), m;
				},
				create(p) {
					return Ke.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseChunkAudioObject();
					return m.audioBuffer = p.audioBuffer !== void 0 && p.audioBuffer !== null ? We.fromPartial(p.audioBuffer) : void 0, m.audioPartsLength = p.audioPartsLength ?? 0, m.fileId = p.fileId ?? "", m.version = p.version ?? 0, m;
				}
			};
			function createBaseVideoTranslationAudioRequest() {
				return {
					translationId: "",
					url: "",
					partialAudioInfo: void 0,
					audioInfo: void 0
				};
			}
			let qe = {
				encode(p, m = new BinaryWriter()) {
					return p.translationId !== "" && m.uint32(10).string(p.translationId), p.url !== "" && m.uint32(18).string(p.url), p.partialAudioInfo !== void 0 && Ke.encode(p.partialAudioInfo, m.uint32(34).fork()).join(), p.audioInfo !== void 0 && Ue.encode(p.audioInfo, m.uint32(50).fork()).join(), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationAudioRequest();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.translationId = g.string();
								continue;
							case 2:
								if (p !== 18) break;
								x.url = g.string();
								continue;
							case 4:
								if (p !== 34) break;
								x.partialAudioInfo = Ke.decode(g, g.uint32());
								continue;
							case 6:
								if (p !== 50) break;
								x.audioInfo = Ue.decode(g, g.uint32());
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						translationId: isSet(p.translationId) ? globalThis.String(p.translationId) : "",
						url: isSet(p.url) ? globalThis.String(p.url) : "",
						partialAudioInfo: isSet(p.partialAudioInfo) ? Ke.fromJSON(p.partialAudioInfo) : void 0,
						audioInfo: isSet(p.audioInfo) ? Ue.fromJSON(p.audioInfo) : void 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.translationId !== "" && (m.translationId = p.translationId), p.url !== "" && (m.url = p.url), p.partialAudioInfo !== void 0 && (m.partialAudioInfo = Ke.toJSON(p.partialAudioInfo)), p.audioInfo !== void 0 && (m.audioInfo = Ue.toJSON(p.audioInfo)), m;
				},
				create(p) {
					return qe.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationAudioRequest();
					return m.translationId = p.translationId ?? "", m.url = p.url ?? "", m.partialAudioInfo = p.partialAudioInfo !== void 0 && p.partialAudioInfo !== null ? Ke.fromPartial(p.partialAudioInfo) : void 0, m.audioInfo = p.audioInfo !== void 0 && p.audioInfo !== null ? Ue.fromPartial(p.audioInfo) : void 0, m;
				}
			};
			function createBaseVideoTranslationAudioResponse() {
				return {
					status: 0,
					remainingChunks: []
				};
			}
			let Ye = {
				encode(p, m = new BinaryWriter()) {
					p.status !== 0 && m.uint32(8).int32(p.status);
					for (let g of p.remainingChunks) m.uint32(18).string(g);
					return m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseVideoTranslationAudioResponse();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 8) break;
								x.status = g.int32();
								continue;
							case 2:
								if (p !== 18) break;
								x.remainingChunks.push(g.string());
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						status: isSet(p.status) ? globalThis.Number(p.status) : 0,
						remainingChunks: globalThis.Array.isArray(p?.remainingChunks) ? p.remainingChunks.map((p) => globalThis.String(p)) : []
					};
				},
				toJSON(p) {
					let m = {};
					return p.status !== 0 && (m.status = Math.round(p.status)), p.remainingChunks?.length && (m.remainingChunks = p.remainingChunks), m;
				},
				create(p) {
					return Ye.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseVideoTranslationAudioResponse();
					return m.status = p.status ?? 0, m.remainingChunks = p.remainingChunks?.map((p) => p) || [], m;
				}
			};
			function createBaseSubtitlesObject() {
				return {
					language: "",
					url: "",
					unknown0: 0,
					translatedLanguage: "",
					translatedUrl: "",
					unknown1: 0,
					unknown2: 0
				};
			}
			let tt = {
				encode(p, m = new BinaryWriter()) {
					return p.language !== "" && m.uint32(10).string(p.language), p.url !== "" && m.uint32(18).string(p.url), p.unknown0 !== 0 && m.uint32(24).int32(p.unknown0), p.translatedLanguage !== "" && m.uint32(34).string(p.translatedLanguage), p.translatedUrl !== "" && m.uint32(42).string(p.translatedUrl), p.unknown1 !== 0 && m.uint32(48).int32(p.unknown1), p.unknown2 !== 0 && m.uint32(56).int32(p.unknown2), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseSubtitlesObject();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.language = g.string();
								continue;
							case 2:
								if (p !== 18) break;
								x.url = g.string();
								continue;
							case 3:
								if (p !== 24) break;
								x.unknown0 = g.int32();
								continue;
							case 4:
								if (p !== 34) break;
								x.translatedLanguage = g.string();
								continue;
							case 5:
								if (p !== 42) break;
								x.translatedUrl = g.string();
								continue;
							case 6:
								if (p !== 48) break;
								x.unknown1 = g.int32();
								continue;
							case 7:
								if (p !== 56) break;
								x.unknown2 = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						language: isSet(p.language) ? globalThis.String(p.language) : "",
						url: isSet(p.url) ? globalThis.String(p.url) : "",
						unknown0: isSet(p.unknown0) ? globalThis.Number(p.unknown0) : 0,
						translatedLanguage: isSet(p.translatedLanguage) ? globalThis.String(p.translatedLanguage) : "",
						translatedUrl: isSet(p.translatedUrl) ? globalThis.String(p.translatedUrl) : "",
						unknown1: isSet(p.unknown1) ? globalThis.Number(p.unknown1) : 0,
						unknown2: isSet(p.unknown2) ? globalThis.Number(p.unknown2) : 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.language !== "" && (m.language = p.language), p.url !== "" && (m.url = p.url), p.unknown0 !== 0 && (m.unknown0 = Math.round(p.unknown0)), p.translatedLanguage !== "" && (m.translatedLanguage = p.translatedLanguage), p.translatedUrl !== "" && (m.translatedUrl = p.translatedUrl), p.unknown1 !== 0 && (m.unknown1 = Math.round(p.unknown1)), p.unknown2 !== 0 && (m.unknown2 = Math.round(p.unknown2)), m;
				},
				create(p) {
					return tt.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseSubtitlesObject();
					return m.language = p.language ?? "", m.url = p.url ?? "", m.unknown0 = p.unknown0 ?? 0, m.translatedLanguage = p.translatedLanguage ?? "", m.translatedUrl = p.translatedUrl ?? "", m.unknown1 = p.unknown1 ?? 0, m.unknown2 = p.unknown2 ?? 0, m;
				}
			};
			function createBaseSubtitlesRequest() {
				return {
					url: "",
					language: ""
				};
			}
			let nt = {
				encode(p, m = new BinaryWriter()) {
					return p.url !== "" && m.uint32(10).string(p.url), p.language !== "" && m.uint32(18).string(p.language), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseSubtitlesRequest();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.url = g.string();
								continue;
							case 2:
								if (p !== 18) break;
								x.language = g.string();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						url: isSet(p.url) ? globalThis.String(p.url) : "",
						language: isSet(p.language) ? globalThis.String(p.language) : ""
					};
				},
				toJSON(p) {
					let m = {};
					return p.url !== "" && (m.url = p.url), p.language !== "" && (m.language = p.language), m;
				},
				create(p) {
					return nt.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseSubtitlesRequest();
					return m.url = p.url ?? "", m.language = p.language ?? "", m;
				}
			};
			function createBaseSubtitlesResponse() {
				return {
					waiting: !1,
					subtitles: []
				};
			}
			let rt = {
				encode(p, m = new BinaryWriter()) {
					p.waiting !== !1 && m.uint32(8).bool(p.waiting);
					for (let g of p.subtitles) tt.encode(g, m.uint32(18).fork()).join();
					return m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseSubtitlesResponse();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 8) break;
								x.waiting = g.bool();
								continue;
							case 2:
								if (p !== 18) break;
								x.subtitles.push(tt.decode(g, g.uint32()));
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						waiting: isSet(p.waiting) ? globalThis.Boolean(p.waiting) : !1,
						subtitles: globalThis.Array.isArray(p?.subtitles) ? p.subtitles.map((p) => tt.fromJSON(p)) : []
					};
				},
				toJSON(p) {
					let m = {};
					return p.waiting !== !1 && (m.waiting = p.waiting), p.subtitles?.length && (m.subtitles = p.subtitles.map((p) => tt.toJSON(p))), m;
				},
				create(p) {
					return rt.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseSubtitlesResponse();
					return m.waiting = p.waiting ?? !1, m.subtitles = p.subtitles?.map((p) => tt.fromPartial(p)) || [], m;
				}
			};
			function createBaseStreamTranslationObject() {
				return {
					url: "",
					timestamp: ""
				};
			}
			let it = {
				encode(p, m = new BinaryWriter()) {
					return p.url !== "" && m.uint32(10).string(p.url), p.timestamp !== "" && m.uint32(18).string(p.timestamp), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseStreamTranslationObject();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.url = g.string();
								continue;
							case 2:
								if (p !== 18) break;
								x.timestamp = g.string();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						url: isSet(p.url) ? globalThis.String(p.url) : "",
						timestamp: isSet(p.timestamp) ? globalThis.String(p.timestamp) : ""
					};
				},
				toJSON(p) {
					let m = {};
					return p.url !== "" && (m.url = p.url), p.timestamp !== "" && (m.timestamp = p.timestamp), m;
				},
				create(p) {
					return it.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseStreamTranslationObject();
					return m.url = p.url ?? "", m.timestamp = p.timestamp ?? "", m;
				}
			};
			function createBaseStreamTranslationRequest() {
				return {
					url: "",
					language: "",
					responseLanguage: "",
					unknown0: 0,
					unknown1: 0
				};
			}
			let at = {
				encode(p, m = new BinaryWriter()) {
					return p.url !== "" && m.uint32(10).string(p.url), p.language !== "" && m.uint32(18).string(p.language), p.responseLanguage !== "" && m.uint32(26).string(p.responseLanguage), p.unknown0 !== 0 && m.uint32(40).int32(p.unknown0), p.unknown1 !== 0 && m.uint32(48).int32(p.unknown1), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseStreamTranslationRequest();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.url = g.string();
								continue;
							case 2:
								if (p !== 18) break;
								x.language = g.string();
								continue;
							case 3:
								if (p !== 26) break;
								x.responseLanguage = g.string();
								continue;
							case 5:
								if (p !== 40) break;
								x.unknown0 = g.int32();
								continue;
							case 6:
								if (p !== 48) break;
								x.unknown1 = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						url: isSet(p.url) ? globalThis.String(p.url) : "",
						language: isSet(p.language) ? globalThis.String(p.language) : "",
						responseLanguage: isSet(p.responseLanguage) ? globalThis.String(p.responseLanguage) : "",
						unknown0: isSet(p.unknown0) ? globalThis.Number(p.unknown0) : 0,
						unknown1: isSet(p.unknown1) ? globalThis.Number(p.unknown1) : 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.url !== "" && (m.url = p.url), p.language !== "" && (m.language = p.language), p.responseLanguage !== "" && (m.responseLanguage = p.responseLanguage), p.unknown0 !== 0 && (m.unknown0 = Math.round(p.unknown0)), p.unknown1 !== 0 && (m.unknown1 = Math.round(p.unknown1)), m;
				},
				create(p) {
					return at.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseStreamTranslationRequest();
					return m.url = p.url ?? "", m.language = p.language ?? "", m.responseLanguage = p.responseLanguage ?? "", m.unknown0 = p.unknown0 ?? 0, m.unknown1 = p.unknown1 ?? 0, m;
				}
			};
			function createBaseStreamTranslationResponse() {
				return {
					interval: 0,
					translatedInfo: void 0,
					pingId: void 0
				};
			}
			let ot = {
				encode(p, m = new BinaryWriter()) {
					return p.interval !== 0 && m.uint32(8).int32(p.interval), p.translatedInfo !== void 0 && it.encode(p.translatedInfo, m.uint32(18).fork()).join(), p.pingId !== void 0 && m.uint32(24).int32(p.pingId), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseStreamTranslationResponse();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 8) break;
								x.interval = g.int32();
								continue;
							case 2:
								if (p !== 18) break;
								x.translatedInfo = it.decode(g, g.uint32());
								continue;
							case 3:
								if (p !== 24) break;
								x.pingId = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						interval: isSet(p.interval) ? streamIntervalFromJSON(p.interval) : 0,
						translatedInfo: isSet(p.translatedInfo) ? it.fromJSON(p.translatedInfo) : void 0,
						pingId: isSet(p.pingId) ? globalThis.Number(p.pingId) : void 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.interval !== 0 && (m.interval = streamIntervalToJSON(p.interval)), p.translatedInfo !== void 0 && (m.translatedInfo = it.toJSON(p.translatedInfo)), p.pingId !== void 0 && (m.pingId = Math.round(p.pingId)), m;
				},
				create(p) {
					return ot.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseStreamTranslationResponse();
					return m.interval = p.interval ?? 0, m.translatedInfo = p.translatedInfo !== void 0 && p.translatedInfo !== null ? it.fromPartial(p.translatedInfo) : void 0, m.pingId = p.pingId ?? void 0, m;
				}
			};
			function createBaseStreamPingRequest() {
				return { pingId: 0 };
			}
			let st = {
				encode(p, m = new BinaryWriter()) {
					return p.pingId !== 0 && m.uint32(8).int32(p.pingId), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseStreamPingRequest();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 8) break;
								x.pingId = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return { pingId: isSet(p.pingId) ? globalThis.Number(p.pingId) : 0 };
				},
				toJSON(p) {
					let m = {};
					return p.pingId !== 0 && (m.pingId = Math.round(p.pingId)), m;
				},
				create(p) {
					return st.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseStreamPingRequest();
					return m.pingId = p.pingId ?? 0, m;
				}
			};
			function createBaseYandexSessionRequest() {
				return {
					uuid: "",
					module: ""
				};
			}
			let ct = {
				encode(p, m = new BinaryWriter()) {
					return p.uuid !== "" && m.uint32(10).string(p.uuid), p.module !== "" && m.uint32(18).string(p.module), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseYandexSessionRequest();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.uuid = g.string();
								continue;
							case 2:
								if (p !== 18) break;
								x.module = g.string();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						uuid: isSet(p.uuid) ? globalThis.String(p.uuid) : "",
						module: isSet(p.module) ? globalThis.String(p.module) : ""
					};
				},
				toJSON(p) {
					let m = {};
					return p.uuid !== "" && (m.uuid = p.uuid), p.module !== "" && (m.module = p.module), m;
				},
				create(p) {
					return ct.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseYandexSessionRequest();
					return m.uuid = p.uuid ?? "", m.module = p.module ?? "", m;
				}
			};
			function createBaseYandexSessionResponse() {
				return {
					secretKey: "",
					expires: 0
				};
			}
			let dt = {
				encode(p, m = new BinaryWriter()) {
					return p.secretKey !== "" && m.uint32(10).string(p.secretKey), p.expires !== 0 && m.uint32(16).int32(p.expires), m;
				},
				decode(p, m) {
					let g = p instanceof BinaryReader ? p : new BinaryReader(p), _ = m === void 0 ? g.len : g.pos + m, x = createBaseYandexSessionResponse();
					for (; g.pos < _;) {
						let p = g.uint32();
						switch (p >>> 3) {
							case 1:
								if (p !== 10) break;
								x.secretKey = g.string();
								continue;
							case 2:
								if (p !== 16) break;
								x.expires = g.int32();
								continue;
						}
						if ((p & 7) == 4 || p === 0) break;
						g.skip(p & 7);
					}
					return x;
				},
				fromJSON(p) {
					return {
						secretKey: isSet(p.secretKey) ? globalThis.String(p.secretKey) : "",
						expires: isSet(p.expires) ? globalThis.Number(p.expires) : 0
					};
				},
				toJSON(p) {
					let m = {};
					return p.secretKey !== "" && (m.secretKey = p.secretKey), p.expires !== 0 && (m.expires = Math.round(p.expires)), m;
				},
				create(p) {
					return dt.fromPartial(p ?? {});
				},
				fromPartial(p) {
					let m = createBaseYandexSessionResponse();
					return m.secretKey = p.secretKey ?? "", m.expires = p.expires ?? 0, m;
				}
			};
			function bytesFromBase64(p) {
				if (globalThis.Buffer) return Uint8Array.from(globalThis.Buffer.from(p, "base64"));
				{
					let m = globalThis.atob(p), g = new Uint8Array(m.length);
					for (let p = 0; p < m.length; ++p) g[p] = m.charCodeAt(p);
					return g;
				}
			}
			function base64FromBytes(p) {
				if (globalThis.Buffer) return globalThis.Buffer.from(p).toString("base64");
				{
					let m = [];
					return p.forEach((p) => {
						m.push(globalThis.String.fromCharCode(p));
					}), globalThis.btoa(m.join(""));
				}
			}
			function isSet(p) {
				return p != null;
			}
		},
		"./node_modules/@vot.js/shared/dist/secure.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				C0: () => getSecYaHeaders,
				MG: () => O,
				bT: () => getHmacSha1,
				dD: () => getSignature,
				yk: () => getUUID
			});
			var _ = g("./node_modules/@vot.js/shared/dist/data/config.js"), x = g("./node_modules/@vot.js/shared/dist/utils/logger.js");
			let { componentVersion: w } = _.A;
			async function getCrypto() {
				return typeof window < "u" && window.crypto ? window.crypto : await Promise.resolve().then(function webpackMissingModule() {
					var p = Error("Cannot find module 'node:crypto'");
					throw p.code = "MODULE_NOT_FOUND", p;
				});
			}
			let D = new TextEncoder();
			async function signHMAC(p, m, g) {
				let _ = await getCrypto(), x = await _.subtle.importKey("raw", D.encode(m), {
					name: "HMAC",
					hash: { name: p }
				}, !1, ["sign", "verify"]);
				return await _.subtle.sign("HMAC", x, g);
			}
			async function getSignature(p) {
				let m = await signHMAC("SHA-256", _.A.hmac, p);
				return new Uint8Array(m).reduce((p, m) => p + m.toString(16).padStart(2, "0"), "");
			}
			async function getSecYaHeaders(p, m, g, _) {
				let { secretKey: x, uuid: O } = m, A = `${O}:${_}:${w}`, F = D.encode(A), U = await getSignature(F);
				if (p === "Ya-Summary") return {
					[`X-${p}-Sk`]: x,
					[`X-${p}-Token`]: `${U}:${A}`
				};
				let K = await getSignature(g);
				return {
					[`${p}-Signature`]: K,
					[`Sec-${p}-Sk`]: x,
					[`Sec-${p}-Token`]: `${U}:${A}`
				};
			}
			function getUUID() {
				let p = "0123456789ABCDEF", m = "";
				for (let g = 0; g < 32; g++) {
					let g = Math.floor(Math.random() * 16);
					m += p[g];
				}
				return m;
			}
			async function getHmacSha1(p, m) {
				try {
					let g = D.encode(m), _ = await signHMAC("SHA-1", p, g);
					return btoa(String.fromCharCode(...new Uint8Array(_)));
				} catch (p) {
					return x.A.error(p), !1;
				}
			}
			let O = {
				"sec-ch-ua": `"Chromium";v="134", "YaBrowser";v="${w.slice(0, 5)}", "Not?A_Brand";v="24", "Yowser";v="2.5"`,
				"sec-ch-ua-full-version-list": `"Chromium";v="134.0.6998.543", "YaBrowser";v="${w}", "Not?A_Brand";v="24.0.0.0", "Yowser";v="2.5"`,
				"Sec-Fetch-Mode": "no-cors"
			};
		},
		"./node_modules/@vot.js/shared/dist/types/logger.js": (p, m, g) => {
			"use strict";
			g.d(m, { T: () => _ });
			var _;
			(function(p) {
				p[p.DEBUG = 0] = "DEBUG", p[p.INFO = 1] = "INFO", p[p.WARN = 2] = "WARN", p[p.ERROR = 3] = "ERROR", p[p.SILENCE = 4] = "SILENCE";
			})(_ ||= {});
		},
		"./node_modules/@vot.js/shared/dist/utils/logger.js": (p, m, g) => {
			"use strict";
			g.d(m, { A: () => Logger });
			var _ = g("./node_modules/@vot.js/shared/dist/data/config.js"), x = g("./node_modules/@vot.js/shared/dist/types/logger.js");
			class Logger {
				static prefix = `[vot.js v${_.A.version}]`;
				static canLog(p) {
					return _.A.loggerLevel <= p;
				}
				static log(...p) {
					Logger.canLog(x.T.DEBUG) && console.log(Logger.prefix, ...p);
				}
				static info(...p) {
					Logger.canLog(x.T.INFO) && console.info(Logger.prefix, ...p);
				}
				static warn(...p) {
					Logger.canLog(x.T.WARN) && console.warn(Logger.prefix, ...p);
				}
				static error(...p) {
					Logger.canLog(x.T.ERROR) && console.error(Logger.prefix, ...p);
				}
			}
		},
		"./node_modules/@vot.js/shared/dist/utils/subs.js": (p, m, g) => {
			"use strict";
			g.d(m, { vk: () => convertSubs });
			function convertToStrTime(p, m = ",") {
				let g = p / 1e3, _ = Math.floor(g / 3600), x = Math.floor(g % 3600 / 60), w = Math.floor(g % 60), D = Math.floor(p % 1e3);
				return `${_.toString().padStart(2, "0")}:${x.toString().padStart(2, "0")}:${w.toString().padStart(2, "0")}${m}${D.toString().padStart(3, "0")}`;
			}
			function convertToMSTime(p) {
				let m = p.split(" ")?.[0]?.split(":");
				m.length < 3 && m.unshift("00");
				let [g, _, x] = m, w = +x.replace(/[,.]/, ""), D = _ * 6e4, O = g * 36e5;
				return O + D + w;
			}
			function convertSubsFromJSON(p, m = "srt") {
				let g = m === "vtt", _ = g ? "." : ",", x = p.subtitles.map((p, m) => {
					let x = g ? "" : `${m + 1}\n`;
					return x + `${convertToStrTime(p.startMs, _)} --> ${convertToStrTime(p.startMs + p.durationMs, _)}\n${p.text}\n\n`;
				}).join("").trim();
				return g ? `WEBVTT\n\n${x}` : x;
			}
			function convertSubsToJSON(p, m = "srt") {
				let g = p.split(/\r?\n\r?\n/g);
				m === "vtt" && g.shift(), /^\d+\r?\n/.exec(g?.[0] ?? "") && (m = "srt");
				let _ = +(m === "srt"), x = g.reduce((p, m) => {
					let g = m.trim().split("\n"), x = g[_], w = g.slice(_ + 1).join("\n");
					if ((g.length !== 2 || !m.includes(" --> ")) && !x?.includes(" --> ")) return p.length === 0 || (p[p.length - 1].text += `\n\n${g.join("\n")}`), p;
					let [D, O] = x.split(" --> "), A = convertToMSTime(D), F = convertToMSTime(O), U = F - A;
					return p.push({
						text: w,
						startMs: A,
						durationMs: U,
						speakerId: "0"
					}), p;
				}, []);
				return {
					containsTokens: !1,
					subtitles: x
				};
			}
			function getSubsFormat(p) {
				return typeof p == "string" ? /^(WEBVTT([^\n]+)?)(\r?\n)/.exec(p) ? "vtt" : "srt" : "json";
			}
			function convertSubs(p, m = "srt") {
				let g = getSubsFormat(p);
				return g === m ? p : g === "json" ? convertSubsFromJSON(p, m) : (p = convertSubsToJSON(p, g), m === "json" ? p : convertSubsFromJSON(p, m));
			}
		},
		"./node_modules/@vot.js/shared/dist/utils/utils.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				ec: () => normalizeLang,
				fl: () => proxyMedia,
				lg: () => getTimestamp,
				u9: () => fetchWithTimeout
			});
			var _ = g("./node_modules/@vot.js/shared/dist/data/config.js");
			let x = {
				afr: "af",
				aka: "ak",
				alb: "sq",
				amh: "am",
				ara: "ar",
				arm: "hy",
				asm: "as",
				aym: "ay",
				aze: "az",
				baq: "eu",
				bel: "be",
				ben: "bn",
				bos: "bs",
				bul: "bg",
				bur: "my",
				cat: "ca",
				chi: "zh",
				cos: "co",
				cze: "cs",
				dan: "da",
				div: "dv",
				dut: "nl",
				eng: "en",
				epo: "eo",
				est: "et",
				ewe: "ee",
				fin: "fi",
				fre: "fr",
				fry: "fy",
				geo: "ka",
				ger: "de",
				gla: "gd",
				gle: "ga",
				glg: "gl",
				gre: "el",
				grn: "gn",
				guj: "gu",
				hat: "ht",
				hau: "ha",
				hin: "hi",
				hrv: "hr",
				hun: "hu",
				ibo: "ig",
				ice: "is",
				ind: "id",
				ita: "it",
				jav: "jv",
				jpn: "ja",
				kan: "kn",
				kaz: "kk",
				khm: "km",
				kin: "rw",
				kir: "ky",
				kor: "ko",
				kur: "ku",
				lao: "lo",
				lat: "la",
				lav: "lv",
				lin: "ln",
				lit: "lt",
				ltz: "lb",
				lug: "lg",
				mac: "mk",
				mal: "ml",
				mao: "mi",
				mar: "mr",
				may: "ms",
				mlg: "mg",
				mlt: "mt",
				mon: "mn",
				nep: "ne",
				nor: "no",
				nya: "ny",
				ori: "or",
				orm: "om",
				pan: "pa",
				per: "fa",
				pol: "pl",
				por: "pt",
				pus: "ps",
				que: "qu",
				rum: "ro",
				rus: "ru",
				san: "sa",
				sin: "si",
				slo: "sk",
				slv: "sl",
				smo: "sm",
				sna: "sn",
				snd: "sd",
				som: "so",
				sot: "st",
				spa: "es",
				srp: "sr",
				sun: "su",
				swa: "sw",
				swe: "sv",
				tam: "ta",
				tat: "tt",
				tel: "te",
				tgk: "tg",
				tha: "th",
				tir: "ti",
				tso: "ts",
				tuk: "tk",
				tur: "tr",
				uig: "ug",
				ukr: "uk",
				urd: "ur",
				uzb: "uz",
				vie: "vi",
				wel: "cy",
				xho: "xh",
				yid: "yi",
				yor: "yo",
				zul: "zu"
			};
			async function fetchWithTimeout(p, m = { headers: { "User-Agent": _.A.userAgent } }) {
				let { timeout: g = 3e3,...x } = m, w = new AbortController(), D = setTimeout(() => w.abort(), g), O = await fetch(p, {
					signal: w.signal,
					...x
				});
				return clearTimeout(D), O;
			}
			function getTimestamp() {
				return Math.floor(Date.now() / 1e3);
			}
			function normalizeLang(p) {
				return p.length === 3 ? x[p] : p.toLowerCase().split(/[_;-]/)[0].trim();
			}
			function proxyMedia(p, m = "mp4") {
				let g = `https://${_.A.mediaProxy}/v1/proxy/video.${m}?format=base64&force=true`;
				return p instanceof URL ? `${g}&url=${btoa(p.href)}&origin=${p.origin}&referer=${p.origin}` : `${g}&url=${btoa(p)}`;
			}
		},
		"./node_modules/bowser/es5.js": function(p) {
			(function(m, g) {
				p.exports = g();
			})(this, function() {
				return function(p) {
					var m = {};
					function r(g) {
						if (m[g]) return m[g].exports;
						var _ = m[g] = {
							i: g,
							l: !1,
							exports: {}
						};
						return p[g].call(_.exports, _, _.exports, r), _.l = !0, _.exports;
					}
					return r.m = p, r.c = m, r.d = function(p, m, g) {
						r.o(p, m) || Object.defineProperty(p, m, {
							enumerable: !0,
							get: g
						});
					}, r.r = function(p) {
						typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(p, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(p, "__esModule", { value: !0 });
					}, r.t = function(p, m) {
						if (1 & m && (p = r(p)), 8 & m || 4 & m && typeof p == "object" && p && p.__esModule) return p;
						var g = Object.create(null);
						if (r.r(g), Object.defineProperty(g, "default", {
							enumerable: !0,
							value: p
						}), 2 & m && typeof p != "string") for (var _ in p) r.d(g, _, function(m) {
							return p[m];
						}.bind(null, _));
						return g;
					}, r.n = function(p) {
						var m = p && p.__esModule ? function() {
							return p.default;
						} : function() {
							return p;
						};
						return r.d(m, "a", m), m;
					}, r.o = function(p, m) {
						return Object.prototype.hasOwnProperty.call(p, m);
					}, r.p = "", r(r.s = 90);
				}({
					17: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.default = void 0;
						var _ = g(18), x = function() {
							function e() {}
							return e.getFirstMatch = function(p, m) {
								var g = m.match(p);
								return g && g.length > 0 && g[1] || "";
							}, e.getSecondMatch = function(p, m) {
								var g = m.match(p);
								return g && g.length > 1 && g[2] || "";
							}, e.matchAndReturnConst = function(p, m, g) {
								if (p.test(m)) return g;
							}, e.getWindowsVersionName = function(p) {
								switch (p) {
									case "NT": return "NT";
									case "XP": return "XP";
									case "NT 5.0": return "2000";
									case "NT 5.1": return "XP";
									case "NT 5.2": return "2003";
									case "NT 6.0": return "Vista";
									case "NT 6.1": return "7";
									case "NT 6.2": return "8";
									case "NT 6.3": return "8.1";
									case "NT 10.0": return "10";
									default: return;
								}
							}, e.getMacOSVersionName = function(p) {
								var m = p.split(".").splice(0, 2).map(function(p) {
									return parseInt(p, 10) || 0;
								});
								if (m.push(0), m[0] === 10) switch (m[1]) {
									case 5: return "Leopard";
									case 6: return "Snow Leopard";
									case 7: return "Lion";
									case 8: return "Mountain Lion";
									case 9: return "Mavericks";
									case 10: return "Yosemite";
									case 11: return "El Capitan";
									case 12: return "Sierra";
									case 13: return "High Sierra";
									case 14: return "Mojave";
									case 15: return "Catalina";
									default: return;
								}
							}, e.getAndroidVersionName = function(p) {
								var m = p.split(".").splice(0, 2).map(function(p) {
									return parseInt(p, 10) || 0;
								});
								if (m.push(0), !(m[0] === 1 && m[1] < 5)) return m[0] === 1 && m[1] < 6 ? "Cupcake" : m[0] === 1 && m[1] >= 6 ? "Donut" : m[0] === 2 && m[1] < 2 ? "Eclair" : m[0] === 2 && m[1] === 2 ? "Froyo" : m[0] === 2 && m[1] > 2 ? "Gingerbread" : m[0] === 3 ? "Honeycomb" : m[0] === 4 && m[1] < 1 ? "Ice Cream Sandwich" : m[0] === 4 && m[1] < 4 ? "Jelly Bean" : m[0] === 4 && m[1] >= 4 ? "KitKat" : m[0] === 5 ? "Lollipop" : m[0] === 6 ? "Marshmallow" : m[0] === 7 ? "Nougat" : m[0] === 8 ? "Oreo" : m[0] === 9 ? "Pie" : void 0;
							}, e.getVersionPrecision = function(p) {
								return p.split(".").length;
							}, e.compareVersions = function(p, m, g) {
								g === void 0 && (g = !1);
								var _ = e.getVersionPrecision(p), x = e.getVersionPrecision(m), w = Math.max(_, x), D = 0, O = e.map([p, m], function(p) {
									var m = w - e.getVersionPrecision(p), g = p + Array(m + 1).join(".0");
									return e.map(g.split("."), function(p) {
										return Array(20 - p.length).join("0") + p;
									}).reverse();
								});
								for (g && (D = w - Math.min(_, x)), --w; w >= D;) {
									if (O[0][w] > O[1][w]) return 1;
									if (O[0][w] === O[1][w]) {
										if (w === D) return 0;
										--w;
									} else if (O[0][w] < O[1][w]) return -1;
								}
							}, e.map = function(p, m) {
								var g, _ = [];
								if (Array.prototype.map) return Array.prototype.map.call(p, m);
								for (g = 0; g < p.length; g += 1) _.push(m(p[g]));
								return _;
							}, e.find = function(p, m) {
								var g, _;
								if (Array.prototype.find) return Array.prototype.find.call(p, m);
								for (g = 0, _ = p.length; g < _; g += 1) {
									var x = p[g];
									if (m(x, g)) return x;
								}
							}, e.assign = function(p) {
								for (var m, g, _ = p, x = arguments.length, w = Array(x > 1 ? x - 1 : 0), D = 1; D < x; D++) w[D - 1] = arguments[D];
								if (Object.assign) return Object.assign.apply(Object, [p].concat(w));
								var o = function() {
									var p = w[m];
									typeof p == "object" && p && Object.keys(p).forEach(function(m) {
										_[m] = p[m];
									});
								};
								for (m = 0, g = w.length; m < g; m += 1) o();
								return p;
							}, e.getBrowserAlias = function(p) {
								return _.BROWSER_ALIASES_MAP[p];
							}, e.getBrowserTypeByAlias = function(p) {
								return _.BROWSER_MAP[p] || "";
							}, e;
						}();
						m.default = x, p.exports = m.default;
					},
					18: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.ENGINE_MAP = m.OS_MAP = m.PLATFORMS_MAP = m.BROWSER_MAP = m.BROWSER_ALIASES_MAP = void 0, m.BROWSER_ALIASES_MAP = {
							"Amazon Silk": "amazon_silk",
							"Android Browser": "android",
							Bada: "bada",
							BlackBerry: "blackberry",
							Chrome: "chrome",
							Chromium: "chromium",
							Electron: "electron",
							Epiphany: "epiphany",
							Firefox: "firefox",
							Focus: "focus",
							Generic: "generic",
							"Google Search": "google_search",
							Googlebot: "googlebot",
							"Internet Explorer": "ie",
							"K-Meleon": "k_meleon",
							Maxthon: "maxthon",
							"Microsoft Edge": "edge",
							"MZ Browser": "mz",
							"NAVER Whale Browser": "naver",
							Opera: "opera",
							"Opera Coast": "opera_coast",
							PhantomJS: "phantomjs",
							Puffin: "puffin",
							QupZilla: "qupzilla",
							QQ: "qq",
							QQLite: "qqlite",
							Safari: "safari",
							Sailfish: "sailfish",
							"Samsung Internet for Android": "samsung_internet",
							SeaMonkey: "seamonkey",
							Sleipnir: "sleipnir",
							Swing: "swing",
							Tizen: "tizen",
							"UC Browser": "uc",
							Vivaldi: "vivaldi",
							"WebOS Browser": "webos",
							WeChat: "wechat",
							"Yandex Browser": "yandex",
							Roku: "roku"
						}, m.BROWSER_MAP = {
							amazon_silk: "Amazon Silk",
							android: "Android Browser",
							bada: "Bada",
							blackberry: "BlackBerry",
							chrome: "Chrome",
							chromium: "Chromium",
							electron: "Electron",
							epiphany: "Epiphany",
							firefox: "Firefox",
							focus: "Focus",
							generic: "Generic",
							googlebot: "Googlebot",
							google_search: "Google Search",
							ie: "Internet Explorer",
							k_meleon: "K-Meleon",
							maxthon: "Maxthon",
							edge: "Microsoft Edge",
							mz: "MZ Browser",
							naver: "NAVER Whale Browser",
							opera: "Opera",
							opera_coast: "Opera Coast",
							phantomjs: "PhantomJS",
							puffin: "Puffin",
							qupzilla: "QupZilla",
							qq: "QQ Browser",
							qqlite: "QQ Browser Lite",
							safari: "Safari",
							sailfish: "Sailfish",
							samsung_internet: "Samsung Internet for Android",
							seamonkey: "SeaMonkey",
							sleipnir: "Sleipnir",
							swing: "Swing",
							tizen: "Tizen",
							uc: "UC Browser",
							vivaldi: "Vivaldi",
							webos: "WebOS Browser",
							wechat: "WeChat",
							yandex: "Yandex Browser"
						}, m.PLATFORMS_MAP = {
							tablet: "tablet",
							mobile: "mobile",
							desktop: "desktop",
							tv: "tv"
						}, m.OS_MAP = {
							WindowsPhone: "Windows Phone",
							Windows: "Windows",
							MacOS: "macOS",
							iOS: "iOS",
							Android: "Android",
							WebOS: "WebOS",
							BlackBerry: "BlackBerry",
							Bada: "Bada",
							Tizen: "Tizen",
							Linux: "Linux",
							ChromeOS: "Chrome OS",
							PlayStation4: "PlayStation 4",
							Roku: "Roku"
						}, m.ENGINE_MAP = {
							EdgeHTML: "EdgeHTML",
							Blink: "Blink",
							Trident: "Trident",
							Presto: "Presto",
							Gecko: "Gecko",
							WebKit: "WebKit"
						};
					},
					90: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.default = void 0;
						var _, x = (_ = g(91)) && _.__esModule ? _ : { default: _ }, w = g(18);
						function a(p, m) {
							for (var g = 0; g < m.length; g++) {
								var _ = m[g];
								_.enumerable = _.enumerable || !1, _.configurable = !0, "value" in _ && (_.writable = !0), Object.defineProperty(p, _.key, _);
							}
						}
						var D = function() {
							function e() {}
							var p, m, g;
							return e.getParser = function(p, m) {
								if (m === void 0 && (m = !1), typeof p != "string") throw Error("UserAgent should be a string");
								return new x.default(p, m);
							}, e.parse = function(p) {
								return new x.default(p).getResult();
							}, p = e, g = [
								{
									key: "BROWSER_MAP",
									get: function() {
										return w.BROWSER_MAP;
									}
								},
								{
									key: "ENGINE_MAP",
									get: function() {
										return w.ENGINE_MAP;
									}
								},
								{
									key: "OS_MAP",
									get: function() {
										return w.OS_MAP;
									}
								},
								{
									key: "PLATFORMS_MAP",
									get: function() {
										return w.PLATFORMS_MAP;
									}
								}
							], (m = null) && a(p.prototype, m), g && a(p, g), e;
						}();
						m.default = D, p.exports = m.default;
					},
					91: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.default = void 0;
						var _ = u(g(92)), x = u(g(93)), w = u(g(94)), D = u(g(95)), O = u(g(17));
						function u(p) {
							return p && p.__esModule ? p : { default: p };
						}
						var A = function() {
							function e(p, m) {
								if (m === void 0 && (m = !1), p == null || p === "") throw Error("UserAgent parameter can't be empty");
								this._ua = p, this.parsedResult = {}, !0 !== m && this.parse();
							}
							var p = e.prototype;
							return p.getUA = function() {
								return this._ua;
							}, p.test = function(p) {
								return p.test(this._ua);
							}, p.parseBrowser = function() {
								var p = this;
								this.parsedResult.browser = {};
								var m = O.default.find(_.default, function(m) {
									if (typeof m.test == "function") return m.test(p);
									if (m.test instanceof Array) return m.test.some(function(m) {
										return p.test(m);
									});
									throw Error("Browser's test function is not valid");
								});
								return m && (this.parsedResult.browser = m.describe(this.getUA())), this.parsedResult.browser;
							}, p.getBrowser = function() {
								return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
							}, p.getBrowserName = function(p) {
								return p ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
							}, p.getBrowserVersion = function() {
								return this.getBrowser().version;
							}, p.getOS = function() {
								return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
							}, p.parseOS = function() {
								var p = this;
								this.parsedResult.os = {};
								var m = O.default.find(x.default, function(m) {
									if (typeof m.test == "function") return m.test(p);
									if (m.test instanceof Array) return m.test.some(function(m) {
										return p.test(m);
									});
									throw Error("Browser's test function is not valid");
								});
								return m && (this.parsedResult.os = m.describe(this.getUA())), this.parsedResult.os;
							}, p.getOSName = function(p) {
								var m = this.getOS().name;
								return p ? String(m).toLowerCase() || "" : m || "";
							}, p.getOSVersion = function() {
								return this.getOS().version;
							}, p.getPlatform = function() {
								return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
							}, p.getPlatformType = function(p) {
								p === void 0 && (p = !1);
								var m = this.getPlatform().type;
								return p ? String(m).toLowerCase() || "" : m || "";
							}, p.parsePlatform = function() {
								var p = this;
								this.parsedResult.platform = {};
								var m = O.default.find(w.default, function(m) {
									if (typeof m.test == "function") return m.test(p);
									if (m.test instanceof Array) return m.test.some(function(m) {
										return p.test(m);
									});
									throw Error("Browser's test function is not valid");
								});
								return m && (this.parsedResult.platform = m.describe(this.getUA())), this.parsedResult.platform;
							}, p.getEngine = function() {
								return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
							}, p.getEngineName = function(p) {
								return p ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
							}, p.parseEngine = function() {
								var p = this;
								this.parsedResult.engine = {};
								var m = O.default.find(D.default, function(m) {
									if (typeof m.test == "function") return m.test(p);
									if (m.test instanceof Array) return m.test.some(function(m) {
										return p.test(m);
									});
									throw Error("Browser's test function is not valid");
								});
								return m && (this.parsedResult.engine = m.describe(this.getUA())), this.parsedResult.engine;
							}, p.parse = function() {
								return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
							}, p.getResult = function() {
								return O.default.assign({}, this.parsedResult);
							}, p.satisfies = function(p) {
								var m = this, g = {}, _ = 0, x = {}, w = 0;
								if (Object.keys(p).forEach(function(m) {
									var D = p[m];
									typeof D == "string" ? (x[m] = D, w += 1) : typeof D == "object" && (g[m] = D, _ += 1);
								}), _ > 0) {
									var D = Object.keys(g), A = O.default.find(D, function(p) {
										return m.isOS(p);
									});
									if (A) {
										var F = this.satisfies(g[A]);
										if (F !== void 0) return F;
									}
									var U = O.default.find(D, function(p) {
										return m.isPlatform(p);
									});
									if (U) {
										var K = this.satisfies(g[U]);
										if (K !== void 0) return K;
									}
								}
								if (w > 0) {
									var oe = Object.keys(x), le = O.default.find(oe, function(p) {
										return m.isBrowser(p, !0);
									});
									if (le !== void 0) return this.compareVersion(x[le]);
								}
							}, p.isBrowser = function(p, m) {
								m === void 0 && (m = !1);
								var g = this.getBrowserName().toLowerCase(), _ = p.toLowerCase(), x = O.default.getBrowserTypeByAlias(_);
								return m && x && (_ = x.toLowerCase()), _ === g;
							}, p.compareVersion = function(p) {
								var m = [0], g = p, _ = !1, x = this.getBrowserVersion();
								if (typeof x == "string") return p[0] === ">" || p[0] === "<" ? (g = p.substr(1), p[1] === "=" ? (_ = !0, g = p.substr(2)) : m = [], p[0] === ">" ? m.push(1) : m.push(-1)) : p[0] === "=" ? g = p.substr(1) : p[0] === "~" && (_ = !0, g = p.substr(1)), m.indexOf(O.default.compareVersions(x, g, _)) > -1;
							}, p.isOS = function(p) {
								return this.getOSName(!0) === String(p).toLowerCase();
							}, p.isPlatform = function(p) {
								return this.getPlatformType(!0) === String(p).toLowerCase();
							}, p.isEngine = function(p) {
								return this.getEngineName(!0) === String(p).toLowerCase();
							}, p.is = function(p, m) {
								return m === void 0 && (m = !1), this.isBrowser(p, m) || this.isOS(p) || this.isPlatform(p);
							}, p.some = function(p) {
								var m = this;
								return p === void 0 && (p = []), p.some(function(p) {
									return m.is(p);
								});
							}, e;
						}();
						m.default = A, p.exports = m.default;
					},
					92: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.default = void 0;
						var _, x = (_ = g(17)) && _.__esModule ? _ : { default: _ }, w = /version\/(\d+(\.?_?\d+)+)/i, D = [
							{
								test: [/googlebot/i],
								describe: function(p) {
									var m = { name: "Googlebot" }, g = x.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/opera/i],
								describe: function(p) {
									var m = { name: "Opera" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/opr\/|opios/i],
								describe: function(p) {
									var m = { name: "Opera" }, g = x.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/SamsungBrowser/i],
								describe: function(p) {
									var m = { name: "Samsung Internet for Android" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/Whale/i],
								describe: function(p) {
									var m = { name: "NAVER Whale Browser" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/MZBrowser/i],
								describe: function(p) {
									var m = { name: "MZ Browser" }, g = x.default.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/focus/i],
								describe: function(p) {
									var m = { name: "Focus" }, g = x.default.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/swing/i],
								describe: function(p) {
									var m = { name: "Swing" }, g = x.default.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/coast/i],
								describe: function(p) {
									var m = { name: "Opera Coast" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/opt\/\d+(?:.?_?\d+)+/i],
								describe: function(p) {
									var m = { name: "Opera Touch" }, g = x.default.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/yabrowser/i],
								describe: function(p) {
									var m = { name: "Yandex Browser" }, g = x.default.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/ucbrowser/i],
								describe: function(p) {
									var m = { name: "UC Browser" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/Maxthon|mxios/i],
								describe: function(p) {
									var m = { name: "Maxthon" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/epiphany/i],
								describe: function(p) {
									var m = { name: "Epiphany" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/puffin/i],
								describe: function(p) {
									var m = { name: "Puffin" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/sleipnir/i],
								describe: function(p) {
									var m = { name: "Sleipnir" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/k-meleon/i],
								describe: function(p) {
									var m = { name: "K-Meleon" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/micromessenger/i],
								describe: function(p) {
									var m = { name: "WeChat" }, g = x.default.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/qqbrowser/i],
								describe: function(p) {
									var m = { name: /qqbrowserlite/i.test(p) ? "QQ Browser Lite" : "QQ Browser" }, g = x.default.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/msie|trident/i],
								describe: function(p) {
									var m = { name: "Internet Explorer" }, g = x.default.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/\sedg\//i],
								describe: function(p) {
									var m = { name: "Microsoft Edge" }, g = x.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/edg([ea]|ios)/i],
								describe: function(p) {
									var m = { name: "Microsoft Edge" }, g = x.default.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/vivaldi/i],
								describe: function(p) {
									var m = { name: "Vivaldi" }, g = x.default.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/seamonkey/i],
								describe: function(p) {
									var m = { name: "SeaMonkey" }, g = x.default.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/sailfish/i],
								describe: function(p) {
									var m = { name: "Sailfish" }, g = x.default.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/silk/i],
								describe: function(p) {
									var m = { name: "Amazon Silk" }, g = x.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/phantom/i],
								describe: function(p) {
									var m = { name: "PhantomJS" }, g = x.default.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/slimerjs/i],
								describe: function(p) {
									var m = { name: "SlimerJS" }, g = x.default.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
								describe: function(p) {
									var m = { name: "BlackBerry" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/(web|hpw)[o0]s/i],
								describe: function(p) {
									var m = { name: "WebOS Browser" }, g = x.default.getFirstMatch(w, p) || x.default.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/bada/i],
								describe: function(p) {
									var m = { name: "Bada" }, g = x.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/tizen/i],
								describe: function(p) {
									var m = { name: "Tizen" }, g = x.default.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/qupzilla/i],
								describe: function(p) {
									var m = { name: "QupZilla" }, g = x.default.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/firefox|iceweasel|fxios/i],
								describe: function(p) {
									var m = { name: "Firefox" }, g = x.default.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/electron/i],
								describe: function(p) {
									var m = { name: "Electron" }, g = x.default.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/MiuiBrowser/i],
								describe: function(p) {
									var m = { name: "Miui" }, g = x.default.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/chromium/i],
								describe: function(p) {
									var m = { name: "Chromium" }, g = x.default.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, p) || x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/chrome|crios|crmo/i],
								describe: function(p) {
									var m = { name: "Chrome" }, g = x.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/GSA/i],
								describe: function(p) {
									var m = { name: "Google Search" }, g = x.default.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: function(p) {
									var m = !p.test(/like android/i), g = p.test(/android/i);
									return m && g;
								},
								describe: function(p) {
									var m = { name: "Android Browser" }, g = x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/playstation 4/i],
								describe: function(p) {
									var m = { name: "PlayStation 4" }, g = x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/safari|applewebkit/i],
								describe: function(p) {
									var m = { name: "Safari" }, g = x.default.getFirstMatch(w, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/.*/i],
								describe: function(p) {
									var m = p.search("\\(") === -1 ? /^(.*)\/(.*) / : /^(.*)\/(.*)[ \t]\((.*)/;
									return {
										name: x.default.getFirstMatch(m, p),
										version: x.default.getSecondMatch(m, p)
									};
								}
							}
						];
						m.default = D, p.exports = m.default;
					},
					93: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.default = void 0;
						var _, x = (_ = g(17)) && _.__esModule ? _ : { default: _ }, w = g(18), D = [
							{
								test: [/Roku\/DVP/],
								describe: function(p) {
									var m = x.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, p);
									return {
										name: w.OS_MAP.Roku,
										version: m
									};
								}
							},
							{
								test: [/windows phone/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, p);
									return {
										name: w.OS_MAP.WindowsPhone,
										version: m
									};
								}
							},
							{
								test: [/windows /i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, p), g = x.default.getWindowsVersionName(m);
									return {
										name: w.OS_MAP.Windows,
										version: m,
										versionName: g
									};
								}
							},
							{
								test: [/Macintosh(.*?) FxiOS(.*?)\//],
								describe: function(p) {
									var m = { name: w.OS_MAP.iOS }, g = x.default.getSecondMatch(/(Version\/)(\d[\d.]+)/, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/macintosh/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, p).replace(/[_\s]/g, "."), g = x.default.getMacOSVersionName(m), _ = {
										name: w.OS_MAP.MacOS,
										version: m
									};
									return g && (_.versionName = g), _;
								}
							},
							{
								test: [/(ipod|iphone|ipad)/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, p).replace(/[_\s]/g, ".");
									return {
										name: w.OS_MAP.iOS,
										version: m
									};
								}
							},
							{
								test: function(p) {
									var m = !p.test(/like android/i), g = p.test(/android/i);
									return m && g;
								},
								describe: function(p) {
									var m = x.default.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, p), g = x.default.getAndroidVersionName(m), _ = {
										name: w.OS_MAP.Android,
										version: m
									};
									return g && (_.versionName = g), _;
								}
							},
							{
								test: [/(web|hpw)[o0]s/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, p), g = { name: w.OS_MAP.WebOS };
									return m && m.length && (g.version = m), g;
								}
							},
							{
								test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, p) || x.default.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, p) || x.default.getFirstMatch(/\bbb(\d+)/i, p);
									return {
										name: w.OS_MAP.BlackBerry,
										version: m
									};
								}
							},
							{
								test: [/bada/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, p);
									return {
										name: w.OS_MAP.Bada,
										version: m
									};
								}
							},
							{
								test: [/tizen/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, p);
									return {
										name: w.OS_MAP.Tizen,
										version: m
									};
								}
							},
							{
								test: [/linux/i],
								describe: function() {
									return { name: w.OS_MAP.Linux };
								}
							},
							{
								test: [/CrOS/],
								describe: function() {
									return { name: w.OS_MAP.ChromeOS };
								}
							},
							{
								test: [/PlayStation 4/],
								describe: function(p) {
									var m = x.default.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, p);
									return {
										name: w.OS_MAP.PlayStation4,
										version: m
									};
								}
							}
						];
						m.default = D, p.exports = m.default;
					},
					94: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.default = void 0;
						var _, x = (_ = g(17)) && _.__esModule ? _ : { default: _ }, w = g(18), D = [
							{
								test: [/googlebot/i],
								describe: function() {
									return {
										type: "bot",
										vendor: "Google"
									};
								}
							},
							{
								test: [/huawei/i],
								describe: function(p) {
									var m = x.default.getFirstMatch(/(can-l01)/i, p) && "Nova", g = {
										type: w.PLATFORMS_MAP.mobile,
										vendor: "Huawei"
									};
									return m && (g.model = m), g;
								}
							},
							{
								test: [/nexus\s*(?:7|8|9|10).*/i],
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.tablet,
										vendor: "Nexus"
									};
								}
							},
							{
								test: [/ipad/i],
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.tablet,
										vendor: "Apple",
										model: "iPad"
									};
								}
							},
							{
								test: [/Macintosh(.*?) FxiOS(.*?)\//],
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.tablet,
										vendor: "Apple",
										model: "iPad"
									};
								}
							},
							{
								test: [/kftt build/i],
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.tablet,
										vendor: "Amazon",
										model: "Kindle Fire HD 7"
									};
								}
							},
							{
								test: [/silk/i],
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.tablet,
										vendor: "Amazon"
									};
								}
							},
							{
								test: [/tablet(?! pc)/i],
								describe: function() {
									return { type: w.PLATFORMS_MAP.tablet };
								}
							},
							{
								test: function(p) {
									var m = p.test(/ipod|iphone/i), g = p.test(/like (ipod|iphone)/i);
									return m && !g;
								},
								describe: function(p) {
									var m = x.default.getFirstMatch(/(ipod|iphone)/i, p);
									return {
										type: w.PLATFORMS_MAP.mobile,
										vendor: "Apple",
										model: m
									};
								}
							},
							{
								test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.mobile,
										vendor: "Nexus"
									};
								}
							},
							{
								test: [/[^-]mobi/i],
								describe: function() {
									return { type: w.PLATFORMS_MAP.mobile };
								}
							},
							{
								test: function(p) {
									return p.getBrowserName(!0) === "blackberry";
								},
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.mobile,
										vendor: "BlackBerry"
									};
								}
							},
							{
								test: function(p) {
									return p.getBrowserName(!0) === "bada";
								},
								describe: function() {
									return { type: w.PLATFORMS_MAP.mobile };
								}
							},
							{
								test: function(p) {
									return p.getBrowserName() === "windows phone";
								},
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.mobile,
										vendor: "Microsoft"
									};
								}
							},
							{
								test: function(p) {
									var m = Number(String(p.getOSVersion()).split(".")[0]);
									return p.getOSName(!0) === "android" && m >= 3;
								},
								describe: function() {
									return { type: w.PLATFORMS_MAP.tablet };
								}
							},
							{
								test: function(p) {
									return p.getOSName(!0) === "android";
								},
								describe: function() {
									return { type: w.PLATFORMS_MAP.mobile };
								}
							},
							{
								test: function(p) {
									return p.getOSName(!0) === "macos";
								},
								describe: function() {
									return {
										type: w.PLATFORMS_MAP.desktop,
										vendor: "Apple"
									};
								}
							},
							{
								test: function(p) {
									return p.getOSName(!0) === "windows";
								},
								describe: function() {
									return { type: w.PLATFORMS_MAP.desktop };
								}
							},
							{
								test: function(p) {
									return p.getOSName(!0) === "linux";
								},
								describe: function() {
									return { type: w.PLATFORMS_MAP.desktop };
								}
							},
							{
								test: function(p) {
									return p.getOSName(!0) === "playstation 4";
								},
								describe: function() {
									return { type: w.PLATFORMS_MAP.tv };
								}
							},
							{
								test: function(p) {
									return p.getOSName(!0) === "roku";
								},
								describe: function() {
									return { type: w.PLATFORMS_MAP.tv };
								}
							}
						];
						m.default = D, p.exports = m.default;
					},
					95: function(p, m, g) {
						"use strict";
						m.__esModule = !0, m.default = void 0;
						var _, x = (_ = g(17)) && _.__esModule ? _ : { default: _ }, w = g(18), D = [
							{
								test: function(p) {
									return p.getBrowserName(!0) === "microsoft edge";
								},
								describe: function(p) {
									if (/\sedg\//i.test(p)) return { name: w.ENGINE_MAP.Blink };
									var m = x.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, p);
									return {
										name: w.ENGINE_MAP.EdgeHTML,
										version: m
									};
								}
							},
							{
								test: [/trident/i],
								describe: function(p) {
									var m = { name: w.ENGINE_MAP.Trident }, g = x.default.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: function(p) {
									return p.test(/presto/i);
								},
								describe: function(p) {
									var m = { name: w.ENGINE_MAP.Presto }, g = x.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: function(p) {
									var m = p.test(/gecko/i), g = p.test(/like gecko/i);
									return m && !g;
								},
								describe: function(p) {
									var m = { name: w.ENGINE_MAP.Gecko }, g = x.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							},
							{
								test: [/(apple)?webkit\/537\.36/i],
								describe: function() {
									return { name: w.ENGINE_MAP.Blink };
								}
							},
							{
								test: [/(apple)?webkit/i],
								describe: function(p) {
									var m = { name: w.ENGINE_MAP.WebKit }, g = x.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, p);
									return g && (m.version = g), m;
								}
							}
						];
						m.default = D, p.exports = m.default;
					}
				});
			});
		},
		"./node_modules/browser-id3-writer/dist/browser-id3-writer.mjs": (p, m, g) => {
			"use strict";
			g.d(m, { Q: () => o });
			function e(p) {
				return String(p).split("").map((p) => p.charCodeAt(0));
			}
			function t(p) {
				return new Uint8Array(e(p));
			}
			function a(p) {
				let m = new ArrayBuffer(2 * p.length), g = new Uint8Array(m);
				return new Uint16Array(m).set(e(p)), g;
			}
			function r(p) {
				let m = 255;
				return [
					p >>> 24 & m,
					p >>> 16 & m,
					p >>> 8 & m,
					p & m
				];
			}
			function n(p) {
				return 11 + p;
			}
			function s(p, m, g, _) {
				return 11 + m + 1 + 1 + (_ ? 2 + 2 * (g + 1) : g + 1) + p;
			}
			function i(p) {
				let m = 0;
				return p.forEach((p) => {
					m += 2 + 2 * p[0].length + 2 + 2 + 2 * p[1].length + 2;
				}), 11 + m;
			}
			function c(p, m) {
				let g = 2 * m, _ = 0;
				return p.forEach((p) => {
					_ += 2 + 2 * p[0].length + 2 + 4;
				}), 18 + g + 2 + _;
			}
			class o {
				_setIntegerFrame(p, m) {
					let g = parseInt(m, 10);
					this.frames.push({
						name: p,
						value: g,
						size: n(g.toString().length)
					});
				}
				_setStringFrame(p, m) {
					let g = m.toString(), _ = 13 + 2 * g.length;
					p === "TDAT" && (_ = n(g.length)), this.frames.push({
						name: p,
						value: g,
						size: _
					});
				}
				_setPictureFrame(p, m, g, _) {
					let x = function(p) {
						if (!p || !p.length) return null;
						if (p[0] === 255 && p[1] === 216 && p[2] === 255) return "image/jpeg";
						if (p[0] === 137 && p[1] === 80 && p[2] === 78 && p[3] === 71) return "image/png";
						if (p[0] === 71 && p[1] === 73 && p[2] === 70) return "image/gif";
						if (p[8] === 87 && p[9] === 69 && p[10] === 66 && p[11] === 80) return "image/webp";
						let m = p[0] === 73 && p[1] === 73 && p[2] === 42 && p[3] === 0, g = p[0] === 77 && p[1] === 77 && p[2] === 0 && p[3] === 42;
						return m || g ? "image/tiff" : p[0] === 66 && p[1] === 77 ? "image/bmp" : p[0] === 0 && p[1] === 0 && p[2] === 1 && p[3] === 0 ? "image/x-icon" : null;
					}(new Uint8Array(m)), w = g.toString();
					if (!x) throw Error("Unknown picture MIME type");
					g || (_ = !1), this.frames.push({
						name: "APIC",
						value: m,
						pictureType: p,
						mimeType: x,
						useUnicodeEncoding: _,
						description: w,
						size: s(m.byteLength, x.length, w.length, _)
					});
				}
				_setLyricsFrame(p, m, g) {
					let _ = p.split("").map((p) => p.charCodeAt(0)), x = m.toString(), w = g.toString();
					var D, O;
					this.frames.push({
						name: "USLT",
						value: w,
						language: _,
						description: x,
						size: (D = x.length, O = w.length, 16 + 2 * D + 2 + 2 + 2 * O)
					});
				}
				_setCommentFrame(p, m, g) {
					let _ = p.split("").map((p) => p.charCodeAt(0)), x = m.toString(), w = g.toString();
					var D, O;
					this.frames.push({
						name: "COMM",
						value: w,
						language: _,
						description: x,
						size: (D = x.length, O = w.length, 16 + 2 * D + 2 + 2 + 2 * O)
					});
				}
				_setPrivateFrame(p, m) {
					let g = p.toString();
					var _, x;
					this.frames.push({
						name: "PRIV",
						value: m,
						id: g,
						size: (_ = g.length, x = m.byteLength, 10 + _ + 1 + x)
					});
				}
				_setUserStringFrame(p, m) {
					let g = p.toString(), _ = m.toString();
					var x, w;
					this.frames.push({
						name: "TXXX",
						description: g,
						value: _,
						size: (x = g.length, w = _.length, 13 + 2 * x + 2 + 2 + 2 * w)
					});
				}
				_setUrlLinkFrame(p, m) {
					let g = m.toString();
					var _;
					this.frames.push({
						name: p,
						value: g,
						size: (_ = g.length, 10 + _)
					});
				}
				_setPairedTextFrame(p, m) {
					this.frames.push({
						name: p,
						value: m,
						size: i(m)
					});
				}
				_setSynchronisedLyricsFrame(p, m, g, _, x) {
					let w = x.toString(), D = _.split("").map((p) => p.charCodeAt(0));
					this.frames.push({
						name: "SYLT",
						value: m,
						language: D,
						description: w,
						type: p,
						timestampFormat: g,
						size: c(m, w.length)
					});
				}
				constructor(p) {
					if (!p || typeof p != "object" || !("byteLength" in p)) throw Error("First argument should be an instance of ArrayBuffer or Buffer");
					this.arrayBuffer = p, this.padding = 4096, this.frames = [], this.url = "";
				}
				setFrame(p, m) {
					switch (p) {
						case "TPE1":
						case "TCOM":
						case "TCON": {
							if (!Array.isArray(m)) throw Error(`${p} frame value should be an array of strings`);
							let g = p === "TCON" ? ";" : "/", _ = m.join(g);
							this._setStringFrame(p, _);
							break;
						}
						case "TLAN":
						case "TIT1":
						case "TIT2":
						case "TIT3":
						case "TALB":
						case "TPE2":
						case "TPE3":
						case "TPE4":
						case "TRCK":
						case "TPOS":
						case "TMED":
						case "TPUB":
						case "TCOP":
						case "TKEY":
						case "TEXT":
						case "TDAT":
						case "TCMP":
						case "TSRC":
							this._setStringFrame(p, m);
							break;
						case "TBPM":
						case "TLEN":
						case "TYER":
							this._setIntegerFrame(p, m);
							break;
						case "USLT":
							if (m.language = m.language || "eng", typeof m != "object" || !("description" in m) || !("lyrics" in m)) throw Error("USLT frame value should be an object with keys description and lyrics");
							if (m.language && !m.language.match(/[a-z]{3}/i)) throw Error("Language must be coded following the ISO 639-2 standards");
							this._setLyricsFrame(m.language, m.description, m.lyrics);
							break;
						case "APIC":
							if (typeof m != "object" || !("type" in m) || !("data" in m) || !("description" in m)) throw Error("APIC frame value should be an object with keys type, data and description");
							if (m.type < 0 || m.type > 20) throw Error("Incorrect APIC frame picture type");
							this._setPictureFrame(m.type, m.data, m.description, !!m.useUnicodeEncoding);
							break;
						case "TXXX":
							if (typeof m != "object" || !("description" in m) || !("value" in m)) throw Error("TXXX frame value should be an object with keys description and value");
							this._setUserStringFrame(m.description, m.value);
							break;
						case "WCOM":
						case "WCOP":
						case "WOAF":
						case "WOAR":
						case "WOAS":
						case "WORS":
						case "WPAY":
						case "WPUB":
							this._setUrlLinkFrame(p, m);
							break;
						case "COMM":
							if (m.language = m.language || "eng", typeof m != "object" || !("description" in m) || !("text" in m)) throw Error("COMM frame value should be an object with keys description and text");
							if (m.language && !m.language.match(/[a-z]{3}/i)) throw Error("Language must be coded following the ISO 639-2 standards");
							this._setCommentFrame(m.language, m.description, m.text);
							break;
						case "PRIV":
							if (typeof m != "object" || !("id" in m) || !("data" in m)) throw Error("PRIV frame value should be an object with keys id and data");
							this._setPrivateFrame(m.id, m.data);
							break;
						case "IPLS":
							if (!Array.isArray(m) || !Array.isArray(m[0])) throw Error("IPLS frame value should be an array of pairs");
							this._setPairedTextFrame(p, m);
							break;
						case "SYLT":
							if (typeof m != "object" || !("type" in m) || !("text" in m) || !("timestampFormat" in m)) throw Error("SYLT frame value should be an object with keys type, text and timestampFormat");
							if (!Array.isArray(m.text) || !Array.isArray(m.text[0])) throw Error("SYLT frame text value should be an array of pairs");
							if (m.type < 0 || m.type > 6) throw Error("Incorrect SYLT frame content type");
							if (m.timestampFormat < 1 || m.timestampFormat > 2) throw Error("Incorrect SYLT frame time stamp format");
							m.language = m.language || "eng", m.description = m.description || "", this._setSynchronisedLyricsFrame(m.type, m.text, m.timestampFormat, m.language, m.description);
							break;
						default: throw Error(`Unsupported frame ${p}`);
					}
					return this;
				}
				removeTag() {
					if (this.arrayBuffer.byteLength < 10) return;
					let p = new Uint8Array(this.arrayBuffer), m = p[3], g = ((_ = [
						p[6],
						p[7],
						p[8],
						p[9]
					])[0] << 21) + (_[1] << 14) + (_[2] << 7) + _[3] + 10;
					var _, x;
					(x = p)[0] !== 73 || x[1] !== 68 || x[2] !== 51 || m < 2 || m > 4 || (this.arrayBuffer = new Uint8Array(p.subarray(g)).buffer);
				}
				addTag() {
					this.removeTag();
					let p = [255, 254], m = 10 + this.frames.reduce((p, m) => p + m.size, 0) + this.padding, g = new ArrayBuffer(this.arrayBuffer.byteLength + m), _ = new Uint8Array(g), x = 0, w = [];
					return w = [
						73,
						68,
						51,
						3
					], _.set(w, x), x += w.length, x++, x++, w = function(p) {
						let m = 127;
						return [
							p >>> 21 & m,
							p >>> 14 & m,
							p >>> 7 & m,
							p & m
						];
					}(m - 10), _.set(w, x), x += w.length, this.frames.forEach((m) => {
						switch (w = t(m.name), _.set(w, x), x += w.length, w = r(m.size - 10), _.set(w, x), x += w.length, x += 2, m.name) {
							case "WCOM":
							case "WCOP":
							case "WOAF":
							case "WOAR":
							case "WOAS":
							case "WORS":
							case "WPAY":
							case "WPUB":
								w = t(m.value), _.set(w, x), x += w.length;
								break;
							case "TPE1":
							case "TCOM":
							case "TCON":
							case "TLAN":
							case "TIT1":
							case "TIT2":
							case "TIT3":
							case "TALB":
							case "TPE2":
							case "TPE3":
							case "TPE4":
							case "TRCK":
							case "TPOS":
							case "TKEY":
							case "TMED":
							case "TPUB":
							case "TCOP":
							case "TEXT":
							case "TSRC":
								w = [1].concat(p), _.set(w, x), x += w.length, w = a(m.value), _.set(w, x), x += w.length;
								break;
							case "TXXX":
							case "USLT":
							case "COMM":
								w = [1], m.name !== "USLT" && m.name !== "COMM" || (w = w.concat(m.language)), w = w.concat(p), _.set(w, x), x += w.length, w = a(m.description), _.set(w, x), x += w.length, w = [0, 0].concat(p), _.set(w, x), x += w.length, w = a(m.value), _.set(w, x), x += w.length;
								break;
							case "TBPM":
							case "TLEN":
							case "TDAT":
							case "TYER":
								x++, w = t(m.value), _.set(w, x), x += w.length;
								break;
							case "PRIV":
								w = t(m.id), _.set(w, x), x += w.length, x++, _.set(new Uint8Array(m.value), x), x += m.value.byteLength;
								break;
							case "APIC":
								w = [m.useUnicodeEncoding ? 1 : 0], _.set(w, x), x += w.length, w = t(m.mimeType), _.set(w, x), x += w.length, w = [0, m.pictureType], _.set(w, x), x += w.length, m.useUnicodeEncoding ? (w = [].concat(p), _.set(w, x), x += w.length, w = a(m.description), _.set(w, x), x += w.length, x += 2) : (w = t(m.description), _.set(w, x), x += w.length, x++), _.set(new Uint8Array(m.value), x), x += m.value.byteLength;
								break;
							case "IPLS":
								w = [1], _.set(w, x), x += w.length, m.value.forEach((m) => {
									w = [].concat(p), _.set(w, x), x += w.length, w = a(m[0].toString()), _.set(w, x), x += w.length, w = [0, 0].concat(p), _.set(w, x), x += w.length, w = a(m[1].toString()), _.set(w, x), x += w.length, w = [0, 0], _.set(w, x), x += w.length;
								});
								break;
							case "SYLT": w = [1].concat(m.language, m.timestampFormat, m.type), _.set(w, x), x += w.length, w = [].concat(p), _.set(w, x), x += w.length, w = a(m.description), _.set(w, x), x += w.length, x += 2, m.value.forEach((m) => {
								w = [].concat(p), _.set(w, x), x += w.length, w = a(m[0].toString()), _.set(w, x), x += w.length, w = [0, 0], _.set(w, x), x += w.length, w = r(m[1]), _.set(w, x), x += w.length;
							});
						}
					}), x += this.padding, _.set(new Uint8Array(this.arrayBuffer), x), this.arrayBuffer = g, g;
				}
				getBlob() {
					return new Blob([this.arrayBuffer], { type: "audio/mpeg" });
				}
				getURL() {
					return this.url ||= URL.createObjectURL(this.getBlob()), this.url;
				}
				revokeURL() {
					URL.revokeObjectURL(this.url);
				}
			}
		},
		"./node_modules/chaimu/dist/index.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				Ay: () => Chaimu,
				GZ: () => initAudioContext
			});
			let _ = {
				version: "1.0.6",
				debug: !1,
				fetchFn: fetch.bind(window)
			}, x = { log: (...p) => {
				if (_.debug) return console.log(`%c✦ chaimu.js v${_.version} ✦`, "background: #000; color: #fff; padding: 0 8px", ...p);
			} }, w = [
				"playing",
				"ratechange",
				"play",
				"waiting",
				"pause",
				"seeked"
			];
			function initAudioContext() {
				let p = window.AudioContext || window.webkitAudioContext;
				return p ? new p() : void 0;
			}
			class BasePlayer {
				static name = "BasePlayer";
				chaimu;
				fetch;
				_src;
				fetchOpts;
				constructor(p, m) {
					this.chaimu = p, this._src = m, this.fetch = this.chaimu.fetchFn, this.fetchOpts = this.chaimu.fetchOpts;
				}
				async init() {
					return this;
				}
				async clear() {
					return this;
				}
				lipSync(p = !1) {
					return this;
				}
				handleVideoEvent = (p) => (x.log(`handle video ${p.type}`), this.lipSync(p.type), this);
				removeVideoEvents() {
					for (let p of w) this.chaimu.video?.removeEventListener(p, this.handleVideoEvent);
					return this;
				}
				addVideoEvents() {
					for (let p of w) this.chaimu.video?.addEventListener(p, this.handleVideoEvent);
					return this;
				}
				async play() {
					return this;
				}
				async pause() {
					return this;
				}
				get name() {
					return this.constructor.name;
				}
				set src(p) {
					this._src = p;
				}
				get src() {
					return this._src;
				}
				get currentSrc() {
					return this._src;
				}
				set volume(p) {}
				get volume() {
					return 0;
				}
				get playbackRate() {
					return 0;
				}
				set playbackRate(p) {}
				get currentTime() {
					return 0;
				}
			}
			class AudioPlayer extends BasePlayer {
				static name = "AudioPlayer";
				audio;
				gainNode;
				audioSource;
				constructor(p, m) {
					super(p, m), this.updateAudio();
				}
				initAudioBooster() {
					return this.chaimu.audioContext ? (this.disconnectAudioNodes(), this.gainNode = this.chaimu.audioContext.createGain(), this.gainNode.connect(this.chaimu.audioContext.destination), this.audioSource = this.chaimu.audioContext.createMediaElementSource(this.audio), this.audioSource.connect(this.gainNode), this) : this;
				}
				disconnectAudioNodes() {
					this.audioSource && (this.audioSource.disconnect(), this.audioSource = void 0), this.gainNode && (this.gainNode.disconnect(), this.gainNode = void 0);
				}
				updateAudio() {
					return this.audio = new Audio(this.src), this.audio.crossOrigin = "anonymous", this;
				}
				async init() {
					return this.updateAudio(), this.initAudioBooster(), this;
				}
				audioErrorHandle = (p) => {
					console.error("[AudioPlayer]", p);
				};
				lipSync(p = !1) {
					if (x.log("[AudioPlayer] lipsync video", this.chaimu.video), !this.chaimu.video) return this;
					if (this.audio.currentTime = this.chaimu.video.currentTime, this.audio.playbackRate = this.chaimu.video.playbackRate, !p) return x.log("[AudioPlayer] lipsync mode isn't set"), this;
					switch (x.log(`[AudioPlayer] lipsync mode is ${p}`), p) {
						case "play":
						case "playing":
						case "seeked": return this.chaimu.video.paused || this.syncPlay(), this;
						case "pause":
						case "waiting": return this.pause(), this;
						default: return this;
					}
				}
				async clear() {
					return this.audio.pause(), this.audio.src = "", this.audio.removeAttribute("src"), this.disconnectAudioNodes(), this;
				}
				syncPlay() {
					return x.log("[AudioPlayer] sync play called"), this.audio && this.audio.play().catch(this.audioErrorHandle), this;
				}
				async play() {
					return x.log("[AudioPlayer] play called"), this.audio && await this.audio.play().catch(this.audioErrorHandle), this;
				}
				async pause() {
					return x.log("[AudioPlayer] pause called"), this.audio && this.audio.pause(), this;
				}
				set src(p) {
					if (this._src = p, !p) {
						this.clear();
						return;
					}
					this.audio.src = p;
				}
				get src() {
					return this._src;
				}
				get currentSrc() {
					return this.audio.currentSrc;
				}
				set volume(p) {
					if (this.gainNode) {
						this.gainNode.gain.value = p;
						return;
					}
					this.audio.volume = p;
				}
				get volume() {
					return this.gainNode ? this.gainNode.gain.value : this.audio.volume;
				}
				get playbackRate() {
					return this.audio.playbackRate;
				}
				set playbackRate(p) {
					this.audio.playbackRate = p;
				}
				get currentTime() {
					return this.audio.currentTime;
				}
			}
			class ChaimuPlayer extends BasePlayer {
				static name = "ChaimuPlayer";
				audioBuffer;
				audioElement;
				mediaElementSource;
				gainNode;
				blobUrl;
				isClearing = !1;
				isInitializing = !1;
				clearingPromise;
				async fetchAudio() {
					if (!this._src) throw Error("No audio source provided");
					if (!this.chaimu.audioContext) throw Error("No audio context available");
					x.log(`[ChaimuPlayer] Fetching audio from ${this._src}...`);
					let p;
					try {
						let m = await this.fetch(this._src, this.fetchOpts);
						x.log("[ChaimuPlayer] Decoding fetched audio...");
						let g = await m.arrayBuffer(), _ = new Blob([g]);
						p = URL.createObjectURL(_), this.audioBuffer = await this.chaimu.audioContext.decodeAudioData(g), this.blobUrl && URL.revokeObjectURL(this.blobUrl), this.blobUrl = p, p = void 0;
					} catch (m) {
						throw p && URL.revokeObjectURL(p), Error(`Failed to fetch audio file, because ${m.message}`);
					}
					return this;
				}
				initAudioBooster() {
					return this.chaimu.audioContext ? (this.disconnectAudioNodes(), this.gainNode = this.chaimu.audioContext.createGain(), this) : this;
				}
				disconnectAudioNodes() {
					this.mediaElementSource && (this.mediaElementSource.disconnect(), this.mediaElementSource = void 0), this.gainNode && (this.gainNode.disconnect(), this.gainNode = void 0);
				}
				async init() {
					if (this.isInitializing) throw Error("Initialization already in progress");
					this.isInitializing = !0;
					try {
						return await this.fetchAudio(), this.initAudioBooster(), this.createAudioElement(), this;
					} finally {
						this.isInitializing = !1;
					}
				}
				createAudioElement() {
					if (!this.chaimu.audioContext) throw Error("No audio context available");
					if (!this.blobUrl) throw Error("No blob URL available.");
					let p = new Audio(this.blobUrl);
					p.crossOrigin = "anonymous", "preservesPitch" in p && (p.preservesPitch = !0, "mozPreservesPitch" in p && (p.mozPreservesPitch = !0), "webkitPreservesPitch" in p && (p.webkitPreservesPitch = !0)), this.audioElement = p, this.mediaElementSource = this.chaimu.audioContext.createMediaElementSource(p), this.mediaElementSource.connect(this.gainNode), this.gainNode.connect(this.chaimu.audioContext.destination);
				}
				lipSync(p = !1) {
					if (x.log("[ChaimuPlayer] lipsync video", this.chaimu.video, this), !this.chaimu.video) return this;
					if (!p) return x.log("[ChaimuPlayer] lipsync mode isn't set"), this;
					switch (x.log(`[ChaimuPlayer] lipsync mode is ${p}`), p) {
						case "play":
						case "playing":
						case "ratechange":
						case "seeked": return this.chaimu.video.paused || this.start(), this;
						case "pause":
						case "waiting": return this.pause(), this;
						default: return this;
					}
				}
				async reopenCtx() {
					if (!this.chaimu.audioContext) throw Error("No audio context available");
					try {
						this.chaimu.audioContext.state !== "closed" && await this.chaimu.audioContext.close();
					} catch (p) {
						x.log("[ChaimuPlayer] Failed to close audio context:", p);
					}
					return this.chaimu.audioContext = initAudioContext(), this;
				}
				async clear() {
					if (this.isClearing && this.clearingPromise) return this.clearingPromise;
					if (!this.chaimu.audioContext) throw Error("No audio context available");
					return x.log("clear audio context"), this.isClearing = !0, this.clearingPromise = (async () => {
						try {
							await this.pause(), this.audioElement && (this.audioElement.pause(), this.audioElement = void 0), this.blobUrl && (URL.revokeObjectURL(this.blobUrl), this.blobUrl = void 0), this.disconnectAudioNodes();
							let p = this.gainNode ? this.gainNode.gain.value : 1;
							return await this.reopenCtx(), this.chaimu.audioContext && (this.initAudioBooster(), this.volume = p), this;
						} finally {
							this.isClearing = !1, this.clearingPromise = void 0;
						}
					})(), this.clearingPromise;
				}
				async start() {
					if (!this.chaimu.audioContext) throw Error("No audio context available");
					if (!this.audioElement) throw Error("Audio element is missing");
					return this.isClearing && this.clearingPromise && (x.log("The other cleaner is still running, waiting..."), await this.clearingPromise), x.log("starting audio via HTMLAudioElement"), await this.play(), this.chaimu.video && (this.audioElement.currentTime = this.chaimu.video.currentTime, this.audioElement.playbackRate = this.chaimu.video.playbackRate), this.audioElement.play().catch((p) => x.log("[ChaimuPlayer] Play audioElement failed:", p)), this;
				}
				async pause() {
					if (!this.chaimu.audioContext) throw Error("No audio context available");
					return this.audioElement && this.audioElement.pause(), this.chaimu.audioContext.state === "running" && await this.chaimu.audioContext.suspend(), this;
				}
				async play() {
					if (!this.chaimu.audioContext) throw Error("No audio context available");
					return await this.chaimu.audioContext.resume(), this;
				}
				set src(p) {
					this._src = p;
				}
				get src() {
					return this._src;
				}
				get currentSrc() {
					return this._src;
				}
				set volume(p) {
					this.gainNode && (this.gainNode.gain.value = p);
				}
				get volume() {
					return this.gainNode ? this.gainNode.gain.value : 0;
				}
				set playbackRate(p) {
					this.audioElement && (this.audioElement.playbackRate = p);
				}
				get playbackRate() {
					return this.audioElement ? this.audioElement.playbackRate : this.chaimu.video?.playbackRate ?? 1;
				}
				get currentTime() {
					return this.chaimu.video?.currentTime ?? 0;
				}
			}
			class Chaimu {
				_debug = !1;
				audioContext;
				player;
				video;
				fetchFn;
				fetchOpts;
				constructor({ url: p, video: m, debug: g = !1, fetchFn: x = _.fetchFn, fetchOpts: w = {}, preferAudio: D = !1 }) {
					this._debug = _.debug = g, this.fetchFn = x, this.fetchOpts = w, this.audioContext = initAudioContext(), this.player = this.audioContext && !D ? new ChaimuPlayer(this, p) : new AudioPlayer(this, p), this.video = m;
				}
				async init() {
					await this.player.init(), this.video && !this.video.paused && this.player.lipSync("play"), this.player.addVideoEvents();
				}
				set debug(p) {
					this._debug = _.debug = p;
				}
				get debug() {
					return this._debug;
				}
			}
		},
		"./node_modules/hls.js/dist/hls.light.min.js": (p) => {
			(function e(m) {
				var g, i;
				g = this, i = function() {
					"use strict";
					function r(p, m) {
						var g = Object.keys(p);
						if (Object.getOwnPropertySymbols) {
							var _ = Object.getOwnPropertySymbols(p);
							m && (_ = _.filter(function(m) {
								return Object.getOwnPropertyDescriptor(p, m).enumerable;
							})), g.push.apply(g, _);
						}
						return g;
					}
					function i(p) {
						for (var m = 1; m < arguments.length; m++) {
							var g = arguments[m] == null ? {} : arguments[m];
							m % 2 ? r(Object(g), !0).forEach(function(m) {
								var _, x, w;
								_ = p, x = m, w = g[m], (x = a(x)) in _ ? Object.defineProperty(_, x, {
									value: w,
									enumerable: !0,
									configurable: !0,
									writable: !0
								}) : _[x] = w;
							}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(p, Object.getOwnPropertyDescriptors(g)) : r(Object(g)).forEach(function(m) {
								Object.defineProperty(p, m, Object.getOwnPropertyDescriptor(g, m));
							});
						}
						return p;
					}
					function a(p) {
						var m = function(p, m) {
							if (typeof p != "object" || !p) return p;
							var g = p[Symbol.toPrimitive];
							if (g !== void 0) {
								var _ = g.call(p, m || "default");
								if (typeof _ != "object") return _;
								throw TypeError("@@toPrimitive must return a primitive value.");
							}
							return (m === "string" ? String : Number)(p);
						}(p, "string");
						return typeof m == "symbol" ? m : String(m);
					}
					function n(p, m) {
						for (var g = 0; g < m.length; g++) {
							var _ = m[g];
							_.enumerable = _.enumerable || !1, _.configurable = !0, "value" in _ && (_.writable = !0), Object.defineProperty(p, a(_.key), _);
						}
					}
					function s(p, m, g) {
						return m && n(p.prototype, m), g && n(p, g), Object.defineProperty(p, "prototype", { writable: !1 }), p;
					}
					function o() {
						return o = Object.assign ? Object.assign.bind() : function(p) {
							for (var m = 1; m < arguments.length; m++) {
								var g = arguments[m];
								for (var _ in g) Object.prototype.hasOwnProperty.call(g, _) && (p[_] = g[_]);
							}
							return p;
						}, o.apply(this, arguments);
					}
					function l(p, m) {
						p.prototype = Object.create(m.prototype), p.prototype.constructor = p, d(p, m);
					}
					function u(p) {
						return u = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(p) {
							return p.__proto__ || Object.getPrototypeOf(p);
						}, u(p);
					}
					function d(p, m) {
						return d = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(p, m) {
							return p.__proto__ = m, p;
						}, d(p, m);
					}
					function h(p, m, g) {
						return h = function() {
							if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham) return !1;
							if (typeof Proxy == "function") return !0;
							try {
								return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0;
							} catch {
								return !1;
							}
						}() ? Reflect.construct.bind() : function(p, m, g) {
							var _ = [null];
							_.push.apply(_, m);
							var x = new (Function.bind.apply(p, _))();
							return g && d(x, g.prototype), x;
						}, h.apply(null, arguments);
					}
					function f(p) {
						var m = typeof Map == "function" ? new Map() : void 0;
						return f = function(p) {
							if (p === null || !function(p) {
								try {
									return Function.toString.call(p).indexOf("[native code]") !== -1;
								} catch {
									return typeof p == "function";
								}
							}(p)) return p;
							if (typeof p != "function") throw TypeError("Super expression must either be null or a function");
							if (m !== void 0) {
								if (m.has(p)) return m.get(p);
								m.set(p, r);
							}
							function r() {
								return h(p, arguments, u(this).constructor);
							}
							return r.prototype = Object.create(p.prototype, { constructor: {
								value: r,
								enumerable: !1,
								writable: !0,
								configurable: !0
							} }), d(r, p);
						}, f(p);
					}
					function c(p) {
						return p && p.__esModule && Object.prototype.hasOwnProperty.call(p, "default") ? p.default : p;
					}
					var p = { exports: {} };
					(function(p, m) {
						var g, _, x, w, D;
						g = /^(?=((?:[a-zA-Z0-9+\-.]+:)?))\1(?=((?:\/\/[^\/?#]*)?))\2(?=((?:(?:[^?#\/]*\/)*[^;?#\/]*)?))\3((?:;[^?#]*)?)(\?[^#]*)?(#[^]*)?$/, _ = /^(?=([^\/?#]*))\1([^]*)$/, x = /(?:\/|^)\.(?=\/)/g, w = /(?:\/|^)\.\.\/(?!\.\.\/)[^\/]*(?=\/)/g, D = {
							buildAbsoluteURL: function(p, m, g) {
								if (g ||= {}, p = p.trim(), !(m = m.trim())) {
									if (!g.alwaysNormalize) return p;
									var x = D.parseURL(p);
									if (!x) throw Error("Error trying to parse base URL.");
									return x.path = D.normalizePath(x.path), D.buildURLFromParts(x);
								}
								var w = D.parseURL(m);
								if (!w) throw Error("Error trying to parse relative URL.");
								if (w.scheme) return g.alwaysNormalize ? (w.path = D.normalizePath(w.path), D.buildURLFromParts(w)) : m;
								var O = D.parseURL(p);
								if (!O) throw Error("Error trying to parse base URL.");
								if (!O.netLoc && O.path && O.path[0] !== "/") {
									var A = _.exec(O.path);
									O.netLoc = A[1], O.path = A[2];
								}
								O.netLoc && !O.path && (O.path = "/");
								var F = {
									scheme: O.scheme,
									netLoc: w.netLoc,
									path: null,
									params: w.params,
									query: w.query,
									fragment: w.fragment
								};
								if (!w.netLoc && (F.netLoc = O.netLoc, w.path[0] !== "/")) if (w.path) {
									var U = O.path, K = U.substring(0, U.lastIndexOf("/") + 1) + w.path;
									F.path = D.normalizePath(K);
								} else F.path = O.path, w.params || (F.params = O.params, w.query || (F.query = O.query));
								return F.path === null && (F.path = g.alwaysNormalize ? D.normalizePath(w.path) : w.path), D.buildURLFromParts(F);
							},
							parseURL: function(p) {
								var m = g.exec(p);
								return m ? {
									scheme: m[1] || "",
									netLoc: m[2] || "",
									path: m[3] || "",
									params: m[4] || "",
									query: m[5] || "",
									fragment: m[6] || ""
								} : null;
							},
							normalizePath: function(p) {
								for (p = p.split("").reverse().join("").replace(x, ""); p.length !== (p = p.replace(w, "")).length;);
								return p.split("").reverse().join("");
							},
							buildURLFromParts: function(p) {
								return p.scheme + p.netLoc + p.path + p.params + p.query + p.fragment;
							}
						}, p.exports = D;
					})(p);
					var g = p.exports, _ = Number.isFinite || function(p) {
						return typeof p == "number" && isFinite(p);
					}, x = Number.isSafeInteger || function(p) {
						return typeof p == "number" && Math.abs(p) <= w;
					}, w = 2 ** 53 - 1 || 9007199254740991, D = function(p) {
						return p.MEDIA_ATTACHING = "hlsMediaAttaching", p.MEDIA_ATTACHED = "hlsMediaAttached", p.MEDIA_DETACHING = "hlsMediaDetaching", p.MEDIA_DETACHED = "hlsMediaDetached", p.BUFFER_RESET = "hlsBufferReset", p.BUFFER_CODECS = "hlsBufferCodecs", p.BUFFER_CREATED = "hlsBufferCreated", p.BUFFER_APPENDING = "hlsBufferAppending", p.BUFFER_APPENDED = "hlsBufferAppended", p.BUFFER_EOS = "hlsBufferEos", p.BUFFER_FLUSHING = "hlsBufferFlushing", p.BUFFER_FLUSHED = "hlsBufferFlushed", p.MANIFEST_LOADING = "hlsManifestLoading", p.MANIFEST_LOADED = "hlsManifestLoaded", p.MANIFEST_PARSED = "hlsManifestParsed", p.LEVEL_SWITCHING = "hlsLevelSwitching", p.LEVEL_SWITCHED = "hlsLevelSwitched", p.LEVEL_LOADING = "hlsLevelLoading", p.LEVEL_LOADED = "hlsLevelLoaded", p.LEVEL_UPDATED = "hlsLevelUpdated", p.LEVEL_PTS_UPDATED = "hlsLevelPtsUpdated", p.LEVELS_UPDATED = "hlsLevelsUpdated", p.AUDIO_TRACKS_UPDATED = "hlsAudioTracksUpdated", p.AUDIO_TRACK_SWITCHING = "hlsAudioTrackSwitching", p.AUDIO_TRACK_SWITCHED = "hlsAudioTrackSwitched", p.AUDIO_TRACK_LOADING = "hlsAudioTrackLoading", p.AUDIO_TRACK_LOADED = "hlsAudioTrackLoaded", p.SUBTITLE_TRACKS_UPDATED = "hlsSubtitleTracksUpdated", p.SUBTITLE_TRACKS_CLEARED = "hlsSubtitleTracksCleared", p.SUBTITLE_TRACK_SWITCH = "hlsSubtitleTrackSwitch", p.SUBTITLE_TRACK_LOADING = "hlsSubtitleTrackLoading", p.SUBTITLE_TRACK_LOADED = "hlsSubtitleTrackLoaded", p.SUBTITLE_FRAG_PROCESSED = "hlsSubtitleFragProcessed", p.CUES_PARSED = "hlsCuesParsed", p.NON_NATIVE_TEXT_TRACKS_FOUND = "hlsNonNativeTextTracksFound", p.INIT_PTS_FOUND = "hlsInitPtsFound", p.FRAG_LOADING = "hlsFragLoading", p.FRAG_LOAD_EMERGENCY_ABORTED = "hlsFragLoadEmergencyAborted", p.FRAG_LOADED = "hlsFragLoaded", p.FRAG_DECRYPTED = "hlsFragDecrypted", p.FRAG_PARSING_INIT_SEGMENT = "hlsFragParsingInitSegment", p.FRAG_PARSING_USERDATA = "hlsFragParsingUserdata", p.FRAG_PARSING_METADATA = "hlsFragParsingMetadata", p.FRAG_PARSED = "hlsFragParsed", p.FRAG_BUFFERED = "hlsFragBuffered", p.FRAG_CHANGED = "hlsFragChanged", p.FPS_DROP = "hlsFpsDrop", p.FPS_DROP_LEVEL_CAPPING = "hlsFpsDropLevelCapping", p.MAX_AUTO_LEVEL_UPDATED = "hlsMaxAutoLevelUpdated", p.ERROR = "hlsError", p.DESTROYING = "hlsDestroying", p.KEY_LOADING = "hlsKeyLoading", p.KEY_LOADED = "hlsKeyLoaded", p.LIVE_BACK_BUFFER_REACHED = "hlsLiveBackBufferReached", p.BACK_BUFFER_REACHED = "hlsBackBufferReached", p.STEERING_MANIFEST_LOADED = "hlsSteeringManifestLoaded", p;
					}({}), O = function(p) {
						return p.NETWORK_ERROR = "networkError", p.MEDIA_ERROR = "mediaError", p.KEY_SYSTEM_ERROR = "keySystemError", p.MUX_ERROR = "muxError", p.OTHER_ERROR = "otherError", p;
					}({}), A = function(p) {
						return p.KEY_SYSTEM_NO_KEYS = "keySystemNoKeys", p.KEY_SYSTEM_NO_ACCESS = "keySystemNoAccess", p.KEY_SYSTEM_NO_SESSION = "keySystemNoSession", p.KEY_SYSTEM_NO_CONFIGURED_LICENSE = "keySystemNoConfiguredLicense", p.KEY_SYSTEM_LICENSE_REQUEST_FAILED = "keySystemLicenseRequestFailed", p.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED = "keySystemServerCertificateRequestFailed", p.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED = "keySystemServerCertificateUpdateFailed", p.KEY_SYSTEM_SESSION_UPDATE_FAILED = "keySystemSessionUpdateFailed", p.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED = "keySystemStatusOutputRestricted", p.KEY_SYSTEM_STATUS_INTERNAL_ERROR = "keySystemStatusInternalError", p.MANIFEST_LOAD_ERROR = "manifestLoadError", p.MANIFEST_LOAD_TIMEOUT = "manifestLoadTimeOut", p.MANIFEST_PARSING_ERROR = "manifestParsingError", p.MANIFEST_INCOMPATIBLE_CODECS_ERROR = "manifestIncompatibleCodecsError", p.LEVEL_EMPTY_ERROR = "levelEmptyError", p.LEVEL_LOAD_ERROR = "levelLoadError", p.LEVEL_LOAD_TIMEOUT = "levelLoadTimeOut", p.LEVEL_PARSING_ERROR = "levelParsingError", p.LEVEL_SWITCH_ERROR = "levelSwitchError", p.AUDIO_TRACK_LOAD_ERROR = "audioTrackLoadError", p.AUDIO_TRACK_LOAD_TIMEOUT = "audioTrackLoadTimeOut", p.SUBTITLE_LOAD_ERROR = "subtitleTrackLoadError", p.SUBTITLE_TRACK_LOAD_TIMEOUT = "subtitleTrackLoadTimeOut", p.FRAG_LOAD_ERROR = "fragLoadError", p.FRAG_LOAD_TIMEOUT = "fragLoadTimeOut", p.FRAG_DECRYPT_ERROR = "fragDecryptError", p.FRAG_PARSING_ERROR = "fragParsingError", p.FRAG_GAP = "fragGap", p.REMUX_ALLOC_ERROR = "remuxAllocError", p.KEY_LOAD_ERROR = "keyLoadError", p.KEY_LOAD_TIMEOUT = "keyLoadTimeOut", p.BUFFER_ADD_CODEC_ERROR = "bufferAddCodecError", p.BUFFER_INCOMPATIBLE_CODECS_ERROR = "bufferIncompatibleCodecsError", p.BUFFER_APPEND_ERROR = "bufferAppendError", p.BUFFER_APPENDING_ERROR = "bufferAppendingError", p.BUFFER_STALLED_ERROR = "bufferStalledError", p.BUFFER_FULL_ERROR = "bufferFullError", p.BUFFER_SEEK_OVER_HOLE = "bufferSeekOverHole", p.BUFFER_NUDGE_ON_STALL = "bufferNudgeOnStall", p.INTERNAL_EXCEPTION = "internalException", p.INTERNAL_ABORTED = "aborted", p.UNKNOWN = "unknown", p;
					}({}), L = function() {}, F = {
						trace: L,
						debug: L,
						log: L,
						warn: L,
						info: L,
						error: L
					}, U = F;
					function b(p) {
						for (var m = arguments.length, g = Array(m > 1 ? m - 1 : 0), _ = 1; _ < m; _++) g[_ - 1] = arguments[_];
						g.forEach(function(m) {
							U[m] = p[m] ? p[m].bind(p) : function(p) {
								var m = self.console[p];
								return m ? m.bind(self.console, "[" + p + "] >") : L;
							}(m);
						});
					}
					function k(p, m) {
						if (typeof console == "object" && !0 === p || typeof p == "object") {
							b(p, "debug", "log", "info", "warn", "error");
							try {
								U.log("Debug logs enabled for \"" + m + "\" in hls.js version 1.5.18");
							} catch {
								U = F;
							}
						} else U = F;
					}
					var K = U, oe = /^(\d+)x(\d+)$/, le = /(.+?)=(".*?"|.*?)(?:,|$)/g, ue = function() {
						function e(p) {
							typeof p == "string" && (p = e.parseAttrList(p)), o(this, p);
						}
						var p = e.prototype;
						return p.decimalInteger = function(p) {
							var m = parseInt(this[p], 10);
							return m > 2 ** 53 - 1 ? Infinity : m;
						}, p.hexadecimalInteger = function(p) {
							if (this[p]) {
								var m = (this[p] || "0x").slice(2);
								m = (1 & m.length ? "0" : "") + m;
								for (var g = new Uint8Array(m.length / 2), _ = 0; _ < m.length / 2; _++) g[_] = parseInt(m.slice(2 * _, 2 * _ + 2), 16);
								return g;
							}
							return null;
						}, p.hexadecimalIntegerAsNumber = function(p) {
							var m = parseInt(this[p], 16);
							return m > 2 ** 53 - 1 ? Infinity : m;
						}, p.decimalFloatingPoint = function(p) {
							return parseFloat(this[p]);
						}, p.optionalFloat = function(p, m) {
							var g = this[p];
							return g ? parseFloat(g) : m;
						}, p.enumeratedString = function(p) {
							return this[p];
						}, p.bool = function(p) {
							return this[p] === "YES";
						}, p.decimalResolution = function(p) {
							var m = oe.exec(this[p]);
							if (m !== null) return {
								width: parseInt(m[1], 10),
								height: parseInt(m[2], 10)
							};
						}, e.parseAttrList = function(p) {
							var m, g = {};
							for (le.lastIndex = 0; (m = le.exec(p)) !== null;) {
								var _ = m[2];
								_.indexOf("\"") === 0 && _.lastIndexOf("\"") === _.length - 1 && (_ = _.slice(1, -1)), g[m[1].trim()] = _;
							}
							return g;
						}, s(e, [{
							key: "clientAttrs",
							get: function() {
								return Object.keys(this).filter(function(p) {
									return p.substring(0, 2) === "X-";
								});
							}
						}]), e;
					}();
					function C(p) {
						return p === "SCTE35-OUT" || p === "SCTE35-IN";
					}
					var we = function() {
						function e(p, m) {
							if (this.attr = void 0, this._startDate = void 0, this._endDate = void 0, this._badValueForSameId = void 0, m) {
								var g = m.attr;
								for (var x in g) if (Object.prototype.hasOwnProperty.call(p, x) && p[x] !== g[x]) {
									K.warn("DATERANGE tag attribute: \"" + x + "\" does not match for tags with ID: \"" + p.ID + "\""), this._badValueForSameId = x;
									break;
								}
								p = o(new ue({}), g, p);
							}
							if (this.attr = p, this._startDate = new Date(p["START-DATE"]), "END-DATE" in this.attr) {
								var w = new Date(this.attr["END-DATE"]);
								_(w.getTime()) && (this._endDate = w);
							}
						}
						return s(e, [
							{
								key: "id",
								get: function() {
									return this.attr.ID;
								}
							},
							{
								key: "class",
								get: function() {
									return this.attr.CLASS;
								}
							},
							{
								key: "startDate",
								get: function() {
									return this._startDate;
								}
							},
							{
								key: "endDate",
								get: function() {
									if (this._endDate) return this._endDate;
									var p = this.duration;
									return p === null ? null : new Date(this._startDate.getTime() + 1e3 * p);
								}
							},
							{
								key: "duration",
								get: function() {
									if ("DURATION" in this.attr) {
										var p = this.attr.decimalFloatingPoint("DURATION");
										if (_(p)) return p;
									} else if (this._endDate) return (this._endDate.getTime() - this._startDate.getTime()) / 1e3;
									return null;
								}
							},
							{
								key: "plannedDuration",
								get: function() {
									return "PLANNED-DURATION" in this.attr ? this.attr.decimalFloatingPoint("PLANNED-DURATION") : null;
								}
							},
							{
								key: "endOnNext",
								get: function() {
									return this.attr.bool("END-ON-NEXT");
								}
							},
							{
								key: "isValid",
								get: function() {
									return !!this.id && !this._badValueForSameId && _(this.startDate.getTime()) && (this.duration === null || this.duration >= 0) && (!this.endOnNext || !!this.class);
								}
							}
						]), e;
					}(), P = function() {
						this.aborted = !1, this.loaded = 0, this.retry = 0, this.total = 0, this.chunkCount = 0, this.bwEstimate = 0, this.loading = {
							start: 0,
							first: 0,
							end: 0
						}, this.parsing = {
							start: 0,
							end: 0
						}, this.buffering = {
							start: 0,
							first: 0,
							end: 0
						};
					}, je = "audio", Ie = "video", Be = "audiovideo", Ve = function() {
						function e(p) {
							var m;
							this._byteRange = null, this._url = null, this.baseurl = void 0, this.relurl = void 0, this.elementaryStreams = ((m = {})[je] = null, m[Ie] = null, m[Be] = null, m), this.baseurl = p;
						}
						return e.prototype.setByteRange = function(p, m) {
							var g, _ = p.split("@", 2);
							g = _.length === 1 ? m?.byteRangeEndOffset || 0 : parseInt(_[1]), this._byteRange = [g, parseInt(_[0]) + g];
						}, s(e, [
							{
								key: "byteRange",
								get: function() {
									return this._byteRange ? this._byteRange : [];
								}
							},
							{
								key: "byteRangeStartOffset",
								get: function() {
									return this.byteRange[0];
								}
							},
							{
								key: "byteRangeEndOffset",
								get: function() {
									return this.byteRange[1];
								}
							},
							{
								key: "url",
								get: function() {
									return !this._url && this.baseurl && this.relurl && (this._url = g.buildAbsoluteURL(this.baseurl, this.relurl, { alwaysNormalize: !0 })), this._url || "";
								},
								set: function(p) {
									this._url = p;
								}
							}
						]), e;
					}(), Ue = function(p) {
						function t(m, g) {
							var _;
							return (_ = p.call(this, g) || this)._decryptdata = null, _.rawProgramDateTime = null, _.programDateTime = null, _.tagList = [], _.duration = 0, _.sn = 0, _.levelkeys = void 0, _.type = void 0, _.loader = null, _.keyLoader = null, _.level = -1, _.cc = 0, _.startPTS = void 0, _.endPTS = void 0, _.startDTS = void 0, _.endDTS = void 0, _.start = 0, _.deltaPTS = void 0, _.maxStartPTS = void 0, _.minEndPTS = void 0, _.stats = new P(), _.data = void 0, _.bitrateTest = !1, _.title = null, _.initSegment = null, _.endList = void 0, _.gap = void 0, _.urlId = 0, _.type = m, _;
						}
						l(t, p);
						var m = t.prototype;
						return m.setKeyFormat = function(p) {
							if (this.levelkeys) {
								var m = this.levelkeys[p];
								m && !this._decryptdata && (this._decryptdata = m.getDecryptData(this.sn));
							}
						}, m.abortRequests = function() {
							var p, m;
							(p = this.loader) == null || p.abort(), (m = this.keyLoader) == null || m.abort();
						}, m.setElementaryStreamInfo = function(p, m, g, _, x, w) {
							w === void 0 && (w = !1);
							var D = this.elementaryStreams, O = D[p];
							O ? (O.startPTS = Math.min(O.startPTS, m), O.endPTS = Math.max(O.endPTS, g), O.startDTS = Math.min(O.startDTS, _), O.endDTS = Math.max(O.endDTS, x)) : D[p] = {
								startPTS: m,
								endPTS: g,
								startDTS: _,
								endDTS: x,
								partial: w
							};
						}, m.clearElementaryStreamInfo = function() {
							var p = this.elementaryStreams;
							p[je] = null, p[Ie] = null, p[Be] = null;
						}, s(t, [
							{
								key: "decryptdata",
								get: function() {
									if (!this.levelkeys && !this._decryptdata) return null;
									if (!this._decryptdata && this.levelkeys && !this.levelkeys.NONE) {
										var p = this.levelkeys.identity;
										if (p) this._decryptdata = p.getDecryptData(this.sn);
										else {
											var m = Object.keys(this.levelkeys);
											if (m.length === 1) return this._decryptdata = this.levelkeys[m[0]].getDecryptData(this.sn);
										}
									}
									return this._decryptdata;
								}
							},
							{
								key: "end",
								get: function() {
									return this.start + this.duration;
								}
							},
							{
								key: "endProgramDateTime",
								get: function() {
									if (this.programDateTime === null || !_(this.programDateTime)) return null;
									var p = _(this.duration) ? this.duration : 0;
									return this.programDateTime + 1e3 * p;
								}
							},
							{
								key: "encrypted",
								get: function() {
									var p;
									if ((p = this._decryptdata) != null && p.encrypted) return !0;
									if (this.levelkeys) {
										var m = Object.keys(this.levelkeys), g = m.length;
										if (g > 1 || g === 1 && this.levelkeys[m[0]].encrypted) return !0;
									}
									return !1;
								}
							}
						]), t;
					}(Ve), We = function(p) {
						function t(m, g, _, x, w) {
							var D;
							(D = p.call(this, _) || this).fragOffset = 0, D.duration = 0, D.gap = !1, D.independent = !1, D.relurl = void 0, D.fragment = void 0, D.index = void 0, D.stats = new P(), D.duration = m.decimalFloatingPoint("DURATION"), D.gap = m.bool("GAP"), D.independent = m.bool("INDEPENDENT"), D.relurl = m.enumeratedString("URI"), D.fragment = g, D.index = x;
							var O = m.enumeratedString("BYTERANGE");
							return O && D.setByteRange(O, w), w && (D.fragOffset = w.fragOffset + w.duration), D;
						}
						return l(t, p), s(t, [
							{
								key: "start",
								get: function() {
									return this.fragment.start + this.fragOffset;
								}
							},
							{
								key: "end",
								get: function() {
									return this.start + this.duration;
								}
							},
							{
								key: "loaded",
								get: function() {
									var p = this.elementaryStreams;
									return !!(p.audio || p.video || p.audiovideo);
								}
							}
						]), t;
					}(Ve), Ke = function() {
						function e(p) {
							this.PTSKnown = !1, this.alignedSliding = !1, this.averagetargetduration = void 0, this.endCC = 0, this.endSN = 0, this.fragments = void 0, this.fragmentHint = void 0, this.partList = null, this.dateRanges = void 0, this.live = !0, this.ageHeader = 0, this.advancedDateTime = void 0, this.updated = !0, this.advanced = !0, this.availabilityDelay = void 0, this.misses = 0, this.startCC = 0, this.startSN = 0, this.startTimeOffset = null, this.targetduration = 0, this.totalduration = 0, this.type = null, this.url = void 0, this.m3u8 = "", this.version = null, this.canBlockReload = !1, this.canSkipUntil = 0, this.canSkipDateRanges = !1, this.skippedSegments = 0, this.recentlyRemovedDateranges = void 0, this.partHoldBack = 0, this.holdBack = 0, this.partTarget = 0, this.preloadHint = void 0, this.renditionReports = void 0, this.tuneInGoal = 0, this.deltaUpdateFailed = void 0, this.driftStartTime = 0, this.driftEndTime = 0, this.driftStart = 0, this.driftEnd = 0, this.encryptedFragments = void 0, this.playlistParsingError = null, this.variableList = null, this.hasVariableRefs = !1, this.fragments = [], this.encryptedFragments = [], this.dateRanges = {}, this.url = p;
						}
						return e.prototype.reloaded = function(p) {
							if (!p) return this.advanced = !0, void (this.updated = !0);
							var m = this.lastPartSn - p.lastPartSn, g = this.lastPartIndex - p.lastPartIndex;
							this.updated = this.endSN !== p.endSN || !!g || !!m || !this.live, this.advanced = this.endSN > p.endSN || m > 0 || m === 0 && g > 0, this.updated || this.advanced ? this.misses = Math.floor(.6 * p.misses) : this.misses = p.misses + 1, this.availabilityDelay = p.availabilityDelay;
						}, s(e, [
							{
								key: "hasProgramDateTime",
								get: function() {
									return !!this.fragments.length && _(this.fragments[this.fragments.length - 1].programDateTime);
								}
							},
							{
								key: "levelTargetDuration",
								get: function() {
									return this.averagetargetduration || this.targetduration || 10;
								}
							},
							{
								key: "drift",
								get: function() {
									var p = this.driftEndTime - this.driftStartTime;
									return p > 0 ? 1e3 * (this.driftEnd - this.driftStart) / p : 1;
								}
							},
							{
								key: "edge",
								get: function() {
									return this.partEnd || this.fragmentEnd;
								}
							},
							{
								key: "partEnd",
								get: function() {
									var p;
									return (p = this.partList) != null && p.length ? this.partList[this.partList.length - 1].end : this.fragmentEnd;
								}
							},
							{
								key: "fragmentEnd",
								get: function() {
									var p;
									return (p = this.fragments) != null && p.length ? this.fragments[this.fragments.length - 1].end : 0;
								}
							},
							{
								key: "age",
								get: function() {
									return this.advancedDateTime ? Math.max(Date.now() - this.advancedDateTime, 0) / 1e3 : 0;
								}
							},
							{
								key: "lastPartIndex",
								get: function() {
									var p;
									return (p = this.partList) != null && p.length ? this.partList[this.partList.length - 1].index : -1;
								}
							},
							{
								key: "lastPartSn",
								get: function() {
									var p;
									return (p = this.partList) != null && p.length ? this.partList[this.partList.length - 1].fragment.sn : this.endSN;
								}
							}
						]), e;
					}(), qe = c(void 0);
					function V(p, m, g) {
						return Uint8Array.prototype.slice ? p.slice(m, g) : new Uint8Array(Array.prototype.slice.call(p, m, g));
					}
					var Ye, W = function(p, m) {
						return m + 10 <= p.length && p[m] === 73 && p[m + 1] === 68 && p[m + 2] === 51 && p[m + 3] < 255 && p[m + 4] < 255 && p[m + 6] < 128 && p[m + 7] < 128 && p[m + 8] < 128 && p[m + 9] < 128;
					}, j = function(p, m) {
						return m + 10 <= p.length && p[m] === 51 && p[m + 1] === 68 && p[m + 2] === 73 && p[m + 3] < 255 && p[m + 4] < 255 && p[m + 6] < 128 && p[m + 7] < 128 && p[m + 8] < 128 && p[m + 9] < 128;
					}, Y = function(p, m) {
						for (var g = m, _ = 0; W(p, m);) _ += 10, _ += q(p, m + 6), j(p, m + 10) && (_ += 10), m += _;
						if (_ > 0) return p.subarray(g, g + _);
					}, q = function(p, m) {
						var g = 0;
						return g = (127 & p[m]) << 21, g |= (127 & p[m + 1]) << 14, g |= (127 & p[m + 2]) << 7, g |= 127 & p[m + 3];
					}, z = function(p, m) {
						return W(p, m) && q(p, m + 6) + 10 <= p.length - m;
					}, X = function(p) {
						for (var m = $(p), g = 0; g < m.length; g++) {
							var _ = m[g];
							if (Q(_)) return ie(_);
						}
					}, Q = function(p) {
						return p && p.key === "PRIV" && p.info === "com.apple.streaming.transportStreamTimestamp";
					}, J = function(p) {
						var m = String.fromCharCode(p[0], p[1], p[2], p[3]), g = q(p, 4);
						return {
							type: m,
							size: g,
							data: p.subarray(10, 10 + g)
						};
					}, $ = function(p) {
						for (var m = 0, g = []; W(p, m);) {
							for (var _ = q(p, m + 6), x = (m += 10) + _; m + 8 < x;) {
								var w = J(p.subarray(m)), D = Z(w);
								D && g.push(D), m += w.size + 10;
							}
							j(p, m) && (m += 10);
						}
						return g;
					}, Z = function(p) {
						return p.type === "PRIV" ? ee(p) : p.type[0] === "W" ? re(p) : te(p);
					}, ee = function(p) {
						if (!(p.size < 2)) {
							var m = ae(p.data, !0), g = new Uint8Array(p.data.subarray(m.length + 1));
							return {
								key: p.type,
								info: m,
								data: g.buffer
							};
						}
					}, te = function(p) {
						if (!(p.size < 2)) {
							if (p.type === "TXXX") {
								var m = 1, g = ae(p.data.subarray(m), !0);
								m += g.length + 1;
								var _ = ae(p.data.subarray(m));
								return {
									key: p.type,
									info: g,
									data: _
								};
							}
							var x = ae(p.data.subarray(1));
							return {
								key: p.type,
								data: x
							};
						}
					}, re = function(p) {
						if (p.type === "WXXX") {
							if (p.size < 2) return;
							var m = 1, g = ae(p.data.subarray(m), !0);
							m += g.length + 1;
							var _ = ae(p.data.subarray(m));
							return {
								key: p.type,
								info: g,
								data: _
							};
						}
						var x = ae(p.data);
						return {
							key: p.type,
							data: x
						};
					}, ie = function(p) {
						if (p.data.byteLength === 8) {
							var m = new Uint8Array(p.data), g = 1 & m[3], _ = (m[4] << 23) + (m[5] << 15) + (m[6] << 7) + m[7];
							return _ /= 45, g && (_ += 47721858.84), Math.round(_);
						}
					}, ae = function(p, m) {
						m === void 0 && (m = !1);
						var g = ne();
						if (g) {
							var _ = g.decode(p);
							if (m) {
								var x = _.indexOf("\0");
								return x === -1 ? _ : _.substring(0, x);
							}
							return _.replace(/\0/g, "");
						}
						for (var w, D, O, A = p.length, F = "", U = 0; U < A;) {
							if ((w = p[U++]) === 0 && m) return F;
							if (w !== 0 && w !== 3) switch (w >> 4) {
								case 0:
								case 1:
								case 2:
								case 3:
								case 4:
								case 5:
								case 6:
								case 7:
									F += String.fromCharCode(w);
									break;
								case 12:
								case 13:
									D = p[U++], F += String.fromCharCode((31 & w) << 6 | 63 & D);
									break;
								case 14: D = p[U++], O = p[U++], F += String.fromCharCode((15 & w) << 12 | (63 & D) << 6 | (63 & O) << 0);
							}
						}
						return F;
					};
					function ne() {
						if (!navigator.userAgent.includes("PlayStation 4")) return Ye || self.TextDecoder === void 0 || (Ye = new self.TextDecoder("utf-8")), Ye;
					}
					var se = function(p) {
						for (var m = "", g = 0; g < p.length; g++) {
							var _ = p[g].toString(16);
							_.length < 2 && (_ = "0" + _), m += _;
						}
						return m;
					}, tt = 2 ** 32 - 1, nt = [].push, rt = {
						video: 1,
						audio: 2,
						id3: 3,
						text: 4
					};
					function de(p) {
						return String.fromCharCode.apply(null, p);
					}
					function he(p, m) {
						var g = p[m] << 8 | p[m + 1];
						return g < 0 ? 65536 + g : g;
					}
					function fe(p, m) {
						var g = ve(p, m);
						return g < 0 ? 4294967296 + g : g;
					}
					function ce(p, m) {
						var g = fe(p, m);
						return g *= 2 ** 32, g += fe(p, m + 4);
					}
					function ve(p, m) {
						return p[m] << 24 | p[m + 1] << 16 | p[m + 2] << 8 | p[m + 3];
					}
					function ge(p, m, g) {
						p[m] = g >> 24, p[m + 1] = g >> 16 & 255, p[m + 2] = g >> 8 & 255, p[m + 3] = 255 & g;
					}
					function me(p, m) {
						var g = [];
						if (!m.length) return g;
						for (var _ = p.byteLength, x = 0; x < _;) {
							var w = fe(p, x), D = w > 1 ? x + w : _;
							if (de(p.subarray(x + 4, x + 8)) === m[0]) if (m.length === 1) g.push(p.subarray(x + 8, D));
							else {
								var O = me(p.subarray(x + 8, D), m.slice(1));
								O.length && nt.apply(g, O);
							}
							x = D;
						}
						return g;
					}
					function pe(p) {
						var m = [], g = p[0], _ = 8, x = fe(p, _);
						_ += 4;
						var w = 0, D = 0;
						g === 0 ? (w = fe(p, _), D = fe(p, _ + 4), _ += 8) : (w = ce(p, _), D = ce(p, _ + 8), _ += 16), _ += 2;
						var O = p.length + D, A = he(p, _);
						_ += 2;
						for (var F = 0; F < A; F++) {
							var U = _, oe = fe(p, U);
							U += 4;
							var le = 2147483647 & oe;
							if ((2147483648 & oe) >>> 31 == 1) return K.warn("SIDX has hierarchical references (not supported)"), null;
							var ue = fe(p, U);
							U += 4, m.push({
								referenceSize: le,
								subsegmentDuration: ue,
								info: {
									duration: ue / x,
									start: O,
									end: O + le - 1
								}
							}), O += le, _ = U += 4;
						}
						return {
							earliestPresentationTime: w,
							timescale: x,
							version: g,
							referencesCount: A,
							references: m
						};
					}
					function ye(p) {
						for (var m = [], g = me(p, ["moov", "trak"]), _ = 0; _ < g.length; _++) {
							var x = g[_], w = me(x, ["tkhd"])[0];
							if (w) {
								var D = w[0], O = fe(w, D === 0 ? 12 : 20), A = me(x, ["mdia", "mdhd"])[0];
								if (A) {
									var F = fe(A, (D = A[0]) === 0 ? 12 : 20), U = me(x, ["mdia", "hdlr"])[0];
									if (U) {
										var K = de(U.subarray(8, 12)), oe = {
											soun: je,
											vide: Ie
										}[K];
										if (oe) {
											var le = Ee(me(x, [
												"mdia",
												"minf",
												"stbl",
												"stsd"
											])[0]);
											m[O] = {
												timescale: F,
												type: oe
											}, m[oe] = i({
												timescale: F,
												id: O
											}, le);
										}
									}
								}
							}
						}
						return me(p, [
							"moov",
							"mvex",
							"trex"
						]).forEach(function(p) {
							var g = fe(p, 4), _ = m[g];
							_ && (_.default = {
								duration: fe(p, 12),
								flags: fe(p, 20)
							});
						}), m;
					}
					function Ee(p) {
						var m = p.subarray(8), g = m.subarray(86), _ = de(m.subarray(4, 8)), x = _, w = _ === "enca" || _ === "encv";
						if (w) {
							var D = me(m, [_])[0];
							me(D.subarray(_ === "enca" ? 28 : 78), ["sinf"]).forEach(function(p) {
								var m = me(p, ["schm"])[0];
								if (m) {
									var g = de(m.subarray(4, 8));
									if (g === "cbcs" || g === "cenc") {
										var _ = me(p, ["frma"])[0];
										_ && (x = de(_));
									}
								}
							});
						}
						switch (x) {
							case "avc1":
							case "avc2":
							case "avc3":
							case "avc4":
								var O = me(g, ["avcC"])[0];
								x += "." + Se(O[1]) + Se(O[2]) + Se(O[3]);
								break;
							case "mp4a":
								var A = me(m, [_])[0], F = me(A.subarray(28), ["esds"])[0];
								if (F && F.length > 12) {
									var U = 4;
									if (F[U++] !== 3) break;
									U = Te(F, U), U += 2;
									var K = F[U++];
									if (128 & K && (U += 2), 64 & K && (U += F[U++]), F[U++] !== 4) break;
									U = Te(F, U);
									var oe = F[U++];
									if (oe !== 64 || (x += "." + Se(oe), U += 12, F[U++] !== 5)) break;
									U = Te(F, U);
									var le = F[U++], ue = (248 & le) >> 3;
									ue === 31 && (ue += 1 + ((7 & le) << 3) + ((224 & F[U]) >> 5)), x += "." + ue;
								}
								break;
							case "hvc1":
							case "hev1":
								var we = me(g, ["hvcC"])[0], je = we[1], Ie = [
									"",
									"A",
									"B",
									"C"
								][je >> 6], Be = 31 & je, Ve = fe(we, 2), Ue = (32 & je) >> 5 ? "H" : "L", We = we[12], Ke = we.subarray(6, 12);
								x += "." + Ie + Be, x += "." + Ve.toString(16).toUpperCase(), x += "." + Ue + We;
								for (var qe = "", Ye = Ke.length; Ye--;) {
									var tt = Ke[Ye];
									(tt || qe) && (qe = "." + tt.toString(16).toUpperCase() + qe);
								}
								x += qe;
								break;
							case "dvh1":
							case "dvhe":
								var nt = me(g, ["dvcC"])[0], rt = nt[2] >> 1 & 127, it = nt[2] << 5 & 32 | nt[3] >> 3 & 31;
								x += "." + Le(rt) + "." + Le(it);
								break;
							case "vp09":
								var at = me(g, ["vpcC"])[0], ot = at[4], st = at[5], ct = at[6] >> 4 & 15;
								x += "." + Le(ot) + "." + Le(st) + "." + Le(ct);
								break;
							case "av01":
								var dt = me(g, ["av1C"])[0], gt = dt[1] >>> 5, _t = 31 & dt[1], vt = dt[2] >>> 7 ? "H" : "M", bt = (64 & dt[2]) >> 6, xt = (32 & dt[2]) >> 5, St = gt === 2 && bt ? xt ? 12 : 10 : bt ? 10 : 8, Tt = (16 & dt[2]) >> 4, kt = (8 & dt[2]) >> 3, At = (4 & dt[2]) >> 2, Lt = 3 & dt[2];
								x += "." + gt + "." + Le(_t) + vt + "." + Le(St) + "." + Tt + "." + kt + At + Lt + "." + Le(1) + "." + Le(1) + "." + Le(1) + ".0";
						}
						return {
							codec: x,
							encrypted: w
						};
					}
					function Te(p, m) {
						for (var g = m + 5; 128 & p[m++] && m < g;);
						return m;
					}
					function Se(p) {
						return ("0" + p.toString(16).toUpperCase()).slice(-2);
					}
					function Le(p) {
						return (p < 10 ? "0" : "") + p;
					}
					function Re(p, m) {
						if (!p || !m) return p;
						var g = m.keyId;
						return g && m.isCommonEncryption && me(p, ["moov", "trak"]).forEach(function(p) {
							var m = me(p, [
								"mdia",
								"minf",
								"stbl",
								"stsd"
							])[0].subarray(8), _ = me(m, ["enca"]), x = _.length > 0;
							x || (_ = me(m, ["encv"])), _.forEach(function(p) {
								me(x ? p.subarray(28) : p.subarray(78), ["sinf"]).forEach(function(p) {
									var m = function(p) {
										var m = me(p, ["schm"])[0];
										if (m) {
											var g = de(m.subarray(4, 8));
											if (g === "cbcs" || g === "cenc") return me(p, ["schi", "tenc"])[0];
										}
										return null;
									}(p);
									if (m) {
										var _ = m.subarray(8, 24);
										_.some(function(p) {
											return p !== 0;
										}) || (K.log("[eme] Patching keyId in 'enc" + (x ? "a" : "v") + ">sinf>>tenc' box: " + se(_) + " -> " + se(g)), m.set(g, 8));
									}
								});
							});
						}), p;
					}
					function Ae(p) {
						var m = fe(p, 0), g = 8;
						1 & m && (g += 4), 4 & m && (g += 4);
						for (var _ = 0, x = fe(p, 4), w = 0; w < x; w++) 256 & m && (_ += fe(p, g), g += 4), 512 & m && (g += 4), 1024 & m && (g += 4), 2048 & m && (g += 4);
						return _;
					}
					function be(p, m) {
						var g = new Uint8Array(p.length + m.length);
						return g.set(p), g.set(m, p.length), g;
					}
					function ke(p, m) {
						var g = [], _ = m.samples, x = m.timescale, w = m.id, D = !1;
						return me(_, ["moof"]).map(function(O) {
							var A = O.byteOffset - 8;
							me(O, ["traf"]).map(function(O) {
								var F = me(O, ["tfdt"]).map(function(p) {
									var m = p[0], g = fe(p, 4);
									return m === 1 && (g *= 2 ** 32, g += fe(p, 8)), g / x;
								})[0];
								return F !== void 0 && (p = F), me(O, ["tfhd"]).map(function(F) {
									var U = fe(F, 4), K = 16777215 & fe(F, 0), oe = 0, le = (16 & K) != 0, ue = 0, we = (32 & K) != 0, je = 8;
									U === w && (1 & K && (je += 8), 2 & K && (je += 4), 8 & K && (oe = fe(F, je), je += 4), le && (ue = fe(F, je), je += 4), we && (je += 4), m.type === "video" && (D = function(p) {
										if (!p) return !1;
										var m = p.indexOf("."), g = m < 0 ? p : p.substring(0, m);
										return g === "hvc1" || g === "hev1" || g === "dvh1" || g === "dvhe";
									}(m.codec)), me(O, ["trun"]).map(function(w) {
										var O = w[0], F = 16777215 & fe(w, 0), U = (1 & F) != 0, K = 0, le = (4 & F) != 0, we = (256 & F) != 0, je = 0, Be = (512 & F) != 0, Ve = 0, Ue = (1024 & F) != 0, We = (2048 & F) != 0, Ke = 0, qe = fe(w, 4), Ye = 8;
										U && (K = fe(w, Ye), Ye += 4), le && (Ye += 4);
										for (var tt = K + A, nt = 0; nt < qe; nt++) {
											if (we ? (je = fe(w, Ye), Ye += 4) : je = oe, Be ? (Ve = fe(w, Ye), Ye += 4) : Ve = ue, Ue && (Ye += 4), We && (Ke = O === 0 ? fe(w, Ye) : ve(w, Ye), Ye += 4), m.type === Ie) for (var rt = 0; rt < Ve;) {
												var it = fe(_, tt);
												De(D, _[tt += 4]) && _e(_.subarray(tt, tt + it), D ? 2 : 1, p + Ke / x, g), tt += it, rt += it + 4;
											}
											p += je / x;
										}
									}));
								});
							});
						}), g;
					}
					function De(p, m) {
						if (p) {
							var g = m >> 1 & 63;
							return g === 39 || g === 40;
						}
						return (31 & m) == 6;
					}
					function _e(p, m, g, _) {
						var x = xe(p), w = 0;
						w += m;
						for (var D = 0, O = 0, A = 0; w < x.length;) {
							D = 0;
							do {
								if (w >= x.length) break;
								D += A = x[w++];
							} while (A === 255);
							O = 0;
							do {
								if (w >= x.length) break;
								O += A = x[w++];
							} while (A === 255);
							var F = x.length - w, U = w;
							if (O < F) w += O;
							else if (O > F) {
								K.error("Malformed SEI payload. " + O + " is too small, only " + F + " bytes left to parse.");
								break;
							}
							if (D === 4) {
								if (x[U++] === 181) {
									var oe = he(x, U);
									if (U += 2, oe === 49) {
										var le = fe(x, U);
										if (U += 4, le === 1195456820) {
											var ue = x[U++];
											if (ue === 3) {
												var we = x[U++], je = 64 & we, Ie = je ? 2 + 3 * (31 & we) : 0, Be = new Uint8Array(Ie);
												if (je) {
													Be[0] = we;
													for (var Ve = 1; Ve < Ie; Ve++) Be[Ve] = x[U++];
												}
												_.push({
													type: ue,
													payloadType: D,
													pts: g,
													bytes: Be
												});
											}
										}
									}
								}
							} else if (D === 5 && O > 16) {
								for (var Ue = [], We = 0; We < 16; We++) {
									var Ke = x[U++].toString(16);
									Ue.push(Ke.length == 1 ? "0" + Ke : Ke), We !== 3 && We !== 5 && We !== 7 && We !== 9 || Ue.push("-");
								}
								for (var qe = O - 16, Ye = new Uint8Array(qe), tt = 0; tt < qe; tt++) Ye[tt] = x[U++];
								_.push({
									payloadType: D,
									pts: g,
									uuid: Ue.join(""),
									userData: ae(Ye),
									userDataBytes: Ye
								});
							}
						}
					}
					function xe(p) {
						for (var m = p.byteLength, g = [], _ = 1; _ < m - 2;) p[_] === 0 && p[_ + 1] === 0 && p[_ + 2] === 3 ? (g.push(_ + 2), _ += 2) : _++;
						if (g.length === 0) return p;
						var x = m - g.length, w = new Uint8Array(x), D = 0;
						for (_ = 0; _ < x; D++, _++) D === g[0] && (D++, g.shift()), w[_] = p[D];
						return w;
					}
					var it = function() {
						function e(p, m, g, _, x) {
							_ === void 0 && (_ = [1]), x === void 0 && (x = null), this.uri = void 0, this.method = void 0, this.keyFormat = void 0, this.keyFormatVersions = void 0, this.encrypted = void 0, this.isCommonEncryption = void 0, this.iv = null, this.key = null, this.keyId = null, this.pssh = null, this.method = p, this.uri = m, this.keyFormat = g, this.keyFormatVersions = _, this.iv = x, this.encrypted = !!p && p !== "NONE", this.isCommonEncryption = this.encrypted && p !== "AES-128";
						}
						e.clearKeyUriToKeyIdMap = function() {};
						var p = e.prototype;
						return p.isSupported = function() {
							if (this.method) {
								if (this.method === "AES-128" || this.method === "NONE") return !0;
								if (this.keyFormat === "identity") return this.method === "SAMPLE-AES";
							}
							return !1;
						}, p.getDecryptData = function(p) {
							if (!this.encrypted || !this.uri) return null;
							if (this.method === "AES-128" && this.uri && !this.iv) {
								typeof p != "number" && (this.method !== "AES-128" || this.iv || K.warn("missing IV for initialization segment with method=\"" + this.method + "\" - compliance issue"), p = 0);
								var m = function(p) {
									for (var m = new Uint8Array(16), g = 12; g < 16; g++) m[g] = p >> 8 * (15 - g) & 255;
									return m;
								}(p);
								return new e(this.method, this.uri, "identity", this.keyFormatVersions, m);
							}
							return this;
						}, e;
					}();
					function Ce(p) {
						if (p === void 0 && (p = !0), typeof self < "u") return (p || !self.MediaSource) && self.ManagedMediaSource || self.MediaSource || self.WebKitMediaSource;
					}
					var at = {
						audio: {
							a3ds: 1,
							"ac-3": .95,
							"ac-4": 1,
							alac: .9,
							alaw: 1,
							dra1: 1,
							"dts+": 1,
							"dts-": 1,
							dtsc: 1,
							dtse: 1,
							dtsh: 1,
							"ec-3": .9,
							enca: 1,
							fLaC: .9,
							flac: .9,
							FLAC: .9,
							g719: 1,
							g726: 1,
							m4ae: 1,
							mha1: 1,
							mha2: 1,
							mhm1: 1,
							mhm2: 1,
							mlpa: 1,
							mp4a: 1,
							"raw ": 1,
							Opus: 1,
							opus: 1,
							samr: 1,
							sawb: 1,
							sawp: 1,
							sevc: 1,
							sqcp: 1,
							ssmv: 1,
							twos: 1,
							ulaw: 1
						},
						video: {
							avc1: 1,
							avc2: 1,
							avc3: 1,
							avc4: 1,
							avcp: 1,
							av01: .8,
							drac: 1,
							dva1: 1,
							dvav: 1,
							dvh1: .7,
							dvhe: .7,
							encv: 1,
							hev1: .75,
							hvc1: .75,
							mjp2: 1,
							mp4v: 1,
							mvc1: 1,
							mvc2: 1,
							mvc3: 1,
							mvc4: 1,
							resv: 1,
							rv60: 1,
							s263: 1,
							svc1: 1,
							svc2: 1,
							"vc-1": 1,
							vp08: 1,
							vp09: .9
						},
						text: {
							stpp: 1,
							wvtt: 1
						}
					};
					function Pe(p, m, g) {
						return g === void 0 && (g = !0), !p.split(",").some(function(p) {
							return !Fe(p, m, g);
						});
					}
					function Fe(p, m, g) {
						var _;
						g === void 0 && (g = !0);
						var x = Ce(g);
						return (_ = x?.isTypeSupported(Oe(p, m))) != null && _;
					}
					function Oe(p, m) {
						return m + "/mp4;codecs=\"" + p + "\"";
					}
					function Me(p) {
						if (p) {
							var m = p.substring(0, 4);
							return at.video[m];
						}
						return 2;
					}
					function Ne(p) {
						return p.split(",").reduce(function(p, m) {
							var g = at.video[m];
							return g ? (2 * g + p) / (p ? 3 : 2) : (at.audio[m] + p) / (p ? 2 : 1);
						}, 0);
					}
					var ot = {}, st = /flac|opus/i;
					function Ge(p, m) {
						return m === void 0 && (m = !0), p.replace(st, function(p) {
							return function(p, m) {
								if (m === void 0 && (m = !0), ot[p]) return ot[p];
								for (var g = {
									flac: [
										"flac",
										"fLaC",
										"FLAC"
									],
									opus: ["opus", "Opus"]
								}[p], _ = 0; _ < g.length; _++) if (Fe(g[_], "audio", m)) return ot[p] = g[_], g[_];
								return p;
							}(p.toLowerCase(), m);
						});
					}
					function He(p, m) {
						return p && p !== "mp4a" ? p : m && m.split(",")[0];
					}
					var ct = /#EXT-X-STREAM-INF:([^\r\n]*)(?:[\r\n](?:#[^\r\n]*)?)*([^\r\n]+)|#EXT-X-(SESSION-DATA|SESSION-KEY|DEFINE|CONTENT-STEERING|START):([^\r\n]*)[\r\n]+/g, dt = /#EXT-X-MEDIA:(.*)/g, gt = /^#EXT(?:INF|-X-TARGETDURATION):/m, _t = new RegExp([
						/#EXTINF:\s*(\d*(?:\.\d+)?)(?:,(.*)\s+)?/.source,
						/(?!#) *(\S[^\r\n]*)/.source,
						/#EXT-X-BYTERANGE:*(.+)/.source,
						/#EXT-X-PROGRAM-DATE-TIME:(.+)/.source,
						/#.*/.source
					].join("|"), "g"), vt = new RegExp([
						/#(EXTM3U)/.source,
						/#EXT-X-(DATERANGE|DEFINE|KEY|MAP|PART|PART-INF|PLAYLIST-TYPE|PRELOAD-HINT|RENDITION-REPORT|SERVER-CONTROL|SKIP|START):(.+)/.source,
						/#EXT-X-(BITRATE|DISCONTINUITY-SEQUENCE|MEDIA-SEQUENCE|TARGETDURATION|VERSION): *(\d+)/.source,
						/#EXT-X-(DISCONTINUITY|ENDLIST|GAP|INDEPENDENT-SEGMENTS)/.source,
						/(#)([^:]*):(.*)/.source,
						/(#)(.*)(?:.*)\r?\n?/.source
					].join("|")), bt = function() {
						function e() {}
						return e.findGroup = function(p, m) {
							for (var g = 0; g < p.length; g++) {
								var _ = p[g];
								if (_.id === m) return _;
							}
						}, e.resolve = function(p, m) {
							return g.buildAbsoluteURL(m, p, { alwaysNormalize: !0 });
						}, e.isMediaPlaylist = function(p) {
							return gt.test(p);
						}, e.parseMasterPlaylist = function(p, m) {
							var g, _ = {
								contentSteering: null,
								levels: [],
								playlistParsingError: null,
								sessionData: null,
								sessionKeys: null,
								startTimeOffset: null,
								variableList: null,
								hasVariableRefs: !1
							}, x = [];
							for (ct.lastIndex = 0; (g = ct.exec(p)) != null;) if (g[1]) {
								var w, D = new ue(g[1]), O = g[2], A = {
									attrs: D,
									bitrate: D.decimalInteger("BANDWIDTH") || D.decimalInteger("AVERAGE-BANDWIDTH"),
									name: D.NAME,
									url: e.resolve(O, m)
								}, F = D.decimalResolution("RESOLUTION");
								F && (A.width = F.width, A.height = F.height), Qe(D.CODECS, A), (w = A.unknownCodecs) != null && w.length || x.push(A), _.levels.push(A);
							} else if (g[3]) {
								var U = g[3], oe = g[4];
								switch (U) {
									case "SESSION-DATA":
										var le = new ue(oe), we = le["DATA-ID"];
										we && (_.sessionData === null && (_.sessionData = {}), _.sessionData[we] = le);
										break;
									case "SESSION-KEY":
										var je = ze(oe, m);
										je.encrypted && je.isSupported() ? (_.sessionKeys === null && (_.sessionKeys = []), _.sessionKeys.push(je)) : K.warn("[Keys] Ignoring invalid EXT-X-SESSION-KEY tag: \"" + oe + "\"");
										break;
									case "DEFINE": break;
									case "CONTENT-STEERING":
										var Ie = new ue(oe);
										_.contentSteering = {
											uri: e.resolve(Ie["SERVER-URI"], m),
											pathwayId: Ie["PATHWAY-ID"] || "."
										};
										break;
									case "START": _.startTimeOffset = Xe(oe);
								}
							}
							var Be = x.length > 0 && x.length < _.levels.length;
							return _.levels = Be ? x : _.levels, _.levels.length === 0 && (_.playlistParsingError = Error("no levels found in manifest")), _;
						}, e.parseMasterPlaylistMedia = function(p, m, g) {
							var _, x = {}, w = g.levels, D = {
								AUDIO: w.map(function(p) {
									return {
										id: p.attrs.AUDIO,
										audioCodec: p.audioCodec
									};
								}),
								SUBTITLES: w.map(function(p) {
									return {
										id: p.attrs.SUBTITLES,
										textCodec: p.textCodec
									};
								}),
								"CLOSED-CAPTIONS": []
							}, O = 0;
							for (dt.lastIndex = 0; (_ = dt.exec(p)) !== null;) {
								var A = new ue(_[1]), F = A.TYPE;
								if (F) {
									var U = D[F], K = x[F] || [];
									x[F] = K;
									var oe = A.LANGUAGE, le = A["ASSOC-LANGUAGE"], we = A.CHANNELS, je = A.CHARACTERISTICS, Ie = A["INSTREAM-ID"], Be = {
										attrs: A,
										bitrate: 0,
										id: O++,
										groupId: A["GROUP-ID"] || "",
										name: A.NAME || oe || "",
										type: F,
										default: A.bool("DEFAULT"),
										autoselect: A.bool("AUTOSELECT"),
										forced: A.bool("FORCED"),
										lang: oe,
										url: A.URI ? e.resolve(A.URI, m) : ""
									};
									if (le && (Be.assocLang = le), we && (Be.channels = we), je && (Be.characteristics = je), Ie && (Be.instreamId = Ie), U != null && U.length) {
										var Ve = e.findGroup(U, Be.groupId) || U[0];
										Je(Be, Ve, "audioCodec"), Je(Be, Ve, "textCodec");
									}
									K.push(Be);
								}
							}
							return x;
						}, e.parseLevelPlaylist = function(p, m, g, x, w, D) {
							var O, A, F, U = new Ke(m), oe = U.fragments, le = null, je = 0, Ie = 0, Be = 0, Ve = 0, qe = null, Ye = new Ue(x, m), tt = -1, nt = !1, rt = null;
							for (_t.lastIndex = 0, U.m3u8 = p, U.hasVariableRefs = !1; (O = _t.exec(p)) !== null;) {
								nt && (nt = !1, (Ye = new Ue(x, m)).start = Be, Ye.sn = je, Ye.cc = Ve, Ye.level = g, le && (Ye.initSegment = le, Ye.rawProgramDateTime = le.rawProgramDateTime, le.rawProgramDateTime = null, rt && (Ye.setByteRange(rt), rt = null)));
								var it = O[1];
								if (it) {
									Ye.duration = parseFloat(it);
									var at = (" " + O[2]).slice(1);
									Ye.title = at || null, Ye.tagList.push(at ? [
										"INF",
										it,
										at
									] : ["INF", it]);
								} else if (O[3]) {
									if (_(Ye.duration)) {
										Ye.start = Be, F && et(Ye, F, U), Ye.sn = je, Ye.level = g, Ye.cc = Ve, oe.push(Ye);
										var ot = (" " + O[3]).slice(1);
										Ye.relurl = ot, $e(Ye, qe), qe = Ye, Be += Ye.duration, je++, Ie = 0, nt = !0;
									}
								} else if (O[4]) {
									var st = (" " + O[4]).slice(1);
									qe ? Ye.setByteRange(st, qe) : Ye.setByteRange(st);
								} else if (O[5]) Ye.rawProgramDateTime = (" " + O[5]).slice(1), Ye.tagList.push(["PROGRAM-DATE-TIME", Ye.rawProgramDateTime]), tt === -1 && (tt = oe.length);
								else {
									if (!(O = O[0].match(vt))) {
										K.warn("No matches on slow regex match for level playlist!");
										continue;
									}
									for (A = 1; A < O.length && O[A] === void 0; A++);
									var ct = (" " + O[A]).slice(1), dt = (" " + O[A + 1]).slice(1), gt = O[A + 2] ? (" " + O[A + 2]).slice(1) : "";
									switch (ct) {
										case "PLAYLIST-TYPE":
											U.type = dt.toUpperCase();
											break;
										case "MEDIA-SEQUENCE":
											je = U.startSN = parseInt(dt);
											break;
										case "SKIP":
											var bt = new ue(dt), xt = bt.decimalInteger("SKIPPED-SEGMENTS");
											if (_(xt)) {
												U.skippedSegments = xt;
												for (var St = xt; St--;) oe.unshift(null);
												je += xt;
											}
											var Tt = bt.enumeratedString("RECENTLY-REMOVED-DATERANGES");
											Tt && (U.recentlyRemovedDateranges = Tt.split("	"));
											break;
										case "TARGETDURATION":
											U.targetduration = Math.max(parseInt(dt), 1);
											break;
										case "VERSION":
											U.version = parseInt(dt);
											break;
										case "INDEPENDENT-SEGMENTS":
										case "EXTM3U":
										case "DEFINE": break;
										case "ENDLIST":
											U.live = !1;
											break;
										case "#":
											(dt || gt) && Ye.tagList.push(gt ? [dt, gt] : [dt]);
											break;
										case "DISCONTINUITY":
											Ve++, Ye.tagList.push(["DIS"]);
											break;
										case "GAP":
											Ye.gap = !0, Ye.tagList.push([ct]);
											break;
										case "BITRATE":
											Ye.tagList.push([ct, dt]);
											break;
										case "DATERANGE":
											var kt = new ue(dt), At = new we(kt, U.dateRanges[kt.ID]);
											At.isValid || U.skippedSegments ? U.dateRanges[At.id] = At : K.warn("Ignoring invalid DATERANGE tag: \"" + dt + "\""), Ye.tagList.push(["EXT-X-DATERANGE", dt]);
											break;
										case "DISCONTINUITY-SEQUENCE":
											Ve = parseInt(dt);
											break;
										case "KEY":
											var Lt = ze(dt, m);
											if (Lt.isSupported()) {
												if (Lt.method === "NONE") {
													F = void 0;
													break;
												}
												F ||= {}, F[Lt.keyFormat] && (F = o({}, F)), F[Lt.keyFormat] = Lt;
											} else K.warn("[Keys] Ignoring invalid EXT-X-KEY tag: \"" + dt + "\"");
											break;
										case "START":
											U.startTimeOffset = Xe(dt);
											break;
										case "MAP":
											var Rt = new ue(dt);
											if (Ye.duration) {
												var zt = new Ue(x, m);
												Ze(zt, Rt, g, F), le = zt, Ye.initSegment = le, le.rawProgramDateTime && !Ye.rawProgramDateTime && (Ye.rawProgramDateTime = le.rawProgramDateTime);
											} else {
												var qt = Ye.byteRangeEndOffset;
												if (qt) {
													var Jt = Ye.byteRangeStartOffset;
													rt = qt - Jt + "@" + Jt;
												} else rt = null;
												Ze(Ye, Rt, g, F), le = Ye, nt = !0;
											}
											break;
										case "SERVER-CONTROL":
											var Xt = new ue(dt);
											U.canBlockReload = Xt.bool("CAN-BLOCK-RELOAD"), U.canSkipUntil = Xt.optionalFloat("CAN-SKIP-UNTIL", 0), U.canSkipDateRanges = U.canSkipUntil > 0 && Xt.bool("CAN-SKIP-DATERANGES"), U.partHoldBack = Xt.optionalFloat("PART-HOLD-BACK", 0), U.holdBack = Xt.optionalFloat("HOLD-BACK", 0);
											break;
										case "PART-INF":
											var Zt = new ue(dt);
											U.partTarget = Zt.decimalFloatingPoint("PART-TARGET");
											break;
										case "PART":
											var Qt = U.partList;
											Qt ||= U.partList = [];
											var $t = Ie > 0 ? Qt[Qt.length - 1] : void 0, en = Ie++, tn = new ue(dt), nn = new We(tn, Ye, m, en, $t);
											Qt.push(nn), Ye.duration += nn.duration;
											break;
										case "PRELOAD-HINT":
											var rn = new ue(dt);
											U.preloadHint = rn;
											break;
										case "RENDITION-REPORT":
											var an = new ue(dt);
											U.renditionReports = U.renditionReports || [], U.renditionReports.push(an);
											break;
										default: K.warn("line parsed but not handled: " + O);
									}
								}
							}
							qe && !qe.relurl ? (oe.pop(), Be -= qe.duration, U.partList && (U.fragmentHint = qe)) : U.partList && ($e(Ye, qe), Ye.cc = Ve, U.fragmentHint = Ye, F && et(Ye, F, U));
							var on = oe.length, sn = oe[0], cn = oe[on - 1];
							if ((Be += U.skippedSegments * U.targetduration) > 0 && on && cn) {
								U.averagetargetduration = Be / on;
								var ln = cn.sn;
								U.endSN = ln === "initSegment" ? 0 : ln, U.live || (cn.endList = !0), sn && (U.startCC = sn.cc);
							} else U.endSN = 0, U.startCC = 0;
							return U.fragmentHint && (Be += U.fragmentHint.duration), U.totalduration = Be, U.endCC = Ve, tt > 0 && function(p, m) {
								for (var g = p[m], _ = m; _--;) {
									var x = p[_];
									if (!x) return;
									x.programDateTime = g.programDateTime - 1e3 * x.duration, g = x;
								}
							}(oe, tt), U;
						}, e;
					}();
					function ze(p, m, g) {
						var _, x, w = new ue(p), D = (_ = w.METHOD) ?? "", O = w.URI, A = w.hexadecimalInteger("IV"), F = w.KEYFORMATVERSIONS, U = (x = w.KEYFORMAT) ?? "identity";
						O && w.IV && !A && K.error("Invalid IV: " + w.IV);
						var oe = O ? bt.resolve(O, m) : "", le = (F || "1").split("/").map(Number).filter(Number.isFinite);
						return new it(D, oe, U, le, A);
					}
					function Xe(p) {
						var m = new ue(p).decimalFloatingPoint("TIME-OFFSET");
						return _(m) ? m : null;
					}
					function Qe(p, m) {
						var g = (p || "").split(/[ ,]+/).filter(function(p) {
							return p;
						});
						[
							"video",
							"audio",
							"text"
						].forEach(function(p) {
							var _ = g.filter(function(m) {
								return function(p, m) {
									var g = at[m];
									return !!g && !!g[p.slice(0, 4)];
								}(m, p);
							});
							_.length && (m[p + "Codec"] = _.join(","), g = g.filter(function(p) {
								return _.indexOf(p) === -1;
							}));
						}), m.unknownCodecs = g;
					}
					function Je(p, m, g) {
						var _ = m[g];
						_ && (p[g] = _);
					}
					function $e(p, m) {
						p.rawProgramDateTime ? p.programDateTime = Date.parse(p.rawProgramDateTime) : m != null && m.programDateTime && (p.programDateTime = m.endProgramDateTime), _(p.programDateTime) || (p.programDateTime = null, p.rawProgramDateTime = null);
					}
					function Ze(p, m, g, _) {
						p.relurl = m.URI, m.BYTERANGE && p.setByteRange(m.BYTERANGE), p.level = g, p.sn = "initSegment", _ && (p.levelkeys = _), p.initSegment = null;
					}
					function et(p, m, g) {
						p.levelkeys = m;
						var _ = g.encryptedFragments;
						_.length && _[_.length - 1].levelkeys === m || !Object.keys(m).some(function(p) {
							return m[p].isCommonEncryption;
						}) || _.push(p);
					}
					var xt = "manifest", St = "level", Tt = "audioTrack", kt = "subtitleTrack", At = "main", Lt = "audio", Rt = "subtitle";
					function lt(p) {
						switch (p.type) {
							case Tt: return Lt;
							case kt: return Rt;
							default: return At;
						}
					}
					function ut(p, m) {
						var g = p.url;
						return g !== void 0 && g.indexOf("data:") !== 0 || (g = m.url), g;
					}
					var zt = function() {
						function e(p) {
							this.hls = void 0, this.loaders = Object.create(null), this.variableList = null, this.hls = p, this.registerListeners();
						}
						var p = e.prototype;
						return p.startLoad = function(p) {}, p.stopLoad = function() {
							this.destroyInternalLoaders();
						}, p.registerListeners = function() {
							var p = this.hls;
							p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.LEVEL_LOADING, this.onLevelLoading, this), p.on(D.AUDIO_TRACK_LOADING, this.onAudioTrackLoading, this), p.on(D.SUBTITLE_TRACK_LOADING, this.onSubtitleTrackLoading, this);
						}, p.unregisterListeners = function() {
							var p = this.hls;
							p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.LEVEL_LOADING, this.onLevelLoading, this), p.off(D.AUDIO_TRACK_LOADING, this.onAudioTrackLoading, this), p.off(D.SUBTITLE_TRACK_LOADING, this.onSubtitleTrackLoading, this);
						}, p.createInternalLoader = function(p) {
							var m = this.hls.config, g = m.pLoader, _ = m.loader, x = new (g || _)(m);
							return this.loaders[p.type] = x, x;
						}, p.getInternalLoader = function(p) {
							return this.loaders[p.type];
						}, p.resetInternalLoader = function(p) {
							this.loaders[p] && delete this.loaders[p];
						}, p.destroyInternalLoaders = function() {
							for (var p in this.loaders) {
								var m = this.loaders[p];
								m && m.destroy(), this.resetInternalLoader(p);
							}
						}, p.destroy = function() {
							this.variableList = null, this.unregisterListeners(), this.destroyInternalLoaders();
						}, p.onManifestLoading = function(p, m) {
							var g = m.url;
							this.variableList = null, this.load({
								id: null,
								level: 0,
								responseType: "text",
								type: xt,
								url: g,
								deliveryDirectives: null
							});
						}, p.onLevelLoading = function(p, m) {
							var g = m.id, _ = m.level, x = m.pathwayId, w = m.url, D = m.deliveryDirectives;
							this.load({
								id: g,
								level: _,
								pathwayId: x,
								responseType: "text",
								type: St,
								url: w,
								deliveryDirectives: D
							});
						}, p.onAudioTrackLoading = function(p, m) {
							var g = m.id, _ = m.groupId, x = m.url, w = m.deliveryDirectives;
							this.load({
								id: g,
								groupId: _,
								level: null,
								responseType: "text",
								type: Tt,
								url: x,
								deliveryDirectives: w
							});
						}, p.onSubtitleTrackLoading = function(p, m) {
							var g = m.id, _ = m.groupId, x = m.url, w = m.deliveryDirectives;
							this.load({
								id: g,
								groupId: _,
								level: null,
								responseType: "text",
								type: kt,
								url: x,
								deliveryDirectives: w
							});
						}, p.load = function(p) {
							var m, g, x, w = this, D = this.hls.config, O = this.getInternalLoader(p);
							if (O) {
								var A = O.context;
								if (A && A.url === p.url && A.level === p.level) return void K.trace("[playlist-loader]: playlist request ongoing");
								K.log("[playlist-loader]: aborting previous loader for type: " + p.type), O.abort();
							}
							if (g = p.type === xt ? D.manifestLoadPolicy.default : o({}, D.playlistLoadPolicy.default, {
								timeoutRetry: null,
								errorRetry: null
							}), O = this.createInternalLoader(p), _((m = p.deliveryDirectives)?.part) && (p.type === St && p.level !== null ? x = this.hls.levels[p.level].details : p.type === Tt && p.id !== null ? x = this.hls.audioTracks[p.id].details : p.type === kt && p.id !== null && (x = this.hls.subtitleTracks[p.id].details), x)) {
								var F = x.partTarget, U = x.targetduration;
								if (F && U) {
									var oe = 1e3 * Math.max(3 * F, .8 * U);
									g = o({}, g, {
										maxTimeToFirstByteMs: Math.min(oe, g.maxTimeToFirstByteMs),
										maxLoadTimeMs: Math.min(oe, g.maxTimeToFirstByteMs)
									});
								}
							}
							var le = g.errorRetry || g.timeoutRetry || {}, ue = {
								loadPolicy: g,
								timeout: g.maxLoadTimeMs,
								maxRetry: le.maxNumRetry || 0,
								retryDelay: le.retryDelayMs || 0,
								maxRetryDelay: le.maxRetryDelayMs || 0
							}, we = {
								onSuccess: function(p, m, g, _) {
									var x = w.getInternalLoader(g);
									w.resetInternalLoader(g.type);
									var D = p.data;
									D.indexOf("#EXTM3U") === 0 ? (m.parsing.start = performance.now(), bt.isMediaPlaylist(D) ? w.handleTrackOrLevelPlaylist(p, m, g, _ || null, x) : w.handleMasterPlaylist(p, m, g, _)) : w.handleManifestParsingError(p, g, Error("no EXTM3U delimiter"), _ || null, m);
								},
								onError: function(p, m, g, _) {
									w.handleNetworkError(m, g, !1, p, _);
								},
								onTimeout: function(p, m, g) {
									w.handleNetworkError(m, g, !0, void 0, p);
								}
							};
							O.load(p, ue, we);
						}, p.handleMasterPlaylist = function(p, m, g, _) {
							var x = this.hls, w = p.data, O = ut(p, g), A = bt.parseMasterPlaylist(w, O);
							if (A.playlistParsingError) this.handleManifestParsingError(p, g, A.playlistParsingError, _, m);
							else {
								var F = A.contentSteering, U = A.levels, oe = A.sessionData, le = A.sessionKeys, we = A.startTimeOffset, je = A.variableList;
								this.variableList = je;
								var Ie = bt.parseMasterPlaylistMedia(w, O, A), Be = Ie.AUDIO, Ve = Be === void 0 ? [] : Be, Ue = Ie.SUBTITLES, We = Ie["CLOSED-CAPTIONS"];
								Ve.length && (Ve.some(function(p) {
									return !p.url;
								}) || !U[0].audioCodec || U[0].attrs.AUDIO || (K.log("[playlist-loader]: audio codec signaled in quality level, but no embedded audio track signaled, create one"), Ve.unshift({
									type: "main",
									name: "main",
									groupId: "main",
									default: !1,
									autoselect: !1,
									forced: !1,
									id: -1,
									attrs: new ue({}),
									bitrate: 0,
									url: ""
								}))), x.trigger(D.MANIFEST_LOADED, {
									levels: U,
									audioTracks: Ve,
									subtitles: Ue,
									captions: We,
									contentSteering: F,
									url: O,
									stats: m,
									networkDetails: _,
									sessionData: oe,
									sessionKeys: le,
									startTimeOffset: we,
									variableList: je
								});
							}
						}, p.handleTrackOrLevelPlaylist = function(p, m, g, x, w) {
							var O = this.hls, A = g.id, F = g.level, U = g.type, K = ut(p, g), oe = _(F) ? F : _(A) ? A : 0, le = lt(g), we = bt.parseLevelPlaylist(p.data, K, oe, le, 0, this.variableList);
							if (U === xt) {
								var je = {
									attrs: new ue({}),
									bitrate: 0,
									details: we,
									name: "",
									url: K
								};
								O.trigger(D.MANIFEST_LOADED, {
									levels: [je],
									audioTracks: [],
									url: K,
									stats: m,
									networkDetails: x,
									sessionData: null,
									sessionKeys: null,
									contentSteering: null,
									startTimeOffset: null,
									variableList: null
								});
							}
							m.parsing.end = performance.now(), g.levelDetails = we, this.handlePlaylistLoaded(we, p, m, g, x, w);
						}, p.handleManifestParsingError = function(p, m, g, _, x) {
							this.hls.trigger(D.ERROR, {
								type: O.NETWORK_ERROR,
								details: A.MANIFEST_PARSING_ERROR,
								fatal: m.type === xt,
								url: p.url,
								err: g,
								error: g,
								reason: g.message,
								response: p,
								context: m,
								networkDetails: _,
								stats: x
							});
						}, p.handleNetworkError = function(p, m, g, _, x) {
							g === void 0 && (g = !1);
							var w = "A network " + (g ? "timeout" : "error" + (_ ? " (status " + _.code + ")" : "")) + " occurred while loading " + p.type;
							p.type === St ? w += ": " + p.level + " id: " + p.id : p.type !== Tt && p.type !== kt || (w += " id: " + p.id + " group-id: \"" + p.groupId + "\"");
							var F = Error(w);
							K.warn("[playlist-loader]: " + w);
							var U = A.UNKNOWN, oe = !1, le = this.getInternalLoader(p);
							switch (p.type) {
								case xt:
									U = g ? A.MANIFEST_LOAD_TIMEOUT : A.MANIFEST_LOAD_ERROR, oe = !0;
									break;
								case St:
									U = g ? A.LEVEL_LOAD_TIMEOUT : A.LEVEL_LOAD_ERROR, oe = !1;
									break;
								case Tt:
									U = g ? A.AUDIO_TRACK_LOAD_TIMEOUT : A.AUDIO_TRACK_LOAD_ERROR, oe = !1;
									break;
								case kt: U = g ? A.SUBTITLE_TRACK_LOAD_TIMEOUT : A.SUBTITLE_LOAD_ERROR, oe = !1;
							}
							le && this.resetInternalLoader(p.type);
							var ue = {
								type: O.NETWORK_ERROR,
								details: U,
								fatal: oe,
								url: p.url,
								loader: le,
								context: p,
								error: F,
								networkDetails: m,
								stats: x
							};
							if (_) {
								var we = m?.url || p.url;
								ue.response = i({
									url: we,
									data: void 0
								}, _);
							}
							this.hls.trigger(D.ERROR, ue);
						}, p.handlePlaylistLoaded = function(p, m, g, _, x, w) {
							var F = this.hls, U = _.type, K = _.level, oe = _.id, le = _.groupId, ue = _.deliveryDirectives, we = ut(m, _), je = lt(_), Ie = typeof _.level == "number" && je === At ? K : void 0;
							if (p.fragments.length) {
								p.targetduration || (p.playlistParsingError = Error("Missing Target Duration"));
								var Be = p.playlistParsingError;
								if (Be) F.trigger(D.ERROR, {
									type: O.NETWORK_ERROR,
									details: A.LEVEL_PARSING_ERROR,
									fatal: !1,
									url: we,
									error: Be,
									reason: Be.message,
									response: m,
									context: _,
									level: Ie,
									parent: je,
									networkDetails: x,
									stats: g
								});
								else switch (p.live && w && (w.getCacheAge && (p.ageHeader = w.getCacheAge() || 0), w.getCacheAge && !isNaN(p.ageHeader) || (p.ageHeader = 0)), U) {
									case xt:
									case St:
										F.trigger(D.LEVEL_LOADED, {
											details: p,
											level: Ie || 0,
											id: oe || 0,
											stats: g,
											networkDetails: x,
											deliveryDirectives: ue
										});
										break;
									case Tt:
										F.trigger(D.AUDIO_TRACK_LOADED, {
											details: p,
											id: oe || 0,
											groupId: le || "",
											stats: g,
											networkDetails: x,
											deliveryDirectives: ue
										});
										break;
									case kt: F.trigger(D.SUBTITLE_TRACK_LOADED, {
										details: p,
										id: oe || 0,
										groupId: le || "",
										stats: g,
										networkDetails: x,
										deliveryDirectives: ue
									});
								}
							} else {
								var Ve = Error("No Segments found in Playlist");
								F.trigger(D.ERROR, {
									type: O.NETWORK_ERROR,
									details: A.LEVEL_EMPTY_ERROR,
									fatal: !1,
									url: we,
									error: Ve,
									reason: Ve.message,
									response: m,
									context: _,
									level: Ie,
									parent: je,
									networkDetails: x,
									stats: g
								});
							}
						}, e;
					}();
					function ht(p, m) {
						var g;
						try {
							g = new Event("addtrack");
						} catch {
							(g = document.createEvent("Event")).initEvent("addtrack", !1, !1);
						}
						g.track = p, m.dispatchEvent(g);
					}
					function ft(p, m, g, _) {
						var x = p.mode;
						if (x === "disabled" && (p.mode = "hidden"), p.cues && p.cues.length > 0) for (var w = function(p, m, g) {
							var _ = [], x = function(p, m) {
								if (m < p[0].startTime) return 0;
								var g = p.length - 1;
								if (m > p[g].endTime) return -1;
								for (var _ = 0, x = g; _ <= x;) {
									var w = Math.floor((x + _) / 2);
									if (m < p[w].startTime) x = w - 1;
									else {
										if (!(m > p[w].startTime && _ < g)) return w;
										_ = w + 1;
									}
								}
								return p[_].startTime - m < m - p[x].startTime ? _ : x;
							}(p, m);
							if (x > -1) for (var w = x, D = p.length; w < D; w++) {
								var O = p[w];
								if (O.startTime >= m && O.endTime <= g) _.push(O);
								else if (O.startTime > g) return _;
							}
							return _;
						}(p.cues, m, g), D = 0; D < w.length; D++) _ && !_(w[D]) || p.removeCue(w[D]);
						x === "disabled" && (p.mode = x);
					}
					var qt = "org.id3", Jt = "com.apple.quicktime.HLS", Xt = "https://aomedia.org/emsg/ID3";
					function mt() {
						if (typeof self < "u") return self.VTTCue || self.TextTrackCue;
					}
					function pt(p, m, g, _, x) {
						var w = new p(m, g, "");
						try {
							w.value = _, x && (w.type = x);
						} catch {
							w = new p(m, g, JSON.stringify(x ? i({ type: x }, _) : _));
						}
						return w;
					}
					var Zt = function() {
						var p = mt();
						try {
							p && new p(0, Infinity, "");
						} catch {
							return Number.MAX_VALUE;
						}
						return Infinity;
					}();
					function Et(p, m) {
						return p.getTime() / 1e3 - m;
					}
					var Qt = function() {
						function e(p) {
							this.hls = void 0, this.id3Track = null, this.media = null, this.dateRangeCuesAppended = {}, this.hls = p, this._registerListeners();
						}
						var p = e.prototype;
						return p.destroy = function() {
							this._unregisterListeners(), this.id3Track = null, this.media = null, this.dateRangeCuesAppended = {}, this.hls = null;
						}, p._registerListeners = function() {
							var p = this.hls;
							p.on(D.MEDIA_ATTACHED, this.onMediaAttached, this), p.on(D.MEDIA_DETACHING, this.onMediaDetaching, this), p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.FRAG_PARSING_METADATA, this.onFragParsingMetadata, this), p.on(D.BUFFER_FLUSHING, this.onBufferFlushing, this), p.on(D.LEVEL_UPDATED, this.onLevelUpdated, this);
						}, p._unregisterListeners = function() {
							var p = this.hls;
							p.off(D.MEDIA_ATTACHED, this.onMediaAttached, this), p.off(D.MEDIA_DETACHING, this.onMediaDetaching, this), p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.FRAG_PARSING_METADATA, this.onFragParsingMetadata, this), p.off(D.BUFFER_FLUSHING, this.onBufferFlushing, this), p.off(D.LEVEL_UPDATED, this.onLevelUpdated, this);
						}, p.onMediaAttached = function(p, m) {
							this.media = m.media;
						}, p.onMediaDetaching = function() {
							this.id3Track && (function(p) {
								var m = p.mode;
								if (m === "disabled" && (p.mode = "hidden"), p.cues) for (var g = p.cues.length; g--;) p.removeCue(p.cues[g]);
								m === "disabled" && (p.mode = m);
							}(this.id3Track), this.id3Track = null, this.media = null, this.dateRangeCuesAppended = {});
						}, p.onManifestLoading = function() {
							this.dateRangeCuesAppended = {};
						}, p.createTrack = function(p) {
							var m = this.getID3Track(p.textTracks);
							return m.mode = "hidden", m;
						}, p.getID3Track = function(p) {
							if (this.media) {
								for (var m = 0; m < p.length; m++) {
									var g = p[m];
									if (g.kind === "metadata" && g.label === "id3") return ht(g, this.media), g;
								}
								return this.media.addTextTrack("metadata", "id3");
							}
						}, p.onFragParsingMetadata = function(p, m) {
							if (this.media) {
								var g = this.hls.config, _ = g.enableEmsgMetadataCues, x = g.enableID3MetadataCues;
								if (_ || x) {
									var w = m.samples;
									this.id3Track ||= this.createTrack(this.media);
									var D = mt();
									if (D) for (var O = 0; O < w.length; O++) {
										var A = w[O].type;
										if ((A !== Xt || _) && x) {
											var F = $(w[O].data);
											if (F) {
												var U = w[O].pts, K = U + w[O].duration;
												K > Zt && (K = Zt), K - U <= 0 && (K = U + .25);
												for (var oe = 0; oe < F.length; oe++) {
													var le = F[oe];
													if (!Q(le)) {
														this.updateId3CueEnds(U, A);
														var ue = pt(D, U, K, le, A);
														ue && this.id3Track.addCue(ue);
													}
												}
											}
										}
									}
								}
							}
						}, p.updateId3CueEnds = function(p, m) {
							var g, _ = (g = this.id3Track)?.cues;
							if (_) for (var x = _.length; x--;) {
								var w = _[x];
								w.type === m && w.startTime < p && w.endTime === Zt && (w.endTime = p);
							}
						}, p.onBufferFlushing = function(p, m) {
							var g = m.startOffset, _ = m.endOffset, x = m.type, w = this.id3Track, D = this.hls;
							if (D) {
								var O = D.config, A = O.enableEmsgMetadataCues, F = O.enableID3MetadataCues;
								w && (A || F) && ft(w, g, _, x === "audio" ? function(p) {
									return p.type === qt && F;
								} : x === "video" ? function(p) {
									return p.type === Xt && A;
								} : function(p) {
									return p.type === qt && F || p.type === Xt && A;
								});
							}
						}, p.onLevelUpdated = function(p, m) {
							var g = this, x = m.details;
							if (this.media && x.hasProgramDateTime && this.hls.config.enableDateRangeMetadataCues) {
								var w = this.dateRangeCuesAppended, D = this.id3Track, O = x.dateRanges, A = Object.keys(O);
								if (D) for (var F = Object.keys(w).filter(function(p) {
									return !A.includes(p);
								}), u = function() {
									var p = F[U];
									Object.keys(w[p].cues).forEach(function(m) {
										D.removeCue(w[p].cues[m]);
									}), delete w[p];
								}, U = F.length; U--;) u();
								var K = x.fragments[x.fragments.length - 1];
								if (A.length !== 0 && _(K?.programDateTime)) {
									this.id3Track ||= this.createTrack(this.media);
									for (var oe = K.programDateTime / 1e3 - K.start, le = mt(), v = function() {
										var p = A[ue], m = O[p], _ = Et(m.startDate, oe), x = w[p], D = x?.cues || {}, F = x?.durationKnown || !1, U = Zt, K = m.endDate;
										if (K) U = Et(K, oe), F = !0;
										else if (m.endOnNext && !F) {
											var we = A.reduce(function(p, g) {
												if (g !== m.id) {
													var _ = O[g];
													if (_.class === m.class && _.startDate > m.startDate && (!p || m.startDate < p.startDate)) return _;
												}
												return p;
											}, null);
											we && (U = Et(we.startDate, oe), F = !0);
										}
										for (var je, Ie, Be = Object.keys(m.attr), Ve = 0; Ve < Be.length; Ve++) {
											var Ue = Be[Ve];
											if ((Ie = Ue) !== "ID" && Ie !== "CLASS" && Ie !== "START-DATE" && Ie !== "DURATION" && Ie !== "END-DATE" && Ie !== "END-ON-NEXT") {
												var We = D[Ue];
												if (We) F && !x.durationKnown && (We.endTime = U);
												else if (le) {
													var Ke = m.attr[Ue];
													C(Ue) && (je = Ke, Ke = Uint8Array.from(je.replace(/^0x/, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")).buffer);
													var qe = pt(le, _, U, {
														key: Ue,
														data: Ke
													}, Jt);
													qe && (qe.id = p, g.id3Track.addCue(qe), D[Ue] = qe);
												}
											}
										}
										w[p] = {
											cues: D,
											dateRange: m,
											durationKnown: F
										};
									}, ue = 0; ue < A.length; ue++) v();
								}
							}
						}, e;
					}(), $t = function() {
						function e(p) {
							var m = this;
							this.hls = void 0, this.config = void 0, this.media = null, this.levelDetails = null, this.currentTime = 0, this.stallCount = 0, this._latency = null, this.timeupdateHandler = function() {
								return m.timeupdate();
							}, this.hls = p, this.config = p.config, this.registerListeners();
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.unregisterListeners(), this.onMediaDetaching(), this.levelDetails = null, this.hls = this.timeupdateHandler = null;
						}, p.registerListeners = function() {
							this.hls.on(D.MEDIA_ATTACHED, this.onMediaAttached, this), this.hls.on(D.MEDIA_DETACHING, this.onMediaDetaching, this), this.hls.on(D.MANIFEST_LOADING, this.onManifestLoading, this), this.hls.on(D.LEVEL_UPDATED, this.onLevelUpdated, this), this.hls.on(D.ERROR, this.onError, this);
						}, p.unregisterListeners = function() {
							this.hls.off(D.MEDIA_ATTACHED, this.onMediaAttached, this), this.hls.off(D.MEDIA_DETACHING, this.onMediaDetaching, this), this.hls.off(D.MANIFEST_LOADING, this.onManifestLoading, this), this.hls.off(D.LEVEL_UPDATED, this.onLevelUpdated, this), this.hls.off(D.ERROR, this.onError, this);
						}, p.onMediaAttached = function(p, m) {
							this.media = m.media, this.media.addEventListener("timeupdate", this.timeupdateHandler);
						}, p.onMediaDetaching = function() {
							this.media && (this.media.removeEventListener("timeupdate", this.timeupdateHandler), this.media = null);
						}, p.onManifestLoading = function() {
							this.levelDetails = null, this._latency = null, this.stallCount = 0;
						}, p.onLevelUpdated = function(p, m) {
							var g = m.details;
							this.levelDetails = g, g.advanced && this.timeupdate(), !g.live && this.media && this.media.removeEventListener("timeupdate", this.timeupdateHandler);
						}, p.onError = function(p, m) {
							var g;
							m.details === A.BUFFER_STALLED_ERROR && (this.stallCount++, (g = this.levelDetails) != null && g.live && K.warn("[playback-rate-controller]: Stall detected, adjusting target latency"));
						}, p.timeupdate = function() {
							var p = this.media, m = this.levelDetails;
							if (p && m) {
								this.currentTime = p.currentTime;
								var g = this.computeLatency();
								if (g !== null) {
									this._latency = g;
									var _ = this.config, x = _.lowLatencyMode, w = _.maxLiveSyncPlaybackRate;
									if (x && w !== 1 && m.live) {
										var D = this.targetLatency;
										if (D !== null) {
											var O = g - D;
											if (O < Math.min(this.maxLatency, D + m.targetduration) && O > .05 && this.forwardBufferLength > 1) {
												var A = Math.min(2, Math.max(1, w)), F = Math.round(2 / (1 + Math.exp(-.75 * O - this.edgeStalled)) * 20) / 20;
												p.playbackRate = Math.min(A, Math.max(1, F));
											} else p.playbackRate !== 1 && p.playbackRate !== 0 && (p.playbackRate = 1);
										}
									}
								}
							}
						}, p.estimateLiveEdge = function() {
							var p = this.levelDetails;
							return p === null ? null : p.edge + p.age;
						}, p.computeLatency = function() {
							var p = this.estimateLiveEdge();
							return p === null ? null : p - this.currentTime;
						}, s(e, [
							{
								key: "latency",
								get: function() {
									return this._latency || 0;
								}
							},
							{
								key: "maxLatency",
								get: function() {
									var p = this.config, m = this.levelDetails;
									return p.liveMaxLatencyDuration === void 0 ? m ? p.liveMaxLatencyDurationCount * m.targetduration : 0 : p.liveMaxLatencyDuration;
								}
							},
							{
								key: "targetLatency",
								get: function() {
									var p = this.levelDetails;
									if (p === null) return null;
									var m = p.holdBack, g = p.partHoldBack, _ = p.targetduration, x = this.config, w = x.liveSyncDuration, D = x.liveSyncDurationCount, O = x.lowLatencyMode, A = this.hls.userConfig, F = O && g || m;
									(A.liveSyncDuration || A.liveSyncDurationCount || F === 0) && (F = w === void 0 ? D * _ : w);
									var U = _;
									return F + Math.min(1 * this.stallCount, U);
								}
							},
							{
								key: "liveSyncPosition",
								get: function() {
									var p = this.estimateLiveEdge(), m = this.targetLatency, g = this.levelDetails;
									if (p === null || m === null || g === null) return null;
									var _ = g.edge, x = p - m - this.edgeStalled, w = _ - g.totalduration, D = _ - (this.config.lowLatencyMode && g.partTarget || g.targetduration);
									return Math.min(Math.max(w, x), D);
								}
							},
							{
								key: "drift",
								get: function() {
									var p = this.levelDetails;
									return p === null ? 1 : p.drift;
								}
							},
							{
								key: "edgeStalled",
								get: function() {
									var p = this.levelDetails;
									if (p === null) return 0;
									var m = 3 * (this.config.lowLatencyMode && p.partTarget || p.targetduration);
									return Math.max(p.age - m, 0);
								}
							},
							{
								key: "forwardBufferLength",
								get: function() {
									var p = this.media, m = this.levelDetails;
									if (!p || !m) return 0;
									var g = p.buffered.length;
									return (g ? p.buffered.end(g - 1) : m.edge) - this.currentTime;
								}
							}
						]), e;
					}(), en = [
						"NONE",
						"TYPE-0",
						"TYPE-1",
						null
					], tn = [
						"SDR",
						"PQ",
						"HLG"
					], nn = "", rn = "YES", an = "v2";
					function Dt(p) {
						var m = p.canSkipUntil, g = p.canSkipDateRanges, _ = p.age;
						return m && _ < m / 2 ? g ? an : rn : nn;
					}
					var on = function() {
						function e(p, m, g) {
							this.msn = void 0, this.part = void 0, this.skip = void 0, this.msn = p, this.part = m, this.skip = g;
						}
						return e.prototype.addDirectives = function(p) {
							var m = new self.URL(p);
							return this.msn !== void 0 && m.searchParams.set("_HLS_msn", this.msn.toString()), this.part !== void 0 && m.searchParams.set("_HLS_part", this.part.toString()), this.skip && m.searchParams.set("_HLS_skip", this.skip), m.href;
						}, e;
					}(), sn = function() {
						function e(p) {
							this._attrs = void 0, this.audioCodec = void 0, this.bitrate = void 0, this.codecSet = void 0, this.url = void 0, this.frameRate = void 0, this.height = void 0, this.id = void 0, this.name = void 0, this.videoCodec = void 0, this.width = void 0, this.details = void 0, this.fragmentError = 0, this.loadError = 0, this.loaded = void 0, this.realBitrate = 0, this.supportedPromise = void 0, this.supportedResult = void 0, this._avgBitrate = 0, this._audioGroups = void 0, this._subtitleGroups = void 0, this._urlId = 0, this.url = [p.url], this._attrs = [p.attrs], this.bitrate = p.bitrate, p.details && (this.details = p.details), this.id = p.id || 0, this.name = p.name, this.width = p.width || 0, this.height = p.height || 0, this.frameRate = p.attrs.optionalFloat("FRAME-RATE", 0), this._avgBitrate = p.attrs.decimalInteger("AVERAGE-BANDWIDTH"), this.audioCodec = p.audioCodec, this.videoCodec = p.videoCodec, this.codecSet = [p.videoCodec, p.audioCodec].filter(function(p) {
								return !!p;
							}).map(function(p) {
								return p.substring(0, 4);
							}).join(","), this.addGroupId("audio", p.attrs.AUDIO), this.addGroupId("text", p.attrs.SUBTITLES);
						}
						var p = e.prototype;
						return p.hasAudioGroup = function(p) {
							return wt(this._audioGroups, p);
						}, p.hasSubtitleGroup = function(p) {
							return wt(this._subtitleGroups, p);
						}, p.addGroupId = function(p, m) {
							if (m) {
								if (p === "audio") {
									var g = this._audioGroups;
									g ||= this._audioGroups = [], g.indexOf(m) === -1 && g.push(m);
								} else if (p === "text") {
									var _ = this._subtitleGroups;
									_ ||= this._subtitleGroups = [], _.indexOf(m) === -1 && _.push(m);
								}
							}
						}, p.addFallback = function() {}, s(e, [
							{
								key: "maxBitrate",
								get: function() {
									return Math.max(this.realBitrate, this.bitrate);
								}
							},
							{
								key: "averageBitrate",
								get: function() {
									return this._avgBitrate || this.realBitrate || this.bitrate;
								}
							},
							{
								key: "attrs",
								get: function() {
									return this._attrs[0];
								}
							},
							{
								key: "codecs",
								get: function() {
									return this.attrs.CODECS || "";
								}
							},
							{
								key: "pathwayId",
								get: function() {
									return this.attrs["PATHWAY-ID"] || ".";
								}
							},
							{
								key: "videoRange",
								get: function() {
									return this.attrs["VIDEO-RANGE"] || "SDR";
								}
							},
							{
								key: "score",
								get: function() {
									return this.attrs.optionalFloat("SCORE", 0);
								}
							},
							{
								key: "uri",
								get: function() {
									return this.url[0] || "";
								}
							},
							{
								key: "audioGroups",
								get: function() {
									return this._audioGroups;
								}
							},
							{
								key: "subtitleGroups",
								get: function() {
									return this._subtitleGroups;
								}
							},
							{
								key: "urlId",
								get: function() {
									return 0;
								},
								set: function(p) {}
							},
							{
								key: "audioGroupIds",
								get: function() {
									return this.audioGroups ? [this.audioGroupId] : void 0;
								}
							},
							{
								key: "textGroupIds",
								get: function() {
									return this.subtitleGroups ? [this.textGroupId] : void 0;
								}
							},
							{
								key: "audioGroupId",
								get: function() {
									var p;
									return (p = this.audioGroups)?.[0];
								}
							},
							{
								key: "textGroupId",
								get: function() {
									var p;
									return (p = this.subtitleGroups)?.[0];
								}
							}
						]), e;
					}();
					function wt(p, m) {
						return !(!m || !p) && p.indexOf(m) !== -1;
					}
					function Ct(p, m) {
						var g = m.startPTS;
						if (_(g)) {
							var x, w = 0;
							m.sn > p.sn ? (w = g - p.start, x = p) : (w = p.start - g, x = m), x.duration !== w && (x.duration = w);
						} else m.sn > p.sn ? p.cc === m.cc && p.minEndPTS ? m.start = p.start + (p.minEndPTS - p.start) : m.start = p.start + p.duration : m.start = Math.max(p.start - m.duration, 0);
					}
					function It(p, m, g, x, w, D) {
						x - g <= 0 && (K.warn("Fragment should have a positive duration", m), x = g + m.duration, D = w + m.duration);
						var O = g, A = x, F = m.startPTS, U = m.endPTS;
						if (_(F)) {
							var oe = Math.abs(F - g);
							_(m.deltaPTS) ? m.deltaPTS = Math.max(oe, m.deltaPTS) : m.deltaPTS = oe, O = Math.max(g, F), g = Math.min(g, F), w = Math.min(w, m.startDTS), A = Math.min(x, U), x = Math.max(x, U), D = Math.max(D, m.endDTS);
						}
						var le = g - m.start;
						m.start !== 0 && (m.start = g), m.duration = x - m.start, m.startPTS = g, m.maxStartPTS = O, m.startDTS = w, m.endPTS = x, m.minEndPTS = A, m.endDTS = D;
						var ue, we = m.sn;
						if (!p || we < p.startSN || we > p.endSN) return 0;
						var je = we - p.startSN, Ie = p.fragments;
						for (Ie[je] = m, ue = je; ue > 0; ue--) Ct(Ie[ue], Ie[ue - 1]);
						for (ue = je; ue < Ie.length - 1; ue++) Ct(Ie[ue], Ie[ue + 1]);
						return p.fragmentHint && Ct(Ie[Ie.length - 1], p.fragmentHint), p.PTSKnown = p.alignedSliding = !0, le;
					}
					function Pt(p, m) {
						for (var g = null, x = p.fragments, w = x.length - 1; w >= 0; w--) {
							var D = x[w].initSegment;
							if (D) {
								g = D;
								break;
							}
						}
						p.fragmentHint && delete p.fragmentHint.endPTS;
						var O, A, F, U, oe, le = 0;
						if (function(p, m, g) {
							for (var _ = m.skippedSegments, x = Math.max(p.startSN, m.startSN) - m.startSN, w = (p.fragmentHint ? 1 : 0) + (_ ? m.endSN : Math.min(p.endSN, m.endSN)) - m.startSN, D = m.startSN - p.startSN, O = m.fragmentHint ? m.fragments.concat(m.fragmentHint) : m.fragments, A = p.fragmentHint ? p.fragments.concat(p.fragmentHint) : p.fragments, F = x; F <= w; F++) {
								var U = A[D + F], K = O[F];
								_ && !K && F < _ && (K = m.fragments[F] = U), U && K && g(U, K);
							}
						}(p, m, function(p, x) {
							p.relurl && (le = p.cc - x.cc), _(p.startPTS) && _(p.endPTS) && (x.start = x.startPTS = p.startPTS, x.startDTS = p.startDTS, x.maxStartPTS = p.maxStartPTS, x.endPTS = p.endPTS, x.endDTS = p.endDTS, x.minEndPTS = p.minEndPTS, x.duration = p.endPTS - p.startPTS, x.duration && (O = x), m.PTSKnown = m.alignedSliding = !0), x.elementaryStreams = p.elementaryStreams, x.loader = p.loader, x.stats = p.stats, p.initSegment && (x.initSegment = p.initSegment, g = p.initSegment);
						}), g && (m.fragmentHint ? m.fragments.concat(m.fragmentHint) : m.fragments).forEach(function(p) {
							var m;
							!p || p.initSegment && p.initSegment.relurl !== (m = g)?.relurl || (p.initSegment = g);
						}), m.skippedSegments) if (m.deltaUpdateFailed = m.fragments.some(function(p) {
							return !p;
						}), m.deltaUpdateFailed) {
							K.warn("[level-helper] Previous playlist missing segments skipped in delta playlist");
							for (var ue = m.skippedSegments; ue--;) m.fragments.shift();
							m.startSN = m.fragments[0].sn, m.startCC = m.fragments[0].cc;
						} else m.canSkipDateRanges && (m.dateRanges = (A = p.dateRanges, F = m.dateRanges, U = m.recentlyRemovedDateranges, oe = o({}, A), U && U.forEach(function(p) {
							delete oe[p];
						}), Object.keys(F).forEach(function(p) {
							var m = new we(F[p].attr, oe[p]);
							m.isValid ? oe[p] = m : K.warn("Ignoring invalid Playlist Delta Update DATERANGE tag: \"" + JSON.stringify(F[p].attr) + "\"");
						}), oe));
						var je = m.fragments;
						if (le) {
							K.warn("discontinuity sliding from playlist, take drift into account");
							for (var Ie = 0; Ie < je.length; Ie++) je[Ie].cc += le;
						}
						m.skippedSegments && (m.startCC = m.fragments[0].cc), function(p, m, g) {
							if (p && m) for (var _ = 0, x = 0, w = p.length; x <= w; x++) {
								var D = p[x], O = m[x + _];
								D && O && D.index === O.index && D.fragment.sn === O.fragment.sn ? g(D, O) : _--;
							}
						}(p.partList, m.partList, function(p, m) {
							m.elementaryStreams = p.elementaryStreams, m.stats = p.stats;
						}), O ? It(m, O, O.startPTS, O.endPTS, O.startDTS, O.endDTS) : Ft(p, m), je.length && (m.totalduration = m.edge - je[0].start), m.driftStartTime = p.driftStartTime, m.driftStart = p.driftStart;
						var Be = m.advancedDateTime;
						if (m.advanced && Be) {
							var Ve = m.edge;
							m.driftStart || (m.driftStartTime = Be, m.driftStart = Ve), m.driftEndTime = Be, m.driftEnd = Ve;
						} else m.driftEndTime = p.driftEndTime, m.driftEnd = p.driftEnd, m.advancedDateTime = p.advancedDateTime;
					}
					function Ft(p, m) {
						var g = m.startSN + m.skippedSegments - p.startSN, _ = p.fragments;
						g < 0 || g >= _.length || function(p, m) {
							if (m) {
								for (var g = p.fragments, _ = p.skippedSegments; _ < g.length; _++) g[_].start += m;
								p.fragmentHint && (p.fragmentHint.start += m);
							}
						}(m, _[g].start);
					}
					function Ot(p, m, g) {
						var _;
						return p != null && p.details ? Mt((_ = p.details)?.partList, m, g) : null;
					}
					function Mt(p, m, g) {
						if (p) for (var _ = p.length; _--;) {
							var x = p[_];
							if (x.index === g && x.fragment.sn === m) return x;
						}
						return null;
					}
					function Nt(p) {
						p.forEach(function(p, m) {
							var g = p.details;
							g != null && g.fragments && g.fragments.forEach(function(p) {
								p.level = m;
							});
						});
					}
					function Bt(p) {
						switch (p.details) {
							case A.FRAG_LOAD_TIMEOUT:
							case A.KEY_LOAD_TIMEOUT:
							case A.LEVEL_LOAD_TIMEOUT:
							case A.MANIFEST_LOAD_TIMEOUT: return !0;
						}
						return !1;
					}
					function Ut(p, m) {
						var g = Bt(m);
						return p.default[(g ? "timeout" : "error") + "Retry"];
					}
					function Gt(p, m) {
						var g = p.backoff === "linear" ? 1 : 2 ** m;
						return Math.min(g * p.retryDelayMs, p.maxRetryDelayMs);
					}
					function Ht(p) {
						return i(i({}, p), {
							errorRetry: null,
							timeoutRetry: null
						});
					}
					function Vt(p, m, g, _) {
						if (!p) return !1;
						var x = _?.code, w = m < p.maxNumRetry && (function(p) {
							return p === 0 && !1 === navigator.onLine || !!p && (p < 400 || p > 499);
						}(x) || !!g);
						return p.shouldRetry ? p.shouldRetry(p, m, g, _, w) : w;
					}
					var Kt = function(p, m) {
						for (var g = 0, _ = p.length - 1, x = null, w = null; g <= _;) {
							var D = m(w = p[x = (g + _) / 2 | 0]);
							if (D > 0) g = x + 1;
							else {
								if (!(D < 0)) return w;
								_ = x - 1;
							}
						}
						return null;
					};
					function Wt(p, m, g, _, x) {
						g === void 0 && (g = 0), _ === void 0 && (_ = 0), x === void 0 && (x = .005);
						var w = null;
						if (p) {
							w = m[p.sn - m[0].sn + 1] || null;
							var D = p.endDTS - g;
							D > 0 && D < 15e-7 && (g += 15e-7);
						} else g === 0 && m[0].start === 0 && (w = m[0]);
						if (w && ((!p || p.level === w.level) && jt(g, _, w) === 0 || function(p, m, g) {
							if (m && m.start === 0 && m.level < p.level && (m.endPTS || 0) > 0) {
								var _ = m.tagList.reduce(function(p, m) {
									return m[0] === "INF" && (p += parseFloat(m[1])), p;
								}, g);
								return p.start <= _;
							}
							return !1;
						}(w, p, Math.min(x, _)))) return w;
						var O = Kt(m, jt.bind(null, g, _));
						return !O || O === p && w ? w : O;
					}
					function jt(p, m, g) {
						if (p === void 0 && (p = 0), m === void 0 && (m = 0), g.start <= p && g.start + g.duration > p) return 0;
						var _ = Math.min(m, g.duration + (g.deltaPTS ? g.deltaPTS : 0));
						return g.start + g.duration - _ <= p ? 1 : g.start - _ > p && g.start ? -1 : 0;
					}
					function Yt(p, m, g) {
						var _ = 1e3 * Math.min(m, g.duration + (g.deltaPTS ? g.deltaPTS : 0));
						return (g.endProgramDateTime || 0) - _ > p;
					}
					var cn = 0, ln = 2, un = 3, dn = 5, pn = 0, mn = 1, hn = 2, gn = function() {
						function e(p) {
							this.hls = void 0, this.playlistError = 0, this.penalizedRenditions = {}, this.log = void 0, this.warn = void 0, this.error = void 0, this.hls = p, this.log = K.log.bind(K, "[info]:"), this.warn = K.warn.bind(K, "[warning]:"), this.error = K.error.bind(K, "[error]:"), this.registerListeners();
						}
						var p = e.prototype;
						return p.registerListeners = function() {
							var p = this.hls;
							p.on(D.ERROR, this.onError, this), p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.LEVEL_UPDATED, this.onLevelUpdated, this);
						}, p.unregisterListeners = function() {
							var p = this.hls;
							p && (p.off(D.ERROR, this.onError, this), p.off(D.ERROR, this.onErrorOut, this), p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.LEVEL_UPDATED, this.onLevelUpdated, this));
						}, p.destroy = function() {
							this.unregisterListeners(), this.hls = null, this.penalizedRenditions = {};
						}, p.startLoad = function(p) {}, p.stopLoad = function() {
							this.playlistError = 0;
						}, p.getVariantLevelIndex = function(p) {
							return p?.type === At ? p.level : this.hls.loadLevel;
						}, p.onManifestLoading = function() {
							this.playlistError = 0, this.penalizedRenditions = {};
						}, p.onLevelUpdated = function() {
							this.playlistError = 0;
						}, p.onError = function(p, m) {
							var g, _;
							if (!m.fatal) {
								var x = this.hls, w = m.context;
								switch (m.details) {
									case A.FRAG_LOAD_ERROR:
									case A.FRAG_LOAD_TIMEOUT:
									case A.KEY_LOAD_ERROR:
									case A.KEY_LOAD_TIMEOUT: return void (m.errorAction = this.getFragRetryOrSwitchAction(m));
									case A.FRAG_PARSING_ERROR: if ((g = m.frag) != null && g.gap) return void (m.errorAction = {
										action: cn,
										flags: pn
									});
									case A.FRAG_GAP:
									case A.FRAG_DECRYPT_ERROR: return m.errorAction = this.getFragRetryOrSwitchAction(m), void (m.errorAction.action = ln);
									case A.LEVEL_EMPTY_ERROR:
									case A.LEVEL_PARSING_ERROR:
										var D, F, U = m.parent === At ? m.level : x.loadLevel;
										return void (m.details === A.LEVEL_EMPTY_ERROR && (D = m.context) != null && (F = D.levelDetails) != null && F.live ? m.errorAction = this.getPlaylistRetryOrSwitchAction(m, U) : (m.levelRetry = !1, m.errorAction = this.getLevelSwitchAction(m, U)));
									case A.LEVEL_LOAD_ERROR:
									case A.LEVEL_LOAD_TIMEOUT: return void (typeof w?.level == "number" && (m.errorAction = this.getPlaylistRetryOrSwitchAction(m, w.level)));
									case A.AUDIO_TRACK_LOAD_ERROR:
									case A.AUDIO_TRACK_LOAD_TIMEOUT:
									case A.SUBTITLE_LOAD_ERROR:
									case A.SUBTITLE_TRACK_LOAD_TIMEOUT:
										if (w) {
											var K = x.levels[x.loadLevel];
											if (K && (w.type === Tt && K.hasAudioGroup(w.groupId) || w.type === kt && K.hasSubtitleGroup(w.groupId))) return m.errorAction = this.getPlaylistRetryOrSwitchAction(m, x.loadLevel), m.errorAction.action = ln, void (m.errorAction.flags = mn);
										}
										return;
									case A.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED:
										var oe = x.levels[x.loadLevel], le = oe?.attrs["HDCP-LEVEL"];
										return void (le ? m.errorAction = {
											action: ln,
											flags: hn,
											hdcpLevel: le
										} : this.keySystemError(m));
									case A.BUFFER_ADD_CODEC_ERROR:
									case A.REMUX_ALLOC_ERROR:
									case A.BUFFER_APPEND_ERROR: return void (m.errorAction = this.getLevelSwitchAction(m, (_ = m.level) ?? x.loadLevel));
									case A.INTERNAL_EXCEPTION:
									case A.BUFFER_APPENDING_ERROR:
									case A.BUFFER_FULL_ERROR:
									case A.LEVEL_SWITCH_ERROR:
									case A.BUFFER_STALLED_ERROR:
									case A.BUFFER_SEEK_OVER_HOLE:
									case A.BUFFER_NUDGE_ON_STALL: return void (m.errorAction = {
										action: cn,
										flags: pn
									});
								}
								m.type === O.KEY_SYSTEM_ERROR && this.keySystemError(m);
							}
						}, p.keySystemError = function(p) {
							var m = this.getVariantLevelIndex(p.frag);
							p.levelRetry = !1, p.errorAction = this.getLevelSwitchAction(p, m);
						}, p.getPlaylistRetryOrSwitchAction = function(p, m) {
							var g = Ut(this.hls.config.playlistLoadPolicy, p), _ = this.playlistError++;
							if (Vt(g, _, Bt(p), p.response)) return {
								action: dn,
								flags: pn,
								retryConfig: g,
								retryCount: _
							};
							var x = this.getLevelSwitchAction(p, m);
							return g && (x.retryConfig = g, x.retryCount = _), x;
						}, p.getFragRetryOrSwitchAction = function(p) {
							var m = this.hls, g = this.getVariantLevelIndex(p.frag), _ = m.levels[g], x = m.config, w = x.fragLoadPolicy, D = x.keyLoadPolicy, O = Ut(p.details.startsWith("key") ? D : w, p), F = m.levels.reduce(function(p, m) {
								return p + m.fragmentError;
							}, 0);
							if (_ && (p.details !== A.FRAG_GAP && _.fragmentError++, Vt(O, F, Bt(p), p.response))) return {
								action: dn,
								flags: pn,
								retryConfig: O,
								retryCount: F
							};
							var U = this.getLevelSwitchAction(p, g);
							return O && (U.retryConfig = O, U.retryCount = F), U;
						}, p.getLevelSwitchAction = function(p, m) {
							var g = this.hls;
							m ??= g.loadLevel;
							var _ = this.hls.levels[m];
							if (_) {
								var x, w, D = p.details;
								_.loadError++, D === A.BUFFER_APPEND_ERROR && _.fragmentError++;
								var O = -1, F = g.levels, U = g.loadLevel, K = g.minAutoLevel, oe = g.maxAutoLevel;
								g.autoLevelEnabled || (g.loadLevel = -1);
								for (var le, ue = (x = p.frag)?.type, we = (ue === Lt && D === A.FRAG_PARSING_ERROR || p.sourceBufferName === "audio" && (D === A.BUFFER_ADD_CODEC_ERROR || D === A.BUFFER_APPEND_ERROR)) && F.some(function(p) {
									var m = p.audioCodec;
									return _.audioCodec !== m;
								}), je = p.sourceBufferName === "video" && (D === A.BUFFER_ADD_CODEC_ERROR || D === A.BUFFER_APPEND_ERROR) && F.some(function(p) {
									var m = p.codecSet, g = p.audioCodec;
									return _.codecSet !== m && _.audioCodec === g;
								}), Ie = (w = p.context) ?? {}, Be = Ie.type, Ve = Ie.groupId, E = function() {
									var m = (Ue + U) % F.length;
									if (m !== U && m >= K && m <= oe && F[m].loadError === 0) {
										var g, x, w = F[m];
										if (D === A.FRAG_GAP && ue === At && p.frag) {
											var le = F[m].details;
											if (le) {
												var Ie = Wt(p.frag, le.fragments, p.frag.start);
												if (Ie != null && Ie.gap) return 0;
											}
										} else if (Be === Tt && w.hasAudioGroup(Ve) || Be === kt && w.hasSubtitleGroup(Ve) || ue === Lt && (g = _.audioGroups) != null && g.some(function(p) {
											return w.hasAudioGroup(p);
										}) || ue === Rt && (x = _.subtitleGroups) != null && x.some(function(p) {
											return w.hasSubtitleGroup(p);
										}) || we && _.audioCodec === w.audioCodec || !we && _.audioCodec !== w.audioCodec || je && _.codecSet === w.codecSet) return 0;
										return O = m, 1;
									}
								}, Ue = F.length; Ue-- && ((le = E()) === 0 || le !== 1););
								if (O > -1 && g.loadLevel !== O) return p.levelRetry = !0, this.playlistError = 0, {
									action: ln,
									flags: pn,
									nextAutoLevel: O
								};
							}
							return {
								action: ln,
								flags: mn
							};
						}, p.onErrorOut = function(p, m) {
							var g;
							switch ((g = m.errorAction)?.action) {
								case cn: break;
								case ln: this.sendAlternateToPenaltyBox(m), m.errorAction.resolved || m.details === A.FRAG_GAP ? /MediaSource readyState: ended/.test(m.error.message) && (this.warn("MediaSource ended after \"" + m.sourceBufferName + "\" sourceBuffer append error. Attempting to recover from media error."), this.hls.recoverMediaError()) : m.fatal = !0;
							}
							m.fatal && this.hls.stopLoad();
						}, p.sendAlternateToPenaltyBox = function(p) {
							var m = this.hls, g = p.errorAction;
							if (g) {
								var _ = g.flags, x = g.hdcpLevel, w = g.nextAutoLevel;
								switch (_) {
									case pn:
										this.switchLevel(p, w);
										break;
									case hn: x && (m.maxHdcpLevel = en[en.indexOf(x) - 1], g.resolved = !0), this.warn("Restricting playback to HDCP-LEVEL of \"" + m.maxHdcpLevel + "\" or lower");
								}
								g.resolved || this.switchLevel(p, w);
							}
						}, p.switchLevel = function(p, m) {
							m !== void 0 && p.errorAction && (this.warn("switching to level " + m + " after " + p.details), this.hls.nextAutoLevel = m, p.errorAction.resolved = !0, this.hls.nextLoadLevel = this.hls.nextAutoLevel);
						}, e;
					}(), _n = function() {
						function e(p, m) {
							this.hls = void 0, this.timer = -1, this.requestScheduled = -1, this.canLoad = !1, this.log = void 0, this.warn = void 0, this.log = K.log.bind(K, m + ":"), this.warn = K.warn.bind(K, m + ":"), this.hls = p;
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.clearTimer(), this.hls = this.log = this.warn = null;
						}, p.clearTimer = function() {
							this.timer !== -1 && (self.clearTimeout(this.timer), this.timer = -1);
						}, p.startLoad = function() {
							this.canLoad = !0, this.requestScheduled = -1, this.loadPlaylist();
						}, p.stopLoad = function() {
							this.canLoad = !1, this.clearTimer();
						}, p.switchParams = function(p, m, g) {
							var _ = m?.renditionReports;
							if (_) {
								for (var x = -1, w = 0; w < _.length; w++) {
									var D = _[w], O = void 0;
									try {
										O = new self.URL(D.URI, m.url).href;
									} catch (p) {
										K.warn("Could not construct new URL for Rendition Report: " + p), O = D.URI || "";
									}
									if (O === p) {
										x = w;
										break;
									}
									O === p.substring(0, O.length) && (x = w);
								}
								if (x !== -1) {
									var A = _[x], F = parseInt(A["LAST-MSN"]) || m?.lastPartSn, U = parseInt(A["LAST-PART"]) || m?.lastPartIndex;
									if (this.hls.config.lowLatencyMode) {
										var oe = Math.min(m.age - m.partTarget, m.targetduration);
										U >= 0 && oe > m.partTarget && (U += 1);
									}
									var le = g && Dt(g);
									return new on(F, U >= 0 ? U : void 0, le);
								}
							}
						}, p.loadPlaylist = function(p) {
							this.requestScheduled === -1 && (this.requestScheduled = self.performance.now());
						}, p.shouldLoadPlaylist = function(p) {
							return this.canLoad && !!p && !!p.url && (!p.details || p.details.live);
						}, p.shouldReloadPlaylist = function(p) {
							return this.timer === -1 && this.requestScheduled === -1 && this.shouldLoadPlaylist(p);
						}, p.playlistLoaded = function(p, m, g) {
							var _ = this, x = m.details, w = m.stats, D = self.performance.now(), O = w.loading.first ? Math.max(0, D - w.loading.first) : 0;
							if (x.advancedDateTime = Date.now() - O, x.live || g != null && g.live) {
								if (x.reloaded(g), g && this.log("live playlist " + p + " " + (x.advanced ? "REFRESHED " + x.lastPartSn + "-" + x.lastPartIndex : x.updated ? "UPDATED" : "MISSED")), g && x.fragments.length > 0 && Pt(g, x), !this.canLoad || !x.live) return;
								var A, F = void 0, U = void 0;
								if (x.canBlockReload && x.endSN && x.advanced) {
									var K = this.hls.config.lowLatencyMode, oe = x.lastPartSn, le = x.endSN, ue = x.lastPartIndex, we = oe === le;
									ue === -1 ? F = le + 1 : (F = we ? le + 1 : oe, U = we ? K ? 0 : ue : ue + 1);
									var je = x.age, Ie = je + x.ageHeader, Be = Math.min(Ie - x.partTarget, 1.5 * x.targetduration);
									if (Be > 0) {
										if (g && Be > g.tuneInGoal) this.warn("CDN Tune-in goal increased from: " + g.tuneInGoal + " to: " + Be + " with playlist age: " + x.age), Be = 0;
										else {
											var Ve = Math.floor(Be / x.targetduration);
											F += Ve, U !== void 0 && (U += Math.round(Be % x.targetduration / x.partTarget)), this.log("CDN Tune-in age: " + x.ageHeader + "s last advanced " + je.toFixed(2) + "s goal: " + Be + " skip sn " + Ve + " to part " + U);
										}
										x.tuneInGoal = Be;
									}
									if (A = this.getDeliveryDirectives(x, m.deliveryDirectives, F, U), K || !we) return void this.loadPlaylist(A);
								} else (x.canBlockReload || x.canSkipUntil) && (A = this.getDeliveryDirectives(x, m.deliveryDirectives, F, U));
								var Ue = this.hls.mainForwardBufferInfo, We = Ue ? Ue.end - Ue.len : 0, Ke = function(p, m) {
									m === void 0 && (m = Infinity);
									var g = 1e3 * p.targetduration;
									if (p.updated) {
										var _ = p.fragments;
										if (_.length && 4 * g > m) {
											var x = 1e3 * _[_.length - 1].duration;
											x < g && (g = x);
										}
									} else g /= 2;
									return Math.round(g);
								}(x, 1e3 * (x.edge - We));
								x.updated && D > this.requestScheduled + Ke && (this.requestScheduled = w.loading.start), F !== void 0 && x.canBlockReload ? this.requestScheduled = w.loading.first + Ke - (1e3 * x.partTarget || 1e3) : this.requestScheduled === -1 || this.requestScheduled + Ke < D ? this.requestScheduled = D : this.requestScheduled - D <= 0 && (this.requestScheduled += Ke);
								var qe = this.requestScheduled - D;
								qe = Math.max(0, qe), this.log("reload live playlist " + p + " in " + Math.round(qe) + " ms"), this.timer = self.setTimeout(function() {
									return _.loadPlaylist(A);
								}, qe);
							} else this.clearTimer();
						}, p.getDeliveryDirectives = function(p, m, g, _) {
							var x = Dt(p);
							return m != null && m.skip && p.deltaUpdateFailed && (g = m.msn, _ = m.part, x = nn), new on(g, _, x);
						}, p.checkRetry = function(p) {
							var m = this, g = p.details, _ = Bt(p), x = p.errorAction, w = x || {}, D = w.action, O = w.retryCount, A = O === void 0 ? 0 : O, F = w.retryConfig, U = !!x && !!F && (D === dn || !x.resolved && D === ln);
							if (U) {
								var K;
								if (this.requestScheduled = -1, A >= F.maxNumRetry) return !1;
								if (_ && (K = p.context) != null && K.deliveryDirectives) this.warn("Retrying playlist loading " + (A + 1) + "/" + F.maxNumRetry + " after \"" + g + "\" without delivery-directives"), this.loadPlaylist();
								else {
									var oe = Gt(F, A);
									this.timer = self.setTimeout(function() {
										return m.loadPlaylist();
									}, oe), this.warn("Retrying playlist loading " + (A + 1) + "/" + F.maxNumRetry + " after \"" + g + "\" in " + oe + "ms");
								}
								p.levelRetry = !0, x.resolved = !0;
							}
							return U;
						}, e;
					}(), vn = function() {
						function e(p, m, g) {
							m === void 0 && (m = 0), g === void 0 && (g = 0), this.halfLife = void 0, this.alpha_ = void 0, this.estimate_ = void 0, this.totalWeight_ = void 0, this.halfLife = p, this.alpha_ = p ? Math.exp(Math.log(.5) / p) : 0, this.estimate_ = m, this.totalWeight_ = g;
						}
						var p = e.prototype;
						return p.sample = function(p, m) {
							var g = this.alpha_ ** +p;
							this.estimate_ = m * (1 - g) + g * this.estimate_, this.totalWeight_ += p;
						}, p.getTotalWeight = function() {
							return this.totalWeight_;
						}, p.getEstimate = function() {
							if (this.alpha_) {
								var p = 1 - this.alpha_ ** +this.totalWeight_;
								if (p) return this.estimate_ / p;
							}
							return this.estimate_;
						}, e;
					}(), yn = function() {
						function e(p, m, g, _) {
							_ === void 0 && (_ = 100), this.defaultEstimate_ = void 0, this.minWeight_ = void 0, this.minDelayMs_ = void 0, this.slow_ = void 0, this.fast_ = void 0, this.defaultTTFB_ = void 0, this.ttfb_ = void 0, this.defaultEstimate_ = g, this.minWeight_ = .001, this.minDelayMs_ = 50, this.slow_ = new vn(p), this.fast_ = new vn(m), this.defaultTTFB_ = _, this.ttfb_ = new vn(p);
						}
						var p = e.prototype;
						return p.update = function(p, m) {
							var g = this.slow_, _ = this.fast_, x = this.ttfb_;
							g.halfLife !== p && (this.slow_ = new vn(p, g.getEstimate(), g.getTotalWeight())), _.halfLife !== m && (this.fast_ = new vn(m, _.getEstimate(), _.getTotalWeight())), x.halfLife !== p && (this.ttfb_ = new vn(p, x.getEstimate(), x.getTotalWeight()));
						}, p.sample = function(p, m) {
							var g = (p = Math.max(p, this.minDelayMs_)) / 1e3, _ = 8 * m / g;
							this.fast_.sample(g, _), this.slow_.sample(g, _);
						}, p.sampleTTFB = function(p) {
							var m = p / 1e3, g = Math.sqrt(2) * Math.exp(-(m ** 2) / 2);
							this.ttfb_.sample(g, Math.max(p, 5));
						}, p.canEstimate = function() {
							return this.fast_.getTotalWeight() >= this.minWeight_;
						}, p.getEstimate = function() {
							return this.canEstimate() ? Math.min(this.fast_.getEstimate(), this.slow_.getEstimate()) : this.defaultEstimate_;
						}, p.getEstimateTTFB = function() {
							return this.ttfb_.getTotalWeight() >= this.minWeight_ ? this.ttfb_.getEstimate() : this.defaultTTFB_;
						}, p.destroy = function() {}, e;
					}();
					function ar(p, m) {
						var g = !1, _ = [];
						return p && (g = p !== "SDR", _ = [p]), m && (_ = m.allowedVideoRanges || tn.slice(0), _ = (g = m.preferHDR === void 0 ? function() {
							if (typeof matchMedia == "function") {
								var p = matchMedia("(dynamic-range: high)"), m = matchMedia("bad query");
								if (p.media !== m.media) return !0 === p.matches;
							}
							return !1;
						}() : m.preferHDR) ? _.filter(function(p) {
							return p !== "SDR";
						}) : ["SDR"]), {
							preferHDR: g,
							allowedVideoRanges: _
						};
					}
					function nr(p, m) {
						K.log("[abr] start candidates with \"" + p + "\" ignored because " + m);
					}
					var bn = function() {
						function e(p) {
							var m = this;
							this.hls = void 0, this.lastLevelLoadSec = 0, this.lastLoadedFragLevel = -1, this.firstSelection = -1, this._nextAutoLevel = -1, this.nextAutoLevelKey = "", this.audioTracksByGroup = null, this.codecTiers = null, this.timer = -1, this.fragCurrent = null, this.partCurrent = null, this.bitrateTestDelay = 0, this.bwEstimator = void 0, this._abandonRulesCheck = function() {
								var p = m.fragCurrent, g = m.partCurrent, x = m.hls, w = x.autoLevelEnabled, O = x.media;
								if (p && O) {
									var A = performance.now(), F = g ? g.stats : p.stats, U = g ? g.duration : p.duration, oe = A - F.loading.start, le = x.minAutoLevel;
									if (F.aborted || F.loaded && F.loaded === F.total || p.level <= le) return m.clearTimer(), void (m._nextAutoLevel = -1);
									if (w && !O.paused && O.playbackRate && O.readyState) {
										var ue = x.mainForwardBufferInfo;
										if (ue !== null) {
											var we = m.bwEstimator.getEstimateTTFB(), je = Math.abs(O.playbackRate);
											if (!(oe <= Math.max(we, U / (2 * je) * 1e3))) {
												var Ie = ue.len / je, Be = F.loading.first ? F.loading.first - F.loading.start : -1, Ve = F.loaded && Be > -1, Ue = m.getBwEstimate(), We = x.levels, Ke = We[p.level], qe = F.total || Math.max(F.loaded, Math.round(U * Ke.averageBitrate / 8)), Ye = Ve ? oe - Be : oe;
												Ye < 1 && Ve && (Ye = Math.min(oe, 8 * F.loaded / Ue));
												var tt = Ve ? 1e3 * F.loaded / Ye : 0, nt = tt ? (qe - F.loaded) / tt : 8 * qe / Ue + we / 1e3;
												if (!(nt <= Ie)) {
													var rt, it = tt ? 8 * tt : Ue, at = Infinity;
													for (rt = p.level - 1; rt > le; rt--) {
														var ot = We[rt].maxBitrate;
														if ((at = m.getTimeToLoadFrag(we / 1e3, it, U * ot, !We[rt].details)) < Ie) break;
													}
													if (!(at >= nt || at > 10 * U)) {
														x.nextLoadLevel = x.nextAutoLevel = rt, Ve ? m.bwEstimator.sample(oe - Math.min(we, Be), F.loaded) : m.bwEstimator.sampleTTFB(oe);
														var st = We[rt].maxBitrate;
														m.getBwEstimate() * m.hls.config.abrBandWidthUpFactor > st && m.resetEstimator(st), m.clearTimer(), K.warn("[abr] Fragment " + p.sn + (g ? " part " + g.index : "") + " of level " + p.level + " is loading too slowly;\n      Time to underbuffer: " + Ie.toFixed(3) + " s\n      Estimated load time for current fragment: " + nt.toFixed(3) + " s\n      Estimated load time for down switch fragment: " + at.toFixed(3) + " s\n      TTFB estimate: " + (0 | Be) + " ms\n      Current BW estimate: " + (_(Ue) ? 0 | Ue : "Unknown") + " bps\n      New BW estimate: " + (0 | m.getBwEstimate()) + " bps\n      Switching to level " + rt + " @ " + (0 | st) + " bps"), x.trigger(D.FRAG_LOAD_EMERGENCY_ABORTED, {
															frag: p,
															part: g,
															stats: F
														});
													}
												}
											}
										}
									}
								}
							}, this.hls = p, this.bwEstimator = this.initEstimator(), this.registerListeners();
						}
						var p = e.prototype;
						return p.resetEstimator = function(p) {
							p && (K.log("setting initial bwe to " + p), this.hls.config.abrEwmaDefaultEstimate = p), this.firstSelection = -1, this.bwEstimator = this.initEstimator();
						}, p.initEstimator = function() {
							var p = this.hls.config;
							return new yn(p.abrEwmaSlowVoD, p.abrEwmaFastVoD, p.abrEwmaDefaultEstimate);
						}, p.registerListeners = function() {
							var p = this.hls;
							p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.FRAG_LOADING, this.onFragLoading, this), p.on(D.FRAG_LOADED, this.onFragLoaded, this), p.on(D.FRAG_BUFFERED, this.onFragBuffered, this), p.on(D.LEVEL_SWITCHING, this.onLevelSwitching, this), p.on(D.LEVEL_LOADED, this.onLevelLoaded, this), p.on(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.on(D.MAX_AUTO_LEVEL_UPDATED, this.onMaxAutoLevelUpdated, this), p.on(D.ERROR, this.onError, this);
						}, p.unregisterListeners = function() {
							var p = this.hls;
							p && (p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.FRAG_LOADING, this.onFragLoading, this), p.off(D.FRAG_LOADED, this.onFragLoaded, this), p.off(D.FRAG_BUFFERED, this.onFragBuffered, this), p.off(D.LEVEL_SWITCHING, this.onLevelSwitching, this), p.off(D.LEVEL_LOADED, this.onLevelLoaded, this), p.off(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.off(D.MAX_AUTO_LEVEL_UPDATED, this.onMaxAutoLevelUpdated, this), p.off(D.ERROR, this.onError, this));
						}, p.destroy = function() {
							this.unregisterListeners(), this.clearTimer(), this.hls = this._abandonRulesCheck = null, this.fragCurrent = this.partCurrent = null;
						}, p.onManifestLoading = function(p, m) {
							this.lastLoadedFragLevel = -1, this.firstSelection = -1, this.lastLevelLoadSec = 0, this.fragCurrent = this.partCurrent = null, this.onLevelsUpdated(), this.clearTimer();
						}, p.onLevelsUpdated = function() {
							this.lastLoadedFragLevel > -1 && this.fragCurrent && (this.lastLoadedFragLevel = this.fragCurrent.level), this._nextAutoLevel = -1, this.onMaxAutoLevelUpdated(), this.codecTiers = null, this.audioTracksByGroup = null;
						}, p.onMaxAutoLevelUpdated = function() {
							this.firstSelection = -1, this.nextAutoLevelKey = "";
						}, p.onFragLoading = function(p, m) {
							var g, _ = m.frag;
							this.ignoreFragment(_) || (_.bitrateTest || (this.fragCurrent = _, this.partCurrent = (g = m.part) ?? null), this.clearTimer(), this.timer = self.setInterval(this._abandonRulesCheck, 100));
						}, p.onLevelSwitching = function(p, m) {
							this.clearTimer();
						}, p.onError = function(p, m) {
							if (!m.fatal) switch (m.details) {
								case A.BUFFER_ADD_CODEC_ERROR:
								case A.BUFFER_APPEND_ERROR:
									this.lastLoadedFragLevel = -1, this.firstSelection = -1;
									break;
								case A.FRAG_LOAD_TIMEOUT:
									var g = m.frag, _ = this.fragCurrent, x = this.partCurrent;
									if (g && _ && g.sn === _.sn && g.level === _.level) {
										var w = performance.now(), D = x ? x.stats : g.stats, O = w - D.loading.start, F = D.loading.first ? D.loading.first - D.loading.start : -1;
										if (D.loaded && F > -1) {
											var U = this.bwEstimator.getEstimateTTFB();
											this.bwEstimator.sample(O - Math.min(U, F), D.loaded);
										} else this.bwEstimator.sampleTTFB(O);
									}
							}
						}, p.getTimeToLoadFrag = function(p, m, g, _) {
							return p + g / m + (_ ? this.lastLevelLoadSec : 0);
						}, p.onLevelLoaded = function(p, m) {
							var g = this.hls.config, x = m.stats.loading, w = x.end - x.start;
							_(w) && (this.lastLevelLoadSec = w / 1e3), m.details.live ? this.bwEstimator.update(g.abrEwmaSlowLive, g.abrEwmaFastLive) : this.bwEstimator.update(g.abrEwmaSlowVoD, g.abrEwmaFastVoD);
						}, p.onFragLoaded = function(p, m) {
							var g = m.frag, _ = m.part, x = _ ? _.stats : g.stats;
							if (g.type === At && this.bwEstimator.sampleTTFB(x.loading.first - x.loading.start), !this.ignoreFragment(g)) {
								if (this.clearTimer(), g.level === this._nextAutoLevel && (this._nextAutoLevel = -1), this.firstSelection = -1, this.hls.config.abrMaxWithRealBitrate) {
									var w = _ ? _.duration : g.duration, O = this.hls.levels[g.level], A = (O.loaded ? O.loaded.bytes : 0) + x.loaded, F = (O.loaded ? O.loaded.duration : 0) + w;
									O.loaded = {
										bytes: A,
										duration: F
									}, O.realBitrate = Math.round(8 * A / F);
								}
								if (g.bitrateTest) {
									var U = {
										stats: x,
										frag: g,
										part: _,
										id: g.type
									};
									this.onFragBuffered(D.FRAG_BUFFERED, U), g.bitrateTest = !1;
								} else this.lastLoadedFragLevel = g.level;
							}
						}, p.onFragBuffered = function(p, m) {
							var g = m.frag, _ = m.part, x = _ != null && _.stats.loaded ? _.stats : g.stats;
							if (!x.aborted && !this.ignoreFragment(g)) {
								var w = x.parsing.end - x.loading.start - Math.min(x.loading.first - x.loading.start, this.bwEstimator.getEstimateTTFB());
								this.bwEstimator.sample(w, x.loaded), x.bwEstimate = this.getBwEstimate(), g.bitrateTest ? this.bitrateTestDelay = w / 1e3 : this.bitrateTestDelay = 0;
							}
						}, p.ignoreFragment = function(p) {
							return p.type !== At || p.sn === "initSegment";
						}, p.clearTimer = function() {
							this.timer > -1 && (self.clearInterval(this.timer), this.timer = -1);
						}, p.getAutoLevelKey = function() {
							return this.getBwEstimate() + "_" + this.getStarvationDelay().toFixed(2);
						}, p.getNextABRAutoLevel = function() {
							var p = this.fragCurrent, m = this.partCurrent, g = this.hls, _ = g.maxAutoLevel, x = g.config, w = g.minAutoLevel, D = m ? m.duration : p ? p.duration : 0, O = this.getBwEstimate(), A = this.getStarvationDelay(), F = x.abrBandWidthFactor, U = x.abrBandWidthUpFactor;
							if (A) {
								var oe = this.findBestLevel(O, w, _, A, 0, F, U);
								if (oe >= 0) return oe;
							}
							var le = D ? Math.min(D, x.maxStarvationDelay) : x.maxStarvationDelay;
							if (!A) {
								var ue = this.bitrateTestDelay;
								ue && (le = (D ? Math.min(D, x.maxLoadingDelay) : x.maxLoadingDelay) - ue, K.info("[abr] bitrate test took " + Math.round(1e3 * ue) + "ms, set first fragment max fetchDuration to " + Math.round(1e3 * le) + " ms"), F = U = 1);
							}
							var we = this.findBestLevel(O, w, _, A, le, F, U);
							if (K.info("[abr] " + (A ? "rebuffering expected" : "buffer is empty") + ", optimal quality level " + we), we > -1) return we;
							var je = g.levels[w], Ie = g.levels[g.loadLevel];
							return je?.bitrate < Ie?.bitrate ? w : g.loadLevel;
						}, p.getStarvationDelay = function() {
							var p = this.hls, m = p.media;
							if (!m) return Infinity;
							var g = m && m.playbackRate !== 0 ? Math.abs(m.playbackRate) : 1, _ = p.mainForwardBufferInfo;
							return (_ ? _.len : 0) / g;
						}, p.getBwEstimate = function() {
							return this.bwEstimator.canEstimate() ? this.bwEstimator.getEstimate() : this.hls.config.abrEwmaDefaultEstimate;
						}, p.findBestLevel = function(p, m, g, x, w, D, O) {
							var A, F = this, U = x + w, oe = this.lastLoadedFragLevel, le = oe === -1 ? this.hls.firstLevel : oe, ue = this.fragCurrent, we = this.partCurrent, je = this.hls, Ie = je.levels, Be = je.allAudioTracks, Ve = je.loadLevel, Ue = je.config;
							if (Ie.length === 1) return 0;
							var We, Ke = Ie[le], qe = !(Ke == null || (A = Ke.details) == null || !A.live), Ye = Ve === -1 || oe === -1, tt = "SDR", nt = Ke?.frameRate || 0, rt = Ue.audioPreference, it = Ue.videoPreference;
							if (this.audioTracksByGroup ||= function(p) {
								return p.reduce(function(p, m) {
									var g = p.groups[m.groupId];
									g ||= p.groups[m.groupId] = {
										tracks: [],
										channels: { 2: 0 },
										hasDefault: !1,
										hasAutoSelect: !1
									}, g.tracks.push(m);
									var _ = m.channels || "2";
									return g.channels[_] = (g.channels[_] || 0) + 1, g.hasDefault = g.hasDefault || m.default, g.hasAutoSelect = g.hasAutoSelect || m.autoselect, g.hasDefault && (p.hasDefaultAudio = !0), g.hasAutoSelect && (p.hasAutoSelectAudio = !0), p;
								}, {
									hasDefaultAudio: !1,
									hasAutoSelectAudio: !1,
									groups: {}
								});
							}(Be), Ye) {
								if (this.firstSelection !== -1) return this.firstSelection;
								var at = this.codecTiers ||= function(p, m, g, _) {
									return p.slice(g, _ + 1).reduce(function(p, m) {
										if (!m.codecSet) return p;
										var g = m.audioGroups, _ = p[m.codecSet];
										_ || (p[m.codecSet] = _ = {
											minBitrate: Infinity,
											minHeight: Infinity,
											minFramerate: Infinity,
											maxScore: 0,
											videoRanges: { SDR: 0 },
											channels: { 2: 0 },
											hasDefaultAudio: !g,
											fragmentError: 0
										}), _.minBitrate = Math.min(_.minBitrate, m.bitrate);
										var x = Math.min(m.height, m.width);
										return _.minHeight = Math.min(_.minHeight, x), _.minFramerate = Math.min(_.minFramerate, m.frameRate), _.maxScore = Math.max(_.maxScore, m.score), _.fragmentError += m.fragmentError, _.videoRanges[m.videoRange] = (_.videoRanges[m.videoRange] || 0) + 1, p;
									}, {});
								}(Ie, 0, m, g), ot = function(p, m, g, x, w) {
									for (var D = Object.keys(p), O = x?.channels, A = x?.audioCodec, F = O && parseInt(O) === 2, U = !0, K = !1, oe = Infinity, le = Infinity, ue = Infinity, we = 0, je = [], Ie = ar(m, w), Be = Ie.preferHDR, Ve = Ie.allowedVideoRanges, T = function() {
										var m = p[D[Ue]];
										U = m.channels[2] > 0, oe = Math.min(oe, m.minHeight), le = Math.min(le, m.minFramerate), ue = Math.min(ue, m.minBitrate);
										var g = Ve.filter(function(p) {
											return m.videoRanges[p] > 0;
										});
										g.length > 0 && (K = !0, je = g);
									}, Ue = D.length; Ue--;) T();
									oe = _(oe) ? oe : 0, le = _(le) ? le : 0;
									var We = Math.max(1080, oe), Ke = Math.max(30, le);
									return ue = _(ue) ? ue : g, g = Math.max(ue, g), K || (m = void 0, je = []), {
										codecSet: D.reduce(function(m, _) {
											var x = p[_];
											if (_ === m) return m;
											if (x.minBitrate > g) return nr(_, "min bitrate of " + x.minBitrate + " > current estimate of " + g), m;
											if (!x.hasDefaultAudio) return nr(_, "no renditions with default or auto-select sound found"), m;
											if (A && _.indexOf(A.substring(0, 4)) % 5 != 0) return nr(_, "audio codec preference \"" + A + "\" not found"), m;
											if (O && !F) {
												if (!x.channels[O]) return nr(_, "no renditions with " + O + " channel sound found (channels options: " + Object.keys(x.channels) + ")"), m;
											} else if ((!A || F) && U && x.channels[2] === 0) return nr(_, "no renditions with stereo sound found"), m;
											return x.minHeight > We ? (nr(_, "min resolution of " + x.minHeight + " > maximum of " + We), m) : x.minFramerate > Ke ? (nr(_, "min framerate of " + x.minFramerate + " > maximum of " + Ke), m) : je.some(function(p) {
												return x.videoRanges[p] > 0;
											}) ? x.maxScore < we ? (nr(_, "max score of " + x.maxScore + " < selected max of " + we), m) : m && (Ne(_) >= Ne(m) || x.fragmentError > p[m].fragmentError) ? m : (we = x.maxScore, _) : (nr(_, "no variants with VIDEO-RANGE of " + JSON.stringify(je) + " found"), m);
										}, void 0),
										videoRanges: je,
										preferHDR: Be,
										minFramerate: le,
										minBitrate: ue
									};
								}(at, tt, p, rt, it), st = ot.codecSet, ct = ot.videoRanges, dt = ot.minFramerate, gt = ot.minBitrate, _t = ot.preferHDR;
								We = st, tt = _t ? ct[ct.length - 1] : ct[0], nt = dt, p = Math.max(p, gt), K.log("[abr] picked start tier " + JSON.stringify(ot));
							} else We = Ke?.codecSet, tt = Ke?.videoRange;
							for (var vt, bt = we ? we.duration : ue ? ue.duration : 0, xt = this.bwEstimator.getEstimateTTFB() / 1e3, St = [], G = function() {
								var m, A = Ie[Tt], ue = Tt > le;
								if (!A) return 0;
								if (We && A.codecSet !== We || tt && A.videoRange !== tt || ue && nt > A.frameRate || !ue && nt > 0 && nt < A.frameRate || A.supportedResult && ((m = A.supportedResult.decodingInfoResults) == null || !m[0].smooth)) return St.push(Tt), 0;
								var je, Be = A.details, Ue = (we ? Be?.partTarget : Be?.averagetargetduration) || bt;
								je = ue ? O * p : D * p;
								var rt = bt && x >= 2 * bt && w === 0 ? Ie[Tt].averageBitrate : Ie[Tt].maxBitrate, it = F.getTimeToLoadFrag(xt, je, rt * Ue, Be === void 0);
								if (je >= rt && (Tt === oe || A.loadError === 0 && A.fragmentError === 0) && (it <= xt || !_(it) || qe && !F.bitrateTestDelay || it < U)) {
									var at = F.forcedAutoLevel;
									return Tt === Ve || at !== -1 && at === Ve || (St.length && K.trace("[abr] Skipped level(s) " + St.join(",") + " of " + g + " max with CODECS and VIDEO-RANGE:\"" + Ie[St[0]].codecs + "\" " + Ie[St[0]].videoRange + "; not compatible with \"" + Ke.codecs + "\" " + tt), K.info("[abr] switch candidate:" + le + "->" + Tt + " adjustedbw(" + Math.round(je) + ")-bitrate=" + Math.round(je - rt) + " ttfb:" + xt.toFixed(1) + " avgDuration:" + Ue.toFixed(1) + " maxFetchDuration:" + U.toFixed(1) + " fetchDuration:" + it.toFixed(1) + " firstSelection:" + Ye + " codecSet:" + We + " videoRange:" + tt + " hls.loadLevel:" + Ve)), Ye && (F.firstSelection = Tt), { v: Tt };
								}
							}, Tt = g; Tt >= m; Tt--) if ((vt = G()) !== 0 && vt) return vt.v;
							return -1;
						}, s(e, [
							{
								key: "firstAutoLevel",
								get: function() {
									var p = this.hls, m = p.maxAutoLevel, g = p.minAutoLevel, _ = this.getBwEstimate(), x = this.hls.config.maxStarvationDelay, w = this.findBestLevel(_, g, m, 0, x, 1, 1);
									if (w > -1) return w;
									var D = this.hls.firstLevel, O = Math.min(Math.max(D, g), m);
									return K.warn("[abr] Could not find best starting auto level. Defaulting to first in playlist " + D + " clamped to " + O), O;
								}
							},
							{
								key: "forcedAutoLevel",
								get: function() {
									return this.nextAutoLevelKey ? -1 : this._nextAutoLevel;
								}
							},
							{
								key: "nextAutoLevel",
								get: function() {
									var p = this.forcedAutoLevel, m = this.bwEstimator.canEstimate(), g = this.lastLoadedFragLevel > -1;
									if (!(p === -1 || m && g && this.nextAutoLevelKey !== this.getAutoLevelKey())) return p;
									var _ = m && g ? this.getNextABRAutoLevel() : this.firstAutoLevel;
									if (p !== -1) {
										var x = this.hls.levels;
										if (x.length > Math.max(p, _) && x[p].loadError <= x[_].loadError) return p;
									}
									return this._nextAutoLevel = _, this.nextAutoLevelKey = this.getAutoLevelKey(), _;
								},
								set: function(p) {
									var m = this.hls, g = m.maxAutoLevel, _ = m.minAutoLevel, x = Math.min(Math.max(p, _), g);
									this._nextAutoLevel !== x && (this.nextAutoLevelKey = "", this._nextAutoLevel = x);
								}
							}
						]), e;
					}(), xn = {
						length: 0,
						start: function() {
							return 0;
						},
						end: function() {
							return 0;
						}
					}, Sn = function() {
						function e() {}
						return e.isBuffered = function(p, m) {
							try {
								if (p) {
									for (var g = e.getBuffered(p), _ = 0; _ < g.length; _++) if (m >= g.start(_) && m <= g.end(_)) return !0;
								}
							} catch {}
							return !1;
						}, e.bufferInfo = function(p, m, g) {
							try {
								if (p) {
									var _, x = e.getBuffered(p), w = [];
									for (_ = 0; _ < x.length; _++) w.push({
										start: x.start(_),
										end: x.end(_)
									});
									return this.bufferedInfo(w, m, g);
								}
							} catch {}
							return {
								len: 0,
								start: m,
								end: m,
								nextStart: void 0
							};
						}, e.bufferedInfo = function(p, m, g) {
							m = Math.max(0, m), p.sort(function(p, m) {
								var g = p.start - m.start;
								return g || m.end - p.end;
							});
							var _ = [];
							if (g) for (var x = 0; x < p.length; x++) {
								var w = _.length;
								if (w) {
									var D = _[w - 1].end;
									p[x].start - D < g ? p[x].end > D && (_[w - 1].end = p[x].end) : _.push(p[x]);
								} else _.push(p[x]);
							}
							else _ = p;
							for (var O, A = 0, F = m, U = m, K = 0; K < _.length; K++) {
								var oe = _[K].start, le = _[K].end;
								if (m + g >= oe && m < le) F = oe, A = (U = le) - m;
								else if (m + g < oe) {
									O = oe;
									break;
								}
							}
							return {
								len: A,
								start: F || 0,
								end: U || 0,
								nextStart: O
							};
						}, e.getBuffered = function(p) {
							try {
								return p.buffered;
							} catch (p) {
								return K.log("failed to get media.buffered", p), xn;
							}
						}, e;
					}(), Cn = function() {
						function e(p) {
							this.buffers = void 0, this.queues = {
								video: [],
								audio: [],
								audiovideo: []
							}, this.buffers = p;
						}
						var p = e.prototype;
						return p.append = function(p, m, g) {
							var _ = this.queues[m];
							_.push(p), _.length !== 1 || g || this.executeNext(m);
						}, p.insertAbort = function(p, m) {
							this.queues[m].unshift(p), this.executeNext(m);
						}, p.appendBlocker = function(p) {
							var m, g = new Promise(function(p) {
								m = p;
							}), _ = {
								execute: m,
								onStart: function() {},
								onComplete: function() {},
								onError: function() {}
							};
							return this.append(_, p), g;
						}, p.executeNext = function(p) {
							var m = this.queues[p];
							if (m.length) {
								var g = m[0];
								try {
									g.execute();
								} catch (m) {
									K.warn("[buffer-operation-queue]: Exception executing \"" + p + "\" SourceBuffer operation: " + m), g.onError(m);
									var _ = this.buffers[p];
									_ != null && _.updating || this.shiftAndExecuteNext(p);
								}
							}
						}, p.shiftAndExecuteNext = function(p) {
							this.queues[p].shift(), this.executeNext(p);
						}, p.current = function(p) {
							return this.queues[p][0];
						}, e;
					}(), wn = /(avc[1234]|hvc1|hev1|dvh[1e]|vp09|av01)(?:\.[^.,]+)+/, Tn = function() {
						function e(p) {
							var m = this;
							this.details = null, this._objectUrl = null, this.operationQueue = void 0, this.listeners = void 0, this.hls = void 0, this.bufferCodecEventsExpected = 0, this._bufferCodecEventsTotal = 0, this.media = null, this.mediaSource = null, this.lastMpegAudioChunk = null, this.appendSource = void 0, this.appendErrors = {
								audio: 0,
								video: 0,
								audiovideo: 0
							}, this.tracks = {}, this.pendingTracks = {}, this.sourceBuffer = void 0, this.log = void 0, this.warn = void 0, this.error = void 0, this._onEndStreaming = function(p) {
								m.hls && m.hls.pauseBuffering();
							}, this._onStartStreaming = function(p) {
								m.hls && m.hls.resumeBuffering();
							}, this._onMediaSourceOpen = function() {
								var p = m.media, g = m.mediaSource;
								m.log("Media source opened"), p && (p.removeEventListener("emptied", m._onMediaEmptied), m.updateMediaElementDuration(), m.hls.trigger(D.MEDIA_ATTACHED, {
									media: p,
									mediaSource: g
								})), g && g.removeEventListener("sourceopen", m._onMediaSourceOpen), m.checkPendingTracks();
							}, this._onMediaSourceClose = function() {
								m.log("Media source closed");
							}, this._onMediaSourceEnded = function() {
								m.log("Media source ended");
							}, this._onMediaEmptied = function() {
								var p = m.mediaSrc, g = m._objectUrl;
								p !== g && K.error("Media element src was set while attaching MediaSource (" + g + " > " + p + ")");
							}, this.hls = p;
							var g, _ = "[buffer-controller]";
							this.appendSource = (g = Ce(p.config.preferManagedMediaSource), typeof self < "u" && g === self.ManagedMediaSource), this.log = K.log.bind(K, _), this.warn = K.warn.bind(K, _), this.error = K.error.bind(K, _), this._initSourceBuffer(), this.registerListeners();
						}
						var p = e.prototype;
						return p.hasSourceTypes = function() {
							return this.getSourceBufferTypes().length > 0 || Object.keys(this.pendingTracks).length > 0;
						}, p.destroy = function() {
							this.unregisterListeners(), this.details = null, this.lastMpegAudioChunk = null, this.hls = null;
						}, p.registerListeners = function() {
							var p = this.hls;
							p.on(D.MEDIA_ATTACHING, this.onMediaAttaching, this), p.on(D.MEDIA_DETACHING, this.onMediaDetaching, this), p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.MANIFEST_PARSED, this.onManifestParsed, this), p.on(D.BUFFER_RESET, this.onBufferReset, this), p.on(D.BUFFER_APPENDING, this.onBufferAppending, this), p.on(D.BUFFER_CODECS, this.onBufferCodecs, this), p.on(D.BUFFER_EOS, this.onBufferEos, this), p.on(D.BUFFER_FLUSHING, this.onBufferFlushing, this), p.on(D.LEVEL_UPDATED, this.onLevelUpdated, this), p.on(D.FRAG_PARSED, this.onFragParsed, this), p.on(D.FRAG_CHANGED, this.onFragChanged, this);
						}, p.unregisterListeners = function() {
							var p = this.hls;
							p.off(D.MEDIA_ATTACHING, this.onMediaAttaching, this), p.off(D.MEDIA_DETACHING, this.onMediaDetaching, this), p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.MANIFEST_PARSED, this.onManifestParsed, this), p.off(D.BUFFER_RESET, this.onBufferReset, this), p.off(D.BUFFER_APPENDING, this.onBufferAppending, this), p.off(D.BUFFER_CODECS, this.onBufferCodecs, this), p.off(D.BUFFER_EOS, this.onBufferEos, this), p.off(D.BUFFER_FLUSHING, this.onBufferFlushing, this), p.off(D.LEVEL_UPDATED, this.onLevelUpdated, this), p.off(D.FRAG_PARSED, this.onFragParsed, this), p.off(D.FRAG_CHANGED, this.onFragChanged, this);
						}, p._initSourceBuffer = function() {
							this.sourceBuffer = {}, this.operationQueue = new Cn(this.sourceBuffer), this.listeners = {
								audio: [],
								video: [],
								audiovideo: []
							}, this.appendErrors = {
								audio: 0,
								video: 0,
								audiovideo: 0
							}, this.lastMpegAudioChunk = null;
						}, p.onManifestLoading = function() {
							this.bufferCodecEventsExpected = this._bufferCodecEventsTotal = 0, this.details = null;
						}, p.onManifestParsed = function(p, m) {
							var g = 2;
							m.audio && !m.video || m.altAudio, g = 1, this.bufferCodecEventsExpected = this._bufferCodecEventsTotal = g, this.log(this.bufferCodecEventsExpected + " bufferCodec event(s) expected");
						}, p.onMediaAttaching = function(p, m) {
							var g = this.media = m.media, _ = Ce(this.appendSource);
							if (g && _) {
								var x, w = this.mediaSource = new _();
								this.log("created media source: " + (x = w.constructor)?.name), w.addEventListener("sourceopen", this._onMediaSourceOpen), w.addEventListener("sourceended", this._onMediaSourceEnded), w.addEventListener("sourceclose", this._onMediaSourceClose), this.appendSource && (w.addEventListener("startstreaming", this._onStartStreaming), w.addEventListener("endstreaming", this._onEndStreaming));
								var D = this._objectUrl = self.URL.createObjectURL(w);
								if (this.appendSource) try {
									g.removeAttribute("src");
									var O = self.ManagedMediaSource;
									g.disableRemotePlayback = g.disableRemotePlayback || O && w instanceof O, fr(g), function(p, m) {
										var g = self.document.createElement("source");
										g.type = "video/mp4", g.src = m, p.appendChild(g);
									}(g, D), g.load();
								} catch {
									g.src = D;
								}
								else g.src = D;
								g.addEventListener("emptied", this._onMediaEmptied);
							}
						}, p.onMediaDetaching = function() {
							var p = this.media, m = this.mediaSource, g = this._objectUrl;
							if (m) {
								if (this.log("media source detaching"), m.readyState === "open") try {
									m.endOfStream();
								} catch (p) {
									this.warn("onMediaDetaching: " + p.message + " while calling endOfStream");
								}
								this.onBufferReset(), m.removeEventListener("sourceopen", this._onMediaSourceOpen), m.removeEventListener("sourceended", this._onMediaSourceEnded), m.removeEventListener("sourceclose", this._onMediaSourceClose), this.appendSource && (m.removeEventListener("startstreaming", this._onStartStreaming), m.removeEventListener("endstreaming", this._onEndStreaming)), p && (p.removeEventListener("emptied", this._onMediaEmptied), g && self.URL.revokeObjectURL(g), this.mediaSrc === g ? (p.removeAttribute("src"), this.appendSource && fr(p), p.load()) : this.warn("media|source.src was changed by a third party - skip cleanup")), this.mediaSource = null, this.media = null, this._objectUrl = null, this.bufferCodecEventsExpected = this._bufferCodecEventsTotal, this.pendingTracks = {}, this.tracks = {};
							}
							this.hls.trigger(D.MEDIA_DETACHED, void 0);
						}, p.onBufferReset = function() {
							var p = this;
							this.getSourceBufferTypes().forEach(function(m) {
								p.resetBuffer(m);
							}), this._initSourceBuffer(), this.hls.resumeBuffering();
						}, p.resetBuffer = function(p) {
							var m = this.sourceBuffer[p];
							try {
								var g;
								m && (this.removeBufferListeners(p), this.sourceBuffer[p] = void 0, (g = this.mediaSource) != null && g.sourceBuffers.length && this.mediaSource.removeSourceBuffer(m));
							} catch (m) {
								this.warn("onBufferReset " + p, m);
							}
						}, p.onBufferCodecs = function(p, m) {
							var g = this, _ = this.getSourceBufferTypes().length, x = Object.keys(m);
							if (x.forEach(function(p) {
								if (_) {
									var x = g.tracks[p];
									if (x && typeof x.buffer.changeType == "function") {
										var w, D = m[p], O = D.id, A = D.codec, F = D.levelCodec, U = D.container, K = D.metadata, oe = He(x.codec, x.levelCodec), le = oe?.replace(wn, "$1"), ue = He(A, F), we = (w = ue)?.replace(wn, "$1");
										if (ue && le !== we) {
											p.slice(0, 5) === "audio" && (ue = Ge(ue, g.appendSource));
											var je = U + ";codecs=" + ue;
											g.appendChangeType(p, je), g.log("switching codec " + oe + " to " + ue), g.tracks[p] = {
												buffer: x.buffer,
												codec: A,
												container: U,
												levelCodec: F,
												metadata: K,
												id: O
											};
										}
									}
								} else g.pendingTracks[p] = m[p];
							}), !_) {
								var w = Math.max(this.bufferCodecEventsExpected - 1, 0);
								this.bufferCodecEventsExpected !== w && (this.log(w + " bufferCodec event(s) expected " + x.join(",")), this.bufferCodecEventsExpected = w), this.mediaSource && this.mediaSource.readyState === "open" && this.checkPendingTracks();
							}
						}, p.appendChangeType = function(p, m) {
							var g = this, _ = this.operationQueue, x = {
								execute: function() {
									var x = g.sourceBuffer[p];
									x && (g.log("changing " + p + " sourceBuffer type to " + m), x.changeType(m)), _.shiftAndExecuteNext(p);
								},
								onStart: function() {},
								onComplete: function() {},
								onError: function(m) {
									g.warn("Failed to change " + p + " SourceBuffer type", m);
								}
							};
							_.append(x, p, !!this.pendingTracks[p]);
						}, p.onBufferAppending = function(p, m) {
							var g = this, _ = this.hls, x = this.operationQueue, w = this.tracks, F = m.data, U = m.type, K = m.frag, oe = m.part, le = m.chunkMeta, ue = le.buffering[U], we = self.performance.now();
							ue.start = we;
							var je = K.stats.buffering, Ie = oe ? oe.stats.buffering : null;
							je.start === 0 && (je.start = we), Ie && Ie.start === 0 && (Ie.start = we);
							var Be = w.audio, Ve = !1;
							U === "audio" && Be?.container === "audio/mpeg" && (Ve = !this.lastMpegAudioChunk || le.id === 1 || this.lastMpegAudioChunk.sn !== le.sn, this.lastMpegAudioChunk = le);
							var Ue = K.start, We = {
								execute: function() {
									if (ue.executeStart = self.performance.now(), Ve) {
										var p = g.sourceBuffer[U];
										if (p) {
											var m = Ue - p.timestampOffset;
											Math.abs(m) >= .1 && (g.log("Updating audio SourceBuffer timestampOffset to " + Ue + " (delta: " + m + ") sn: " + K.sn + ")"), p.timestampOffset = Ue);
										}
									}
									g.appendExecutor(F, U);
								},
								onStart: function() {},
								onComplete: function() {
									var p = self.performance.now();
									ue.executeEnd = ue.end = p, je.first === 0 && (je.first = p), Ie && Ie.first === 0 && (Ie.first = p);
									var m = g.sourceBuffer, _ = {};
									for (var x in m) _[x] = Sn.getBuffered(m[x]);
									g.appendErrors[U] = 0, U === "audio" || U === "video" ? g.appendErrors.audiovideo = 0 : (g.appendErrors.audio = 0, g.appendErrors.video = 0), g.hls.trigger(D.BUFFER_APPENDED, {
										type: U,
										frag: K,
										part: oe,
										chunkMeta: le,
										parent: K.type,
										timeRanges: _
									});
								},
								onError: function(p) {
									var m = {
										type: O.MEDIA_ERROR,
										parent: K.type,
										details: A.BUFFER_APPEND_ERROR,
										sourceBufferName: U,
										frag: K,
										part: oe,
										chunkMeta: le,
										error: p,
										err: p,
										fatal: !1
									};
									if (p.code === DOMException.QUOTA_EXCEEDED_ERR) m.details = A.BUFFER_FULL_ERROR;
									else {
										var x = ++g.appendErrors[U];
										m.details = A.BUFFER_APPEND_ERROR, g.warn("Failed " + x + "/" + _.config.appendErrorMaxRetry + " times to append segment in \"" + U + "\" sourceBuffer"), x >= _.config.appendErrorMaxRetry && (m.fatal = !0);
									}
									_.trigger(D.ERROR, m);
								}
							};
							x.append(We, U, !!this.pendingTracks[U]);
						}, p.onBufferFlushing = function(p, m) {
							var g = this, _ = this.operationQueue, a = function(p) {
								return {
									execute: g.removeExecutor.bind(g, p, m.startOffset, m.endOffset),
									onStart: function() {},
									onComplete: function() {
										g.hls.trigger(D.BUFFER_FLUSHED, { type: p });
									},
									onError: function(m) {
										g.warn("Failed to remove from " + p + " SourceBuffer", m);
									}
								};
							};
							m.type ? _.append(a(m.type), m.type) : this.getSourceBufferTypes().forEach(function(p) {
								_.append(a(p), p);
							});
						}, p.onFragParsed = function(p, m) {
							var g = this, _ = m.frag, x = m.part, w = [], O = x ? x.elementaryStreams : _.elementaryStreams;
							O[Be] ? w.push("audiovideo") : (O[je] && w.push("audio"), O[Ie] && w.push("video")), w.length === 0 && this.warn("Fragments must have at least one ElementaryStreamType set. type: " + _.type + " level: " + _.level + " sn: " + _.sn), this.blockBuffers(function() {
								var p = self.performance.now();
								_.stats.buffering.end = p, x && (x.stats.buffering.end = p);
								var m = x ? x.stats : _.stats;
								g.hls.trigger(D.FRAG_BUFFERED, {
									frag: _,
									part: x,
									stats: m,
									id: _.type
								});
							}, w);
						}, p.onFragChanged = function(p, m) {
							this.trimBuffers();
						}, p.onBufferEos = function(p, m) {
							var g = this;
							this.getSourceBufferTypes().reduce(function(p, _) {
								var x = g.sourceBuffer[_];
								return !x || m.type && m.type !== _ || (x.ending = !0, x.ended || (x.ended = !0, g.log(_ + " sourceBuffer now EOS"))), p && !(x && !x.ended);
							}, !0) && (this.log("Queueing mediaSource.endOfStream()"), this.blockBuffers(function() {
								g.getSourceBufferTypes().forEach(function(p) {
									var m = g.sourceBuffer[p];
									m && (m.ending = !1);
								});
								var p = g.mediaSource;
								p && p.readyState === "open" ? (g.log("Calling mediaSource.endOfStream()"), p.endOfStream()) : p && g.log("Could not call mediaSource.endOfStream(). mediaSource.readyState: " + p.readyState);
							}));
						}, p.onLevelUpdated = function(p, m) {
							var g = m.details;
							g.fragments.length && (this.details = g, this.getSourceBufferTypes().length ? this.blockBuffers(this.updateMediaElementDuration.bind(this)) : this.updateMediaElementDuration());
						}, p.trimBuffers = function() {
							var p = this.hls, m = this.details, g = this.media;
							if (g && m !== null && this.getSourceBufferTypes().length) {
								var x = p.config, w = g.currentTime, D = m.levelTargetDuration, O = m.live && x.liveBackBufferLength !== null ? x.liveBackBufferLength : x.backBufferLength;
								if (_(O) && O > 0) {
									var A = Math.max(O, D), F = Math.floor(w / D) * D - A;
									this.flushBackBuffer(w, D, F);
								}
								if (_(x.frontBufferFlushThreshold) && x.frontBufferFlushThreshold > 0) {
									var U = Math.max(x.maxBufferLength, x.frontBufferFlushThreshold), K = Math.max(U, D), oe = Math.floor(w / D) * D + K;
									this.flushFrontBuffer(w, D, oe);
								}
							}
						}, p.flushBackBuffer = function(p, m, g) {
							var _ = this, x = this.details, w = this.sourceBuffer;
							this.getSourceBufferTypes().forEach(function(O) {
								var A = w[O];
								if (A) {
									var F = Sn.getBuffered(A);
									if (F.length > 0 && g > F.start(0)) {
										if (_.hls.trigger(D.BACK_BUFFER_REACHED, { bufferEnd: g }), x != null && x.live) _.hls.trigger(D.LIVE_BACK_BUFFER_REACHED, { bufferEnd: g });
										else if (A.ended && F.end(F.length - 1) - p < 2 * m) return void _.log("Cannot flush " + O + " back buffer while SourceBuffer is in ended state");
										_.hls.trigger(D.BUFFER_FLUSHING, {
											startOffset: 0,
											endOffset: g,
											type: O
										});
									}
								}
							});
						}, p.flushFrontBuffer = function(p, m, g) {
							var _ = this, x = this.sourceBuffer;
							this.getSourceBufferTypes().forEach(function(w) {
								var O = x[w];
								if (O) {
									var A = Sn.getBuffered(O), F = A.length;
									if (F < 2) return;
									var U = A.start(F - 1), K = A.end(F - 1);
									if (g > U || p >= U && p <= K) return;
									if (O.ended && p - K < 2 * m) return void _.log("Cannot flush " + w + " front buffer while SourceBuffer is in ended state");
									_.hls.trigger(D.BUFFER_FLUSHING, {
										startOffset: U,
										endOffset: Infinity,
										type: w
									});
								}
							});
						}, p.updateMediaElementDuration = function() {
							if (this.details && this.media && this.mediaSource && this.mediaSource.readyState === "open") {
								var p = this.details, m = this.hls, g = this.media, x = this.mediaSource, w = p.fragments[0].start + p.totalduration, D = g.duration, O = _(x.duration) ? x.duration : 0;
								p.live && m.config.liveDurationInfinity ? (x.duration = Infinity, this.updateSeekableRange(p)) : (w > O && w > D || !_(D)) && (this.log("Updating Media Source duration to " + w.toFixed(3)), x.duration = w);
							}
						}, p.updateSeekableRange = function(p) {
							var m = this.mediaSource, g = p.fragments;
							if (g.length && p.live && m != null && m.setLiveSeekableRange) {
								var _ = Math.max(0, g[0].start), x = Math.max(_, _ + p.totalduration);
								this.log("Media Source duration is set to " + m.duration + ". Setting seekable range to " + _ + "-" + x + "."), m.setLiveSeekableRange(_, x);
							}
						}, p.checkPendingTracks = function() {
							var p = this.bufferCodecEventsExpected, m = this.operationQueue, g = this.pendingTracks, _ = Object.keys(g).length;
							if (_ && (!p || _ === 2 || "audiovideo" in g)) {
								this.createSourceBuffers(g), this.pendingTracks = {};
								var x = this.getSourceBufferTypes();
								if (x.length) this.hls.trigger(D.BUFFER_CREATED, { tracks: this.tracks }), x.forEach(function(p) {
									m.executeNext(p);
								});
								else {
									var w = Error("could not create source buffer for media codec(s)");
									this.hls.trigger(D.ERROR, {
										type: O.MEDIA_ERROR,
										details: A.BUFFER_INCOMPATIBLE_CODECS_ERROR,
										fatal: !0,
										error: w,
										reason: w.message
									});
								}
							}
						}, p.createSourceBuffers = function(p) {
							var m = this, g = this.sourceBuffer, _ = this.mediaSource;
							if (!_) throw Error("createSourceBuffers called when mediaSource was null");
							var a = function(x) {
								if (!g[x]) {
									var w, F = p[x];
									if (!F) throw Error("source buffer exists for track " + x + ", however track does not");
									var U = (w = F.levelCodec)?.indexOf(",") === -1 ? F.levelCodec : F.codec;
									U && x.slice(0, 5) === "audio" && (U = Ge(U, m.appendSource));
									var K = F.container + ";codecs=" + U;
									m.log("creating sourceBuffer(" + K + ")");
									try {
										var oe = g[x] = _.addSourceBuffer(K), le = x;
										m.addBufferListener(le, "updatestart", m._onSBUpdateStart), m.addBufferListener(le, "updateend", m._onSBUpdateEnd), m.addBufferListener(le, "error", m._onSBUpdateError), m.appendSource && m.addBufferListener(le, "bufferedchange", function(p, g) {
											var _ = g.removedRanges;
											_ != null && _.length && m.hls.trigger(D.BUFFER_FLUSHED, { type: x });
										}), m.tracks[x] = {
											buffer: oe,
											codec: U,
											container: F.container,
											levelCodec: F.levelCodec,
											metadata: F.metadata,
											id: F.id
										};
									} catch (p) {
										m.error("error while trying to add sourceBuffer: " + p.message), m.hls.trigger(D.ERROR, {
											type: O.MEDIA_ERROR,
											details: A.BUFFER_ADD_CODEC_ERROR,
											fatal: !1,
											error: p,
											sourceBufferName: x,
											mimeType: K
										});
									}
								}
							};
							for (var x in p) a(x);
						}, p._onSBUpdateStart = function(p) {
							this.operationQueue.current(p).onStart();
						}, p._onSBUpdateEnd = function(p) {
							var m;
							if ((m = this.mediaSource)?.readyState !== "closed") {
								var g = this.operationQueue;
								g.current(p).onComplete(), g.shiftAndExecuteNext(p);
							} else this.resetBuffer(p);
						}, p._onSBUpdateError = function(p, m) {
							var g, _ = Error(p + " SourceBuffer error. MediaSource readyState: " + (g = this.mediaSource)?.readyState);
							this.error("" + _, m), this.hls.trigger(D.ERROR, {
								type: O.MEDIA_ERROR,
								details: A.BUFFER_APPENDING_ERROR,
								sourceBufferName: p,
								error: _,
								fatal: !1
							});
							var x = this.operationQueue.current(p);
							x && x.onError(_);
						}, p.removeExecutor = function(p, m, g) {
							var x = this.media, w = this.mediaSource, D = this.operationQueue, O = this.sourceBuffer[p];
							if (!x || !w || !O) return this.warn("Attempting to remove from the " + p + " SourceBuffer, but it does not exist"), void D.shiftAndExecuteNext(p);
							var A = _(x.duration) ? x.duration : Infinity, F = _(w.duration) ? w.duration : Infinity, U = Math.max(0, m), K = Math.min(g, A, F);
							K > U && (!O.ending || O.ended) ? (O.ended = !1, this.log("Removing [" + U + "," + K + "] from the " + p + " SourceBuffer"), O.remove(U, K)) : D.shiftAndExecuteNext(p);
						}, p.appendExecutor = function(p, m) {
							var g = this.sourceBuffer[m];
							if (g) g.ended = !1, g.appendBuffer(p);
							else if (!this.pendingTracks[m]) throw Error("Attempting to append to the " + m + " SourceBuffer, but it does not exist");
						}, p.blockBuffers = function(p, m) {
							var g = this;
							if (m === void 0 && (m = this.getSourceBufferTypes()), !m.length) return this.log("Blocking operation requested, but no SourceBuffers exist"), void Promise.resolve().then(p);
							var _ = this.operationQueue, x = m.map(function(p) {
								return _.appendBlocker(p);
							});
							Promise.all(x).then(function() {
								p(), m.forEach(function(p) {
									var m = g.sourceBuffer[p];
									m != null && m.updating || _.shiftAndExecuteNext(p);
								});
							});
						}, p.getSourceBufferTypes = function() {
							return Object.keys(this.sourceBuffer);
						}, p.addBufferListener = function(p, m, g) {
							var _ = this.sourceBuffer[p];
							if (_) {
								var x = g.bind(this, p);
								this.listeners[p].push({
									event: m,
									listener: x
								}), _.addEventListener(m, x);
							}
						}, p.removeBufferListeners = function(p) {
							var m = this.sourceBuffer[p];
							m && this.listeners[p].forEach(function(p) {
								m.removeEventListener(p.event, p.listener);
							});
						}, s(e, [{
							key: "mediaSrc",
							get: function() {
								var p, m, g = ((p = this.media) == null || (m = p.querySelector) == null ? void 0 : m.call(p, "source")) || this.media;
								return g?.src;
							}
						}]), e;
					}();
					function fr(p) {
						var m = p.querySelectorAll("source");
						[].slice.call(m).forEach(function(m) {
							p.removeChild(m);
						});
					}
					var En = function() {
						function e(p) {
							this.hls = void 0, this.autoLevelCapping = void 0, this.firstLevel = void 0, this.media = void 0, this.restrictedLevels = void 0, this.timer = void 0, this.clientRect = void 0, this.streamController = void 0, this.hls = p, this.autoLevelCapping = Infinity, this.firstLevel = -1, this.media = null, this.restrictedLevels = [], this.timer = void 0, this.clientRect = null, this.registerListeners();
						}
						var p = e.prototype;
						return p.setStreamController = function(p) {
							this.streamController = p;
						}, p.destroy = function() {
							this.hls && this.unregisterListener(), this.timer && this.stopCapping(), this.media = null, this.clientRect = null, this.hls = this.streamController = null;
						}, p.registerListeners = function() {
							var p = this.hls;
							p.on(D.FPS_DROP_LEVEL_CAPPING, this.onFpsDropLevelCapping, this), p.on(D.MEDIA_ATTACHING, this.onMediaAttaching, this), p.on(D.MANIFEST_PARSED, this.onManifestParsed, this), p.on(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.on(D.BUFFER_CODECS, this.onBufferCodecs, this), p.on(D.MEDIA_DETACHING, this.onMediaDetaching, this);
						}, p.unregisterListener = function() {
							var p = this.hls;
							p.off(D.FPS_DROP_LEVEL_CAPPING, this.onFpsDropLevelCapping, this), p.off(D.MEDIA_ATTACHING, this.onMediaAttaching, this), p.off(D.MANIFEST_PARSED, this.onManifestParsed, this), p.off(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.off(D.BUFFER_CODECS, this.onBufferCodecs, this), p.off(D.MEDIA_DETACHING, this.onMediaDetaching, this);
						}, p.onFpsDropLevelCapping = function(p, m) {
							var g = this.hls.levels[m.droppedLevel];
							this.isLevelAllowed(g) && this.restrictedLevels.push({
								bitrate: g.bitrate,
								height: g.height,
								width: g.width
							});
						}, p.onMediaAttaching = function(p, m) {
							this.media = m.media instanceof HTMLVideoElement ? m.media : null, this.clientRect = null, this.timer && this.hls.levels.length && this.detectPlayerSize();
						}, p.onManifestParsed = function(p, m) {
							var g = this.hls;
							this.restrictedLevels = [], this.firstLevel = m.firstLevel, g.config.capLevelToPlayerSize && m.video && this.startCapping();
						}, p.onLevelsUpdated = function(p, m) {
							this.timer && _(this.autoLevelCapping) && this.detectPlayerSize();
						}, p.onBufferCodecs = function(p, m) {
							this.hls.config.capLevelToPlayerSize && m.video && this.startCapping();
						}, p.onMediaDetaching = function() {
							this.stopCapping();
						}, p.detectPlayerSize = function() {
							if (this.media) {
								if (this.mediaHeight <= 0 || this.mediaWidth <= 0) return void (this.clientRect = null);
								var p = this.hls.levels;
								if (p.length) {
									var m = this.hls, g = this.getMaxLevel(p.length - 1);
									g !== this.autoLevelCapping && K.log("Setting autoLevelCapping to " + g + ": " + p[g].height + "p@" + p[g].bitrate + " for media " + this.mediaWidth + "x" + this.mediaHeight), m.autoLevelCapping = g, m.autoLevelCapping > this.autoLevelCapping && this.streamController && this.streamController.nextLevelSwitch(), this.autoLevelCapping = m.autoLevelCapping;
								}
							}
						}, p.getMaxLevel = function(p) {
							var m = this, g = this.hls.levels;
							if (!g.length) return -1;
							var _ = g.filter(function(g, _) {
								return m.isLevelAllowed(g) && _ <= p;
							});
							return this.clientRect = null, e.getMaxLevelByMediaSize(_, this.mediaWidth, this.mediaHeight);
						}, p.startCapping = function() {
							this.timer || (this.autoLevelCapping = Infinity, self.clearInterval(this.timer), this.timer = self.setInterval(this.detectPlayerSize.bind(this), 1e3), this.detectPlayerSize());
						}, p.stopCapping = function() {
							this.restrictedLevels = [], this.firstLevel = -1, this.autoLevelCapping = Infinity, this.timer && (self.clearInterval(this.timer), this.timer = void 0);
						}, p.getDimensions = function() {
							if (this.clientRect) return this.clientRect;
							var p = this.media, m = {
								width: 0,
								height: 0
							};
							if (p) {
								var g = p.getBoundingClientRect();
								m.width = g.width, m.height = g.height, m.width || m.height || (m.width = g.right - g.left || p.width || 0, m.height = g.bottom - g.top || p.height || 0);
							}
							return this.clientRect = m, m;
						}, p.isLevelAllowed = function(p) {
							return !this.restrictedLevels.some(function(m) {
								return p.bitrate === m.bitrate && p.width === m.width && p.height === m.height;
							});
						}, e.getMaxLevelByMediaSize = function(p, m, g) {
							if (p == null || !p.length) return -1;
							for (var _, x, w = p.length - 1, D = Math.max(m, g), O = 0; O < p.length; O += 1) {
								var A = p[O];
								if ((A.width >= D || A.height >= D) && (_ = A, !(x = p[O + 1]) || _.width !== x.width || _.height !== x.height)) {
									w = O;
									break;
								}
							}
							return w;
						}, s(e, [
							{
								key: "mediaWidth",
								get: function() {
									return this.getDimensions().width * this.contentScaleFactor;
								}
							},
							{
								key: "mediaHeight",
								get: function() {
									return this.getDimensions().height * this.contentScaleFactor;
								}
							},
							{
								key: "contentScaleFactor",
								get: function() {
									var p = 1;
									if (!this.hls.config.ignoreDevicePixelRatio) try {
										p = self.devicePixelRatio;
									} catch {}
									return p;
								}
							}
						]), e;
					}(), Dn = function() {
						function e(p) {
							this.hls = void 0, this.isVideoPlaybackQualityAvailable = !1, this.timer = void 0, this.media = null, this.lastTime = void 0, this.lastDroppedFrames = 0, this.lastDecodedFrames = 0, this.streamController = void 0, this.hls = p, this.registerListeners();
						}
						var p = e.prototype;
						return p.setStreamController = function(p) {
							this.streamController = p;
						}, p.registerListeners = function() {
							this.hls.on(D.MEDIA_ATTACHING, this.onMediaAttaching, this);
						}, p.unregisterListeners = function() {
							this.hls.off(D.MEDIA_ATTACHING, this.onMediaAttaching, this);
						}, p.destroy = function() {
							this.timer && clearInterval(this.timer), this.unregisterListeners(), this.isVideoPlaybackQualityAvailable = !1, this.media = null;
						}, p.onMediaAttaching = function(p, m) {
							var g = this.hls.config;
							if (g.capLevelOnFPSDrop) {
								var _ = m.media instanceof self.HTMLVideoElement ? m.media : null;
								this.media = _, _ && typeof _.getVideoPlaybackQuality == "function" && (this.isVideoPlaybackQualityAvailable = !0), self.clearInterval(this.timer), this.timer = self.setInterval(this.checkFPSInterval.bind(this), g.fpsDroppedMonitoringPeriod);
							}
						}, p.checkFPS = function(p, m, g) {
							var _ = performance.now();
							if (m) {
								if (this.lastTime) {
									var x = _ - this.lastTime, w = g - this.lastDroppedFrames, O = m - this.lastDecodedFrames, A = 1e3 * w / x, F = this.hls;
									if (F.trigger(D.FPS_DROP, {
										currentDropped: w,
										currentDecoded: O,
										totalDroppedFrames: g
									}), A > 0 && w > F.config.fpsDroppedMonitoringThreshold * O) {
										var U = F.currentLevel;
										K.warn("drop FPS ratio greater than max allowed value for currentLevel: " + U), U > 0 && (F.autoLevelCapping === -1 || F.autoLevelCapping >= U) && (--U, F.trigger(D.FPS_DROP_LEVEL_CAPPING, {
											level: U,
											droppedLevel: F.currentLevel
										}), F.autoLevelCapping = U, this.streamController.nextLevelSwitch());
									}
								}
								this.lastTime = _, this.lastDroppedFrames = g, this.lastDecodedFrames = m;
							}
						}, p.checkFPSInterval = function() {
							var p = this.media;
							if (p) if (this.isVideoPlaybackQualityAvailable) {
								var m = p.getVideoPlaybackQuality();
								this.checkFPS(p, m.totalVideoFrames, m.droppedVideoFrames);
							} else this.checkFPS(p, p.webkitDecodedFrameCount, p.webkitDroppedFrameCount);
						}, e;
					}(), On = function() {
						function e(p) {
							this.hls = void 0, this.log = void 0, this.loader = null, this.uri = null, this.pathwayId = ".", this.pathwayPriority = null, this.timeToLoad = 300, this.reloadTimer = -1, this.updated = 0, this.started = !1, this.enabled = !0, this.levels = null, this.audioTracks = null, this.subtitleTracks = null, this.penalizedPathways = {}, this.hls = p, this.log = K.log.bind(K, "[content-steering]:"), this.registerListeners();
						}
						var p = e.prototype;
						return p.registerListeners = function() {
							var p = this.hls;
							p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.MANIFEST_LOADED, this.onManifestLoaded, this), p.on(D.MANIFEST_PARSED, this.onManifestParsed, this), p.on(D.ERROR, this.onError, this);
						}, p.unregisterListeners = function() {
							var p = this.hls;
							p && (p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.MANIFEST_LOADED, this.onManifestLoaded, this), p.off(D.MANIFEST_PARSED, this.onManifestParsed, this), p.off(D.ERROR, this.onError, this));
						}, p.startLoad = function() {
							if (this.started = !0, this.clearTimeout(), this.enabled && this.uri) {
								if (this.updated) {
									var p = 1e3 * this.timeToLoad - (performance.now() - this.updated);
									if (p > 0) return void this.scheduleRefresh(this.uri, p);
								}
								this.loadSteeringManifest(this.uri);
							}
						}, p.stopLoad = function() {
							this.started = !1, this.loader && (this.loader.destroy(), this.loader = null), this.clearTimeout();
						}, p.clearTimeout = function() {
							this.reloadTimer !== -1 && (self.clearTimeout(this.reloadTimer), this.reloadTimer = -1);
						}, p.destroy = function() {
							this.unregisterListeners(), this.stopLoad(), this.hls = null, this.levels = this.audioTracks = this.subtitleTracks = null;
						}, p.removeLevel = function(p) {
							var m = this.levels;
							m && (this.levels = m.filter(function(m) {
								return m !== p;
							}));
						}, p.onManifestLoading = function() {
							this.stopLoad(), this.enabled = !0, this.timeToLoad = 300, this.updated = 0, this.uri = null, this.pathwayId = ".", this.levels = this.audioTracks = this.subtitleTracks = null;
						}, p.onManifestLoaded = function(p, m) {
							var g = m.contentSteering;
							g !== null && (this.pathwayId = g.pathwayId, this.uri = g.uri, this.started && this.startLoad());
						}, p.onManifestParsed = function(p, m) {
							this.audioTracks = m.audioTracks, this.subtitleTracks = m.subtitleTracks;
						}, p.onError = function(p, m) {
							var g = m.errorAction;
							if (g?.action === ln && g.flags === mn) {
								var _ = this.levels, x = this.pathwayPriority, w = this.pathwayId;
								if (m.context) {
									var D = m.context, O = D.groupId, A = D.pathwayId, F = D.type;
									O && _ ? w = this.getPathwayForGroupId(O, F, w) : A && (w = A);
								}
								w in this.penalizedPathways || (this.penalizedPathways[w] = performance.now()), !x && _ && (x = _.reduce(function(p, m) {
									return p.indexOf(m.pathwayId) === -1 && p.push(m.pathwayId), p;
								}, [])), x && x.length > 1 && (this.updatePathwayPriority(x), g.resolved = this.pathwayId !== w), g.resolved || K.warn("Could not resolve " + m.details + " (\"" + m.error.message + "\") with content-steering for Pathway: " + w + " levels: " + (_ && _.length) + " priorities: " + JSON.stringify(x) + " penalized: " + JSON.stringify(this.penalizedPathways));
							}
						}, p.filterParsedLevels = function(p) {
							this.levels = p;
							var m = this.getLevelsForPathway(this.pathwayId);
							if (m.length === 0) {
								var g = p[0].pathwayId;
								this.log("No levels found in Pathway " + this.pathwayId + ". Setting initial Pathway to \"" + g + "\""), m = this.getLevelsForPathway(g), this.pathwayId = g;
							}
							return m.length !== p.length && this.log("Found " + m.length + "/" + p.length + " levels in Pathway \"" + this.pathwayId + "\""), m;
						}, p.getLevelsForPathway = function(p) {
							return this.levels === null ? [] : this.levels.filter(function(m) {
								return p === m.pathwayId;
							});
						}, p.updatePathwayPriority = function(p) {
							var m;
							this.pathwayPriority = p;
							var g = this.penalizedPathways, _ = performance.now();
							Object.keys(g).forEach(function(p) {
								_ - g[p] > 3e5 && delete g[p];
							});
							for (var x = 0; x < p.length; x++) {
								var w = p[x];
								if (!(w in g)) {
									if (w === this.pathwayId) return;
									var O = this.hls.nextLoadLevel, A = this.hls.levels[O];
									if ((m = this.getLevelsForPathway(w)).length > 0) {
										this.log("Setting Pathway to \"" + w + "\""), this.pathwayId = w, Nt(m), this.hls.trigger(D.LEVELS_UPDATED, { levels: m });
										var F = this.hls.levels[O];
										A && F && this.levels && (F.attrs["STABLE-VARIANT-ID"] !== A.attrs["STABLE-VARIANT-ID"] && F.bitrate !== A.bitrate && this.log("Unstable Pathways change from bitrate " + A.bitrate + " to " + F.bitrate), this.hls.nextLoadLevel = O);
										break;
									}
								}
							}
						}, p.getPathwayForGroupId = function(p, m, g) {
							for (var _ = this.getLevelsForPathway(g).concat(this.levels || []), x = 0; x < _.length; x++) if (m === Tt && _[x].hasAudioGroup(p) || m === kt && _[x].hasSubtitleGroup(p)) return _[x].pathwayId;
							return g;
						}, p.clonePathways = function(p) {
							var m = this, g = this.levels;
							if (g) {
								var _ = {}, x = {};
								p.forEach(function(p) {
									var w = p.ID, D = p["BASE-ID"], O = p["URI-REPLACEMENT"];
									if (!g.some(function(p) {
										return p.pathwayId === w;
									})) {
										var A = m.getLevelsForPathway(D).map(function(p) {
											var m = new ue(p.attrs);
											m["PATHWAY-ID"] = w;
											var g = m.AUDIO && m.AUDIO + "_clone_" + w, D = m.SUBTITLES && m.SUBTITLES + "_clone_" + w;
											g && (_[m.AUDIO] = g, m.AUDIO = g), D && (x[m.SUBTITLES] = D, m.SUBTITLES = D);
											var A = pr(p.uri, m["STABLE-VARIANT-ID"], "PER-VARIANT-URIS", O), F = new sn({
												attrs: m,
												audioCodec: p.audioCodec,
												bitrate: p.bitrate,
												height: p.height,
												name: p.name,
												url: A,
												videoCodec: p.videoCodec,
												width: p.width
											});
											if (p.audioGroups) for (var U = 1; U < p.audioGroups.length; U++) F.addGroupId("audio", p.audioGroups[U] + "_clone_" + w);
											if (p.subtitleGroups) for (var K = 1; K < p.subtitleGroups.length; K++) F.addGroupId("text", p.subtitleGroups[K] + "_clone_" + w);
											return F;
										});
										g.push.apply(g, A), mr(m.audioTracks, _, O, w), mr(m.subtitleTracks, x, O, w);
									}
								});
							}
						}, p.loadSteeringManifest = function(p) {
							var m, g = this, _ = this.hls.config, x = _.loader;
							this.loader && this.loader.destroy(), this.loader = new x(_);
							try {
								m = new self.URL(p);
							} catch {
								return this.enabled = !1, void this.log("Failed to parse Steering Manifest URI: " + p);
							}
							if (m.protocol !== "data:") {
								var w = 0 | (this.hls.bandwidthEstimate || _.abrEwmaDefaultEstimate);
								m.searchParams.set("_HLS_pathway", this.pathwayId), m.searchParams.set("_HLS_throughput", "" + w);
							}
							var O = {
								responseType: "json",
								url: m.href
							}, A = _.steeringManifestLoadPolicy.default, F = A.errorRetry || A.timeoutRetry || {}, U = {
								loadPolicy: A,
								timeout: A.maxLoadTimeMs,
								maxRetry: F.maxNumRetry || 0,
								retryDelay: F.retryDelayMs || 0,
								maxRetryDelay: F.maxRetryDelayMs || 0
							}, K = {
								onSuccess: function(p, _, x, w) {
									g.log("Loaded steering manifest: \"" + m + "\"");
									var O = p.data;
									if (O.VERSION === 1) {
										g.updated = performance.now(), g.timeToLoad = O.TTL;
										var A = O["RELOAD-URI"], F = O["PATHWAY-CLONES"], U = O["PATHWAY-PRIORITY"];
										if (A) try {
											g.uri = new self.URL(A, m).href;
										} catch {
											return g.enabled = !1, void g.log("Failed to parse Steering Manifest RELOAD-URI: " + A);
										}
										g.scheduleRefresh(g.uri || x.url), F && g.clonePathways(F);
										var K = {
											steeringManifest: O,
											url: m.toString()
										};
										g.hls.trigger(D.STEERING_MANIFEST_LOADED, K), U && g.updatePathwayPriority(U);
									} else g.log("Steering VERSION " + O.VERSION + " not supported!");
								},
								onError: function(p, m, _, x) {
									if (g.log("Error loading steering manifest: " + p.code + " " + p.text + " (" + m.url + ")"), g.stopLoad(), p.code === 410) return g.enabled = !1, void g.log("Steering manifest " + m.url + " no longer available");
									var w = 1e3 * g.timeToLoad;
									if (p.code !== 429) g.scheduleRefresh(g.uri || m.url, w);
									else {
										var D = g.loader;
										if (typeof D?.getResponseHeader == "function") {
											var O = D.getResponseHeader("Retry-After");
											O && (w = 1e3 * parseFloat(O));
										}
										g.log("Steering manifest " + m.url + " rate limited");
									}
								},
								onTimeout: function(p, m, _) {
									g.log("Timeout loading steering manifest (" + m.url + ")"), g.scheduleRefresh(g.uri || m.url);
								}
							};
							this.log("Requesting steering manifest: " + m), this.loader.load(O, U, K);
						}, p.scheduleRefresh = function(p, m) {
							var g = this;
							m === void 0 && (m = 1e3 * this.timeToLoad), this.clearTimeout(), this.reloadTimer = self.setTimeout(function() {
								var m, _ = (m = g.hls)?.media;
								!_ || _.ended ? g.scheduleRefresh(p, 1e3 * g.timeToLoad) : g.loadSteeringManifest(p);
							}, m);
						}, e;
					}();
					function mr(p, m, g, _) {
						p && Object.keys(m).forEach(function(x) {
							var w = p.filter(function(p) {
								return p.groupId === x;
							}).map(function(p) {
								var w = o({}, p);
								return w.details = void 0, w.attrs = new ue(w.attrs), w.url = w.attrs.URI = pr(p.url, p.attrs["STABLE-RENDITION-ID"], "PER-RENDITION-URIS", g), w.groupId = w.attrs["GROUP-ID"] = m[x], w.attrs["PATHWAY-ID"] = _, w;
							});
							p.push.apply(p, w);
						});
					}
					function pr(p, m, g, _) {
						var x, w = _.HOST, D = _.PARAMS, O = _[g];
						m && (x = O?.[m]) && (p = x);
						var A = new self.URL(p);
						return w && !x && (A.host = w), D && Object.keys(D).sort().forEach(function(p) {
							p && A.searchParams.set(p, D[p]);
						}), A.href;
					}
					var kn = /^age:\s*[\d.]+\s*$/im, An = function() {
						function e(p) {
							this.xhrSetup = void 0, this.requestTimeout = void 0, this.retryTimeout = void 0, this.retryDelay = void 0, this.config = null, this.callbacks = null, this.context = null, this.loader = null, this.stats = void 0, this.xhrSetup = p && p.xhrSetup || null, this.stats = new P(), this.retryDelay = 0;
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.callbacks = null, this.abortInternal(), this.loader = null, this.config = null, this.context = null, this.xhrSetup = null;
						}, p.abortInternal = function() {
							var p = this.loader;
							self.clearTimeout(this.requestTimeout), self.clearTimeout(this.retryTimeout), p && (p.onreadystatechange = null, p.onprogress = null, p.readyState !== 4 && (this.stats.aborted = !0, p.abort()));
						}, p.abort = function() {
							var p;
							this.abortInternal(), (p = this.callbacks) != null && p.onAbort && this.callbacks.onAbort(this.stats, this.context, this.loader);
						}, p.load = function(p, m, g) {
							if (this.stats.loading.start) throw Error("Loader can only be used once.");
							this.stats.loading.start = self.performance.now(), this.context = p, this.config = m, this.callbacks = g, this.loadInternal();
						}, p.loadInternal = function() {
							var p = this, m = this.config, g = this.context;
							if (m && g) {
								var _ = this.loader = new self.XMLHttpRequest(), x = this.stats;
								x.loading.first = 0, x.loaded = 0, x.aborted = !1;
								var w = this.xhrSetup;
								w ? Promise.resolve().then(function() {
									if (p.loader === _ && !p.stats.aborted) return w(_, g.url);
								}).catch(function(m) {
									if (p.loader === _ && !p.stats.aborted) return _.open("GET", g.url, !0), w(_, g.url);
								}).then(function() {
									p.loader !== _ || p.stats.aborted || p.openAndSendXhr(_, g, m);
								}).catch(function(m) {
									p.callbacks.onError({
										code: _.status,
										text: m.message
									}, g, _, x);
								}) : this.openAndSendXhr(_, g, m);
							}
						}, p.openAndSendXhr = function(p, m, g) {
							p.readyState || p.open("GET", m.url, !0);
							var x = m.headers, w = g.loadPolicy, D = w.maxTimeToFirstByteMs, O = w.maxLoadTimeMs;
							if (x) for (var A in x) p.setRequestHeader(A, x[A]);
							m.rangeEnd && p.setRequestHeader("Range", "bytes=" + m.rangeStart + "-" + (m.rangeEnd - 1)), p.onreadystatechange = this.readystatechange.bind(this), p.onprogress = this.loadprogress.bind(this), p.responseType = m.responseType, self.clearTimeout(this.requestTimeout), g.timeout = D && _(D) ? D : O, this.requestTimeout = self.setTimeout(this.loadtimeout.bind(this), g.timeout), p.send();
						}, p.readystatechange = function() {
							var p = this.context, m = this.loader, g = this.stats;
							if (p && m) {
								var _ = m.readyState, x = this.config;
								if (!g.aborted && _ >= 2 && (g.loading.first === 0 && (g.loading.first = Math.max(self.performance.now(), g.loading.start), x.timeout !== x.loadPolicy.maxLoadTimeMs && (self.clearTimeout(this.requestTimeout), x.timeout = x.loadPolicy.maxLoadTimeMs, this.requestTimeout = self.setTimeout(this.loadtimeout.bind(this), x.loadPolicy.maxLoadTimeMs - (g.loading.first - g.loading.start)))), _ === 4)) {
									self.clearTimeout(this.requestTimeout), m.onreadystatechange = null, m.onprogress = null;
									var w = m.status, D = m.responseType === "text" ? m.responseText : null;
									if (w >= 200 && w < 300) {
										var O = D ?? m.response;
										if (O != null) {
											g.loading.end = Math.max(self.performance.now(), g.loading.first);
											var A = m.responseType === "arraybuffer" ? O.byteLength : O.length;
											if (g.loaded = g.total = A, g.bwEstimate = 8e3 * g.total / (g.loading.end - g.loading.first), !this.callbacks) return;
											var F = this.callbacks.onProgress;
											if (F && F(g, p, O, m), !this.callbacks) return;
											var U = {
												url: m.responseURL,
												data: O,
												code: w
											};
											return void this.callbacks.onSuccess(U, g, p, m);
										}
									}
									var oe = x.loadPolicy.errorRetry;
									Vt(oe, g.retry, !1, {
										url: p.url,
										data: void 0,
										code: w
									}) ? this.retry(oe) : (K.error(w + " while loading " + p.url), this.callbacks.onError({
										code: w,
										text: m.statusText
									}, p, m, g));
								}
							}
						}, p.loadtimeout = function() {
							if (this.config) {
								var p = this.config.loadPolicy.timeoutRetry;
								if (Vt(p, this.stats.retry, !0)) this.retry(p);
								else {
									var m;
									K.warn("timeout while loading " + (m = this.context)?.url);
									var g = this.callbacks;
									g && (this.abortInternal(), g.onTimeout(this.stats, this.context, this.loader));
								}
							}
						}, p.retry = function(p) {
							var m = this.context, g = this.stats;
							this.retryDelay = Gt(p, g.retry), g.retry++, K.warn((status ? "HTTP Status " + status : "Timeout") + " while loading " + m?.url + ", retrying " + g.retry + "/" + p.maxNumRetry + " in " + this.retryDelay + "ms"), this.abortInternal(), this.loader = null, self.clearTimeout(this.retryTimeout), this.retryTimeout = self.setTimeout(this.loadInternal.bind(this), this.retryDelay);
						}, p.loadprogress = function(p) {
							var m = this.stats;
							m.loaded = p.loaded, p.lengthComputable && (m.total = p.total);
						}, p.getCacheAge = function() {
							var p = null;
							if (this.loader && kn.test(this.loader.getAllResponseHeaders())) {
								var m = this.loader.getResponseHeader("age");
								p = m ? parseFloat(m) : null;
							}
							return p;
						}, p.getResponseHeader = function(p) {
							return this.loader && RegExp("^" + p + ":\\s*[\\d.]+\\s*$", "im").test(this.loader.getAllResponseHeaders()) ? this.loader.getResponseHeader(p) : null;
						}, e;
					}(), jn = function() {
						function e() {
							this.chunks = [], this.dataLength = 0;
						}
						var p = e.prototype;
						return p.push = function(p) {
							this.chunks.push(p), this.dataLength += p.length;
						}, p.flush = function() {
							var p, m = this.chunks, g = this.dataLength;
							return m.length ? (p = m.length === 1 ? m[0] : function(p, m) {
								for (var g = new Uint8Array(m), _ = 0, x = 0; x < p.length; x++) {
									var w = p[x];
									g.set(w, _), _ += w.length;
								}
								return g;
							}(m, g), this.reset(), p) : new Uint8Array();
						}, p.reset = function() {
							this.chunks.length = 0, this.dataLength = 0;
						}, e;
					}(), Mn = /(\d+)-(\d+)\/(\d+)/, Nn = function() {
						function e(p) {
							this.fetchSetup = void 0, this.requestTimeout = void 0, this.request = null, this.response = null, this.controller = void 0, this.context = null, this.config = null, this.callbacks = null, this.stats = void 0, this.loader = null, this.fetchSetup = p.fetchSetup || Rr, this.controller = new self.AbortController(), this.stats = new P();
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.loader = this.callbacks = this.context = this.config = this.request = null, this.abortInternal(), this.response = null, this.fetchSetup = this.controller = this.stats = null;
						}, p.abortInternal = function() {
							this.controller && !this.stats.loading.end && (this.stats.aborted = !0, this.controller.abort());
						}, p.abort = function() {
							var p;
							this.abortInternal(), (p = this.callbacks) != null && p.onAbort && this.callbacks.onAbort(this.stats, this.context, this.response);
						}, p.load = function(p, m, g) {
							var x = this, w = this.stats;
							if (w.loading.start) throw Error("Loader can only be used once.");
							w.loading.start = self.performance.now();
							var D = function(p, m) {
								var g = {
									method: "GET",
									mode: "cors",
									credentials: "same-origin",
									signal: m,
									headers: new self.Headers(o({}, p.headers))
								};
								return p.rangeEnd && g.headers.set("Range", "bytes=" + p.rangeStart + "-" + String(p.rangeEnd - 1)), g;
							}(p, this.controller.signal), O = g.onProgress, A = p.responseType === "arraybuffer", F = A ? "byteLength" : "length", U = m.loadPolicy, K = U.maxTimeToFirstByteMs, oe = U.maxLoadTimeMs;
							this.context = p, this.config = m, this.callbacks = g, this.request = this.fetchSetup(p, D), self.clearTimeout(this.requestTimeout), m.timeout = K && _(K) ? K : oe, this.requestTimeout = self.setTimeout(function() {
								x.abortInternal(), g.onTimeout(w, p, x.response);
							}, m.timeout), self.fetch(this.request).then(function(D) {
								x.response = x.loader = D;
								var F = Math.max(self.performance.now(), w.loading.start);
								if (self.clearTimeout(x.requestTimeout), m.timeout = oe, x.requestTimeout = self.setTimeout(function() {
									x.abortInternal(), g.onTimeout(w, p, x.response);
								}, oe - (F - w.loading.start)), !D.ok) {
									var U = D.status, K = D.statusText;
									throw new Fn(K || "fetch, bad network response", U, D);
								}
								return w.loading.first = F, w.total = function(p) {
									var m = p.get("Content-Range");
									if (m) {
										var g = function(p) {
											var m = Mn.exec(p);
											if (m) return parseInt(m[2]) - parseInt(m[1]) + 1;
										}(m);
										if (_(g)) return g;
									}
									var x = p.get("Content-Length");
									if (x) return parseInt(x);
								}(D.headers) || w.total, O && _(m.highWaterMark) ? x.loadProgressively(D, w, p, m.highWaterMark, O) : A ? D.arrayBuffer() : p.responseType === "json" ? D.json() : D.text();
							}).then(function(D) {
								var A = x.response;
								if (!A) throw Error("loader destroyed");
								self.clearTimeout(x.requestTimeout), w.loading.end = Math.max(self.performance.now(), w.loading.first);
								var U = D[F];
								U && (w.loaded = w.total = U);
								var K = {
									url: A.url,
									data: D,
									code: A.status
								};
								O && !_(m.highWaterMark) && O(w, p, D, A), g.onSuccess(K, w, p, A);
							}).catch(function(m) {
								if (self.clearTimeout(x.requestTimeout), !w.aborted) {
									var _ = m && m.code || 0, D = m ? m.message : null;
									g.onError({
										code: _,
										text: D
									}, p, m ? m.details : null, w);
								}
							});
						}, p.getCacheAge = function() {
							var p = null;
							if (this.response) {
								var m = this.response.headers.get("age");
								p = m ? parseFloat(m) : null;
							}
							return p;
						}, p.getResponseHeader = function(p) {
							return this.response ? this.response.headers.get(p) : null;
						}, p.loadProgressively = function(p, m, g, _, x) {
							_ === void 0 && (_ = 0);
							var w = new jn(), D = p.body.getReader();
							return function o() {
								return D.read().then(function(D) {
									if (D.done) return w.dataLength && x(m, g, w.flush(), p), Promise.resolve(new ArrayBuffer(0));
									var O = D.value, A = O.length;
									return m.loaded += A, A < _ || w.dataLength ? (w.push(O), w.dataLength >= _ && x(m, g, w.flush(), p)) : x(m, g, O, p), o();
								}).catch(function() {
									return Promise.reject();
								});
							}();
						}, e;
					}();
					function Rr(p, m) {
						return new self.Request(p.url, m);
					}
					var Pn, Fn = function(p) {
						function t(m, g, _) {
							var x;
							return (x = p.call(this, m) || this).code = void 0, x.details = void 0, x.code = g, x.details = _, x;
						}
						return l(t, p), t;
					}(f(Error)), In = i(i({
						autoStartLoad: !0,
						startPosition: -1,
						defaultAudioCodec: void 0,
						debug: !1,
						capLevelOnFPSDrop: !1,
						capLevelToPlayerSize: !1,
						ignoreDevicePixelRatio: !1,
						preferManagedMediaSource: !0,
						initialLiveManifestSize: 1,
						maxBufferLength: 30,
						backBufferLength: Infinity,
						frontBufferFlushThreshold: Infinity,
						maxBufferSize: 6e7,
						maxBufferHole: .1,
						highBufferWatchdogPeriod: 2,
						nudgeOffset: .1,
						nudgeMaxRetry: 3,
						maxFragLookUpTolerance: .25,
						liveSyncDurationCount: 3,
						liveMaxLatencyDurationCount: Infinity,
						liveSyncDuration: void 0,
						liveMaxLatencyDuration: void 0,
						maxLiveSyncPlaybackRate: 1,
						liveDurationInfinity: !1,
						liveBackBufferLength: null,
						maxMaxBufferLength: 600,
						enableWorker: !0,
						workerPath: null,
						enableSoftwareAES: !0,
						startLevel: void 0,
						startFragPrefetch: !1,
						fpsDroppedMonitoringPeriod: 5e3,
						fpsDroppedMonitoringThreshold: .2,
						appendErrorMaxRetry: 3,
						loader: An,
						fLoader: void 0,
						pLoader: void 0,
						xhrSetup: void 0,
						licenseXhrSetup: void 0,
						licenseResponseCallback: void 0,
						abrController: bn,
						bufferController: Tn,
						capLevelController: En,
						errorController: gn,
						fpsController: Dn,
						stretchShortVideoTrack: !1,
						maxAudioFramesDrift: 1,
						forceKeyFrameOnDiscontinuity: !0,
						abrEwmaFastLive: 3,
						abrEwmaSlowLive: 9,
						abrEwmaFastVoD: 3,
						abrEwmaSlowVoD: 9,
						abrEwmaDefaultEstimate: 5e5,
						abrEwmaDefaultEstimateMax: 5e6,
						abrBandWidthFactor: .95,
						abrBandWidthUpFactor: .7,
						abrMaxWithRealBitrate: !1,
						maxStarvationDelay: 4,
						maxLoadingDelay: 4,
						minAutoBitrate: 0,
						emeEnabled: !1,
						widevineLicenseUrl: void 0,
						drmSystems: {},
						drmSystemOptions: {},
						requestMediaKeySystemAccessFunc: null,
						testBandwidth: !0,
						progressive: !1,
						lowLatencyMode: !0,
						cmcd: void 0,
						enableDateRangeMetadataCues: !0,
						enableEmsgMetadataCues: !0,
						enableID3MetadataCues: !0,
						useMediaCapabilities: !1,
						certLoadPolicy: { default: {
							maxTimeToFirstByteMs: 8e3,
							maxLoadTimeMs: 2e4,
							timeoutRetry: null,
							errorRetry: null
						} },
						keyLoadPolicy: { default: {
							maxTimeToFirstByteMs: 8e3,
							maxLoadTimeMs: 2e4,
							timeoutRetry: {
								maxNumRetry: 1,
								retryDelayMs: 1e3,
								maxRetryDelayMs: 2e4,
								backoff: "linear"
							},
							errorRetry: {
								maxNumRetry: 8,
								retryDelayMs: 1e3,
								maxRetryDelayMs: 2e4,
								backoff: "linear"
							}
						} },
						manifestLoadPolicy: { default: {
							maxTimeToFirstByteMs: Infinity,
							maxLoadTimeMs: 2e4,
							timeoutRetry: {
								maxNumRetry: 2,
								retryDelayMs: 0,
								maxRetryDelayMs: 0
							},
							errorRetry: {
								maxNumRetry: 1,
								retryDelayMs: 1e3,
								maxRetryDelayMs: 8e3
							}
						} },
						playlistLoadPolicy: { default: {
							maxTimeToFirstByteMs: 1e4,
							maxLoadTimeMs: 2e4,
							timeoutRetry: {
								maxNumRetry: 2,
								retryDelayMs: 0,
								maxRetryDelayMs: 0
							},
							errorRetry: {
								maxNumRetry: 2,
								retryDelayMs: 1e3,
								maxRetryDelayMs: 8e3
							}
						} },
						fragLoadPolicy: { default: {
							maxTimeToFirstByteMs: 1e4,
							maxLoadTimeMs: 12e4,
							timeoutRetry: {
								maxNumRetry: 4,
								retryDelayMs: 0,
								maxRetryDelayMs: 0
							},
							errorRetry: {
								maxNumRetry: 6,
								retryDelayMs: 1e3,
								maxRetryDelayMs: 8e3
							}
						} },
						steeringManifestLoadPolicy: { default: {
							maxTimeToFirstByteMs: 1e4,
							maxLoadTimeMs: 2e4,
							timeoutRetry: {
								maxNumRetry: 2,
								retryDelayMs: 0,
								maxRetryDelayMs: 0
							},
							errorRetry: {
								maxNumRetry: 1,
								retryDelayMs: 1e3,
								maxRetryDelayMs: 8e3
							}
						} },
						manifestLoadingTimeOut: 1e4,
						manifestLoadingMaxRetry: 1,
						manifestLoadingRetryDelay: 1e3,
						manifestLoadingMaxRetryTimeout: 64e3,
						levelLoadingTimeOut: 1e4,
						levelLoadingMaxRetry: 4,
						levelLoadingRetryDelay: 1e3,
						levelLoadingMaxRetryTimeout: 64e3,
						fragLoadingTimeOut: 2e4,
						fragLoadingMaxRetry: 6,
						fragLoadingRetryDelay: 1e3,
						fragLoadingMaxRetryTimeout: 64e3
					}, {
						cueHandler: qe,
						enableWebVTT: !1,
						enableIMSC1: !1,
						enableCEA708Captions: !1,
						captionsTextTrack1Label: "English",
						captionsTextTrack1LanguageCode: "en",
						captionsTextTrack2Label: "Spanish",
						captionsTextTrack2LanguageCode: "es",
						captionsTextTrack3Label: "Unknown CC",
						captionsTextTrack3LanguageCode: "",
						captionsTextTrack4Label: "Unknown CC",
						captionsTextTrack4LanguageCode: "",
						renderTextTracksNatively: !0
					}), {}, {
						subtitleStreamController: void 0,
						subtitleTrackController: void 0,
						timelineController: void 0,
						audioStreamController: void 0,
						audioTrackController: void 0,
						emeController: void 0,
						cmcdController: void 0,
						contentSteeringController: On
					});
					function Dr(p) {
						return p && typeof p == "object" ? Array.isArray(p) ? p.map(Dr) : Object.keys(p).reduce(function(m, g) {
							return m[g] = Dr(p[g]), m;
						}, {}) : p;
					}
					function _r(p) {
						var m = p.loader;
						m !== Nn && m !== An ? (K.log("[config]: Custom loader detected, cannot enable progressive streaming"), p.progressive = !1) : function() {
							if (self.fetch && self.AbortController && self.ReadableStream && self.Request) try {
								return new self.ReadableStream({}), !0;
							} catch {}
							return !1;
						}() && (p.loader = Nn, p.progressive = !0, p.enableSoftwareAES = !0, K.log("[config]: Progressive streaming enabled, using FetchLoader"));
					}
					var Ln = function(p) {
						function t(m, g) {
							var _;
							return (_ = p.call(this, m, "[level-controller]") || this)._levels = [], _._firstLevel = -1, _._maxAutoLevel = -1, _._startLevel = void 0, _.currentLevel = null, _.currentLevelIndex = -1, _.manualLevelIndex = -1, _.steering = void 0, _.onParsedComplete = void 0, _.steering = g, _._registerListeners(), _;
						}
						l(t, p);
						var m = t.prototype;
						return m._registerListeners = function() {
							var p = this.hls;
							p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.MANIFEST_LOADED, this.onManifestLoaded, this), p.on(D.LEVEL_LOADED, this.onLevelLoaded, this), p.on(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.on(D.FRAG_BUFFERED, this.onFragBuffered, this), p.on(D.ERROR, this.onError, this);
						}, m._unregisterListeners = function() {
							var p = this.hls;
							p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.MANIFEST_LOADED, this.onManifestLoaded, this), p.off(D.LEVEL_LOADED, this.onLevelLoaded, this), p.off(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.off(D.FRAG_BUFFERED, this.onFragBuffered, this), p.off(D.ERROR, this.onError, this);
						}, m.destroy = function() {
							this._unregisterListeners(), this.steering = null, this.resetLevels(), p.prototype.destroy.call(this);
						}, m.stopLoad = function() {
							this._levels.forEach(function(p) {
								p.loadError = 0, p.fragmentError = 0;
							}), p.prototype.stopLoad.call(this);
						}, m.resetLevels = function() {
							this._startLevel = void 0, this.manualLevelIndex = -1, this.currentLevelIndex = -1, this.currentLevel = null, this._levels = [], this._maxAutoLevel = -1;
						}, m.onManifestLoading = function(p, m) {
							this.resetLevels();
						}, m.onManifestLoaded = function(p, m) {
							var g = this.hls.config.preferManagedMediaSource, _ = [], x = {}, w = {}, D = !1, O = !1, A = !1;
							m.levels.forEach(function(p) {
								var m, F, U = p.attrs, K = p.audioCodec, oe = p.videoCodec;
								(m = K)?.indexOf("mp4a.40.34") !== -1 && (Pn ||= /chrome|firefox/i.test(navigator.userAgent), Pn && (p.audioCodec = K = void 0)), K && (p.audioCodec = K = Ge(K, g)), (F = oe)?.indexOf("avc1") === 0 && (oe = p.videoCodec = function(p) {
									for (var m = p.split(","), g = 0; g < m.length; g++) {
										var _ = m[g].split(".");
										if (_.length > 2) {
											var x = _.shift() + ".";
											x += parseInt(_.shift()).toString(16), x += ("000" + parseInt(_.shift()).toString(16)).slice(-4), m[g] = x;
										}
									}
									return m.join(",");
								}(oe));
								var le = p.width, ue = p.height, we = p.unknownCodecs;
								if (D ||= !(!le || !ue), O ||= !!oe, A ||= !!K, !(we != null && we.length || K && !Pe(K, "audio", g) || oe && !Pe(oe, "video", g))) {
									var je = U.CODECS, Ie = U["FRAME-RATE"], Be = U["HDCP-LEVEL"], Ve = U["PATHWAY-ID"], Ue = U.RESOLUTION, We = U["VIDEO-RANGE"], Ke = (Ve || ".") + "-" + p.bitrate + "-" + Ue + "-" + Ie + "-" + je + "-" + We + "-" + Be;
									if (x[Ke]) if (x[Ke].uri === p.url || p.attrs["PATHWAY-ID"]) x[Ke].addGroupId("audio", U.AUDIO), x[Ke].addGroupId("text", U.SUBTITLES);
									else {
										var qe = w[Ke] += 1;
										p.attrs["PATHWAY-ID"] = Array(qe + 1).join(".");
										var Ye = new sn(p);
										x[Ke] = Ye, _.push(Ye);
									}
									else {
										var tt = new sn(p);
										x[Ke] = tt, w[Ke] = 1, _.push(tt);
									}
								}
							}), this.filterAndSortMediaOptions(_, m, D, O, A);
						}, m.filterAndSortMediaOptions = function(p, m, g, _, x) {
							var w = this, F = [], U = [], K = p;
							if ((g || _) && x && (K = K.filter(function(p) {
								var m, g = p.videoCodec, _ = p.videoRange, x = p.width, w = p.height;
								return (!!g || !(!x || !w)) && !!(m = _) && tn.indexOf(m) > -1;
							})), K.length !== 0) {
								if (m.audioTracks) {
									var oe = this.hls.config.preferManagedMediaSource;
									wr(F = m.audioTracks.filter(function(p) {
										return !p.audioCodec || Pe(p.audioCodec, "audio", oe);
									}));
								}
								m.subtitles && wr(U = m.subtitles);
								var le = K.slice(0);
								K.sort(function(p, m) {
									if (p.attrs["HDCP-LEVEL"] !== m.attrs["HDCP-LEVEL"]) return (p.attrs["HDCP-LEVEL"] || "") > (m.attrs["HDCP-LEVEL"] || "") ? 1 : -1;
									if (g && p.height !== m.height) return p.height - m.height;
									if (p.frameRate !== m.frameRate) return p.frameRate - m.frameRate;
									if (p.videoRange !== m.videoRange) return tn.indexOf(p.videoRange) - tn.indexOf(m.videoRange);
									if (p.videoCodec !== m.videoCodec) {
										var _ = Me(p.videoCodec), x = Me(m.videoCodec);
										if (_ !== x) return x - _;
									}
									if (p.uri === m.uri && p.codecSet !== m.codecSet) {
										var w = Ne(p.codecSet), D = Ne(m.codecSet);
										if (w !== D) return D - w;
									}
									return p.averageBitrate === m.averageBitrate ? 0 : p.averageBitrate - m.averageBitrate;
								});
								var ue = le[0];
								if (this.steering && (K = this.steering.filterParsedLevels(K)).length !== le.length) {
									for (var we = 0; we < le.length; we++) if (le[we].pathwayId === K[0].pathwayId) {
										ue = le[we];
										break;
									}
								}
								this._levels = K;
								for (var je = 0; je < K.length; je++) if (K[je] === ue) {
									var Ie;
									this._firstLevel = je;
									var Be = ue.bitrate, Ve = this.hls.bandwidthEstimate;
									if (this.log("manifest loaded, " + K.length + " level(s) found, first bitrate: " + Be), (Ie = this.hls.userConfig)?.abrEwmaDefaultEstimate === void 0) {
										var Ue = Math.min(Be, this.hls.config.abrEwmaDefaultEstimateMax);
										Ue > Ve && Ve === In.abrEwmaDefaultEstimate && (this.hls.bandwidthEstimate = Ue);
									}
									break;
								}
								var We = x && !_, Ke = {
									levels: K,
									audioTracks: F,
									subtitleTracks: U,
									sessionData: m.sessionData,
									sessionKeys: m.sessionKeys,
									firstLevel: this._firstLevel,
									stats: m.stats,
									audio: x,
									video: _,
									altAudio: !We && F.some(function(p) {
										return !!p.url;
									})
								};
								this.hls.trigger(D.MANIFEST_PARSED, Ke), (this.hls.config.autoStartLoad || this.hls.forceStartLoad) && this.hls.startLoad(this.hls.config.startPosition);
							} else Promise.resolve().then(function() {
								if (w.hls) {
									m.levels.length && w.warn("One or more CODECS in variant not supported: " + JSON.stringify(m.levels[0].attrs));
									var p = Error("no level with compatible codecs found in manifest");
									w.hls.trigger(D.ERROR, {
										type: O.MEDIA_ERROR,
										details: A.MANIFEST_INCOMPATIBLE_CODECS_ERROR,
										fatal: !0,
										url: m.url,
										error: p,
										reason: p.message
									});
								}
							});
						}, m.onError = function(p, m) {
							!m.fatal && m.context && m.context.type === St && m.context.level === this.level && this.checkRetry(m);
						}, m.onFragBuffered = function(p, m) {
							var g = m.frag;
							if (g !== void 0 && g.type === At) {
								var _ = g.elementaryStreams;
								if (!Object.keys(_).some(function(p) {
									return !!_[p];
								})) return;
								var x = this._levels[g.level];
								x != null && x.loadError && (this.log("Resetting level error count of " + x.loadError + " on frag buffered"), x.loadError = 0);
							}
						}, m.onLevelLoaded = function(p, m) {
							var g, _, x = m.level, w = m.details, D = this._levels[x];
							if (!D) return this.warn("Invalid level index " + x), void ((_ = m.deliveryDirectives) != null && _.skip && (w.deltaUpdateFailed = !0));
							x === this.currentLevelIndex ? (D.fragmentError === 0 && (D.loadError = 0), this.playlistLoaded(x, m, D.details)) : (g = m.deliveryDirectives) != null && g.skip && (w.deltaUpdateFailed = !0);
						}, m.loadPlaylist = function(m) {
							p.prototype.loadPlaylist.call(this);
							var g = this.currentLevelIndex, _ = this.currentLevel;
							if (_ && this.shouldLoadPlaylist(_)) {
								var x = _.uri;
								if (m) try {
									x = m.addDirectives(x);
								} catch (p) {
									this.warn("Could not construct new URL with HLS Delivery Directives: " + p);
								}
								var w = _.attrs["PATHWAY-ID"];
								this.log("Loading level index " + g + (m?.msn === void 0 ? "" : " at sn " + m.msn + " part " + m.part) + " with" + (w ? " Pathway " + w : "") + " " + x), this.clearTimer(), this.hls.trigger(D.LEVEL_LOADING, {
									url: x,
									level: g,
									pathwayId: _.attrs["PATHWAY-ID"],
									id: 0,
									deliveryDirectives: m || null
								});
							}
						}, m.removeLevel = function(p) {
							var m, g = this, _ = this._levels.filter(function(m, _) {
								return _ !== p || (g.steering && g.steering.removeLevel(m), m === g.currentLevel && (g.currentLevel = null, g.currentLevelIndex = -1, m.details && m.details.fragments.forEach(function(p) {
									return p.level = -1;
								})), !1);
							});
							Nt(_), this._levels = _, this.currentLevelIndex > -1 && (m = this.currentLevel) != null && m.details && (this.currentLevelIndex = this.currentLevel.details.fragments[0].level), this.hls.trigger(D.LEVELS_UPDATED, { levels: _ });
						}, m.onLevelsUpdated = function(p, m) {
							var g = m.levels;
							this._levels = g;
						}, m.checkMaxAutoUpdated = function() {
							var p = this.hls, m = p.autoLevelCapping, g = p.maxAutoLevel, _ = p.maxHdcpLevel;
							this._maxAutoLevel !== g && (this._maxAutoLevel = g, this.hls.trigger(D.MAX_AUTO_LEVEL_UPDATED, {
								autoLevelCapping: m,
								levels: this.levels,
								maxAutoLevel: g,
								minAutoLevel: this.hls.minAutoLevel,
								maxHdcpLevel: _
							}));
						}, s(t, [
							{
								key: "levels",
								get: function() {
									return this._levels.length === 0 ? null : this._levels;
								}
							},
							{
								key: "level",
								get: function() {
									return this.currentLevelIndex;
								},
								set: function(p) {
									var m = this._levels;
									if (m.length !== 0) {
										if (p < 0 || p >= m.length) {
											var g = Error("invalid level idx"), _ = p < 0;
											if (this.hls.trigger(D.ERROR, {
												type: O.OTHER_ERROR,
												details: A.LEVEL_SWITCH_ERROR,
												level: p,
												fatal: _,
												error: g,
												reason: g.message
											}), _) return;
											p = Math.min(p, m.length - 1);
										}
										var x = this.currentLevelIndex, w = this.currentLevel, F = w ? w.attrs["PATHWAY-ID"] : void 0, U = m[p], K = U.attrs["PATHWAY-ID"];
										if (this.currentLevelIndex = p, this.currentLevel = U, x !== p || !U.details || !w || F !== K) {
											this.log("Switching to level " + p + " (" + (U.height ? U.height + "p " : "") + (U.videoRange ? U.videoRange + " " : "") + (U.codecSet ? U.codecSet + " " : "") + "@" + U.bitrate + ")" + (K ? " with Pathway " + K : "") + " from level " + x + (F ? " with Pathway " + F : ""));
											var oe = {
												level: p,
												attrs: U.attrs,
												details: U.details,
												bitrate: U.bitrate,
												averageBitrate: U.averageBitrate,
												maxBitrate: U.maxBitrate,
												realBitrate: U.realBitrate,
												width: U.width,
												height: U.height,
												codecSet: U.codecSet,
												audioCodec: U.audioCodec,
												videoCodec: U.videoCodec,
												audioGroups: U.audioGroups,
												subtitleGroups: U.subtitleGroups,
												loaded: U.loaded,
												loadError: U.loadError,
												fragmentError: U.fragmentError,
												name: U.name,
												id: U.id,
												uri: U.uri,
												url: U.url,
												urlId: 0,
												audioGroupIds: U.audioGroupIds,
												textGroupIds: U.textGroupIds
											};
											this.hls.trigger(D.LEVEL_SWITCHING, oe);
											var le = U.details;
											if (!le || le.live) {
												var ue = this.switchParams(U.uri, w?.details, le);
												this.loadPlaylist(ue);
											}
										}
									}
								}
							},
							{
								key: "manualLevel",
								get: function() {
									return this.manualLevelIndex;
								},
								set: function(p) {
									this.manualLevelIndex = p, this._startLevel === void 0 && (this._startLevel = p), p !== -1 && (this.level = p);
								}
							},
							{
								key: "firstLevel",
								get: function() {
									return this._firstLevel;
								},
								set: function(p) {
									this._firstLevel = p;
								}
							},
							{
								key: "startLevel",
								get: function() {
									if (this._startLevel === void 0) {
										var p = this.hls.config.startLevel;
										return p === void 0 ? this.hls.firstAutoLevel : p;
									}
									return this._startLevel;
								},
								set: function(p) {
									this._startLevel = p;
								}
							},
							{
								key: "nextLoadLevel",
								get: function() {
									return this.manualLevelIndex === -1 ? this.hls.nextAutoLevel : this.manualLevelIndex;
								},
								set: function(p) {
									this.level = p, this.manualLevelIndex === -1 && (this.hls.nextAutoLevel = p);
								}
							}
						]), t;
					}(_n);
					function wr(p) {
						var m = {};
						p.forEach(function(p) {
							var g = p.groupId || "";
							p.id = m[g] = m[g] || 0, m[g]++;
						});
					}
					var Rn = "NOT_LOADED", zn = "APPENDING", Bn = "PARTIAL", Vn = "OK", Hn = function() {
						function e(p) {
							this.activePartLists = Object.create(null), this.endListFragments = Object.create(null), this.fragments = Object.create(null), this.timeRanges = Object.create(null), this.bufferPadding = .2, this.hls = void 0, this.hasGaps = !1, this.hls = p, this._registerListeners();
						}
						var p = e.prototype;
						return p._registerListeners = function() {
							var p = this.hls;
							p.on(D.BUFFER_APPENDED, this.onBufferAppended, this), p.on(D.FRAG_BUFFERED, this.onFragBuffered, this), p.on(D.FRAG_LOADED, this.onFragLoaded, this);
						}, p._unregisterListeners = function() {
							var p = this.hls;
							p.off(D.BUFFER_APPENDED, this.onBufferAppended, this), p.off(D.FRAG_BUFFERED, this.onFragBuffered, this), p.off(D.FRAG_LOADED, this.onFragLoaded, this);
						}, p.destroy = function() {
							this._unregisterListeners(), this.fragments = this.activePartLists = this.endListFragments = this.timeRanges = null;
						}, p.getAppendedFrag = function(p, m) {
							var g = this.activePartLists[m];
							if (g) for (var _ = g.length; _--;) {
								var x = g[_];
								if (!x) break;
								var w = x.end;
								if (x.start <= p && w !== null && p <= w) return x;
							}
							return this.getBufferedFrag(p, m);
						}, p.getBufferedFrag = function(p, m) {
							for (var g = this.fragments, _ = Object.keys(g), x = _.length; x--;) {
								var w = g[_[x]];
								if (w?.body.type === m && w.buffered) {
									var D = w.body;
									if (D.start <= p && p <= D.end) return D;
								}
							}
							return null;
						}, p.detectEvictedFragments = function(p, m, g, _) {
							var x = this;
							this.timeRanges && (this.timeRanges[p] = m);
							var w = _?.fragment.sn || -1;
							Object.keys(this.fragments).forEach(function(_) {
								var D = x.fragments[_];
								if (D && !(w >= D.body.sn)) if (D.buffered || D.loaded) {
									var O = D.range[p];
									O && O.time.some(function(p) {
										var g = !x.isTimeBuffered(p.startPTS, p.endPTS, m);
										return g && x.removeFragment(D.body), g;
									});
								} else D.body.type === g && x.removeFragment(D.body);
							});
						}, p.detectPartialFragments = function(p) {
							var m = this, g = this.timeRanges, _ = p.frag, x = p.part;
							if (g && _.sn !== "initSegment") {
								var w = Nr(_), D = this.fragments[w];
								if (!(!D || D.buffered && _.gap)) {
									var O = !_.relurl;
									Object.keys(g).forEach(function(p) {
										var w = _.elementaryStreams[p];
										if (w) {
											var A = g[p], F = O || !0 === w.partial;
											D.range[p] = m.getBufferedTimes(_, x, F, A);
										}
									}), D.loaded = null, Object.keys(D.range).length ? (D.buffered = !0, (D.body.endList = _.endList || D.body.endList) && (this.endListFragments[D.body.type] = D), Mr(D) || this.removeParts(_.sn - 1, _.type)) : this.removeFragment(D.body);
								}
							}
						}, p.removeParts = function(p, m) {
							var g = this.activePartLists[m];
							g && (this.activePartLists[m] = g.filter(function(m) {
								return m.fragment.sn >= p;
							}));
						}, p.fragBuffered = function(p, m) {
							var g = Nr(p), _ = this.fragments[g];
							!_ && m && (_ = this.fragments[g] = {
								body: p,
								appendedPTS: null,
								loaded: null,
								buffered: !1,
								range: Object.create(null)
							}, p.gap && (this.hasGaps = !0)), _ && (_.loaded = null, _.buffered = !0);
						}, p.getBufferedTimes = function(p, m, g, _) {
							for (var x = {
								time: [],
								partial: g
							}, w = p.start, D = p.end, O = p.minEndPTS || D, A = p.maxStartPTS || w, F = 0; F < _.length; F++) {
								var U = _.start(F) - this.bufferPadding, K = _.end(F) + this.bufferPadding;
								if (A >= U && O <= K) {
									x.time.push({
										startPTS: Math.max(w, _.start(F)),
										endPTS: Math.min(D, _.end(F))
									});
									break;
								}
								if (w < K && D > U) {
									var oe = Math.max(w, _.start(F)), le = Math.min(D, _.end(F));
									le > oe && (x.partial = !0, x.time.push({
										startPTS: oe,
										endPTS: le
									}));
								} else if (D <= U) break;
							}
							return x;
						}, p.getPartialFragment = function(p) {
							var m, g, _, x = null, w = 0, D = this.bufferPadding, O = this.fragments;
							return Object.keys(O).forEach(function(A) {
								var F = O[A];
								F && Mr(F) && (g = F.body.start - D, _ = F.body.end + D, p >= g && p <= _ && (m = Math.min(p - g, _ - p), w <= m && (x = F.body, w = m)));
							}), x;
						}, p.isEndListAppended = function(p) {
							var m = this.endListFragments[p];
							return m !== void 0 && (m.buffered || Mr(m));
						}, p.getState = function(p) {
							var m = Nr(p), g = this.fragments[m];
							return g ? g.buffered ? Mr(g) ? Bn : Vn : zn : Rn;
						}, p.isTimeBuffered = function(p, m, g) {
							for (var _, x, w = 0; w < g.length; w++) {
								if (_ = g.start(w) - this.bufferPadding, x = g.end(w) + this.bufferPadding, p >= _ && m <= x) return !0;
								if (m <= _) return !1;
							}
							return !1;
						}, p.onFragLoaded = function(p, m) {
							var g = m.frag, _ = m.part;
							if (g.sn !== "initSegment" && !g.bitrateTest) {
								var x = _ ? null : m, w = Nr(g);
								this.fragments[w] = {
									body: g,
									appendedPTS: null,
									loaded: x,
									buffered: !1,
									range: Object.create(null)
								};
							}
						}, p.onBufferAppended = function(p, m) {
							var g = this, _ = m.frag, x = m.part, w = m.timeRanges;
							if (_.sn !== "initSegment") {
								var D = _.type;
								if (x) {
									var O = this.activePartLists[D];
									O || (this.activePartLists[D] = O = []), O.push(x);
								}
								this.timeRanges = w, Object.keys(w).forEach(function(p) {
									var m = w[p];
									g.detectEvictedFragments(p, m, D, x);
								});
							}
						}, p.onFragBuffered = function(p, m) {
							this.detectPartialFragments(m);
						}, p.hasFragment = function(p) {
							var m = Nr(p);
							return !!this.fragments[m];
						}, p.hasParts = function(p) {
							var m;
							return !((m = this.activePartLists[p]) == null || !m.length);
						}, p.removeFragmentsInRange = function(p, m, g, _, x) {
							var w = this;
							_ && !this.hasGaps || Object.keys(this.fragments).forEach(function(D) {
								var O = w.fragments[D];
								if (O) {
									var A = O.body;
									A.type !== g || _ && !A.gap || A.start < m && A.end > p && (O.buffered || x) && w.removeFragment(A);
								}
							});
						}, p.removeFragment = function(p) {
							var m = Nr(p);
							p.stats.loaded = 0, p.clearElementaryStreamInfo();
							var g = this.activePartLists[p.type];
							if (g) {
								var _ = p.sn;
								this.activePartLists[p.type] = g.filter(function(p) {
									return p.fragment.sn !== _;
								});
							}
							delete this.fragments[m], p.endList && delete this.endListFragments[p.type];
						}, p.removeAllFragments = function() {
							this.fragments = Object.create(null), this.endListFragments = Object.create(null), this.activePartLists = Object.create(null), this.hasGaps = !1;
						}, e;
					}();
					function Mr(p) {
						var m, g, _;
						return p.buffered && (p.body.gap || (m = p.range.video)?.partial || (g = p.range.audio)?.partial || (_ = p.range.audiovideo)?.partial);
					}
					function Nr(p) {
						return p.type + "_" + p.level + "_" + p.sn;
					}
					var Un = 2 ** 17, Wn = function() {
						function e(p) {
							this.config = void 0, this.loader = null, this.partLoadTimeout = -1, this.config = p;
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.loader && (this.loader.destroy(), this.loader = null);
						}, p.abort = function() {
							this.loader && this.loader.abort();
						}, p.load = function(p, m) {
							var g = this, _ = p.url;
							if (!_) return Promise.reject(new Gn({
								type: O.NETWORK_ERROR,
								details: A.FRAG_LOAD_ERROR,
								fatal: !1,
								frag: p,
								error: Error("Fragment does not have a " + (_ ? "part list" : "url")),
								networkDetails: null
							}));
							this.abort();
							var x = this.config, w = x.fLoader, D = x.loader;
							return new Promise(function(F, U) {
								if (g.loader && g.loader.destroy(), p.gap) {
									if (p.tagList.some(function(p) {
										return p[0] === "GAP";
									})) return void U(Hr(p));
									p.gap = !1;
								}
								var K = g.loader = p.loader = w ? new w(x) : new D(x), oe = Gr(p), le = Ht(x.fragLoadPolicy.default), ue = {
									loadPolicy: le,
									timeout: le.maxLoadTimeMs,
									maxRetry: 0,
									retryDelay: 0,
									maxRetryDelay: 0,
									highWaterMark: p.sn === "initSegment" ? Infinity : Un
								};
								p.stats = K.stats, K.load(oe, ue, {
									onSuccess: function(m, _, x, w) {
										g.resetLoader(p, K);
										var D = m.data;
										x.resetIV && p.decryptdata && (p.decryptdata.iv = new Uint8Array(D.slice(0, 16)), D = D.slice(16)), F({
											frag: p,
											part: null,
											payload: D,
											networkDetails: w
										});
									},
									onError: function(m, x, w, D) {
										g.resetLoader(p, K), U(new Gn({
											type: O.NETWORK_ERROR,
											details: A.FRAG_LOAD_ERROR,
											fatal: !1,
											frag: p,
											response: i({
												url: _,
												data: void 0
											}, m),
											error: Error("HTTP Error " + m.code + " " + m.text),
											networkDetails: w,
											stats: D
										}));
									},
									onAbort: function(m, _, x) {
										g.resetLoader(p, K), U(new Gn({
											type: O.NETWORK_ERROR,
											details: A.INTERNAL_ABORTED,
											fatal: !1,
											frag: p,
											error: Error("Aborted"),
											networkDetails: x,
											stats: m
										}));
									},
									onTimeout: function(m, _, x) {
										g.resetLoader(p, K), U(new Gn({
											type: O.NETWORK_ERROR,
											details: A.FRAG_LOAD_TIMEOUT,
											fatal: !1,
											frag: p,
											error: Error("Timeout after " + ue.timeout + "ms"),
											networkDetails: x,
											stats: m
										}));
									},
									onProgress: function(g, _, x, w) {
										m && m({
											frag: p,
											part: null,
											payload: x,
											networkDetails: w
										});
									}
								});
							});
						}, p.loadPart = function(p, m, g) {
							var _ = this;
							this.abort();
							var x = this.config, w = x.fLoader, D = x.loader;
							return new Promise(function(F, U) {
								if (_.loader && _.loader.destroy(), p.gap || m.gap) U(Hr(p, m));
								else {
									var K = _.loader = p.loader = w ? new w(x) : new D(x), oe = Gr(p, m), le = Ht(x.fragLoadPolicy.default), ue = {
										loadPolicy: le,
										timeout: le.maxLoadTimeMs,
										maxRetry: 0,
										retryDelay: 0,
										maxRetryDelay: 0,
										highWaterMark: Un
									};
									m.stats = K.stats, K.load(oe, ue, {
										onSuccess: function(x, w, D, O) {
											_.resetLoader(p, K), _.updateStatsFromPart(p, m);
											var A = {
												frag: p,
												part: m,
												payload: x.data,
												networkDetails: O
											};
											g(A), F(A);
										},
										onError: function(g, x, w, D) {
											_.resetLoader(p, K), U(new Gn({
												type: O.NETWORK_ERROR,
												details: A.FRAG_LOAD_ERROR,
												fatal: !1,
												frag: p,
												part: m,
												response: i({
													url: oe.url,
													data: void 0
												}, g),
												error: Error("HTTP Error " + g.code + " " + g.text),
												networkDetails: w,
												stats: D
											}));
										},
										onAbort: function(g, x, w) {
											p.stats.aborted = m.stats.aborted, _.resetLoader(p, K), U(new Gn({
												type: O.NETWORK_ERROR,
												details: A.INTERNAL_ABORTED,
												fatal: !1,
												frag: p,
												part: m,
												error: Error("Aborted"),
												networkDetails: w,
												stats: g
											}));
										},
										onTimeout: function(g, x, w) {
											_.resetLoader(p, K), U(new Gn({
												type: O.NETWORK_ERROR,
												details: A.FRAG_LOAD_TIMEOUT,
												fatal: !1,
												frag: p,
												part: m,
												error: Error("Timeout after " + ue.timeout + "ms"),
												networkDetails: w,
												stats: g
											}));
										}
									});
								}
							});
						}, p.updateStatsFromPart = function(p, m) {
							var g = p.stats, _ = m.stats, x = _.total;
							if (g.loaded += _.loaded, x) {
								var w = Math.round(p.duration / m.duration), D = Math.min(Math.round(g.loaded / x), w), O = (w - D) * Math.round(g.loaded / D);
								g.total = g.loaded + O;
							} else g.total = Math.max(g.loaded, g.total);
							var A = g.loading, F = _.loading;
							A.start ? A.first += F.first - F.start : (A.start = F.start, A.first = F.first), A.end = F.end;
						}, p.resetLoader = function(p, m) {
							p.loader = null, this.loader === m && (self.clearTimeout(this.partLoadTimeout), this.loader = null), m.destroy();
						}, e;
					}();
					function Gr(p, m) {
						m === void 0 && (m = null);
						var g = m || p, x = {
							frag: p,
							part: m,
							responseType: "arraybuffer",
							url: g.url,
							headers: {},
							rangeStart: 0,
							rangeEnd: 0
						}, w = g.byteRangeStartOffset, D = g.byteRangeEndOffset;
						if (_(w) && _(D)) {
							var O, A = w, F = D;
							if (p.sn === "initSegment" && (O = p.decryptdata)?.method === "AES-128") {
								var U = D - w;
								U % 16 && (F = D + (16 - U % 16)), w !== 0 && (x.resetIV = !0, A = w - 16);
							}
							x.rangeStart = A, x.rangeEnd = F;
						}
						return x;
					}
					function Hr(p, m) {
						var g = Error("GAP " + (p.gap ? "tag" : "attribute") + " found"), _ = {
							type: O.MEDIA_ERROR,
							details: A.FRAG_GAP,
							fatal: !1,
							frag: p,
							error: g,
							networkDetails: null
						};
						return m && (_.part = m), (m || p).stats.aborted = !0, new Gn(_);
					}
					var Gn = function(p) {
						function t(m) {
							var g;
							return (g = p.call(this, m.error.message) || this).data = void 0, g.data = m, g;
						}
						return l(t, p), t;
					}(f(Error)), Kn = function() {
						function e(p) {
							this.config = void 0, this.keyUriToKeyInfo = {}, this.emeController = null, this.config = p;
						}
						var p = e.prototype;
						return p.abort = function(p) {
							for (var m in this.keyUriToKeyInfo) {
								var g = this.keyUriToKeyInfo[m].loader;
								if (g) {
									var _;
									if (p && p !== (_ = g.context)?.frag.type) return;
									g.abort();
								}
							}
						}, p.detach = function() {
							for (var p in this.keyUriToKeyInfo) {
								var m = this.keyUriToKeyInfo[p];
								(m.mediaKeySessionContext || m.decryptdata.isCommonEncryption) && delete this.keyUriToKeyInfo[p];
							}
						}, p.destroy = function() {
							for (var p in this.detach(), this.keyUriToKeyInfo) {
								var m = this.keyUriToKeyInfo[p].loader;
								m && m.destroy();
							}
							this.keyUriToKeyInfo = {};
						}, p.createKeyLoadError = function(p, m, g, _, x) {
							return m === void 0 && (m = A.KEY_LOAD_ERROR), new Gn({
								type: O.NETWORK_ERROR,
								details: m,
								fatal: !1,
								frag: p,
								response: x,
								error: g,
								networkDetails: _
							});
						}, p.loadClear = function(p, m) {
							var g = this;
							if (this.emeController && this.config.emeEnabled) for (var _ = p.sn, x = p.cc, n = function() {
								var p = m[w];
								if (x <= p.cc && (_ === "initSegment" || p.sn === "initSegment" || _ < p.sn)) return g.emeController.selectKeySystemFormat(p).then(function(m) {
									p.setKeyFormat(m);
								}), 1;
							}, w = 0; w < m.length && !n(); w++);
						}, p.load = function(p) {
							var m = this;
							return !p.decryptdata && p.encrypted && this.emeController ? this.emeController.selectKeySystemFormat(p).then(function(g) {
								return m.loadInternal(p, g);
							}) : this.loadInternal(p);
						}, p.loadInternal = function(p, m) {
							var g, _;
							m && p.setKeyFormat(m);
							var x = p.decryptdata;
							if (!x) {
								var w = Error(m ? "Expected frag.decryptdata to be defined after setting format " + m : "Missing decryption data on fragment in onKeyLoading");
								return Promise.reject(this.createKeyLoadError(p, A.KEY_LOAD_ERROR, w));
							}
							var D = x.uri;
							if (!D) return Promise.reject(this.createKeyLoadError(p, A.KEY_LOAD_ERROR, Error("Invalid key URI: \"" + D + "\"")));
							var O, F = this.keyUriToKeyInfo[D];
							if ((g = F) != null && g.decryptdata.key) return x.key = F.decryptdata.key, Promise.resolve({
								frag: p,
								keyInfo: F
							});
							if ((_ = F) != null && _.keyLoadPromise) switch ((O = F.mediaKeySessionContext)?.keyStatus) {
								case void 0:
								case "status-pending":
								case "usable":
								case "usable-in-future": return F.keyLoadPromise.then(function(m) {
									return x.key = m.keyInfo.decryptdata.key, {
										frag: p,
										keyInfo: F
									};
								});
							}
							switch (F = this.keyUriToKeyInfo[D] = {
								decryptdata: x,
								keyLoadPromise: null,
								loader: null,
								mediaKeySessionContext: null
							}, x.method) {
								case "ISO-23001-7":
								case "SAMPLE-AES":
								case "SAMPLE-AES-CENC":
								case "SAMPLE-AES-CTR": return x.keyFormat === "identity" ? this.loadKeyHTTP(F, p) : this.loadKeyEME(F, p);
								case "AES-128": return this.loadKeyHTTP(F, p);
								default: return Promise.reject(this.createKeyLoadError(p, A.KEY_LOAD_ERROR, Error("Key supplied with unsupported METHOD: \"" + x.method + "\"")));
							}
						}, p.loadKeyEME = function(p, m) {
							var g = {
								frag: m,
								keyInfo: p
							};
							if (this.emeController && this.config.emeEnabled) {
								var _ = this.emeController.loadKey(g);
								if (_) return (p.keyLoadPromise = _.then(function(m) {
									return p.mediaKeySessionContext = m, g;
								})).catch(function(m) {
									throw p.keyLoadPromise = null, m;
								});
							}
							return Promise.resolve(g);
						}, p.loadKeyHTTP = function(p, m) {
							var g = this, _ = this.config, x = new _.loader(_);
							return m.keyLoader = p.loader = x, p.keyLoadPromise = new Promise(function(w, D) {
								var O = {
									keyInfo: p,
									frag: m,
									responseType: "arraybuffer",
									url: p.decryptdata.uri
								}, F = _.keyLoadPolicy.default, U = {
									loadPolicy: F,
									timeout: F.maxLoadTimeMs,
									maxRetry: 0,
									retryDelay: 0,
									maxRetryDelay: 0
								}, K = {
									onSuccess: function(p, m, _, x) {
										var O = _.frag, F = _.keyInfo, U = _.url;
										if (!O.decryptdata || F !== g.keyUriToKeyInfo[U]) return D(g.createKeyLoadError(O, A.KEY_LOAD_ERROR, Error("after key load, decryptdata unset or changed"), x));
										F.decryptdata.key = O.decryptdata.key = new Uint8Array(p.data), O.keyLoader = null, F.loader = null, w({
											frag: O,
											keyInfo: F
										});
									},
									onError: function(p, _, x, w) {
										g.resetLoader(_), D(g.createKeyLoadError(m, A.KEY_LOAD_ERROR, Error("HTTP Error " + p.code + " loading key " + p.text), x, i({
											url: O.url,
											data: void 0
										}, p)));
									},
									onTimeout: function(p, _, x) {
										g.resetLoader(_), D(g.createKeyLoadError(m, A.KEY_LOAD_TIMEOUT, Error("key loading timed out"), x));
									},
									onAbort: function(p, _, x) {
										g.resetLoader(_), D(g.createKeyLoadError(m, A.INTERNAL_ABORTED, Error("key loading aborted"), x));
									}
								};
								x.load(O, U, K);
							});
						}, p.resetLoader = function(p) {
							var m = p.frag, g = p.keyInfo, _ = p.url, x = g.loader;
							m.keyLoader === x && (m.keyLoader = null, g.loader = null), delete this.keyUriToKeyInfo[_], x && x.destroy();
						}, e;
					}(), qn = function() {
						function e() {
							this._boundTick = void 0, this._tickTimer = null, this._tickInterval = null, this._tickCallCount = 0, this._boundTick = this.tick.bind(this);
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.onHandlerDestroying(), this.onHandlerDestroyed();
						}, p.onHandlerDestroying = function() {
							this.clearNextTick(), this.clearInterval();
						}, p.onHandlerDestroyed = function() {}, p.hasInterval = function() {
							return !!this._tickInterval;
						}, p.hasNextTick = function() {
							return !!this._tickTimer;
						}, p.setInterval = function(p) {
							return !this._tickInterval && (this._tickCallCount = 0, this._tickInterval = self.setInterval(this._boundTick, p), !0);
						}, p.clearInterval = function() {
							return !!this._tickInterval && (self.clearInterval(this._tickInterval), this._tickInterval = null, !0);
						}, p.clearNextTick = function() {
							return !!this._tickTimer && (self.clearTimeout(this._tickTimer), this._tickTimer = null, !0);
						}, p.tick = function() {
							this._tickCallCount++, this._tickCallCount === 1 && (this.doTick(), this._tickCallCount > 1 && this.tickImmediate(), this._tickCallCount = 0);
						}, p.tickImmediate = function() {
							this.clearNextTick(), this._tickTimer = self.setTimeout(this._boundTick, 0);
						}, p.doTick = function() {}, e;
					}(), jr = function(p, m, g, _, x, w) {
						_ === void 0 && (_ = 0), x === void 0 && (x = -1), w === void 0 && (w = !1), this.level = void 0, this.sn = void 0, this.part = void 0, this.id = void 0, this.size = void 0, this.partial = void 0, this.transmuxing = {
							start: 0,
							executeStart: 0,
							executeEnd: 0,
							end: 0
						}, this.buffering = {
							audio: {
								start: 0,
								executeStart: 0,
								executeEnd: 0,
								end: 0
							},
							video: {
								start: 0,
								executeStart: 0,
								executeEnd: 0,
								end: 0
							},
							audiovideo: {
								start: 0,
								executeStart: 0,
								executeEnd: 0,
								end: 0
							}
						}, this.level = p, this.sn = m, this.id = g, this.size = _, this.part = x, this.partial = w;
					};
					function Yr(p, m) {
						for (var g = 0, _ = p.length; g < _; g++) {
							var x;
							if ((x = p[g])?.cc === m) return p[g];
						}
						return null;
					}
					function qr(p, m) {
						if (p) {
							var g = p.start + m;
							p.start = p.startPTS = g, p.endPTS = g + p.duration;
						}
					}
					function zr(p, m) {
						for (var g = m.fragments, _ = 0, x = g.length; _ < x; _++) qr(g[_], p);
						m.fragmentHint && qr(m.fragmentHint, p), m.alignedSliding = !0;
					}
					function Xr(p, m, g) {
						m && (function(p, m, g) {
							if (function(p, m, g) {
								return !(!m || !(g.endCC > g.startCC || p && p.cc < g.startCC));
							}(p, g, m)) {
								var x = function(p, m) {
									var g = p.fragments, _ = m.fragments;
									if (_.length && g.length) {
										var x = Yr(g, _[0].cc);
										if (x && (!x || x.startPTS)) return x;
										K.log("No frag in previous level to align on");
									} else K.log("No fragments to align");
								}(g, m);
								x && _(x.start) && (K.log("Adjusting PTS using last level due to CC increase within current level " + m.url), zr(x.start, m));
							}
						}(p, g, m), !g.alignedSliding && m && function(p, m) {
							if (p.hasProgramDateTime && m.hasProgramDateTime) {
								var g, _, x = p.fragments, w = m.fragments;
								if (x.length && w.length) {
									var D = Math.min(m.endCC, p.endCC);
									m.startCC < D && p.startCC < D && (g = Yr(w, D), _ = Yr(x, D)), g && _ || (_ = Yr(x, (g = w[Math.floor(w.length / 2)]).cc) || x[Math.floor(x.length / 2)]);
									var O = g.programDateTime, A = _.programDateTime;
									O && A && zr((A - O) / 1e3 - (_.start - g.start), p);
								}
							}
						}(g, m), g.alignedSliding || !m || g.skippedSegments || Ft(m, g));
					}
					var Jn = function() {
						function e(p, m) {
							this.subtle = void 0, this.aesIV = void 0, this.subtle = p, this.aesIV = m;
						}
						return e.prototype.decrypt = function(p, m) {
							return this.subtle.decrypt({
								name: "AES-CBC",
								iv: this.aesIV
							}, m, p);
						}, e;
					}(), Yn = function() {
						function e(p, m) {
							this.subtle = void 0, this.key = void 0, this.subtle = p, this.key = m;
						}
						return e.prototype.expandKey = function() {
							return this.subtle.importKey("raw", this.key, { name: "AES-CBC" }, !1, ["encrypt", "decrypt"]);
						}, e;
					}(), Xn = function() {
						function e() {
							this.rcon = [
								0,
								1,
								2,
								4,
								8,
								16,
								32,
								64,
								128,
								27,
								54
							], this.subMix = [
								new Uint32Array(256),
								new Uint32Array(256),
								new Uint32Array(256),
								new Uint32Array(256)
							], this.invSubMix = [
								new Uint32Array(256),
								new Uint32Array(256),
								new Uint32Array(256),
								new Uint32Array(256)
							], this.sBox = new Uint32Array(256), this.invSBox = new Uint32Array(256), this.key = new Uint32Array(), this.ksRows = 0, this.keySize = 0, this.keySchedule = void 0, this.invKeySchedule = void 0, this.initTable();
						}
						var p = e.prototype;
						return p.uint8ArrayToUint32Array_ = function(p) {
							for (var m = new DataView(p), g = new Uint32Array(4), _ = 0; _ < 4; _++) g[_] = m.getUint32(4 * _);
							return g;
						}, p.initTable = function() {
							var p = this.sBox, m = this.invSBox, g = this.subMix, _ = g[0], x = g[1], w = g[2], D = g[3], O = this.invSubMix, A = O[0], F = O[1], U = O[2], K = O[3], oe = new Uint32Array(256), le = 0, ue = 0, we = 0;
							for (we = 0; we < 256; we++) oe[we] = we < 128 ? we << 1 : we << 1 ^ 283;
							for (we = 0; we < 256; we++) {
								var je = ue ^ ue << 1 ^ ue << 2 ^ ue << 3 ^ ue << 4;
								je = je >>> 8 ^ 255 & je ^ 99, p[le] = je, m[je] = le;
								var Ie = oe[le], Be = oe[Ie], Ve = oe[Be], Ue = 257 * oe[je] ^ 16843008 * je;
								_[le] = Ue << 24 | Ue >>> 8, x[le] = Ue << 16 | Ue >>> 16, w[le] = Ue << 8 | Ue >>> 24, D[le] = Ue, Ue = 16843009 * Ve ^ 65537 * Be ^ 257 * Ie ^ 16843008 * le, A[je] = Ue << 24 | Ue >>> 8, F[je] = Ue << 16 | Ue >>> 16, U[je] = Ue << 8 | Ue >>> 24, K[je] = Ue, le ? (le = Ie ^ oe[oe[oe[Ve ^ Ie]]], ue ^= oe[oe[ue]]) : le = ue = 1;
							}
						}, p.expandKey = function(p) {
							for (var m = this.uint8ArrayToUint32Array_(p), g = !0, _ = 0; _ < m.length && g;) g = m[_] === this.key[_], _++;
							if (!g) {
								this.key = m;
								var x = this.keySize = m.length;
								if (x !== 4 && x !== 6 && x !== 8) throw Error("Invalid aes key size=" + x);
								var w, D, O, A, F = this.ksRows = 4 * (x + 6 + 1), U = this.keySchedule = new Uint32Array(F), K = this.invKeySchedule = new Uint32Array(F), oe = this.sBox, le = this.rcon, ue = this.invSubMix, we = ue[0], je = ue[1], Ie = ue[2], Be = ue[3];
								for (w = 0; w < F; w++) w < x ? O = U[w] = m[w] : (A = O, w % x == 0 ? (A = oe[(A = A << 8 | A >>> 24) >>> 24] << 24 | oe[A >>> 16 & 255] << 16 | oe[A >>> 8 & 255] << 8 | oe[255 & A], A ^= le[w / x | 0] << 24) : x > 6 && w % x == 4 && (A = oe[A >>> 24] << 24 | oe[A >>> 16 & 255] << 16 | oe[A >>> 8 & 255] << 8 | oe[255 & A]), U[w] = O = (U[w - x] ^ A) >>> 0);
								for (D = 0; D < F; D++) w = F - D, A = 3 & D ? U[w] : U[w - 4], K[D] = D < 4 || w <= 4 ? A : we[oe[A >>> 24]] ^ je[oe[A >>> 16 & 255]] ^ Ie[oe[A >>> 8 & 255]] ^ Be[oe[255 & A]], K[D] = K[D] >>> 0;
							}
						}, p.networkToHostOrderSwap = function(p) {
							return p << 24 | (65280 & p) << 8 | (16711680 & p) >> 8 | p >>> 24;
						}, p.decrypt = function(p, m, g) {
							for (var _, x, w, D, O, A, F, U, K, oe, le, ue, we, je, Ie = this.keySize + 6, Be = this.invKeySchedule, Ve = this.invSBox, Ue = this.invSubMix, We = Ue[0], Ke = Ue[1], qe = Ue[2], Ye = Ue[3], tt = this.uint8ArrayToUint32Array_(g), nt = tt[0], rt = tt[1], it = tt[2], at = tt[3], ot = new Int32Array(p), st = new Int32Array(ot.length), ct = this.networkToHostOrderSwap; m < ot.length;) {
								for (K = ct(ot[m]), oe = ct(ot[m + 1]), le = ct(ot[m + 2]), ue = ct(ot[m + 3]), O = K ^ Be[0], A = ue ^ Be[1], F = le ^ Be[2], U = oe ^ Be[3], we = 4, je = 1; je < Ie; je++) _ = We[O >>> 24] ^ Ke[A >> 16 & 255] ^ qe[F >> 8 & 255] ^ Ye[255 & U] ^ Be[we], x = We[A >>> 24] ^ Ke[F >> 16 & 255] ^ qe[U >> 8 & 255] ^ Ye[255 & O] ^ Be[we + 1], w = We[F >>> 24] ^ Ke[U >> 16 & 255] ^ qe[O >> 8 & 255] ^ Ye[255 & A] ^ Be[we + 2], D = We[U >>> 24] ^ Ke[O >> 16 & 255] ^ qe[A >> 8 & 255] ^ Ye[255 & F] ^ Be[we + 3], O = _, A = x, F = w, U = D, we += 4;
								_ = Ve[O >>> 24] << 24 ^ Ve[A >> 16 & 255] << 16 ^ Ve[F >> 8 & 255] << 8 ^ Ve[255 & U] ^ Be[we], x = Ve[A >>> 24] << 24 ^ Ve[F >> 16 & 255] << 16 ^ Ve[U >> 8 & 255] << 8 ^ Ve[255 & O] ^ Be[we + 1], w = Ve[F >>> 24] << 24 ^ Ve[U >> 16 & 255] << 16 ^ Ve[O >> 8 & 255] << 8 ^ Ve[255 & A] ^ Be[we + 2], D = Ve[U >>> 24] << 24 ^ Ve[O >> 16 & 255] << 16 ^ Ve[A >> 8 & 255] << 8 ^ Ve[255 & F] ^ Be[we + 3], st[m] = ct(_ ^ nt), st[m + 1] = ct(D ^ rt), st[m + 2] = ct(w ^ it), st[m + 3] = ct(x ^ at), nt = K, rt = oe, it = le, at = ue, m += 4;
							}
							return st.buffer;
						}, e;
					}(), Zn = function() {
						function e(p, m) {
							var g = (m === void 0 ? {} : m).removePKCS7Padding, _ = g === void 0 || g;
							if (this.logEnabled = !0, this.removePKCS7Padding = void 0, this.subtle = null, this.softwareDecrypter = null, this.key = null, this.fastAesKey = null, this.remainderData = null, this.currentIV = null, this.currentResult = null, this.useSoftware = void 0, this.useSoftware = p.enableSoftwareAES, this.removePKCS7Padding = _, _) try {
								var x = self.crypto;
								x && (this.subtle = x.subtle || x.webkitSubtle);
							} catch {}
							this.useSoftware = !this.subtle;
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.subtle = null, this.softwareDecrypter = null, this.key = null, this.fastAesKey = null, this.remainderData = null, this.currentIV = null, this.currentResult = null;
						}, p.isSync = function() {
							return this.useSoftware;
						}, p.flush = function() {
							var p = this.currentResult, m = this.remainderData;
							if (!p || m) return this.reset(), null;
							var g, _, x, w = new Uint8Array(p);
							return this.reset(), this.removePKCS7Padding ? (_ = (g = w).byteLength, (x = _ && new DataView(g.buffer).getUint8(_ - 1)) ? V(g, 0, _ - x) : g) : w;
						}, p.reset = function() {
							this.currentResult = null, this.currentIV = null, this.remainderData = null, this.softwareDecrypter &&= null;
						}, p.decrypt = function(p, m, g) {
							var _ = this;
							return this.useSoftware ? new Promise(function(x, w) {
								_.softwareDecrypt(new Uint8Array(p), m, g);
								var D = _.flush();
								D ? x(D.buffer) : w(Error("[softwareDecrypt] Failed to decrypt data"));
							}) : this.webCryptoDecrypt(new Uint8Array(p), m, g);
						}, p.softwareDecrypt = function(p, m, g) {
							var _ = this.currentIV, x = this.currentResult, w = this.remainderData;
							this.logOnce("JS AES decrypt"), w && (p = be(w, p), this.remainderData = null);
							var D = this.getValidChunk(p);
							if (!D.length) return null;
							_ && (g = _);
							var O = this.softwareDecrypter;
							O ||= this.softwareDecrypter = new Xn(), O.expandKey(m);
							var A = x;
							return this.currentResult = O.decrypt(D.buffer, 0, g), this.currentIV = V(D, -16).buffer, A || null;
						}, p.webCryptoDecrypt = function(p, m, g) {
							var _ = this;
							if (this.key !== m || !this.fastAesKey) {
								if (!this.subtle) return Promise.resolve(this.onWebCryptoError(p, m, g));
								this.key = m, this.fastAesKey = new Yn(this.subtle, m);
							}
							return this.fastAesKey.expandKey().then(function(m) {
								return _.subtle ? (_.logOnce("WebCrypto AES decrypt"), new Jn(_.subtle, new Uint8Array(g)).decrypt(p.buffer, m)) : Promise.reject(Error("web crypto not initialized"));
							}).catch(function(x) {
								return K.warn("[decrypter]: WebCrypto Error, disable WebCrypto API, " + x.name + ": " + x.message), _.onWebCryptoError(p, m, g);
							});
						}, p.onWebCryptoError = function(p, m, g) {
							this.useSoftware = !0, this.logEnabled = !0, this.softwareDecrypt(p, m, g);
							var _ = this.flush();
							if (_) return _.buffer;
							throw Error("WebCrypto and softwareDecrypt: failed to decrypt data");
						}, p.getValidChunk = function(p) {
							var m = p, g = p.length - p.length % 16;
							return g !== p.length && (m = V(p, 0, g), this.remainderData = V(p, g)), m;
						}, p.logOnce = function(p) {
							this.logEnabled && (K.log("[decrypter]: " + p), this.logEnabled = !1);
						}, e;
					}(), ei = function(p) {
						for (var m = "", g = p.length, _ = 0; _ < g; _++) m += "[" + p.start(_).toFixed(3) + "-" + p.end(_).toFixed(3) + "]";
						return m;
					}, Qn = "STOPPED", $n = "IDLE", er = "KEY_LOADING", tr = "FRAG_LOADING", rr = "FRAG_LOADING_WAITING_RETRY", ir = "PARSING", or = "PARSED", sr = "ENDED", cr = "ERROR", lr = "WAITING_LEVEL", ur = function(p) {
						function t(m, g, _, x, w) {
							var O;
							return (O = p.call(this) || this).hls = void 0, O.fragPrevious = null, O.fragCurrent = null, O.fragmentTracker = void 0, O.transmuxer = null, O._state = Qn, O.playlistType = void 0, O.media = null, O.mediaBuffer = null, O.config = void 0, O.bitrateTest = !1, O.lastCurrentTime = 0, O.nextLoadPosition = 0, O.startPosition = 0, O.startTimeOffset = null, O.loadedmetadata = !1, O.retryDate = 0, O.levels = null, O.fragmentLoader = void 0, O.keyLoader = void 0, O.levelLastLoaded = null, O.startFragRequested = !1, O.decrypter = void 0, O.initPTS = [], O.buffering = !0, O.onvseeking = null, O.onvended = null, O.logPrefix = "", O.log = void 0, O.warn = void 0, O.playlistType = w, O.logPrefix = x, O.log = K.log.bind(K, x + ":"), O.warn = K.warn.bind(K, x + ":"), O.hls = m, O.fragmentLoader = new Wn(m.config), O.keyLoader = _, O.fragmentTracker = g, O.config = m.config, O.decrypter = new Zn(m.config), m.on(D.MANIFEST_LOADED, O.onManifestLoaded, function(p) {
								if (p === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
								return p;
							}(O)), O;
						}
						l(t, p);
						var m = t.prototype;
						return m.doTick = function() {
							this.onTickEnd();
						}, m.onTickEnd = function() {}, m.startLoad = function(p) {}, m.stopLoad = function() {
							this.fragmentLoader.abort(), this.keyLoader.abort(this.playlistType);
							var p = this.fragCurrent;
							p != null && p.loader && (p.abortRequests(), this.fragmentTracker.removeFragment(p)), this.resetTransmuxer(), this.fragCurrent = null, this.fragPrevious = null, this.clearInterval(), this.clearNextTick(), this.state = Qn;
						}, m.pauseBuffering = function() {
							this.buffering = !1;
						}, m.resumeBuffering = function() {
							this.buffering = !0;
						}, m._streamEnded = function(p, m) {
							if (m.live || p.nextStart || !p.end || !this.media) return !1;
							var g = m.partList;
							if (g != null && g.length) {
								var _ = g[g.length - 1];
								return Sn.isBuffered(this.media, _.start + _.duration / 2);
							}
							var x = m.fragments[m.fragments.length - 1].type;
							return this.fragmentTracker.isEndListAppended(x);
						}, m.getLevelDetails = function() {
							var p;
							if (this.levels && this.levelLastLoaded !== null) return (p = this.levelLastLoaded)?.details;
						}, m.onMediaAttached = function(p, m) {
							var g = this.media = this.mediaBuffer = m.media;
							this.onvseeking = this.onMediaSeeking.bind(this), this.onvended = this.onMediaEnded.bind(this), g.addEventListener("seeking", this.onvseeking), g.addEventListener("ended", this.onvended);
							var _ = this.config;
							this.levels && _.autoStartLoad && this.state === Qn && this.startLoad(_.startPosition);
						}, m.onMediaDetaching = function() {
							var p = this.media;
							p != null && p.ended && (this.log("MSE detaching and video ended, reset startPosition"), this.startPosition = this.lastCurrentTime = 0), p && this.onvseeking && this.onvended && (p.removeEventListener("seeking", this.onvseeking), p.removeEventListener("ended", this.onvended), this.onvseeking = this.onvended = null), this.keyLoader && this.keyLoader.detach(), this.media = this.mediaBuffer = null, this.loadedmetadata = !1, this.fragmentTracker.removeAllFragments(), this.stopLoad();
						}, m.onMediaSeeking = function() {
							var p = this.config, m = this.fragCurrent, g = this.media, x = this.mediaBuffer, w = this.state, D = g ? g.currentTime : 0, O = Sn.bufferInfo(x || g, D, p.maxBufferHole);
							if (this.log("media seeking to " + (_(D) ? D.toFixed(3) : D) + ", state: " + w), this.state === sr) this.resetLoadingState();
							else if (m) {
								var A = p.maxFragLookUpTolerance, F = m.start - A, U = m.start + m.duration + A;
								if (!O.len || U < O.start || F > O.end) {
									var K = D > U;
									(D < F || K) && (K && m.loader && (this.log("seeking outside of buffer while fragment load in progress, cancel fragment load"), m.abortRequests(), this.resetLoadingState()), this.fragPrevious = null);
								}
							}
							g && (this.fragmentTracker.removeFragmentsInRange(D, Infinity, this.playlistType, !0), this.lastCurrentTime = D), this.loadedmetadata || O.len || (this.nextLoadPosition = this.startPosition = D), this.tickImmediate();
						}, m.onMediaEnded = function() {
							this.startPosition = this.lastCurrentTime = 0;
						}, m.onManifestLoaded = function(p, m) {
							this.startTimeOffset = m.startTimeOffset, this.initPTS = [];
						}, m.onHandlerDestroying = function() {
							this.hls.off(D.MANIFEST_LOADED, this.onManifestLoaded, this), this.stopLoad(), p.prototype.onHandlerDestroying.call(this), this.hls = null;
						}, m.onHandlerDestroyed = function() {
							this.state = Qn, this.fragmentLoader && this.fragmentLoader.destroy(), this.keyLoader && this.keyLoader.destroy(), this.decrypter && this.decrypter.destroy(), this.hls = this.log = this.warn = this.decrypter = this.keyLoader = this.fragmentLoader = this.fragmentTracker = null, p.prototype.onHandlerDestroyed.call(this);
						}, m.loadFragment = function(p, m, g) {
							this._loadFragForPlayback(p, m, g);
						}, m._loadFragForPlayback = function(p, m, g) {
							var _ = this;
							this._doFragLoad(p, m, g, function(m) {
								if (_.fragContextChanged(p)) return _.warn("Fragment " + p.sn + (m.part ? " p: " + m.part.index : "") + " of level " + p.level + " was dropped during download."), void _.fragmentTracker.removeFragment(p);
								p.stats.chunkCount++, _._handleFragmentLoadProgress(m);
							}).then(function(m) {
								if (m) {
									var g = _.state;
									_.fragContextChanged(p) ? (g === tr || !_.fragCurrent && g === ir) && (_.fragmentTracker.removeFragment(p), _.state = $n) : ("payload" in m && (_.log("Loaded fragment " + p.sn + " of level " + p.level), _.hls.trigger(D.FRAG_LOADED, m)), _._handleFragmentLoadComplete(m));
								}
							}).catch(function(m) {
								_.state !== Qn && _.state !== cr && (_.warn("Frag error: " + (m?.message || m)), _.resetFragmentLoading(p));
							});
						}, m.clearTrackerIfNeeded = function(p) {
							var m, g = this.fragmentTracker;
							if (g.getState(p) === zn) {
								var _ = p.type, x = this.getFwdBufferInfo(this.mediaBuffer, _), w = Math.max(p.duration, x ? x.len : this.config.maxBufferLength), D = this.backtrackFragment;
								((D ? p.sn - D.sn : 0) == 1 || this.reduceMaxBufferLength(w, p.duration)) && g.removeFragment(p);
							} else (m = this.mediaBuffer)?.buffered.length === 0 ? g.removeAllFragments() : g.hasParts(p.type) && (g.detectPartialFragments({
								frag: p,
								part: null,
								stats: p.stats,
								id: p.type
							}), g.getState(p) === Bn && g.removeFragment(p));
						}, m.checkLiveUpdate = function(p) {
							if (p.updated && !p.live) {
								var m = p.fragments[p.fragments.length - 1];
								this.fragmentTracker.detectPartialFragments({
									frag: m,
									part: null,
									stats: m.stats,
									id: m.type
								});
							}
							p.fragments[0] || (p.deltaUpdateFailed = !0);
						}, m.flushMainBuffer = function(p, m, g) {
							if (g === void 0 && (g = null), p - m) {
								var _ = {
									startOffset: p,
									endOffset: m,
									type: g
								};
								this.hls.trigger(D.BUFFER_FLUSHING, _);
							}
						}, m._loadInitSegment = function(p, m) {
							var g = this;
							this._doFragLoad(p, m).then(function(m) {
								if (!m || g.fragContextChanged(p) || !g.levels) throw Error("init load aborted");
								return m;
							}).then(function(m) {
								var _ = g.hls, x = m.payload, w = p.decryptdata;
								if (x && x.byteLength > 0 && w != null && w.key && w.iv && w.method === "AES-128") {
									var F = self.performance.now();
									return g.decrypter.decrypt(new Uint8Array(x), w.key.buffer, w.iv.buffer).catch(function(m) {
										throw _.trigger(D.ERROR, {
											type: O.MEDIA_ERROR,
											details: A.FRAG_DECRYPT_ERROR,
											fatal: !1,
											error: m,
											reason: m.message,
											frag: p
										}), m;
									}).then(function(x) {
										var w = self.performance.now();
										return _.trigger(D.FRAG_DECRYPTED, {
											frag: p,
											payload: x,
											stats: {
												tstart: F,
												tdecrypt: w
											}
										}), m.payload = x, g.completeInitSegmentLoad(m);
									});
								}
								return g.completeInitSegmentLoad(m);
							}).catch(function(m) {
								g.state !== Qn && g.state !== cr && (g.warn(m), g.resetFragmentLoading(p));
							});
						}, m.completeInitSegmentLoad = function(p) {
							if (!this.levels) throw Error("init load aborted, missing levels");
							var m = p.frag.stats;
							this.state = $n, p.frag.data = new Uint8Array(p.payload), m.parsing.start = m.buffering.start = self.performance.now(), m.parsing.end = m.buffering.end = self.performance.now(), this.tick();
						}, m.fragContextChanged = function(p) {
							var m = this.fragCurrent;
							return !p || !m || p.sn !== m.sn || p.level !== m.level;
						}, m.fragBufferedComplete = function(p, m) {
							var g, _, x, w, D = this.mediaBuffer ? this.mediaBuffer : this.media;
							if (this.log("Buffered " + p.type + " sn: " + p.sn + (m ? " part: " + m.index : "") + " of " + (this.playlistType === At ? "level" : "track") + " " + p.level + " (frag:[" + ((g = p.startPTS) ?? NaN).toFixed(3) + "-" + ((_ = p.endPTS) ?? NaN).toFixed(3) + "] > buffer:" + (D ? ei(Sn.getBuffered(D)) : "(detached)") + ")"), p.sn !== "initSegment") {
								var O;
								if (p.type !== Rt) {
									var A = p.elementaryStreams;
									if (!Object.keys(A).some(function(p) {
										return !!A[p];
									})) return void (this.state = $n);
								}
								var F = (O = this.levels)?.[p.level];
								F != null && F.fragmentError && (this.log("Resetting level fragment error count of " + F.fragmentError + " on frag buffered"), F.fragmentError = 0);
							}
							this.state = $n, D && (!this.loadedmetadata && p.type == At && D.buffered.length && (x = this.fragCurrent)?.sn === (w = this.fragPrevious)?.sn && (this.loadedmetadata = !0, this.seekToStartPos()), this.tick());
						}, m.seekToStartPos = function() {}, m._handleFragmentLoadComplete = function(p) {
							var m = this.transmuxer;
							if (m) {
								var g = p.frag, _ = p.part, x = p.partsLoaded, w = !x || x.length === 0 || x.some(function(p) {
									return !p;
								}), D = new jr(g.level, g.sn, g.stats.chunkCount + 1, 0, _ ? _.index : -1, !w);
								m.flush(D);
							}
						}, m._handleFragmentLoadProgress = function(p) {}, m._doFragLoad = function(p, m, g, x) {
							var w, O = this;
							g === void 0 && (g = null);
							var A = m?.details;
							if (!this.levels || !A) throw Error("frag load aborted, missing level" + (A ? "" : " detail") + "s");
							var F = null;
							if (!p.encrypted || (w = p.decryptdata) != null && w.key ? !p.encrypted && A.encryptedFragments.length && this.keyLoader.loadClear(p, A.encryptedFragments) : (this.log("Loading key for " + p.sn + " of [" + A.startSN + "-" + A.endSN + "], " + (this.logPrefix === "[stream-controller]" ? "level" : "track") + " " + p.level), this.state = er, this.fragCurrent = p, F = this.keyLoader.load(p).then(function(p) {
								if (!O.fragContextChanged(p.frag)) return O.hls.trigger(D.KEY_LOADED, p), O.state === er && (O.state = $n), p;
							}), this.hls.trigger(D.KEY_LOADING, { frag: p }), this.fragCurrent === null && (F = Promise.reject(Error("frag load aborted, context changed in KEY_LOADING")))), g = Math.max(p.start, g || 0), this.config.lowLatencyMode && p.sn !== "initSegment") {
								var U = A.partList;
								if (U && x) {
									g > p.end && A.fragmentHint && (p = A.fragmentHint);
									var K = this.getNextPart(U, p, g);
									if (K > -1) {
										var oe, le = U[K];
										return this.log("Loading part sn: " + p.sn + " p: " + le.index + " cc: " + p.cc + " of playlist [" + A.startSN + "-" + A.endSN + "] parts [0-" + K + "-" + (U.length - 1) + "] " + (this.logPrefix === "[stream-controller]" ? "level" : "track") + ": " + p.level + ", target: " + parseFloat(g.toFixed(3))), this.nextLoadPosition = le.start + le.duration, this.state = tr, oe = F ? F.then(function(g) {
											return !g || O.fragContextChanged(g.frag) ? null : O.doFragPartsLoad(p, le, m, x);
										}).catch(function(p) {
											return O.handleFragLoadError(p);
										}) : this.doFragPartsLoad(p, le, m, x).catch(function(p) {
											return O.handleFragLoadError(p);
										}), this.hls.trigger(D.FRAG_LOADING, {
											frag: p,
											part: le,
											targetBufferTime: g
										}), this.fragCurrent === null ? Promise.reject(Error("frag load aborted, context changed in FRAG_LOADING parts")) : oe;
									}
									if (!p.url || this.loadedEndOfParts(U, g)) return Promise.resolve(null);
								}
							}
							this.log("Loading fragment " + p.sn + " cc: " + p.cc + " " + (A ? "of [" + A.startSN + "-" + A.endSN + "] " : "") + (this.logPrefix === "[stream-controller]" ? "level" : "track") + ": " + p.level + ", target: " + parseFloat(g.toFixed(3))), _(p.sn) && !this.bitrateTest && (this.nextLoadPosition = p.start + p.duration), this.state = tr;
							var ue, we = this.config.progressive;
							return ue = we && F ? F.then(function(m) {
								return !m || O.fragContextChanged(m?.frag) ? null : O.fragmentLoader.load(p, x);
							}).catch(function(p) {
								return O.handleFragLoadError(p);
							}) : Promise.all([this.fragmentLoader.load(p, we ? x : void 0), F]).then(function(p) {
								var m = p[0];
								return !we && m && x && x(m), m;
							}).catch(function(p) {
								return O.handleFragLoadError(p);
							}), this.hls.trigger(D.FRAG_LOADING, {
								frag: p,
								targetBufferTime: g
							}), this.fragCurrent === null ? Promise.reject(Error("frag load aborted, context changed in FRAG_LOADING")) : ue;
						}, m.doFragPartsLoad = function(p, m, g, _) {
							var x = this;
							return new Promise(function(w, O) {
								var A, F = [], U = (A = g.details)?.partList;
								(function t(m) {
									x.fragmentLoader.loadPart(p, m, _).then(function(_) {
										F[m.index] = _;
										var O = _.part;
										x.hls.trigger(D.FRAG_LOADED, _);
										var A = Ot(g, p.sn, m.index + 1) || Mt(U, p.sn, m.index + 1);
										if (!A) return w({
											frag: p,
											part: O,
											partsLoaded: F
										});
										t(A);
									}).catch(O);
								})(m);
							});
						}, m.handleFragLoadError = function(p) {
							if ("data" in p) {
								var m = p.data;
								p.data && m.details === A.INTERNAL_ABORTED ? this.handleFragLoadAborted(m.frag, m.part) : this.hls.trigger(D.ERROR, m);
							} else this.hls.trigger(D.ERROR, {
								type: O.OTHER_ERROR,
								details: A.INTERNAL_EXCEPTION,
								err: p,
								error: p,
								fatal: !0
							});
							return null;
						}, m._handleTransmuxerFlush = function(p) {
							var m = this.getCurrentContext(p);
							if (m && this.state === ir) {
								var g = m.frag, _ = m.part, x = m.level, w = self.performance.now();
								g.stats.parsing.end = w, _ && (_.stats.parsing.end = w), this.updateLevelTiming(g, _, x, p.partial);
							} else this.fragCurrent || this.state === Qn || this.state === cr || (this.state = $n);
						}, m.getCurrentContext = function(p) {
							var m = this.levels, g = this.fragCurrent, _ = p.level, x = p.sn, w = p.part;
							if (m == null || !m[_]) return this.warn("Levels object was unset while buffering fragment " + x + " of level " + _ + ". The current chunk will not be buffered."), null;
							var D = m[_], O = w > -1 ? Ot(D, x, w) : null, A = O ? O.fragment : function(p, m, g) {
								if (p == null || !p.details) return null;
								var _ = p.details, x = _.fragments[m - _.startSN];
								return x || ((x = _.fragmentHint) && x.sn === m ? x : m < _.startSN && g && g.sn === m ? g : null);
							}(D, x, g);
							return A ? (g && g !== A && (A.stats = g.stats), {
								frag: A,
								part: O,
								level: D
							}) : null;
						}, m.bufferFragmentData = function(p, m, g, _, x) {
							var w;
							if (p && this.state === ir) {
								var O = p.data1, A = p.data2, F = O;
								if (O && A && (F = be(O, A)), (w = F) != null && w.length) {
									var U = {
										type: p.type,
										frag: m,
										part: g,
										chunkMeta: _,
										parent: m.type,
										data: F
									};
									if (this.hls.trigger(D.BUFFER_APPENDING, U), p.dropped && p.independent && !g) {
										if (x) return;
										this.flushBufferGap(m);
									}
								}
							}
						}, m.flushBufferGap = function(p) {
							var m = this.media;
							if (m) if (Sn.isBuffered(m, m.currentTime)) {
								var g = m.currentTime, _ = Sn.bufferInfo(m, g, 0), x = p.duration, w = Math.min(2 * this.config.maxFragLookUpTolerance, .25 * x), D = Math.max(Math.min(p.start - w, _.end - w), g + w);
								p.start - D > w && this.flushMainBuffer(D, p.start);
							} else this.flushMainBuffer(0, p.start);
						}, m.getFwdBufferInfo = function(p, m) {
							var g = this.getLoadPosition();
							return _(g) ? this.getFwdBufferInfoAtPos(p, g, m) : null;
						}, m.getFwdBufferInfoAtPos = function(p, m, g) {
							var _ = this.config.maxBufferHole, x = Sn.bufferInfo(p, m, _);
							if (x.len === 0 && x.nextStart !== void 0) {
								var w = this.fragmentTracker.getBufferedFrag(m, g);
								if (w && x.nextStart < w.end) return Sn.bufferInfo(p, m, Math.max(x.nextStart, _));
							}
							return x;
						}, m.getMaxBufferLength = function(p) {
							var m, g = this.config;
							return m = p ? Math.max(8 * g.maxBufferSize / p, g.maxBufferLength) : g.maxBufferLength, Math.min(m, g.maxMaxBufferLength);
						}, m.reduceMaxBufferLength = function(p, m) {
							var g = this.config, _ = Math.max(Math.min(p - m, g.maxBufferLength), m), x = Math.max(p - 3 * m, g.maxMaxBufferLength / 2, _);
							return x >= _ && (g.maxMaxBufferLength = x, this.warn("Reduce max buffer length to " + x + "s"), !0);
						}, m.getAppendedFrag = function(p, m) {
							var g = this.fragmentTracker.getAppendedFrag(p, At);
							return g && "fragment" in g ? g.fragment : g;
						}, m.getNextFragment = function(p, m) {
							var g = m.fragments, _ = g.length;
							if (!_) return null;
							var x, w = this.config, D = g[0].start;
							if (m.live) {
								var O = w.initialLiveManifestSize;
								if (_ < O) return this.warn("Not enough fragments to start playback (have: " + _ + ", need: " + O + ")"), null;
								(!m.PTSKnown && !this.startFragRequested && this.startPosition === -1 || p < D) && (x = this.getInitialLiveFragment(m, g), this.startPosition = this.nextLoadPosition = x ? this.hls.liveSyncPosition || x.start : p);
							} else p <= D && (x = g[0]);
							if (!x) {
								var A = w.lowLatencyMode ? m.partEnd : m.fragmentEnd;
								x = this.getFragmentAtPosition(p, A, m);
							}
							return this.mapToInitFragWhenRequired(x);
						}, m.isLoopLoading = function(p, m) {
							var g = this.fragmentTracker.getState(p);
							return (g === Vn || g === Bn && !!p.gap) && this.nextLoadPosition > m;
						}, m.getNextFragmentLoopLoading = function(p, m, g, _, x) {
							var w = p.gap, D = this.getNextFragment(this.nextLoadPosition, m);
							if (D === null) return D;
							if (p = D, w && p && !p.gap && g.nextStart) {
								var O = this.getFwdBufferInfoAtPos(this.mediaBuffer ? this.mediaBuffer : this.media, g.nextStart, _);
								if (O !== null && g.len + O.len >= x) return this.log("buffer full after gaps in \"" + _ + "\" playlist starting at sn: " + p.sn), null;
							}
							return p;
						}, m.mapToInitFragWhenRequired = function(p) {
							return p == null || !p.initSegment || p != null && p.initSegment.data || this.bitrateTest ? p : p.initSegment;
						}, m.getNextPart = function(p, m, g) {
							for (var _ = -1, x = !1, w = !0, D = 0, O = p.length; D < O; D++) {
								var A = p[D];
								if (w &&= !A.independent, _ > -1 && g < A.start) break;
								var F = A.loaded;
								F ? _ = -1 : (x || A.independent || w) && A.fragment === m && (_ = D), x = F;
							}
							return _;
						}, m.loadedEndOfParts = function(p, m) {
							var g = p[p.length - 1];
							return g && m > g.start && g.loaded;
						}, m.getInitialLiveFragment = function(p, m) {
							var g = this.fragPrevious, x = null;
							if (g) {
								if (p.hasProgramDateTime && (this.log("Live playlist, switching playlist, load frag with same PDT: " + g.programDateTime), x = function(p, m, g) {
									if (m === null || !Array.isArray(p) || !p.length || !_(m) || m < (p[0].programDateTime || 0) || m >= (p[p.length - 1].endProgramDateTime || 0)) return null;
									g ||= 0;
									for (var x = 0; x < p.length; ++x) {
										var w = p[x];
										if (Yt(m, g, w)) return w;
									}
									return null;
								}(m, g.endProgramDateTime, this.config.maxFragLookUpTolerance)), !x) {
									var w = g.sn + 1;
									if (w >= p.startSN && w <= p.endSN) {
										var D = m[w - p.startSN];
										g.cc === D.cc && (x = D, this.log("Live playlist, switching playlist, load frag with next SN: " + x.sn));
									}
									x || (x = function(p, m) {
										return Kt(p, function(p) {
											return p.cc < m ? 1 : p.cc > m ? -1 : 0;
										});
									}(m, g.cc), x && this.log("Live playlist, switching playlist, load frag with same CC: " + x.sn));
								}
							} else {
								var O = this.hls.liveSyncPosition;
								O !== null && (x = this.getFragmentAtPosition(O, this.bitrateTest ? p.fragmentEnd : p.edge, p));
							}
							return x;
						}, m.getFragmentAtPosition = function(p, m, g) {
							var _, x = this.config, w = this.fragPrevious, D = g.fragments, O = g.endSN, A = g.fragmentHint, F = x.maxFragLookUpTolerance, U = g.partList, K = !!(x.lowLatencyMode && U != null && U.length && A);
							if (K && A && !this.bitrateTest && (D = D.concat(A), O = A.sn), _ = p < m ? Wt(w, D, p, p > m - F ? 0 : F) : D[D.length - 1]) {
								var oe = _.sn - g.startSN, le = this.fragmentTracker.getState(_);
								if ((le === Vn || le === Bn && _.gap) && (w = _), w && _.sn === w.sn && (!K || U[0].fragment.sn > _.sn) && w && _.level === w.level) {
									var ue = D[oe + 1];
									_ = _.sn < O && this.fragmentTracker.getState(ue) !== Vn ? ue : null;
								}
							}
							return _;
						}, m.synchronizeToLiveEdge = function(p) {
							var m = this.config, g = this.media;
							if (g) {
								var _ = this.hls.liveSyncPosition, x = g.currentTime, w = p.fragments[0].start, D = p.edge, O = x >= w - m.maxFragLookUpTolerance && x <= D;
								if (_ !== null && g.duration > _ && (x < _ || !O)) {
									var A = m.liveMaxLatencyDuration === void 0 ? m.liveMaxLatencyDurationCount * p.targetduration : m.liveMaxLatencyDuration;
									(!O && g.readyState < 4 || x < D - A) && (this.loadedmetadata || (this.nextLoadPosition = _), g.readyState && (this.warn("Playback: " + x.toFixed(3) + " is located too far from the end of live sliding playlist: " + D + ", reset currentTime to : " + _.toFixed(3)), g.currentTime = _));
								}
							}
						}, m.alignPlaylists = function(p, m, g) {
							var x = p.fragments.length;
							if (!x) return this.warn("No fragments in live playlist"), 0;
							var w = p.fragments[0].start, D = !m, O = p.alignedSliding && _(w);
							if (D || !O && !w) {
								var A = this.fragPrevious;
								Xr(A, g, p);
								var F = p.fragments[0].start;
								return this.log("Live playlist sliding: " + F.toFixed(2) + " start-sn: " + (m ? m.startSN : "na") + "->" + p.startSN + " prev-sn: " + (A ? A.sn : "na") + " fragments: " + x), F;
							}
							return w;
						}, m.waitForCdnTuneIn = function(p) {
							return p.live && p.canBlockReload && p.partTarget && p.tuneInGoal > Math.max(p.partHoldBack, 3 * p.partTarget);
						}, m.setStartPosition = function(p, m) {
							var g = this.startPosition;
							if (g < m && (g = -1), g === -1 || this.lastCurrentTime === -1) {
								var x = this.startTimeOffset !== null, w = x ? this.startTimeOffset : p.startTimeOffset;
								w !== null && _(w) ? (g = m + w, w < 0 && (g += p.totalduration), g = Math.min(Math.max(m, g), m + p.totalduration), this.log("Start time offset " + w + " found in " + (x ? "multivariant" : "media") + " playlist, adjust startPosition to " + g), this.startPosition = g) : p.live ? g = this.hls.liveSyncPosition || m : this.startPosition = g = 0, this.lastCurrentTime = g;
							}
							this.nextLoadPosition = g;
						}, m.getLoadPosition = function() {
							var p = this.media, m = 0;
							return this.loadedmetadata && p ? m = p.currentTime : this.nextLoadPosition && (m = this.nextLoadPosition), m;
						}, m.handleFragLoadAborted = function(p, m) {
							this.transmuxer && p.sn !== "initSegment" && p.stats.aborted && (this.warn("Fragment " + p.sn + (m ? " part " + m.index : "") + " of level " + p.level + " was aborted"), this.resetFragmentLoading(p));
						}, m.resetFragmentLoading = function(p) {
							this.fragCurrent && (this.fragContextChanged(p) || this.state === rr) || (this.state = $n);
						}, m.onFragmentOrKeyLoadError = function(p, m) {
							if (m.chunkMeta && !m.frag) {
								var g = this.getCurrentContext(m.chunkMeta);
								g && (m.frag = g.frag);
							}
							var _ = m.frag;
							if (_ && _.type === p && this.levels) if (this.fragContextChanged(_)) {
								var x;
								this.warn("Frag load error must match current frag to retry " + _.url + " > " + (x = this.fragCurrent)?.url);
							} else {
								var w = m.details === A.FRAG_GAP;
								w && this.fragmentTracker.fragBuffered(_, !0);
								var D = m.errorAction, O = D || {}, F = O.action, U = O.retryCount, oe = U === void 0 ? 0 : U, le = O.retryConfig;
								if (D && F === dn && le) {
									this.resetStartWhenNotLoaded(this.levelLastLoaded);
									var ue = Gt(le, oe);
									this.warn("Fragment " + _.sn + " of " + p + " " + _.level + " errored with " + m.details + ", retrying loading " + (oe + 1) + "/" + le.maxNumRetry + " in " + ue + "ms"), D.resolved = !0, this.retryDate = self.performance.now() + ue, this.state = rr;
								} else if (le && D) {
									if (this.resetFragmentErrors(p), !(oe < le.maxNumRetry)) return void K.warn(m.details + " reached or exceeded max retry (" + oe + ")");
									w || F === un || (D.resolved = !0);
								} else D?.action === ln ? this.state = lr : this.state = cr;
								this.tickImmediate();
							}
						}, m.reduceLengthAndFlushBuffer = function(p) {
							if (this.state === ir || this.state === or) {
								var m = p.frag, g = p.parent, _ = this.getFwdBufferInfo(this.mediaBuffer, g), x = _ && _.len > .5;
								x && this.reduceMaxBufferLength(_.len, m?.duration || 10);
								var w = !x;
								return w && this.warn("Buffer full error while media.currentTime is not buffered, flush " + g + " buffer"), m && (this.fragmentTracker.removeFragment(m), this.nextLoadPosition = m.start), this.resetLoadingState(), w;
							}
							return !1;
						}, m.resetFragmentErrors = function(p) {
							p === Lt && (this.fragCurrent = null), this.loadedmetadata || (this.startFragRequested = !1), this.state !== Qn && (this.state = $n);
						}, m.afterBufferFlushed = function(p, m, g) {
							if (p) {
								var _ = Sn.getBuffered(p);
								this.fragmentTracker.detectEvictedFragments(m, _, g), this.state === sr && this.resetLoadingState();
							}
						}, m.resetLoadingState = function() {
							this.log("Reset loading state"), this.fragCurrent = null, this.fragPrevious = null, this.state = $n;
						}, m.resetStartWhenNotLoaded = function(p) {
							if (!this.loadedmetadata) {
								this.startFragRequested = !1;
								var m = p ? p.details : null;
								m != null && m.live ? (this.startPosition = -1, this.setStartPosition(m, 0), this.resetLoadingState()) : this.nextLoadPosition = this.startPosition;
							}
						}, m.resetWhenMissingContext = function(p) {
							this.warn("The loading context changed while buffering fragment " + p.sn + " of level " + p.level + ". This chunk will not be buffered."), this.removeUnbufferedFrags(), this.resetStartWhenNotLoaded(this.levelLastLoaded), this.resetLoadingState();
						}, m.removeUnbufferedFrags = function(p) {
							p === void 0 && (p = 0), this.fragmentTracker.removeFragmentsInRange(p, Infinity, this.playlistType, !1, !0);
						}, m.updateLevelTiming = function(p, m, g, _) {
							var x, w = this, F = g.details;
							if (F) {
								if (!Object.keys(p.elementaryStreams).reduce(function(m, x) {
									var O = p.elementaryStreams[x];
									if (O) {
										var A = O.endPTS - O.startPTS;
										if (A <= 0) return w.warn("Could not parse fragment " + p.sn + " " + x + " duration reliably (" + A + ")"), m || !1;
										var U = _ ? 0 : It(F, p, O.startPTS, O.endPTS, O.startDTS, O.endDTS);
										return w.hls.trigger(D.LEVEL_PTS_UPDATED, {
											details: F,
											level: g,
											drift: U,
											type: x,
											frag: p,
											start: O.startPTS,
											end: O.endPTS
										}), !0;
									}
									return m;
								}, !1) && (x = this.transmuxer)?.error === null) {
									var U = Error("Found no media in fragment " + p.sn + " of level " + p.level + " resetting transmuxer to fallback to playlist timing");
									if (g.fragmentError === 0 && (g.fragmentError++, p.gap = !0, this.fragmentTracker.removeFragment(p), this.fragmentTracker.fragBuffered(p, !0)), this.warn(U.message), this.hls.trigger(D.ERROR, {
										type: O.MEDIA_ERROR,
										details: A.FRAG_PARSING_ERROR,
										fatal: !1,
										error: U,
										frag: p,
										reason: "Found no media in msn " + p.sn + " of level \"" + g.url + "\""
									}), !this.hls) return;
									this.resetTransmuxer();
								}
								this.state = or, this.hls.trigger(D.FRAG_PARSED, {
									frag: p,
									part: m
								});
							} else this.warn("level.details undefined");
						}, m.resetTransmuxer = function() {
							this.transmuxer && (this.transmuxer.destroy(), this.transmuxer = null);
						}, m.recoverWorkerError = function(p) {
							p.event === "demuxerWorker" && (this.fragmentTracker.removeAllFragments(), this.resetTransmuxer(), this.resetStartWhenNotLoaded(this.levelLastLoaded), this.resetLoadingState());
						}, s(t, [{
							key: "state",
							get: function() {
								return this._state;
							},
							set: function(p) {
								var m = this._state;
								m !== p && (this._state = p, this.log(m + "->" + p));
							}
						}]), t;
					}(qn);
					function fi() {
						return self.SourceBuffer || self.WebKitSourceBuffer;
					}
					function ci() {
						if (!Ce()) return !1;
						var p = fi();
						return !p || p.prototype && typeof p.prototype.appendBuffer == "function" && typeof p.prototype.remove == "function";
					}
					function vi(p, m) {
						return p === void 0 && (p = ""), m === void 0 && (m = 9e4), {
							type: p,
							id: -1,
							pid: -1,
							inputTimeScale: m,
							sequenceNumber: -1,
							samples: [],
							dropped: 0
						};
					}
					var dr = function() {
						function e() {
							this._audioTrack = void 0, this._id3Track = void 0, this.frameIndex = 0, this.cachedData = null, this.basePTS = null, this.initPTS = null, this.lastPTS = null;
						}
						var p = e.prototype;
						return p.resetInitSegment = function(p, m, g, _) {
							this._id3Track = {
								type: "id3",
								id: 3,
								pid: -1,
								inputTimeScale: 9e4,
								sequenceNumber: 0,
								samples: [],
								dropped: 0
							};
						}, p.resetTimeStamp = function(p) {
							this.initPTS = p, this.resetContiguity();
						}, p.resetContiguity = function() {
							this.basePTS = null, this.lastPTS = null, this.frameIndex = 0;
						}, p.canParse = function(p, m) {
							return !1;
						}, p.appendFrame = function(p, m, g) {}, p.demux = function(p, m) {
							this.cachedData && (p = be(this.cachedData, p), this.cachedData = null);
							var g, x = Y(p, 0), w = x ? x.length : 0, D = this._audioTrack, O = this._id3Track, A = x ? X(x) : void 0, F = p.length;
							for ((this.basePTS === null || this.frameIndex === 0 && _(A)) && (this.basePTS = mi(A, m, this.initPTS), this.lastPTS = this.basePTS), this.lastPTS === null && (this.lastPTS = this.basePTS), x && x.length > 0 && O.samples.push({
								pts: this.lastPTS,
								dts: this.lastPTS,
								data: x,
								type: qt,
								duration: Infinity
							}); w < F;) {
								if (this.canParse(p, w)) {
									var U = this.appendFrame(D, p, w);
									U ? (this.frameIndex++, this.lastPTS = U.sample.pts, g = w += U.length) : w = F;
								} else z(p, w) ? (x = Y(p, w), O.samples.push({
									pts: this.lastPTS,
									dts: this.lastPTS,
									data: x,
									type: qt,
									duration: Infinity
								}), g = w += x.length) : w++;
								if (w === F && g !== F) {
									var K = V(p, g);
									this.cachedData ? this.cachedData = be(this.cachedData, K) : this.cachedData = K;
								}
							}
							return {
								audioTrack: D,
								videoTrack: vi(),
								id3Track: O,
								textTrack: vi()
							};
						}, p.demuxSampleAes = function(p, m, g) {
							return Promise.reject(Error("[" + this + "] This demuxer does not support Sample-AES decryption"));
						}, p.flush = function(p) {
							var m = this.cachedData;
							return m && (this.cachedData = null, this.demux(m, 0)), {
								audioTrack: this._audioTrack,
								videoTrack: vi(),
								id3Track: this._id3Track,
								textTrack: vi()
							};
						}, p.destroy = function() {}, e;
					}(), mi = function(p, m, g) {
						return _(p) ? 90 * p : 9e4 * m + (g ? 9e4 * g.baseTime / g.timescale : 0);
					};
					function pi(p, m) {
						return p[m] === 255 && (246 & p[m + 1]) == 240;
					}
					function yi(p, m) {
						return 1 & p[m + 1] ? 7 : 9;
					}
					function Ei(p, m) {
						return (3 & p[m + 3]) << 11 | p[m + 4] << 3 | (224 & p[m + 5]) >>> 5;
					}
					function Ti(p, m) {
						return m + 1 < p.length && pi(p, m);
					}
					function Si(p, m) {
						if (Ti(p, m)) {
							var g = yi(p, m);
							if (m + g >= p.length) return !1;
							var _ = Ei(p, m);
							if (_ <= g) return !1;
							var x = m + _;
							return x === p.length || Ti(p, x);
						}
						return !1;
					}
					function Li(p, m, g, _, x) {
						if (!p.samplerate) {
							var w = function(p, m, g, _) {
								var x, w, F, U, oe = navigator.userAgent.toLowerCase(), le = _, ue = [
									96e3,
									88200,
									64e3,
									48e3,
									44100,
									32e3,
									24e3,
									22050,
									16e3,
									12e3,
									11025,
									8e3,
									7350
								];
								x = 1 + ((192 & m[g + 2]) >>> 6);
								var we = (60 & m[g + 2]) >>> 2;
								if (!(we > ue.length - 1)) return F = (1 & m[g + 2]) << 2, F |= (192 & m[g + 3]) >>> 6, K.log("manifest codec:" + _ + ", ADTS type:" + x + ", samplingIndex:" + we), /firefox/i.test(oe) ? we >= 6 ? (x = 5, U = [
									,
									,
									,
									,
								], w = we - 3) : (x = 2, U = [, ,], w = we) : oe.indexOf("android") === -1 ? (x = 5, U = [
									,
									,
									,
									,
								], _ && (_.indexOf("mp4a.40.29") !== -1 || _.indexOf("mp4a.40.5") !== -1) || !_ && we >= 6 ? w = we - 3 : ((_ && _.indexOf("mp4a.40.2") !== -1 && (we >= 6 && F === 1 || /vivaldi/i.test(oe)) || !_ && F === 1) && (x = 2, U = [, ,]), w = we)) : (x = 2, U = [, ,], w = we), U[0] = x << 3, U[0] |= (14 & we) >> 1, U[1] |= (1 & we) << 7, U[1] |= F << 3, x === 5 && (U[1] |= (14 & w) >> 1, U[2] = (1 & w) << 7, U[2] |= 8, U[3] = 0), {
									config: U,
									samplerate: ue[we],
									channelCount: F,
									codec: "mp4a.40." + x,
									manifestCodec: le
								};
								var je = Error("invalid ADTS sampling index:" + we);
								p.emit(D.ERROR, D.ERROR, {
									type: O.MEDIA_ERROR,
									details: A.FRAG_PARSING_ERROR,
									fatal: !0,
									error: je,
									reason: je.message
								});
							}(m, g, _, x);
							if (!w) return;
							p.config = w.config, p.samplerate = w.samplerate, p.channelCount = w.channelCount, p.codec = w.codec, p.manifestCodec = w.manifestCodec, K.log("parsed codec:" + p.codec + ", rate:" + w.samplerate + ", channels:" + w.channelCount);
						}
					}
					function Ri(p) {
						return 9216e4 / p;
					}
					function Ai(p, m, g, _, x) {
						var w, D = _ + x * Ri(p.samplerate), O = function(p, m) {
							var g = yi(p, m);
							if (m + g <= p.length) {
								var _ = Ei(p, m) - g;
								if (_ > 0) return {
									headerLength: g,
									frameLength: _
								};
							}
						}(m, g);
						if (O) {
							var A = O.frameLength, F = O.headerLength, U = F + A, K = Math.max(0, g + U - m.length);
							K ? (w = new Uint8Array(U - F)).set(m.subarray(g + F, m.length), 0) : w = m.subarray(g + F, g + U);
							var oe = {
								unit: w,
								pts: D
							};
							return K || p.samples.push(oe), {
								sample: oe,
								length: U,
								missing: K
							};
						}
						var le = m.length - g;
						return (w = new Uint8Array(le)).set(m.subarray(g, m.length), 0), {
							sample: {
								unit: w,
								pts: D
							},
							length: le,
							missing: -1
						};
					}
					var hr = null, gr = [
						32,
						64,
						96,
						128,
						160,
						192,
						224,
						256,
						288,
						320,
						352,
						384,
						416,
						448,
						32,
						48,
						56,
						64,
						80,
						96,
						112,
						128,
						160,
						192,
						224,
						256,
						320,
						384,
						32,
						40,
						48,
						56,
						64,
						80,
						96,
						112,
						128,
						160,
						192,
						224,
						256,
						320,
						32,
						48,
						56,
						64,
						80,
						96,
						112,
						128,
						144,
						160,
						176,
						192,
						224,
						256,
						8,
						16,
						24,
						32,
						40,
						48,
						56,
						64,
						80,
						96,
						112,
						128,
						144,
						160
					], vr = [
						44100,
						48e3,
						32e3,
						22050,
						24e3,
						16e3,
						11025,
						12e3,
						8e3
					], yr = [
						[
							0,
							72,
							144,
							12
						],
						[
							0,
							0,
							0,
							0
						],
						[
							0,
							72,
							144,
							12
						],
						[
							0,
							144,
							144,
							12
						]
					], br = [
						0,
						1,
						1,
						4
					];
					function wi(p, m, g, _, x) {
						if (!(g + 24 > m.length)) {
							var w = Ci(m, g);
							if (w && g + w.frameLength <= m.length) {
								var D = _ + x * (9e4 * w.samplesPerFrame / w.sampleRate), O = {
									unit: m.subarray(g, g + w.frameLength),
									pts: D,
									dts: D
								};
								return p.config = [], p.channelCount = w.channelCount, p.samplerate = w.sampleRate, p.samples.push(O), {
									sample: O,
									length: w.frameLength,
									missing: 0
								};
							}
						}
					}
					function Ci(p, m) {
						var g = p[m + 1] >> 3 & 3, _ = p[m + 1] >> 1 & 3, x = p[m + 2] >> 4 & 15, w = p[m + 2] >> 2 & 3;
						if (g !== 1 && x !== 0 && x !== 15 && w !== 3) {
							var D = p[m + 2] >> 1 & 1, O = p[m + 3] >> 6, A = 1e3 * gr[14 * (g === 3 ? 3 - _ : _ === 3 ? 3 : 4) + x - 1], F = vr[3 * (g === 3 ? 0 : g === 2 ? 1 : 2) + w], U = O === 3 ? 1 : 2, K = yr[g][_], oe = br[_], le = 8 * K * oe, ue = Math.floor(K * A / F + D) * oe;
							if (hr === null) {
								var we = (navigator.userAgent || "").match(/Chrome\/(\d+)/i);
								hr = we ? parseInt(we[1]) : 0;
							}
							return hr && hr <= 87 && _ === 2 && A >= 224e3 && O === 0 && (p[m + 3] = 128 | p[m + 3]), {
								sampleRate: F,
								channelCount: U,
								frameLength: ue,
								samplesPerFrame: le
							};
						}
					}
					function Ii(p, m) {
						return p[m] === 255 && (224 & p[m + 1]) == 224 && (6 & p[m + 1]) != 0;
					}
					function Pi(p, m) {
						return m + 1 < p.length && Ii(p, m);
					}
					function Fi(p, m) {
						if (m + 1 < p.length && Ii(p, m)) {
							var g = Ci(p, m), _ = 4;
							g != null && g.frameLength && (_ = g.frameLength);
							var x = m + _;
							return x === p.length || Pi(p, x);
						}
						return !1;
					}
					var xr = function(p) {
						function t(m, g) {
							var _;
							return (_ = p.call(this) || this).observer = void 0, _.config = void 0, _.observer = m, _.config = g, _;
						}
						l(t, p);
						var m = t.prototype;
						return m.resetInitSegment = function(m, g, _, x) {
							p.prototype.resetInitSegment.call(this, m, g, _, x), this._audioTrack = {
								container: "audio/adts",
								type: "audio",
								id: 2,
								pid: -1,
								sequenceNumber: 0,
								segmentCodec: "aac",
								samples: [],
								manifestCodec: g,
								duration: x,
								inputTimeScale: 9e4,
								dropped: 0
							};
						}, t.probe = function(p) {
							if (!p) return !1;
							var m = Y(p, 0), g = m?.length || 0;
							if (Fi(p, g)) return !1;
							for (var _ = p.length; g < _; g++) if (Si(p, g)) return K.log("ADTS sync word found !"), !0;
							return !1;
						}, m.canParse = function(p, m) {
							return function(p, m) {
								return function(p, m) {
									return m + 5 < p.length;
								}(p, m) && pi(p, m) && Ei(p, m) <= p.length - m;
							}(p, m);
						}, m.appendFrame = function(p, m, g) {
							Li(p, this.observer, m, g, p.manifestCodec);
							var _ = Ai(p, m, g, this.basePTS, this.frameIndex);
							if (_ && _.missing === 0) return _;
						}, t;
					}(dr), Sr = /\/emsg[-/]ID3/i, Cr = function() {
						function e(p, m) {
							this.remainderData = null, this.timeOffset = 0, this.config = void 0, this.videoTrack = void 0, this.audioTrack = void 0, this.id3Track = void 0, this.txtTrack = void 0, this.config = m;
						}
						var p = e.prototype;
						return p.resetTimeStamp = function() {}, p.resetInitSegment = function(p, m, g, _) {
							var x = this.videoTrack = vi("video", 1), w = this.audioTrack = vi("audio", 1), D = this.txtTrack = vi("text", 1);
							if (this.id3Track = vi("id3", 1), this.timeOffset = 0, p != null && p.byteLength) {
								var O = ye(p);
								if (O.video) {
									var A = O.video, F = A.id, U = A.timescale, K = A.codec;
									x.id = F, x.timescale = D.timescale = U, x.codec = K;
								}
								if (O.audio) {
									var oe = O.audio, le = oe.id, ue = oe.timescale, we = oe.codec;
									w.id = le, w.timescale = ue, w.codec = we;
								}
								D.id = rt.text, x.sampleDuration = 0, x.duration = w.duration = _;
							}
						}, p.resetContiguity = function() {
							this.remainderData = null;
						}, e.probe = function(p) {
							return function(p) {
								for (var m = p.byteLength, g = 0; g < m;) {
									var _ = fe(p, g);
									if (_ > 8 && p[g + 4] === 109 && p[g + 5] === 111 && p[g + 6] === 111 && p[g + 7] === 102) return !0;
									g = _ > 1 ? g + _ : m;
								}
								return !1;
							}(p);
						}, p.demux = function(p, m) {
							this.timeOffset = m;
							var g = p, _ = this.videoTrack, x = this.txtTrack;
							if (this.config.progressive) {
								this.remainderData && (g = be(this.remainderData, p));
								var w = function(p) {
									var m = {
										valid: null,
										remainder: null
									}, g = me(p, ["moof"]);
									if (g.length < 2) return m.remainder = p, m;
									var _ = g[g.length - 1];
									return m.valid = V(p, 0, _.byteOffset - 8), m.remainder = V(p, _.byteOffset - 8), m;
								}(g);
								this.remainderData = w.remainder, _.samples = w.valid || new Uint8Array();
							} else _.samples = g;
							var D = this.extractID3Track(_, m);
							return x.samples = ke(m, _), {
								videoTrack: _,
								audioTrack: this.audioTrack,
								id3Track: D,
								textTrack: this.txtTrack
							};
						}, p.flush = function() {
							var p = this.timeOffset, m = this.videoTrack, g = this.txtTrack;
							m.samples = this.remainderData || new Uint8Array(), this.remainderData = null;
							var _ = this.extractID3Track(m, this.timeOffset);
							return g.samples = ke(p, m), {
								videoTrack: m,
								audioTrack: vi(),
								id3Track: _,
								textTrack: vi()
							};
						}, p.extractID3Track = function(p, m) {
							var g = this.id3Track;
							if (p.samples.length) {
								var w = me(p.samples, ["emsg"]);
								w && w.forEach(function(p) {
									var w = function(p) {
										var m = p[0], g = "", _ = "", w = 0, D = 0, O = 0, A = 0, F = 0, U = 0;
										if (m === 0) {
											for (; de(p.subarray(U, U + 1)) !== "\0";) g += de(p.subarray(U, U + 1)), U += 1;
											for (g += de(p.subarray(U, U + 1)), U += 1; de(p.subarray(U, U + 1)) !== "\0";) _ += de(p.subarray(U, U + 1)), U += 1;
											_ += de(p.subarray(U, U + 1)), U += 1, w = fe(p, 12), D = fe(p, 16), A = fe(p, 20), F = fe(p, 24), U = 28;
										} else if (m === 1) {
											w = fe(p, U += 4);
											var oe = fe(p, U += 4), le = fe(p, U += 4);
											for (U += 4, O = 2 ** 32 * oe + le, x(O) || (O = 2 ** 53 - 1, K.warn("Presentation time exceeds safe integer limit and wrapped to max safe integer in parsing emsg box")), A = fe(p, U), F = fe(p, U += 4), U += 4; de(p.subarray(U, U + 1)) !== "\0";) g += de(p.subarray(U, U + 1)), U += 1;
											for (g += de(p.subarray(U, U + 1)), U += 1; de(p.subarray(U, U + 1)) !== "\0";) _ += de(p.subarray(U, U + 1)), U += 1;
											_ += de(p.subarray(U, U + 1)), U += 1;
										}
										return {
											schemeIdUri: g,
											value: _,
											timeScale: w,
											presentationTime: O,
											presentationTimeDelta: D,
											eventDuration: A,
											id: F,
											payload: p.subarray(U, p.byteLength)
										};
									}(p);
									if (Sr.test(w.schemeIdUri)) {
										var D = _(w.presentationTime) ? w.presentationTime / w.timeScale : m + w.presentationTimeDelta / w.timeScale, O = w.eventDuration === 4294967295 ? Infinity : w.eventDuration / w.timeScale;
										O <= .001 && (O = Infinity);
										var A = w.payload;
										g.samples.push({
											data: A,
											len: A.byteLength,
											dts: D,
											pts: D,
											type: Xt,
											duration: O
										});
									}
								});
							}
							return g;
						}, p.demuxSampleAes = function(p, m, g) {
							return Promise.reject(Error("The MP4 demuxer does not support SAMPLE-AES decryption"));
						}, p.destroy = function() {}, e;
					}(), Tr = function() {
						function e() {
							this.VideoSample = null;
						}
						var p = e.prototype;
						return p.createVideoSample = function(p, m, g, _) {
							return {
								key: p,
								frame: !1,
								pts: m,
								dts: g,
								units: [],
								debug: _,
								length: 0
							};
						}, p.getLastNalUnit = function(p) {
							var m, g, _ = this.VideoSample;
							if (_ && _.units.length !== 0 || (_ = p[p.length - 1]), (m = _) != null && m.units) {
								var x = _.units;
								g = x[x.length - 1];
							}
							return g;
						}, p.pushAccessUnit = function(p, m) {
							if (p.units.length && p.frame) {
								if (p.pts === void 0) {
									var g = m.samples, _ = g.length;
									if (!_) return void m.dropped++;
									var x = g[_ - 1];
									p.pts = x.pts, p.dts = x.dts;
								}
								m.samples.push(p);
							}
							p.debug.length && K.log(p.pts + "/" + p.dts + ":" + p.debug);
						}, e;
					}(), Er = function() {
						function e(p) {
							this.data = void 0, this.bytesAvailable = void 0, this.word = void 0, this.bitsAvailable = void 0, this.data = p, this.bytesAvailable = p.byteLength, this.word = 0, this.bitsAvailable = 0;
						}
						var p = e.prototype;
						return p.loadWord = function() {
							var p = this.data, m = this.bytesAvailable, g = p.byteLength - m, _ = new Uint8Array(4), x = Math.min(4, m);
							if (x === 0) throw Error("no bytes available");
							_.set(p.subarray(g, g + x)), this.word = new DataView(_.buffer).getUint32(0), this.bitsAvailable = 8 * x, this.bytesAvailable -= x;
						}, p.skipBits = function(p) {
							var m;
							p = Math.min(p, 8 * this.bytesAvailable + this.bitsAvailable), this.bitsAvailable > p ? (this.word <<= p, this.bitsAvailable -= p) : (p -= this.bitsAvailable, p -= (m = p >> 3) << 3, this.bytesAvailable -= m, this.loadWord(), this.word <<= p, this.bitsAvailable -= p);
						}, p.readBits = function(p) {
							var m = Math.min(this.bitsAvailable, p), g = this.word >>> 32 - m;
							if (p > 32 && K.error("Cannot read more than 32 bits at a time"), this.bitsAvailable -= m, this.bitsAvailable > 0) this.word <<= m;
							else {
								if (!(this.bytesAvailable > 0)) throw Error("no bits available");
								this.loadWord();
							}
							return (m = p - m) > 0 && this.bitsAvailable ? g << m | this.readBits(m) : g;
						}, p.skipLZ = function() {
							var p;
							for (p = 0; p < this.bitsAvailable; ++p) if (this.word & 2147483648 >>> p) return this.word <<= p, this.bitsAvailable -= p, p;
							return this.loadWord(), p + this.skipLZ();
						}, p.skipUEG = function() {
							this.skipBits(1 + this.skipLZ());
						}, p.skipEG = function() {
							this.skipBits(1 + this.skipLZ());
						}, p.readUEG = function() {
							var p = this.skipLZ();
							return this.readBits(p + 1) - 1;
						}, p.readEG = function() {
							var p = this.readUEG();
							return 1 & p ? 1 + p >>> 1 : -1 * (p >>> 1);
						}, p.readBoolean = function() {
							return this.readBits(1) === 1;
						}, p.readUByte = function() {
							return this.readBits(8);
						}, p.readUShort = function() {
							return this.readBits(16);
						}, p.readUInt = function() {
							return this.readBits(32);
						}, p.skipScalingList = function(p) {
							for (var m = 8, g = 8, _ = 0; _ < p; _++) g !== 0 && (g = (m + this.readEG() + 256) % 256), m = g === 0 ? m : g;
						}, p.readSPS = function() {
							var p, m, g, _ = 0, x = 0, w = 0, D = 0, O = this.readUByte.bind(this), A = this.readBits.bind(this), F = this.readUEG.bind(this), U = this.readBoolean.bind(this), K = this.skipBits.bind(this), oe = this.skipEG.bind(this), le = this.skipUEG.bind(this), ue = this.skipScalingList.bind(this);
							O();
							var we = O();
							if (A(5), K(3), O(), le(), we === 100 || we === 110 || we === 122 || we === 244 || we === 44 || we === 83 || we === 86 || we === 118 || we === 128) {
								var je = F();
								if (je === 3 && K(1), le(), le(), K(1), U()) for (m = je === 3 ? 12 : 8, g = 0; g < m; g++) U() && ue(g < 6 ? 16 : 64);
							}
							le();
							var Ie = F();
							if (Ie === 0) F();
							else if (Ie === 1) for (K(1), oe(), oe(), p = F(), g = 0; g < p; g++) oe();
							le(), K(1);
							var Be = F(), Ve = F(), Ue = A(1);
							Ue === 0 && K(1), K(1), U() && (_ = F(), x = F(), w = F(), D = F());
							var We = [1, 1];
							if (U() && U()) switch (O()) {
								case 1:
									We = [1, 1];
									break;
								case 2:
									We = [12, 11];
									break;
								case 3:
									We = [10, 11];
									break;
								case 4:
									We = [16, 11];
									break;
								case 5:
									We = [40, 33];
									break;
								case 6:
									We = [24, 11];
									break;
								case 7:
									We = [20, 11];
									break;
								case 8:
									We = [32, 11];
									break;
								case 9:
									We = [80, 33];
									break;
								case 10:
									We = [18, 11];
									break;
								case 11:
									We = [15, 11];
									break;
								case 12:
									We = [64, 33];
									break;
								case 13:
									We = [160, 99];
									break;
								case 14:
									We = [4, 3];
									break;
								case 15:
									We = [3, 2];
									break;
								case 16:
									We = [2, 1];
									break;
								case 255: We = [O() << 8 | O(), O() << 8 | O()];
							}
							return {
								width: Math.ceil(16 * (Be + 1) - 2 * _ - 2 * x),
								height: (2 - Ue) * (Ve + 1) * 16 - (Ue ? 2 : 4) * (w + D),
								pixelRatio: We
							};
						}, p.readSliceType = function() {
							return this.readUByte(), this.readUEG(), this.readUEG();
						}, e;
					}(), Or = function(p) {
						function t() {
							return p.apply(this, arguments) || this;
						}
						l(t, p);
						var m = t.prototype;
						return m.parseAVCPES = function(p, m, g, _, x) {
							var w, D = this, O = this.parseAVCNALu(p, g.data), A = this.VideoSample, F = !1;
							g.data = null, A && O.length && !p.audFound && (this.pushAccessUnit(A, p), A = this.VideoSample = this.createVideoSample(!1, g.pts, g.dts, "")), O.forEach(function(_) {
								var O;
								switch (_.type) {
									case 1:
										var U = !1;
										w = !0;
										var K, oe = _.data;
										if (F && oe.length > 4) {
											var le = new Er(oe).readSliceType();
											le !== 2 && le !== 4 && le !== 7 && le !== 9 || (U = !0);
										}
										U && (K = A) != null && K.frame && !A.key && (D.pushAccessUnit(A, p), A = D.VideoSample = null), A ||= D.VideoSample = D.createVideoSample(!0, g.pts, g.dts, ""), A.frame = !0, A.key = U;
										break;
									case 5:
										w = !0, (O = A) != null && O.frame && !A.key && (D.pushAccessUnit(A, p), A = D.VideoSample = null), A ||= D.VideoSample = D.createVideoSample(!0, g.pts, g.dts, ""), A.key = !0, A.frame = !0;
										break;
									case 6:
										w = !0, _e(_.data, 1, g.pts, m.samples);
										break;
									case 7:
										var ue, we;
										w = !0, F = !0;
										var je = _.data, Ie = new Er(je).readSPS();
										if (!p.sps || p.width !== Ie.width || p.height !== Ie.height || (ue = p.pixelRatio)?.[0] !== Ie.pixelRatio[0] || (we = p.pixelRatio)?.[1] !== Ie.pixelRatio[1]) {
											p.width = Ie.width, p.height = Ie.height, p.pixelRatio = Ie.pixelRatio, p.sps = [je], p.duration = x;
											for (var Be = je.subarray(1, 4), Ve = "avc1.", Ue = 0; Ue < 3; Ue++) {
												var We = Be[Ue].toString(16);
												We.length < 2 && (We = "0" + We), Ve += We;
											}
											p.codec = Ve;
										}
										break;
									case 8:
										w = !0, p.pps = [_.data];
										break;
									case 9:
										w = !0, p.audFound = !0, A && D.pushAccessUnit(A, p), A = D.VideoSample = D.createVideoSample(!1, g.pts, g.dts, "");
										break;
									case 12:
										w = !0;
										break;
									default: w = !1, A && (A.debug += "unknown NAL " + _.type + " ");
								}
								A && w && A.units.push(_);
							}), _ && A && (this.pushAccessUnit(A, p), this.VideoSample = null);
						}, m.parseAVCNALu = function(p, m) {
							var g, _, x = m.byteLength, w = p.naluState || 0, D = w, O = [], A = 0, F = -1, U = 0;
							for (w === -1 && (F = 0, U = 31 & m[0], w = 0, A = 1); A < x;) if (g = m[A++], w) if (w !== 1) if (g) if (g === 1) {
								if (_ = A - w - 1, F >= 0) {
									var K = {
										data: m.subarray(F, _),
										type: U
									};
									O.push(K);
								} else {
									var oe = this.getLastNalUnit(p.samples);
									oe && (D && A <= 4 - D && oe.state && (oe.data = oe.data.subarray(0, oe.data.byteLength - D)), _ > 0 && (oe.data = be(oe.data, m.subarray(0, _)), oe.state = 0));
								}
								A < x ? (F = A, U = 31 & m[A], w = 0) : w = -1;
							} else w = 0;
							else w = 3;
							else w = g ? 0 : 2;
							else w = g ? 0 : 1;
							if (F >= 0 && w >= 0) {
								var le = {
									data: m.subarray(F, x),
									type: U,
									state: w
								};
								O.push(le);
							}
							if (O.length === 0) {
								var ue = this.getLastNalUnit(p.samples);
								ue && (ue.data = be(ue.data, m));
							}
							return p.naluState = w, O;
						}, t;
					}(Tr), kr = function() {
						function e(p, m, g) {
							this.keyData = void 0, this.decrypter = void 0, this.keyData = g, this.decrypter = new Zn(m, { removePKCS7Padding: !1 });
						}
						var p = e.prototype;
						return p.decryptBuffer = function(p) {
							return this.decrypter.decrypt(p, this.keyData.key.buffer, this.keyData.iv.buffer);
						}, p.decryptAacSample = function(p, m, g) {
							var _ = this, x = p[m].unit;
							if (!(x.length <= 16)) {
								var w = x.subarray(16, x.length - x.length % 16), D = w.buffer.slice(w.byteOffset, w.byteOffset + w.length);
								this.decryptBuffer(D).then(function(w) {
									var D = new Uint8Array(w);
									x.set(D, 16), _.decrypter.isSync() || _.decryptAacSamples(p, m + 1, g);
								});
							}
						}, p.decryptAacSamples = function(p, m, g) {
							for (;; m++) {
								if (m >= p.length) return void g();
								if (!(p[m].unit.length < 32 || (this.decryptAacSample(p, m, g), this.decrypter.isSync()))) return;
							}
						}, p.getAvcEncryptedData = function(p) {
							for (var m = 16 * Math.floor((p.length - 48) / 160) + 16, g = new Int8Array(m), _ = 0, x = 32; x < p.length - 16; x += 160, _ += 16) g.set(p.subarray(x, x + 16), _);
							return g;
						}, p.getAvcDecryptedUnit = function(p, m) {
							for (var g = new Uint8Array(m), _ = 0, x = 32; x < p.length - 16; x += 160, _ += 16) p.set(g.subarray(_, _ + 16), x);
							return p;
						}, p.decryptAvcSample = function(p, m, g, _, x) {
							var w = this, D = xe(x.data), O = this.getAvcEncryptedData(D);
							this.decryptBuffer(O.buffer).then(function(O) {
								x.data = w.getAvcDecryptedUnit(D, O), w.decrypter.isSync() || w.decryptAvcSamples(p, m, g + 1, _);
							});
						}, p.decryptAvcSamples = function(p, m, g, _) {
							if (p instanceof Uint8Array) throw Error("Cannot decrypt samples of type Uint8Array");
							for (;; m++, g = 0) {
								if (m >= p.length) return void _();
								for (var x = p[m].units; !(g >= x.length); g++) {
									var w = x[g];
									if (!(w.data.length <= 48 || w.type !== 1 && w.type !== 5 || (this.decryptAvcSample(p, m, g, _, w), this.decrypter.isSync()))) return;
								}
							}
						}, e;
					}(), Ar = 188, Pr = function() {
						function e(p, m, g) {
							this.observer = void 0, this.config = void 0, this.typeSupported = void 0, this.sampleAes = null, this.pmtParsed = !1, this.audioCodec = void 0, this.videoCodec = void 0, this._duration = 0, this._pmtId = -1, this._videoTrack = void 0, this._audioTrack = void 0, this._id3Track = void 0, this._txtTrack = void 0, this.aacOverFlow = null, this.remainderData = null, this.videoParser = void 0, this.observer = p, this.config = m, this.typeSupported = g, this.videoParser = new Or();
						}
						e.probe = function(p) {
							var m = e.syncOffset(p);
							return m > 0 && K.warn("MPEG2-TS detected but first sync word found @ offset " + m), m !== -1;
						}, e.syncOffset = function(p) {
							for (var m = p.length, g = Math.min(940, m - Ar) + 1, _ = 0; _ < g;) {
								for (var x = !1, w = -1, D = 0, O = _; O < m; O += Ar) {
									if (p[O] !== 71 || m - O !== Ar && p[O + Ar] !== 71) {
										if (D) return -1;
										break;
									}
									if (D++, w === -1 && (w = O) !== 0 && (g = Math.min(w + 18612, p.length - Ar) + 1), x ||= Wi(p, O) === 0, x && D > 1 && (w === 0 && D > 2 || O + Ar > g)) return w;
								}
								_++;
							}
							return -1;
						}, e.createTrack = function(p, m) {
							return {
								container: p === "video" || p === "audio" ? "video/mp2t" : void 0,
								type: p,
								id: rt[p],
								pid: -1,
								inputTimeScale: 9e4,
								sequenceNumber: 0,
								samples: [],
								dropped: 0,
								duration: p === "audio" ? m : void 0
							};
						};
						var p = e.prototype;
						return p.resetInitSegment = function(p, m, g, _) {
							this.pmtParsed = !1, this._pmtId = -1, this._videoTrack = e.createTrack("video"), this._audioTrack = e.createTrack("audio", _), this._id3Track = e.createTrack("id3"), this._txtTrack = e.createTrack("text"), this._audioTrack.segmentCodec = "aac", this.aacOverFlow = null, this.remainderData = null, this.audioCodec = m, this.videoCodec = g, this._duration = _;
						}, p.resetTimeStamp = function() {}, p.resetContiguity = function() {
							var p = this._audioTrack, m = this._videoTrack, g = this._id3Track;
							p && (p.pesData = null), m && (m.pesData = null), g && (g.pesData = null), this.aacOverFlow = null, this.remainderData = null;
						}, p.demux = function(p, m, g, _) {
							var x;
							g === void 0 && (g = !1), _ === void 0 && (_ = !1), g || (this.sampleAes = null);
							var w = this._videoTrack, D = this._audioTrack, O = this._id3Track, A = this._txtTrack, F = w.pid, U = w.pesData, oe = D.pid, le = O.pid, ue = D.pesData, we = O.pesData, je = null, Ie = this.pmtParsed, Be = this._pmtId, Ve = p.length;
							if (this.remainderData && (Ve = (p = be(this.remainderData, p)).length, this.remainderData = null), Ve < Ar && !_) return this.remainderData = p, {
								audioTrack: D,
								videoTrack: w,
								id3Track: O,
								textTrack: A
							};
							var Ue = Math.max(0, e.syncOffset(p));
							(Ve -= (Ve - Ue) % Ar) < p.byteLength && !_ && (this.remainderData = new Uint8Array(p.buffer, Ve, p.buffer.byteLength - Ve));
							for (var We = 0, Ke = Ue; Ke < Ve; Ke += Ar) if (p[Ke] === 71) {
								var qe = !!(64 & p[Ke + 1]), Ye = Wi(p, Ke), tt = void 0;
								if ((48 & p[Ke + 3]) >> 4 > 1) {
									if ((tt = Ke + 5 + p[Ke + 4]) === Ke + Ar) continue;
								} else tt = Ke + 4;
								switch (Ye) {
									case F:
										qe && (U && (x = Xi(U)) && this.videoParser.parseAVCPES(w, A, x, !1, this._duration), U = {
											data: [],
											size: 0
										}), U && (U.data.push(p.subarray(tt, Ke + Ar)), U.size += Ke + Ar - tt);
										break;
									case oe:
										if (qe) {
											if (ue && (x = Xi(ue))) switch (D.segmentCodec) {
												case "aac":
													this.parseAACPES(D, x);
													break;
												case "mp3": this.parseMPEGPES(D, x);
											}
											ue = {
												data: [],
												size: 0
											};
										}
										ue && (ue.data.push(p.subarray(tt, Ke + Ar)), ue.size += Ke + Ar - tt);
										break;
									case le:
										qe && (we && (x = Xi(we)) && this.parseID3PES(O, x), we = {
											data: [],
											size: 0
										}), we && (we.data.push(p.subarray(tt, Ke + Ar)), we.size += Ke + Ar - tt);
										break;
									case 0:
										qe && (tt += p[tt] + 1), Be = this._pmtId = ji(p, tt);
										break;
									case Be:
										qe && (tt += p[tt] + 1);
										var nt = Yi(p, tt, this.typeSupported, g, this.observer);
										(F = nt.videoPid) > 0 && (w.pid = F, w.segmentCodec = nt.segmentVideoCodec), (oe = nt.audioPid) > 0 && (D.pid = oe, D.segmentCodec = nt.segmentAudioCodec), (le = nt.id3Pid) > 0 && (O.pid = le), je === null || Ie || (K.warn("MPEG-TS PMT found at " + Ke + " after unknown PID '" + je + "'. Backtracking to sync byte @" + Ue + " to parse all TS packets."), je = null, Ke = Ue - 188), Ie = this.pmtParsed = !0;
										break;
									case 17:
									case 8191: break;
									default: je = Ye;
								}
							} else We++;
							We > 0 && qi(this.observer, Error("Found " + We + " TS packet/s that do not start with 0x47")), w.pesData = U, D.pesData = ue, O.pesData = we;
							var rt = {
								audioTrack: D,
								videoTrack: w,
								id3Track: O,
								textTrack: A
							};
							return _ && this.extractRemainingSamples(rt), rt;
						}, p.flush = function() {
							var p, m = this.remainderData;
							return this.remainderData = null, p = m ? this.demux(m, -1, !1, !0) : {
								videoTrack: this._videoTrack,
								audioTrack: this._audioTrack,
								id3Track: this._id3Track,
								textTrack: this._txtTrack
							}, this.extractRemainingSamples(p), this.sampleAes ? this.decrypt(p, this.sampleAes) : p;
						}, p.extractRemainingSamples = function(p) {
							var m, g = p.audioTrack, _ = p.videoTrack, x = p.id3Track, w = p.textTrack, D = _.pesData, O = g.pesData, A = x.pesData;
							if (D && (m = Xi(D)) ? (this.videoParser.parseAVCPES(_, w, m, !0, this._duration), _.pesData = null) : _.pesData = D, O && (m = Xi(O))) {
								switch (g.segmentCodec) {
									case "aac":
										this.parseAACPES(g, m);
										break;
									case "mp3": this.parseMPEGPES(g, m);
								}
								g.pesData = null;
							} else O != null && O.size && K.log("last AAC PES packet truncated,might overlap between fragments"), g.pesData = O;
							A && (m = Xi(A)) ? (this.parseID3PES(x, m), x.pesData = null) : x.pesData = A;
						}, p.demuxSampleAes = function(p, m, g) {
							var _ = this.demux(p, g, !0, !this.config.progressive), x = this.sampleAes = new kr(this.observer, this.config, m);
							return this.decrypt(_, x);
						}, p.decrypt = function(p, m) {
							return new Promise(function(g) {
								var _ = p.audioTrack, x = p.videoTrack;
								_.samples && _.segmentCodec === "aac" ? m.decryptAacSamples(_.samples, 0, function() {
									x.samples ? m.decryptAvcSamples(x.samples, 0, 0, function() {
										g(p);
									}) : g(p);
								}) : x.samples && m.decryptAvcSamples(x.samples, 0, 0, function() {
									g(p);
								});
							});
						}, p.destroy = function() {
							this._duration = 0;
						}, p.parseAACPES = function(p, m) {
							var g, _, x, w = 0, D = this.aacOverFlow, O = m.data;
							if (D) {
								this.aacOverFlow = null;
								var A = D.missing, F = D.sample.unit.byteLength;
								if (A === -1) O = be(D.sample.unit, O);
								else {
									var U = F - A;
									D.sample.unit.set(O.subarray(0, A), U), p.samples.push(D.sample), w = D.missing;
								}
							}
							for (g = w, _ = O.length; g < _ - 1 && !Ti(O, g); g++);
							if (g !== w) {
								var oe, le = g < _ - 1;
								if (oe = le ? "AAC PES did not start with ADTS header,offset:" + g : "No ADTS header found in AAC PES", qi(this.observer, Error(oe), le), !le) return;
							}
							if (Li(p, this.observer, O, g, this.audioCodec), m.pts !== void 0) x = m.pts;
							else {
								if (!D) return void K.warn("[tsdemuxer]: AAC PES unknown PTS");
								var ue = Ri(p.samplerate);
								x = D.sample.pts + ue;
							}
							for (var we, je = 0; g < _;) {
								if (g += (we = Ai(p, O, g, x, je)).length, we.missing) {
									this.aacOverFlow = we;
									break;
								}
								for (je++; g < _ - 1 && !Ti(O, g); g++);
							}
						}, p.parseMPEGPES = function(p, m) {
							var g = m.data, _ = g.length, x = 0, w = 0, D = m.pts;
							if (D !== void 0) for (; w < _;) if (Pi(g, w)) {
								var O = wi(p, g, w, D, x);
								if (!O) break;
								w += O.length, x++;
							} else w++;
							else K.warn("[tsdemuxer]: MPEG PES unknown PTS");
						}, p.parseAC3PES = function(p, m) {}, p.parseID3PES = function(p, m) {
							if (m.pts !== void 0) {
								var g = o({}, m, {
									type: this._videoTrack ? Xt : qt,
									duration: Infinity
								});
								p.samples.push(g);
							} else K.warn("[tsdemuxer]: ID3 PES unknown PTS");
						}, e;
					}();
					function Wi(p, m) {
						return ((31 & p[m + 1]) << 8) + p[m + 2];
					}
					function ji(p, m) {
						return (31 & p[m + 10]) << 8 | p[m + 11];
					}
					function Yi(p, m, g, _, x) {
						var w = {
							audioPid: -1,
							videoPid: -1,
							id3Pid: -1,
							segmentVideoCodec: "avc",
							segmentAudioCodec: "aac"
						}, D = m + 3 + ((15 & p[m + 1]) << 8 | p[m + 2]) - 4;
						for (m += 12 + ((15 & p[m + 10]) << 8 | p[m + 11]); m < D;) {
							var O = Wi(p, m), A = (15 & p[m + 3]) << 8 | p[m + 4];
							switch (p[m]) {
								case 207: if (!_) {
									zi("ADTS AAC");
									break;
								}
								case 15:
									w.audioPid === -1 && (w.audioPid = O);
									break;
								case 21:
									w.id3Pid === -1 && (w.id3Pid = O);
									break;
								case 219: if (!_) {
									zi("H.264");
									break;
								}
								case 27:
									w.videoPid === -1 && (w.videoPid = O, w.segmentVideoCodec = "avc");
									break;
								case 3:
								case 4:
									g.mpeg || g.mp3 ? w.audioPid === -1 && (w.audioPid = O, w.segmentAudioCodec = "mp3") : K.log("MPEG audio found, not supported in this browser");
									break;
								case 193: if (!_) {
									zi("AC-3");
									break;
								}
								case 129:
									K.warn("AC-3 in M2TS support not included in build");
									break;
								case 6:
									if (w.audioPid === -1 && A > 0) for (var F = m + 5, U = A; U > 2;) {
										p[F] === 106 && K.warn("AC-3 in M2TS support not included in build");
										var oe = p[F + 1] + 2;
										F += oe, U -= oe;
									}
									break;
								case 194:
								case 135: return qi(x, Error("Unsupported EC-3 in M2TS found")), w;
								case 36: return qi(x, Error("Unsupported HEVC in M2TS found")), w;
							}
							m += A + 5;
						}
						return w;
					}
					function qi(p, m, g) {
						K.warn("parsing error: " + m.message), p.emit(D.ERROR, D.ERROR, {
							type: O.MEDIA_ERROR,
							details: A.FRAG_PARSING_ERROR,
							fatal: !1,
							levelRetry: g,
							error: m,
							reason: m.message
						});
					}
					function zi(p) {
						K.log(p + " with AES-128-CBC encryption found in unencrypted stream");
					}
					function Xi(p) {
						var m, g, _, x, w, D = 0, O = p.data;
						if (!p || p.size === 0) return null;
						for (; O[0].length < 19 && O.length > 1;) O[0] = be(O[0], O[1]), O.splice(1, 1);
						if (((m = O[0])[0] << 16) + (m[1] << 8) + m[2] === 1) {
							if ((g = (m[4] << 8) + m[5]) && g > p.size - 6) return null;
							var A = m[7];
							192 & A && (x = 536870912 * (14 & m[9]) + 4194304 * (255 & m[10]) + 16384 * (254 & m[11]) + 128 * (255 & m[12]) + (254 & m[13]) / 2, 64 & A ? x - (w = 536870912 * (14 & m[14]) + 4194304 * (255 & m[15]) + 16384 * (254 & m[16]) + 128 * (255 & m[17]) + (254 & m[18]) / 2) > 54e5 && (K.warn(Math.round((x - w) / 9e4) + "s delta between PTS and DTS, align them"), x = w) : w = x);
							var F = (_ = m[8]) + 9;
							if (p.size <= F) return null;
							p.size -= F;
							for (var U = new Uint8Array(p.size), oe = 0, le = O.length; oe < le; oe++) {
								var ue = (m = O[oe]).byteLength;
								if (F) {
									if (F > ue) {
										F -= ue;
										continue;
									}
									m = m.subarray(F), ue -= F, F = 0;
								}
								U.set(m, D), D += ue;
							}
							return g && (g -= _ + 3), {
								data: U,
								pts: x,
								dts: w,
								len: g
							};
						}
						return null;
					}
					var Fr = function(p) {
						function t() {
							return p.apply(this, arguments) || this;
						}
						l(t, p);
						var m = t.prototype;
						return m.resetInitSegment = function(m, g, _, x) {
							p.prototype.resetInitSegment.call(this, m, g, _, x), this._audioTrack = {
								container: "audio/mpeg",
								type: "audio",
								id: 2,
								pid: -1,
								sequenceNumber: 0,
								segmentCodec: "mp3",
								samples: [],
								manifestCodec: g,
								duration: x,
								inputTimeScale: 9e4,
								dropped: 0
							};
						}, t.probe = function(p) {
							if (!p) return !1;
							var m = Y(p, 0), g = m?.length || 0;
							if (m && p[g] === 11 && p[g + 1] === 119 && X(m) !== void 0 && function(p, m) {
								var g = 0, _ = 5;
								m += _;
								for (var x = new Uint32Array(1), w = new Uint32Array(1), D = new Uint8Array(1); _ > 0;) {
									D[0] = p[m];
									var O = Math.min(_, 8), A = 8 - O;
									w[0] = 4278190080 >>> 24 + A << A, x[0] = (D[0] & w[0]) >> A, g = g ? g << O | x[0] : x[0], m += 1, _ -= O;
								}
								return g;
							}(p, g) <= 16) return !1;
							for (var _ = p.length; g < _; g++) if (Fi(p, g)) return K.log("MPEG Audio sync word found !"), !0;
							return !1;
						}, m.canParse = function(p, m) {
							return function(p, m) {
								return Ii(p, m) && 4 <= p.length - m;
							}(p, m);
						}, m.appendFrame = function(p, m, g) {
							if (this.basePTS !== null) return wi(p, m, g, this.basePTS, this.frameIndex);
						}, t;
					}(dr), Ir = function() {
						function e() {}
						return e.getSilentFrame = function(p, m) {
							if (p === "mp4a.40.2") {
								if (m === 1) return new Uint8Array([
									0,
									200,
									0,
									128,
									35,
									128
								]);
								if (m === 2) return new Uint8Array([
									33,
									0,
									73,
									144,
									2,
									25,
									0,
									35,
									128
								]);
								if (m === 3) return new Uint8Array([
									0,
									200,
									0,
									128,
									32,
									132,
									1,
									38,
									64,
									8,
									100,
									0,
									142
								]);
								if (m === 4) return new Uint8Array([
									0,
									200,
									0,
									128,
									32,
									132,
									1,
									38,
									64,
									8,
									100,
									0,
									128,
									44,
									128,
									8,
									2,
									56
								]);
								if (m === 5) return new Uint8Array([
									0,
									200,
									0,
									128,
									32,
									132,
									1,
									38,
									64,
									8,
									100,
									0,
									130,
									48,
									4,
									153,
									0,
									33,
									144,
									2,
									56
								]);
								if (m === 6) return new Uint8Array([
									0,
									200,
									0,
									128,
									32,
									132,
									1,
									38,
									64,
									8,
									100,
									0,
									130,
									48,
									4,
									153,
									0,
									33,
									144,
									2,
									0,
									178,
									0,
									32,
									8,
									224
								]);
							} else {
								if (m === 1) return new Uint8Array([
									1,
									64,
									34,
									128,
									163,
									78,
									230,
									128,
									186,
									8,
									0,
									0,
									0,
									28,
									6,
									241,
									193,
									10,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									94
								]);
								if (m === 2 || m === 3) return new Uint8Array([
									1,
									64,
									34,
									128,
									163,
									94,
									230,
									128,
									186,
									8,
									0,
									0,
									0,
									0,
									149,
									0,
									6,
									241,
									161,
									10,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									90,
									94
								]);
							}
						}, e;
					}(), Lr = 2 ** 32 - 1, Br = function() {
						function e() {}
						return e.init = function() {
							for (var p in e.types = {
								avc1: [],
								avcC: [],
								btrt: [],
								dinf: [],
								dref: [],
								esds: [],
								ftyp: [],
								hdlr: [],
								mdat: [],
								mdhd: [],
								mdia: [],
								mfhd: [],
								minf: [],
								moof: [],
								moov: [],
								mp4a: [],
								".mp3": [],
								dac3: [],
								"ac-3": [],
								mvex: [],
								mvhd: [],
								pasp: [],
								sdtp: [],
								stbl: [],
								stco: [],
								stsc: [],
								stsd: [],
								stsz: [],
								stts: [],
								tfdt: [],
								tfhd: [],
								traf: [],
								trak: [],
								trun: [],
								trex: [],
								tkhd: [],
								vmhd: [],
								smhd: []
							}, e.types) e.types.hasOwnProperty(p) && (e.types[p] = [
								p.charCodeAt(0),
								p.charCodeAt(1),
								p.charCodeAt(2),
								p.charCodeAt(3)
							]);
							var m = new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								118,
								105,
								100,
								101,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								86,
								105,
								100,
								101,
								111,
								72,
								97,
								110,
								100,
								108,
								101,
								114,
								0
							]), g = new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								115,
								111,
								117,
								110,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								83,
								111,
								117,
								110,
								100,
								72,
								97,
								110,
								100,
								108,
								101,
								114,
								0
							]);
							e.HDLR_TYPES = {
								video: m,
								audio: g
							};
							var _ = new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								12,
								117,
								114,
								108,
								32,
								0,
								0,
								0,
								1
							]), x = new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0
							]);
							e.STTS = e.STSC = e.STCO = x, e.STSZ = new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0
							]), e.VMHD = new Uint8Array([
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0
							]), e.SMHD = new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0
							]), e.STSD = new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1
							]);
							var w = new Uint8Array([
								105,
								115,
								111,
								109
							]), D = new Uint8Array([
								97,
								118,
								99,
								49
							]), O = new Uint8Array([
								0,
								0,
								0,
								1
							]);
							e.FTYP = e.box(e.types.ftyp, w, O, w, D), e.DINF = e.box(e.types.dinf, e.box(e.types.dref, _));
						}, e.box = function(p) {
							for (var m = 8, g = arguments.length, _ = Array(g > 1 ? g - 1 : 0), x = 1; x < g; x++) _[x - 1] = arguments[x];
							for (var w = _.length, D = w; w--;) m += _[w].byteLength;
							var O = new Uint8Array(m);
							for (O[0] = m >> 24 & 255, O[1] = m >> 16 & 255, O[2] = m >> 8 & 255, O[3] = 255 & m, O.set(p, 4), w = 0, m = 8; w < D; w++) O.set(_[w], m), m += _[w].byteLength;
							return O;
						}, e.hdlr = function(p) {
							return e.box(e.types.hdlr, e.HDLR_TYPES[p]);
						}, e.mdat = function(p) {
							return e.box(e.types.mdat, p);
						}, e.mdhd = function(p, m) {
							m *= p;
							var g = Math.floor(m / (Lr + 1)), _ = Math.floor(m % (Lr + 1));
							return e.box(e.types.mdhd, new Uint8Array([
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								2,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								3,
								p >> 24 & 255,
								p >> 16 & 255,
								p >> 8 & 255,
								255 & p,
								g >> 24,
								g >> 16 & 255,
								g >> 8 & 255,
								255 & g,
								_ >> 24,
								_ >> 16 & 255,
								_ >> 8 & 255,
								255 & _,
								85,
								196,
								0,
								0
							]));
						}, e.mdia = function(p) {
							return e.box(e.types.mdia, e.mdhd(p.timescale, p.duration), e.hdlr(p.type), e.minf(p));
						}, e.mfhd = function(p) {
							return e.box(e.types.mfhd, new Uint8Array([
								0,
								0,
								0,
								0,
								p >> 24,
								p >> 16 & 255,
								p >> 8 & 255,
								255 & p
							]));
						}, e.minf = function(p) {
							return p.type === "audio" ? e.box(e.types.minf, e.box(e.types.smhd, e.SMHD), e.DINF, e.stbl(p)) : e.box(e.types.minf, e.box(e.types.vmhd, e.VMHD), e.DINF, e.stbl(p));
						}, e.moof = function(p, m, g) {
							return e.box(e.types.moof, e.mfhd(p), e.traf(g, m));
						}, e.moov = function(p) {
							for (var m = p.length, g = []; m--;) g[m] = e.trak(p[m]);
							return e.box.apply(null, [e.types.moov, e.mvhd(p[0].timescale, p[0].duration)].concat(g, e.mvex(p)));
						}, e.mvex = function(p) {
							for (var m = p.length, g = []; m--;) g[m] = e.trex(p[m]);
							return e.box.apply(null, [e.types.mvex].concat(g));
						}, e.mvhd = function(p, m) {
							m *= p;
							var g = Math.floor(m / (Lr + 1)), _ = Math.floor(m % (Lr + 1)), x = new Uint8Array([
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								2,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								3,
								p >> 24 & 255,
								p >> 16 & 255,
								p >> 8 & 255,
								255 & p,
								g >> 24,
								g >> 16 & 255,
								g >> 8 & 255,
								255 & g,
								_ >> 24,
								_ >> 16 & 255,
								_ >> 8 & 255,
								255 & _,
								0,
								1,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								64,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								255,
								255,
								255,
								255
							]);
							return e.box(e.types.mvhd, x);
						}, e.sdtp = function(p) {
							var m, g, _ = p.samples || [], x = new Uint8Array(4 + _.length);
							for (m = 0; m < _.length; m++) g = _[m].flags, x[m + 4] = g.dependsOn << 4 | g.isDependedOn << 2 | g.hasRedundancy;
							return e.box(e.types.sdtp, x);
						}, e.stbl = function(p) {
							return e.box(e.types.stbl, e.stsd(p), e.box(e.types.stts, e.STTS), e.box(e.types.stsc, e.STSC), e.box(e.types.stsz, e.STSZ), e.box(e.types.stco, e.STCO));
						}, e.avc1 = function(p) {
							var m, g, _, x = [], w = [];
							for (m = 0; m < p.sps.length; m++) _ = (g = p.sps[m]).byteLength, x.push(_ >>> 8 & 255), x.push(255 & _), x = x.concat(Array.prototype.slice.call(g));
							for (m = 0; m < p.pps.length; m++) _ = (g = p.pps[m]).byteLength, w.push(_ >>> 8 & 255), w.push(255 & _), w = w.concat(Array.prototype.slice.call(g));
							var D = e.box(e.types.avcC, new Uint8Array([
								1,
								x[3],
								x[4],
								x[5],
								255,
								224 | p.sps.length
							].concat(x, [p.pps.length], w))), O = p.width, A = p.height, F = p.pixelRatio[0], U = p.pixelRatio[1];
							return e.box(e.types.avc1, new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								O >> 8 & 255,
								255 & O,
								A >> 8 & 255,
								255 & A,
								0,
								72,
								0,
								0,
								0,
								72,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								18,
								100,
								97,
								105,
								108,
								121,
								109,
								111,
								116,
								105,
								111,
								110,
								47,
								104,
								108,
								115,
								46,
								106,
								115,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								24,
								17,
								17
							]), D, e.box(e.types.btrt, new Uint8Array([
								0,
								28,
								156,
								128,
								0,
								45,
								198,
								192,
								0,
								45,
								198,
								192
							])), e.box(e.types.pasp, new Uint8Array([
								F >> 24,
								F >> 16 & 255,
								F >> 8 & 255,
								255 & F,
								U >> 24,
								U >> 16 & 255,
								U >> 8 & 255,
								255 & U
							])));
						}, e.esds = function(p) {
							var m = p.config.length;
							return new Uint8Array([
								0,
								0,
								0,
								0,
								3,
								23 + m,
								0,
								1,
								0,
								4,
								15 + m,
								64,
								21,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								5,
								m
							].concat(p.config, [
								6,
								1,
								2
							]));
						}, e.audioStsd = function(p) {
							var m = p.samplerate;
							return new Uint8Array([
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								p.channelCount,
								0,
								16,
								0,
								0,
								0,
								0,
								m >> 8 & 255,
								255 & m,
								0,
								0
							]);
						}, e.mp4a = function(p) {
							return e.box(e.types.mp4a, e.audioStsd(p), e.box(e.types.esds, e.esds(p)));
						}, e.mp3 = function(p) {
							return e.box(e.types[".mp3"], e.audioStsd(p));
						}, e.ac3 = function(p) {
							return e.box(e.types["ac-3"], e.audioStsd(p), e.box(e.types.dac3, p.config));
						}, e.stsd = function(p) {
							return p.type === "audio" ? p.segmentCodec === "mp3" && p.codec === "mp3" ? e.box(e.types.stsd, e.STSD, e.mp3(p)) : p.segmentCodec === "ac3" ? e.box(e.types.stsd, e.STSD, e.ac3(p)) : e.box(e.types.stsd, e.STSD, e.mp4a(p)) : e.box(e.types.stsd, e.STSD, e.avc1(p));
						}, e.tkhd = function(p) {
							var m = p.id, g = p.duration * p.timescale, _ = p.width, x = p.height, w = Math.floor(g / (Lr + 1)), D = Math.floor(g % (Lr + 1));
							return e.box(e.types.tkhd, new Uint8Array([
								1,
								0,
								0,
								7,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								2,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								3,
								m >> 24 & 255,
								m >> 16 & 255,
								m >> 8 & 255,
								255 & m,
								0,
								0,
								0,
								0,
								w >> 24,
								w >> 16 & 255,
								w >> 8 & 255,
								255 & w,
								D >> 24,
								D >> 16 & 255,
								D >> 8 & 255,
								255 & D,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								64,
								0,
								0,
								0,
								_ >> 8 & 255,
								255 & _,
								0,
								0,
								x >> 8 & 255,
								255 & x,
								0,
								0
							]));
						}, e.traf = function(p, m) {
							var g = e.sdtp(p), _ = p.id, x = Math.floor(m / (Lr + 1)), w = Math.floor(m % (Lr + 1));
							return e.box(e.types.traf, e.box(e.types.tfhd, new Uint8Array([
								0,
								0,
								0,
								0,
								_ >> 24,
								_ >> 16 & 255,
								_ >> 8 & 255,
								255 & _
							])), e.box(e.types.tfdt, new Uint8Array([
								1,
								0,
								0,
								0,
								x >> 24,
								x >> 16 & 255,
								x >> 8 & 255,
								255 & x,
								w >> 24,
								w >> 16 & 255,
								w >> 8 & 255,
								255 & w
							])), e.trun(p, g.length + 16 + 20 + 8 + 16 + 8 + 8), g);
						}, e.trak = function(p) {
							return p.duration = p.duration || 4294967295, e.box(e.types.trak, e.tkhd(p), e.mdia(p));
						}, e.trex = function(p) {
							var m = p.id;
							return e.box(e.types.trex, new Uint8Array([
								0,
								0,
								0,
								0,
								m >> 24,
								m >> 16 & 255,
								m >> 8 & 255,
								255 & m,
								0,
								0,
								0,
								1,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								0,
								1,
								0,
								1
							]));
						}, e.trun = function(p, m) {
							var g, _, x, w, D, O, A = p.samples || [], F = A.length, U = 12 + 16 * F, K = new Uint8Array(U);
							for (m += 8 + U, K.set([
								p.type === "video" ? 1 : 0,
								0,
								15,
								1,
								F >>> 24 & 255,
								F >>> 16 & 255,
								F >>> 8 & 255,
								255 & F,
								m >>> 24 & 255,
								m >>> 16 & 255,
								m >>> 8 & 255,
								255 & m
							], 0), g = 0; g < F; g++) x = (_ = A[g]).duration, w = _.size, D = _.flags, O = _.cts, K.set([
								x >>> 24 & 255,
								x >>> 16 & 255,
								x >>> 8 & 255,
								255 & x,
								w >>> 24 & 255,
								w >>> 16 & 255,
								w >>> 8 & 255,
								255 & w,
								D.isLeading << 2 | D.dependsOn,
								D.isDependedOn << 6 | D.hasRedundancy << 4 | D.paddingValue << 1 | D.isNonSync,
								61440 & D.degradPrio,
								15 & D.degradPrio,
								O >>> 24 & 255,
								O >>> 16 & 255,
								O >>> 8 & 255,
								255 & O
							], 12 + 16 * g);
							return e.box(e.types.trun, K);
						}, e.initSegment = function(p) {
							e.types || e.init();
							var m = e.moov(p);
							return be(e.FTYP, m);
						}, e;
					}();
					function ea(p, m) {
						return m === void 0 && (m = !1), function(p, m, g, _) {
							g === void 0 && (g = 1), _ === void 0 && (_ = !1);
							var x = p * m * g;
							return _ ? Math.round(x) : x;
						}(p, 1e3, 1 / 9e4, m);
					}
					Br.types = void 0, Br.HDLR_TYPES = void 0, Br.STTS = void 0, Br.STSC = void 0, Br.STCO = void 0, Br.STSZ = void 0, Br.VMHD = void 0, Br.SMHD = void 0, Br.STSD = void 0, Br.FTYP = void 0, Br.DINF = void 0;
					var Vr = null, Ur = null, Wr = function() {
						function e(p, m, g, _) {
							if (this.observer = void 0, this.config = void 0, this.typeSupported = void 0, this.ISGenerated = !1, this._initPTS = null, this._initDTS = null, this.nextAvcDts = null, this.nextAudioPts = null, this.videoSampleDuration = null, this.isAudioContiguous = !1, this.isVideoContiguous = !1, this.videoTrackConfig = void 0, this.observer = p, this.config = m, this.typeSupported = g, this.ISGenerated = !1, Vr === null) {
								var x = (navigator.userAgent || "").match(/Chrome\/(\d+)/i);
								Vr = x ? parseInt(x[1]) : 0;
							}
							if (Ur === null) {
								var w = navigator.userAgent.match(/Safari\/(\d+)/i);
								Ur = w ? parseInt(w[1]) : 0;
							}
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.config = this.videoTrackConfig = this._initPTS = this._initDTS = null;
						}, p.resetTimeStamp = function(p) {
							K.log("[mp4-remuxer]: initPTS & initDTS reset"), this._initPTS = this._initDTS = p;
						}, p.resetNextTimestamp = function() {
							K.log("[mp4-remuxer]: reset next timestamp"), this.isVideoContiguous = !1, this.isAudioContiguous = !1;
						}, p.resetInitSegment = function() {
							K.log("[mp4-remuxer]: ISGenerated flag reset"), this.ISGenerated = !1, this.videoTrackConfig = void 0;
						}, p.getVideoStartPts = function(p) {
							var m = !1, g = p[0].pts, _ = p.reduce(function(p, _) {
								var x = _.pts, w = x - p;
								return w < -4294967296 && (m = !0, w = (x = aa(x, g)) - p), w > 0 ? p : x;
							}, g);
							return m && K.debug("PTS rollover detected"), _;
						}, p.remux = function(p, m, g, _, x, w, D, O) {
							var A, F, U, oe, le, ue, we = x, je = x, Ie = p.pid > -1, Be = m.pid > -1, Ve = m.samples.length, Ue = p.samples.length > 0, We = D && Ve > 0 || Ve > 1;
							if ((!Ie || Ue) && (!Be || We) || this.ISGenerated || D) {
								if (this.ISGenerated) {
									var Ke, qe, Ye, tt, nt = this.videoTrackConfig;
									!nt || m.width === nt.width && m.height === nt.height && (Ke = m.pixelRatio)?.[0] === (qe = nt.pixelRatio)?.[0] && (Ye = m.pixelRatio)?.[1] === (tt = nt.pixelRatio)?.[1] || this.resetInitSegment();
								} else U = this.generateIS(p, m, x, w);
								var rt, it = this.isVideoContiguous, at = -1;
								if (We && (at = function(p) {
									for (var m = 0; m < p.length; m++) if (p[m].key) return m;
									return -1;
								}(m.samples), !it && this.config.forceKeyFrameOnDiscontinuity)) if (ue = !0, at > 0) {
									K.warn("[mp4-remuxer]: Dropped " + at + " out of " + Ve + " video samples due to a missing keyframe");
									var ot = this.getVideoStartPts(m.samples);
									m.samples = m.samples.slice(at), m.dropped += at, rt = je += (m.samples[0].pts - ot) / m.inputTimeScale;
								} else at === -1 && (K.warn("[mp4-remuxer]: No keyframe found out of " + Ve + " video samples"), ue = !1);
								if (this.ISGenerated) {
									if (Ue && We) {
										var st = this.getVideoStartPts(m.samples), ct = (aa(p.samples[0].pts, st) - st) / m.inputTimeScale;
										we += Math.max(0, ct), je += Math.max(0, -ct);
									}
									if (Ue) {
										if (p.samplerate || (K.warn("[mp4-remuxer]: regenerate InitSegment as audio detected"), U = this.generateIS(p, m, x, w)), F = this.remuxAudio(p, we, this.isAudioContiguous, w, Be || We || O === Lt ? je : void 0), We) {
											var dt = F ? F.endPTS - F.startPTS : 0;
											m.inputTimeScale || (K.warn("[mp4-remuxer]: regenerate InitSegment as video detected"), U = this.generateIS(p, m, x, w)), A = this.remuxVideo(m, je, it, dt);
										}
									} else We && (A = this.remuxVideo(m, je, it, 0));
									A && (A.firstKeyFrame = at, A.independent = at !== -1, A.firstKeyFramePTS = rt);
								}
							}
							return this.ISGenerated && this._initPTS && this._initDTS && (g.samples.length && (le = na(g, x, this._initPTS, this._initDTS)), _.samples.length && (oe = sa(_, x, this._initPTS))), {
								audio: F,
								video: A,
								initSegment: U,
								independent: ue,
								text: oe,
								id3: le
							};
						}, p.generateIS = function(p, m, g, _) {
							var x, w, D, O = p.samples, A = m.samples, F = this.typeSupported, U = {}, K = this._initPTS, oe = !K || _, le = "audio/mp4";
							if (oe && (x = w = Infinity), p.config && O.length) {
								switch (p.timescale = p.samplerate, p.segmentCodec) {
									case "mp3":
										F.mpeg ? (le = "audio/mpeg", p.codec = "") : F.mp3 && (p.codec = "mp3");
										break;
									case "ac3": p.codec = "ac-3";
								}
								U.audio = {
									id: "audio",
									container: le,
									codec: p.codec,
									initSegment: p.segmentCodec === "mp3" && F.mpeg ? new Uint8Array() : Br.initSegment([p]),
									metadata: { channelCount: p.channelCount }
								}, oe && (D = p.inputTimeScale, K && D === K.timescale ? oe = !1 : x = w = O[0].pts - Math.round(D * g));
							}
							if (m.sps && m.pps && A.length) {
								if (m.timescale = m.inputTimeScale, U.video = {
									id: "main",
									container: "video/mp4",
									codec: m.codec,
									initSegment: Br.initSegment([m]),
									metadata: {
										width: m.width,
										height: m.height
									}
								}, oe) if (D = m.inputTimeScale, K && D === K.timescale) oe = !1;
								else {
									var ue = this.getVideoStartPts(A), we = Math.round(D * g);
									w = Math.min(w, aa(A[0].dts, ue) - we), x = Math.min(x, ue - we);
								}
								this.videoTrackConfig = {
									width: m.width,
									height: m.height,
									pixelRatio: m.pixelRatio
								};
							}
							if (Object.keys(U).length) return this.ISGenerated = !0, oe ? (this._initPTS = {
								baseTime: x,
								timescale: D
							}, this._initDTS = {
								baseTime: w,
								timescale: D
							}) : x = D = void 0, {
								tracks: U,
								initPTS: x,
								timescale: D
							};
						}, p.remuxVideo = function(p, m, g, _) {
							var x, w, F = p.inputTimeScale, U = p.samples, oe = [], le = U.length, ue = this._initPTS, we = this.nextAvcDts, je = 8, Ie = this.videoSampleDuration, Be = Infinity, Ve = -Infinity, Ue = !1;
							if (!g || we === null) {
								var We = m * F, Ke = U[0].pts - aa(U[0].dts, U[0].pts);
								Vr && we !== null && Math.abs(We - Ke - we) < 15e3 ? g = !0 : we = We - Ke;
							}
							for (var qe = ue.baseTime * F / ue.timescale, Ye = 0; Ye < le; Ye++) {
								var tt = U[Ye];
								tt.pts = aa(tt.pts - qe, we), tt.dts = aa(tt.dts - qe, we), tt.dts < U[Ye > 0 ? Ye - 1 : Ye].dts && (Ue = !0);
							}
							Ue && U.sort(function(p, m) {
								var g = p.dts - m.dts, _ = p.pts - m.pts;
								return g || _;
							}), x = U[0].dts;
							var nt = (w = U[U.length - 1].dts) - x, rt = nt ? Math.round(nt / (le - 1)) : Ie || p.inputTimeScale / 30;
							if (g) {
								var it = x - we, at = it > rt, ot = it < -1;
								if ((at || ot) && (at ? K.warn("AVC: " + ea(it, !0) + " ms (" + it + "dts) hole between fragments detected at " + m.toFixed(3)) : K.warn("AVC: " + ea(-it, !0) + " ms (" + it + "dts) overlapping between fragments detected at " + m.toFixed(3)), !ot || we >= U[0].pts || Vr)) {
									x = we;
									var st = U[0].pts - it;
									if (at) U[0].dts = x, U[0].pts = st;
									else for (var ct = 0; ct < U.length && !(U[ct].dts > st); ct++) U[ct].dts -= it, U[ct].pts -= it;
									K.log("Video: Initial PTS/DTS adjusted: " + ea(st, !0) + "/" + ea(x, !0) + ", delta: " + ea(it, !0) + " ms");
								}
							}
							for (var dt = 0, gt = 0, _t = x = Math.max(0, x), vt = 0; vt < le; vt++) {
								for (var bt = U[vt], xt = bt.units, St = xt.length, Tt = 0, kt = 0; kt < St; kt++) Tt += xt[kt].data.length;
								gt += Tt, dt += St, bt.length = Tt, bt.dts < _t ? (bt.dts = _t, _t += rt / 4 | 0 || 1) : _t = bt.dts, Be = Math.min(bt.pts, Be), Ve = Math.max(bt.pts, Ve);
							}
							w = U[le - 1].dts;
							var At, Lt = gt + 4 * dt + 8;
							try {
								At = new Uint8Array(Lt);
							} catch (p) {
								return void this.observer.emit(D.ERROR, D.ERROR, {
									type: O.MUX_ERROR,
									details: A.REMUX_ALLOC_ERROR,
									fatal: !1,
									error: p,
									bytes: Lt,
									reason: "fail allocating video mdat " + Lt
								});
							}
							var Rt = new DataView(At.buffer);
							Rt.setUint32(0, Lt), At.set(Br.types.mdat, 4);
							for (var zt = !1, qt = Infinity, Jt = Infinity, Xt = -Infinity, Zt = -Infinity, Qt = 0; Qt < le; Qt++) {
								for (var $t = U[Qt], en = $t.units, tn = 0, nn = 0, rn = en.length; nn < rn; nn++) {
									var an = en[nn], on = an.data, sn = an.data.byteLength;
									Rt.setUint32(je, sn), je += 4, At.set(on, je), je += sn, tn += 4 + sn;
								}
								var cn = void 0;
								if (Qt < le - 1) Ie = U[Qt + 1].dts - $t.dts, cn = U[Qt + 1].pts - $t.pts;
								else {
									var ln = this.config, un = Qt > 0 ? $t.dts - U[Qt - 1].dts : rt;
									if (cn = Qt > 0 ? $t.pts - U[Qt - 1].pts : rt, ln.stretchShortVideoTrack && this.nextAudioPts !== null) {
										var dn = Math.floor(ln.maxBufferHole * F), pn = (_ ? Be + _ * F : this.nextAudioPts) - $t.pts;
										pn > dn ? ((Ie = pn - un) < 0 ? Ie = un : zt = !0, K.log("[mp4-remuxer]: It is approximately " + pn / 90 + " ms to the next segment; using duration " + Ie / 90 + " ms for the last video frame.")) : Ie = un;
									} else Ie = un;
								}
								var mn = Math.round($t.pts - $t.dts);
								qt = Math.min(qt, Ie), Xt = Math.max(Xt, Ie), Jt = Math.min(Jt, cn), Zt = Math.max(Zt, cn), oe.push(new oa($t.key, Ie, tn, mn));
							}
							if (oe.length) {
								if (Vr) {
									if (Vr < 70) {
										var hn = oe[0].flags;
										hn.dependsOn = 2, hn.isNonSync = 0;
									}
								} else if (Ur && Zt - Jt < Xt - qt && rt / Xt < .025 && oe[0].cts === 0) {
									K.warn("Found irregular gaps in sample duration. Using PTS instead of DTS to determine MP4 sample duration.");
									for (var gn = x, _n = 0, vn = oe.length; _n < vn; _n++) {
										var yn = gn + oe[_n].duration, bn = gn + oe[_n].cts;
										if (_n < vn - 1) {
											var xn = yn + oe[_n + 1].cts;
											oe[_n].duration = xn - bn;
										} else oe[_n].duration = _n ? oe[_n - 1].duration : rt;
										oe[_n].cts = 0, gn = yn;
									}
								}
							}
							Ie = zt || !Ie ? rt : Ie, this.nextAvcDts = we = w + Ie, this.videoSampleDuration = Ie, this.isVideoContiguous = !0;
							var Sn = {
								data1: Br.moof(p.sequenceNumber++, x, o({}, p, { samples: oe })),
								data2: At,
								startPTS: Be / F,
								endPTS: (Ve + Ie) / F,
								startDTS: x / F,
								endDTS: we / F,
								type: "video",
								hasAudio: !1,
								hasVideo: !0,
								nb: oe.length,
								dropped: p.dropped
							};
							return p.samples = [], p.dropped = 0, Sn;
						}, p.getSamplesPerFrame = function(p) {
							switch (p.segmentCodec) {
								case "mp3": return 1152;
								case "ac3": return 1536;
								default: return 1024;
							}
						}, p.remuxAudio = function(p, m, g, _, x) {
							var w = p.inputTimeScale, F = w / (p.samplerate ? p.samplerate : w), U = this.getSamplesPerFrame(p), oe = U * F, le = this._initPTS, ue = p.segmentCodec === "mp3" && this.typeSupported.mpeg, we = [], je = x !== void 0, Ie = p.samples, Be = ue ? 0 : 8, Ve = this.nextAudioPts || -1, Ue = m * w, We = le.baseTime * w / le.timescale;
							if (this.isAudioContiguous = g ||= Ie.length && Ve > 0 && (_ && Math.abs(Ue - Ve) < 9e3 || Math.abs(aa(Ie[0].pts - We, Ue) - Ve) < 20 * oe), Ie.forEach(function(p) {
								p.pts = aa(p.pts - We, Ue);
							}), !g || Ve < 0) {
								if (Ie = Ie.filter(function(p) {
									return p.pts >= 0;
								}), !Ie.length) return;
								Ve = x === 0 ? 0 : _ && !je ? Math.max(0, Ue) : Ie[0].pts;
							}
							if (p.segmentCodec === "aac") for (var Ke = this.config.maxAudioFramesDrift, qe = 0, Ye = Ve; qe < Ie.length; qe++) {
								var tt = Ie[qe], nt = tt.pts, rt = nt - Ye, it = Math.abs(1e3 * rt / w);
								if (rt <= -Ke * oe && je) qe === 0 && (K.warn("Audio frame @ " + (nt / w).toFixed(3) + "s overlaps nextAudioPts by " + Math.round(1e3 * rt / w) + " ms."), this.nextAudioPts = Ve = Ye = nt);
								else if (rt >= Ke * oe && it < 1e4 && je) {
									var at = Math.round(rt / oe);
									(Ye = nt - at * oe) < 0 && (at--, Ye += oe), qe === 0 && (this.nextAudioPts = Ve = Ye), K.warn("[mp4-remuxer]: Injecting " + at + " audio frame @ " + (Ye / w).toFixed(3) + "s due to " + Math.round(1e3 * rt / w) + " ms gap.");
									for (var ot = 0; ot < at; ot++) {
										var st = Math.max(Ye, 0), ct = Ir.getSilentFrame(p.manifestCodec || p.codec, p.channelCount);
										ct || (K.log("[mp4-remuxer]: Unable to get silent frame for given audio codec; duplicating last frame instead."), ct = tt.unit.subarray()), Ie.splice(qe, 0, {
											unit: ct,
											pts: st
										}), Ye += oe, qe++;
									}
								}
								tt.pts = Ye, Ye += oe;
							}
							for (var dt, gt = null, _t = null, vt = 0, bt = Ie.length; bt--;) vt += Ie[bt].unit.byteLength;
							for (var xt = 0, St = Ie.length; xt < St; xt++) {
								var Tt = Ie[xt], kt = Tt.unit, At = Tt.pts;
								if (_t !== null) we[xt - 1].duration = Math.round((At - _t) / F);
								else {
									if (g && p.segmentCodec === "aac" && (At = Ve), gt = At, !(vt > 0)) return;
									vt += Be;
									try {
										dt = new Uint8Array(vt);
									} catch (p) {
										return void this.observer.emit(D.ERROR, D.ERROR, {
											type: O.MUX_ERROR,
											details: A.REMUX_ALLOC_ERROR,
											fatal: !1,
											error: p,
											bytes: vt,
											reason: "fail allocating audio mdat " + vt
										});
									}
									ue || (new DataView(dt.buffer).setUint32(0, vt), dt.set(Br.types.mdat, 4));
								}
								dt.set(kt, Be);
								var Lt = kt.byteLength;
								Be += Lt, we.push(new oa(!0, U, Lt, 0)), _t = At;
							}
							var Rt = we.length;
							if (Rt) {
								var zt = we[we.length - 1];
								this.nextAudioPts = Ve = _t + F * zt.duration;
								var qt = ue ? new Uint8Array() : Br.moof(p.sequenceNumber++, gt / F, o({}, p, { samples: we }));
								p.samples = [];
								var Jt = gt / w, Xt = Ve / w, Zt = {
									data1: qt,
									data2: dt,
									startPTS: Jt,
									endPTS: Xt,
									startDTS: Jt,
									endDTS: Xt,
									type: "audio",
									hasAudio: !0,
									hasVideo: !1,
									nb: Rt
								};
								return this.isAudioContiguous = !0, Zt;
							}
						}, p.remuxEmptyAudio = function(p, m, g, _) {
							var x = p.inputTimeScale, w = x / (p.samplerate ? p.samplerate : x), D = this.nextAudioPts, O = this._initDTS, A = 9e4 * O.baseTime / O.timescale, F = (D === null ? _.startDTS * x : D) + A, U = _.endDTS * x + A, oe = 1024 * w, le = Math.ceil((U - F) / oe), ue = Ir.getSilentFrame(p.manifestCodec || p.codec, p.channelCount);
							if (K.warn("[mp4-remuxer]: remux empty Audio"), ue) {
								for (var we = [], je = 0; je < le; je++) {
									var Ie = F + je * oe;
									we.push({
										unit: ue,
										pts: Ie,
										dts: Ie
									});
								}
								return p.samples = we, this.remuxAudio(p, m, g, !1);
							}
							K.trace("[mp4-remuxer]: Unable to remuxEmptyAudio since we were unable to get a silent frame for given audio codec");
						}, e;
					}();
					function aa(p, m) {
						var g;
						if (m === null) return p;
						for (g = m < p ? -8589934592 : 8589934592; Math.abs(p - m) > 4294967296;) p += g;
						return p;
					}
					function na(p, m, g, _) {
						var x = p.samples.length;
						if (x) {
							for (var w = p.inputTimeScale, D = 0; D < x; D++) {
								var O = p.samples[D];
								O.pts = aa(O.pts - g.baseTime * w / g.timescale, m * w) / w, O.dts = aa(O.dts - _.baseTime * w / _.timescale, m * w) / w;
							}
							var A = p.samples;
							return p.samples = [], { samples: A };
						}
					}
					function sa(p, m, g) {
						var _ = p.samples.length;
						if (_) {
							for (var x = p.inputTimeScale, w = 0; w < _; w++) {
								var D = p.samples[w];
								D.pts = aa(D.pts - g.baseTime * x / g.timescale, m * x) / x;
							}
							p.samples.sort(function(p, m) {
								return p.pts - m.pts;
							});
							var O = p.samples;
							return p.samples = [], { samples: O };
						}
					}
					var oa = function(p, m, g, _) {
						this.size = void 0, this.duration = void 0, this.cts = void 0, this.flags = void 0, this.duration = m, this.size = g, this.cts = _, this.flags = {
							isLeading: 0,
							isDependedOn: 0,
							hasRedundancy: 0,
							degradPrio: 0,
							dependsOn: p ? 2 : 1,
							isNonSync: p ? 0 : 1
						};
					}, Kr = function() {
						function e() {
							this.emitInitSegment = !1, this.audioCodec = void 0, this.videoCodec = void 0, this.initData = void 0, this.initPTS = null, this.initTracks = void 0, this.lastEndTime = null;
						}
						var p = e.prototype;
						return p.destroy = function() {}, p.resetTimeStamp = function(p) {
							this.initPTS = p, this.lastEndTime = null;
						}, p.resetNextTimestamp = function() {
							this.lastEndTime = null;
						}, p.resetInitSegment = function(p, m, g, _) {
							this.audioCodec = m, this.videoCodec = g, this.generateInitSegment(Re(p, _)), this.emitInitSegment = !0;
						}, p.generateInitSegment = function(p) {
							var m = this.audioCodec, g = this.videoCodec;
							if (p == null || !p.byteLength) return this.initTracks = void 0, void (this.initData = void 0);
							var _ = this.initData = ye(p);
							_.audio && (m = ua(_.audio, je)), _.video && (g = ua(_.video, Ie));
							var x = {};
							_.audio && _.video ? x.audiovideo = {
								container: "video/mp4",
								codec: m + "," + g,
								initSegment: p,
								id: "main"
							} : _.audio ? x.audio = {
								container: "audio/mp4",
								codec: m,
								initSegment: p,
								id: "audio"
							} : _.video ? x.video = {
								container: "video/mp4",
								codec: g,
								initSegment: p,
								id: "main"
							} : K.warn("[passthrough-remuxer.ts]: initSegment does not contain moov or trak boxes."), this.initTracks = x;
						}, p.remux = function(p, m, g, x, w, D) {
							var O, A, F = this.initPTS, U = this.lastEndTime, oe = {
								audio: void 0,
								video: void 0,
								text: x,
								id3: g,
								initSegment: void 0
							};
							_(U) || (U = this.lastEndTime = w || 0);
							var le = m.samples;
							if (le == null || !le.length) return oe;
							var ue = {
								initPTS: void 0,
								timescale: 1
							}, we = this.initData;
							if ((O = we) != null && O.length || (this.generateInitSegment(le), we = this.initData), (A = we) == null || !A.length) return K.warn("[passthrough-remuxer.ts]: Failed to generate initSegment."), oe;
							this.emitInitSegment && (ue.tracks = this.initTracks, this.emitInitSegment = !1);
							var Be = function(p, m) {
								for (var g = 0, x = 0, w = 0, D = me(p, ["moof", "traf"]), O = 0; O < D.length; O++) {
									var A = D[O], F = me(A, ["tfhd"])[0], U = m[fe(F, 4)];
									if (U) {
										var K = U.default, oe = fe(F, 0) | K?.flags, le = K?.duration;
										8 & oe && (le = fe(F, 2 & oe ? 12 : 8));
										for (var ue = U.timescale || 9e4, we = me(A, ["trun"]), Be = 0; Be < we.length; Be++) !(g = Ae(we[Be])) && le && (g = le * fe(we[Be], 4)), U.type === Ie ? x += g / ue : U.type === je && (w += g / ue);
									}
								}
								if (x === 0 && w === 0) {
									for (var Ve = Infinity, Ue = 0, We = 0, Ke = me(p, ["sidx"]), qe = 0; qe < Ke.length; qe++) {
										var Ye = pe(Ke[qe]);
										if (Ye != null && Ye.references) {
											Ve = Math.min(Ve, Ye.earliestPresentationTime / Ye.timescale);
											var tt = Ye.references.reduce(function(p, m) {
												return p + m.info.duration || 0;
											}, 0);
											We = (Ue = Math.max(Ue, tt + Ye.earliestPresentationTime / Ye.timescale)) - Ve;
										}
									}
									if (We && _(We)) return We;
								}
								return x || w;
							}(le, we), Ve = function(p, m) {
								return me(m, ["moof", "traf"]).reduce(function(m, g) {
									var x = me(g, ["tfdt"])[0], w = x[0], D = me(g, ["tfhd"]).reduce(function(m, g) {
										var D = fe(g, 4), O = p[D];
										if (O) {
											var A = fe(x, 4);
											if (w === 1) {
												if (A === tt) return K.warn("[mp4-demuxer]: Ignoring assumed invalid signed 64-bit track fragment decode time"), m;
												A *= tt + 1, A += fe(x, 8);
											}
											var F = A / (O.timescale || 9e4);
											if (_(F) && (m === null || F < m)) return F;
										}
										return m;
									}, null);
									return D !== null && _(D) && (m === null || D < m) ? D : m;
								}, null);
							}(we, le), Ue = Ve === null ? w : Ve;
							(function(p, m, g, _) {
								if (p === null) return !0;
								var x = Math.max(_, 1), w = m - p.baseTime / p.timescale;
								return Math.abs(w - g) > x;
							}(F, Ue, w, Be) || ue.timescale !== F.timescale && D) && (ue.initPTS = Ue - w, F && F.timescale === 1 && K.warn("Adjusting initPTS by " + (ue.initPTS - F.baseTime)), this.initPTS = F = {
								baseTime: ue.initPTS,
								timescale: 1
							});
							var We = p ? Ue - F.baseTime / F.timescale : U, Ke = We + Be;
							(function(p, m, g) {
								me(m, ["moof", "traf"]).forEach(function(m) {
									me(m, ["tfhd"]).forEach(function(_) {
										var x = fe(_, 4), w = p[x];
										if (w) {
											var D = w.timescale || 9e4;
											me(m, ["tfdt"]).forEach(function(p) {
												var m = p[0], _ = g * D;
												if (_) {
													var x = fe(p, 4);
													if (m === 0) x -= _, ge(p, 4, x = Math.max(x, 0));
													else {
														x *= 2 ** 32, x += fe(p, 8), x -= _, x = Math.max(x, 0);
														var w = Math.floor(x / (tt + 1)), O = Math.floor(x % (tt + 1));
														ge(p, 4, w), ge(p, 8, O);
													}
												}
											});
										}
									});
								});
							})(we, le, F.baseTime / F.timescale), Be > 0 ? this.lastEndTime = Ke : (K.warn("Duration parsed from mp4 should be greater than zero"), this.resetNextTimestamp());
							var qe = !!we.audio, Ye = !!we.video, nt = "";
							qe && (nt += "audio"), Ye && (nt += "video");
							var rt = {
								data1: le,
								startPTS: We,
								startDTS: We,
								endPTS: Ke,
								endDTS: Ke,
								type: nt,
								hasAudio: qe,
								hasVideo: Ye,
								nb: 1,
								dropped: 0
							};
							return oe.audio = rt.type === "audio" ? rt : void 0, oe.video = rt.type === "audio" ? void 0 : rt, oe.initSegment = ue, oe.id3 = na(g, w, F, F), x.samples.length && (oe.text = sa(x, w, F)), oe;
						}, e;
					}();
					function ua(p, m) {
						var g = p?.codec;
						if (g && g.length > 4) return g;
						if (m === je) {
							if (g === "ec-3" || g === "ac-3" || g === "alac") return g;
							if (g === "fLaC" || g === "Opus") return Ge(g, !1);
							var _ = "mp4a.40.5";
							return K.info("Parsed audio codec \"" + g + "\" or audio object type not handled. Using \"" + _ + "\""), _;
						}
						return K.warn("Unhandled video codec \"" + g + "\""), g === "hvc1" || g === "hev1" ? "hvc1.1.6.L120.90" : g === "av01" ? "av01.0.04M.08" : "avc1.42e01e";
					}
					var Jr, Zr = typeof self < "u" ? self : void 0;
					try {
						Jr = self.performance.now.bind(self.performance);
					} catch {
						K.debug("Unable to use Performance API on this environment"), Jr = Zr?.Date.now;
					}
					var Qr = [
						{
							demux: Cr,
							remux: Kr
						},
						{
							demux: Pr,
							remux: Wr
						},
						{
							demux: xr,
							remux: Wr
						},
						{
							demux: Fr,
							remux: Wr
						}
					], $r = function() {
						function e(p, m, g, _, x) {
							this.async = !1, this.observer = void 0, this.typeSupported = void 0, this.config = void 0, this.vendor = void 0, this.id = void 0, this.demuxer = void 0, this.remuxer = void 0, this.decrypter = void 0, this.probe = void 0, this.decryptionPromise = null, this.transmuxConfig = void 0, this.currentTransmuxState = void 0, this.observer = p, this.typeSupported = m, this.config = g, this.vendor = _, this.id = x;
						}
						var p = e.prototype;
						return p.configure = function(p) {
							this.transmuxConfig = p, this.decrypter && this.decrypter.reset();
						}, p.push = function(p, m, g, _) {
							var x = this, w = g.transmuxing;
							w.executeStart = Jr();
							var F = new Uint8Array(p), U = this.currentTransmuxState, oe = this.transmuxConfig;
							_ && (this.currentTransmuxState = _);
							var le = _ || U, ue = le.contiguous, we = le.discontinuity, je = le.trackSwitch, Ie = le.accurateTimeOffset, Be = le.timeOffset, Ve = le.initSegmentChange, Ue = oe.audioCodec, We = oe.videoCodec, Ke = oe.defaultInitPts, qe = oe.duration, Ye = oe.initSegmentData, tt = function(p, m) {
								var g = null;
								return p.byteLength > 0 && m?.key != null && m.iv !== null && m.method != null && (g = m), g;
							}(F, m);
							if (tt && tt.method === "AES-128") {
								var nt = this.getDecrypter();
								if (!nt.isSync()) return this.decryptionPromise = nt.webCryptoDecrypt(F, tt.key.buffer, tt.iv.buffer).then(function(p) {
									var m = x.push(p, null, g);
									return x.decryptionPromise = null, m;
								}), this.decryptionPromise;
								var rt = nt.softwareDecrypt(F, tt.key.buffer, tt.iv.buffer);
								if (g.part > -1 && (rt = nt.flush()), !rt) return w.executeEnd = Jr(), va(g);
								F = new Uint8Array(rt);
							}
							var it = this.needsProbing(we, je);
							if (it) {
								var at = this.configureTransmuxer(F);
								if (at) return K.warn("[transmuxer] " + at.message), this.observer.emit(D.ERROR, D.ERROR, {
									type: O.MEDIA_ERROR,
									details: A.FRAG_PARSING_ERROR,
									fatal: !1,
									error: at,
									reason: at.message
								}), w.executeEnd = Jr(), va(g);
							}
							(we || je || Ve || it) && this.resetInitSegment(Ye, Ue, We, qe, m), (we || Ve || it) && this.resetInitialTimestamp(Ke), ue || this.resetContiguity();
							var ot = this.transmux(F, tt, Be, Ie, g), st = this.currentTransmuxState;
							return st.contiguous = !0, st.discontinuity = !1, st.trackSwitch = !1, w.executeEnd = Jr(), ot;
						}, p.flush = function(p) {
							var m = this, g = p.transmuxing;
							g.executeStart = Jr();
							var _ = this.decrypter, x = this.currentTransmuxState, w = this.decryptionPromise;
							if (w) return w.then(function() {
								return m.flush(p);
							});
							var D = [], O = x.timeOffset;
							if (_) {
								var A = _.flush();
								A && D.push(this.push(A, null, p));
							}
							var F = this.demuxer, U = this.remuxer;
							if (!F || !U) return g.executeEnd = Jr(), [va(p)];
							var K = F.flush(O);
							return ga(K) ? K.then(function(g) {
								return m.flushRemux(D, g, p), D;
							}) : (this.flushRemux(D, K, p), D);
						}, p.flushRemux = function(p, m, g) {
							var _ = m.audioTrack, x = m.videoTrack, w = m.id3Track, D = m.textTrack, O = this.currentTransmuxState, A = O.accurateTimeOffset, F = O.timeOffset;
							K.log("[transmuxer.ts]: Flushed fragment " + g.sn + (g.part > -1 ? " p: " + g.part : "") + " of level " + g.level);
							var U = this.remuxer.remux(_, x, w, D, F, A, !0, this.id);
							p.push({
								remuxResult: U,
								chunkMeta: g
							}), g.transmuxing.executeEnd = Jr();
						}, p.resetInitialTimestamp = function(p) {
							var m = this.demuxer, g = this.remuxer;
							m && g && (m.resetTimeStamp(p), g.resetTimeStamp(p));
						}, p.resetContiguity = function() {
							var p = this.demuxer, m = this.remuxer;
							p && m && (p.resetContiguity(), m.resetNextTimestamp());
						}, p.resetInitSegment = function(p, m, g, _, x) {
							var w = this.demuxer, D = this.remuxer;
							w && D && (w.resetInitSegment(p, m, g, _), D.resetInitSegment(p, m, g, x));
						}, p.destroy = function() {
							this.demuxer && (this.demuxer.destroy(), this.demuxer = void 0), this.remuxer && (this.remuxer.destroy(), this.remuxer = void 0);
						}, p.transmux = function(p, m, g, _, x) {
							return m && m.method === "SAMPLE-AES" ? this.transmuxSampleAes(p, m, g, _, x) : this.transmuxUnencrypted(p, g, _, x);
						}, p.transmuxUnencrypted = function(p, m, g, _) {
							var x = this.demuxer.demux(p, m, !1, !this.config.progressive), w = x.audioTrack, D = x.videoTrack, O = x.id3Track, A = x.textTrack;
							return {
								remuxResult: this.remuxer.remux(w, D, O, A, m, g, !1, this.id),
								chunkMeta: _
							};
						}, p.transmuxSampleAes = function(p, m, g, _, x) {
							var w = this;
							return this.demuxer.demuxSampleAes(p, m, g).then(function(p) {
								return {
									remuxResult: w.remuxer.remux(p.audioTrack, p.videoTrack, p.id3Track, p.textTrack, g, _, !1, w.id),
									chunkMeta: x
								};
							});
						}, p.configureTransmuxer = function(p) {
							for (var m, g = this.config, _ = this.observer, x = this.typeSupported, w = this.vendor, D = 0, O = Qr.length; D < O; D++) {
								var A;
								if ((A = Qr[D].demux) != null && A.probe(p)) {
									m = Qr[D];
									break;
								}
							}
							if (!m) return Error("Failed to find demuxer by probing fragment data");
							var F = this.demuxer, U = this.remuxer, K = m.remux, oe = m.demux;
							U && U instanceof K || (this.remuxer = new K(_, g, x, w)), F && F instanceof oe || (this.demuxer = new oe(_, g, x), this.probe = oe.probe);
						}, p.needsProbing = function(p, m) {
							return !this.demuxer || !this.remuxer || p || m;
						}, p.getDecrypter = function() {
							var p = this.decrypter;
							return p ||= this.decrypter = new Zn(this.config), p;
						}, e;
					}(), va = function(p) {
						return {
							remuxResult: {},
							chunkMeta: p
						};
					};
					function ga(p) {
						return "then" in p && p.then instanceof Function;
					}
					var ma = function(p, m, g, _, x) {
						this.audioCodec = void 0, this.videoCodec = void 0, this.initSegmentData = void 0, this.duration = void 0, this.defaultInitPts = void 0, this.audioCodec = p, this.videoCodec = m, this.initSegmentData = g, this.duration = _, this.defaultInitPts = x || null;
					}, pa = function(p, m, g, _, x, w) {
						this.discontinuity = void 0, this.contiguous = void 0, this.accurateTimeOffset = void 0, this.trackSwitch = void 0, this.timeOffset = void 0, this.initSegmentChange = void 0, this.discontinuity = p, this.contiguous = m, this.accurateTimeOffset = g, this.trackSwitch = _, this.timeOffset = x, this.initSegmentChange = w;
					}, ti = { exports: {} };
					(function(p) {
						var m = Object.prototype.hasOwnProperty, g = "~";
						function i() {}
						function a(p, m, g) {
							this.fn = p, this.context = m, this.once = g || !1;
						}
						function n(p, m, _, x, w) {
							if (typeof _ != "function") throw TypeError("The listener must be a function");
							var D = new a(_, x || p, w), O = g ? g + m : m;
							return p._events[O] ? p._events[O].fn ? p._events[O] = [p._events[O], D] : p._events[O].push(D) : (p._events[O] = D, p._eventsCount++), p;
						}
						function s(p, m) {
							--p._eventsCount == 0 ? p._events = new i() : delete p._events[m];
						}
						function o() {
							this._events = new i(), this._eventsCount = 0;
						}
						Object.create && (i.prototype = Object.create(null), new i().__proto__ || (g = !1)), o.prototype.eventNames = function() {
							var p, _, x = [];
							if (this._eventsCount === 0) return x;
							for (_ in p = this._events) m.call(p, _) && x.push(g ? _.slice(1) : _);
							return Object.getOwnPropertySymbols ? x.concat(Object.getOwnPropertySymbols(p)) : x;
						}, o.prototype.listeners = function(p) {
							var m = g ? g + p : p, _ = this._events[m];
							if (!_) return [];
							if (_.fn) return [_.fn];
							for (var x = 0, w = _.length, D = Array(w); x < w; x++) D[x] = _[x].fn;
							return D;
						}, o.prototype.listenerCount = function(p) {
							var m = g ? g + p : p, _ = this._events[m];
							return _ ? _.fn ? 1 : _.length : 0;
						}, o.prototype.emit = function(p, m, _, x, w, D) {
							var O = g ? g + p : p;
							if (!this._events[O]) return !1;
							var A, F, U = this._events[O], K = arguments.length;
							if (U.fn) {
								switch (U.once && this.removeListener(p, U.fn, void 0, !0), K) {
									case 1: return U.fn.call(U.context), !0;
									case 2: return U.fn.call(U.context, m), !0;
									case 3: return U.fn.call(U.context, m, _), !0;
									case 4: return U.fn.call(U.context, m, _, x), !0;
									case 5: return U.fn.call(U.context, m, _, x, w), !0;
									case 6: return U.fn.call(U.context, m, _, x, w, D), !0;
								}
								for (F = 1, A = Array(K - 1); F < K; F++) A[F - 1] = arguments[F];
								U.fn.apply(U.context, A);
							} else {
								var oe, le = U.length;
								for (F = 0; F < le; F++) switch (U[F].once && this.removeListener(p, U[F].fn, void 0, !0), K) {
									case 1:
										U[F].fn.call(U[F].context);
										break;
									case 2:
										U[F].fn.call(U[F].context, m);
										break;
									case 3:
										U[F].fn.call(U[F].context, m, _);
										break;
									case 4:
										U[F].fn.call(U[F].context, m, _, x);
										break;
									default:
										if (!A) for (oe = 1, A = Array(K - 1); oe < K; oe++) A[oe - 1] = arguments[oe];
										U[F].fn.apply(U[F].context, A);
								}
							}
							return !0;
						}, o.prototype.on = function(p, m, g) {
							return n(this, p, m, g, !1);
						}, o.prototype.once = function(p, m, g) {
							return n(this, p, m, g, !0);
						}, o.prototype.removeListener = function(p, m, _, x) {
							var w = g ? g + p : p;
							if (!this._events[w]) return this;
							if (!m) return s(this, w), this;
							var D = this._events[w];
							if (D.fn) D.fn !== m || x && !D.once || _ && D.context !== _ || s(this, w);
							else {
								for (var O = 0, A = [], F = D.length; O < F; O++) (D[O].fn !== m || x && !D[O].once || _ && D[O].context !== _) && A.push(D[O]);
								A.length ? this._events[w] = A.length === 1 ? A[0] : A : s(this, w);
							}
							return this;
						}, o.prototype.removeAllListeners = function(p) {
							var m;
							return p ? (m = g ? g + p : p, this._events[m] && s(this, m)) : (this._events = new i(), this._eventsCount = 0), this;
						}, o.prototype.off = o.prototype.removeListener, o.prototype.addListener = o.prototype.on, o.prefixed = g, o.EventEmitter = o, p.exports = o;
					})(ti);
					var ni = c(ti.exports);
					function Ta(p, m) {
						if (!((g = m.remuxResult).audio || g.video || g.text || g.id3 || g.initSegment)) return !1;
						var g, _ = [], x = m.remuxResult, w = x.audio, D = x.video;
						return w && Sa(_, w), D && Sa(_, D), p.postMessage({
							event: "transmuxComplete",
							data: m
						}, _), !0;
					}
					function Sa(p, m) {
						m.data1 && p.push(m.data1.buffer), m.data2 && p.push(m.data2.buffer);
					}
					function La(p, m, g) {
						m.reduce(function(m, g) {
							return Ta(p, g) || m;
						}, !1) || p.postMessage({
							event: "transmuxComplete",
							data: m[0]
						}), p.postMessage({
							event: "flush",
							data: g
						});
					}
					m !== void 0 && m && function(p) {
						var m = new ni(), r = function(m, g) {
							p.postMessage({
								event: m,
								data: g
							});
						};
						m.on(D.FRAG_DECRYPTED, r), m.on(D.ERROR, r);
						var i = function() {
							var e = function(p) {
								var t = function(m) {
									r("workerLog", {
										logType: p,
										message: m
									});
								};
								K[p] = t;
							};
							for (var p in K) e(p);
						};
						p.addEventListener("message", function(g) {
							var _ = g.data;
							switch (_.cmd) {
								case "init":
									var x = JSON.parse(_.config);
									p.transmuxer = new $r(m, _.typeSupported, x, "", _.id), k(x.debug, _.id), i(), r("init", null);
									break;
								case "configure":
									p.transmuxer.configure(_.config);
									break;
								case "demux":
									var w = p.transmuxer.push(_.data, _.decryptdata, _.chunkMeta, _.state);
									ga(w) ? (p.transmuxer.async = !0, w.then(function(m) {
										Ta(p, m);
									}).catch(function(p) {
										r(D.ERROR, {
											type: O.MEDIA_ERROR,
											details: A.FRAG_PARSING_ERROR,
											chunkMeta: _.chunkMeta,
											fatal: !1,
											error: p,
											err: p,
											reason: "transmuxer-worker push error"
										});
									})) : (p.transmuxer.async = !1, Ta(p, w));
									break;
								case "flush":
									var F = _.chunkMeta, U = p.transmuxer.flush(F);
									ga(U) || p.transmuxer.async ? (ga(U) || (U = Promise.resolve(U)), U.then(function(m) {
										La(p, m, F);
									}).catch(function(p) {
										r(D.ERROR, {
											type: O.MEDIA_ERROR,
											details: A.FRAG_PARSING_ERROR,
											chunkMeta: _.chunkMeta,
											fatal: !1,
											error: p,
											err: p,
											reason: "transmuxer-worker flush error"
										});
									})) : La(p, U, F);
							}
						});
					}(self);
					var ri = function() {
						function t(p, m, g, _) {
							var x = this;
							this.error = null, this.hls = void 0, this.id = void 0, this.observer = void 0, this.frag = null, this.part = null, this.useWorker = void 0, this.workerContext = null, this.onwmsg = void 0, this.transmuxer = null, this.onTransmuxComplete = void 0, this.onFlush = void 0;
							var w = p.config;
							this.hls = p, this.id = m, this.useWorker = !!w.enableWorker, this.onTransmuxComplete = g, this.onFlush = _;
							var o = function(p, m) {
								(m ||= {}).frag = x.frag, m.id = x.id, p === D.ERROR && (x.error = m.error), x.hls.trigger(p, m);
							};
							this.observer = new ni(), this.observer.on(D.FRAG_DECRYPTED, o), this.observer.on(D.ERROR, o);
							var F, U, oe, le, ue = Ce(w.preferManagedMediaSource) || { isTypeSupported: function() {
								return !1;
							} }, we = {
								mpeg: ue.isTypeSupported("audio/mpeg"),
								mp3: ue.isTypeSupported("audio/mp4; codecs=\"mp3\""),
								ac3: !1
							};
							if (!this.useWorker || typeof Worker > "u" || (w.workerPath, 0)) this.transmuxer = new $r(this.observer, we, w, "", m);
							else try {
								w.workerPath ? (K.log("loading Web Worker " + w.workerPath + " for \"" + m + "\""), this.workerContext = (oe = w.workerPath, le = new self.URL(oe, self.location.href).href, {
									worker: new self.Worker(le),
									scriptURL: le
								})) : (K.log("injecting Web Worker for \"" + m + "\""), this.workerContext = (F = new self.Blob(["var exports={};var module={exports:exports};function define(f){f()};define.amd=true;(" + e.toString() + ")(true);"], { type: "text/javascript" }), U = self.URL.createObjectURL(F), {
									worker: new self.Worker(U),
									objectURL: U
								})), this.onwmsg = function(p) {
									return x.onWorkerMessage(p);
								};
								var je = this.workerContext.worker;
								je.addEventListener("message", this.onwmsg), je.onerror = function(p) {
									var g = Error(p.message + "  (" + p.filename + ":" + p.lineno + ")");
									w.enableWorker = !1, K.warn("Error in \"" + m + "\" Web Worker, fallback to inline"), x.hls.trigger(D.ERROR, {
										type: O.OTHER_ERROR,
										details: A.INTERNAL_EXCEPTION,
										fatal: !1,
										event: "demuxerWorker",
										error: g
									});
								}, je.postMessage({
									cmd: "init",
									typeSupported: we,
									vendor: "",
									id: m,
									config: JSON.stringify(w)
								});
							} catch (p) {
								K.warn("Error setting up \"" + m + "\" Web Worker, fallback to inline", p), this.resetWorker(), this.error = null, this.transmuxer = new $r(this.observer, we, w, "", m);
							}
						}
						var p = t.prototype;
						return p.resetWorker = function() {
							if (this.workerContext) {
								var p = this.workerContext, m = p.worker, g = p.objectURL;
								g && self.URL.revokeObjectURL(g), m.removeEventListener("message", this.onwmsg), m.onerror = null, m.terminate(), this.workerContext = null;
							}
						}, p.destroy = function() {
							if (this.workerContext) this.resetWorker(), this.onwmsg = void 0;
							else {
								var p = this.transmuxer;
								p && (p.destroy(), this.transmuxer = null);
							}
							var m = this.observer;
							m && m.removeAllListeners(), this.frag = null, this.observer = null, this.hls = null;
						}, p.push = function(p, m, g, _, x, w, D, O, A, F) {
							var U, oe, le = this;
							A.transmuxing.start = self.performance.now();
							var ue = this.transmuxer, we = w ? w.start : x.start, je = x.decryptdata, Ie = this.frag, Be = !(Ie && x.cc === Ie.cc), Ve = !(Ie && A.level === Ie.level), Ue = Ie ? A.sn - Ie.sn : -1, We = this.part ? A.part - this.part.index : -1, Ke = Ue === 0 && A.id > 1 && A.id === Ie?.stats.chunkCount, qe = !Ve && (Ue === 1 || Ue === 0 && (We === 1 || Ke && We <= 0)), Ye = self.performance.now();
							(Ve || Ue || x.stats.parsing.start === 0) && (x.stats.parsing.start = Ye), !w || !We && qe || (w.stats.parsing.start = Ye);
							var tt = !(Ie && (U = x.initSegment)?.url === (oe = Ie.initSegment)?.url), nt = new pa(Be, qe, O, Ve, we, tt);
							if (!qe || Be || tt) {
								K.log("[transmuxer-interface, " + x.type + "]: Starting new transmux session for sn: " + A.sn + " p: " + A.part + " level: " + A.level + " id: " + A.id + "\n        discontinuity: " + Be + "\n        trackSwitch: " + Ve + "\n        contiguous: " + qe + "\n        accurateTimeOffset: " + O + "\n        timeOffset: " + we + "\n        initSegmentChange: " + tt);
								var rt = new ma(g, _, m, D, F);
								this.configureTransmuxer(rt);
							}
							if (this.frag = x, this.part = w, this.workerContext) this.workerContext.worker.postMessage({
								cmd: "demux",
								data: p,
								decryptdata: je,
								chunkMeta: A,
								state: nt
							}, p instanceof ArrayBuffer ? [p] : []);
							else if (ue) {
								var it = ue.push(p, je, A, nt);
								ga(it) ? (ue.async = !0, it.then(function(p) {
									le.handleTransmuxComplete(p);
								}).catch(function(p) {
									le.transmuxerError(p, A, "transmuxer-interface push error");
								})) : (ue.async = !1, this.handleTransmuxComplete(it));
							}
						}, p.flush = function(p) {
							var m = this;
							p.transmuxing.start = self.performance.now();
							var g = this.transmuxer;
							if (this.workerContext) this.workerContext.worker.postMessage({
								cmd: "flush",
								chunkMeta: p
							});
							else if (g) {
								var _ = g.flush(p);
								ga(_) || g.async ? (ga(_) || (_ = Promise.resolve(_)), _.then(function(g) {
									m.handleFlushResult(g, p);
								}).catch(function(g) {
									m.transmuxerError(g, p, "transmuxer-interface flush error");
								})) : this.handleFlushResult(_, p);
							}
						}, p.transmuxerError = function(p, m, g) {
							this.hls && (this.error = p, this.hls.trigger(D.ERROR, {
								type: O.MEDIA_ERROR,
								details: A.FRAG_PARSING_ERROR,
								chunkMeta: m,
								frag: this.frag || void 0,
								fatal: !1,
								error: p,
								err: p,
								reason: g
							}));
						}, p.handleFlushResult = function(p, m) {
							var g = this;
							p.forEach(function(p) {
								g.handleTransmuxComplete(p);
							}), this.onFlush(m);
						}, p.onWorkerMessage = function(p) {
							var m = p.data;
							if (m != null && m.event) {
								var g = this.hls;
								if (this.hls) switch (m.event) {
									case "init":
										var _, x = (_ = this.workerContext)?.objectURL;
										x && self.URL.revokeObjectURL(x);
										break;
									case "transmuxComplete":
										this.handleTransmuxComplete(m.data);
										break;
									case "flush":
										this.onFlush(m.data);
										break;
									case "workerLog":
										K[m.data.logType] && K[m.data.logType](m.data.message);
										break;
									default: m.data = m.data || {}, m.data.frag = this.frag, m.data.id = this.id, g.trigger(m.event, m.data);
								}
							} else K.warn("worker message received with no " + (m ? "event name" : "data"));
						}, p.configureTransmuxer = function(p) {
							var m = this.transmuxer;
							this.workerContext ? this.workerContext.worker.postMessage({
								cmd: "configure",
								config: p
							}) : m && m.configure(p);
						}, p.handleTransmuxComplete = function(p) {
							p.chunkMeta.transmuxing.end = self.performance.now(), this.onTransmuxComplete(p);
						}, t;
					}(), ii = function() {
						function e(p, m, g, _) {
							this.config = void 0, this.media = null, this.fragmentTracker = void 0, this.hls = void 0, this.nudgeRetry = 0, this.stallReported = !1, this.stalled = null, this.moved = !1, this.seeking = !1, this.config = p, this.media = m, this.fragmentTracker = g, this.hls = _;
						}
						var p = e.prototype;
						return p.destroy = function() {
							this.media = null, this.hls = this.fragmentTracker = null;
						}, p.poll = function(p, m) {
							var g = this.config, _ = this.media, x = this.stalled;
							if (_ !== null) {
								var w = _.currentTime, D = _.seeking, O = this.seeking && !D, A = !this.seeking && D;
								if (this.seeking = D, w === p) if (A || O) this.stalled = null;
								else if (_.paused && !D || _.ended || _.playbackRate === 0 || !Sn.getBuffered(_).length) this.nudgeRetry = 0;
								else {
									var F = Sn.bufferInfo(_, w, 0), U = F.nextStart || 0;
									if (D) {
										var oe = F.len > 2, le = !U || m && m.start <= w || U - w > 2 && !this.fragmentTracker.getPartialFragment(w);
										if (oe || le) return;
										this.moved = !1;
									}
									if (!this.moved && this.stalled !== null) {
										var ue;
										if (!(F.len > 0 || U)) return;
										var we = Math.max(U, F.start || 0) - w, je = this.hls.levels ? this.hls.levels[this.hls.currentLevel] : null, Ie = !(je == null || (ue = je.details) == null) && ue.live ? 2 * je.details.targetduration : 2, Be = this.fragmentTracker.getPartialFragment(w);
										if (we > 0 && (we <= Ie || Be)) return void (_.paused || this._trySkipBufferHole(Be));
									}
									var Ve = self.performance.now();
									if (x !== null) {
										var Ue = Ve - x;
										if (D || !(Ue >= 250) || (this._reportStall(F), this.media)) {
											var We = Sn.bufferInfo(_, w, g.maxBufferHole);
											this._tryFixBufferStall(We, Ue);
										}
									} else this.stalled = Ve;
								}
								else if (this.moved = !0, D || (this.nudgeRetry = 0), x !== null) {
									if (this.stallReported) {
										var Ke = self.performance.now() - x;
										K.warn("playback not stuck anymore @" + w + ", after " + Math.round(Ke) + "ms"), this.stallReported = !1;
									}
									this.stalled = null;
								}
							}
						}, p._tryFixBufferStall = function(p, m) {
							var g = this.config, _ = this.fragmentTracker, x = this.media;
							if (x !== null) {
								var w = x.currentTime, D = _.getPartialFragment(w);
								if (D && (this._trySkipBufferHole(D) || !this.media)) return;
								(p.len > g.maxBufferHole || p.nextStart && p.nextStart - w < g.maxBufferHole) && m > 1e3 * g.highBufferWatchdogPeriod && (K.warn("Trying to nudge playhead over buffer-hole"), this.stalled = null, this._tryNudgeBuffer());
							}
						}, p._reportStall = function(p) {
							var m = this.hls, g = this.media;
							if (!this.stallReported && g) {
								this.stallReported = !0;
								var _ = Error("Playback stalling at @" + g.currentTime + " due to low buffer (" + JSON.stringify(p) + ")");
								K.warn(_.message), m.trigger(D.ERROR, {
									type: O.MEDIA_ERROR,
									details: A.BUFFER_STALLED_ERROR,
									fatal: !1,
									error: _,
									buffer: p.len
								});
							}
						}, p._trySkipBufferHole = function(p) {
							var m = this.config, g = this.hls, _ = this.media;
							if (_ === null) return 0;
							var x = _.currentTime, w = Sn.bufferInfo(_, x, 0), F = x < w.start ? w.start : w.nextStart;
							if (F) {
								var U = w.len <= m.maxBufferHole, oe = w.len > 0 && w.len < 1 && _.readyState < 3, le = F - x;
								if (le > 0 && (U || oe)) {
									if (le > m.maxBufferHole) {
										var ue = this.fragmentTracker, we = !1;
										if (x === 0) {
											var je = ue.getAppendedFrag(0, At);
											je && F < je.end && (we = !0);
										}
										if (!we) {
											var Ie = p || ue.getAppendedFrag(x, At);
											if (Ie) {
												for (var Be = !1, Ve = Ie.end; Ve < F;) {
													var Ue = ue.getPartialFragment(Ve);
													if (!Ue) {
														Be = !0;
														break;
													}
													Ve += Ue.duration;
												}
												if (Be) return 0;
											}
										}
									}
									var We = Math.max(F + .05, x + .1);
									if (K.warn("skipping hole, adjusting currentTime from " + x + " to " + We), this.moved = !0, this.stalled = null, _.currentTime = We, p && !p.gap) {
										var Ke = Error("fragment loaded with buffer holes, seeking from " + x + " to " + We);
										g.trigger(D.ERROR, {
											type: O.MEDIA_ERROR,
											details: A.BUFFER_SEEK_OVER_HOLE,
											fatal: !1,
											error: Ke,
											reason: Ke.message,
											frag: p
										});
									}
									return We;
								}
							}
							return 0;
						}, p._tryNudgeBuffer = function() {
							var p = this.config, m = this.hls, g = this.media, _ = this.nudgeRetry;
							if (g !== null) {
								var x = g.currentTime;
								if (this.nudgeRetry++, _ < p.nudgeMaxRetry) {
									var w = x + (_ + 1) * p.nudgeOffset, F = Error("Nudging 'currentTime' from " + x + " to " + w);
									K.warn(F.message), g.currentTime = w, m.trigger(D.ERROR, {
										type: O.MEDIA_ERROR,
										details: A.BUFFER_NUDGE_ON_STALL,
										error: F,
										fatal: !1
									});
								} else {
									var U = Error("Playhead still not moving while enough data buffered @" + x + " after " + p.nudgeMaxRetry + " nudges");
									K.error(U.message), m.trigger(D.ERROR, {
										type: O.MEDIA_ERROR,
										details: A.BUFFER_STALLED_ERROR,
										error: U,
										fatal: !0
									});
								}
							}
						}, e;
					}(), ai = function(p) {
						function t(m, g, _) {
							var x;
							return (x = p.call(this, m, g, _, "[stream-controller]", At) || this).audioCodecSwap = !1, x.gapController = null, x.level = -1, x._forceStartLoad = !1, x.altAudio = !1, x.audioOnly = !1, x.fragPlaying = null, x.onvplaying = null, x.onvseeked = null, x.fragLastKbps = 0, x.couldBacktrack = !1, x.backtrackFragment = null, x.audioCodecSwitch = !1, x.videoBuffer = null, x._registerListeners(), x;
						}
						l(t, p);
						var m = t.prototype;
						return m._registerListeners = function() {
							var p = this.hls;
							p.on(D.MEDIA_ATTACHED, this.onMediaAttached, this), p.on(D.MEDIA_DETACHING, this.onMediaDetaching, this), p.on(D.MANIFEST_LOADING, this.onManifestLoading, this), p.on(D.MANIFEST_PARSED, this.onManifestParsed, this), p.on(D.LEVEL_LOADING, this.onLevelLoading, this), p.on(D.LEVEL_LOADED, this.onLevelLoaded, this), p.on(D.FRAG_LOAD_EMERGENCY_ABORTED, this.onFragLoadEmergencyAborted, this), p.on(D.ERROR, this.onError, this), p.on(D.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), p.on(D.AUDIO_TRACK_SWITCHED, this.onAudioTrackSwitched, this), p.on(D.BUFFER_CREATED, this.onBufferCreated, this), p.on(D.BUFFER_FLUSHED, this.onBufferFlushed, this), p.on(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.on(D.FRAG_BUFFERED, this.onFragBuffered, this);
						}, m._unregisterListeners = function() {
							var p = this.hls;
							p.off(D.MEDIA_ATTACHED, this.onMediaAttached, this), p.off(D.MEDIA_DETACHING, this.onMediaDetaching, this), p.off(D.MANIFEST_LOADING, this.onManifestLoading, this), p.off(D.MANIFEST_PARSED, this.onManifestParsed, this), p.off(D.LEVEL_LOADED, this.onLevelLoaded, this), p.off(D.FRAG_LOAD_EMERGENCY_ABORTED, this.onFragLoadEmergencyAborted, this), p.off(D.ERROR, this.onError, this), p.off(D.AUDIO_TRACK_SWITCHING, this.onAudioTrackSwitching, this), p.off(D.AUDIO_TRACK_SWITCHED, this.onAudioTrackSwitched, this), p.off(D.BUFFER_CREATED, this.onBufferCreated, this), p.off(D.BUFFER_FLUSHED, this.onBufferFlushed, this), p.off(D.LEVELS_UPDATED, this.onLevelsUpdated, this), p.off(D.FRAG_BUFFERED, this.onFragBuffered, this);
						}, m.onHandlerDestroying = function() {
							this._unregisterListeners(), p.prototype.onHandlerDestroying.call(this);
						}, m.startLoad = function(p) {
							if (this.levels) {
								var m = this.lastCurrentTime, g = this.hls;
								if (this.stopLoad(), this.setInterval(100), this.level = -1, !this.startFragRequested) {
									var _ = g.startLevel;
									_ === -1 && (g.config.testBandwidth && this.levels.length > 1 ? (_ = 0, this.bitrateTest = !0) : _ = g.firstAutoLevel), g.nextLoadLevel = _, this.level = g.loadLevel, this.loadedmetadata = !1;
								}
								m > 0 && p === -1 && (this.log("Override startPosition with lastCurrentTime @" + m.toFixed(3)), p = m), this.state = $n, this.nextLoadPosition = this.startPosition = this.lastCurrentTime = p, this.tick();
							} else this._forceStartLoad = !0, this.state = Qn;
						}, m.stopLoad = function() {
							this._forceStartLoad = !1, p.prototype.stopLoad.call(this);
						}, m.doTick = function() {
							switch (this.state) {
								case lr:
									var p = this.levels, m = this.level, g = p?.[m], _ = g?.details;
									if (_ && (!_.live || this.levelLastLoaded === g)) {
										if (this.waitForCdnTuneIn(_)) break;
										this.state = $n;
										break;
									}
									if (this.hls.nextLoadLevel !== this.level) {
										this.state = $n;
										break;
									}
									break;
								case rr:
									var x, w = self.performance.now(), D = this.retryDate;
									if (!D || w >= D || (x = this.media) != null && x.seeking) {
										var O = this.levels, A = this.level, F = O?.[A];
										this.resetStartWhenNotLoaded(F || null), this.state = $n;
									}
							}
							this.state === $n && this.doTickIdle(), this.onTickEnd();
						}, m.onTickEnd = function() {
							p.prototype.onTickEnd.call(this), this.checkBuffer(), this.checkFragmentChanged();
						}, m.doTickIdle = function() {
							var p = this.hls, m = this.levelLastLoaded, g = this.levels, _ = this.media;
							if (m !== null && (_ || !this.startFragRequested && p.config.startFragPrefetch) && (!this.altAudio || !this.audioOnly)) {
								var x = this.buffering ? p.nextLoadLevel : p.loadLevel;
								if (g != null && g[x]) {
									var w = g[x], O = this.getMainFwdBufferInfo();
									if (O !== null) {
										var A = this.getLevelDetails();
										if (A && this._streamEnded(O, A)) {
											var F = {};
											return this.altAudio && (F.type = "video"), this.hls.trigger(D.BUFFER_EOS, F), void (this.state = sr);
										}
										if (this.buffering) {
											p.loadLevel !== x && p.manualLevel === -1 && this.log("Adapting to level " + x + " from level " + this.level), this.level = p.nextLoadLevel = x;
											var U = w.details;
											if (!U || this.state === lr || U.live && this.levelLastLoaded !== w) return this.level = x, void (this.state = lr);
											var K = O.len, oe = this.getMaxBufferLength(w.maxBitrate);
											if (!(K >= oe)) {
												this.backtrackFragment && this.backtrackFragment.start > O.end && (this.backtrackFragment = null);
												var le = this.backtrackFragment ? this.backtrackFragment.start : O.end, ue = this.getNextFragment(le, U);
												if (this.couldBacktrack && !this.fragPrevious && ue && ue.sn !== "initSegment" && this.fragmentTracker.getState(ue) !== Vn) {
													var we, Be = ((we = this.backtrackFragment) ?? ue).sn - U.startSN, Ve = U.fragments[Be - 1];
													Ve && ue.cc === Ve.cc && (ue = Ve, this.fragmentTracker.removeFragment(Ve));
												} else this.backtrackFragment && O.len && (this.backtrackFragment = null);
												if (ue && this.isLoopLoading(ue, le)) {
													if (!ue.gap) {
														var Ue = this.audioOnly && !this.altAudio ? je : Ie, We = (Ue === Ie ? this.videoBuffer : this.mediaBuffer) || this.media;
														We && this.afterBufferFlushed(We, Ue, At);
													}
													ue = this.getNextFragmentLoopLoading(ue, U, O, At, oe);
												}
												ue && (!ue.initSegment || ue.initSegment.data || this.bitrateTest || (ue = ue.initSegment), this.loadFragment(ue, w, le));
											}
										}
									}
								}
							}
						}, m.loadFragment = function(m, g, _) {
							var x = this.fragmentTracker.getState(m);
							this.fragCurrent = m, x === Rn || x === Bn ? m.sn === "initSegment" ? this._loadInitSegment(m, g) : this.bitrateTest ? (this.log("Fragment " + m.sn + " of level " + m.level + " is being downloaded to test bitrate and will not be buffered"), this._loadBitrateTestFrag(m, g)) : (this.startFragRequested = !0, p.prototype.loadFragment.call(this, m, g, _)) : this.clearTrackerIfNeeded(m);
						}, m.getBufferedFrag = function(p) {
							return this.fragmentTracker.getBufferedFrag(p, At);
						}, m.followingBufferedFrag = function(p) {
							return p ? this.getBufferedFrag(p.end + .5) : null;
						}, m.immediateLevelSwitch = function() {
							this.abortCurrentFrag(), this.flushMainBuffer(0, Infinity);
						}, m.nextLevelSwitch = function() {
							var p = this.levels, m = this.media;
							if (m != null && m.readyState) {
								var g, _ = this.getAppendedFrag(m.currentTime);
								_ && _.start > 1 && this.flushMainBuffer(0, _.start - 1);
								var x = this.getLevelDetails();
								if (x != null && x.live) {
									var w = this.getMainFwdBufferInfo();
									if (!w || w.len < 2 * x.targetduration) return;
								}
								if (!m.paused && p) {
									var D = p[this.hls.nextLoadLevel], O = this.fragLastKbps;
									g = O && this.fragCurrent ? this.fragCurrent.duration * D.maxBitrate / (1e3 * O) + 1 : 0;
								} else g = 0;
								var A = this.getBufferedFrag(m.currentTime + g);
								if (A) {
									var F = this.followingBufferedFrag(A);
									if (F) {
										this.abortCurrentFrag();
										var U = F.maxStartPTS ? F.maxStartPTS : F.start, K = F.duration, oe = Math.max(A.end, U + Math.min(Math.max(K - this.config.maxFragLookUpTolerance, K * (this.couldBacktrack ? .5 : .125)), K * (this.couldBacktrack ? .75 : .25)));
										this.flushMainBuffer(oe, Infinity);
									}
								}
							}
						}, m.abortCurrentFrag = function() {
							var p = this.fragCurrent;
							switch (this.fragCurrent = null, this.backtrackFragment = null, p && (p.abortRequests(), this.fragmentTracker.removeFragment(p)), this.state) {
								case er:
								case tr:
								case rr:
								case ir:
								case or: this.state = $n;
							}
							this.nextLoadPosition = this.getLoadPosition();
						}, m.flushMainBuffer = function(m, g) {
							p.prototype.flushMainBuffer.call(this, m, g, this.altAudio ? "video" : null);
						}, m.onMediaAttached = function(m, g) {
							p.prototype.onMediaAttached.call(this, m, g);
							var _ = g.media;
							this.onvplaying = this.onMediaPlaying.bind(this), this.onvseeked = this.onMediaSeeked.bind(this), _.addEventListener("playing", this.onvplaying), _.addEventListener("seeked", this.onvseeked), this.gapController = new ii(this.config, _, this.fragmentTracker, this.hls);
						}, m.onMediaDetaching = function() {
							var m = this.media;
							m && this.onvplaying && this.onvseeked && (m.removeEventListener("playing", this.onvplaying), m.removeEventListener("seeked", this.onvseeked), this.onvplaying = this.onvseeked = null, this.videoBuffer = null), this.fragPlaying = null, this.gapController && (this.gapController.destroy(), this.gapController = null), p.prototype.onMediaDetaching.call(this);
						}, m.onMediaPlaying = function() {
							this.tick();
						}, m.onMediaSeeked = function() {
							var p = this.media, m = p ? p.currentTime : null;
							_(m) && this.log("Media seeked to " + m.toFixed(3));
							var g = this.getMainFwdBufferInfo();
							g !== null && g.len !== 0 ? this.tick() : this.warn("Main forward buffer length on \"seeked\" event " + (g ? g.len : "empty") + ")");
						}, m.onManifestLoading = function() {
							this.log("Trigger BUFFER_RESET"), this.hls.trigger(D.BUFFER_RESET, void 0), this.fragmentTracker.removeAllFragments(), this.couldBacktrack = !1, this.startPosition = this.lastCurrentTime = this.fragLastKbps = 0, this.levels = this.fragPlaying = this.backtrackFragment = this.levelLastLoaded = null, this.altAudio = this.audioOnly = this.startFragRequested = !1;
						}, m.onManifestParsed = function(p, m) {
							var g, _, x = !1, w = !1;
							m.levels.forEach(function(p) {
								var m = p.audioCodec;
								m && (x ||= m.indexOf("mp4a.40.2") !== -1, w ||= m.indexOf("mp4a.40.5") !== -1);
							}), this.audioCodecSwitch = x && w && typeof ((_ = fi()) == null || (g = _.prototype) == null ? void 0 : g.changeType) != "function", this.audioCodecSwitch && this.log("Both AAC/HE-AAC audio found in levels; declaring level codec as HE-AAC"), this.levels = m.levels, this.startFragRequested = !1;
						}, m.onLevelLoading = function(p, m) {
							var g = this.levels;
							if (g && this.state === $n) {
								var _ = g[m.level];
								(!_.details || _.details.live && this.levelLastLoaded !== _ || this.waitForCdnTuneIn(_.details)) && (this.state = lr);
							}
						}, m.onLevelLoaded = function(p, m) {
							var g, _ = this.levels, x = m.level, w = m.details, O = w.totalduration;
							if (_) {
								this.log("Level " + x + " loaded [" + w.startSN + "," + w.endSN + "]" + (w.lastPartSn ? "[part-" + w.lastPartSn + "-" + w.lastPartIndex + "]" : "") + ", cc [" + w.startCC + ", " + w.endCC + "] duration:" + O);
								var A = _[x], F = this.fragCurrent;
								!F || this.state !== tr && this.state !== rr || F.level !== m.level && F.loader && this.abortCurrentFrag();
								var U = 0;
								if (w.live || (g = A.details) != null && g.live) {
									var K;
									if (this.checkLiveUpdate(w), w.deltaUpdateFailed) return;
									U = this.alignPlaylists(w, A.details, (K = this.levelLastLoaded)?.details);
								}
								if (A.details = w, this.levelLastLoaded = A, this.hls.trigger(D.LEVEL_UPDATED, {
									details: w,
									level: x
								}), this.state === lr) {
									if (this.waitForCdnTuneIn(w)) return;
									this.state = $n;
								}
								this.startFragRequested ? w.live && this.synchronizeToLiveEdge(w) : this.setStartPosition(w, U), this.tick();
							} else this.warn("Levels were reset while loading level " + x);
						}, m._handleFragmentLoadProgress = function(p) {
							var m, g = p.frag, _ = p.part, x = p.payload, w = this.levels;
							if (w) {
								var D = w[g.level], O = D.details;
								if (!O) return this.warn("Dropping fragment " + g.sn + " of level " + g.level + " after level details were reset"), void this.fragmentTracker.removeFragment(g);
								var A = D.videoCodec, F = O.PTSKnown || !O.live, U = (m = g.initSegment)?.data, K = this._getAudioCodec(D), oe = this.transmuxer = this.transmuxer || new ri(this.hls, At, this._handleTransmuxComplete.bind(this), this._handleTransmuxerFlush.bind(this)), le = _ ? _.index : -1, ue = le !== -1, we = new jr(g.level, g.sn, g.stats.chunkCount, x.byteLength, le, ue), je = this.initPTS[g.cc];
								oe.push(x, U, K, A, g, _, O.totalduration, F, we, je);
							} else this.warn("Levels were reset while fragment load was in progress. Fragment " + g.sn + " of level " + g.level + " will not be buffered");
						}, m.onAudioTrackSwitching = function(p, m) {
							var g = this.altAudio;
							if (!m.url) {
								if (this.mediaBuffer !== this.media) {
									this.log("Switching on main audio, use media.buffered to schedule main fragment loading"), this.mediaBuffer = this.media;
									var _ = this.fragCurrent;
									_ && (this.log("Switching to main audio track, cancel main fragment load"), _.abortRequests(), this.fragmentTracker.removeFragment(_)), this.resetTransmuxer(), this.resetLoadingState();
								} else this.audioOnly && this.resetTransmuxer();
								var x = this.hls;
								g && (x.trigger(D.BUFFER_FLUSHING, {
									startOffset: 0,
									endOffset: Infinity,
									type: null
								}), this.fragmentTracker.removeAllFragments()), x.trigger(D.AUDIO_TRACK_SWITCHED, m);
							}
						}, m.onAudioTrackSwitched = function(p, m) {
							var g = m.id, _ = !!this.hls.audioTracks[g].url;
							if (_) {
								var x = this.videoBuffer;
								x && this.mediaBuffer !== x && (this.log("Switching on alternate audio, use video.buffered to schedule main fragment loading"), this.mediaBuffer = x);
							}
							this.altAudio = _, this.tick();
						}, m.onBufferCreated = function(p, m) {
							var g, _, x = m.tracks, w = !1;
							for (var D in x) {
								var O = x[D];
								if (O.id === "main") {
									if (_ = D, g = O, D === "video") {
										var A = x[D];
										A && (this.videoBuffer = A.buffer);
									}
								} else w = !0;
							}
							w && g ? (this.log("Alternate track found, use " + _ + ".buffered to schedule main fragment loading"), this.mediaBuffer = g.buffer) : this.mediaBuffer = this.media;
						}, m.onFragBuffered = function(p, m) {
							var g = m.frag, _ = m.part;
							if (!g || g.type === At) {
								if (this.fragContextChanged(g)) return this.warn("Fragment " + g.sn + (_ ? " p: " + _.index : "") + " of level " + g.level + " finished buffering, but was aborted. state: " + this.state), void (this.state === or && (this.state = $n));
								var x = _ ? _.stats : g.stats;
								this.fragLastKbps = Math.round(8 * x.total / (x.buffering.end - x.loading.first)), g.sn !== "initSegment" && (this.fragPrevious = g), this.fragBufferedComplete(g, _);
							}
						}, m.onError = function(p, m) {
							var g;
							if (m.fatal) this.state = cr;
							else switch (m.details) {
								case A.FRAG_GAP:
								case A.FRAG_PARSING_ERROR:
								case A.FRAG_DECRYPT_ERROR:
								case A.FRAG_LOAD_ERROR:
								case A.FRAG_LOAD_TIMEOUT:
								case A.KEY_LOAD_ERROR:
								case A.KEY_LOAD_TIMEOUT:
									this.onFragmentOrKeyLoadError(At, m);
									break;
								case A.LEVEL_LOAD_ERROR:
								case A.LEVEL_LOAD_TIMEOUT:
								case A.LEVEL_PARSING_ERROR:
									m.levelRetry || this.state !== lr || (g = m.context)?.type !== St || (this.state = $n);
									break;
								case A.BUFFER_APPEND_ERROR:
								case A.BUFFER_FULL_ERROR:
									if (!m.parent || m.parent !== "main") return;
									if (m.details === A.BUFFER_APPEND_ERROR) return void this.resetLoadingState();
									this.reduceLengthAndFlushBuffer(m) && this.flushMainBuffer(0, Infinity);
									break;
								case A.INTERNAL_EXCEPTION: this.recoverWorkerError(m);
							}
						}, m.checkBuffer = function() {
							var p = this.media, m = this.gapController;
							if (p && m && p.readyState) {
								if (this.loadedmetadata || !Sn.getBuffered(p).length) {
									var g = this.state === $n ? null : this.fragCurrent;
									m.poll(this.lastCurrentTime, g);
								}
								this.lastCurrentTime = p.currentTime;
							}
						}, m.onFragLoadEmergencyAborted = function() {
							this.state = $n, this.loadedmetadata || (this.startFragRequested = !1, this.nextLoadPosition = this.startPosition), this.tickImmediate();
						}, m.onBufferFlushed = function(p, m) {
							var g = m.type;
							if (g !== je || this.audioOnly && !this.altAudio) {
								var _ = (g === Ie ? this.videoBuffer : this.mediaBuffer) || this.media;
								this.afterBufferFlushed(_, g, At), this.tick();
							}
						}, m.onLevelsUpdated = function(p, m) {
							this.level > -1 && this.fragCurrent && (this.level = this.fragCurrent.level), this.levels = m.levels;
						}, m.swapAudioCodec = function() {
							this.audioCodecSwap = !this.audioCodecSwap;
						}, m.seekToStartPos = function() {
							var p = this.media;
							if (p) {
								var m = p.currentTime, g = this.startPosition;
								if (g >= 0 && m < g) {
									if (p.seeking) return void this.log("could not seek to " + g + ", already seeking at " + m);
									var _ = Sn.getBuffered(p), x = (_.length ? _.start(0) : 0) - g;
									x > 0 && (x < this.config.maxBufferHole || x < this.config.maxFragLookUpTolerance) && (this.log("adjusting start position by " + x + " to match buffer start"), g += x, this.startPosition = g), this.log("seek to target start position " + g + " from current time " + m), p.currentTime = g;
								}
							}
						}, m._getAudioCodec = function(p) {
							var m = this.config.defaultAudioCodec || p.audioCodec;
							return this.audioCodecSwap && m && (this.log("Swapping audio codec"), m = m.indexOf("mp4a.40.5") === -1 ? "mp4a.40.5" : "mp4a.40.2"), m;
						}, m._loadBitrateTestFrag = function(p, m) {
							var g = this;
							p.bitrateTest = !0, this._doFragLoad(p, m).then(function(_) {
								var x = g.hls;
								if (_ && !g.fragContextChanged(p)) {
									m.fragmentError = 0, g.state = $n, g.startFragRequested = !1, g.bitrateTest = !1;
									var w = p.stats;
									w.parsing.start = w.parsing.end = w.buffering.start = w.buffering.end = self.performance.now(), x.trigger(D.FRAG_LOADED, _), p.bitrateTest = !1;
								}
							});
						}, m._handleTransmuxComplete = function(p) {
							var m, g = "main", x = this.hls, w = p.remuxResult, O = p.chunkMeta, A = this.getCurrentContext(O);
							if (A) {
								var F = A.frag, U = A.part, K = A.level, oe = w.video, le = w.text, ue = w.id3, we = w.initSegment, Ie = K.details, Be = this.altAudio ? void 0 : w.audio;
								if (this.fragContextChanged(F)) this.fragmentTracker.removeFragment(F);
								else {
									if (this.state = ir, we) {
										if (we != null && we.tracks) {
											var Ve = F.initSegment || F;
											this._bufferInitSegment(K, we.tracks, Ve, O), x.trigger(D.FRAG_PARSING_INIT_SEGMENT, {
												frag: Ve,
												id: g,
												tracks: we.tracks
											});
										}
										var Ue = we.initPTS, We = we.timescale;
										_(Ue) && (this.initPTS[F.cc] = {
											baseTime: Ue,
											timescale: We
										}, x.trigger(D.INIT_PTS_FOUND, {
											frag: F,
											id: g,
											initPTS: Ue,
											timescale: We
										}));
									}
									if (oe && Ie && F.sn !== "initSegment") {
										var Ke = Ie.fragments[F.sn - 1 - Ie.startSN], qe = F.sn === Ie.startSN, Ye = !Ke || F.cc > Ke.cc;
										if (!1 !== w.independent) {
											var tt = oe.startPTS, nt = oe.endPTS, rt = oe.startDTS, it = oe.endDTS;
											if (U) U.elementaryStreams[oe.type] = {
												startPTS: tt,
												endPTS: nt,
												startDTS: rt,
												endDTS: it
											};
											else if (oe.firstKeyFrame && oe.independent && O.id === 1 && !Ye && (this.couldBacktrack = !0), oe.dropped && oe.independent) {
												var at = this.getMainFwdBufferInfo(), ot = (at ? at.end : this.getLoadPosition()) + this.config.maxBufferHole, st = oe.firstKeyFramePTS ? oe.firstKeyFramePTS : tt;
												if (!qe && ot < st - this.config.maxBufferHole && !Ye) return void this.backtrack(F);
												Ye && (F.gap = !0), F.setElementaryStreamInfo(oe.type, F.start, nt, F.start, it, !0);
											} else qe && tt > 2 && (F.gap = !0);
											F.setElementaryStreamInfo(oe.type, tt, nt, rt, it), this.backtrackFragment &&= F, this.bufferFragmentData(oe, F, U, O, qe || Ye);
										} else {
											if (!qe && !Ye) return void this.backtrack(F);
											F.gap = !0;
										}
									}
									if (Be) {
										var ct = Be.startPTS, dt = Be.endPTS, gt = Be.startDTS, _t = Be.endDTS;
										U && (U.elementaryStreams[je] = {
											startPTS: ct,
											endPTS: dt,
											startDTS: gt,
											endDTS: _t
										}), F.setElementaryStreamInfo(je, ct, dt, gt, _t), this.bufferFragmentData(Be, F, U, O);
									}
									if (Ie && ue != null && (m = ue.samples) != null && m.length) {
										var vt = {
											id: g,
											frag: F,
											details: Ie,
											samples: ue.samples
										};
										x.trigger(D.FRAG_PARSING_METADATA, vt);
									}
									if (Ie && le) {
										var bt = {
											id: g,
											frag: F,
											details: Ie,
											samples: le.samples
										};
										x.trigger(D.FRAG_PARSING_USERDATA, bt);
									}
								}
							} else this.resetWhenMissingContext(O);
						}, m._bufferInitSegment = function(p, m, g, _) {
							var x = this;
							if (this.state === ir) {
								this.audioOnly = !!m.audio && !m.video, this.altAudio && !this.audioOnly && delete m.audio;
								var w = m.audio, O = m.video, A = m.audiovideo;
								if (w) {
									var F = p.audioCodec, U = navigator.userAgent.toLowerCase();
									if (this.audioCodecSwitch) {
										F &&= F.indexOf("mp4a.40.5") === -1 ? "mp4a.40.5" : "mp4a.40.2";
										var K = w.metadata;
										K && "channelCount" in K && (K.channelCount || 1) !== 1 && U.indexOf("firefox") === -1 && (F = "mp4a.40.5");
									}
									F && F.indexOf("mp4a.40.5") !== -1 && U.indexOf("android") !== -1 && w.container !== "audio/mpeg" && (F = "mp4a.40.2", this.log("Android: force audio codec to " + F)), p.audioCodec && p.audioCodec !== F && this.log("Swapping manifest audio codec \"" + p.audioCodec + "\" for \"" + F + "\""), w.levelCodec = F, w.id = "main", this.log("Init audio buffer, container:" + w.container + ", codecs[selected/level/parsed]=[" + (F || "") + "/" + (p.audioCodec || "") + "/" + w.codec + "]");
								}
								O && (O.levelCodec = p.videoCodec, O.id = "main", this.log("Init video buffer, container:" + O.container + ", codecs[level/parsed]=[" + (p.videoCodec || "") + "/" + O.codec + "]")), A && this.log("Init audiovideo buffer, container:" + A.container + ", codecs[level/parsed]=[" + p.codecs + "/" + A.codec + "]"), this.hls.trigger(D.BUFFER_CODECS, m), Object.keys(m).forEach(function(p) {
									var w = m[p].initSegment;
									w != null && w.byteLength && x.hls.trigger(D.BUFFER_APPENDING, {
										type: p,
										data: w,
										frag: g,
										part: null,
										chunkMeta: _,
										parent: g.type
									});
								}), this.tickImmediate();
							}
						}, m.getMainFwdBufferInfo = function() {
							return this.getFwdBufferInfo(this.mediaBuffer ? this.mediaBuffer : this.media, At);
						}, m.backtrack = function(p) {
							this.couldBacktrack = !0, this.backtrackFragment = p, this.resetTransmuxer(), this.flushBufferGap(p), this.fragmentTracker.removeFragment(p), this.fragPrevious = null, this.nextLoadPosition = p.start, this.state = $n;
						}, m.checkFragmentChanged = function() {
							var p = this.media, m = null;
							if (p && p.readyState > 1 && !1 === p.seeking) {
								var g = p.currentTime;
								if (Sn.isBuffered(p, g) ? m = this.getAppendedFrag(g) : Sn.isBuffered(p, g + .1) && (m = this.getAppendedFrag(g + .1)), m) {
									this.backtrackFragment = null;
									var _ = this.fragPlaying, x = m.level;
									_ && m.sn === _.sn && _.level === x || (this.fragPlaying = m, this.hls.trigger(D.FRAG_CHANGED, { frag: m }), _ && _.level === x || this.hls.trigger(D.LEVEL_SWITCHED, { level: x }));
								}
							}
						}, s(t, [
							{
								key: "nextLevel",
								get: function() {
									var p = this.nextBufferedFrag;
									return p ? p.level : -1;
								}
							},
							{
								key: "currentFrag",
								get: function() {
									var p = this.media;
									return p ? this.fragPlaying || this.getAppendedFrag(p.currentTime) : null;
								}
							},
							{
								key: "currentProgramDateTime",
								get: function() {
									var p = this.media;
									if (p) {
										var m = p.currentTime, g = this.currentFrag;
										if (g && _(m) && _(g.programDateTime)) {
											var x = g.programDateTime + 1e3 * (m - g.start);
											return new Date(x);
										}
									}
									return null;
								}
							},
							{
								key: "currentLevel",
								get: function() {
									var p = this.currentFrag;
									return p ? p.level : -1;
								}
							},
							{
								key: "nextBufferedFrag",
								get: function() {
									var p = this.currentFrag;
									return p ? this.followingBufferedFrag(p) : null;
								}
							},
							{
								key: "forceStartLoad",
								get: function() {
									return this._forceStartLoad;
								}
							}
						]), t;
					}(ur), oi = function() {
						function e(p) {
							p === void 0 && (p = {}), this.config = void 0, this.userConfig = void 0, this.coreComponents = void 0, this.networkControllers = void 0, this.started = !1, this._emitter = new ni(), this._autoLevelCapping = -1, this._maxHdcpLevel = null, this.abrController = void 0, this.bufferController = void 0, this.capLevelController = void 0, this.latencyController = void 0, this.levelController = void 0, this.streamController = void 0, this.audioTrackController = void 0, this.subtitleTrackController = void 0, this.emeController = void 0, this.cmcdController = void 0, this._media = null, this.url = null, this.triggeringException = void 0, k(p.debug || !1, "Hls instance");
							var m = this.config = function(p, m) {
								if ((m.liveSyncDurationCount || m.liveMaxLatencyDurationCount) && (m.liveSyncDuration || m.liveMaxLatencyDuration)) throw Error("Illegal hls.js config: don't mix up liveSyncDurationCount/liveMaxLatencyDurationCount and liveSyncDuration/liveMaxLatencyDuration");
								if (m.liveMaxLatencyDurationCount !== void 0 && (m.liveSyncDurationCount === void 0 || m.liveMaxLatencyDurationCount <= m.liveSyncDurationCount)) throw Error("Illegal hls.js config: \"liveMaxLatencyDurationCount\" must be greater than \"liveSyncDurationCount\"");
								if (m.liveMaxLatencyDuration !== void 0 && (m.liveSyncDuration === void 0 || m.liveMaxLatencyDuration <= m.liveSyncDuration)) throw Error("Illegal hls.js config: \"liveMaxLatencyDuration\" must be greater than \"liveSyncDuration\"");
								var g = Dr(p), _ = [
									"TimeOut",
									"MaxRetry",
									"RetryDelay",
									"MaxRetryTimeout"
								];
								return [
									"manifest",
									"level",
									"frag"
								].forEach(function(p) {
									var x = (p === "level" ? "playlist" : p) + "LoadPolicy", w = m[x] === void 0, D = [];
									_.forEach(function(_) {
										var O = p + "Loading" + _, A = m[O];
										if (A !== void 0 && w) {
											D.push(O);
											var F = g[x].default;
											switch (m[x] = { default: F }, _) {
												case "TimeOut":
													F.maxLoadTimeMs = A, F.maxTimeToFirstByteMs = A;
													break;
												case "MaxRetry":
													F.errorRetry.maxNumRetry = A, F.timeoutRetry.maxNumRetry = A;
													break;
												case "RetryDelay":
													F.errorRetry.retryDelayMs = A, F.timeoutRetry.retryDelayMs = A;
													break;
												case "MaxRetryTimeout": F.errorRetry.maxRetryDelayMs = A, F.timeoutRetry.maxRetryDelayMs = A;
											}
										}
									}), D.length && K.warn("hls.js config: \"" + D.join("\", \"") + "\" setting(s) are deprecated, use \"" + x + "\": " + JSON.stringify(m[x]));
								}), i(i({}, g), m);
							}(e.DefaultConfig, p);
							this.userConfig = p, m.progressive && _r(m);
							var g = m.abrController, _ = m.bufferController, x = m.capLevelController, w = m.errorController, O = m.fpsController, A = new w(this), F = this.abrController = new g(this), U = this.bufferController = new _(this), oe = this.capLevelController = new x(this), le = new O(this), ue = new zt(this), we = new Qt(this), je = m.contentSteeringController, Ie = je ? new je(this) : null, Be = this.levelController = new Ln(this, Ie), Ve = new Hn(this), Ue = new Kn(this.config), We = this.streamController = new ai(this, Ve, Ue);
							oe.setStreamController(We), le.setStreamController(We);
							var Ke = [
								ue,
								Be,
								We
							];
							Ie && Ke.splice(1, 0, Ie), this.networkControllers = Ke;
							var qe = [
								F,
								U,
								oe,
								le,
								we,
								Ve
							];
							this.audioTrackController = this.createController(m.audioTrackController, Ke);
							var Ye = m.audioStreamController;
							Ye && Ke.push(new Ye(this, Ve, Ue)), this.subtitleTrackController = this.createController(m.subtitleTrackController, Ke);
							var tt = m.subtitleStreamController;
							tt && Ke.push(new tt(this, Ve, Ue)), this.createController(m.timelineController, qe), Ue.emeController = this.emeController = this.createController(m.emeController, qe), this.cmcdController = this.createController(m.cmcdController, qe), this.latencyController = this.createController($t, qe), this.coreComponents = qe, Ke.push(A);
							var nt = A.onErrorOut;
							typeof nt == "function" && this.on(D.ERROR, nt, A);
						}
						e.isMSESupported = function() {
							return ci();
						}, e.isSupported = function() {
							return function() {
								if (!ci()) return !1;
								var p = Ce();
								return typeof p?.isTypeSupported == "function" && ([
									"avc1.42E01E,mp4a.40.2",
									"av01.0.01M.08",
									"vp09.00.50.08"
								].some(function(m) {
									return p.isTypeSupported(Oe(m, "video"));
								}) || ["mp4a.40.2", "fLaC"].some(function(m) {
									return p.isTypeSupported(Oe(m, "audio"));
								}));
							}();
						}, e.getMediaSource = function() {
							return Ce();
						};
						var p = e.prototype;
						return p.createController = function(p, m) {
							if (p) {
								var g = new p(this);
								return m && m.push(g), g;
							}
							return null;
						}, p.on = function(p, m, g) {
							g === void 0 && (g = this), this._emitter.on(p, m, g);
						}, p.once = function(p, m, g) {
							g === void 0 && (g = this), this._emitter.once(p, m, g);
						}, p.removeAllListeners = function(p) {
							this._emitter.removeAllListeners(p);
						}, p.off = function(p, m, g, _) {
							g === void 0 && (g = this), this._emitter.off(p, m, g, _);
						}, p.listeners = function(p) {
							return this._emitter.listeners(p);
						}, p.emit = function(p, m, g) {
							return this._emitter.emit(p, m, g);
						}, p.trigger = function(p, m) {
							if (this.config.debug) return this.emit(p, p, m);
							try {
								return this.emit(p, p, m);
							} catch (m) {
								if (K.error("An internal error happened while handling event " + p + ". Error message: \"" + m.message + "\". Here is a stacktrace:", m), !this.triggeringException) {
									this.triggeringException = !0;
									var g = p === D.ERROR;
									this.trigger(D.ERROR, {
										type: O.OTHER_ERROR,
										details: A.INTERNAL_EXCEPTION,
										fatal: g,
										event: p,
										error: m
									}), this.triggeringException = !1;
								}
							}
							return !1;
						}, p.listenerCount = function(p) {
							return this._emitter.listenerCount(p);
						}, p.destroy = function() {
							K.log("destroy"), this.trigger(D.DESTROYING, void 0), this.detachMedia(), this.removeAllListeners(), this._autoLevelCapping = -1, this.url = null, this.networkControllers.forEach(function(p) {
								return p.destroy();
							}), this.networkControllers.length = 0, this.coreComponents.forEach(function(p) {
								return p.destroy();
							}), this.coreComponents.length = 0;
							var p = this.config;
							p.xhrSetup = p.fetchSetup = void 0, this.userConfig = null;
						}, p.attachMedia = function(p) {
							K.log("attachMedia"), this._media = p, this.trigger(D.MEDIA_ATTACHING, { media: p });
						}, p.detachMedia = function() {
							K.log("detachMedia"), this.trigger(D.MEDIA_DETACHING, void 0), this._media = null;
						}, p.loadSource = function(p) {
							this.stopLoad();
							var m = this.media, _ = this.url, x = this.url = g.buildAbsoluteURL(self.location.href, p, { alwaysNormalize: !0 });
							this._autoLevelCapping = -1, this._maxHdcpLevel = null, K.log("loadSource:" + x), m && _ && (_ !== x || this.bufferController.hasSourceTypes()) && (this.detachMedia(), this.attachMedia(m)), this.trigger(D.MANIFEST_LOADING, { url: p });
						}, p.startLoad = function(p) {
							p === void 0 && (p = -1), K.log("startLoad(" + p + ")"), this.started = !0, this.resumeBuffering();
							for (var m = 0; m < this.networkControllers.length && (this.networkControllers[m].startLoad(p), this.started && this.networkControllers); m++);
						}, p.stopLoad = function() {
							K.log("stopLoad"), this.started = !1;
							for (var p = 0; p < this.networkControllers.length && (this.networkControllers[p].stopLoad(), !this.started && this.networkControllers); p++);
						}, p.resumeBuffering = function() {
							K.log("resume buffering"), this.networkControllers.forEach(function(p) {
								p.resumeBuffering && p.resumeBuffering();
							});
						}, p.pauseBuffering = function() {
							K.log("pause buffering"), this.networkControllers.forEach(function(p) {
								p.pauseBuffering && p.pauseBuffering();
							});
						}, p.swapAudioCodec = function() {
							K.log("swapAudioCodec"), this.streamController.swapAudioCodec();
						}, p.recoverMediaError = function() {
							K.log("recoverMediaError");
							var p = this._media;
							this.detachMedia(), p && this.attachMedia(p);
						}, p.removeLevel = function(p) {
							this.levelController.removeLevel(p);
						}, p.setAudioOption = function(p) {
							var m;
							return (m = this.audioTrackController)?.setAudioOption(p);
						}, p.setSubtitleOption = function(p) {
							var m;
							return (m = this.subtitleTrackController) == null || m.setSubtitleOption(p), null;
						}, s(e, [
							{
								key: "levels",
								get: function() {
									var p = this.levelController.levels;
									return p || [];
								}
							},
							{
								key: "currentLevel",
								get: function() {
									return this.streamController.currentLevel;
								},
								set: function(p) {
									K.log("set currentLevel:" + p), this.levelController.manualLevel = p, this.streamController.immediateLevelSwitch();
								}
							},
							{
								key: "nextLevel",
								get: function() {
									return this.streamController.nextLevel;
								},
								set: function(p) {
									K.log("set nextLevel:" + p), this.levelController.manualLevel = p, this.streamController.nextLevelSwitch();
								}
							},
							{
								key: "loadLevel",
								get: function() {
									return this.levelController.level;
								},
								set: function(p) {
									K.log("set loadLevel:" + p), this.levelController.manualLevel = p;
								}
							},
							{
								key: "nextLoadLevel",
								get: function() {
									return this.levelController.nextLoadLevel;
								},
								set: function(p) {
									this.levelController.nextLoadLevel = p;
								}
							},
							{
								key: "firstLevel",
								get: function() {
									return Math.max(this.levelController.firstLevel, this.minAutoLevel);
								},
								set: function(p) {
									K.log("set firstLevel:" + p), this.levelController.firstLevel = p;
								}
							},
							{
								key: "startLevel",
								get: function() {
									var p = this.levelController.startLevel;
									return p === -1 && this.abrController.forcedAutoLevel > -1 ? this.abrController.forcedAutoLevel : p;
								},
								set: function(p) {
									K.log("set startLevel:" + p), p !== -1 && (p = Math.max(p, this.minAutoLevel)), this.levelController.startLevel = p;
								}
							},
							{
								key: "capLevelToPlayerSize",
								get: function() {
									return this.config.capLevelToPlayerSize;
								},
								set: function(p) {
									var m = !!p;
									m !== this.config.capLevelToPlayerSize && (m ? this.capLevelController.startCapping() : (this.capLevelController.stopCapping(), this.autoLevelCapping = -1, this.streamController.nextLevelSwitch()), this.config.capLevelToPlayerSize = m);
								}
							},
							{
								key: "autoLevelCapping",
								get: function() {
									return this._autoLevelCapping;
								},
								set: function(p) {
									this._autoLevelCapping !== p && (K.log("set autoLevelCapping:" + p), this._autoLevelCapping = p, this.levelController.checkMaxAutoUpdated());
								}
							},
							{
								key: "bandwidthEstimate",
								get: function() {
									var p = this.abrController.bwEstimator;
									return p ? p.getEstimate() : NaN;
								},
								set: function(p) {
									this.abrController.resetEstimator(p);
								}
							},
							{
								key: "ttfbEstimate",
								get: function() {
									var p = this.abrController.bwEstimator;
									return p ? p.getEstimateTTFB() : NaN;
								}
							},
							{
								key: "maxHdcpLevel",
								get: function() {
									return this._maxHdcpLevel;
								},
								set: function(p) {
									(function(p) {
										return en.indexOf(p) > -1;
									})(p) && this._maxHdcpLevel !== p && (this._maxHdcpLevel = p, this.levelController.checkMaxAutoUpdated());
								}
							},
							{
								key: "autoLevelEnabled",
								get: function() {
									return this.levelController.manualLevel === -1;
								}
							},
							{
								key: "manualLevel",
								get: function() {
									return this.levelController.manualLevel;
								}
							},
							{
								key: "minAutoLevel",
								get: function() {
									var p = this.levels, m = this.config.minAutoBitrate;
									if (!p) return 0;
									for (var g = p.length, _ = 0; _ < g; _++) if (p[_].maxBitrate >= m) return _;
									return 0;
								}
							},
							{
								key: "maxAutoLevel",
								get: function() {
									var p, m = this.levels, g = this.autoLevelCapping, _ = this.maxHdcpLevel;
									if (p = g === -1 && m != null && m.length ? m.length - 1 : g, _) for (var x = p; x--;) {
										var w = m[x].attrs["HDCP-LEVEL"];
										if (w && w <= _) return x;
									}
									return p;
								}
							},
							{
								key: "firstAutoLevel",
								get: function() {
									return this.abrController.firstAutoLevel;
								}
							},
							{
								key: "nextAutoLevel",
								get: function() {
									return this.abrController.nextAutoLevel;
								},
								set: function(p) {
									this.abrController.nextAutoLevel = p;
								}
							},
							{
								key: "playingDate",
								get: function() {
									return this.streamController.currentProgramDateTime;
								}
							},
							{
								key: "mainForwardBufferInfo",
								get: function() {
									return this.streamController.getMainFwdBufferInfo();
								}
							},
							{
								key: "allAudioTracks",
								get: function() {
									var p = this.audioTrackController;
									return p ? p.allAudioTracks : [];
								}
							},
							{
								key: "audioTracks",
								get: function() {
									var p = this.audioTrackController;
									return p ? p.audioTracks : [];
								}
							},
							{
								key: "audioTrack",
								get: function() {
									var p = this.audioTrackController;
									return p ? p.audioTrack : -1;
								},
								set: function(p) {
									var m = this.audioTrackController;
									m && (m.audioTrack = p);
								}
							},
							{
								key: "allSubtitleTracks",
								get: function() {
									var p = this.subtitleTrackController;
									return p ? p.allSubtitleTracks : [];
								}
							},
							{
								key: "subtitleTracks",
								get: function() {
									var p = this.subtitleTrackController;
									return p ? p.subtitleTracks : [];
								}
							},
							{
								key: "subtitleTrack",
								get: function() {
									var p = this.subtitleTrackController;
									return p ? p.subtitleTrack : -1;
								},
								set: function(p) {
									var m = this.subtitleTrackController;
									m && (m.subtitleTrack = p);
								}
							},
							{
								key: "media",
								get: function() {
									return this._media;
								}
							},
							{
								key: "subtitleDisplay",
								get: function() {
									var p = this.subtitleTrackController;
									return !!p && p.subtitleDisplay;
								},
								set: function(p) {
									var m = this.subtitleTrackController;
									m && (m.subtitleDisplay = p);
								}
							},
							{
								key: "lowLatencyMode",
								get: function() {
									return this.config.lowLatencyMode;
								},
								set: function(p) {
									this.config.lowLatencyMode = p;
								}
							},
							{
								key: "liveSyncPosition",
								get: function() {
									return this.latencyController.liveSyncPosition;
								}
							},
							{
								key: "latency",
								get: function() {
									return this.latencyController.latency;
								}
							},
							{
								key: "maxLatency",
								get: function() {
									return this.latencyController.maxLatency;
								}
							},
							{
								key: "targetLatency",
								get: function() {
									return this.latencyController.targetLatency;
								}
							},
							{
								key: "drift",
								get: function() {
									return this.latencyController.drift;
								}
							},
							{
								key: "forceStartLoad",
								get: function() {
									return this.streamController.forceStartLoad;
								}
							}
						], [
							{
								key: "version",
								get: function() {
									return "1.5.18";
								}
							},
							{
								key: "Events",
								get: function() {
									return D;
								}
							},
							{
								key: "ErrorTypes",
								get: function() {
									return O;
								}
							},
							{
								key: "ErrorDetails",
								get: function() {
									return A;
								}
							},
							{
								key: "DefaultConfig",
								get: function() {
									return e.defaultConfig ? e.defaultConfig : In;
								},
								set: function(p) {
									e.defaultConfig = p;
								}
							}
						]), e;
					}();
					return oi.defaultConfig = void 0, oi;
				}, p.exports = i();
			})(!1);
		},
		"./node_modules/lit-html/lit-html.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				JW: () => We,
				XX: () => B,
				qy: () => Ue
			});
			let _ = globalThis, x = _.trustedTypes, w = x ? x.createPolicy("lit-html", { createHTML: (p) => p }) : void 0, D = "$lit$", O = `lit$${Math.random().toFixed(9).slice(2)}$`, A = "?" + O, F = `<${A}>`, U = document, l = () => U.createComment(""), c = (p) => p === null || typeof p != "object" && typeof p != "function", K = Array.isArray, u = (p) => K(p) || typeof p?.[Symbol.iterator] == "function", oe = "[ 	\n\f\r]", le = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ue = /-->/g, we = />/g, je = RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), Ie = /'/g, Be = /"/g, Ve = /^(?:script|style|textarea|title)$/i, y = (p) => (m, ...g) => ({
				_$litType$: p,
				strings: m,
				values: g
			}), Ue = y(1), We = y(2), Ke = y(3), qe = Symbol.for("lit-noChange"), Ye = Symbol.for("lit-nothing"), tt = new WeakMap(), nt = U.createTreeWalker(U, 129);
			function P(p, m) {
				if (!K(p) || !p.hasOwnProperty("raw")) throw Error("invalid template strings array");
				return w === void 0 ? m : w.createHTML(m);
			}
			let V = (p, m) => {
				let g = p.length - 1, _ = [], x, w = m === 2 ? "<svg>" : m === 3 ? "<math>" : "", A = le;
				for (let m = 0; m < g; m++) {
					let g = p[m], U, K, oe = -1, Ue = 0;
					for (; Ue < g.length && (A.lastIndex = Ue, K = A.exec(g), K !== null);) Ue = A.lastIndex, A === le ? K[1] === "!--" ? A = ue : K[1] === void 0 ? K[2] === void 0 ? K[3] !== void 0 && (A = je) : (Ve.test(K[2]) && (x = RegExp("</" + K[2], "g")), A = je) : A = we : A === je ? K[0] === ">" ? (A = x ?? le, oe = -1) : K[1] === void 0 ? oe = -2 : (oe = A.lastIndex - K[2].length, U = K[1], A = K[3] === void 0 ? je : K[3] === "\"" ? Be : Ie) : A === Be || A === Ie ? A = je : A === ue || A === we ? A = le : (A = je, x = void 0);
					let We = A === je && p[m + 1].startsWith("/>") ? " " : "";
					w += A === le ? g + F : oe >= 0 ? (_.push(U), g.slice(0, oe) + D + g.slice(oe) + O + We) : g + O + (oe === -2 ? m : We);
				}
				return [P(p, w + (p[g] || "<?>") + (m === 2 ? "</svg>" : m === 3 ? "</math>" : "")), _];
			};
			class N {
				constructor({ strings: p, _$litType$: m }, g) {
					let _;
					this.parts = [];
					let w = 0, F = 0, U = p.length - 1, K = this.parts, [oe, le] = V(p, m);
					if (this.el = N.createElement(oe, g), nt.currentNode = this.el.content, m === 2 || m === 3) {
						let p = this.el.content.firstChild;
						p.replaceWith(...p.childNodes);
					}
					for (; (_ = nt.nextNode()) !== null && K.length < U;) {
						if (_.nodeType === 1) {
							if (_.hasAttributes()) for (let p of _.getAttributeNames()) if (p.endsWith(D)) {
								let m = le[F++], g = _.getAttribute(p).split(O), x = /([.?@])?(.*)/.exec(m);
								K.push({
									type: 1,
									index: w,
									name: x[2],
									strings: g,
									ctor: x[1] === "." ? H : x[1] === "?" ? I : x[1] === "@" ? L : k
								}), _.removeAttribute(p);
							} else p.startsWith(O) && (K.push({
								type: 6,
								index: w
							}), _.removeAttribute(p));
							if (Ve.test(_.tagName)) {
								let p = _.textContent.split(O), m = p.length - 1;
								if (m > 0) {
									_.textContent = x ? x.emptyScript : "";
									for (let g = 0; g < m; g++) _.append(p[g], l()), nt.nextNode(), K.push({
										type: 2,
										index: ++w
									});
									_.append(p[m], l());
								}
							}
						} else if (_.nodeType === 8) if (_.data === A) K.push({
							type: 2,
							index: w
						});
						else {
							let p = -1;
							for (; (p = _.data.indexOf(O, p + 1)) !== -1;) K.push({
								type: 7,
								index: w
							}), p += O.length - 1;
						}
						w++;
					}
				}
				static createElement(p, m) {
					let g = U.createElement("template");
					return g.innerHTML = p, g;
				}
			}
			function S(p, m, g = p, _) {
				if (m === qe) return m;
				let x = _ === void 0 ? g._$Cl : g._$Co?.[_], w = c(m) ? void 0 : m._$litDirective$;
				return x?.constructor !== w && (x?._$AO?.(!1), w === void 0 ? x = void 0 : (x = new w(p), x._$AT(p, g, _)), _ === void 0 ? g._$Cl = x : (g._$Co ??= [])[_] = x), x !== void 0 && (m = S(p, x._$AS(p, m.values), x, _)), m;
			}
			class M {
				constructor(p, m) {
					this._$AV = [], this._$AN = void 0, this._$AD = p, this._$AM = m;
				}
				get parentNode() {
					return this._$AM.parentNode;
				}
				get _$AU() {
					return this._$AM._$AU;
				}
				u(p) {
					let { el: { content: m }, parts: g } = this._$AD, _ = (p?.creationScope ?? U).importNode(m, !0);
					nt.currentNode = _;
					let x = nt.nextNode(), w = 0, D = 0, O = g[0];
					for (; O !== void 0;) {
						if (w === O.index) {
							let m;
							O.type === 2 ? m = new R(x, x.nextSibling, this, p) : O.type === 1 ? m = new O.ctor(x, O.name, O.strings, this, p) : O.type === 6 && (m = new z(x, this, p)), this._$AV.push(m), O = g[++D];
						}
						w !== O?.index && (x = nt.nextNode(), w++);
					}
					return nt.currentNode = U, _;
				}
				p(p) {
					let m = 0;
					for (let g of this._$AV) g !== void 0 && (g.strings === void 0 ? g._$AI(p[m]) : (g._$AI(p, g, m), m += g.strings.length - 2)), m++;
				}
			}
			class R {
				get _$AU() {
					return this._$AM?._$AU ?? this._$Cv;
				}
				constructor(p, m, g, _) {
					this.type = 2, this._$AH = Ye, this._$AN = void 0, this._$AA = p, this._$AB = m, this._$AM = g, this.options = _, this._$Cv = _?.isConnected ?? !0;
				}
				get parentNode() {
					let p = this._$AA.parentNode, m = this._$AM;
					return m !== void 0 && p?.nodeType === 11 && (p = m.parentNode), p;
				}
				get startNode() {
					return this._$AA;
				}
				get endNode() {
					return this._$AB;
				}
				_$AI(p, m = this) {
					p = S(this, p, m), c(p) ? p === Ye || p == null || p === "" ? (this._$AH !== Ye && this._$AR(), this._$AH = Ye) : p !== this._$AH && p !== qe && this._(p) : p._$litType$ === void 0 ? p.nodeType === void 0 ? u(p) ? this.k(p) : this._(p) : this.T(p) : this.$(p);
				}
				O(p) {
					return this._$AA.parentNode.insertBefore(p, this._$AB);
				}
				T(p) {
					this._$AH !== p && (this._$AR(), this._$AH = this.O(p));
				}
				_(p) {
					this._$AH !== Ye && c(this._$AH) ? this._$AA.nextSibling.data = p : this.T(U.createTextNode(p)), this._$AH = p;
				}
				$(p) {
					let { values: m, _$litType$: g } = p, _ = typeof g == "number" ? this._$AC(p) : (g.el === void 0 && (g.el = N.createElement(P(g.h, g.h[0]), this.options)), g);
					if (this._$AH?._$AD === _) this._$AH.p(m);
					else {
						let p = new M(_, this), g = p.u(this.options);
						p.p(m), this.T(g), this._$AH = p;
					}
				}
				_$AC(p) {
					let m = tt.get(p.strings);
					return m === void 0 && tt.set(p.strings, m = new N(p)), m;
				}
				k(p) {
					K(this._$AH) || (this._$AH = [], this._$AR());
					let m = this._$AH, g, _ = 0;
					for (let x of p) _ === m.length ? m.push(g = new R(this.O(l()), this.O(l()), this, this.options)) : g = m[_], g._$AI(x), _++;
					_ < m.length && (this._$AR(g && g._$AB.nextSibling, _), m.length = _);
				}
				_$AR(p = this._$AA.nextSibling, m) {
					for (this._$AP?.(!1, !0, m); p && p !== this._$AB;) {
						let m = p.nextSibling;
						p.remove(), p = m;
					}
				}
				setConnected(p) {
					this._$AM === void 0 && (this._$Cv = p, this._$AP?.(p));
				}
			}
			class k {
				get tagName() {
					return this.element.tagName;
				}
				get _$AU() {
					return this._$AM._$AU;
				}
				constructor(p, m, g, _, x) {
					this.type = 1, this._$AH = Ye, this._$AN = void 0, this.element = p, this.name = m, this._$AM = _, this.options = x, g.length > 2 || g[0] !== "" || g[1] !== "" ? (this._$AH = Array(g.length - 1).fill(new String()), this.strings = g) : this._$AH = Ye;
				}
				_$AI(p, m = this, g, _) {
					let x = this.strings, w = !1;
					if (x === void 0) p = S(this, p, m, 0), w = !c(p) || p !== this._$AH && p !== qe, w && (this._$AH = p);
					else {
						let _ = p, D, O;
						for (p = x[0], D = 0; D < x.length - 1; D++) O = S(this, _[g + D], m, D), O === qe && (O = this._$AH[D]), w ||= !c(O) || O !== this._$AH[D], O === Ye ? p = Ye : p !== Ye && (p += (O ?? "") + x[D + 1]), this._$AH[D] = O;
					}
					w && !_ && this.j(p);
				}
				j(p) {
					p === Ye ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, p ?? "");
				}
			}
			class H extends k {
				constructor() {
					super(...arguments), this.type = 3;
				}
				j(p) {
					this.element[this.name] = p === Ye ? void 0 : p;
				}
			}
			class I extends k {
				constructor() {
					super(...arguments), this.type = 4;
				}
				j(p) {
					this.element.toggleAttribute(this.name, !!p && p !== Ye);
				}
			}
			class L extends k {
				constructor(p, m, g, _, x) {
					super(p, m, g, _, x), this.type = 5;
				}
				_$AI(p, m = this) {
					if ((p = S(this, p, m, 0) ?? Ye) === qe) return;
					let g = this._$AH, _ = p === Ye && g !== Ye || p.capture !== g.capture || p.once !== g.once || p.passive !== g.passive, x = p !== Ye && (g === Ye || _);
					_ && this.element.removeEventListener(this.name, this, g), x && this.element.addEventListener(this.name, this, p), this._$AH = p;
				}
				handleEvent(p) {
					typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, p) : this._$AH.handleEvent(p);
				}
			}
			class z {
				constructor(p, m, g) {
					this.element = p, this.type = 6, this._$AN = void 0, this._$AM = m, this.options = g;
				}
				get _$AU() {
					return this._$AM._$AU;
				}
				_$AI(p) {
					S(this, p);
				}
			}
			let rt = {
				M: D,
				P: O,
				A,
				C: 1,
				L: V,
				R: M,
				D: u,
				V: S,
				I: R,
				H: k,
				N: I,
				U: L,
				B: H,
				F: z
			}, it = _.litHtmlPolyfillSupport;
			it?.(N, R), (_.litHtmlVersions ??= []).push("3.3.0");
			let B = (p, m, g) => {
				let _ = g?.renderBefore ?? m, x = _._$litPart$;
				if (x === void 0) {
					let p = g?.renderBefore ?? null;
					_._$litPart$ = x = new R(m.insertBefore(l(), p), p, void 0, g ?? {});
				}
				return x._$AI(p), x;
			};
		},
		"./node_modules/requestidlecallback-polyfill/index.js": () => {
			window.requestIdleCallback = window.requestIdleCallback || function(p) {
				var m = Date.now();
				return setTimeout(function() {
					p({
						didTimeout: !1,
						timeRemaining: function() {
							return Math.max(0, 50 - (Date.now() - m));
						}
					});
				}, 1);
			}, window.cancelIdleCallback = window.cancelIdleCallback || function(p) {
				clearTimeout(p);
			};
		},
		"./src/audioDownloader/iframe.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { q: () => initAudioDownloaderIframe });
					var x = g("./src/utils/debug.ts"), w = g("./src/utils/iframeConnector.ts"), D = g("./src/audioDownloader/shared.ts"), O = g("./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/iframe.ts"), A = p([w, O]);
					[w, O] = A.then ? (await A)() : A;
					let handleIframeMessage = async ({ data: p }) => {
						if (p?.messageDirection === "request") try {
							switch (p.messageType) {
								case "get-download-audio-data-in-iframe":
									await (0, O.H)(p.payload);
									break;
								default: x.A.log(`NOT IMPLEMENTED: ${p.messageType}`, p.payload);
							}
						} catch (p) {
							console.warn("[VOT] Main world bridge", { error: p });
						}
					};
					function initAudioDownloaderIframe() {
						return (0, w.Io)(D.D5, handleIframeMessage);
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/audioDownloader/index.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { I: () => AudioDownloader });
					var x = g("./node_modules/@vot.js/core/dist/types/yandex.js"), w = g("./src/core/eventImpl.ts"), D = g("./src/utils/debug.ts"), O = g("./src/audioDownloader/strategies/index.ts"), A = g("./src/audioDownloader/strategies/utils.ts"), F = p([O, A]);
					[O, A] = F.then ? (await F)() : F;
					async function handleCommonAudioDownloadRequest({ audioDownloader: p, translationId: m, videoId: g, signal: _ }) {
						let x = await O.W[p.strategy]({
							videoId: g,
							returnByParts: !0,
							signal: _
						});
						if (!x) throw Error("Audio downloader. Can not get audio data");
						D.A.log("Audio downloader. Url found", { audioDownloadType: p.strategy });
						let { getMediaBuffers: w, mediaPartsLength: A, fileId: F } = x;
						if (A < 2) {
							let { value: _ } = await w().next();
							if (!_) throw Error("Audio downloader. Empty audio");
							p.onDownloadedAudio.dispatch(m, {
								videoId: g,
								fileId: F,
								audioData: _
							});
							return;
						}
						let U = 0;
						for await (let _ of w()) {
							if (!_) throw Error("Audio downloader. Empty audio");
							p.onDownloadedPartialAudio.dispatch(m, {
								videoId: g,
								fileId: F,
								audioData: _,
								version: 1,
								index: U,
								amount: A
							}), U++;
						}
					}
					async function mainWorldMessageHandler({ data: p }) {
						try {
							if (p?.messageDirection !== "request") return;
							switch (p.messageType) {
								case "get-download-audio-data-in-main-world":
									await (0, A.hy)("get-download-audio-data-in-iframe", p);
									break;
							}
						} catch (p) {
							console.warn("[VOT] Main world bridge", { error: p });
						}
					}
					class AudioDownloader {
						onDownloadedAudio = new w.Z();
						onDownloadedPartialAudio = new w.Z();
						onDownloadAudioError = new w.Z();
						strategy;
						constructor(p = x.J.WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME) {
							this.strategy = p, D.A.log("Audio downloader created", { strategy: p });
						}
						async runAudioDownload(p, m, g) {
							window.addEventListener("message", mainWorldMessageHandler);
							try {
								await handleCommonAudioDownloadRequest({
									audioDownloader: this,
									translationId: m,
									videoId: p,
									signal: g
								}), D.A.log("Audio downloader. Audio download finished", { videoId: p });
							} catch (m) {
								console.warn("Audio downloader. Failed to download audio", m), this.onDownloadAudioError.dispatch(p);
							}
							window.removeEventListener("message", mainWorldMessageHandler);
						}
						addEventListener(p, m) {
							switch (p) {
								case "downloadedAudio":
									this.onDownloadedAudio.addListener(m);
									break;
								case "downloadedPartialAudio":
									this.onDownloadedPartialAudio.addListener(m);
									break;
								case "downloadAudioError":
									this.onDownloadAudioError.addListener(m);
									break;
							}
							return this;
						}
						removeEventListener(p, m) {
							switch (p) {
								case "downloadedAudio":
									this.onDownloadedAudio.removeListener(m);
									break;
								case "downloadedPartialAudio":
									this.onDownloadedPartialAudio.removeListener(m);
									break;
								case "downloadAudioError":
									this.onDownloadAudioError.removeListener(m);
									break;
							}
							return this;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/audioDownloader/shared.ts": (p, m, g) => {
			"use strict";
			g.d(m, {
				Aj: () => O,
				D5: () => w,
				RZ: () => deserializeRequestInit,
				SZ: () => serializeResponse,
				cP: () => K,
				ds: () => U,
				kV: () => A,
				ov: () => D,
				pr: () => x,
				rh: () => getRequestUrl,
				sU: () => F,
				yA: () => serializeRequestInit
			});
			var _ = g("./node_modules/@vot.js/shared/dist/index.js");
			let x = "vot_iframe_player", w = "service", D = "www.youtube.com", O = _.$W.minChunkSize, A = .9, F = [
				6e4,
				8e4,
				15e4,
				33e4,
				46e4
			], U = 15e3, K = .9, getRequestUrl = (p) => typeof p == "string" ? p : p.url;
			function serializeRequestInit(p) {
				let m = new Uint8Array([120, 0]);
				if (typeof p == "string") return {
					body: m,
					cache: "no-store",
					credentials: "include",
					method: "POST"
				};
				let { headers: g, cache: _, credentials: x, integrity: w, keepalive: D, method: O, mode: A, redirect: F, referrer: U, referrerPolicy: K } = p, oe = [...g.entries()];
				return {
					body: m,
					cache: _,
					credentials: x,
					headersEntries: oe,
					integrity: w,
					keepalive: D,
					method: O,
					mode: A,
					redirect: F,
					referrer: U,
					referrerPolicy: K
				};
			}
			function deserializeRequestInit(p) {
				let { headersEntries: m,...g } = p, _ = new Headers(m);
				return {
					...g,
					headers: _
				};
			}
			function serializeResponse(p) {
				let { ok: m, redirected: g, status: _, statusText: x, type: w, url: D } = p;
				return {
					ok: m,
					redirected: g,
					status: _,
					statusText: x,
					type: w,
					url: D
				};
			}
		},
		"./src/audioDownloader/strategies/index.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { W: () => O });
					var x = g("./node_modules/@vot.js/core/dist/types/yandex.js"), w = g("./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/index.ts"), D = p([w]);
					w = (D.then ? (await D)() : D)[0];
					let O = { [x.J.WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME]: w.$ };
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/audioDownloader/strategies/utils.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						Lm: () => getChunkRangesFromAdaptiveFormat,
						bB: () => getChunkRangesPartsFromAdaptiveFormat,
						hy: () => sendRequestToIframe,
						iz: () => mergeBuffers,
						qk: () => makeFileId
					});
					var x = g("./src/utils/iframeConnector.ts"), w = g("./src/audioDownloader/shared.ts"), D = p([x]);
					x = (D.then ? (await D)() : D)[0];
					let O = null;
					function getChunkRangesPartsFromContentLength(p) {
						if (p < 1) throw Error("Audio downloader. WEB API. contentLength must be at least 1");
						let m = Math.round(p * w.kV), g = [], _ = [], x = 0, D = 0, O = 0, A = Math.min(w.sU[D], p);
						for (; A < p;) {
							let p = A < m;
							_.push({
								start: O,
								end: A,
								mustExist: p
							}), x += A - O, x >= w.Aj && (g.push(_), _ = [], x = 0), D < w.sU.length - 1 && D++, O = A + 1, A += w.sU[D];
						}
						return A = p, _.push({
							start: O,
							end: A,
							mustExist: !1
						}), g.push(_), g;
					}
					function parseContentLength({ contentLength: p }) {
						if (typeof p != "string") throw Error(`Audio downloader. WEB API. Content length (${p}) is not a string`);
						let m = Number.parseInt(p);
						if (!Number.isFinite(m)) throw Error(`Audio downloader. WEB API. Parsed content length is not finite (${m})`);
						return m;
					}
					function getChunkRangesPartsFromAdaptiveFormat(p) {
						let m = parseContentLength(p), g = getChunkRangesPartsFromContentLength(m);
						if (!g.length) throw Error("Audio downloader. WEB API. No chunk parts generated");
						return g;
					}
					function getChunkRangesFromContentLength(p) {
						if (p < 1) throw Error("Audio downloader. WEB API. contentLength cannot be less than 1");
						let m = Math.round(p * w.kV), g = [], _ = 0, x = 0, D = Math.min(w.sU[_], p);
						for (; D < p;) {
							let p = D < m;
							g.push({
								start: x,
								end: D,
								mustExist: p
							}), _ !== w.sU.length - 1 && _++, x = D + 1, D += w.sU[_];
						}
						return g.push({
							start: x,
							end: p,
							mustExist: !1
						}), g;
					}
					function getChunkRangesFromAdaptiveFormat(p) {
						let m = parseContentLength(p), g = getChunkRangesFromContentLength(m);
						if (!g.length) throw Error("Audio downloader. WEB API. Empty chunk ranges");
						return g;
					}
					function mergeBuffers(p) {
						let m = p.reduce((p, m) => p + m.byteLength, 0), g = new Uint8Array(m), _ = 0;
						for (let m of p) g.set(new Uint8Array(m), _), _ += m.byteLength;
						return g;
					}
					async function sendRequestToIframe(p, m) {
						let { videoId: g } = m.payload, _ = `https://${w.ov}/embed/${g}?autoplay=0&mute=1`;
						try {
							let g = await (0, x.IA)(O, _, w.pr, w.D5);
							if (!(0, x.yB)(w.pr)) throw Error("Audio downloader. WEB API. Service iframe deleted");
							g.contentWindow?.postMessage({
								messageId: (0, x.Ok)(),
								messageType: p,
								messageDirection: "request",
								payload: m,
								error: m.error
							}, "*");
						} catch (p) {
							m.error = p, m.messageDirection = "response", window.postMessage(m, "*");
						}
					}
					function makeFileId(p, m, g) {
						return JSON.stringify({
							downloadType: p,
							itag: m,
							minChunkSize: w.Aj,
							fileSize: g
						});
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/consts.ts": (p, m, g) => {
			"use strict";
			g.d(m, {
				Cp: () => _,
				Vf: () => w,
				kX: () => x,
				l4: () => D,
				su: () => O
			});
			let _ = "Audio downloader. WEB API. Can not get getGeneratingAudioUrlsDataFromIframe due to timeout", x = "Audio downloader. WEB API. Incorrect response on fetch media url", w = "Audio downloader. WEB API. Can not fetch media url", D = "Audio downloader. WEB API. Can not get array buffer from media url", O = new TextDecoder("ascii");
		},
		"./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/helpers.ts": (p, m, g) => {
			"use strict";
			g.d(m, {
				DA: () => getUrlFromArrayBuffer,
				ay: () => patchMediaUrl,
				eN: () => isChunkLengthAcceptable
			});
			var _ = g("./src/audioDownloader/shared.ts"), x = g("./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/consts.ts");
			let w = 1;
			function patchMediaUrl(p, { start: m, end: g }) {
				let _ = new URL(p);
				return _.searchParams.set("range", `${m}-${g}`), _.searchParams.set("rn", String(w++)), _.searchParams.delete("ump"), _.toString();
			}
			function isChunkLengthAcceptable(p, { start: m, end: g }) {
				let x = g - m;
				return x > _.ds && p.byteLength < _.ds ? !1 : Math.min(x, p.byteLength) / Math.max(x, p.byteLength) > _.cP;
			}
			let getUrlFromArrayBuffer = (p) => x.su.decode(p).match(/https:\/\/.*$/)?.[0];
		},
		"./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/iframe.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { H: () => getDownloadAudioData });
					var x = g("./node_modules/@vot.js/ext/dist/helpers/youtube.js"), w = g("./src/utils/debug.ts"), D = g("./src/utils/utils.ts"), O = p([D]);
					D = (O.then ? (await O)() : O)[0];
					let A = "", getAdaptiveFormats = () => x.A.getPlayerResponse()?.streamingData?.adaptiveFormats;
					function selectBestAudioFormat() {
						let p = getAdaptiveFormats();
						if (!p?.length) {
							let m = p ? "Empty adaptive formats" : "Cannot get adaptive formats";
							throw Error(`Audio downloader. WEB API. ${m}`);
						}
						let m = p.filter(({ audioQuality: p, mimeType: m }) => p || m?.includes("audio"));
						if (!m.length) throw Error("Audio downloader. WEB API. No audio adaptive formats");
						let g = m.filter(({ itag: p }) => p === 251).sort(({ contentLength: p }, { contentLength: m }) => p && m ? Number.parseInt(p) - Number.parseInt(m) : -1);
						return g.at(-1) ?? m[0];
					}
					let waitForPlayer = async () => (await (0, D.UV)(() => !!x.A.getPlayer(), 1e4), x.A.getPlayer()), loadVideo = async (p) => {
						let m = await waitForPlayer();
						if (p.messageId !== A) throw Error("Audio downloader. Download started for another video while getting player");
						if (!m?.loadVideoById) throw Error("Audio downloader. There is no player.loadVideoById in iframe");
						m.loadVideoById(p.payload.videoId), m.pauseVideo?.(), m.mute?.(), setTimeout(() => {
							if (p.messageId !== A) {
								console.warn("Audio Downloader. Download started for another video while waiting to repause video");
								return;
							}
							if (!m) {
								console.warn("[Critical] Audio Downloader. Player not found in iframe after timeout");
								return;
							}
							m.pauseVideo?.();
						}, 1e3);
					};
					function injectFetchInterceptor(p) {
						let m = document.createElement("script");
						m.textContent = `(function() {
    var originalFetch = window.fetch;
    var msgId = ${JSON.stringify(p)};
    var restored = false;

    function restore() {
      if (!restored) {
        restored = true;
        window.fetch = originalFetch;
      }
    }

    window.fetch = async function(input, init) {
      if (input instanceof URL) input = input.toString();
      var url = typeof input === "string" ? input : input.url;

      if (url.includes("googlevideo.com/videoplayback") && typeof input !== "string") {
        try {
          var reader = input.clone().body && input.clone().body.getReader();
          if (reader) {
            var totalLength = 0;
            while (true) {
              var chunk = await reader.read();
              if (chunk.done) break;
              totalLength += chunk.value.length;
              if (totalLength > 2) {
                restore();
                window.postMessage({
                  type: "vot-fetch-intercepted",
                  messageId: msgId,
                  error: "Audio downloader. Detected encoded request."
                }, "*");
                return originalFetch.apply(this, arguments);
              }
            }
          }
        } catch(e) {}
      }

      var response = await originalFetch.apply(this, arguments);

      if (url.includes("&itag=251&")) {
        restore();
        var serializedInit = null;
        if (typeof input !== "string") {
          try {
            serializedInit = {
              body: [120, 0],
              headersEntries: Array.from(input.headers.entries()),
              cache: input.cache,
              credentials: input.credentials,
              integrity: input.integrity,
              keepalive: input.keepalive,
              method: input.method,
              mode: input.mode,
              redirect: input.redirect,
              referrer: input.referrer,
              referrerPolicy: input.referrerPolicy
            };
          } catch(e) {}
        }
        window.postMessage({
          type: "vot-fetch-intercepted",
          messageId: msgId,
          requestUrl: url,
          requestInit: serializedInit
        }, "*");
      }

      return response;
    };
  })();`, (document.head || document.documentElement).appendChild(m), m.remove();
					}
					async function getDownloadAudioData(p) {
						try {
							A = p.messageId, w.A.log("getDownloadAudioData", p), injectFetchInterceptor(p.messageId);
							let m = new Promise((m, g) => {
								let handler = (_) => {
									let x = _.data;
									x?.type !== "vot-fetch-intercepted" || x?.messageId !== p.messageId || (window.removeEventListener("message", handler), x.error ? g(Error(x.error)) : m({
										requestUrl: x.requestUrl,
										requestInit: x.requestInit
									}));
								};
								window.addEventListener("message", handler);
							});
							await loadVideo(p);
							let { requestUrl: g, requestInit: _ } = await m;
							window.parent.postMessage({
								...p,
								messageDirection: "response",
								payload: {
									requestInfo: g,
									requestInit: _,
									adaptiveFormat: selectBestAudioFormat(),
									itag: 251
								}
							}, "*");
						} catch (m) {
							window.parent.postMessage({
								...p,
								messageDirection: "response",
								error: m
							}, "*");
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/index.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { $: () => getAudioFromWebApiWithReplacedFetch });
					var x = g("./node_modules/@vot.js/core/dist/types/yandex.js"), w = g("./src/utils/debug.ts"), D = g("./src/utils/gm.ts"), O = g("./src/utils/iframeConnector.ts"), A = g("./src/utils/utils.ts"), F = g("./src/audioDownloader/shared.ts"), U = g("./src/audioDownloader/strategies/utils.ts"), K = g("./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/consts.ts"), oe = g("./src/audioDownloader/strategies/webApiGetAllGeneratingUrlsData/helpers.ts"), le = p([
						D,
						O,
						A,
						U
					]);
					[D, O, A, U] = le.then ? (await le)() : le;
					let ue = x.J.WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME, getDownloadAudioDataInMainWorld = (p) => (0, O.hG)("get-download-audio-data-in-main-world", p);
					async function getGeneratingAudioUrlsDataFromIframe(p) {
						try {
							return await Promise.race([getDownloadAudioDataInMainWorld({ videoId: p }), (0, A.wR)(2e4, K.Cp)]);
						} catch (p) {
							let m = p instanceof Error && p.message === K.Cp;
							throw w.A.log("getGeneratingAudioUrlsDataFromIframe error", p), Error(m ? K.Cp : "Audio downloader. WEB API. Failed to get audio data");
						}
					}
					async function fetchMediaWithMeta({ mediaUrl: p, chunkRange: m, requestInit: g, signal: _, isUrlChanged: x = !1 }) {
						let O = (0, oe.ay)(p, m), A;
						try {
							if (A = await (0, D.G3)(O, {
								...g,
								signal: _
							}), !A.ok) {
								let p = (0, F.SZ)(A);
								throw console.warn(K.kX, p), Error(K.kX);
							}
						} catch (p) {
							throw p instanceof Error && p.message === K.kX ? p : (console.warn(K.Vf, {
								mediaUrl: O,
								error: p
							}), Error(K.Vf));
						}
						let U;
						try {
							U = await A.arrayBuffer();
						} catch (p) {
							throw console.warn(K.l4, {
								mediaUrl: O,
								error: p
							}), Error(K.l4);
						}
						if (w.A.log("isChunkLengthAcceptable", (0, oe.eN)(U, m), U.byteLength, m), (0, oe.eN)(U, m)) return {
							media: U,
							url: x ? p : null,
							isAcceptableLast: !1
						};
						let le = (0, oe.DA)(U);
						if (w.A.log("redirectedUrl", le), le) return fetchMediaWithMeta({
							mediaUrl: le,
							chunkRange: m,
							requestInit: g,
							signal: _,
							isUrlChanged: !0
						});
						if (!m.mustExist) return {
							media: U,
							url: null,
							isAcceptableLast: !0
						};
						throw Error(`Audio downloader. WEB API. Can not get redirected media url ${O}`);
					}
					async function fetchMediaWithMetaByChunkRanges(p, m, g, _) {
						let x = p, w = [], D = !1;
						for (let p of g) {
							let g = await fetchMediaWithMeta({
								mediaUrl: x,
								chunkRange: p,
								requestInit: m,
								signal: _
							});
							if (g.url && (x = g.url), w.push(g.media), D = g.isAcceptableLast, D) break;
						}
						return {
							media: (0, U.iz)(w),
							url: x,
							isAcceptableLast: D
						};
					}
					async function getAudioFromWebApiWithReplacedFetch({ videoId: p, returnByParts: m = !1, signal: g }) {
						let { requestInit: _, requestInfo: x, adaptiveFormat: w, itag: D } = await getGeneratingAudioUrlsDataFromIframe(p);
						if (!x) throw Error("Audio downloader. WEB API. Can not get requestInfo");
						let O = (0, F.rh)(x), A = (0, F.yA)(x), K = (0, F.RZ)(A), oe = _ || K;
						return {
							fileId: (0, U.qk)(ue, D, w.contentLength),
							mediaPartsLength: m ? (0, U.bB)(w).length : 1,
							async *getMediaBuffers() {
								if (m) {
									let p = (0, U.bB)(w);
									for (let m of p) {
										let { media: p, url: _, isAcceptableLast: x } = await fetchMediaWithMetaByChunkRanges(O, oe, m, g);
										if (_ && (O = _), yield p, x) break;
									}
								} else {
									let p = (0, U.Lm)(w), { media: m } = await fetchMediaWithMetaByChunkRanges(O, oe, p, g);
									yield m;
								}
							}
						};
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/config/config.js": (p, m, g) => {
			"use strict";
			g.d(m, {
				Ek: () => le,
				JD: () => ue,
				K2: () => Be,
				Pm: () => w,
				T8: () => we,
				cL: () => U,
				hx: () => oe,
				k$: () => O,
				mE: () => Ie,
				px: () => je,
				qU: () => We,
				r4: () => Ke,
				rl: () => _,
				se: () => x,
				sl: () => A,
				tZ: () => D,
				vZ: () => Ue,
				xW: () => F
			});
			let _ = "api.browser.yandex.ru", x = "media-proxy.toil.cc/v1/proxy/m3u8", w = "vot-worker.toil.cc", D = "https://vot.toil.cc/v1", O = "https://translate.toil.cc/v2", A = "https://rust-server-531j.onrender.com/detect", F = "https://t2mc.toil.cc", U = "https://avatars.mds.yandex.net/get-yapic", K = "ilyhalight/voice-over-translation", oe = `https://raw.githubusercontent.com/${K}`, le = `https://github.com/${K}`, ue = 15, we = 900, je = 5, Ie = "yandexbrowser", Be = "yandexbrowser", Ve = null, Ue = [
				"UA",
				"LV",
				"LT"
			], We = 1e3, Ke = "2025-05-09";
		},
		"./src/core/auth.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { L: () => initAuth });
					var x = g("./src/utils/storage.ts"), w = p([x]);
					x = (w.then ? (await w)() : w)[0];
					async function handleAuthCallbackPage() {
						let { access_token: p, expires_in: m } = Object.fromEntries(new URLSearchParams(window.location.hash.slice(1)));
						if (!p || !m) throw Error("[VOT] Invalid token response");
						let g = parseInt(m);
						if (Number.isNaN(g)) throw Error("[VOT] Invalid expires_in value");
						await x.d.set("account", {
							token: p,
							expires: Date.now() + g * 1e3,
							username: void 0,
							avatarId: void 0
						});
					}
					async function handleProfilePage() {
						let { avatar_id: p, username: m } = _userData;
						if (!p || !m) throw Error("[VOT] Invalid user data");
						let g = await x.d.get("account");
						if (!g) throw Error("[VOT] No account data found");
						await x.d.set("account", {
							...g,
							username: m,
							avatarId: p
						});
					}
					async function initAuth() {
						if (window.location.pathname === "/auth/callback") return await handleAuthCallbackPage();
						if (window.location.pathname === "/my/profile") return await handleProfilePage();
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/core/cacheManager.ts": (p, m, g) => {
			"use strict";
			g.d(m, { G: () => CacheManager });
			class CacheManager {
				cache;
				constructor() {
					this.cache = new Map();
				}
				get(p) {
					return this.cache.get(p);
				}
				set(p, m) {
					return this.cache.set(p, m), this;
				}
				delete(p) {
					return this.cache.delete(p), this;
				}
				getTranslation(p) {
					let m = this.get(p);
					return m ? m.translation : void 0;
				}
				setTranslation(p, m) {
					let g = this.get(p) || {};
					g.translation = m, this.set(p, g);
				}
				getSubtitles(p) {
					let m = this.get(p);
					return m ? m.subtitles : void 0;
				}
				setSubtitles(p, m) {
					let g = this.get(p) || {};
					g.subtitles = m, this.set(p, g);
				}
				deleteSubtitles(p) {
					let m = this.get(p);
					m && (m.subtitles = void 0, this.set(p, m));
				}
			}
		},
		"./src/core/eventImpl.ts": (p, m, g) => {
			"use strict";
			g.d(m, { Z: () => EventImpl });
			class EventImpl {
				listeners;
				constructor() {
					this.listeners = new Set();
				}
				addListener(p) {
					if (this.listeners.has(p)) throw Error("[VOT] The listener has already been added.");
					this.listeners.add(p);
				}
				removeListener(p) {
					this.listeners.delete(p);
				}
				dispatch(...p) {
					for (let m of this.listeners) try {
						m(...p);
					} catch (p) {
						console.warn("[VOT]", p);
					}
				}
				clear() {
					this.listeners.clear();
				}
			}
		},
		"./src/core/translationHandler.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { F: () => VOTTranslationHandler });
					var x = g("./node_modules/@vot.js/core/dist/types/yandex.js"), w = g("./src/audioDownloader/index.ts"), D = g("./src/localization/localizationProvider.ts"), O = g("./src/utils/debug.ts"), A = g("./src/utils/localization.ts"), F = g("./src/utils/utils.ts"), U = g("./src/utils/VOTLocalizedError.js"), K = p([
						w,
						D,
						A,
						F,
						U
					]);
					[w, D, A, F, U] = K.then ? (await K)() : K;
					class VOTTranslationHandler {
						videoHandler;
						audioDownloader;
						downloading;
						constructor(p) {
							this.videoHandler = p, this.audioDownloader = new w.I(), this.downloading = !1, this.audioDownloader.addEventListener("downloadedAudio", async (p, m) => {
								if (O.A.log("downloadedAudio", m), !this.downloading) {
									O.A.log("skip downloadedAudio");
									return;
								}
								let { videoId: g, fileId: _, audioData: x } = m, w = this.getCanonicalUrl(g);
								try {
									await this.videoHandler.votClient.requestVtransAudio(w, p, {
										audioFile: x,
										fileId: _
									});
								} catch {}
								this.downloading = !1;
							}).addEventListener("downloadedPartialAudio", async (p, m) => {
								if (O.A.log("downloadedPartialAudio", m), !this.downloading) {
									O.A.log("skip downloadedPartialAudio");
									return;
								}
								let { audioData: g, fileId: _, videoId: x, amount: w, version: D, index: A } = m, F = this.getCanonicalUrl(x);
								try {
									await this.videoHandler.votClient.requestVtransAudio(F, p, {
										audioFile: g,
										chunkId: A
									}, {
										audioPartsLength: w,
										fileId: _,
										version: D
									});
								} catch {
									this.downloading = !1;
								}
								A === w - 1 && (this.downloading = !1);
							}).addEventListener("downloadAudioError", async (p) => {
								if (!this.downloading) {
									O.A.log("skip downloadAudioError");
									return;
								}
								O.A.log(`Failed to download audio ${p}`);
								let m = this.getCanonicalUrl(p);
								await this.videoHandler.votClient.requestVtransFailAudio(m), this.downloading = !1;
							});
						}
						getCanonicalUrl(p) {
							return `https://youtu.be/${p}`;
						}
						isWaitingStreamRes(p) {
							return !!p.message;
						}
						async translateVideoImpl(p, m, g, _ = null, w = !1, U = new AbortController().signal) {
							clearTimeout(this.videoHandler.autoRetry), this.downloading = !1, O.A.log(p, `Translate video (requestLang: ${m}, responseLang: ${g})`);
							try {
								if (U.aborted) throw Error("AbortError");
								let K = this.videoHandler.isLivelyVoiceAllowed() && this.videoHandler.data?.useLivelyVoice, oe = await this.videoHandler.votClient.translateVideo({
									videoData: p,
									requestLang: m,
									responseLang: g,
									translationHelp: _,
									extraOpts: {
										useLivelyVoice: K,
										videoTitle: this.videoHandler.videoData?.title
									},
									shouldSendFailedAudio: w
								});
								if (O.A.log("Translate video result", oe), U.aborted) throw Error("AbortError");
								if (oe.translated && oe.remainingTime < 1) return O.A.log("Video translation finished with this data: ", oe), oe;
								let le = oe.message ?? D.j.get("translationTakeFewMinutes");
								if (await this.videoHandler.updateTranslationErrorMsg(oe.remainingTime > 0 ? (0, A.o)(oe.remainingTime) : le), oe.status === x.v.AUDIO_REQUESTED && this.videoHandler.isYouTubeHosts()) {
									if (O.A.log("Start audio download"), this.downloading = !0, await this.audioDownloader.runAudioDownload(p.videoId, oe.translationId, U), O.A.log("waiting downloading finish"), await (0, F.UV)(() => !this.downloading || U.aborted, 15e3), U.aborted) throw O.A.log("aborted after audio downloader vtrans"), Error("AbortError");
									return await this.translateVideoImpl(p, m, g, _, !0, U);
								}
							} catch (_) {
								if (_.message === "AbortError") return O.A.log("aborted video translation"), null;
								await this.videoHandler.updateTranslationErrorMsg(_.data?.message ?? _), console.warn("[VOT]", _);
								let x = `${p.videoId}_${m}_${g}_${this.videoHandler.data?.useLivelyVoice}`;
								return this.videoHandler.cacheManager.setTranslation(x, { error: _ }), null;
							}
							return new Promise((x) => {
								this.videoHandler.autoRetry = setTimeout(async () => {
									x(await this.translateVideoImpl(p, m, g, _, !0, U));
								}, 2e4);
							});
						}
						async translateStreamImpl(p, m, g, _ = new AbortController().signal) {
							clearTimeout(this.videoHandler.autoRetry), O.A.log(p, `Translate stream (requestLang: ${m}, responseLang: ${g})`);
							try {
								if (_.aborted) throw Error("AbortError");
								let x = await this.videoHandler.votClient.translateStream({
									videoData: p,
									requestLang: m,
									responseLang: g
								});
								if (_.aborted) throw Error("AbortError");
								if (O.A.log("Translate stream result", x), !x.translated && x.interval === 10) return await this.videoHandler.updateTranslationErrorMsg(D.j.get("translationTakeFewMinutes")), new Promise((w) => {
									this.videoHandler.autoRetry = setTimeout(async () => {
										w(await this.translateStreamImpl(p, m, g, _));
									}, x.interval * 1e3);
								});
								if (this.isWaitingStreamRes(x)) throw O.A.log(`Stream translation aborted! Message: ${x.message}`), new U.n("streamNoConnectionToServer");
								if (!x.result) throw O.A.log("Failed to find translation result! Data:", x), new U.n("audioNotReceived");
								return O.A.log("Stream translated successfully. Running...", x), this.videoHandler.streamPing = setInterval(async () => {
									O.A.log("Ping stream translation", x.pingId), this.videoHandler.votClient.pingStream({ pingId: x.pingId });
								}, x.interval * 1e3), x;
							} catch (p) {
								return p.message === "AbortError" ? (O.A.log("aborted stream translation"), null) : (console.warn("[VOT] Failed to translate stream", p), await this.videoHandler.updateTranslationErrorMsg(p.data?.message ?? p), null);
							}
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/core/videoManager.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { k: () => VOTVideoManager });
					var x = g("./node_modules/@vot.js/ext/dist/utils/videoData.js"), w = g("./node_modules/@vot.js/shared/dist/data/config.js"), D = g("./node_modules/@vot.js/shared/dist/data/consts.js"), O = g("./node_modules/@vot.js/ext/dist/helpers/youtube.js"), A = g("./src/localization/localizationProvider.ts"), F = g("./src/utils/VOTLocalizedError.js"), U = g("./src/utils/debug.ts"), K = g("./src/utils/gm.ts"), oe = g("./src/utils/translateApis.ts"), le = g("./src/utils/utils.ts"), ue = p([
						A,
						F,
						K,
						oe,
						le
					]);
					[A, F, K, oe, le] = ue.then ? (await ue)() : ue;
					class VOTVideoManager {
						videoHandler;
						constructor(p) {
							this.videoHandler = p;
						}
						async getVideoData() {
							let { duration: p, url: m, videoId: g, host: _, title: O, translationHelp: F = null, localizedTitle: ue, description: we, detectedLanguage: je, subtitles: Ie, isStream: Be = !1 } = await (0, x.o4)(this.videoHandler.site, {
								fetchFn: K.G3,
								video: this.videoHandler.video,
								language: A.j.lang
							}), Ve = je ?? this.videoHandler.translateFromLang;
							if (!je && O) {
								let p = (0, le.X5)(O, we);
								U.A.log(`Detecting language text: ${p}`);
								let m = await (0, oe.o0)(p);
								D.xm.includes(m) && (Ve = m);
							}
							let Ue = {
								translationHelp: F,
								isStream: Be,
								duration: p || this.videoHandler.video?.duration || w.A.defaultDuration,
								videoId: g,
								url: m,
								host: _,
								detectedLanguage: Ve,
								responseLanguage: this.videoHandler.translateToLang,
								subtitles: Ie,
								title: O,
								localizedTitle: ue,
								downloadTitle: ue ?? O ?? g
							};
							if (console.log("[VOT] Detected language:", Ve), [
								"rutube",
								"ok.ru",
								"mail_ru"
							].includes(this.videoHandler.site.host)) Ue.detectedLanguage = "ru";
							else if (this.videoHandler.site.host === "youku") Ue.detectedLanguage = "zh";
							else if (this.videoHandler.site.host === "vk") {
								let p = document.getElementsByTagName("track")?.[0]?.srclang;
								Ue.detectedLanguage = p || "auto";
							} else this.videoHandler.site.host === "weverse" && (Ue.detectedLanguage = "ko");
							return Ue;
						}
						videoValidator() {
							if (!this.videoHandler.videoData || !this.videoHandler.data) throw new F.n("VOTNoVideoIDFound");
							if (U.A.log("VideoValidator videoData: ", this.videoHandler.videoData), this.videoHandler.data.enabledDontTranslateLanguages && this.videoHandler.data.dontTranslateLanguages?.includes(this.videoHandler.videoData.detectedLanguage)) throw new F.n("VOTDisableFromYourLang");
							if (this.videoHandler.site.host === "twitch" && this.videoHandler.videoData.isStream) throw new F.n("VOTStreamNotAvailable");
							if (!this.videoHandler.videoData.isStream && this.videoHandler.videoData.duration > 14400) throw new F.n("VOTVideoIsTooLong");
							return !0;
						}
						getVideoVolume() {
							let p = this.videoHandler.video?.volume;
							return ["youtube", "googledrive"].includes(this.videoHandler.site.host) && (p = O.A.getVolume() ?? p), p;
						}
						setVideoVolume(p) {
							if (!["youtube", "googledrive"].includes(this.videoHandler.site.host)) return this.videoHandler.video.volume = p, this;
							let m = O.A.setVolume(p);
							return m || (this.videoHandler.video.volume = p), this;
						}
						isMuted() {
							return ["youtube", "googledrive"].includes(this.videoHandler.site.host) ? O.A.isMuted() : this.videoHandler.video?.muted;
						}
						syncVideoVolumeSlider() {
							let p = this.isMuted() ? 0 : this.getVideoVolume() * 100, m = Math.round(p);
							return this.videoHandler.data?.syncVolume && (this.videoHandler.tempOriginalVolume = Number(m)), this.videoHandler.uiManager.votOverlayView?.isInitialized() && (this.videoHandler.uiManager.votOverlayView.videoVolumeSlider.value = m), this;
						}
						setSelectMenuValues(p, m) {
							if (!this.videoHandler.uiManager.votOverlayView?.isInitialized() || !this.videoHandler.videoData) return this;
							console.log(`[VOT] Set translation from ${p} to ${m}`), this.videoHandler.uiManager.votOverlayView.languagePairSelect.fromSelect.selectTitle = A.j.get(`langs.${p}`), this.videoHandler.uiManager.votOverlayView.languagePairSelect.toSelect.selectTitle = A.j.get(`langs.${m}`), this.videoHandler.uiManager.votOverlayView.languagePairSelect.fromSelect.setSelectedValue(p), this.videoHandler.uiManager.votOverlayView.languagePairSelect.toSelect.setSelectedValue(m), this.videoHandler.videoData.detectedLanguage = p, this.videoHandler.videoData.responseLanguage = m;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/index.js": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { k: () => at });
					var x = g("./node_modules/@vot.js/ext/dist/index.js"), w = g("./node_modules/@vot.js/ext/dist/helpers/youtube.js"), D = g("./node_modules/@vot.js/ext/dist/utils/videoData.js"), O = g("./node_modules/chaimu/dist/index.js"), A = g("./src/audioDownloader/iframe.ts"), F = g("./src/config/config.js"), U = g("./src/core/auth.ts"), K = g("./src/core/cacheManager.ts"), oe = g("./src/core/translationHandler.ts"), le = g("./src/core/videoManager.ts"), ue = g("./src/localization/localizationProvider.ts"), we = g("./src/subtitles.js"), je = g("./src/ui/components/hotkeyButton.ts"), Ie = g("./src/ui/manager.ts"), Be = g("./src/utils/debug.ts"), Ve = g("./src/utils/gm.ts"), Ue = g("./src/utils/iframeConnector.ts"), We = g("./src/utils/storage.ts"), Ke = g("./src/utils/translateApis.ts"), qe = g("./src/utils/utils.ts"), Ye = g("./src/utils/VideoObserver.js"), tt = g("./src/utils/VOTLocalizedError.js"), nt = g("./src/utils/volume.ts"), rt = g("./node_modules/hls.js/dist/hls.light.min.js").default, it = p([
						x,
						A,
						U,
						oe,
						le,
						ue,
						we,
						je,
						Ie,
						Ve,
						Ue,
						We,
						Ke,
						qe,
						tt
					]);
					[x, A, U, oe, le, ue, we, je, Ie, Ve, Ue, We, Ke, qe, tt] = it.then ? (await it)() : it;
					let at;
					class VideoHandler {
						translateFromLang = "auto";
						translateToLang = qe.HD;
						timer;
						data;
						videoData;
						firstPlay = !0;
						audioContext = (0, O.GZ)();
						hls;
						votClient;
						audioPlayer;
						abortController;
						actionsAbortController;
						cacheManager;
						downloadTranslationUrl = null;
						autoRetry;
						streamPing;
						votOpts;
						volumeOnStart;
						tempOriginalVolume;
						tempVolume;
						firstSyncVolume = !0;
						longWaitingResCount = 0;
						subtitles = [];
						constructor(p, m, g) {
							Be.A.log("[VideoHandler] add video:", p, "container:", m, this), this.video = p, this.container = m, this.site = g, this.abortController = new AbortController(), this.actionsAbortController = new AbortController(), this.uiManager = new Ie.o({
								root: this.container,
								portalContainer: this.getPortalContainer(),
								tooltipLayoutRoot: this.getTooltipLayoutRoot(),
								data: this.data,
								videoHandler: this
							}), this.translationHandler = new oe.F(this), this.videoManager = new le.k(this), this.cacheManager = new K.G();
						}
						getPortalContainer() {
							return this.site.host === "youtube" && this.site.additionalData !== "mobile" ? this.container.parentElement : this.container;
						}
						getTooltipLayoutRoot() {
							switch (this.site.host) {
								case "kickstarter": return document.getElementById("react-project-header");
								case "custom": return;
								default: return this.container;
							}
						}
						getEventContainer() {
							return this.site.eventSelector ? this.site.host === "twitter" ? this.container.closest(this.site.eventSelector) : document.querySelector(this.site.eventSelector) : this.container;
						}
						async autoTranslate() {
							if (this.firstPlay && this.data.autoTranslate && this.videoData.videoId) {
								this.firstPlay = !1;
								try {
									this.videoManager.videoValidator(), await this.uiManager.handleTranslationBtnClick();
								} catch (p) {
									console.warn("[VOT]", p);
									return;
								}
							}
						}
						getPreferAudio() {
							return !this.audioContext || !this.data.newAudioPlayer || this.videoData.isStream ? !0 : this.data.newAudioPlayer && !this.data.onlyBypassMediaCSP ? !1 : !this.site.needBypassCSP;
						}
						createPlayer() {
							let p = this.getPreferAudio();
							return Be.A.log("preferAudio:", p), this.audioPlayer = new O.Ay({
								video: this.video,
								debug: !1,
								fetchFn: Ve.G3,
								fetchOpts: { timeout: 0 },
								preferAudio: p
							}), this.audioPlayer.player.audioErrorHandle && (this.audioPlayer.player.audioErrorHandle = (p) => {
								Be.A.log("[AudioPlayer]", p);
							}), this;
						}
						async init() {
							if (!this.initialized) {
								if (this.data = await We.d.getValues({
									autoTranslate: !1,
									dontTranslateLanguages: [qe.HD],
									enabledDontTranslateLanguages: !0,
									enabledAutoVolume: !0,
									autoVolume: F.JD,
									buttonPos: "default",
									showVideoSlider: !0,
									syncVolume: !1,
									downloadWithName: Ve.yx,
									sendNotifyOnComplete: !1,
									subtitlesMaxLength: 300,
									highlightWords: !1,
									subtitlesFontSize: 20,
									subtitlesOpacity: 20,
									subtitlesDownloadFormat: "srt",
									responseLanguage: qe.HD,
									defaultVolume: 100,
									onlyBypassMediaCSP: Number(!!this.audioContext),
									newAudioPlayer: Number(!!this.audioContext),
									showPiPButton: !1,
									translateAPIErrors: !0,
									translationService: F.mE,
									detectService: F.K2,
									translationHotkey: null,
									m3u8ProxyHost: F.se,
									proxyWorkerHost: F.Pm,
									translateProxyEnabled: 0,
									translateProxyEnabledDefault: !0,
									audioBooster: !1,
									useLivelyVoice: !1,
									autoHideButtonDelay: F.qU,
									useAudioDownload: Ve.B0,
									compatVersion: "",
									account: {},
									localeHash: "",
									localeUpdatedAt: 0
								}), this.data.compatVersion !== F.r4 && (this.data = await (0, We._)(this.data), await We.d.set("compatVersion", F.r4)), this.uiManager.data = this.data, this.tempVolume = this.data.defaultVolume, console.log("[VOT] data from db: ", this.data), !this.data.translateProxyEnabled && Ve.up && (this.data.translateProxyEnabled = 1), !at) try {
									let p = await (0, Ve.G3)("https://speed.cloudflare.com/meta", { timeout: 7e3 });
									({country: at} = await p.json());
								} catch (p) {
									console.warn("[VOT] Error getting country:", p);
								}
								F.vZ.includes(at) && this.data.translateProxyEnabledDefault && (this.data.translateProxyEnabled = 2), Be.A.log("translateProxyEnabled", this.data.translateProxyEnabled, this.data.translateProxyEnabledDefault), Be.A.log("Extension compatibility passed..."), this.initVOTClient(), this.uiManager.initUI(), this.uiManager.initUIEvents(), this.subtitlesWidget = new we.o(this.video, this.getPortalContainer(), this.site, this.uiManager.votOverlayView.votOverlayPortal, this.getTooltipLayoutRoot()), this.subtitlesWidget.setMaxLength(this.data.subtitlesMaxLength), this.subtitlesWidget.setHighlightWords(this.data.highlightWords), this.subtitlesWidget.setFontSize(this.data.subtitlesFontSize), this.subtitlesWidget.setOpacity(this.data.subtitlesOpacity), this.createPlayer(), this.setSelectMenuValues(this.videoData.detectedLanguage, this.data.responseLanguage ?? "ru"), this.translateToLang = this.data.responseLanguage ?? "ru", this.initExtraEvents(), await this.autoTranslate(), this.initialized = !0;
							}
						}
						initVOTClient() {
							return this.votOpts = {
								fetchFn: Ve.G3,
								fetchOpts: { signal: this.actionsAbortController.signal },
								apiToken: this.data.account?.token,
								hostVOT: F.tZ,
								host: this.data.translateProxyEnabled ? this.data.proxyWorkerHost : F.rl
							}, this.votClient = new (this.data.translateProxyEnabled ? x.Pu : x.Ay)(this.votOpts), this;
						}
						transformBtn(p, m) {
							return this.uiManager.transformBtn(p, m), this;
						}
						hasActiveSource() {
							return !!(this.audioPlayer.player.src || this.hls?.url);
						}
						initExtraEvents() {
							let { signal: p } = this.abortController, addExtraEventListener = (m, g, _) => {
								m.addEventListener(g, _, { signal: p });
							}, addExtraEventListeners = (p, m, g) => {
								for (let _ of m) addExtraEventListener(p, _, g);
							};
							if (this.resizeObserver = new ResizeObserver((p) => {
								for (let m of p) this.uiManager.votOverlayView.votMenu.container.style.setProperty("--vot-container-height", `${m.contentRect.height}px`);
								let { position: m, direction: g } = this.uiManager.votOverlayView.calcButtonLayout(this.data?.buttonPos);
								this.uiManager.votOverlayView.updateButtonLayout(m, g);
							}), this.resizeObserver.observe(this.video), this.uiManager.votOverlayView.votMenu.container.style.setProperty("--vot-container-height", `${this.video.getBoundingClientRect().height}px`), ["youtube", "googledrive"].includes(this.site.host) && this.site.additionalData !== "mobile") {
								this.syncVolumeObserver = new MutationObserver((p) => {
									if (!(!this.audioPlayer.player.src || !this.data.syncVolume)) {
										for (let m of p) if (m.type === "attributes" && m.attributeName === "aria-valuenow") {
											if (this.firstSyncVolume) {
												this.firstSyncVolume = !1;
												return;
											}
											let p = this.isMuted() ? 0 : this.getVideoVolume() * 100, m = Math.round(p);
											this.data.defaultVolume = m, this.audioPlayer.player.volume = this.data.defaultVolume / 100, this.syncVolumeWrapper("video", m);
										}
									}
								});
								let p = document.querySelector(".ytp-volume-panel");
								p && this.syncVolumeObserver.observe(p, {
									attributes: !0,
									subtree: !0
								});
							}
							document.addEventListener("click", (p) => {
								let m = p.target, g = this.uiManager.votOverlayView.votButton.container, _ = this.uiManager.votOverlayView.votMenu.container, x = this.container, w = this.uiManager.votSettingsView.dialog.container, D = document.querySelector(".vot-dialog-temp"), O = g.contains(m), A = _.contains(m), F = x.contains(m), U = w.contains(m), K = D?.contains(m) ?? !1;
								Be.A.log(`[document click] ${O} ${A} ${F} ${U} ${K}`), !O && !A && !U && !K && (F || this.uiManager.votOverlayView.updateButtonOpacity(0), this.uiManager.votOverlayView.votMenu.hidden = !0);
							}, { signal: p });
							let m = new Set();
							document.addEventListener("keydown", async (p) => {
								if (p.repeat) return;
								m.add(p.code);
								let g = document.activeElement, _ = ["input", "textarea"].includes(g.tagName.toLowerCase()) || g.isContentEditable;
								if (_) return;
								let x = (0, je._)(m);
								Be.A.log(`combo: ${x}`), Be.A.log(`this.data.translationHotkey: ${this.data.translationHotkey}`), x === this.data.translationHotkey && await this.uiManager.handleTranslationBtnClick();
							}, { signal: p }), document.addEventListener("blur", () => {
								m.clear();
							}), document.addEventListener("keyup", (p) => {
								m.delete(p.code);
							}, { signal: p });
							let g = this.getEventContainer();
							g && addExtraEventListeners(g, ["pointermove", "pointerout"], this.resetTimer), addExtraEventListener(this.uiManager.votOverlayView.votButton.container, "pointermove", this.changeOpacityOnEvent), addExtraEventListener(this.uiManager.votOverlayView.votMenu.container, "pointermove", this.changeOpacityOnEvent), this.site.host !== "xvideos" && addExtraEventListener(document, "touchmove", this.resetTimer), this.site.host === "youtube" && (this.container.draggable = !1), addExtraEventListener(this.video, "canplay", async () => {
								this.site.host === "rutube" && this.video.src || await this.setCanPlay();
							}), addExtraEventListener(this.video, "emptied", async () => {
								let p = await (0, D.jY)(this.site, {
									fetchFn: Ve.G3,
									video: this.video
								});
								this.video.src && this.videoData && p === this.videoData.videoId || (Be.A.log("lipsync mode is emptied"), this.videoData = void 0, this.stopTranslation());
							}), ["rutube", "ok"].includes(this.site.host) || addExtraEventListener(this.video, "volumechange", () => {
								this.syncVideoVolumeSlider();
							}), this.site.host === "youtube" && !this.site.additionalData && addExtraEventListener(document, "yt-page-data-updated", async () => {
								Be.A.log("yt-page-data-updated"), window.location.pathname.includes("/shorts/") && await this.setCanPlay();
							});
						}
						async setCanPlay() {
							let p = await (0, D.jY)(this.site, {
								fetchFn: Ve.G3,
								video: this.video
							});
							this.videoData && p === this.videoData.videoId || (await this.handleSrcChanged(), await this.autoTranslate(), Be.A.log("lipsync mode is canplay"));
						}
						resetTimer = () => {
							clearTimeout(this.timer), this.uiManager.votOverlayView.updateButtonOpacity(1), this.timer = setTimeout(() => {
								this.uiManager.votOverlayView.updateButtonOpacity(0);
							}, this.data.autoHideButtonDelay);
						};
						changeOpacityOnEvent = (p) => {
							clearTimeout(this.timer), this.uiManager.votOverlayView.updateButtonOpacity(1), p.stopPropagation();
						};
						async changeSubtitlesLang(p) {
							if (Be.A.log("[onchange] subtitles", p), this.uiManager.votOverlayView.subtitlesSelect.setSelectedValue(p), p === "disabled") this.subtitlesWidget.setContent(null), this.uiManager.votOverlayView.downloadSubtitlesButton.hidden = !0, this.yandexSubtitles = null;
							else {
								let m = this.subtitles.at(Number.parseInt(p));
								if (this.data.translateProxyEnabled === 2 && m.url.startsWith("https://brosubs.s3-private.mds.yandex.net/vtrans/")) {
									let p = m.url.replace("https://brosubs.s3-private.mds.yandex.net/vtrans/", "");
									m.url = `https://${this.data.proxyWorkerHost}/video-subtitles/subtitles-proxy/${p}`, console.log(`[VOT] Subs proxied via ${m.url}`);
								}
								this.yandexSubtitles = await we.I.fetchSubtitles(m), this.subtitlesWidget.setContent(this.yandexSubtitles, m.language), this.uiManager.votOverlayView.downloadSubtitlesButton.hidden = !1;
							}
						}
						async updateSubtitlesLangSelect() {
							if (!this.subtitles || this.subtitles.length === 0) {
								let p = [{
									label: ue.j.get("VOTSubtitlesDisabled"),
									value: "disabled",
									selected: !0,
									disabled: !1
								}];
								this.uiManager.votOverlayView.subtitlesSelect.updateItems(p), await this.changeSubtitlesLang(p[0].value);
								return;
							}
							let p = [{
								label: ue.j.get("VOTSubtitlesDisabled"),
								value: "disabled",
								selected: !0,
								disabled: !1
							}, ...this.subtitles.map((p, m) => ({
								label: (ue.j.get(`langs.${p.language}`) ?? p.language.toUpperCase()) + (p.translatedFromLanguage ? ` ${ue.j.get("VOTTranslatedFrom")} ${ue.j.get(`langs.${p.translatedFromLanguage}`) ?? p.translatedFromLanguage.toUpperCase()}` : "") + (p.source === "yandex" ? "" : `, ${window.location.hostname}`) + (p.isAutoGenerated ? ` (${ue.j.get("VOTAutogenerated")})` : ""),
								value: m,
								selected: !1,
								disabled: !1
							}))];
							this.uiManager.votOverlayView.subtitlesSelect.updateItems(p), await this.changeSubtitlesLang(p[0].value);
						}
						async loadSubtitles() {
							if (!this.videoData?.videoId) {
								console.warn(`[VOT] ${ue.j.getDefault("VOTNoVideoIDFound")}`), this.subtitles = [];
								return;
							}
							let p = `${this.videoData.videoId}_${this.videoData.detectedLanguage}_${this.videoData.responseLanguage}_${this.data.useLivelyVoice}`;
							try {
								let m = this.cacheManager.getSubtitles(p);
								m || (m = await we.I.getSubtitles(this.votClient, this.videoData), this.cacheManager.setSubtitles(p, m)), this.subtitles = m;
							} catch (p) {
								console.warn("[VOT] Failed to load subtitles:", p), this.subtitles = [];
							}
							await this.updateSubtitlesLangSelect();
						}
						isLivelyVoiceAllowed() {
							return !(this.videoData.detectedLanguage !== "en" || this.videoData.responseLanguage !== "ru" || !this.data.account?.token);
						}
						getVideoVolume() {
							return this.videoManager.getVideoVolume();
						}
						setVideoVolume(p) {
							return this.videoManager.setVideoVolume(p), this;
						}
						isMuted() {
							return this.videoManager.isMuted();
						}
						syncVideoVolumeSlider() {
							this.videoManager.syncVideoVolumeSlider();
						}
						setSelectMenuValues(p, m) {
							this.videoManager.setSelectMenuValues(p, m);
						}
						syncVolumeWrapper(p, m) {
							let g = p === "translation" ? this.uiManager.votOverlayView.videoVolumeSlider : this.uiManager.votOverlayView.translationVolumeSlider, _ = (0, nt.q)(p === "translation" ? this.video : this.audioPlayer.player, m, g.value, p === "translation" ? this.tempVolume : this.tempOriginalVolume);
							g.value = _, this.tempOriginalVolume = p === "translation" ? _ : m, this.tempVolume = p === "translation" ? m : _;
						}
						async getVideoData() {
							return await this.videoManager.getVideoData();
						}
						videoValidator() {
							return this.videoManager.videoValidator();
						}
						stopTranslate() {
							this.audioPlayer.player.removeVideoEvents(), this.audioPlayer.player.clear(), this.audioPlayer.player.src = void 0, Be.A.log("audioPlayer after stopTranslate", this.audioPlayer), this.uiManager.votOverlayView.videoVolumeSlider.hidden = !0, this.uiManager.votOverlayView.translationVolumeSlider.hidden = !0, this.uiManager.votOverlayView.downloadTranslationButton.hidden = !0, this.downloadTranslationUrl = null, this.longWaitingResCount = 0, this.transformBtn("none", ue.j.get("translateVideo")), Be.A.log(`Volume on start: ${this.volumeOnStart}`), this.volumeOnStart && this.setVideoVolume(this.volumeOnStart), clearInterval(this.streamPing), clearTimeout(this.autoRetry), this.hls?.destroy(), this.firstSyncVolume = !0, this.actionsAbortController = new AbortController();
						}
						async updateTranslationErrorMsg(p) {
							let m = ue.j.get("translationTake"), g = ue.j.lang;
							if (this.longWaitingResCount = p === ue.j.get("translationTakeAboutMinute") ? this.longWaitingResCount + 1 : 0, Be.A.log("longWaitingResCount", this.longWaitingResCount), this.longWaitingResCount > F.px && (p = new tt.n("TranslationDelayed")), Be.A.log("updateTranslationErrorMsg message", p), p?.name === "VOTLocalizedError") this.transformBtn("error", p.localizedMessage);
							else if (p instanceof Error) this.transformBtn("error", p?.message);
							else if (this.data.translateAPIErrors && g !== "ru" && !p?.includes(m)) {
								this.uiManager.votOverlayView.votButton.loading = !0;
								let m = await (0, Ke.Tl)(p, "ru", g);
								this.transformBtn("error", m);
							} else this.transformBtn("error", p);
							[
								"Подготавливаем перевод",
								"Видео передано в обработку",
								"Ожидаем перевод видео",
								"Загружаем переведенное аудио"
							].includes(p) && (this.uiManager.votOverlayView.votButton.loading = !0);
						}
						afterUpdateTranslation(p) {
							let m = this.uiManager.votOverlayView.votButton.container.dataset.status === "success";
							this.uiManager.votOverlayView.videoVolumeSlider.hidden = !this.data.showVideoSlider || !m, this.uiManager.votOverlayView.translationVolumeSlider.hidden = !m, this.data.enabledAutoVolume && (this.uiManager.votOverlayView.videoVolumeSlider.value = this.data.autoVolume), this.videoData.isStream || (this.uiManager.votOverlayView.downloadTranslationButton.hidden = !1, this.downloadTranslationUrl = p), Be.A.log("afterUpdateTranslation downloadTranslationUrl", this.downloadTranslationUrl), this.data.sendNotifyOnComplete && this.longWaitingResCount && m && chrome.runtime.sendMessage({
								type: "notification",
								text: ue.j.get("VOTTranslationCompletedNotify").replace("{0}", window.location.hostname),
								title: chrome.runtime.getManifest().name
							});
						}
						async validateAudioUrl(p) {
							try {
								let m = this.isMultiMethodS3(p) ? { method: "HEAD" } : { headers: { range: "bytes=0-0" } }, g = await (0, Ve.G3)(p, m);
								if (Be.A.log("Test audio response", g), g.ok) return Be.A.log("Valid audioUrl", p), p;
								Be.A.log("Yandex returned not valid audio, trying to fix..."), this.videoData.detectedLanguage = "auto";
								let _ = await this.translationHandler.translateVideoImpl(this.videoData, this.videoData.detectedLanguage, this.videoData.responseLanguage, this.videoData.translationHelp, !this.data.useAudioDownload, this.actionsAbortController.signal);
								this.setSelectMenuValues(this.videoData.detectedLanguage, this.videoData.responseLanguage), p = _.url, Be.A.log("Fixed audio audioUrl", p);
							} catch (p) {
								Be.A.log("Test audio error:", p);
							}
							return p;
						}
						proxifyAudio(p) {
							return this.data.translateProxyEnabled === 2 && p.startsWith("https://vtrans.s3-private.mds.yandex.net/tts/prod/") && (p = p.replace("https://vtrans.s3-private.mds.yandex.net/tts/prod/", `https://${this.data.proxyWorkerHost}/video-translation/audio-proxy/`), console.log(`[VOT] Audio proxied via ${p}`)), p;
						}
						isMultiMethodS3(p) {
							return p.startsWith("https://vtrans.s3-private.mds.yandex.net/tts/prod/") || p.startsWith(`https://${this.data.proxyWorkerHost}/video-translation/audio-proxy/`);
						}
						async updateTranslation(p) {
							p !== this.audioPlayer.player.currentSrc && (p = await this.validateAudioUrl(this.proxifyAudio(p))), this.audioPlayer.player.src !== p && (this.audioPlayer.player.src = p);
							try {
								this.audioPlayer.init();
							} catch (p) {
								Be.A.log("this.audioPlayer.init() error", p), this.transformBtn("error", p.message);
							}
							this.setupAudioSettings(), this.site.host === "twitter" && document.querySelector("button[data-testid=\"app-bar-back\"][role=\"button\"]").addEventListener("click", this.stopTranslation), this.transformBtn("success", ue.j.get("disableTranslate")), this.afterUpdateTranslation(p);
						}
						async translateFunc(p, m, g, _, x) {
							console.log("[VOT] Video Data: ", this.videoData), Be.A.log("Run videoValidator"), this.videoValidator(), this.uiManager.votOverlayView.votButton.loading = !0, this.volumeOnStart = this.getVideoVolume();
							let D = `${p}_${g}_${_}_${this.data.useLivelyVoice}`, O = this.cacheManager.getTranslation(D);
							if (O?.url) {
								await this.updateTranslation(O.url), Be.A.log("[translateFunc] Cached translation was received");
								return;
							}
							if (O?.error) {
								Be.A.log("Skip translation - previous attempt failed"), await this.updateTranslationErrorMsg(O.error.data?.message);
								return;
							}
							if (m) {
								let p = await this.translationHandler.translateStreamImpl(this.videoData, g, _, this.actionsAbortController.signal);
								if (!p) {
									Be.A.log("Skip translation");
									return;
								}
								this.transformBtn("success", ue.j.get("disableTranslate"));
								try {
									this.hls = (0, qe.CK)(), this.audioPlayer.init();
								} catch (p) {
									Be.A.log("this.audioPlayer.init() error", p), this.transformBtn("error", p.message);
								}
								let m = this.setHLSSource(p.result.url);
								return this.site.host === "youtube" && w.A.videoSeek(this.video, 10), this.setupAudioSettings(), !this.video.src && !this.video.currentSrc && !this.video.srcObject ? this.stopTranslation() : this.afterUpdateTranslation(m);
							}
							let A = await this.translationHandler.translateVideoImpl(this.videoData, g, _, x, !this.data.useAudioDownload, this.actionsAbortController.signal);
							if (Be.A.log("[translateRes]", A), !A) {
								Be.A.log("Skip translation");
								return;
							}
							await this.updateTranslation(A.url);
							let F = this.cacheManager.getSubtitles(D);
							F?.some((p) => p.source === "yandex" && p.translatedFromLanguage === this.videoData.detectedLanguage && p.language === this.videoData.responseLanguage) || (this.cacheManager.deleteSubtitles(D), this.subtitles = []), this.cacheManager.setTranslation(D, {
								videoId: p,
								from: g,
								to: _,
								url: this.downloadTranslationUrl,
								useLivelyVoice: this.data?.useLivelyVoice
							});
						}
						isYouTubeHosts() {
							return [
								"youtube",
								"invidious",
								"piped",
								"poketube",
								"ricktube"
							].includes(this.site.host);
						}
						setupHLS(p) {
							this.hls.on(rt.Events.MEDIA_ATTACHED, function() {
								Be.A.log("audio and hls.js are now bound together !");
							}), this.hls.on(rt.Events.MANIFEST_PARSED, function(p) {
								Be.A.log(`manifest loaded, found ${p?.levels?.length} quality level`);
							}), this.hls.loadSource(p), this.hls.attachMedia(this.audioPlayer.player.audio), this.hls.on(rt.Events.ERROR, function(p) {
								if (p.fatal) switch (p.type) {
									case rt.ErrorTypes.MEDIA_ERROR:
										console.log("fatal media error encountered, try to recover"), this.hls.recoverMediaError();
										break;
									case rt.ErrorTypes.NETWORK_ERROR:
										console.warn("fatal network error encountered", p);
										break;
									default:
										this.hls.destroy();
										break;
								}
							}), Be.A.log(this.hls);
						}
						setHLSSource(p) {
							let m = `https://${this.data.m3u8ProxyHost}/?all=yes&origin=${encodeURIComponent("https://strm.yandex.ru")}&referer=${encodeURIComponent("https://strm.yandex.ru")}&url=${encodeURIComponent(p)}`;
							if (this.hls) this.setupHLS(m);
							else if (this.audioPlayer.player.audio.canPlayType("application/vnd.apple.mpegurl")) this.audioPlayer.player.src = m;
							else throw new tt.n("audioFormatNotSupported");
							return m;
						}
						setupAudioSettings() {
							typeof this.data.defaultVolume == "number" && (this.audioPlayer.player.volume = this.data.defaultVolume / 100), this.data.enabledAutoVolume && this.setVideoVolume((this.data.autoVolume / 100).toFixed(2));
						}
						stopTranslation = () => {
							this.stopTranslate(), this.syncVideoVolumeSlider();
						};
						async handleSrcChanged() {
							Be.A.log("[VideoHandler] src changed", this), this.firstPlay = !0, this.stopTranslation();
							let p = !this.video.src && !this.video.currentSrc && !this.video.srcObject;
							this.uiManager.votOverlayView.votButton.container.hidden = p, p && (this.uiManager.votOverlayView.votMenu.hidden = p), this.site.selector || (this.container = this.video.parentElement), this.container.contains(this.uiManager.votOverlayView.votButton.container) || this.container.append(this.uiManager.votOverlayView.votButton.container, this.uiManager.votOverlayView.votMenu.container), this.videoData = await this.getVideoData();
							let m = `${this.videoData.videoId}_${this.videoData.detectedLanguage}_${this.videoData.responseLanguage}_${this.data.useLivelyVoice}`;
							this.subtitles = this.cacheManager.getSubtitles(m), await this.updateSubtitlesLangSelect(), this.translateToLang = this.data.responseLanguage ?? "ru", this.setSelectMenuValues(this.videoData.detectedLanguage, this.videoData.responseLanguage), this.actionsAbortController = new AbortController();
						}
						async release() {
							Be.A.log("[VideoHandler] release"), this.initialized = !1, this.releaseExtraEvents(), this.subtitlesWidget.release(), this.uiManager.release();
						}
						collectReportInfo() {
							let p = `${qe.R5.os.name} ${qe.R5.os.version}`, m = `<details>
<summary>Autogenerated by VOT:</summary>
<ul>
  <li>OS: ${p}</li>
  <li>Browser: ${qe.R5.browser.name} ${qe.R5.browser.version}</li>
  <li>Loader: Chrome Extension</li>
  <li>Script version: ${chrome.runtime.getManifest().version}</li>
  <li>URL: <code>${window.location.href}</code></li>
  <li>Lang: <code>${this.videoData.detectedLanguage}</code> -> <code>${this.videoData.responseLanguage}</code> (Lively voice: ${this.data.useLivelyVoice} | Audio download: ${this.data.useAudioDownload})</li>
  <li>Player: ${this.data.newAudioPlayer ? "New" : "Old"} (CSP only: ${this.data.onlyBypassMediaCSP})</li>
  <li>Proxying mode: ${this.data.translateProxyEnabled}</li>
</ul>
</details>`, g = `1-bug-report-${ue.j.lang === "ru" ? "ru" : "en"}.yml`;
							return {
								assignees: "ilyhalight",
								template: g,
								os: p,
								"script-version": chrome.runtime.getManifest().version,
								"additional-info": m
							};
						}
						releaseExtraEvents() {
							this.abortController.abort(), this.resizeObserver?.disconnect(), ["youtube", "googledrive"].includes(this.site.host) && this.site.additionalData !== "mobile" && this.syncVolumeObserver?.disconnect();
						}
					}
					let ot = new Ye.c(), st = new WeakMap();
					function climb(p, m) {
						if (!p || !m) return null;
						if (p instanceof Document) return p.querySelector(m);
						let g = p.closest(m);
						if (g) return g;
						let _ = p.getRootNode();
						return climb(_ instanceof ShadowRoot ? _.host : _, m);
					}
					function findContainer(p, m) {
						if (Be.A.log("findContainer", p, m), p.shadowRoot) {
							let g = climb(m, p.selector);
							return Be.A.log("findContainer with site.shadowRoot", g), g ?? m.parentElement;
						}
						if (Be.A.log("findContainer without shadowRoot"), !p.selector) return m.parentElement;
						let g = document.querySelectorAll(p.selector);
						return Array.from(g).find((p) => p.contains(m)) ?? m.parentElement;
					}
					function initIframeInteractor() {
						let p = { "https://dev.epicgames.com": {
							targetOrigin: "https://dev.epicgames.com",
							dataFilter: (p) => typeof p == "string" && p.startsWith("getVideoId:"),
							extractVideoId: (p) => p.pathname.split("/").slice(-2, -1)[0],
							iframeSelector: (p) => `electra-player > iframe[src="${p}"]`,
							responseFormatter: (p, m) => `${m}:${p}`,
							processRequest: (p) => {
								let m = p.replace("getVideoId:", "");
								return atob(m);
							}
						} }, m = Object.entries(p).find(([p]) => window.location.origin === p && (p !== "https://dev.epicgames.com" || window.location.pathname.includes("/community/learning/")))?.[1];
						m && window.addEventListener("message", (p) => {
							try {
								if (p.origin !== m.targetOrigin || !m.dataFilter(p.data)) return;
								let g = new URL(window.location.href), _ = m.extractVideoId(g);
								if (!_) return;
								let x = m.processRequest?.(p.data) || g.href, w = typeof m.iframeSelector == "function" ? m.iframeSelector(x) : m.iframeSelector, D = document.querySelector(w);
								if (!D?.contentWindow) return;
								let O = m.responseFormatter(_, p.data);
								D.contentWindow.postMessage(O, m.targetOrigin);
							} catch (p) {
								console.warn("Iframe communication error:", p);
							}
						});
					}
					async function main() {
						if (console.log("[VOT] Loading extension..."), (0, Ue.d4)() && window.location.hash.includes(Ue.WF)) return (0, A.q)();
						if (window.location.origin === F.xW) return await (0, U.L)();
						let { votEnabled: p } = await chrome.storage.local.get("votEnabled");
						if (p === !1) {
							Be.A.log("[VOT] Extension is disabled, skipping initialization"), chrome.runtime.onMessage.addListener((p) => {
								p.type === "vot_toggle" && p.enabled && window.location.reload();
							});
							return;
						}
						chrome.runtime.onMessage.addListener((p) => {
							if (p.type === "vot_toggle" && !p.enabled) {
								for (let [, p] of st) p.stopTranslation(), p.release();
								st.clear(), ot.disable(), window.location.reload();
							}
						}), await ue.j.update(), Be.A.log(`Selected menu language: ${ue.j.lang}`), initIframeInteractor(), ot.onVideoAdded.addListener(async (p) => {
							if (st.has(p)) return;
							let m, g = (0, D.cQ)().find((g) => (m = findContainer(g, p), !!m));
							if (g) {
								["peertube", "directlink"].includes(g.host) && (g.url = window.location.origin);
								try {
									let _ = new VideoHandler(p, m, g);
									_.videoData = await _.getVideoData(), await _.init(), st.set(p, _);
								} catch (p) {
									console.warn("[VOT] Failed to initialize videoHandler", p);
								}
							}
						}), ot.onVideoRemoved.addListener(async (p) => {
							st.has(p) && (await st.get(p).release(), st.delete(p));
						}), ot.enable();
					}
					main().catch((p) => {
						console.warn("[VOT]", p);
					}), _();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/localization/locales/en.json": (p) => {
			"use strict";
			p.exports = JSON.parse("{\"recommended\":\"recommended\",\"translateVideo\":\"Translate video\",\"disableTranslate\":\"Turn off\",\"translationSettings\":\"Translation settings\",\"subtitlesSettings\":\"Subtitles settings\",\"resetSettings\":\"Reset settings\",\"videoBeingTranslated\":\"The video is being translated\",\"videoLanguage\":\"Video language\",\"translationLanguage\":\"Translation language\",\"translationTake\":\"The translation will take\",\"translationTakeMoreThanHour\":\"The translation will take more than an hour\",\"translationTakeAboutMinute\":\"The translation will take about a minute\",\"translationTakeFewMinutes\":\"The translation will take a few minutes\",\"translationTakeApproximatelyMinutes\":\"The translation will take approximately {0} minutes\",\"translationTakeApproximatelyMinute\":\"The translation will take approximately {0} minutes\",\"requestTranslationFailed\":\"Failed to request video translation\",\"audioNotReceived\":\"Audio link not received\",\"audioFormatNotSupported\":\"The audio format is not supported\",\"VOTAutoTranslate\":\"Translate on open\",\"VOTDontTranslateYourLang\":\"Don't translate from my language\",\"VOTVolume\":\"Video volume:\",\"VOTVolumeTranslation\":\"Translation volume:\",\"VOTAutoSetVolume\":\"Reduce video volume to\",\"VOTShowVideoSlider\":\"Video volume slider\",\"VOTSyncVolume\":\"Link translation and video volume\",\"VOTDisableFromYourLang\":\"You have disabled the translation of the video in your language\",\"VOTVideoIsTooLong\":\"Video is too long\",\"VOTNoVideoIDFound\":\"No video ID found\",\"VOTSubtitles\":\"Subtitles\",\"VOTSubtitlesDisabled\":\"Disabled\",\"VOTSubtitlesMaxLength\":\"Subtitles max length\",\"VOTHighlightWords\":\"Highlight words\",\"VOTTranslatedFrom\":\"translated from\",\"VOTAutogenerated\":\"autogenerated\",\"VOTSettings\":\"VOT Settings\",\"VOTMenuLanguage\":\"Menu language\",\"VOTAuthors\":\"Authors\",\"VOTVersion\":\"Version\",\"VOTLoader\":\"Loader\",\"VOTBrowser\":\"Browser\",\"VOTShowPiPButton\":\"Show PiP button\",\"langs\":{\"auto\":\"Auto\",\"af\":\"Afrikaans\",\"ak\":\"Akan\",\"sq\":\"Albanian\",\"am\":\"Amharic\",\"ar\":\"Arabic\",\"hy\":\"Armenian\",\"as\":\"Assamese\",\"ay\":\"Aymara\",\"az\":\"Azerbaijani\",\"bn\":\"Bangla\",\"eu\":\"Basque\",\"be\":\"Belarusian\",\"bho\":\"Bhojpuri\",\"bs\":\"Bosnian\",\"bg\":\"Bulgarian\",\"my\":\"Burmese\",\"ca\":\"Catalan\",\"ceb\":\"Cebuano\",\"zh\":\"Chinese\",\"zh-Hans\":\"Chinese (Simplified)\",\"zh-Hant\":\"Chinese (Traditional)\",\"co\":\"Corsican\",\"hr\":\"Croatian\",\"cs\":\"Czech\",\"da\":\"Danish\",\"dv\":\"Divehi\",\"nl\":\"Dutch\",\"en\":\"English\",\"eo\":\"Esperanto\",\"et\":\"Estonian\",\"ee\":\"Ewe\",\"fil\":\"Filipino\",\"fi\":\"Finnish\",\"fr\":\"French\",\"gl\":\"Galician\",\"lg\":\"Ganda\",\"ka\":\"Georgian\",\"de\":\"German\",\"el\":\"Greek\",\"gn\":\"Guarani\",\"gu\":\"Gujarati\",\"ht\":\"Haitian Creole\",\"ha\":\"Hausa\",\"haw\":\"Hawaiian\",\"iw\":\"Hebrew\",\"hi\":\"Hindi\",\"hmn\":\"Hmong\",\"hu\":\"Hungarian\",\"is\":\"Icelandic\",\"ig\":\"Igbo\",\"id\":\"Indonesian\",\"ga\":\"Irish\",\"it\":\"Italian\",\"ja\":\"Japanese\",\"jv\":\"Javanese\",\"kn\":\"Kannada\",\"kk\":\"Kazakh\",\"km\":\"Khmer\",\"rw\":\"Kinyarwanda\",\"ko\":\"Korean\",\"kri\":\"Krio\",\"ku\":\"Kurdish\",\"ky\":\"Kyrgyz\",\"lo\":\"Lao\",\"la\":\"Latin\",\"lv\":\"Latvian\",\"ln\":\"Lingala\",\"lt\":\"Lithuanian\",\"lb\":\"Luxembourgish\",\"mk\":\"Macedonian\",\"mg\":\"Malagasy\",\"ms\":\"Malay\",\"ml\":\"Malayalam\",\"mt\":\"Maltese\",\"mi\":\"Māori\",\"mr\":\"Marathi\",\"mn\":\"Mongolian\",\"ne\":\"Nepali\",\"nso\":\"Northern Sotho\",\"no\":\"Norwegian\",\"ny\":\"Nyanja\",\"or\":\"Odia\",\"om\":\"Oromo\",\"ps\":\"Pashto\",\"fa\":\"Persian\",\"pl\":\"Polish\",\"pt\":\"Portuguese\",\"pa\":\"Punjabi\",\"qu\":\"Quechua\",\"ro\":\"Romanian\",\"ru\":\"Russian\",\"sm\":\"Samoan\",\"sa\":\"Sanskrit\",\"gd\":\"Scottish Gaelic\",\"sr\":\"Serbian\",\"sn\":\"Shona\",\"sd\":\"Sindhi\",\"si\":\"Sinhala\",\"sk\":\"Slovak\",\"sl\":\"Slovenian\",\"so\":\"Somali\",\"st\":\"Southern Sotho\",\"es\":\"Spanish\",\"su\":\"Sundanese\",\"sw\":\"Swahili\",\"sv\":\"Swedish\",\"tg\":\"Tajik\",\"ta\":\"Tamil\",\"tt\":\"Tatar\",\"te\":\"Telugu\",\"th\":\"Thai\",\"ti\":\"Tigrinya\",\"ts\":\"Tsonga\",\"tr\":\"Turkish\",\"tk\":\"Turkmen\",\"uk\":\"Ukrainian\",\"ur\":\"Urdu\",\"ug\":\"Uyghur\",\"uz\":\"Uzbek\",\"vi\":\"Vietnamese\",\"cy\":\"Welsh\",\"fy\":\"Western Frisian\",\"xh\":\"Xhosa\",\"yi\":\"Yiddish\",\"yo\":\"Yoruba\",\"zu\":\"Zulu\"},\"streamNoConnectionToServer\":\"There is no connection to the server\",\"searchField\":\"Search...\",\"VOTTranslateAPIErrors\":\"Translate errors from the API\",\"VOTDetectService\":\"Language detection service\",\"VOTProxyWorkerHost\":\"Enter the proxy worker address\",\"VOTM3u8ProxyHost\":\"Enter the address of the m3u8 proxy worker\",\"proxySettings\":\"Proxy Settings\",\"translationTakeApproximatelyMinute2\":\"The translation will take approximately {0} minutes\",\"VOTAudioBooster\":\"Extended translation volume increase\",\"VOTSubtitlesDesign\":\"Subtitles design\",\"VOTSubtitlesFontSize\":\"Font size of subtitles\",\"VOTSubtitlesOpacity\":\"Transparency of the subtitle background\",\"VOTSubtitlesDownloadFormat\":\"The format for downloading subtitles\",\"VOTDownloadWithName\":\"Download files with the video name\",\"VOTUpdateLocaleFiles\":\"Update localization files\",\"VOTLocaleHash\":\"Locale hash\",\"VOTUpdatedAt\":\"Updated at\",\"VOTNeedWebAudioAPI\":\"To enable this, you must have a Web Audio API\",\"VOTMediaCSPEnabledOnSite\":\"Media CSP is enabled on this site\",\"VOTOnlyBypassMediaCSP\":\"Use it only for bypassing Media CSP\",\"VOTNewAudioPlayer\":\"Use the new audio player\",\"VOTUseNewModel\":\"Use an experimental variation of Yandex voices for some videos\",\"TranslationDelayed\":\"The translation is slightly delayed\",\"VOTTranslationCompletedNotify\":\"The translation on the {0} has been completed!\",\"VOTSendNotifyOnComplete\":\"Send a notification that the video has been translated\",\"VOTBugReport\":\"Report a bug\",\"VOTTranslateProxyDisabled\":\"Disabled\",\"VOTTranslateProxyEnabled\":\"Enabled\",\"VOTTranslateProxyEverything\":\"Proxy everything\",\"VOTTranslateProxyStatus\":\"Proxying mode\",\"VOTTranslatedBy\":\"Translated by {0}\",\"VOTStreamNotAvailable\":\"Translate stream isn't available\",\"VOTTranslationTextService\":\"Text translation service\",\"VOTNotAffectToVoice\":\"Doesn't affect the translation of text in voice over\",\"DontTranslateSelectedLanguages\":\"Don't translate from selected languages\",\"showVideoVolumeSlider\":\"Display the video volume slider\",\"hotkeysSettings\":\"Hotkeys settings\",\"None\":\"None\",\"VOTUseLivelyVoice\":\"Use lively voices. Speakers sound like native Russians.\",\"miscSettings\":\"Misc settings\",\"services\":{\"yandexbrowser\":\"Yandex Browser\",\"msedge\":\"Microsoft Edge\",\"rust-server\":\"Rust Server\"},\"aboutExtension\":\"About extension\",\"appearance\":\"Appearance\",\"buttonPositionInWidePlayer\":\"Button position in wide player\",\"position\":{\"left\":\"Left\",\"right\":\"Right\",\"top\":\"Top\",\"default\":\"Default\"},\"secs\":\"secs\",\"autoHideButtonDelay\":\"Delay before hiding the translate button\",\"notFound\":\"not found\",\"minButtonPositionContainer\":\"The button position only changes in players larger than 600 pixels.\",\"VOTTranslateProxyStatusDefault\":\"Completely disabling proxying in your country may break the extension\",\"PressTheKeyCombination\":\"Press the key combination...\",\"VOTUseAudioDownload\":\"Use audio download\",\"VOTUseAudioDownloadWarning\":\"Disabling audio downloads may affect the functionality of the extension\",\"VOTAccountRequired\":\"You need to log in to use this feature\",\"VOTMyAccount\":\"My account\",\"VOTLogin\":\"Login\",\"VOTLogout\":\"Logout\",\"VOTRefresh\":\"Refresh\",\"VOTYandexToken\":\"Enter the Yandex OAuth Token\",\"VOTYandexTokenInfo\":\"You can manually set the account token in this field. Please note that we don't check its validity before sending a translate request\",\"VOTLoginViaToken\":\"Login via token\"}");
		},
		"./src/localization/localizationProvider.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { j: () => oe });
					var x = g("./src/localization/locales/en.json"), w = g("./src/config/config.js"), D = g("./src/utils/debug.ts"), O = g("./src/utils/gm.ts"), A = g("./src/utils/localization.ts"), F = g("./src/utils/storage.ts"), U = g("./src/utils/utils.ts"), K = p([
						O,
						A,
						F,
						U
					]);
					[O, A, F, U] = K.then ? (await K)() : K;
					class LocalizationProvider {
						storageKeys = [
							"localePhrases",
							"localeLang",
							"localeHash",
							"localeUpdatedAt",
							"localeLangOverride"
						];
						lang;
						locale;
						defaultLocale = (0, U.GW)(x);
						cacheTTL = 7200;
						localizationUrl = `${w.hx}/master/src/localization`;
						_langOverride = "auto";
						constructor() {
							this.lang = this.getLang(), this.locale = {};
						}
						async init() {
							this._langOverride = await F.d.get("localeLangOverride", "auto"), this.lang = this.getLang();
							let p = await F.d.get("localePhrases", "");
							return this.setLocaleFromJsonString(p), this;
						}
						get langOverride() {
							return this._langOverride;
						}
						getLang() {
							return this.langOverride === "auto" ? A.v : this.langOverride;
						}
						getAvailableLangs() {
							return "auto.en.ru.af.am.ar.az.bg.bn.bs.ca.cs.cy.da.de.el.es.et.eu.fa.fi.fr.gl.hi.hr.hu.hy.id.it.ja.jv.kk.km.kn.ko.lo.mk.ml.mn.ms.mt.my.ne.nl.pa.pl.pt.ro.si.sk.sl.sq.sr.su.sv.sw.tr.uk.ur.uz.vi.zh.zu".split(".");
						}
						async reset() {
							for (let p of this.storageKeys) await F.d.delete(p);
							return this;
						}
						buildUrl(p, m = !1) {
							let g = m ? `?timestamp=${(0, U.lg)()}` : "";
							return `${this.localizationUrl}${p}${g}`;
						}
						async changeLang(p) {
							let m = this.langOverride;
							return m === p ? !1 : (await F.d.set("localeLangOverride", p), this._langOverride = p, this.lang = this.getLang(), await this.update(!0), !0);
						}
						async checkUpdates(p = !1) {
							D.A.log("Check locale updates...");
							try {
								let m = await (0, O.G3)(this.buildUrl("/hashes.json", p));
								if (!m.ok) throw m.status;
								let g = await m.json();
								return await F.d.get("localeHash") === g[this.lang] ? !1 : g[this.lang];
							} catch (p) {
								return console.warn("[VOT] [localizationProvider] Failed to get locales hash:", p), !1;
							}
						}
						async update(p = !1) {
							let m = await F.d.get("localeUpdatedAt", 0);
							if (!p && m + this.cacheTTL > (0, U.lg)() && await F.d.get("localeLang") === this.lang) return this;
							let g = await this.checkUpdates(p);
							if (await F.d.set("localeUpdatedAt", (0, U.lg)()), !g) return this;
							D.A.log("Updating locale...");
							try {
								let m = await (0, O.G3)(this.buildUrl(`/locales/${this.lang}.json`, p));
								if (!m.ok) throw m.status;
								let _ = await m.text();
								await F.d.set("localePhrases", _), await F.d.set("localeHash", g), await F.d.set("localeLang", this.lang), this.setLocaleFromJsonString(_);
							} catch (p) {
								console.warn("[VOT] [localizationProvider] Failed to get locale:", p), this.setLocaleFromJsonString(await F.d.get("localePhrases", ""));
							}
							return this;
						}
						setLocaleFromJsonString(p) {
							try {
								let m = JSON.parse(p) || {};
								this.locale = (0, U.GW)(m);
							} catch (p) {
								console.warn("[VOT] [localizationProvider]", p), this.locale = {};
							}
							return this;
						}
						getFromLocale(p, m) {
							return p?.[m] ?? this.warnMissingKey(p, m);
						}
						warnMissingKey(p, m) {
							console.warn("[VOT] [localizationProvider] locale", p, "doesn't contain key", m);
						}
						getDefault(p) {
							return this.getFromLocale(this.defaultLocale, p) ?? p;
						}
						get(p) {
							return this.getFromLocale(this.locale, p) ?? this.getDefault(p);
						}
					}
					let oe = new LocalizationProvider();
					await oe.init(), _();
				} catch (p) {
					_(p);
				}
			}, 1);
		},
		"./src/styles/main.scss": () => {
			GM_addStyle(".vot-button{--vot-helper-theme:var(--vot-theme-rgb,var(--vot-primary-rgb,33,150,243));--vot-helper-ontheme:var(--vot-ontheme-rgb,var(--vot-onprimary-rgb,255,255,255));box-sizing:border-box;vertical-align:middle;text-align:center;text-overflow:ellipsis;min-width:64px;height:36px;color:rgb(var(--vot-helper-ontheme));background-color:rgb(var(--vot-helper-theme));font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:pointer;outline:none;font-size:14px;font-weight:500;line-height:36px;transition:box-shadow .2s;display:inline-block;position:relative;box-shadow:0 3px 1px -2px #0003,0 2px 2px #00000024,0 1px 5px #0000001f;border:none!important;border-radius:4px!important;padding:0 16px!important}.vot-button[hidden]{display:none!important}.vot-button::-moz-focus-inner{border:none!important}.vot-button:before,.vot-button:after{content:\"\";opacity:0;position:absolute;top:0;bottom:0;left:0;right:0;border-radius:inherit!important}.vot-button:before{background-color:rgb(var(--vot-helper-ontheme));transition:opacity .2s}.vot-button:after{background:radial-gradient(circle,currentColor 1%,#0000 1%) 50%/10000% 10000% no-repeat;transition:opacity 1s,background-size .5s}.vot-button:hover{box-shadow:0 2px 4px -1px #0003,0 4px 5px #00000024,0 1px 10px #0000001f}.vot-button:hover:before{opacity:.08}.vot-button:active{box-shadow:0 5px 5px -3px #0003,0 8px 10px 1px #00000024,0 3px 14px 2px #0000001f}.vot-button:active:after{opacity:.32;background-size:100% 100%;transition:background-size}.vot-button[disabled=true]{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.12);color:rgba(var(--vot-onsurface-rgb,0,0,0),.38);box-shadow:none;cursor:initial}.vot-button[disabled=true]:before,.vot-button[disabled=true]:after{opacity:0}.vot-outlined-button{--vot-helper-theme:var(--vot-theme-rgb,var(--vot-primary-rgb,33,150,243));box-sizing:border-box;vertical-align:middle;text-align:center;text-overflow:ellipsis;min-width:64px;height:36px;color:rgb(var(--vot-helper-theme));font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:pointer;background-color:#0000;outline:none;font-size:14px;font-weight:500;line-height:34px;display:inline-block;position:relative;border:solid 1px rgba(var(--vot-onsurface-rgb,0,0,0),.24)!important;border-radius:4px!important;margin:0!important;padding:0 16px!important}.vot-outlined-button[hidden]{display:none!important}.vot-outlined-button::-moz-focus-inner{border:none!important}.vot-outlined-button:before,.vot-outlined-button:after{content:\"\";opacity:0;position:absolute;top:0;bottom:0;left:0;right:0;border-radius:3px!important}.vot-outlined-button:before{background-color:rgb(var(--vot-helper-theme));transition:opacity .2s}.vot-outlined-button:after{background:radial-gradient(circle,currentColor 1%,#0000 1%) 50%/10000% 10000% no-repeat;transition:opacity 1s,background-size .5s}.vot-outlined-button:hover:before{opacity:.04}.vot-outlined-button:active:after{opacity:.16;background-size:100% 100%;transition:background-size}.vot-outlined-button[disabled=true]{color:rgba(var(--vot-onsurface-rgb,0,0,0),.38);cursor:initial;background-color:#0000}.vot-outlined-button[disabled=true]:before,.vot-outlined-button[disabled=true]:after{opacity:0}.vot-text-button{--vot-helper-theme:var(--vot-theme-rgb,var(--vot-primary-rgb,33,150,243));box-sizing:border-box;vertical-align:middle;text-align:center;text-overflow:ellipsis;min-width:64px;height:36px;color:rgb(var(--vot-helper-theme));font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:pointer;background-color:#0000;outline:none;font-size:14px;font-weight:500;line-height:36px;display:inline-block;position:relative;border:none!important;border-radius:4px!important;margin:0!important;padding:0 8px!important}.vot-text-button[hidden]{display:none!important}.vot-text-button::-moz-focus-inner{border:none!important}.vot-text-button:before,.vot-text-button:after{content:\"\";opacity:0;position:absolute;top:0;bottom:0;left:0;right:0;border-radius:inherit!important}.vot-text-button:before{background-color:rgb(var(--vot-helper-theme));transition:opacity .2s}.vot-text-button:after{background:radial-gradient(circle,currentColor 1%,#0000 1%) 50%/10000% 10000% no-repeat;transition:opacity 1s,background-size .5s}.vot-text-button:hover:before{opacity:.04}.vot-text-button:active:after{opacity:.16;background-size:100% 100%;transition:background-size}.vot-text-button[disabled=true]{color:rgba(var(--vot-onsurface-rgb,0,0,0),.38);cursor:initial;background-color:#0000}.vot-text-button[disabled=true]:before,.vot-text-button[disabled=true]:after{opacity:0}.vot-icon-button{--vot-helper-onsurface:rgba(var(--vot-onsurface-rgb,0,0,0),.87);box-sizing:border-box;vertical-align:middle;text-align:center;text-overflow:ellipsis;width:36px;height:36px;fill:var(--vot-helper-onsurface);color:var(--vot-helper-onsurface);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:pointer;background-color:#0000;outline:none;font-size:14px;font-weight:500;line-height:36px;display:inline-block;position:relative;border:none!important;border-radius:50%!important;margin:0!important;padding:0!important}.vot-icon-button[hidden]{display:none!important}.vot-icon-button::-moz-focus-inner{border:none!important}.vot-icon-button:before,.vot-icon-button:after{content:\"\";opacity:0;position:absolute;top:0;bottom:0;left:0;right:0;border-radius:inherit!important}.vot-icon-button:before{background-color:var(--vot-helper-onsurface);transition:opacity .2s}.vot-icon-button:after{background:radial-gradient(circle,currentColor 1%,#0000 1%) 50%/10000% 10000% no-repeat;transition:opacity .3s,background-size .4s}.vot-icon-button:hover:before{opacity:.04}.vot-icon-button:active:after{opacity:.32;background-size:100% 100%;transition:background-size,opacity}.vot-icon-button[disabled=true]{color:rgba(var(--vot-onsurface-rgb,0,0,0),.38);fill:rgba(var(--vot-onsurface-rgb,0,0,0),.38);cursor:initial;background-color:#0000}.vot-icon-button[disabled=true]:before,.vot-icon-button[disabled=true]:after{opacity:0}.vot-icon-button svg{fill:inherit;stroke:inherit;width:24px;height:36px}.vot-hotkey{justify-content:space-between;align-items:start;display:flex}.vot-hotkey-label{word-break:break-word;max-width:80%}.vot-hotkey-button{--vot-helper-surface:rgba(var(--vot-onsurface-rgb),.2);--vot-helper-theme:var(--vot-theme-rgb,var(--vot-primary-rgb,33,150,243));box-sizing:border-box;vertical-align:middle;text-align:center;width:fit-content;min-width:32px;height:fit-content;font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:pointer;background-color:#0000;outline:none;font-size:15px;line-height:1.5;display:inline-block;position:relative;border:solid 1px rgba(var(--vot-onsurface-rgb,0,0,0),.24)!important;border-radius:4px!important;margin:0!important;padding:0 8px!important}.vot-hotkey-button[hidden]{display:none!important}.vot-hotkey-button::-moz-focus-inner{border:none!important}.vot-hotkey-button:before,.vot-hotkey-button:after{content:\"\";opacity:0;position:absolute;top:0;bottom:0;left:0;right:0;border-radius:3px!important}.vot-hotkey-button:before{background-color:rgb(var(--vot-helper-theme));transition:opacity .2s}.vot-hotkey-button:after{background:radial-gradient(circle,currentColor 1%,#0000 1%) 50%/10000% 10000% no-repeat;transition:opacity 1s,background-size .5s}.vot-hotkey-button:hover:before{opacity:.04}.vot-hotkey-button:active:after{opacity:.16;background-size:100% 100%;transition:background-size}.vot-hotkey-button[data-status=active]{color:rgb(var(--vot-helper-theme))}.vot-hotkey-button[data-status=active]:before{opacity:.04}.vot-hotkey-button[disabled=true]{color:rgba(var(--vot-onsurface-rgb,0,0,0),.38);cursor:initial;background-color:#0000}.vot-hotkey-button[disabled=true]:before,.vot-hotkey-button[disabled=true]:after{opacity:0}.vot-textfield{display:inline-block;--vot-helper-theme:rgb(var(--vot-theme-rgb,var(--vot-primary-rgb,33,150,243)))!important;--vot-helper-safari1:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important;--vot-helper-safari2:rgba(var(--vot-onsurface-rgb,0,0,0),.6)!important;--vot-helper-safari3:rgba(var(--vot-onsurface-rgb,0,0,0),.87)!important;font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif)!important;text-align:start!important;padding-top:6px!important;font-size:16px!important;line-height:1.5!important;position:relative!important}.vot-textfield[hidden]{display:none!important}.vot-textfield>input,.vot-textfield>textarea{box-sizing:border-box!important;border-style:solid!important;border-width:1px!important;border-color:transparent var(--vot-helper-safari2)var(--vot-helper-safari2)!important;width:100%!important;height:inherit!important;color:rgba(var(--vot-onsurface-rgb,0,0,0),.87)!important;-webkit-text-fill-color:currentColor!important;font-family:inherit!important;font-size:inherit!important;line-height:inherit!important;caret-color:var(--vot-helper-theme)!important;background-color:#0000!important;border-radius:4px!important;margin:0!important;padding:15px 13px!important;transition:border .2s,box-shadow .2s!important;box-shadow:inset 1px 0 #0000,inset -1px 0 #0000,inset 0 -1px #0000!important}.vot-textfield>input:not(:focus):not(.vot-show-placeholer)::-moz-placeholder{color:#0000!important}.vot-textfield>textarea:not(:focus):not(.vot-show-placeholer)::-moz-placeholder{color:#0000!important}.vot-textfield>input:not(:focus):not(.vot-show-placeholer)::-moz-placeholder{color:#0000!important}.vot-textfield>textarea:not(:focus):not(.vot-show-placeholer)::-moz-placeholder{color:#0000!important}.vot-textfield>input:not(:focus):not(.vot-show-placeholer)::-webkit-input-placeholder{color:#0000!important}.vot-textfield>textarea:not(:focus):not(.vot-show-placeholer)::-webkit-input-placeholder{color:#0000!important}.vot-textfield>input:not(:focus):placeholder-shown,.vot-textfield>textarea:not(:focus):placeholder-shown{border-top-color:var(--vot-helper-safari2)!important}.vot-textfield>input+span,.vot-textfield>textarea+span{font-family:inherit;width:100%!important;max-height:100%!important;color:rgba(var(--vot-onsurface-rgb,0,0,0),.6)!important;cursor:text!important;pointer-events:none!important;font-size:75%!important;line-height:15px!important;transition:color .2s,font-size .2s,line-height .2s!important;display:flex!important;position:absolute!important;top:0!important;left:0!important}.vot-textfield>input:not(:focus):placeholder-shown+span,.vot-textfield>textarea:not(:focus):placeholder-shown+span{font-size:inherit!important;line-height:68px!important}.vot-textfield>input+span:before,.vot-textfield>input+span:after,.vot-textfield>textarea+span:before,.vot-textfield>textarea+span:after{content:\"\"!important;box-sizing:border-box!important;border-top:solid 1px var(--vot-helper-safari2)!important;pointer-events:none!important;min-width:10px!important;height:8px!important;margin-top:6px!important;transition:border .2s,box-shadow .2s!important;display:block!important;box-shadow:inset 0 1px #0000!important}.vot-textfield>input+span:before,.vot-textfield>textarea+span:before{border-left:1px solid #0000!important;border-radius:4px 0!important;margin-right:4px!important}.vot-textfield>input+span:after,.vot-textfield>textarea+span:after{border-right:1px solid #0000!important;border-radius:0 4px!important;flex-grow:1!important;margin-left:4px!important}.vot-textfield>input.vot-show-placeholer+span:before,.vot-textfield>textarea.vot-show-placeholer+span:before{margin-right:0!important}.vot-textfield>input.vot-show-placeholer+span:after,.vot-textfield>textarea.vot-show-placeholer+span:after{margin-left:0!important}.vot-textfield>input:not(:focus):placeholder-shown+span:before,.vot-textfield>input:not(:focus):placeholder-shown+span:after,.vot-textfield>textarea:not(:focus):placeholder-shown+span:before,.vot-textfield>textarea:not(:focus):placeholder-shown+span:after{border-top-color:#0000!important}.vot-textfield:hover>input:not(:disabled),.vot-textfield:hover>textarea:not(:disabled){border-color:transparent var(--vot-helper-safari3)var(--vot-helper-safari3)!important}.vot-textfield:hover>input:not(:disabled)+span:before,.vot-textfield:hover>input:not(:disabled)+span:after,.vot-textfield:hover>textarea:not(:disabled)+span:before,.vot-textfield:hover>textarea:not(:disabled)+span:after{border-top-color:var(--vot-helper-safari3)!important}.vot-textfield:hover>input:not(:disabled):not(:focus):placeholder-shown,.vot-textfield:hover>textarea:not(:disabled):not(:focus):placeholder-shown{border-color:var(--vot-helper-safari3)!important}.vot-textfield>input:focus,.vot-textfield>textarea:focus{border-color:transparent var(--vot-helper-theme)var(--vot-helper-theme)!important;box-shadow:inset 1px 0 var(--vot-helper-theme),inset -1px 0 var(--vot-helper-theme),inset 0 -1px var(--vot-helper-theme)!important;outline:none!important}.vot-textfield>input:focus+span,.vot-textfield>textarea:focus+span{color:var(--vot-helper-theme)!important}.vot-textfield>input:focus+span:before,.vot-textfield>input:focus+span:after,.vot-textfield>textarea:focus+span:before,.vot-textfield>textarea:focus+span:after{border-top-color:var(--vot-helper-theme)!important;box-shadow:inset 0 1px var(--vot-helper-theme)!important}.vot-textfield>input:disabled,.vot-textfield>input:disabled+span,.vot-textfield>textarea:disabled,.vot-textfield>textarea:disabled+span{border-color:transparent var(--vot-helper-safari1)var(--vot-helper-safari1)!important;color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important;pointer-events:none!important}.vot-textfield>input:disabled+span:before,.vot-textfield>input:disabled+span:after,.vot-textfield>textarea:disabled+span:before,.vot-textfield>textarea:disabled+span:after,.vot-textfield>input:disabled:placeholder-shown,.vot-textfield>input:disabled:placeholder-shown+span,.vot-textfield>textarea:disabled:placeholder-shown,.vot-textfield>textarea:disabled:placeholder-shown+span{border-top-color:var(--vot-helper-safari1)!important}.vot-textfield>input:disabled:placeholder-shown+span:before,.vot-textfield>input:disabled:placeholder-shown+span:after,.vot-textfield>textarea:disabled:placeholder-shown+span:before,.vot-textfield>textarea:disabled:placeholder-shown+span:after{border-top-color:#0000!important}@media not all and (-webkit-min-device-pixel-ratio:.0000264583),not all and (min-resolution:.001dpcm){@supports ((-webkit-appearance:none)){.vot-textfield>input,.vot-textfield>input+span,.vot-textfield>textarea,.vot-textfield>textarea+span,.vot-textfield>input+span:before,.vot-textfield>input+span:after,.vot-textfield>textarea+span:before,.vot-textfield>textarea+span:after{transition-duration:.1s!important}}}.vot-checkbox{--vot-helper-theme:var(--vot-theme-rgb,var(--vot-primary-rgb,33,150,243));--vot-helper-ontheme:var(--vot-ontheme-rgb,var(--vot-onprimary-rgb,255,255,255));z-index:0;color:rgba(var(--vot-onsurface-rgb,0,0,0),.87);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);text-align:start;font-size:16px;line-height:1.5;display:inline-block;position:relative}.vot-checkbox-sub{padding-left:28px!important}.vot-checkbox[hidden]{display:none!important}.vot-checkbox>input{-webkit-appearance:none;appearance:none;z-index:10000;box-sizing:border-box;opacity:1;cursor:pointer;background:0 0;outline:none;width:18px;height:18px;transition:border-color .2s,background-color .2s;display:block;position:absolute;border:2px solid!important;border-color:rgba(var(--vot-onsurface-rgb,0,0,0),.6)!important;border-radius:2px!important;margin:3px 1px!important;padding:0!important}.vot-checkbox>input+span{box-sizing:border-box;width:inherit;cursor:pointer;font-family:inherit;font-weight:400;display:inline-block;position:relative;padding-left:30px!important}.vot-checkbox>input+span:before{content:\"\";background-color:rgb(var(--vot-onsurface-rgb,0,0,0));opacity:0;pointer-events:none;width:40px;height:40px;transition:opacity .3s,transform .2s;display:block;position:absolute;top:-8px;left:-10px;transform:scale(1);border-radius:50%!important}.vot-checkbox>input+span:after{content:\"\";z-index:10000;pointer-events:none;width:10px;height:5px;transition:border-color .2s;display:block;position:absolute;top:3px;left:1px;transform:translate(3px,4px)rotate(-45deg);box-sizing:content-box!important;border:0 solid #0000!important;border-width:0 0 2px 2px!important}.vot-checkbox>input:checked,.vot-checkbox>input:indeterminate{background-color:rgb(var(--vot-helper-theme));border-color:rgb(var(--vot-helper-theme))!important}.vot-checkbox>input:checked+span:before,.vot-checkbox>input:indeterminate+span:before{background-color:rgb(var(--vot-helper-theme))}.vot-checkbox>input:checked+span:after,.vot-checkbox>input:indeterminate+span:after{border-color:rgb(var(--vot-helper-ontheme,255,255,255))!important}.vot-checkbox>input:hover{box-shadow:none!important}.vot-checkbox>input:indeterminate+span:after{transform:translate(4px,3px);border-left-width:0!important}.vot-checkbox:hover>input+span:before{opacity:.04}.vot-checkbox:active>input,.vot-checkbox:active:hover>input:not(:disabled){border-color:rgb(var(--vot-helper-theme))!important}.vot-checkbox:active>input:checked{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.6);border-color:#0000!important}.vot-checkbox:active>input+span:before{opacity:1;transition:transform,opacity;transform:scale(0)}.vot-checkbox>input:disabled{cursor:initial;border-color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important}.vot-checkbox>input:disabled:checked,.vot-checkbox>input:disabled:indeterminate{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.38);border-color:#0000!important}.vot-checkbox>input:disabled+span{color:rgba(var(--vot-onsurface-rgb,0,0,0),.38);cursor:initial}.vot-checkbox>input:disabled+span:before{opacity:0;transform:scale(0)}.vot-slider{display:inline-block;--vot-safari-helper1:rgba(var(--vot-primary-rgb,33,150,243),.04)!important;--vot-safari-helper2:rgba(var(--vot-primary-rgb,33,150,243),.12)!important;--vot-safari-helper3:rgba(var(--vot-primary-rgb,33,150,243),.16)!important;--vot-safari-helper4:rgba(var(--vot-primary-rgb,33,150,243),.24)!important;width:100%!important;color:rgba(var(--vot-onsurface-rgb,0,0,0),.87)!important;font-family:var(--vot-font,\"Roboto\",\"Segoe UI\",BlinkMacSystemFont,system-ui,-apple-system)!important;text-align:start!important;font-size:16px!important;line-height:1.5!important}.vot-slider[hidden]{display:none!important}.vot-slider>input{-webkit-appearance:none!important;appearance:none!important;cursor:pointer!important;background-color:#0000!important;border:none!important;width:100%!important;height:36px!important;margin:0 0 -36px!important;padding:0!important;display:block!important;position:relative!important;top:24px!important}.vot-slider>input:hover{box-shadow:none!important}.vot-slider>input:last-child{margin:0!important;position:static!important}.vot-slider>input:before{content:\"\"!important;width:calc(100%*var(--vot-progress,0))!important;background:rgb(var(--vot-primary-rgb,33,150,243))!important;height:2px!important;display:block!important;position:absolute!important;top:calc(50% - 1px)!important}.vot-slider>input:disabled{cursor:default!important;opacity:.38!important}.vot-slider>input:disabled+span{color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important}.vot-slider>input:disabled::-webkit-slider-runnable-track{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important}.vot-slider>input:disabled::-moz-range-track{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important}.vot-slider>input:disabled::-ms-fill-lower{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important}.vot-slider>input:disabled::-ms-fill-upper{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)!important}.vot-slider>input:disabled::-moz-range-thumb{background-color:rgb(var(--vot-onsurface-rgb,0,0,0))!important;box-shadow:0 0 0 1px rgb(var(--vot-surface-rgb,255,255,255))!important;transform:scale(4)!important}.vot-slider>input:disabled::-ms-thumb{background-color:rgb(var(--vot-onsurface-rgb,0,0,0))!important;box-shadow:0 0 0 1px rgb(var(--vot-surface-rgb,255,255,255))!important;transform:scale(4)!important}.vot-slider>input:disabled::-webkit-slider-thumb{background-color:rgb(var(--vot-onsurface-rgb,0,0,0))!important;box-shadow:0 0 0 1px rgb(var(--vot-surface-rgb,255,255,255))!important;transform:scale(4)!important}.vot-slider>input:disabled::-ms-fill-upper{opacity:.38!important}.vot-slider>input:disabled::-moz-range-progress{background-color:rgba(var(--vot-onsurface-rgb,0,0,0),.87)!important}.vot-slider>input:disabled:-webkit-slider-thumb{color:rgb(var(--vot-surface-rgb,255,255,255))!important}.vot-slider>input:active::-webkit-slider-thumb{box-shadow:0 0 0 2px var(--vot-safari-helper4)!important}.vot-slider>input:active::-moz-range-thumb{box-shadow:0 0 0 2px rgba(var(--vot-primary-rgb,33,150,243),.24)!important}.vot-slider>input:active::-ms-thumb{box-shadow:0 0 0 2px rgba(var(--vot-primary-rgb,33,150,243),.24)!important}.vot-slider>input:focus{outline:none!important}.vot-slider>input::-webkit-slider-runnable-track{background-color:rgba(var(--vot-primary-rgb,33,150,243),.24)!important;border-radius:1px!important;width:100%!important;height:2px!important;margin:17px 0!important}.vot-slider>input::-moz-range-track{background-color:rgba(var(--vot-primary-rgb,33,150,243),.24)!important;border-radius:1px!important;width:100%!important;height:2px!important;margin:17px 0!important}.vot-slider>input::-ms-track{box-sizing:border-box!important;background-color:#0000!important;border:none!important;border-radius:1px!important;width:100%!important;height:2px!important;margin:17px 0!important;padding:0 17px!important}.vot-slider>input::-webkit-slider-thumb{-webkit-appearance:none!important;appearance:none!important;background-color:rgb(var(--vot-primary-rgb,33,150,243))!important;border:none!important;border-radius:50%!important;width:2px!important;height:2px!important;transition:box-shadow .2s!important;transform:scale(6)!important}.vot-slider>input::-moz-range-thumb{-webkit-appearance:none!important;appearance:none!important;background-color:rgb(var(--vot-primary-rgb,33,150,243))!important;border:none!important;border-radius:50%!important;width:2px!important;height:2px!important;transition:box-shadow .2s!important;transform:scale(6)!important}.vot-slider>input::-ms-thumb{-webkit-appearance:none!important;appearance:none!important;background-color:rgb(var(--vot-primary-rgb,33,150,243))!important;border:none!important;border-radius:50%!important;width:2px!important;height:2px!important;transition:box-shadow .2s!important;transform:scale(6)!important}.vot-slider>input::-webkit-slider-thumb{-webkit-appearance:none!important;margin:0!important}.vot-slider>input::-moz-range-thumb{-moz-appearance:none!important}.vot-slider>input::-ms-thumb{margin:0 17px!important}.vot-slider>input::-moz-range-progress{background-color:rgb(var(--vot-primary-rgb,33,150,243))!important;border-radius:1px!important;height:2px!important}.vot-slider>input::-ms-fill-lower{background-color:rgb(var(--vot-primary-rgb,33,150,243))!important;border-radius:1px!important;height:2px!important}.vot-slider>input::-ms-fill-upper{background-color:rgb(var(--vot-primary-rgb,33,150,243))!important;border-radius:1px!important;height:2px!important}.vot-slider>input::-moz-focus-outer{border:none!important}.vot-slider>span{margin-bottom:36px!important;display:inline-block!important}.vot-slider:hover>input::-webkit-slider-thumb{box-shadow:0 0 0 2px var(--vot-safari-helper1)!important}.vot-slider:hover>input::-ms-thumb{box-shadow:0 0 0 2px rgba(var(--vot-primary-rgb,33,150,243),.04)!important}.vot-slider:hover>input:hover::-moz-range-thumb{box-shadow:0 0 0 2px rgba(var(--vot-primary-rgb,33,150,243),.04)!important}.vot-slider-label-value{margin-left:4px!important}.vot-select{font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);text-align:start;color:var(--vot-helper-theme);fill:var(--vot-helper-theme);justify-content:space-between;align-items:center;font-size:14px;font-weight:400;line-height:1.5;display:flex;--vot-helper-theme-rgb:var(--vot-onsurface-rgb,0,0,0)!important;--vot-helper-theme:rgba(var(--vot-helper-theme-rgb),.87)!important;--vot-helper-safari1:rgba(var(--vot-onsurface-rgb,0,0,0),.6)!important;--vot-helper-safari2:rgba(var(--vot-onsurface-rgb,0,0,0),.87)!important}.vot-select[hidden]{display:none!important}.vot-select-outer{cursor:pointer;justify-content:space-between;align-items:center;width:120px;max-width:120px;display:flex;border:1px solid var(--vot-helper-safari1)!important;border-radius:4px!important;padding:0 5px!important;transition:border .2s!important}.vot-select-outer:hover{border-color:var(--vot-helper-safari2)!important}.vot-select-title{text-overflow:ellipsis;white-space:nowrap;font-family:inherit;overflow:hidden}.vot-select-arrow-icon{justify-content:center;align-items:center;width:20px;height:32px;display:flex}.vot-select-arrow-icon svg{fill:inherit;stroke:inherit}.vot-select-content-list{flex-direction:column;display:flex}.vot-select-content-list .vot-select-content-item{cursor:pointer;border-radius:8px!important;padding:5px 10px!important}.vot-select-content-list .vot-select-content-item:not([inert]):hover{background-color:#2a2c31}.vot-select-content-list .vot-select-content-item[data-vot-selected=true]{color:rgb(var(--vot-primary-rgb,33,150,243));background-color:rgba(var(--vot-primary-rgb,33,150,243),.2)}.vot-select-content-list .vot-select-content-item[data-vot-selected=true]:hover{background-color:rgba(var(--vot-primary-rgb,33,150,243),.1)!important}.vot-select-content-list .vot-select-content-item[inert]{cursor:default;color:rgba(var(--vot-onsurface-rgb,0,0,0),.38)}.vot-select-content-list .vot-select-content-item[hidden]{display:none!important}.vot-header{color:rgba(var(--vot-helper-onsurface-rgb),.87);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);text-align:start;font-weight:700;line-height:1.5}.vot-header[hidden]{display:none!important}.vot-header:not(:first-child){padding-top:8px}.vot-header-level-1{font-size:2em}.vot-header-level-2{font-size:1.5em}.vot-header-level-3{font-size:1.17em}.vot-header-level-4{font-size:1em}.vot-header-level-5{font-size:.83em}.vot-header-level-6{font-size:.67em}.vot-info{color:rgba(var(--vot-helper-onsurface-rgb),.87);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);text-align:start;-webkit-user-select:text;user-select:text;font-size:16px;line-height:1.5;display:flex}.vot-info[hidden]{display:none!important}.vot-info>:not(:first-child){color:rgba(var(--vot-helper-onsurface-rgb),.5);flex:1;margin-left:8px!important}.vot-details{color:rgba(var(--vot-helper-onsurface-rgb),.87);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);text-align:start;cursor:pointer;justify-content:space-between;align-items:center;font-size:16px;line-height:1.5;transition:background .5s;display:flex;border-radius:.5em!important;margin:-.5em!important;padding:.5em!important}.vot-details[hidden]{display:none!important}.vot-details-arrow-icon{width:20px;height:32px;fill:rgba(var(--vot-helper-onsurface-rgb),.87);justify-content:center;align-items:center;display:flex;transform:scale(1.25)rotate(-90deg)}.vot-details:hover{background:rgba(var(--vot-onsurface-rgb,0,0,0),.04)}.vot-lang-select{--vot-helper-theme-rgb:var(--vot-onsurface-rgb,0,0,0);--vot-helper-theme:rgba(var(--vot-helper-theme-rgb),.87);color:var(--vot-helper-theme);fill:var(--vot-helper-theme);justify-content:space-between;align-items:center;display:flex}.vot-lang-select[hidden]{display:none!important}.vot-lang-select-icon{justify-content:center;align-items:center;width:32px;height:32px;display:flex}.vot-lang-select-icon svg{fill:inherit;stroke:inherit}.vot-segmented-button{--vot-helper-theme-rgb:var(--vot-onsurface-rgb,0,0,0);--vot-helper-theme:rgba(var(--vot-helper-theme-rgb),.87);-webkit-user-select:none;user-select:none;background:rgb(var(--vot-surface-rgb,255,255,255));max-width:100vw;height:32px;color:var(--vot-helper-theme);fill:var(--vot-helper-theme);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:default;z-index:2147483647;align-items:center;font-size:16px;line-height:1.5;transition:opacity .5s;display:flex;position:absolute;top:5rem;left:50%;overflow:hidden;transform:translate(-50%);border-radius:4px!important}.vot-segmented-button[hidden]{display:none!important}.vot-segmented-button *{box-sizing:border-box!important}.vot-segmented-button .vot-separator{background:rgba(var(--vot-helper-theme-rgb),.1);width:1px;height:50%}.vot-segmented-button .vot-separator[hidden]{display:none!important}.vot-segmented-button .vot-segment,.vot-segmented-button .vot-segment-only-icon{height:100%;color:inherit;background-color:#0000;justify-content:center;align-items:center;transition:background-color .1s ease-in-out;display:flex;position:relative;overflow:hidden;border:none!important;padding:0 8px!important}.vot-segmented-button .vot-segment[hidden],.vot-segmented-button [hidden].vot-segment-only-icon{display:none!important}.vot-segmented-button .vot-segment:before,.vot-segmented-button .vot-segment-only-icon:before,.vot-segmented-button .vot-segment:after,.vot-segmented-button .vot-segment-only-icon:after{content:\"\";opacity:0;position:absolute;top:0;bottom:0;left:0;right:0;border-radius:inherit!important}.vot-segmented-button .vot-segment:before,.vot-segmented-button .vot-segment-only-icon:before{background-color:rgb(var(--vot-helper-theme-rgb));transition:opacity .2s}.vot-segmented-button .vot-segment:after,.vot-segmented-button .vot-segment-only-icon:after{background:radial-gradient(circle,currentColor 1%,#0000 1%) 50%/10000% 10000% no-repeat;transition:opacity 1s,background-size .5s}.vot-segmented-button .vot-segment:hover:before,.vot-segmented-button .vot-segment-only-icon:hover:before{opacity:.04}.vot-segmented-button .vot-segment:active:after,.vot-segmented-button .vot-segment-only-icon:active:after{opacity:.16;background-size:100% 100%;transition:background-size}.vot-segmented-button .vot-segment-only-icon{min-width:32px;padding:0!important}.vot-segmented-button .vot-segment-label{white-space:nowrap;color:inherit;font-weight:400;margin-left:8px!important}.vot-segmented-button[data-status=success] .vot-translate-button{color:rgb(var(--vot-primary-rgb,33,150,243));fill:rgb(var(--vot-primary-rgb,33,150,243))}.vot-segmented-button[data-status=error] .vot-translate-button{color:#f28b82;fill:#f28b82}.vot-segmented-button[data-loading=true] #vot-loading-icon{display:block!important}.vot-segmented-button[data-loading=true] #vot-translate-icon{display:none!important}.vot-segmented-button[data-direction=column]{flex-direction:column;height:fit-content}.vot-segmented-button[data-direction=column] .vot-segment-label{display:none}.vot-segmented-button[data-direction=column]>.vot-segment-only-icon,.vot-segmented-button[data-direction=column]>.vot-segment{padding:8px!important}.vot-segmented-button[data-direction=column] .vot-separator{width:50%;height:1px}.vot-segmented-button[data-position=left]{top:12.5vh;left:50px}.vot-segmented-button[data-position=right]{top:12.5vh;left:auto;right:0}.vot-segmented-button svg{width:24px;fill:inherit;stroke:inherit}.vot-tooltip{--vot-helper-theme-rgb:var(--vot-onsurface-rgb,0,0,0);--vot-helper-theme:rgba(var(--vot-helper-theme-rgb),.87);--vot-helper-ondialog:rgb(var(--vot-ondialog-rgb,37,38,40));--vot-helper-border:rgb(var(--vot-tooltip-border,69,69,69));-webkit-user-select:none;user-select:none;background:rgb(var(--vot-surface-rgb,255,255,255));color:var(--vot-helper-theme);fill:var(--vot-helper-theme);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:default;z-index:2147483647;opacity:0;align-items:center;width:max-content;max-width:calc(100vw - 10px);height:max-content;font-size:14px;line-height:1.5;transition:opacity .5s;display:flex;position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden;box-shadow:0 1px 3px #0000001f;border-radius:4px!important;padding:4px 8px!important}.vot-tooltip[hidden]{display:none!important}.vot-tooltip[data-trigger=click]{-webkit-user-select:text;user-select:text}.vot-tooltip.vot-tooltip-bordered{border:1px solid var(--vot-helper-border)}.vot-tooltip *{box-sizing:border-box!important}.vot-menu{--vot-helper-surface-rgb:var(--vot-surface-rgb,255,255,255);--vot-helper-surface:rgb(var(--vot-helper-surface-rgb));--vot-helper-onsurface-rgb:var(--vot-onsurface-rgb,0,0,0);--vot-helper-onsurface:rgba(var(--vot-helper-onsurface-rgb),.87);-webkit-user-select:none;user-select:none;background-color:var(--vot-helper-surface);color:var(--vot-helper-onsurface);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);cursor:default;z-index:2147483647;visibility:visible;opacity:1;transform-origin:top;min-width:300px;font-size:16px;line-height:1.5;transition:opacity .3s,transform .1s;position:absolute;top:calc(5rem + 48px);left:50%;overflow:hidden;transform:translate(-50%)scale(1);border-radius:8px!important}.vot-menu *{box-sizing:border-box!important}.vot-menu[hidden]{pointer-events:none;visibility:hidden;opacity:0;transform:translate(-50%)scale(0);display:block!important}.vot-menu-content-wrapper{min-height:100px;max-height:calc(var(--vot-container-height,75vh) - (5rem + 32px + 16px)*2);flex-direction:column;display:flex;overflow:auto}.vot-menu-header-container{flex-shrink:0;align-items:flex-start;min-height:31px;display:flex}.vot-menu-header-container:empty{padding:0 0 16px!important}.vot-menu-header-container>.vot-icon-button{margin-inline-end:4px!important;margin-top:4px!important}.vot-menu-title-container{font-size:inherit;font-weight:inherit;text-align:start;outline:0;flex:1;display:flex;margin:0!important}.vot-menu-title{flex:1;font-size:16px;font-weight:400;line-height:1;padding:16px!important}.vot-menu-body-container{box-sizing:border-box;overscroll-behavior:contain;flex-direction:column;gap:8px;min-height:1.375rem;display:flex;overflow:auto;scrollbar-color:rgba(var(--vot-helper-onsurface-rgb),.1)var(--vot-helper-surface)!important;padding:0 16px!important}.vot-menu-body-container::-webkit-scrollbar{background:var(--vot-helper-surface)!important;width:12px!important;height:12px!important}.vot-menu-body-container::-webkit-scrollbar-track{background:var(--vot-helper-surface)!important;width:12px!important;height:12px!important}.vot-menu-body-container::-webkit-scrollbar-thumb{background:rgba(var(--vot-helper-onsurface-rgb),.1)!important;border:5px solid var(--vot-helper-surface)!important;-webkit-border-radius:1ex!important}.vot-menu-body-container::-webkit-scrollbar-thumb:hover{border:3px solid var(--vot-helper-surface)!important}.vot-menu-body-container::-webkit-scrollbar-corner{background:var(--vot-helper-surface)!important}.vot-menu-footer-container{flex-shrink:0;justify-content:flex-end;display:flex;padding:16px!important}.vot-menu-footer-container:empty{padding:16px 0 0!important}.vot-menu[data-position=left]{transform-origin:0;top:12.5vh;left:240px}.vot-menu[data-position=right]{transform-origin:100%;top:12.5vh;left:auto;right:-80px}.vot-dialog{--vot-helper-surface-rgb:var(--vot-surface-rgb,255,255,255);--vot-helper-surface:rgb(var(--vot-helper-surface-rgb));--vot-helper-onsurface-rgb:var(--vot-onsurface-rgb,0,0,0);--vot-helper-onsurface:rgba(var(--vot-helper-onsurface-rgb),.87);max-width:initial;max-height:initial;width:min(var(--vot-dialog-width,512px),100%);top:50%;bottom:50%;background-color:var(--vot-helper-surface);height:fit-content;color:var(--vot-helper-onsurface);font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);-webkit-user-select:none;user-select:none;visibility:visible;opacity:1;transform-origin:50%;border-radius:8px;font-size:16px;line-height:1.5;transition:opacity .3s,transform .1s;display:block;position:fixed;top:0;bottom:0;left:0;right:0;overflow-x:auto;overflow-y:hidden;transform:scale(1);box-shadow:0 0 16px #0000001f,0 16px 16px #0000003d;margin:auto!important;padding:0!important}[hidden]>.vot-dialog{pointer-events:none;opacity:0;transition:opacity .1s,transform .2s;transform:scale(.5)}.vot-dialog-container{visibility:visible;z-index:2147483647;position:absolute}.vot-dialog-container[hidden]{pointer-events:none;visibility:hidden;display:block!important}.vot-dialog-container *{box-sizing:border-box!important}.vot-dialog-backdrop{opacity:1;background-color:#0009;transition:opacity .3s;position:fixed;top:0;bottom:0;left:0;right:0}[hidden]>.vot-dialog-backdrop{pointer-events:none;opacity:0}.vot-dialog-content-wrapper{flex-direction:column;max-height:75vh;display:flex;overflow:auto}.vot-dialog-header-container{flex-shrink:0;align-items:flex-start;min-height:31px;display:flex}.vot-dialog-header-container:empty{padding:0 0 20px}.vot-dialog-header-container>.vot-icon-button{margin-inline-end:4px!important;margin-top:4px!important}.vot-dialog-title-container{font-size:inherit;font-weight:inherit;outline:0;flex:1;display:flex;margin:0!important}.vot-dialog-title{flex:1;font-size:115.385%;font-weight:700;line-height:1;padding:20px 20px 16px!important}.vot-dialog-body-container{box-sizing:border-box;overscroll-behavior:contain;flex-direction:column;gap:16px;min-height:1.375rem;display:flex;overflow:auto;scrollbar-color:rgba(var(--vot-helper-onsurface-rgb),.1)var(--vot-helper-surface)!important;padding:0 20px!important}.vot-dialog-body-container::-webkit-scrollbar{background:var(--vot-helper-surface)!important;width:12px!important;height:12px!important}.vot-dialog-body-container::-webkit-scrollbar-track{background:var(--vot-helper-surface)!important;width:12px!important;height:12px!important}.vot-dialog-body-container::-webkit-scrollbar-thumb{background:rgba(var(--vot-helper-onsurface-rgb),.1)!important;border:5px solid var(--vot-helper-surface)!important;-webkit-border-radius:1ex!important}.vot-dialog-body-container::-webkit-scrollbar-thumb:hover{border:3px solid var(--vot-helper-surface)!important}.vot-dialog-body-container::-webkit-scrollbar-corner{background:var(--vot-helper-surface)!important}.vot-dialog-footer-container{flex-shrink:0;justify-content:flex-end;display:flex;padding:16px!important}.vot-dialog-footer-container:empty{padding:20px 0 0!important}.vot-inline-loader{aspect-ratio:5;--vot-loader-bg:no-repeat radial-gradient(farthest-side,rgba(var(--vot-onsurface-rgb,0,0,0),.38)94%,transparent);background:var(--vot-loader-bg),var(--vot-loader-bg),var(--vot-loader-bg),var(--vot-loader-bg);background-size:20% 100%;height:8px;animation:.75s infinite alternate dotsSlide,1.5s infinite alternate dotsFlip}.vot-loader-text{--vot-helper-theme:var(--vot-theme-rgb,var(--vot-primary-rgb,33,150,243));fill:rgb(var(--vot-helper-theme));font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);font-size:12px;font-weight:500}@keyframes dotsSlide{0%,10%{background-position:0 0,0 0,0 0,0 0}33%{background-position:0 0,33.3333% 0,33.3333% 0,33.3333% 0}66%{background-position:0 0,33.3333% 0,66.6667% 0,66.6667% 0}90%,to{background-position:0 0,33.3333% 0,66.6667% 0,100% 0}}@keyframes dotsFlip{0%,49.99%{transform:scale(1)}50%,to{transform:scale(-1)}}.vot-label{align-items:center;gap:4px;font-family:inherit;font-size:16px;display:flex}.vot-label-icon{width:20px;height:20px;margin-top:2px}.vot-label-icon>svg{width:20px;height:20px}.vot-account{justify-content:space-between;align-items:center;gap:1rem;display:flex}.vot-account-container,.vot-account-wrapper,.vot-account-buttons{align-items:center;gap:1rem;display:flex}.vot-account-avatar{min-width:36px;max-width:36px;min-height:36px;max-height:36px;overflow:hidden}.vot-account-avatar-img{object-fit:cover;border-radius:50%;width:36px;height:36px}.vot-account [hidden]{display:none!important}.vot-subtitles{--vot-subtitles-background:rgba(var(--vot-surface-rgb,46,47,52),var(--vot-subtitles-opacity,.8));background:var(--vot-subtitles-background,#2e2f34cc);width:max-content;max-width:100%;max-height:100%;color:var(--vot-subtitles-color,#e3e3e3);pointer-events:all;font-size:20px;font-family:var(--vot-font-family,\"Roboto\",\"Segoe UI\",system-ui,sans-serif);box-sizing:border-box;-webkit-user-select:none;user-select:none;flex-wrap:wrap;gap:0 3px;line-height:normal;display:flex;position:relative;border-radius:.5em!important;padding:.5em!important}.vot-subtitles-widget{z-index:2147483647;pointer-events:none;justify-content:center;align-items:center;width:50%;min-height:20%;max-height:100%;display:flex;position:absolute;top:75%;left:25%}.vot-subtitles-info{flex-direction:column;gap:2px;display:flex;padding:6px!important}.vot-subtitles-info-service{color:var(--vot-subtitles-context-color,#86919b);margin-bottom:8px!important;font-size:10px!important;line-height:1!important}.vot-subtitles-info-header{color:var(--vot-subtitles-header-color,#fff);margin-bottom:6px!important;font-size:20px!important;font-weight:500!important;line-height:1!important}.vot-subtitles-info-context{color:var(--vot-subtitles-context-color,#86919b);font-size:12px!important;line-height:1.2!important}.vot-subtitles span{cursor:pointer;position:relative;font-size:inherit!important;font-family:inherit!important;line-height:normal!important}.vot-subtitles span.passed{color:var(--vot-subtitles-passed-color,#2196f3)}.vot-subtitles span:before{content:\"\";z-index:-1;width:100%;height:100%;position:absolute;top:2px;bottom:2px;left:-2px;right:-2px;border-radius:4px!important;padding:0 2px!important}.vot-subtitles span:hover:before{background:var(--vot-subtitles-hover-color,#ffffff8c)}.vot-subtitles span.selected:before{background:var(--vot-subtitles-passed-color,#2196f3)}#vot-subtitles-info.vot-subtitles-info *{-webkit-user-select:text!important;user-select:text!important}:root{--vot-font-family:\"Roboto\",\"Segoe UI\",system-ui,sans-serif;--vot-primary-rgb:139,180,245;--vot-onprimary-rgb:32,33,36;--vot-surface-rgb:32,33,36;--vot-onsurface-rgb:227,227,227;--vot-subtitles-color:rgb(var(--vot-onsurface-rgb,227,227,227));--vot-subtitles-passed-color:rgb(var(--vot-primary-rgb,33,150,243))}vot-block{font-family:inherit;display:block;visibility:visible!important}.vot-portal{display:inline}.vot-portal-local{z-index:2147483647;position:fixed;top:0;left:0}");
		},
		"./src/subtitles.js": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						I: () => SubtitlesProcessor,
						o: () => SubtitlesWidget
					});
					var x = g("./node_modules/@vot.js/ext/dist/helpers/youtube.js"), w = g("./node_modules/@vot.js/shared/dist/utils/subs.js"), D = g("./node_modules/lit-html/lit-html.js"), O = g("./src/config/config.js"), A = g("./src/localization/localizationProvider.ts"), F = g("./src/ui.js"), U = g("./src/ui/components/tooltip.ts"), K = g("./src/utils/gm.ts"), oe = g("./src/utils/localization.ts"), le = g("./src/utils/storage.ts"), ue = g("./src/utils/translateApis.ts"), we = g("./src/utils/utils.ts"), je = p([
						A,
						F,
						U,
						K,
						oe,
						le,
						ue,
						we
					]);
					[A, F, U, K, oe, le, ue, we] = je.then ? (await je)() : je;
					class SubtitlesProcessor {
						static formatYandexTokens(p) {
							let m = p.startMs + p.durationMs;
							return p.tokens.reduce((g, _, x) => {
								let w = p.tokens[x + 1], D = g[g.length - 1], O = D?.alignRange?.end ?? 0, A = O + _.text.length;
								if (_.alignRange = {
									start: O,
									end: A
								}, g.push(_), w) {
									let p = _.startMs + _.durationMs, x = w.startMs ? w.startMs - p : m - p;
									g.push({
										text: " ",
										startMs: p,
										durationMs: x,
										alignRange: {
											start: A,
											end: A + 1
										}
									});
								}
								return g;
							}, []);
						}
						static createTokens(p, m) {
							let g = p.text.split(/([\n \t])/).reduce((p, g) => {
								if (!g.length) return p;
								let _ = p[p.length - 1] ?? m, x = _?.alignRange?.end ?? 0, w = x + g.length;
								return p.push({
									text: g,
									alignRange: {
										start: x,
										end: w
									}
								}), p;
							}, []), _ = Math.floor(p.durationMs / g.length), x = p.startMs + p.durationMs;
							return g.map((m, w) => {
								let D = w === g.length - 1, O = p.startMs + _ * w, A = D ? x - O : _;
								return {
									...m,
									startMs: O,
									durationMs: A
								};
							});
						}
						static processTokens(p, m) {
							let g = [], _, { source: x, isAutoGenerated: w } = m;
							for (let m of p.subtitles) {
								let p = m?.tokens?.length, D = p && (x === "yandex" || x === "youtube" && w) ? SubtitlesProcessor.formatYandexTokens(m) : SubtitlesProcessor.createTokens(m, _);
								_ = D[D.length - 1], g.push({
									...m,
									tokens: D
								});
							}
							return p.containsTokens = !0, g;
						}
						static formatYoutubeSubtitles(p, m = !1) {
							if (!p?.events?.length) return console.warn("[VOT] Invalid YouTube subtitles format:", p), {
								containsTokens: m,
								subtitles: []
							};
							let g = {
								containsTokens: m,
								subtitles: []
							};
							for (let _ = 0; _ < p.events.length; _++) {
								let x = p.events[_];
								if (!x.segs) continue;
								let w = x.dDurationMs;
								p.events[_ + 1] && x.tStartMs + x.dDurationMs > p.events[_ + 1].tStartMs && (w = p.events[_ + 1].tStartMs - x.tStartMs);
								let D = [], O = w;
								for (let p = 0; p < x.segs.length; p++) {
									let m = x.segs[p], g = m.utf8.trim();
									if (g === "\n") continue;
									let _ = m.tOffsetMs ?? 0, A = w, F = x.segs[p + 1];
									F?.tOffsetMs && (A = F.tOffsetMs - _, O -= A), D.push({
										text: g,
										startMs: x.tStartMs + _,
										durationMs: F ? A : O
									});
								}
								let A = D.map((p) => p.text).join(" ");
								A && g.subtitles.push({
									text: A,
									startMs: x.tStartMs,
									durationMs: w,
									...m ? { tokens: D } : {}
								});
							}
							return g;
						}
						static cleanJsonSubtitles(p) {
							let { containsTokens: m, subtitles: g } = p;
							return {
								containsTokens: m,
								subtitles: g.map((p) => ({
									...p,
									text: p.text.replace(/(<([^>]+)>)/gi, "")
								}))
							};
						}
						static async fetchSubtitles(p) {
							let { source: m, isAutoGenerated: g, format: _ } = p, { url: D } = p;
							if (m === "youtube") {
								let p = x.A.getPoToken();
								if (p) {
									let m = x.A.getDeviceParams();
									D += `&potc=1&pot=${p}&${m}`;
								}
							}
							try {
								let x = await (0, K.G3)(D, { timeout: 7e3 }), O;
								if (["vtt", "srt"].includes(_)) {
									let p = await x.text();
									O = (0, w.vk)(p, "json");
								} else O = await x.json();
								return m === "youtube" ? O = SubtitlesProcessor.formatYoutubeSubtitles(O, g) : m === "vk" && (O = SubtitlesProcessor.cleanJsonSubtitles(O)), O.subtitles = SubtitlesProcessor.processTokens(O, p), console.log("[VOT] Processed subtitles:", O), O;
							} catch (p) {
								return console.warn("[VOT] Failed to process subtitles:", p), {
									containsTokens: !1,
									subtitles: []
								};
							}
						}
						static async getSubtitles(p, m) {
							let { host: g, url: _, detectedLanguage: x, videoId: w, duration: D, subtitles: O = [] } = m;
							try {
								let m = await Promise.race([p.getSubtitles({
									videoData: {
										host: g,
										url: _,
										videoId: w,
										duration: D
									},
									requestLang: x
								}), (0, we.wR)(5e3, "Timeout")]);
								console.log("[VOT] Subtitles response:", m), m.waiting && console.warn("[VOT] Failed to get Yandex subtitles");
								let A = (m.subtitles ?? []).reduce((p, m) => (m.language && !p.find((p) => p.source === "yandex" && p.language === m.language && !p.translatedFromLanguage) && p.push({
									source: "yandex",
									format: "json",
									language: m.language,
									url: m.url
								}), m.translatedLanguage && p.push({
									source: "yandex",
									format: "json",
									language: m.translatedLanguage,
									translatedFromLanguage: m.language,
									url: m.translatedUrl
								}), p), []);
								return [...A, ...O].sort((p, m) => {
									if (p.source !== m.source) return p.source === "yandex" ? -1 : 1;
									if (p.language !== m.language && (p.language === oe.v || m.language === oe.v)) return p.language === oe.v ? -1 : 1;
									if (p.source === "yandex") {
										if (p.translatedFromLanguage !== m.translatedFromLanguage) return !p.translatedFromLanguage || !m.translatedFromLanguage ? p.language === m.language ? p.translatedFromLanguage ? 1 : -1 : p.translatedFromLanguage ? -1 : 1 : p.translatedFromLanguage === x ? -1 : 1;
										if (!p.translatedFromLanguage) return p.language === x ? -1 : 1;
									}
									return p.source !== "yandex" && p.isAutoGenerated !== m.isAutoGenerated ? p.isAutoGenerated ? 1 : -1 : 0;
								});
							} catch (p) {
								let m = p.message === "Timeout" ? "Failed to get Yandex subtitles: timeout" : "Error in getSubtitles function";
								throw console.warn(`[VOT] ${m}`, p), p;
							}
						}
					}
					class SubtitlesWidget {
						constructor(p, m, g, _, x = void 0) {
							this.video = p, this.container = m, this.site = g, this.tooltipLayoutRoot = x, this.portal = _, this.subtitlesContainer = this.createSubtitlesContainer(), this.position = {
								left: 25,
								top: 75
							}, this.dragging = {
								active: !1,
								offset: {
									x: 0,
									y: 0
								}
							}, this.subtitles = null, this.subtitleLang = void 0, this.lastContent = null, this.highlightWords = !1, this.fontSize = 20, this.opacity = .2, this.maxLength = 300, this.abortController = new AbortController(), this.bindEvents(), this.updateContainerRect();
						}
						createSubtitlesContainer() {
							return this.subtitlesContainer = document.createElement("vot-block"), this.subtitlesContainer.classList.add("vot-subtitles-widget"), this.container.appendChild(this.subtitlesContainer), this.subtitlesContainer;
						}
						bindEvents() {
							let { signal: p } = this.abortController;
							this.onPointerDownBound = (p) => this.onPointerDown(p), this.onPointerUpBound = () => this.onPointerUp(), this.onPointerMoveBound = (p) => this.onPointerMove(p), this.onTimeUpdateBound = () => this.update(), document.addEventListener("pointerdown", this.onPointerDownBound, { signal: p }), document.addEventListener("pointerup", this.onPointerUpBound, { signal: p }), document.addEventListener("pointermove", this.onPointerMoveBound, { signal: p }), this.video?.addEventListener("timeupdate", this.onTimeUpdateBound, { signal: p }), this.resizeObserver = new ResizeObserver(() => this.onResize()), this.resizeObserver.observe(this.container);
						}
						onPointerDown(p) {
							if (!this.subtitlesContainer.contains(p.target)) return;
							let m = this.subtitlesContainer.getBoundingClientRect(), g = this.container.getBoundingClientRect();
							this.dragging = {
								active: !0,
								offset: {
									x: p.clientX - m.left,
									y: p.clientY - m.top
								},
								containerOffset: {
									x: g.left,
									y: g.top
								}
							};
						}
						onPointerUp() {
							this.dragging.active = !1;
						}
						onPointerMove(p) {
							if (!this.dragging.active) return;
							p.preventDefault();
							let { width: m, height: g } = this.container.getBoundingClientRect(), { containerOffset: _, offset: x } = this.dragging;
							this.position = {
								left: (p.clientX - x.x - _.x) / m * 100,
								top: (p.clientY - x.y - _.y) / g * 100
							}, this.applySubtitlePosition();
						}
						onResize() {
							this.updateContainerRect();
						}
						updateContainerRect() {
							this.containerRect = this.container.getBoundingClientRect(), this.applySubtitlePosition();
						}
						applySubtitlePosition() {
							let { width: p, height: m } = this.containerRect, { offsetWidth: g, offsetHeight: _ } = this.subtitlesContainer, x = (p - g) / p * 100, w = (m - _) / m * 100;
							this.position.left = Math.max(0, Math.min(this.position.left, x)), this.position.top = Math.max(0, Math.min(this.position.top, w)), this.subtitlesContainer.style.left = `${this.position.left}%`, this.subtitlesContainer.style.top = `${this.position.top}%`, this.tokenTooltip?.updatePos();
						}
						processTokens(p) {
							if (p.at(-1).alignRange.end <= this.maxLength) return p;
							let m = [], g = [], _ = 0;
							for (let x of p) _ += x.text.length, g.push(x), _ > this.maxLength && (m.push(this.trimChunk(g)), g = [], _ = 0);
							g.length && m.push(this.trimChunk(g));
							let x = this.video.currentTime * 1e3;
							return m.find((p) => p[0].startMs < x && x < p.at(-1).startMs + p.at(-1).durationMs) || m[0];
						}
						trimChunk(p) {
							return p[0]?.text === " " && p.shift(), p.at(-1)?.text === " " && p.pop(), p;
						}
						async translateStrTokens(p) {
							let m = this.subtitleLang, g = A.j.lang;
							if (this.strTranslatedTokens) {
								let _ = await (0, ue.Tl)(p, m, g);
								return [this.strTranslatedTokens, _];
							}
							let _ = await (0, ue.Tl)([this.strTokens, p], m, g);
							return this.strTranslatedTokens = _[0], _;
						}
						releaseTooltip() {
							return this.tokenTooltip && (this.tokenTooltip.target.classList.remove("selected"), this.tokenTooltip.release(), this.tokenTooltip = void 0), this;
						}
						onClick = async (p) => {
							if (this.tokenTooltip?.target === p.target && this.tokenTooltip?.container) {
								this.tokenTooltip.showed ? p.target.classList.add("selected") : p.target.classList.remove("selected");
								return;
							}
							this.releaseTooltip(), p.target.classList.add("selected");
							let m = p.target.textContent.trim().replace(/[.|,]/, ""), g = await le.d.get("translationService", O.mE), _ = F.A.createSubtitleInfo(m, this.strTranslatedTokens || this.strTokens, g);
							this.tokenTooltip = new U.A({
								target: p.target,
								anchor: this.subtitlesBlock,
								layoutRoot: this.tooltipLayoutRoot,
								content: _.container,
								parentElement: this.portal,
								maxWidth: this.subtitlesContainer.offsetWidth,
								borderRadius: 12,
								bordered: !1,
								position: "top",
								trigger: "click"
							}), this.tokenTooltip.create();
							let x = this.strTokens, w = await this.translateStrTokens(m);
							x !== this.strTokens || !this.tokenTooltip?.showed || (_.header.textContent = w[1], _.context.textContent = w[0], this.tokenTooltip.setContent(_.container), this.tokenTooltip.create());
						};
						renderTokens(p, m) {
							return p.map((p) => {
								let g = this.highlightWords && (m > p.startMs + p.durationMs / 2 || m > p.startMs - 100 && p.startMs + p.durationMs / 2 - m < 275);
								return (0, D.qy)`<span
        @click="${this.onClick}"
        class="${g ? "passed" : ""}"
      >
        ${p.text.replace("\\n", "<br>")}
      </span>`;
							});
						}
						setContent(p, m = void 0) {
							if (this.releaseTooltip(), this.subtitleLang = m, !p || !this.video) {
								this.subtitles = null, (0, D.XX)(null, this.subtitlesContainer);
								return;
							}
							this.subtitles = p, this.update();
						}
						setMaxLength(p) {
							typeof p == "number" && p > 0 && (this.maxLength = p, this.update());
						}
						setHighlightWords(p) {
							this.highlightWords = !!p, this.update();
						}
						setFontSize(p) {
							this.fontSize = p, this.subtitlesBlock && (this.subtitlesBlock.style.fontSize = `${p}px`);
						}
						setOpacity(p) {
							this.opacity = ((100 - p) / 100).toFixed(2), this.subtitlesBlock && this.subtitlesBlock.style.setProperty("--vot-subtitles-opacity", this.opacity);
						}
						stringifyTokens(p) {
							return p.map((p) => p.text).join("");
						}
						update() {
							if (!this.video || !this.subtitles) return;
							let p = this.video.currentTime * 1e3, m = this.subtitles.subtitles.findLast((m) => m.startMs < p && p < m.startMs + m.durationMs);
							if (!m) {
								(0, D.XX)(null, this.subtitlesContainer), this.subtitlesBlock = null, this.releaseTooltip();
								return;
							}
							let g = this.processTokens(m.tokens), _ = this.renderTokens(g, p), x = JSON.stringify(_);
							if (x !== this.lastContent) {
								this.lastContent = x;
								let p = this.stringifyTokens(g);
								p !== this.strTokens && (this.releaseTooltip(), this.strTokens = p, this.strTranslatedTokens = ""), (0, D.XX)((0, D.qy)`<vot-block
          class="vot-subtitles"
          style="font-size: ${this.fontSize}px; --vot-subtitles-opacity: ${this.opacity}"
          >${_}</vot-block
        >`, this.subtitlesContainer), this.subtitlesBlock = this.subtitlesContainer.querySelector(".vot-subtitles");
							}
						}
						release() {
							this.abortController.abort(), this.resizeObserver.disconnect(), this.releaseTooltip(), this.subtitlesContainer.remove();
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/types/components/tooltip.ts": (p, m, g) => {
			"use strict";
			g.d(m, {
				G: () => x,
				X: () => _
			});
			let _ = [
				"left",
				"top",
				"right",
				"bottom"
			], x = ["hover", "click"];
		},
		"./src/types/components/votButton.ts": (p, m, g) => {
			"use strict";
			g.d(m, { X: () => _ });
			let _ = [
				"default",
				"top",
				"left",
				"right"
			], x = null;
		},
		"./src/ui.js": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => UI });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/styles/main.scss"), D = g("./src/localization/localizationProvider.ts"), O = p([D]);
					D = (O.then ? (await O)() : O)[0];
					class UI {
						static createEl(p, m = [], g = null) {
							let _ = document.createElement(p);
							return m.length && _.classList.add(...m), g !== null && _.append(g), _;
						}
						static createHeader(p, m = 4) {
							let g = UI.createEl("vot-block", ["vot-header", `vot-header-level-${m}`]);
							return g.append(p), g;
						}
						static createInformation(p, m) {
							let g = UI.createEl("vot-block", ["vot-info"]), _ = UI.createEl("vot-block");
							(0, x.XX)(p, _);
							let w = UI.createEl("vot-block");
							return (0, x.XX)(m, w), g.append(_, w), {
								container: g,
								header: _,
								value: w
							};
						}
						static createButton(p) {
							let m = UI.createEl("vot-block", ["vot-button"]);
							return m.append(p), m;
						}
						static createTextButton(p) {
							let m = UI.createEl("vot-block", ["vot-text-button"]);
							return m.append(p), m;
						}
						static createOutlinedButton(p) {
							let m = UI.createEl("vot-block", ["vot-outlined-button"]);
							return m.append(p), m;
						}
						static createIconButton(p) {
							let m = UI.createEl("vot-block", ["vot-icon-button"]);
							return (0, x.XX)(p, m), m;
						}
						static createInlineLoader() {
							return UI.createEl("vot-block", ["vot-inline-loader"]);
						}
						static createPortal(p = !1) {
							return UI.createEl("vot-block", [`vot-portal${p ? "-local" : ""}`]);
						}
						static createSubtitleInfo(p, m, g) {
							let _ = UI.createEl("vot-block", ["vot-subtitles-info"]);
							_.id = "vot-subtitles-info";
							let x = UI.createEl("vot-block", ["vot-subtitles-info-service"], D.j.get("VOTTranslatedBy").replace("{0}", g)), w = UI.createEl("vot-block", ["vot-subtitles-info-header"], p), O = UI.createEl("vot-block", ["vot-subtitles-info-context"], m);
							return _.append(x, w, O), {
								container: _,
								translatedWith: x,
								header: w,
								context: O
							};
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/accountButton.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => AccountButton });
					var x = g("./src/config/config.js"), w = g("./src/core/eventImpl.ts"), D = g("./src/localization/localizationProvider.ts"), O = g("./src/ui.js"), A = g("./src/ui/icons.ts"), F = p([D, O]);
					[D, O] = F.then ? (await F)() : F;
					class AccountButton {
						container;
						accountWrapper;
						buttons;
						usernameEl;
						avatarEl;
						avatarImg;
						actionButton;
						refreshButton;
						tokenButton;
						onClick = new w.Z();
						onRefresh = new w.Z();
						onClickSecret = new w.Z();
						_loggedIn;
						_username;
						_avatarId;
						constructor({ loggedIn: p = !1, username: m = "unnamed", avatarId: g = "0/0-0" } = {}) {
							this._loggedIn = p, this._username = m, this._avatarId = g;
							let _ = this.createElements();
							this.container = _.container, this.accountWrapper = _.accountWrapper, this.buttons = _.buttons, this.usernameEl = _.usernameEl, this.avatarEl = _.avatarEl, this.avatarImg = _.avatarImg, this.actionButton = _.actionButton, this.refreshButton = _.refreshButton, this.tokenButton = _.tokenButton;
						}
						createElements() {
							let p = O.A.createEl("vot-block", ["vot-account"]), m = O.A.createEl("vot-block", ["vot-account-wrapper"]);
							m.hidden = !this._loggedIn;
							let g = O.A.createEl("img", ["vot-account-avatar-img"]);
							g.src = `${x.cL}/${this._avatarId}/islands-retina-middle`, g.loading = "lazy", g.alt = "user avatar";
							let _ = O.A.createEl("vot-block", ["vot-account-avatar"], g), w = O.A.createEl("vot-block", ["vot-account-username"]);
							w.textContent = this._username, m.append(_, w);
							let D = O.A.createEl("vot-block", ["vot-account-buttons"]), F = O.A.createOutlinedButton(this.buttonText);
							F.addEventListener("click", () => {
								this.onClick.dispatch();
							});
							let U = O.A.createIconButton(A.GA);
							U.hidden = this._loggedIn, U.addEventListener("click", () => {
								this.onClickSecret.dispatch();
							});
							let K = O.A.createIconButton(A.M9);
							return K.addEventListener("click", () => {
								this.onRefresh.dispatch();
							}), D.append(F, U, K), p.append(m, D), {
								container: p,
								accountWrapper: m,
								buttons: D,
								usernameEl: w,
								avatarImg: g,
								avatarEl: _,
								actionButton: F,
								refreshButton: K,
								tokenButton: U
							};
						}
						addEventListener(p, m) {
							switch (p) {
								case "click":
									this.onClick.addListener(m);
									break;
								case "click:secret":
									this.onClickSecret.addListener(m);
									break;
								case "refresh":
									this.onRefresh.addListener(m);
									break;
							}
							return this;
						}
						removeEventListener(p, m) {
							switch (p) {
								case "click":
									this.onClick.removeListener(m);
									break;
								case "click:secret":
									this.onClickSecret.removeListener(m);
									break;
								case "refresh":
									this.onRefresh.removeListener(m);
									break;
							}
							return this;
						}
						get buttonText() {
							return this._loggedIn ? D.j.get("VOTLogout") : D.j.get("VOTLogin");
						}
						get loggedIn() {
							return this._loggedIn;
						}
						set loggedIn(p) {
							this._loggedIn = p, this.accountWrapper.hidden = !this._loggedIn, this.actionButton.textContent = this.buttonText, this.tokenButton.hidden = this._loggedIn;
						}
						get avatarId() {
							return this._avatarId;
						}
						set avatarId(p) {
							this._avatarId = p ?? "0/0-0", this.avatarImg.src = `${x.cL}/${this._avatarId}/islands-retina-middle`;
						}
						get username() {
							return this._username;
						}
						set username(p) {
							this._username = p ?? "unnamed", this.usernameEl.textContent = this._username;
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/checkbox.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Checkbox });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/core/eventImpl.ts"), D = g("./src/ui.js"), O = p([D]);
					D = (O.then ? (await O)() : O)[0];
					class Checkbox {
						container;
						input;
						label;
						onChange = new w.Z();
						_labelHtml;
						_checked;
						_isSubCheckbox;
						constructor({ labelHtml: p, checked: m = !1, isSubCheckbox: g = !1 }) {
							this._labelHtml = p, this._checked = m, this._isSubCheckbox = g;
							let _ = this.createElements();
							this.container = _.container, this.input = _.input, this.label = _.label;
						}
						createElements() {
							let p = D.A.createEl("label", ["vot-checkbox"]);
							this._isSubCheckbox && p.classList.add("vot-checkbox-sub");
							let m = document.createElement("input");
							m.type = "checkbox", m.checked = this._checked, m.addEventListener("change", () => {
								this._checked = m.checked, this.onChange.dispatch(this._checked);
							});
							let g = D.A.createEl("span");
							return (0, x.XX)(this._labelHtml, g), p.append(m, g), {
								container: p,
								input: m,
								label: g
							};
						}
						addEventListener(p, m) {
							return this.onChange.addListener(m), this;
						}
						removeEventListener(p, m) {
							return this.onChange.removeListener(m), this;
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
						get disabled() {
							return this.input.disabled;
						}
						set disabled(p) {
							this.input.disabled = p;
						}
						get checked() {
							return this._checked;
						}
						set checked(p) {
							this._checked !== p && (this._checked = this.input.checked = p, this.onChange.dispatch(this._checked));
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/details.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Details });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/core/eventImpl.ts"), D = g("./src/ui.js"), O = g("./src/ui/icons.ts"), A = p([D]);
					D = (A.then ? (await A)() : A)[0];
					class Details {
						container;
						header;
						arrowIcon;
						onClick = new w.Z();
						_titleHtml;
						constructor({ titleHtml: p }) {
							this._titleHtml = p;
							let m = this.createElements();
							this.container = m.container, this.header = m.header, this.arrowIcon = m.arrowIcon;
						}
						createElements() {
							let p = D.A.createEl("vot-block", ["vot-details"]), m = D.A.createEl("vot-block");
							m.append(this._titleHtml);
							let g = D.A.createEl("vot-block", ["vot-details-arrow-icon"]);
							return (0, x.XX)(O.mQ, g), p.append(m, g), p.addEventListener("click", () => {
								this.onClick.dispatch();
							}), {
								container: p,
								header: m,
								arrowIcon: g
							};
						}
						addEventListener(p, m) {
							return this.onClick.addListener(m), this;
						}
						removeEventListener(p, m) {
							return this.onClick.removeListener(m), this;
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/dialog.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Dialog });
					var x = g("./src/core/eventImpl.ts"), w = g("./src/ui.js"), D = g("./src/ui/icons.ts"), O = p([w]);
					w = (O.then ? (await O)() : O)[0];
					class Dialog {
						container;
						backdrop;
						box;
						contentWrapper;
						headerContainer;
						titleContainer;
						title;
						closeButton;
						bodyContainer;
						footerContainer;
						onClose = new x.Z();
						_titleHtml;
						_isTemp;
						constructor({ titleHtml: p, isTemp: m = !1 }) {
							this._titleHtml = p, this._isTemp = m;
							let g = this.createElements();
							this.container = g.container, this.backdrop = g.backdrop, this.box = g.box, this.contentWrapper = g.contentWrapper, this.headerContainer = g.headerContainer, this.titleContainer = g.titleContainer, this.title = g.title, this.closeButton = g.closeButton, this.bodyContainer = g.bodyContainer, this.footerContainer = g.footerContainer;
						}
						createElements() {
							let p = w.A.createEl("vot-block", ["vot-dialog-container"]);
							this._isTemp && p.classList.add("vot-dialog-temp"), p.hidden = !this._isTemp;
							let m = w.A.createEl("vot-block", ["vot-dialog-backdrop"]), g = w.A.createEl("vot-block", ["vot-dialog"]), _ = w.A.createEl("vot-block", ["vot-dialog-content-wrapper"]), x = w.A.createEl("vot-block", ["vot-dialog-header-container"]), O = w.A.createEl("vot-block", ["vot-dialog-title-container"]), A = w.A.createEl("vot-block", ["vot-dialog-title"]);
							A.append(this._titleHtml), O.appendChild(A);
							let F = w.A.createIconButton(D.jr);
							F.classList.add("vot-dialog-close-button"), m.addEventListener("click", () => {
								this.close();
							}), F.addEventListener("click", () => {
								this.close();
							}), x.append(O, F);
							let U = w.A.createEl("vot-block", ["vot-dialog-body-container"]), K = w.A.createEl("vot-block", ["vot-dialog-footer-container"]);
							return _.append(x, U, K), g.appendChild(_), p.append(m, g), {
								container: p,
								backdrop: m,
								box: g,
								contentWrapper: _,
								headerContainer: x,
								titleContainer: O,
								title: A,
								closeButton: F,
								bodyContainer: U,
								footerContainer: K
							};
						}
						addEventListener(p, m) {
							return this.onClose.addListener(m), this;
						}
						removeEventListener(p, m) {
							return this.onClose.removeListener(m), this;
						}
						open() {
							return this.hidden = !1, this;
						}
						remove() {
							return this.container.remove(), this.onClose.dispatch(), this;
						}
						close() {
							return this._isTemp ? this.remove() : (this.hidden = !0, this.onClose.dispatch(), this);
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
						get isDialogOpen() {
							return !this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/downloadButton.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => DownloadButton });
					var x = g("./src/core/eventImpl.ts"), w = g("./src/ui.js"), D = g("./src/ui/icons.ts"), O = p([w]);
					w = (O.then ? (await O)() : O)[0];
					class DownloadButton {
						button;
						loaderMain;
						loaderText;
						onClick = new x.Z();
						_progress = 0;
						constructor() {
							let p = this.createElements();
							this.button = p.button, this.loaderMain = p.loaderMain, this.loaderText = p.loaderText;
						}
						createElements() {
							let p = w.A.createIconButton(D.nO), m = p.querySelector(".vot-loader-main"), g = p.querySelector(".vot-loader-text");
							return p.addEventListener("click", () => {
								this.onClick.dispatch();
							}), {
								button: p,
								loaderMain: m,
								loaderText: g
							};
						}
						addEventListener(p, m) {
							return this.onClick.addListener(m), this;
						}
						removeEventListener(p, m) {
							return this.onClick.removeListener(m), this;
						}
						get progress() {
							return this._progress;
						}
						set progress(p) {
							this._progress = p, this.loaderText.textContent = p === 0 ? "" : p.toString(), !(p > 1) && (this.loaderMain.style.opacity = p === 0 ? "1" : "0");
						}
						set hidden(p) {
							this.button.hidden = p;
						}
						get hidden() {
							return this.button.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/hotkeyButton.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						A: () => HotkeyButton,
						_: () => formatKeysCombo
					});
					var x = g("./src/core/eventImpl.ts"), w = g("./src/localization/localizationProvider.ts"), D = g("./src/ui.js"), O = p([w, D]);
					[w, D] = O.then ? (await O)() : O;
					class HotkeyButton {
						container;
						button;
						onChange = new x.Z();
						_labelHtml;
						_key;
						pressedKeys;
						recording = !1;
						constructor({ labelHtml: p, key: m = null }) {
							this._labelHtml = p, this._key = m, this.pressedKeys = new Set();
							let g = this.createElements();
							this.container = g.container, this.button = g.button;
						}
						stopRecordingKeys() {
							this.recording = !1, document.removeEventListener("keydown", this.keydownHandle), document.removeEventListener("keyup", this.keyupOrBlurHandle), document.removeEventListener("blur", this.keyupOrBlurHandle), this.button.removeAttribute("data-status"), this.pressedKeys.clear();
						}
						keydownHandle = (p) => {
							if (!(!this.recording || p.repeat)) {
								if (p.preventDefault(), p.code === "Escape") {
									this.key = null, this.button.textContent = this.keyText, this.stopRecordingKeys();
									return;
								}
								this.pressedKeys.add(p.code), this.button.textContent = formatKeysCombo(this.pressedKeys);
							}
						};
						keyupOrBlurHandle = () => {
							this.recording && (this.key = formatKeysCombo(this.pressedKeys), this.stopRecordingKeys());
						};
						createElements() {
							let p = D.A.createEl("vot-block", ["vot-hotkey"]), m = D.A.createEl("vot-block", ["vot-hotkey-label"]);
							m.textContent = this._labelHtml;
							let g = D.A.createEl("vot-block", ["vot-hotkey-button"]);
							return g.textContent = this.keyText, g.addEventListener("click", () => {
								g.dataset.status = "active", this.recording = !0, this.pressedKeys.clear(), this.button.textContent = w.j.get("PressTheKeyCombination"), document.addEventListener("keydown", this.keydownHandle), document.addEventListener("keyup", this.keyupOrBlurHandle), document.addEventListener("blur", this.keyupOrBlurHandle);
							}), p.append(m, g), {
								container: p,
								button: g,
								label: m
							};
						}
						addEventListener(p, m) {
							return this.onChange.addListener(m), this;
						}
						removeEventListener(p, m) {
							return this.onChange.removeListener(m), this;
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
						get key() {
							return this._key;
						}
						get keyText() {
							return this._key ? this._key?.replace("Key", "").replace("Digit", "") : w.j.get("None");
						}
						set key(p) {
							this._key !== p && (this._key = p, this.button.textContent = this.keyText, this.onChange.dispatch(this._key));
						}
					}
					function formatKeysCombo(p) {
						let m = Array.isArray(p) ? p : Array.from(p);
						return m.map((p) => p.replace("Key", "").replace("Digit", "")).join("+");
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/label.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Label });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/ui.js"), D = p([w]);
					w = (D.then ? (await D)() : D)[0];
					class Label {
						container;
						icon;
						_labelText;
						_icon;
						constructor({ labelText: p, icon: m }) {
							this._labelText = p, this._icon = m;
							let g = this.createElements();
							this.container = g.container, this.icon = g.icon;
						}
						createElements() {
							let p = w.A.createEl("vot-block", ["vot-label"]);
							p.textContent = this._labelText;
							let m = w.A.createEl("vot-block", ["vot-label-icon"]);
							return this._icon && (0, x.XX)(this._icon, m), p.appendChild(m), {
								container: p,
								icon: m
							};
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/languagePairSelect.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => LanguagePairSelect });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/localization/localizationProvider.ts"), D = g("./src/ui.js"), O = g("./src/ui/icons.ts"), A = g("./src/ui/components/select.ts"), F = p([
						w,
						D,
						A
					]);
					[w, D, A] = F.then ? (await F)() : F;
					class LanguagePairSelect {
						container;
						fromSelect;
						directionIcon;
						toSelect;
						dialogParent;
						_fromSelectTitle;
						_fromDialogTitle;
						_fromItems;
						_toSelectTitle;
						_toDialogTitle;
						_toItems;
						constructor({ from: { selectTitle: p = w.j.get("videoLanguage"), dialogTitle: m = w.j.get("videoLanguage"), items: g }, to: { selectTitle: _ = w.j.get("translationLanguage"), dialogTitle: x = w.j.get("translationLanguage"), items: D }, dialogParent: O = document.documentElement }) {
							this._fromSelectTitle = p, this._fromDialogTitle = m, this._fromItems = g, this._toSelectTitle = _, this._toDialogTitle = x, this._toItems = D, this.dialogParent = O;
							let A = this.createElements();
							this.container = A.container, this.fromSelect = A.fromSelect, this.directionIcon = A.directionIcon, this.toSelect = A.toSelect;
						}
						createElements() {
							let p = D.A.createEl("vot-block", ["vot-lang-select"]), m = new A.A({
								selectTitle: this._fromSelectTitle,
								dialogTitle: this._fromDialogTitle,
								items: this._fromItems,
								dialogParent: this.dialogParent
							}), g = D.A.createEl("vot-block", ["vot-lang-select-icon"]);
							(0, x.XX)(O.z3, g);
							let _ = new A.A({
								selectTitle: this._toSelectTitle,
								dialogTitle: this._toDialogTitle,
								items: this._toItems,
								dialogParent: this.dialogParent
							});
							return p.append(m.container, g, _.container), {
								container: p,
								fromSelect: m,
								directionIcon: g,
								toSelect: _
							};
						}
						setSelectedValues(p, m) {
							return this.fromSelect.setSelectedValue(p), this.toSelect.setSelectedValue(m), this;
						}
						updateItems(p, m) {
							return this._fromItems = p, this._toItems = m, this.fromSelect = this.fromSelect.updateItems(p), this.toSelect = this.toSelect.updateItems(m), this;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/select.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Select });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/core/eventImpl.ts"), D = g("./src/localization/localizationProvider.ts"), O = g("./src/ui.js"), A = g("./src/ui/icons.ts"), F = g("./src/ui/components/dialog.ts"), U = g("./src/ui/components/textfield.ts"), K = p([
						D,
						O,
						F,
						U
					]);
					[D, O, F, U] = K.then ? (await K)() : K;
					class Select {
						container;
						outer;
						arrowIcon;
						title;
						dialogParent;
						labelElement;
						_selectTitle;
						_dialogTitle;
						multiSelect;
						_items;
						isLoading = !1;
						isDialogOpen = !1;
						onSelectItem = new w.Z();
						onBeforeOpen = new w.Z();
						contentList;
						selectedItems = [];
						selectedValues;
						constructor({ selectTitle: p, dialogTitle: m, items: g, labelElement: _, dialogParent: x = document.documentElement, multiSelect: w }) {
							this._selectTitle = p, this._dialogTitle = m, this._items = g, this.multiSelect = w ?? !1, this.labelElement = _, this.dialogParent = x, this.selectedValues = this.calcSelectedValues();
							let D = this.createElements();
							this.container = D.container, this.outer = D.outer, this.arrowIcon = D.arrowIcon, this.title = D.title;
						}
						static genLanguageItems(p, m) {
							return p.map((p) => {
								let g = `langs.${p}`, _ = D.j.get(g);
								return {
									label: _ === g ? p.toUpperCase() : _,
									value: p,
									selected: m === p
								};
							});
						}
						multiSelectItemHandle = (p, m) => {
							let g = m.value;
							this.selectedValues.has(g) && this.selectedValues.size > 1 ? (this.selectedValues.delete(g), m.selected = !1) : (this.selectedValues.add(g), m.selected = !0), p.dataset.votSelected = this.selectedValues.has(g).toString(), this.updateSelectedState(), this.onSelectItem.dispatch(Array.from(this.selectedValues));
						};
						singleSelectItemHandle = (p) => {
							let m = p.value;
							this.selectedValues = new Set([m]);
							for (let p of this.selectedItems) p.dataset.votSelected = (p.dataset.votValue === m).toString();
							for (let p of this._items) p.selected = p.value === m;
							this.updateTitle(), this.onSelectItem.dispatch(m);
						};
						createDialogContentList() {
							let p = O.A.createEl("vot-block", ["vot-select-content-list"]);
							for (let m of this._items) {
								let g = O.A.createEl("vot-block", ["vot-select-content-item"]);
								g.textContent = m.label, g.dataset.votSelected = m.selected === !0 ? "true" : "false", g.dataset.votValue = m.value, m.disabled && (g.inert = !0), g.addEventListener("click", (p) => {
									if (!p.target.inert) return this.multiSelect ? this.multiSelectItemHandle(g, m) : this.singleSelectItemHandle(m);
								}), p.appendChild(g);
							}
							return this.selectedItems = Object.values(p.childNodes), p;
						}
						createElements() {
							let p = O.A.createEl("vot-block", ["vot-select"]);
							this.labelElement && p.append(this.labelElement);
							let m = O.A.createEl("vot-block", ["vot-select-outer"]), g = O.A.createEl("vot-block", ["vot-select-title"]);
							g.textContent = this.visibleText;
							let _ = O.A.createEl("vot-block", ["vot-select-arrow-icon"]);
							return (0, x.XX)(A.mQ, _), m.append(g, _), m.addEventListener("click", () => {
								if (!(this.isLoading || this.isDialogOpen)) try {
									this.isLoading = !0;
									let p = new F.A({
										titleHtml: this._dialogTitle,
										isTemp: !0
									});
									this.onBeforeOpen.dispatch(p), this.dialogParent.appendChild(p.container);
									let m = new U.A({ labelHtml: D.j.get("searchField") });
									m.addEventListener("input", (p) => {
										for (let m of this.selectedItems) m.hidden = !m.textContent?.toLowerCase().includes(p);
									}), this.contentList = this.createDialogContentList(), p.bodyContainer.append(m.container, this.contentList), p.addEventListener("close", () => {
										this.isDialogOpen = !1, this.selectedItems = [];
									});
								} finally {
									this.isLoading = !1;
								}
							}), p.appendChild(m), {
								container: p,
								outer: m,
								arrowIcon: _,
								title: g
							};
						}
						calcSelectedValues() {
							return new Set(this._items.filter((p) => p.selected).map((p) => p.value));
						}
						addEventListener(p, m) {
							return p === "selectItem" ? this.onSelectItem.addListener(m) : p === "beforeOpen" && this.onBeforeOpen.addListener(m), this;
						}
						removeEventListener(p, m) {
							return p === "selectItem" ? this.onSelectItem.removeListener(m) : p === "beforeOpen" && this.onBeforeOpen.removeListener(m), this;
						}
						updateTitle() {
							return this.title.textContent = this.visibleText, this;
						}
						updateSelectedState() {
							if (this.selectedItems.length > 0) for (let p of this.selectedItems) {
								let m = p.dataset.votValue;
								if (!m) continue;
								p.dataset.votSelected = this.selectedValues.has(m).toString();
							}
							return this.updateTitle(), this;
						}
						setSelectedValue(p) {
							this.multiSelect ? this.selectedValues = new Set(Array.isArray(p) ? p.map(String) : [String(p)]) : this.selectedValues = new Set([String(p)]);
							for (let p of this._items) p.selected = this.selectedValues.has(String(p.value));
							return this.updateSelectedState(), this;
						}
						updateItems(p) {
							this._items = p, this.selectedValues = this.calcSelectedValues(), this.updateSelectedState();
							let m = this.contentList?.parentElement;
							if (!this.contentList || !m) return this;
							let g = this.contentList;
							return this.contentList = this.createDialogContentList(), m.replaceChild(this.contentList, g), this;
						}
						get visibleText() {
							return this.multiSelect ? this._items.filter((p) => this.selectedValues.has(p.value)).map((p) => p.label).join(", ") ?? this._selectTitle : this._items.find((p) => p.selected)?.label ?? this._selectTitle;
						}
						set selectTitle(p) {
							this._selectTitle = p, this.updateTitle();
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/slider.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Slider });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/core/eventImpl.ts"), D = g("./src/ui.js"), O = p([D]);
					D = (O.then ? (await O)() : O)[0];
					class Slider {
						container;
						input;
						label;
						onInput = new w.Z();
						_labelHtml;
						_value;
						_min;
						_max;
						_step;
						constructor({ labelHtml: p, value: m = 50, min: g = 0, max: _ = 100, step: x = 1 }) {
							this._labelHtml = p, this._value = m, this._min = g, this._max = _, this._step = x;
							let w = this.createElements();
							this.container = w.container, this.input = w.input, this.label = w.label, this.update();
						}
						updateProgress() {
							let p = (this._value - this._min) / (this._max - this._min);
							return this.container.style.setProperty("--vot-progress", p.toString()), this;
						}
						update() {
							return this._value = this.input.valueAsNumber, this._min = +this.input.min, this._max = +this.input.max, this.updateProgress(), this;
						}
						createElements() {
							let p = D.A.createEl("vot-block", ["vot-slider"]), m = document.createElement("input");
							m.type = "range", m.min = this._min.toString(), m.max = this._max.toString(), m.step = this._step.toString(), m.value = this._value.toString();
							let g = D.A.createEl("span");
							return (0, x.XX)(this._labelHtml, g), p.append(m, g), m.addEventListener("input", () => {
								this.update(), this.onInput.dispatch(this._value, !1);
							}), {
								container: p,
								label: g,
								input: m
							};
						}
						addEventListener(p, m) {
							return this.onInput.addListener(m), this;
						}
						removeEventListener(p, m) {
							return this.onInput.removeListener(m), this;
						}
						get value() {
							return this._value;
						}
						set value(p) {
							this._value = p, this.input.value = p.toString(), this.updateProgress(), this.onInput.dispatch(this._value, !0);
						}
						get min() {
							return this._min;
						}
						set min(p) {
							this._min = p, this.input.min = this._min.toString(), this.updateProgress();
						}
						get max() {
							return this._max;
						}
						set max(p) {
							this._max = p, this.input.max = this._max.toString(), this.updateProgress();
						}
						get step() {
							return this._step;
						}
						set step(p) {
							this._step = p, this.input.step = this._step.toString();
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/sliderLabel.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => SliderLabel });
					var x = g("./src/ui.js"), w = p([x]);
					x = (w.then ? (await w)() : w)[0];
					class SliderLabel {
						container;
						strong;
						_labelText;
						_labelEOL;
						_value;
						_symbol;
						constructor({ labelText: p, labelEOL: m = "", value: g = 50, symbol: _ = "%" }) {
							this._labelText = p, this._labelEOL = m, this._value = g, this._symbol = _;
							let x = this.createElements();
							this.container = x.container, this.strong = x.strong;
						}
						createElements() {
							let p = x.A.createEl("vot-block", ["vot-slider-label"]);
							p.textContent = this.labelText;
							let m = x.A.createEl("strong", ["vot-slider-label-value"]);
							return m.textContent = this.valueText, p.append(m), {
								container: p,
								strong: m
							};
						}
						get labelText() {
							return `${this._labelText}${this._labelEOL}`;
						}
						get valueText() {
							return `${this._value}${this._symbol}`;
						}
						get value() {
							return this._value;
						}
						set value(p) {
							this._value = p, this.strong.textContent = this.valueText;
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/textfield.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Textfield });
					var x = g("./src/core/eventImpl.ts"), w = g("./src/ui.js"), D = p([w]);
					w = (D.then ? (await D)() : D)[0];
					class Textfield {
						container;
						input;
						label;
						onInput = new x.Z();
						onChange = new x.Z();
						_labelHtml;
						_multiline;
						_placeholder;
						_value;
						constructor({ labelHtml: p = "", placeholder: m = "", value: g = "", multiline: _ = !1 }) {
							this._labelHtml = p, this._multiline = _, this._placeholder = m, this._value = g;
							let x = this.createElements();
							this.container = x.container, this.input = x.input, this.label = x.label;
						}
						createElements() {
							let p = w.A.createEl("vot-block", ["vot-textfield"]), m = document.createElement(this._multiline ? "textarea" : "input");
							this._labelHtml || m.classList.add("vot-show-placeholer"), m.placeholder = this._placeholder, m.value = this._value;
							let g = w.A.createEl("span");
							return g.append(this._labelHtml), p.append(m, g), m.addEventListener("input", () => {
								this._value = this.input.value, this.onInput.dispatch(this._value);
							}), m.addEventListener("change", () => {
								this._value = this.input.value, this.onChange.dispatch(this._value);
							}), {
								container: p,
								label: g,
								input: m
							};
						}
						addEventListener(p, m) {
							return p === "change" ? this.onChange.addListener(m) : p === "input" && this.onInput.addListener(m), this;
						}
						removeEventListener(p, m) {
							return p === "change" ? this.onChange.removeListener(m) : p === "input" && this.onInput.removeListener(m), this;
						}
						get value() {
							return this._value;
						}
						set value(p) {
							this._value !== p && (this.input.value = this._value = p, this.onChange.dispatch(this._value));
						}
						get placeholder() {
							return this._placeholder;
						}
						set placeholder(p) {
							this.input.placeholder = this._placeholder = p;
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/tooltip.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => Tooltip });
					var x = g("./src/types/components/tooltip.ts"), w = g("./src/ui.js"), D = g("./src/utils/utils.ts"), O = p([w, D]);
					[w, D] = O.then ? (await O)() : O;
					class Tooltip {
						showed = !1;
						target;
						anchor;
						content;
						position;
						trigger;
						parentElement;
						layoutRoot;
						offsetX;
						offsetY;
						hidden;
						autoLayout;
						pageWidth;
						pageHeight;
						globalOffsetX;
						globalOffsetY;
						maxWidth;
						backgroundColor;
						borderRadius;
						_bordered;
						container;
						onResizeObserver;
						intersectionObserver;
						constructor({ target: p, anchor: m = void 0, content: g = "", position: _ = "top", trigger: x = "hover", offset: w = 4, maxWidth: D = void 0, hidden: O = !1, autoLayout: A = !0, backgroundColor: F = void 0, borderRadius: U = void 0, bordered: K = !0, parentElement: oe = document.body, layoutRoot: le = document.documentElement }) {
							if (!(p instanceof HTMLElement)) throw Error("target must be a valid HTMLElement");
							this.target = p, this.anchor = m instanceof HTMLElement ? m : p, this.content = g, typeof w == "number" ? this.offsetY = this.offsetX = w : (this.offsetX = w.x, this.offsetY = w.y), this.hidden = O, this.autoLayout = A, this.trigger = Tooltip.validateTrigger(x) ? x : "hover", this.position = Tooltip.validatePos(_) ? _ : "top", this.parentElement = oe, this.layoutRoot = le, this.borderRadius = U, this._bordered = K, this.maxWidth = D, this.backgroundColor = F, this.updatePageSize(), this.init();
						}
						static validatePos(p) {
							return x.X.includes(p);
						}
						static validateTrigger(p) {
							return x.G.includes(p);
						}
						setPosition(p) {
							return this.position = Tooltip.validatePos(p) ? p : "top", this.updatePos(), this;
						}
						setContent(p) {
							return this.content = p, this.destroy(), this;
						}
						onResize = () => {
							this.updatePageSize(), this.updatePos();
						};
						onClick = () => {
							this.showed ? this.destroy() : this.create();
						};
						onScroll = () => {
							requestAnimationFrame(() => {
								this.updatePageSize(), this.updatePos();
							});
						};
						onHoverPointerDown = (p) => {
							p.pointerType !== "mouse" && this.create();
						};
						onHoverPointerUp = (p) => {
							p.pointerType !== "mouse" && this.destroy();
						};
						onMouseEnter = () => {
							this.create();
						};
						onMouseLeave = () => {
							this.destroy();
						};
						updatePageSize() {
							if (this.layoutRoot !== document.documentElement) {
								let { left: p, top: m } = this.parentElement.getBoundingClientRect();
								this.globalOffsetX = p, this.globalOffsetY = m;
							} else this.globalOffsetX = 0, this.globalOffsetY = 0;
							return this.pageWidth = (this.layoutRoot.clientWidth || document.documentElement.clientWidth) + window.pageXOffset, this.pageHeight = (this.layoutRoot.clientHeight || document.documentElement.clientHeight) + window.pageYOffset, this;
						}
						onIntersect = ([p]) => {
							if (!p.isIntersecting) return this.destroy(!0);
						};
						init() {
							return this.onResizeObserver = new ResizeObserver(this.onResize), this.intersectionObserver = new IntersectionObserver(this.onIntersect), document.addEventListener("scroll", this.onScroll, {
								passive: !0,
								capture: !0
							}), this.trigger === "click" ? (this.target.addEventListener("pointerdown", this.onClick), this) : (this.target.addEventListener("mouseenter", this.onMouseEnter), this.target.addEventListener("mouseleave", this.onMouseLeave), this.target.addEventListener("pointerdown", this.onHoverPointerDown), this.target.addEventListener("pointerup", this.onHoverPointerUp), this);
						}
						release() {
							return this.destroy(), document.removeEventListener("scroll", this.onScroll, { capture: !0 }), this.trigger === "click" ? (this.target.removeEventListener("pointerdown", this.onClick), this) : (this.target.removeEventListener("mouseenter", this.onMouseEnter), this.target.removeEventListener("mouseleave", this.onMouseLeave), this.target.removeEventListener("pointerdown", this.onHoverPointerDown), this.target.removeEventListener("pointerup", this.onHoverPointerUp), this);
						}
						create() {
							return this.destroy(!0), this.showed = !0, this.container = w.A.createEl("vot-block", ["vot-tooltip"], this.content), this.bordered && this.container.classList.add("vot-tooltip-bordered"), this.container.setAttribute("role", "tooltip"), this.container.dataset.trigger = this.trigger, this.container.dataset.position = this.position, this.parentElement.appendChild(this.container), this.updatePos(), this.backgroundColor !== void 0 && (this.container.style.backgroundColor = this.backgroundColor), this.borderRadius !== void 0 && (this.container.style.borderRadius = `${this.borderRadius}px`), this.hidden && (this.container.hidden = !0), this.container.style.opacity = "1", this.onResizeObserver?.observe(this.layoutRoot), this.intersectionObserver?.observe(this.target), this;
						}
						updatePos() {
							if (!this.container) return this;
							let { top: p, left: m } = this.calcPos(this.autoLayout), g = this.pageWidth - this.offsetX * 2, _ = this.maxWidth ?? Math.min(g, this.pageWidth - Math.min(m, this.pageWidth - g));
							return this.container.style.transform = `translate(${m}px, ${p}px)`, this.container.style.maxWidth = `${_}px`, this;
						}
						calcPos(p = !0) {
							if (!this.container) return {
								top: 0,
								left: 0
							};
							let { left: m, right: g, top: _, bottom: x, width: w, height: O } = this.anchor.getBoundingClientRect(), { width: A, height: F } = this.container.getBoundingClientRect(), U = (0, D.qE)(A, 0, this.pageWidth), K = (0, D.qE)(F, 0, this.pageHeight), oe = m - this.globalOffsetX, le = g - this.globalOffsetX, ue = _ - this.globalOffsetY, we = x - this.globalOffsetY;
							switch (this.position) {
								case "top": {
									let m = (0, D.qE)(ue - K - this.offsetY, 0, this.pageHeight);
									return p && m + this.offsetY < K ? (this.position = "bottom", this.calcPos(!1)) : {
										top: m,
										left: (0, D.qE)(oe - U / 2 + w / 2, this.offsetX, this.pageWidth - U - this.offsetX)
									};
								}
								case "right": {
									let m = (0, D.qE)(le + this.offsetX, 0, this.pageWidth - U);
									return p && m + U > this.pageWidth - this.offsetX ? (this.position = "left", this.calcPos(!1)) : {
										top: (0, D.qE)(ue + (O - K) / 2, this.offsetY, this.pageHeight - K - this.offsetY),
										left: m
									};
								}
								case "bottom": {
									let m = (0, D.qE)(we + this.offsetY, 0, this.pageHeight - K);
									return p && m + K > this.pageHeight - this.offsetY ? (this.position = "top", this.calcPos(!1)) : {
										top: m,
										left: (0, D.qE)(oe - U / 2 + w / 2, this.offsetX, this.pageWidth - U - this.offsetX)
									};
								}
								case "left": {
									let m = Math.max(0, oe - U - this.offsetX);
									return p && m + U > oe - this.offsetX ? (this.position = "right", this.calcPos(!1)) : {
										top: (0, D.qE)(ue + (O - K) / 2, this.offsetY, this.pageHeight - K - this.offsetY),
										left: m
									};
								}
								default: return {
									top: 0,
									left: 0
								};
							}
						}
						destroy(p = !1) {
							if (!this.container) return this;
							if (this.showed = !1, this.onResizeObserver?.disconnect(), this.intersectionObserver?.disconnect(), p) return this.container.remove(), this;
							let m = this.container;
							return m.style.opacity = "0", m.addEventListener("transitionend", () => {
								m?.remove();
							}, { once: !0 }), this;
						}
						set bordered(p) {
							this._bordered = p, this.container?.classList.toggle("vot-tooltip-bordered");
						}
						get bordered() {
							return this._bordered;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/votButton.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => VOTButton });
					var x = g("./node_modules/lit-html/lit-html.js"), w = g("./src/ui.js"), D = g("./src/ui/icons.ts"), O = p([w]);
					w = (O.then ? (await O)() : O)[0];
					class VOTButton {
						container;
						translateButton;
						separator;
						pipButton;
						separator2;
						menuButton;
						label;
						_position;
						_direction;
						_status;
						_labelHtml;
						constructor({ position: p = "default", direction: m = "default", status: g = "none", labelHtml: _ = "" }) {
							this._position = p, this._direction = m, this._status = g, this._labelHtml = _;
							let x = this.createElements();
							this.container = x.container, this.translateButton = x.translateButton, this.separator = x.separator, this.pipButton = x.pipButton, this.separator2 = x.separator2, this.menuButton = x.menuButton, this.label = x.label;
						}
						static calcPosition(p, m) {
							return m ? p <= 44 ? "left" : p >= 66 ? "right" : "default" : "default";
						}
						static calcDirection(p) {
							return ["default", "top"].includes(p) ? "row" : "column";
						}
						createElements() {
							let p = w.A.createEl("vot-block", ["vot-segmented-button"]);
							p.dataset.position = this._position, p.dataset.direction = this._direction, p.dataset.status = this._status;
							let m = w.A.createEl("vot-block", ["vot-segment", "vot-translate-button"]);
							(0, x.XX)(D.cg, m);
							let g = w.A.createEl("span", ["vot-segment-label"]);
							g.append(this._labelHtml), m.appendChild(g);
							let _ = w.A.createEl("vot-block", ["vot-separator"]), O = w.A.createEl("vot-block", ["vot-segment-only-icon"]);
							(0, x.XX)(D.B9, O);
							let A = w.A.createEl("vot-block", ["vot-separator"]), F = w.A.createEl("vot-block", ["vot-segment-only-icon"]);
							return (0, x.XX)(D.kO, F), p.append(m, _, O, A, F), {
								container: p,
								translateButton: m,
								separator: _,
								pipButton: O,
								separator2: A,
								menuButton: F,
								label: g
							};
						}
						showPiPButton(p) {
							return this.separator2.hidden = this.pipButton.hidden = !p, this;
						}
						setText(p) {
							return this._labelHtml = this.label.textContent = p, this;
						}
						remove() {
							return this.container.remove(), this;
						}
						get tooltipPos() {
							switch (this.position) {
								case "left": return "right";
								case "right": return "left";
								default: return "bottom";
							}
						}
						set status(p) {
							this._status = this.container.dataset.status = p;
						}
						get status() {
							return this._status;
						}
						set loading(p) {
							this.container.dataset.loading = p.toString();
						}
						get loading() {
							return this.container.dataset.loading === "true";
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
						get position() {
							return this._position;
						}
						set position(p) {
							this._position = this.container.dataset.position = p;
						}
						get direction() {
							return this._direction;
						}
						set direction(p) {
							this._direction = this.container.dataset.direction = p;
						}
						set opacity(p) {
							this.container.style.opacity = p.toString();
						}
						get opacity() {
							return Number(this.container.style.opacity);
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/components/votMenu.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { A: () => VOTMenu });
					var x = g("./src/ui.js"), w = p([x]);
					x = (w.then ? (await w)() : w)[0];
					class VOTMenu {
						container;
						contentWrapper;
						headerContainer;
						bodyContainer;
						footerContainer;
						titleContainer;
						title;
						_position;
						_titleHtml;
						constructor({ position: p = "default", titleHtml: m = "" }) {
							this._position = p, this._titleHtml = m;
							let g = this.createElements();
							this.container = g.container, this.contentWrapper = g.contentWrapper, this.headerContainer = g.headerContainer, this.bodyContainer = g.bodyContainer, this.footerContainer = g.footerContainer, this.titleContainer = g.titleContainer, this.title = g.title;
						}
						createElements() {
							let p = x.A.createEl("vot-block", ["vot-menu"]);
							p.hidden = !0, p.dataset.position = this._position;
							let m = x.A.createEl("vot-block", ["vot-menu-content-wrapper"]);
							p.appendChild(m);
							let g = x.A.createEl("vot-block", ["vot-menu-header-container"]), _ = x.A.createEl("vot-block", ["vot-menu-title-container"]);
							g.appendChild(_);
							let w = x.A.createEl("vot-block", ["vot-menu-title"]);
							w.append(this._titleHtml), _.appendChild(w);
							let D = x.A.createEl("vot-block", ["vot-menu-body-container"]), O = x.A.createEl("vot-block", ["vot-menu-footer-container"]);
							return m.append(g, D, O), {
								container: p,
								contentWrapper: m,
								headerContainer: g,
								bodyContainer: D,
								footerContainer: O,
								titleContainer: _,
								title: w
							};
						}
						setText(p) {
							return this._titleHtml = this.title.textContent = p, this;
						}
						remove() {
							return this.container.remove(), this;
						}
						set hidden(p) {
							this.container.hidden = p;
						}
						get hidden() {
							return this.container.hidden;
						}
						get position() {
							return this._position;
						}
						set position(p) {
							this._position = this.container.dataset.position = p;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/icons.ts": (p, m, g) => {
			"use strict";
			g.d(m, {
				B9: () => w,
				GA: () => je,
				M9: () => we,
				U0: () => A,
				Xd: () => le,
				c1: () => F,
				cg: () => x,
				jr: () => oe,
				kO: () => D,
				mQ: () => U,
				nO: () => O,
				w2: () => ue,
				z3: () => K
			});
			var _ = g("./node_modules/lit-html/lit-html.js");
			let x = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path
    id="vot-translate-icon"
    fill-rule="evenodd"
    d="M15.778 18.95L14.903 21.375C14.8364 21.5583 14.7197 21.7083 14.553 21.825C14.3864 21.9417 14.203 22 14.003 22C13.6697 22 13.3989 21.8625 13.1905 21.5875C12.9822 21.3125 12.9447 21.0083 13.078 20.675L16.878 10.625C16.9614 10.4417 17.0864 10.2917 17.253 10.175C17.4197 10.0583 17.603 10 17.803 10H18.553C18.753 10 18.9364 10.0583 19.103 10.175C19.2697 10.2917 19.3947 10.4417 19.478 10.625L23.278 20.7C23.4114 21.0167 23.378 21.3125 23.178 21.5875C22.978 21.8625 22.7114 22 22.378 22C22.1614 22 21.9739 21.9375 21.8155 21.8125C21.6572 21.6875 21.5364 21.525 21.453 21.325L20.628 18.95H15.778ZM19.978 17.2H16.378L18.228 12.25L19.978 17.2Z"
  ></path>
  <path
    d="M9 14L4.7 18.3C4.51667 18.4833 4.28333 18.575 4 18.575C3.71667 18.575 3.48333 18.4833 3.3 18.3C3.11667 18.1167 3.025 17.8833 3.025 17.6C3.025 17.3167 3.11667 17.0833 3.3 16.9L7.65 12.55C7.01667 11.85 6.4625 11.125 5.9875 10.375C5.5125 9.625 5.1 8.83333 4.75 8H6.85C7.15 8.6 7.47083 9.14167 7.8125 9.625C8.15417 10.1083 8.56667 10.6167 9.05 11.15C9.78333 10.35 10.3917 9.52917 10.875 8.6875C11.3583 7.84583 11.7667 6.95 12.1 6H2C1.71667 6 1.47917 5.90417 1.2875 5.7125C1.09583 5.52083 1 5.28333 1 5C1 4.71667 1.09583 4.47917 1.2875 4.2875C1.47917 4.09583 1.71667 4 2 4H8V3C8 2.71667 8.09583 2.47917 8.2875 2.2875C8.47917 2.09583 8.71667 2 9 2C9.28333 2 9.52083 2.09583 9.7125 2.2875C9.90417 2.47917 10 2.71667 10 3V4H16C16.2833 4 16.5208 4.09583 16.7125 4.2875C16.9042 4.47917 17 4.71667 17 5C17 5.28333 16.9042 5.52083 16.7125 5.7125C16.5208 5.90417 16.2833 6 16 6H14.1C13.75 7.18333 13.275 8.33333 12.675 9.45C12.075 10.5667 11.3333 11.6167 10.45 12.6L12.85 15.05L12.1 17.1L9 14Z"
  ></path>
  <path
    id="vot-loading-icon"
    style="display:none"
    d="M19.8081 16.3697L18.5842 15.6633V13.0832C18.5842 12.9285 18.5228 12.7801 18.4134 12.6707C18.304 12.5613 18.1556 12.4998 18.0009 12.4998C17.8462 12.4998 17.6978 12.5613 17.5884 12.6707C17.479 12.7801 17.4176 12.9285 17.4176 13.0832V15.9998C17.4176 16.1022 17.4445 16.2028 17.4957 16.2915C17.5469 16.3802 17.6205 16.4538 17.7092 16.505L19.2247 17.38C19.2911 17.4189 19.3645 17.4443 19.4407 17.4547C19.5169 17.4652 19.5945 17.4604 19.6688 17.4407C19.7432 17.4211 19.813 17.3869 19.8741 17.3402C19.9352 17.2934 19.9864 17.2351 20.0249 17.1684C20.0634 17.1018 20.0883 17.0282 20.0982 16.952C20.1081 16.8757 20.1028 16.7982 20.0827 16.7239C20.0625 16.6497 20.0279 16.5802 19.9808 16.5194C19.9336 16.4586 19.8749 16.4077 19.8081 16.3697ZM18.0015 10C16.8478 10 15.6603 10.359 14.7011 11C13.7418 11.641 12.9415 12.4341 12.5 13.5C12.0585 14.5659 11.8852 16.0369 12.1103 17.1684C12.3353 18.3 12.8736 19.4942 13.6894 20.31C14.5053 21.1258 15.8684 21.7749 17 22C18.1316 22.2251 19.4341 21.9415 20.5 21.5C21.5659 21.0585 22.359 20.2573 23 19.298C23.641 18.3387 24.0015 17.1537 24.0015 16C23.9998 14.4534 23.5951 13.0936 22.5015 12C21.4079 10.9064 19.5481 10.0017 18.0015 10ZM18.0009 20.6665C17.0779 20.6665 16.1757 20.3928 15.4082 19.88C14.6408 19.3672 14.0427 18.6384 13.6894 17.7857C13.3362 16.933 13.2438 15.9947 13.4239 15.0894C13.604 14.1842 14.0484 13.3527 14.7011 12.7C15.3537 12.0474 16.1852 11.6029 17.0905 11.4228C17.9957 11.2428 18.934 11.3352 19.7867 11.6884C20.6395 12.0416 21.3683 12.6397 21.8811 13.4072C22.3939 14.1746 22.6676 15.0769 22.6676 15.9998C22.666 17.237 22.1738 18.4231 21.299 19.298C20.4242 20.1728 19.2381 20.665 18.0009 20.6665Z"
  ></path>
</svg>`, w = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
  <path
    d="M120-520q-17 0-28.5-11.5T80-560q0-17 11.5-28.5T120-600h104L80-743q-12-12-12-28.5T80-800q12-12 28.5-12t28.5 12l143 144v-104q0-17 11.5-28.5T320-800q17 0 28.5 11.5T360-760v200q0 17-11.5 28.5T320-520H120Zm40 360q-33 0-56.5-23.5T80-240v-160q0-17 11.5-28.5T120-440q17 0 28.5 11.5T160-400v160h280q17 0 28.5 11.5T480-200q0 17-11.5 28.5T440-160H160Zm680-280q-17 0-28.5-11.5T800-480v-240H480q-17 0-28.5-11.5T440-760q0-17 11.5-28.5T480-800h320q33 0 56.5 23.5T880-720v240q0 17-11.5 28.5T840-440ZM600-160q-17 0-28.5-11.5T560-200v-120q0-17 11.5-28.5T600-360h240q17 0 28.5 11.5T880-320v120q0 17-11.5 28.5T840-160H600Z"
  />
</svg>`, D = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
  <path
    d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"
  />
</svg>`, O = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="100%" viewBox="0 0 24 24" class="vot-loader" id="vot-loader-download">
  <path class="vot-loader-main" d="M12 15.575C11.8667 15.575 11.7417 15.5542 11.625 15.5125C11.5083 15.4708 11.4 15.4 11.3 15.3L7.7 11.7C7.5 11.5 7.40417 11.2667 7.4125 11C7.42083 10.7333 7.51667 10.5 7.7 10.3C7.9 10.1 8.1375 9.99583 8.4125 9.9875C8.6875 9.97917 8.925 10.075 9.125 10.275L11 12.15V5C11 4.71667 11.0958 4.47917 11.2875 4.2875C11.4792 4.09583 11.7167 4 12 4C12.2833 4 12.5208 4.09583 12.7125 4.2875C12.9042 4.47917 13 4.71667 13 5V12.15L14.875 10.275C15.075 10.075 15.3125 9.97917 15.5875 9.9875C15.8625 9.99583 16.1 10.1 16.3 10.3C16.4833 10.5 16.5792 10.7333 16.5875 11C16.5958 11.2667 16.5 11.5 16.3 11.7L12.7 15.3C12.6 15.4 12.4917 15.4708 12.375 15.5125C12.2583 15.5542 12.1333 15.575 12 15.575ZM6 20C5.45 20 4.97917 19.8042 4.5875 19.4125C4.19583 19.0208 4 18.55 4 18V16C4 15.7167 4.09583 15.4792 4.2875 15.2875C4.47917 15.0958 4.71667 15 5 15C5.28333 15 5.52083 15.0958 5.7125 15.2875C5.90417 15.4792 6 15.7167 6 16V18H18V16C18 15.7167 18.0958 15.4792 18.2875 15.2875C18.4792 15.0958 18.7167 15 19 15C19.2833 15 19.5208 15.0958 19.7125 15.2875C19.9042 15.4792 20 15.7167 20 16V18C20 18.55 19.8042 19.0208 19.4125 19.4125C19.0208 19.8042 18.55 20 18 20H6Z"/>
  <text class="vot-loader-text" dominant-baseline="middle" text-anchor="middle" x="50%" y="50%"></text>
</svg>`, A = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="100%" viewBox="0 0 24 24">
  <path d="M4 20q-.825 0-1.413-.588T2 18V6q0-.825.588-1.413T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.588 1.413T20 20H4Zm2-4h8v-2H6v2Zm10 0h2v-2h-2v2ZM6 12h2v-2H6v2Zm4 0h8v-2h-8v2Z"/>
</svg>`, F = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="100%" viewBox="0 -960 960 960">
  <path d="M555-80H405q-15 0-26-10t-13-25l-12-93q-13-5-24.5-12T307-235l-87 36q-14 5-28 1t-22-17L96-344q-8-13-5-28t15-24l75-57q-1-7-1-13.5v-27q0-6.5 1-13.5l-75-57q-12-9-15-24t5-28l74-129q7-14 21.5-17.5T220-761l87 36q11-8 23-15t24-12l12-93q2-15 13-25t26-10h150q15 0 26 10t13 25l12 93q13 5 24.5 12t22.5 15l87-36q14-5 28-1t22 17l74 129q8 13 5 28t-15 24l-75 57q1 7 1 13.5v27q0 6.5-2 13.5l75 57q12 9 15 24t-5 28l-74 128q-8 13-22.5 17.5T738-199l-85-36q-11 8-23 15t-24 12l-12 93q-2 15-13 25t-26 10Zm-73-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm0-80q-25 0-42.5-17.5T422-480q0-25 17.5-42.5T482-540q25 0 42.5 17.5T542-480q0 25-17.5 42.5T482-420Zm-2-60Zm-40 320h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Z"/>
</svg>`, U = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" >
  <path
    d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062Z"
  />
</svg>`, K = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
  <path
    d="M647-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h447L451-716q-12-12-11.5-28t12.5-28q12-11 28-11.5t28 11.5l264 264q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L508-188q-11 11-27.5 11T452-188q-12-12-12-28.5t12-28.5l195-195Z"
  />
</svg>`, oe = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="100%" viewBox="0 -960 960 960">
  <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/>
</svg>`, le = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g fill="none">
    <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 11a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0-9a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1"/>
  </g>
</svg>`, ue = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g fill="none">
    <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 12a1 1 0 1 1 0 2a1 1 0 0 1 0-2m0-9.5a3.625 3.625 0 0 1 1.348 6.99a.8.8 0 0 0-.305.201c-.044.05-.051.114-.05.18L13 14a1 1 0 0 1-1.993.117L11 14v-.25c0-1.153.93-1.845 1.604-2.116a1.626 1.626 0 1 0-2.229-1.509a1 1 0 1 1-2 0A3.625 3.625 0 0 1 12 6.5"/>
  </g>
</svg>`, we = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g fill="none">
    <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/>
    <path fill="currentColor" d="M20 9a1 1 0 0 1 1 1v1a8 8 0 0 1-8 8H9.414l.793.793a1 1 0 0 1-1.414 1.414l-2.496-2.496a1 1 0 0 1-.287-.567L6 17.991a1 1 0 0 1 .237-.638l.056-.06l2.5-2.5a1 1 0 0 1 1.414 1.414L9.414 17H13a6 6 0 0 0 6-6v-1a1 1 0 0 1 1-1m-4.793-6.207l2.5 2.5a1 1 0 0 1 0 1.414l-2.5 2.5a1 1 0 1 1-1.414-1.414L14.586 7H11a6 6 0 0 0-6 6v1a1 1 0 1 1-2 0v-1a8 8 0 0 1 8-8h3.586l-.793-.793a1 1 0 0 1 1.414-1.414"/>
  </g>
</svg>`, je = (0, _.JW)`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="currentColor" d="M7 15q1.25 0 2.125-.875T10 12t-.875-2.125T7 9t-2.125.875T4 12t.875 2.125T7 15m0 3q-2.5 0-4.25-1.75T1 12t1.75-4.25T7 6q2.025 0 3.538 1.15T12.65 10h8.375L23 11.975l-3.5 4L17 14l-2 2l-2-2h-.35q-.625 1.8-2.175 2.9T7 18"/>
  </svg>`;
		},
		"./src/ui/manager.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { o: () => UIManager });
					var x = g("./node_modules/@vot.js/shared/dist/utils/subs.js"), w = g("./src/ui.js"), D = g("./src/config/config.js"), O = g("./src/localization/localizationProvider.ts"), A = g("./src/utils/VOTLocalizedError.js"), F = g("./src/utils/debug.ts"), U = g("./src/utils/gm.ts"), K = g("./src/utils/storage.ts"), oe = g("./src/utils/utils.ts"), le = g("./src/ui/components/votButton.ts"), ue = g("./src/ui/views/overlay.ts"), we = g("./src/ui/views/settings.ts"), je = p([
						w,
						O,
						A,
						U,
						K,
						oe,
						le,
						ue,
						we
					]);
					[w, O, A, U, K, oe, le, ue, we] = je.then ? (await je)() : je;
					class UIManager {
						root;
						portalContainer;
						tooltipLayoutRoot;
						initialized = !1;
						videoHandler;
						data;
						votGlobalPortal;
						votOverlayView;
						votSettingsView;
						constructor({ root: p, portalContainer: m, tooltipLayoutRoot: g, data: _ = {}, videoHandler: x }) {
							this.root = p, this.portalContainer = m, this.tooltipLayoutRoot = g, this.videoHandler = x, this.data = _;
						}
						isInitialized() {
							return this.initialized;
						}
						initUI() {
							if (this.isInitialized()) throw Error("[VOT] UIManager is already initialized");
							return this.initialized = !0, this.votGlobalPortal = w.A.createPortal(), document.documentElement.appendChild(this.votGlobalPortal), this.votOverlayView = new ue.i({
								root: this.root,
								portalContainer: this.portalContainer,
								tooltipLayoutRoot: this.tooltipLayoutRoot,
								globalPortal: this.votGlobalPortal,
								data: this.data,
								videoHandler: this.videoHandler
							}), this.votOverlayView.initUI(), this.votSettingsView = new we.r({
								globalPortal: this.votGlobalPortal,
								data: this.data,
								videoHandler: this.videoHandler
							}), this.votSettingsView.initUI(), this;
						}
						initUIEvents() {
							if (!this.isInitialized()) throw Error("[VOT] UIManager isn't initialized");
							this.votOverlayView.initUIEvents(), this.votOverlayView.addEventListener("click:translate", async () => {
								await this.handleTranslationBtnClick();
							}).addEventListener("click:pip", async () => {
								if (!this.videoHandler) return;
								let p = this.videoHandler.video === document.pictureInPictureElement;
								await (p ? document.exitPictureInPicture() : this.videoHandler.video.requestPictureInPicture());
							}).addEventListener("click:settings", async () => {
								this.videoHandler?.subtitlesWidget.releaseTooltip(), this.votSettingsView.open(), await (0, oe.Eh)();
							}).addEventListener("click:downloadTranslation", async () => {
								if (!(!this.votOverlayView.isInitialized() || !this.videoHandler?.downloadTranslationUrl || !this.videoHandler.videoData)) {
									try {
										if (!this.data.downloadWithName || !U.yx) return (0, oe.Wo)(this.videoHandler.downloadTranslationUrl);
										this.votOverlayView.downloadTranslationButton.progress = 0;
										let p = await (0, U.G3)(this.videoHandler.downloadTranslationUrl, { timeout: 0 });
										if (!p.ok) throw Error(`HTTP ${p.status}`);
										let m = (0, oe.Le)(this.videoHandler.videoData.downloadTitle);
										await (0, oe.MR)(p, m, (p) => {
											this.votOverlayView.downloadTranslationButton.progress = p;
										});
									} catch (p) {
										console.warn("[VOT] Download translation failed:", p), (0, oe.Wo)(this.videoHandler.downloadTranslationUrl);
									}
									this.votOverlayView.downloadTranslationButton.progress = 0;
								}
							}).addEventListener("click:downloadSubtitles", async () => {
								if (!this.videoHandler || !this.videoHandler.yandexSubtitles || !this.videoHandler.videoData) return;
								let p = this.data.subtitlesDownloadFormat ?? "json", m = (0, x.vk)(this.videoHandler.yandexSubtitles, p), g = new Blob([p === "json" ? JSON.stringify(m) : m], { type: "text/plain" }), _ = this.data.downloadWithName ? (0, oe.Le)(this.videoHandler.videoData.downloadTitle) : `subtitles_${this.videoHandler.videoData.videoId}`;
								(0, oe.WN)(g, `${_}.${p}`);
							}).addEventListener("input:videoVolume", (p) => {
								this.videoHandler && (this.videoHandler.setVideoVolume(p / 100), this.data.syncVolume && this.videoHandler.syncVolumeWrapper("video", p));
							}).addEventListener("input:translationVolume", () => {
								if (!this.videoHandler) return;
								let p = this.data.defaultVolume ?? 100;
								this.videoHandler.audioPlayer.player.volume = p / 100, this.data.syncVolume && (this.videoHandler.syncVolumeWrapper("translation", p), ["youtube", "googledrive"].includes(this.videoHandler.site.host) && this.videoHandler.site.additionalData !== "mobile" && this.videoHandler.setVideoVolume(this.videoHandler.tempOriginalVolume / 100));
							}).addEventListener("select:subtitles", async (p) => {
								await this.videoHandler?.changeSubtitlesLang(p);
							}), this.votSettingsView.initUIEvents(), this.votSettingsView.addEventListener("update:account", async (p) => {
								this.videoHandler && (this.videoHandler.votClient.apiToken = p?.token);
							}).addEventListener("change:autoTranslate", async (p) => {
								p && this.videoHandler && !this.videoHandler?.hasActiveSource() && await this.handleTranslationBtnClick();
							}).addEventListener("change:showVideoVolume", () => {
								this.votOverlayView.isInitialized() && (this.votOverlayView.videoVolumeSlider.container.hidden = !this.data.showVideoSlider || this.votOverlayView.votButton.status !== "success");
							}).addEventListener("change:audioBuster", async () => {
								if (!this.votOverlayView.isInitialized()) return;
								let p = this.votOverlayView.translationVolumeSlider.value;
								this.votOverlayView.translationVolumeSlider.max = this.data.audioBooster ? D.T8 : 100, this.votOverlayView.translationVolumeSlider.value = (0, oe.qE)(p, 0, 100);
							}).addEventListener("change:useLivelyVoice", () => {
								this.videoHandler?.stopTranslate();
							}).addEventListener("change:subtitlesHighlightWords", (p) => {
								this.videoHandler?.subtitlesWidget.setHighlightWords(this.data.highlightWords ?? p);
							}).addEventListener("input:subtitlesMaxLength", (p) => {
								this.videoHandler?.subtitlesWidget.setMaxLength(this.data.subtitlesMaxLength ?? p);
							}).addEventListener("input:subtitlesFontSize", (p) => {
								this.videoHandler?.subtitlesWidget.setFontSize(this.data.subtitlesFontSize ?? p);
							}).addEventListener("input:subtitlesBackgroundOpacity", (p) => {
								this.videoHandler?.subtitlesWidget.setOpacity(this.data.subtitlesOpacity ?? p);
							}).addEventListener("change:proxyWorkerHost", (p) => {
								!this.data.translateProxyEnabled || !this.videoHandler || (this.videoHandler.votClient.host = this.data.proxyWorkerHost ?? p);
							}).addEventListener("select:proxyTranslationStatus", () => {
								this.videoHandler?.initVOTClient();
							}).addEventListener("change:useNewAudioPlayer", () => {
								this.videoHandler && (this.videoHandler.stopTranslate(), this.videoHandler.createPlayer());
							}).addEventListener("change:onlyBypassMediaCSP", () => {
								this.videoHandler && (this.videoHandler.stopTranslate(), this.videoHandler.createPlayer());
							}).addEventListener("select:translationTextService", () => {
								this.videoHandler && (this.videoHandler.subtitlesWidget.strTranslatedTokens = "", this.videoHandler.subtitlesWidget.releaseTooltip());
							}).addEventListener("change:showPiPButton", () => {
								this.votOverlayView.isInitialized() && (this.votOverlayView.votButton.pipButton.hidden = this.votOverlayView.votButton.separator2.hidden = !this.votOverlayView.pipButtonVisible);
							}).addEventListener("select:buttonPosition", (p) => {
								if (!this.votOverlayView.isInitialized()) return;
								let m = this.data.buttonPos ?? p;
								this.votOverlayView.updateButtonLayout(m, le.A.calcDirection(m));
							}).addEventListener("select:menuLanguage", async () => {
								await this.reloadMenu();
							}).addEventListener("click:bugReport", () => {
								if (!this.videoHandler) return;
								let p = new URLSearchParams(this.videoHandler.collectReportInfo()).toString();
								window.open(`${D.Ek}/issues/new?${p}`, "_blank")?.focus();
							}).addEventListener("click:resetSettings", async () => {
								let p = await K.d.list();
								await Promise.all(p.map(async (p) => await K.d.delete(p))), await K.d.set("compatVersion", D.r4), window.location.reload();
							});
						}
						async reloadMenu() {
							if (!this.votOverlayView?.isInitialized()) throw Error("[VOT] OverlayView isn't initialized");
							if (this.videoHandler?.stopTranslation(), this.release(), this.initUI(), this.initUIEvents(), !this.videoHandler) return this;
							await this.videoHandler.updateSubtitlesLangSelect(), this.videoHandler.subtitlesWidget.portal = this.votOverlayView.votOverlayPortal, this.videoHandler.subtitlesWidget.strTranslatedTokens = "";
						}
						async handleTranslationBtnClick() {
							if (!this.votOverlayView?.isInitialized()) throw Error("[VOT] OverlayView isn't initialized");
							if (!this.videoHandler) return this;
							if (F.A.log("[handleTranslationBtnClick] click translationBtn"), this.videoHandler.hasActiveSource()) return F.A.log("[handleTranslationBtnClick] video has active source"), this.videoHandler.stopTranslation(), this;
							if (this.votOverlayView.votButton.status !== "none" || this.votOverlayView.votButton.loading) return F.A.log("[handleTranslationBtnClick] translationBtn isn't in none state"), this.videoHandler.actionsAbortController.abort(), this.videoHandler.stopTranslation(), this;
							try {
								if (F.A.log("[handleTranslationBtnClick] trying execute translation"), !this.videoHandler.videoData?.videoId) throw new A.n("VOTNoVideoIDFound");
								(this.videoHandler.site.host === "vk" && this.videoHandler.site.additionalData === "clips" || this.videoHandler.site.host === "douyin") && (this.videoHandler.videoData = await this.videoHandler.getVideoData()), F.A.log("[handleTranslationBtnClick] Run translateFunc", this.videoHandler.videoData.videoId), await this.videoHandler.translateFunc(this.videoHandler.videoData.videoId, this.videoHandler.videoData.isStream, this.videoHandler.videoData.detectedLanguage, this.videoHandler.videoData.responseLanguage, this.videoHandler.videoData.translationHelp);
							} catch (p) {
								if (console.warn("[VOT]", p), !(p instanceof Error)) return this.transformBtn("error", String(p)), this;
								let m = p.name === "VOTLocalizedError" ? p.localizedMessage : p.message;
								this.transformBtn("error", m);
							}
							return this;
						}
						isLoadingText(p) {
							return typeof p == "string" && (p.includes(O.j.get("translationTake")) || p.includes(O.j.get("TranslationDelayed")));
						}
						transformBtn(p, m) {
							if (!this.votOverlayView?.isInitialized()) throw Error("[VOT] OverlayView isn't initialized");
							return this.votOverlayView.votButton.status = p, this.votOverlayView.votButton.loading = p === "error" && this.isLoadingText(m), this.votOverlayView.votButton.setText(m), this.votOverlayView.votButtonTooltip.setContent(m), this;
						}
						releaseUI(p = !1) {
							if (!this.isInitialized()) throw Error("[VOT] UIManager isn't initialized");
							return this.votOverlayView.releaseUI(!0), this.votSettingsView.releaseUI(!0), this.votGlobalPortal.remove(), this.initialized = p, this;
						}
						releaseUIEvents(p = !1) {
							if (!this.isInitialized()) throw Error("[VOT] UIManager isn't initialized");
							return this.votOverlayView.releaseUIEvents(!1), this.votSettingsView.releaseUIEvents(!1), this.initialized = p, this;
						}
						release() {
							return this.releaseUI(!0), this.releaseUIEvents(!1), this;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/views/overlay.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { i: () => OverlayView });
					var x = g("./node_modules/@vot.js/shared/dist/data/consts.js"), w = g("./src/ui.js"), D = g("./src/ui/components/languagePairSelect.ts"), O = g("./src/ui/components/select.ts"), A = g("./src/ui/components/slider.ts"), F = g("./src/ui/components/sliderLabel.ts"), U = g("./src/ui/components/tooltip.ts"), K = g("./src/ui/components/votButton.ts"), oe = g("./src/ui/components/votMenu.ts"), le = g("./src/ui/icons.ts"), ue = g("./src/config/config.js"), we = g("./src/core/eventImpl.ts"), je = g("./src/localization/localizationProvider.ts"), Ie = g("./src/utils/storage.ts"), Be = g("./src/utils/utils.ts"), Ve = g("./src/ui/components/downloadButton.ts"), Ue = g("./src/ui/components/label.ts"), We = p([
						w,
						D,
						O,
						A,
						F,
						U,
						K,
						oe,
						je,
						Ie,
						Be,
						Ve,
						Ue
					]);
					[w, D, O, A, F, U, K, oe, je, Ie, Be, Ve, Ue] = We.then ? (await We)() : We;
					class OverlayView {
						root;
						tooltipLayoutRoot;
						portalContainer;
						globalPortal;
						dragging = !1;
						initialized = !1;
						data;
						videoHandler;
						cancelDraggingEvents = ["pointercancel", "touchcancel"];
						onClickSettings = new we.Z();
						onClickPiP = new we.Z();
						onClickTranslate = new we.Z();
						onClickDownloadTranslation = new we.Z();
						onClickDownloadSubtitles = new we.Z();
						onSelectFromLanguage = new we.Z();
						onSelectToLanguage = new we.Z();
						onSelectSubtitles = new we.Z();
						onInputVideoVolume = new we.Z();
						onInputTranslationVolume = new we.Z();
						votOverlayPortal;
						votButton;
						votButtonTooltip;
						votMenu;
						downloadTranslationButton;
						downloadSubtitlesButton;
						openSettingsButton;
						languagePairSelect;
						subtitlesSelectLabel;
						subtitlesSelect;
						videoVolumeSliderLabel;
						videoVolumeSlider;
						tranlsationVolumeSliderLabel;
						translationVolumeSlider;
						constructor({ root: p, portalContainer: m, tooltipLayoutRoot: g, globalPortal: _, data: x = {}, videoHandler: w }) {
							this.root = p, this.portalContainer = m, this.tooltipLayoutRoot = g, this.globalPortal = _, this.data = x, this.videoHandler = w;
						}
						isInitialized() {
							return this.initialized;
						}
						calcButtonLayout(p) {
							return this.isBigContainer && ["left", "right"].includes(p) ? {
								direction: "column",
								position: p
							} : {
								direction: "row",
								position: "default"
							};
						}
						addEventListener(p, m) {
							switch (p) {
								case "click:settings":
									this.onClickSettings.addListener(m);
									break;
								case "click:pip":
									this.onClickPiP.addListener(m);
									break;
								case "click:downloadTranslation":
									this.onClickDownloadTranslation.addListener(m);
									break;
								case "click:downloadSubtitles":
									this.onClickDownloadSubtitles.addListener(m);
									break;
								case "click:translate":
									this.onClickTranslate.addListener(m);
									break;
								case "input:videoVolume":
									this.onInputVideoVolume.addListener(m);
									break;
								case "input:translationVolume":
									this.onInputTranslationVolume.addListener(m);
									break;
								case "select:fromLanguage":
									this.onSelectFromLanguage.addListener(m);
									break;
								case "select:toLanguage":
									this.onSelectToLanguage.addListener(m);
									break;
								case "select:subtitles":
									this.onSelectSubtitles.addListener(m);
									break;
							}
							return this;
						}
						removeEventListener(p, m) {
							switch (p) {
								case "click:settings":
									this.onClickSettings.removeListener(m);
									break;
								case "click:pip":
									this.onClickPiP.removeListener(m);
									break;
								case "click:downloadTranslation":
									this.onClickDownloadTranslation.removeListener(m);
									break;
								case "click:downloadSubtitles":
									this.onClickDownloadSubtitles.removeListener(m);
									break;
								case "click:translate":
									this.onClickTranslate.removeListener(m);
									break;
								case "input:videoVolume":
									this.onInputVideoVolume.removeListener(m);
									break;
								case "input:translationVolume":
									this.onInputTranslationVolume.removeListener(m);
									break;
								case "select:fromLanguage":
									this.onSelectFromLanguage.removeListener(m);
									break;
								case "select:toLanguage":
									this.onSelectToLanguage.removeListener(m);
									break;
								case "select:subtitles":
									this.onSelectSubtitles.removeListener(m);
									break;
							}
							return this;
						}
						initUI(p = "default") {
							if (this.isInitialized()) throw Error("[VOT] OverlayView is already initialized");
							this.initialized = !0;
							let { position: m, direction: g } = this.calcButtonLayout(p);
							this.votOverlayPortal = w.A.createPortal(!0), this.portalContainer.appendChild(this.votOverlayPortal), this.votButton = new K.A({
								position: m,
								direction: g,
								status: "none",
								labelHtml: je.j.get("translateVideo")
							}), this.votButton.opacity = 0, this.pipButtonVisible || this.votButton.showPiPButton(!1), this.root.appendChild(this.votButton.container), this.votButtonTooltip = new U.A({
								target: this.votButton.translateButton,
								content: je.j.get("translateVideo"),
								position: this.votButton.tooltipPos,
								hidden: g === "row",
								bordered: !1,
								parentElement: this.votOverlayPortal,
								layoutRoot: this.tooltipLayoutRoot
							}), this.votMenu = new oe.A({
								titleHtml: je.j.get("VOTSettings"),
								position: m
							}), this.root.appendChild(this.votMenu.container), this.downloadTranslationButton = new Ve.A(), this.downloadTranslationButton.hidden = !0, this.downloadSubtitlesButton = w.A.createIconButton(le.U0), this.downloadSubtitlesButton.hidden = !0, this.openSettingsButton = w.A.createIconButton(le.c1), this.votMenu.headerContainer.append(this.downloadTranslationButton.button, this.downloadSubtitlesButton, this.openSettingsButton);
							let _ = this.videoHandler?.videoData?.detectedLanguage ?? "en", we = this.data.responseLanguage ?? "ru";
							this.languagePairSelect = new D.A({
								from: {
									selectTitle: je.j.get(`langs.${_}`),
									items: O.A.genLanguageItems(x.xm, _)
								},
								to: {
									selectTitle: je.j.get(`langs.${we}`),
									items: O.A.genLanguageItems(x.Xh, we)
								}
							}), this.subtitlesSelectLabel = new Ue.A({ labelText: je.j.get("VOTSubtitles") }), this.subtitlesSelect = new O.A({
								selectTitle: je.j.get("VOTSubtitlesDisabled"),
								dialogTitle: je.j.get("VOTSubtitles"),
								labelElement: this.subtitlesSelectLabel.container,
								dialogParent: this.globalPortal,
								items: [{
									label: je.j.get("VOTSubtitlesDisabled"),
									value: "disabled",
									selected: !0
								}]
							});
							let Ie = this.videoHandler ? this.videoHandler.getVideoVolume() * 100 : 100;
							this.videoVolumeSliderLabel = new F.A({
								labelText: je.j.get("VOTVolume"),
								value: Ie
							}), this.videoVolumeSlider = new A.A({
								labelHtml: this.videoVolumeSliderLabel.container,
								value: Ie
							}), this.videoVolumeSlider.hidden = !this.data.showVideoSlider || this.votButton.status !== "success";
							let Be = this.data.defaultVolume ?? 100;
							return this.tranlsationVolumeSliderLabel = new F.A({
								labelText: je.j.get("VOTVolumeTranslation"),
								value: Be
							}), this.translationVolumeSlider = new A.A({
								labelHtml: this.tranlsationVolumeSliderLabel.container,
								value: Be,
								max: this.data.audioBooster ? ue.T8 : 100
							}), this.translationVolumeSlider.hidden = this.votButton.status !== "success", this.votMenu.bodyContainer.append(this.languagePairSelect.container, this.subtitlesSelect.container, this.videoVolumeSlider.container, this.translationVolumeSlider.container), this;
						}
						initUIEvents() {
							if (!this.isInitialized()) throw Error("[VOT] OverlayView isn't initialized");
							this.votButton.container.addEventListener("click", (p) => {
								p.preventDefault(), p.stopPropagation(), p.stopImmediatePropagation();
							}), this.votButton.translateButton.addEventListener("pointerdown", async () => {
								this.onClickTranslate.dispatch();
							}), this.votButton.pipButton.addEventListener("pointerdown", async () => {
								this.onClickPiP.dispatch();
							}), this.votButton.menuButton.addEventListener("pointerdown", async () => {
								this.votMenu.hidden = !this.votMenu.hidden;
							});
							let enableDraggingByEvent = (p) => {
								this.dragging = !0, p.preventDefault();
							};
							this.votButton.container.addEventListener("pointerdown", enableDraggingByEvent), this.root.addEventListener("pointerup", this.disableDragging), this.root.addEventListener("pointermove", this.handleContainerPointerMove), this.votButton.container.addEventListener("touchstart", enableDraggingByEvent, { passive: !1 }), this.root.addEventListener("touchend", this.disableDragging), this.root.addEventListener("touchmove", this.handleContainerTouchMove, { passive: !1 });
							for (let p of this.cancelDraggingEvents) document.addEventListener(p, this.disableDragging);
							this.votMenu.container.addEventListener("click", (p) => {
								p.preventDefault(), p.stopPropagation(), p.stopImmediatePropagation();
							});
							for (let p of ["pointerdown", "mousedown"]) this.votMenu.container.addEventListener(p, (p) => {
								p.stopImmediatePropagation();
							});
							return this.downloadTranslationButton.addEventListener("click", async () => {
								this.onClickDownloadTranslation.dispatch();
							}), this.downloadSubtitlesButton.addEventListener("click", async () => {
								this.onClickDownloadSubtitles.dispatch();
							}), this.openSettingsButton.addEventListener("click", async () => {
								this.onClickSettings.dispatch();
							}), this.languagePairSelect.fromSelect.addEventListener("selectItem", (p) => {
								this.videoHandler?.videoData && (this.videoHandler.videoData.detectedLanguage = p), this.onSelectFromLanguage.dispatch(p);
							}), this.languagePairSelect.toSelect.addEventListener("selectItem", async (p) => {
								this.videoHandler?.videoData && (this.videoHandler.translateToLang = this.videoHandler.videoData.responseLanguage = p), this.data.responseLanguage = p, await Ie.d.set("responseLanguage", this.data.responseLanguage), this.onSelectToLanguage.dispatch(p);
							}), this.subtitlesSelect.addEventListener("beforeOpen", async (p) => {
								if (!this.videoHandler?.videoData) return;
								let m = `${this.videoHandler.videoData.videoId}_${this.videoHandler.videoData.detectedLanguage}_${this.videoHandler.videoData.responseLanguage}_${this.data.useLivelyVoice}`;
								if (this.videoHandler.cacheManager.getSubtitles(m)) return;
								this.votButton.loading = !0;
								let g = w.A.createInlineLoader();
								g.style.margin = "0 auto", p.footerContainer.appendChild(g), await this.videoHandler.loadSubtitles(), p.footerContainer.removeChild(g), this.votButton.loading = !1;
							}), this.subtitlesSelect.addEventListener("selectItem", (p) => {
								this.onSelectSubtitles.dispatch(p);
							}), this.videoVolumeSlider.addEventListener("input", (p, m) => {
								this.videoVolumeSliderLabel.value = p, !m && this.onInputVideoVolume.dispatch(p);
							}), this.translationVolumeSlider.addEventListener("input", async (p, m) => {
								this.tranlsationVolumeSliderLabel.value = p, this.data.defaultVolume = p, await Ie.d.set("defaultVolume", this.data.defaultVolume), !m && this.onInputTranslationVolume.dispatch(p);
							}), this;
						}
						updateButtonLayout(p, m) {
							return this.isInitialized() ? (this.votMenu.position = p, this.votButton.position = p, this.votButton.direction = m, this.votButtonTooltip.hidden = m === "row", this.votButtonTooltip.setPosition(this.votButton.tooltipPos), this) : this;
						}
						async moveButton(p) {
							if (!this.isInitialized()) return this;
							let m = K.A.calcPosition(p, this.isBigContainer);
							if (m === this.votButton.position) return this;
							let g = K.A.calcDirection(m);
							return this.data.buttonPos = m, this.updateButtonLayout(m, g), this.isBigContainer && await Ie.d.set("buttonPos", m), this;
						}
						async handleDragMove(p, m, g = this.root.getBoundingClientRect()) {
							if (!this.dragging) return this;
							p.preventDefault();
							let _ = m - g.left, x = _ / g.width * 100;
							return await this.moveButton(x), this;
						}
						disableDragging = () => {
							this.dragging = !1;
						};
						handleContainerPointerMove = async (p) => {
							await this.handleDragMove(p, p.clientX);
						};
						handleContainerTouchMove = async (p) => {
							await this.handleDragMove(p, p.touches[0].clientX);
						};
						updateButtonOpacity(p) {
							return !this.isInitialized() || !this.votMenu.hidden || (this.votButton.opacity = p), this;
						}
						releaseUI(p = !1) {
							if (!this.isInitialized()) throw Error("[VOT] OverlayView isn't initialized");
							return this.votButton.remove(), this.votMenu.remove(), this.votButtonTooltip.release(), this.votOverlayPortal.remove(), this.initialized = p, this;
						}
						releaseUIEvents(p = !1) {
							if (!this.isInitialized()) throw Error("[VOT] OverlayView isn't initialized");
							this.root.removeEventListener("pointerup", this.disableDragging), this.root.removeEventListener("pointermove", this.handleContainerPointerMove), this.root.removeEventListener("touchend", this.disableDragging), this.root.removeEventListener("touchmove", this.handleContainerTouchMove);
							for (let p of this.cancelDraggingEvents) document.removeEventListener(p, this.disableDragging);
							return this.onClickSettings.clear(), this.onClickPiP.clear(), this.onClickTranslate.clear(), this.onClickDownloadTranslation.clear(), this.onClickDownloadSubtitles.clear(), this.onSelectFromLanguage.clear(), this.onSelectToLanguage.clear(), this.onSelectSubtitles.clear(), this.onInputVideoVolume.clear(), this.onInputTranslationVolume.clear(), this.initialized = p, this;
						}
						release() {
							return this.releaseUI(!0), this.releaseUIEvents(!1), this;
						}
						get isBigContainer() {
							return this.root.clientWidth > 550;
						}
						get pipButtonVisible() {
							return (0, Be.Bs)() && !!this.data.showPiPButton;
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/ui/views/settings.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { r: () => SettingsView });
					var x = g("./node_modules/@vot.js/core/dist/types/yandex.js"), w = g("./node_modules/@vot.js/ext/dist/types/service.js"), D = g("./node_modules/@vot.js/shared/dist/data/consts.js"), O = g("./node_modules/lit-html/lit-html.js"), A = g("./src/index.js"), F = g("./src/audioDownloader/index.ts"), U = g("./src/audioDownloader/strategies/index.ts"), K = g("./src/config/config.js"), oe = g("./src/core/eventImpl.ts"), le = g("./src/localization/localizationProvider.ts"), ue = g("./src/types/components/votButton.ts"), we = g("./src/ui.js"), je = g("./src/utils/debug.ts"), Ie = g("./src/utils/gm.ts"), Be = g("./src/utils/storage.ts"), Ve = g("./src/utils/translateApis.ts"), Ue = g("./src/utils/utils.ts"), We = g("./src/ui/components/accountButton.ts"), Ke = g("./src/ui/components/checkbox.ts"), qe = g("./src/ui/components/details.ts"), Ye = g("./src/ui/components/dialog.ts"), tt = g("./src/ui/components/hotkeyButton.ts"), nt = g("./src/ui/components/label.ts"), rt = g("./src/ui/components/select.ts"), it = g("./src/ui/components/slider.ts"), at = g("./src/ui/components/sliderLabel.ts"), ot = g("./src/ui/components/textfield.ts"), st = g("./src/ui/components/tooltip.ts"), ct = g("./src/ui/icons.ts"), dt = p([
						A,
						F,
						U,
						le,
						we,
						Ie,
						Be,
						Ve,
						Ue,
						We,
						Ke,
						qe,
						Ye,
						tt,
						nt,
						rt,
						it,
						at,
						ot,
						st
					]);
					[A, F, U, le, we, Ie, Be, Ve, Ue, We, Ke, qe, Ye, tt, nt, rt, it, at, ot, st] = dt.then ? (await dt)() : dt;
					class SettingsView {
						globalPortal;
						initialized = !1;
						data;
						videoHandler;
						onClickBugReport = new oe.Z();
						onClickResetSettings = new oe.Z();
						onUpdateAccount = new oe.Z();
						onChangeAutoTranslate = new oe.Z();
						onChangeShowVideoVolume = new oe.Z();
						onChangeAudioBooster = new oe.Z();
						onChangeUseLivelyVoice = new oe.Z();
						onChangeSubtitlesHighlightWords = new oe.Z();
						onChangeProxyWorkerHost = new oe.Z();
						onChangeUseNewAudioPlayer = new oe.Z();
						onChangeOnlyBypassMediaCSP = new oe.Z();
						onChangeShowPiPButton = new oe.Z();
						onInputSubtitlesMaxLength = new oe.Z();
						onInputSubtitlesFontSize = new oe.Z();
						onInputSubtitlesBackgroundOpacity = new oe.Z();
						onInputAutoHideButtonDelay = new oe.Z();
						onSelectItemProxyTranslationStatus = new oe.Z();
						onSelectItemTranslationTextService = new oe.Z();
						onSelectItemButtonPosition = new oe.Z();
						onSelectItemMenuLanguage = new oe.Z();
						dialog;
						accountHeader;
						accountButton;
						accountButtonRefreshTooltip;
						accountButtonTokenTooltip;
						translationSettingsHeader;
						autoTranslateCheckbox;
						dontTranslateLanguagesCheckbox;
						dontTranslateLanguagesSelect;
						autoSetVolumeSliderLabel;
						autoSetVolumeCheckbox;
						autoSetVolumeSlider;
						showVideoVolumeSliderCheckbox;
						audioBoosterCheckbox;
						audioBoosterTooltip;
						syncVolumeCheckbox;
						downloadWithNameCheckbox;
						sendNotifyOnCompleteCheckbox;
						useLivelyVoiceCheckbox;
						useLivelyVoiceTooltip;
						useAudioDownloadCheckbox;
						useAudioDownloadCheckboxLabel;
						useAudioDownloadCheckboxTooltip;
						subtitlesSettingsHeader;
						subtitlesDownloadFormatSelectLabel;
						subtitlesDownloadFormatSelect;
						subtitlesDesignDetails;
						hotkeysSettingsHeader;
						translateHotkeyButton;
						proxySettingsHeader;
						proxyM3U8HostTextfield;
						proxyWorkerHostTextfield;
						proxyTranslationStatusSelectLabel;
						proxyTranslationStatusSelectTooltip;
						proxyTranslationStatusSelect;
						miscSettingsHeader;
						translateAPIErrorsCheckbox;
						useNewAudioPlayerCheckbox;
						useNewAudioPlayerTooltip;
						onlyBypassMediaCSPCheckbox;
						onlyBypassMediaCSPTooltip;
						translationTextServiceLabel;
						translationTextServiceSelect;
						translationTextServiceTooltip;
						detectServiceLabel;
						detectServiceSelect;
						appearanceDetails;
						aboutExtensionDetails;
						bugReportButton;
						resetSettingsButton;
						constructor({ globalPortal: p, data: m = {}, videoHandler: g }) {
							this.globalPortal = p, this.data = m, this.videoHandler = g;
						}
						isInitialized() {
							return this.initialized;
						}
						initUI() {
							if (this.isInitialized()) throw Error("[VOT] SettingsView is already initialized");
							this.initialized = !0, this.dialog = new Ye.A({ titleHtml: le.j.get("VOTSettings") }), this.globalPortal.appendChild(this.dialog.container), this.accountHeader = we.A.createHeader(le.j.get("VOTMyAccount")), this.accountButton = new We.A({
								avatarId: this.data.account?.avatarId,
								username: this.data.account?.username,
								loggedIn: !!this.data.account?.token
							}), Be.d.isSupportOnlyLS ? (this.accountButton.refreshButton.setAttribute("disabled", "true"), this.accountButton.actionButton.setAttribute("disabled", "true")) : this.accountButtonRefreshTooltip = new st.A({
								target: this.accountButton.refreshButton,
								content: le.j.get("VOTRefresh"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							}), this.accountButtonTokenTooltip = new st.A({
								target: this.accountButton.tokenButton,
								content: le.j.get("VOTLoginViaToken"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							}), this.translationSettingsHeader = we.A.createHeader(le.j.get("translationSettings")), this.autoTranslateCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTAutoTranslate"),
								checked: this.data.autoTranslate
							});
							let p = this.data.dontTranslateLanguages ?? [];
							this.dontTranslateLanguagesCheckbox = new Ke.A({
								labelHtml: le.j.get("DontTranslateSelectedLanguages"),
								checked: this.data.enabledDontTranslateLanguages
							}), this.dontTranslateLanguagesSelect = new rt.A({
								dialogParent: this.globalPortal,
								dialogTitle: le.j.get("DontTranslateSelectedLanguages"),
								selectTitle: p.map((p) => le.j.get(`langs.${p}`)).join(", ") ?? le.j.get("DontTranslateSelectedLanguages"),
								items: rt.A.genLanguageItems(D.xm).map((m) => ({
									...m,
									selected: p.includes(m.value)
								})),
								multiSelect: !0,
								labelElement: this.dontTranslateLanguagesCheckbox.container
							});
							let m = this.data.autoVolume ?? K.JD;
							this.autoSetVolumeSliderLabel = new at.A({
								labelText: le.j.get("VOTAutoSetVolume"),
								value: m
							}), this.autoSetVolumeCheckbox = new Ke.A({
								labelHtml: this.autoSetVolumeSliderLabel.container,
								checked: this.data.enabledAutoVolume ?? !0
							}), this.autoSetVolumeSlider = new it.A({
								labelHtml: this.autoSetVolumeCheckbox.container,
								value: m
							}), this.showVideoVolumeSliderCheckbox = new Ke.A({
								labelHtml: le.j.get("showVideoVolumeSlider"),
								checked: this.data.showVideoSlider
							}), this.audioBoosterCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTAudioBooster"),
								checked: this.data.audioBooster
							}), this.videoHandler?.audioContext || (this.audioBoosterCheckbox.disabled = !0, this.audioBoosterTooltip = new st.A({
								target: this.audioBoosterCheckbox.container,
								content: le.j.get("VOTNeedWebAudioAPI"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							})), this.syncVolumeCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTSyncVolume"),
								checked: this.data.syncVolume
							}), this.downloadWithNameCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTDownloadWithName"),
								checked: this.data.downloadWithName
							}), this.downloadWithNameCheckbox.disabled = !Ie.yx, this.sendNotifyOnCompleteCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTSendNotifyOnComplete"),
								checked: this.data.sendNotifyOnComplete
							}), this.useLivelyVoiceCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTUseLivelyVoice"),
								checked: this.data.useLivelyVoice
							}), this.useLivelyVoiceTooltip = new st.A({
								target: this.useLivelyVoiceCheckbox.container,
								content: le.j.get("VOTAccountRequired"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal,
								hidden: !!this.data.account?.token
							}), this.data.account?.token || (this.useLivelyVoiceCheckbox.disabled = !0), this.useAudioDownloadCheckboxLabel = new nt.A({
								labelText: le.j.get("VOTUseAudioDownload"),
								icon: ct.Xd
							}), this.useAudioDownloadCheckbox = new Ke.A({
								labelHtml: this.useAudioDownloadCheckboxLabel.container,
								checked: this.data.useAudioDownload
							}), Ie.B0 || (this.useAudioDownloadCheckbox.disabled = !0), this.useAudioDownloadCheckboxTooltip = new st.A({
								target: this.useAudioDownloadCheckboxLabel.container,
								content: le.j.get("VOTUseAudioDownloadWarning"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							}), this.dialog.bodyContainer.append(this.accountHeader, this.accountButton.container, this.translationSettingsHeader, this.autoTranslateCheckbox.container, this.dontTranslateLanguagesSelect.container, this.autoSetVolumeSlider.container, this.showVideoVolumeSliderCheckbox.container, this.audioBoosterCheckbox.container, this.syncVolumeCheckbox.container, this.downloadWithNameCheckbox.container, this.sendNotifyOnCompleteCheckbox.container, this.useLivelyVoiceCheckbox.container, this.useAudioDownloadCheckbox.container), this.subtitlesSettingsHeader = we.A.createHeader(le.j.get("subtitlesSettings")), this.subtitlesDownloadFormatSelectLabel = new nt.A({ labelText: le.j.get("VOTSubtitlesDownloadFormat") }), this.subtitlesDownloadFormatSelect = new rt.A({
								selectTitle: this.data.subtitlesDownloadFormat ?? le.j.get("VOTSubtitlesDownloadFormat"),
								dialogTitle: le.j.get("VOTSubtitlesDownloadFormat"),
								dialogParent: this.globalPortal,
								labelElement: this.subtitlesDownloadFormatSelectLabel.container,
								items: D.EG.map((p) => ({
									label: p.toUpperCase(),
									value: p,
									selected: p === this.data.subtitlesDownloadFormat
								}))
							}), this.subtitlesDesignDetails = new qe.A({ titleHtml: le.j.get("VOTSubtitlesDesign") }), this.dialog.bodyContainer.append(this.subtitlesSettingsHeader, this.subtitlesDownloadFormatSelect.container, this.subtitlesDesignDetails.container), this.hotkeysSettingsHeader = we.A.createHeader(le.j.get("hotkeysSettings")), this.translateHotkeyButton = new tt.A({
								labelHtml: le.j.get("translateVideo"),
								key: this.data.translationHotkey
							}), this.dialog.bodyContainer.append(this.hotkeysSettingsHeader, this.translateHotkeyButton.container), this.proxySettingsHeader = we.A.createHeader(le.j.get("proxySettings")), this.proxyM3U8HostTextfield = new ot.A({
								labelHtml: le.j.get("VOTM3u8ProxyHost"),
								value: this.data.m3u8ProxyHost,
								placeholder: K.se
							}), this.proxyWorkerHostTextfield = new ot.A({
								labelHtml: le.j.get("VOTProxyWorkerHost"),
								value: this.data.proxyWorkerHost,
								placeholder: K.Pm
							});
							let g = [
								le.j.get("VOTTranslateProxyDisabled"),
								le.j.get("VOTTranslateProxyEnabled"),
								le.j.get("VOTTranslateProxyEverything")
							], _ = this.data.translateProxyEnabled ?? 0, x = A.k && K.vZ.includes(A.k);
							this.proxyTranslationStatusSelectLabel = new nt.A({
								icon: x ? ct.Xd : void 0,
								labelText: le.j.get("VOTTranslateProxyStatus")
							}), x && (this.proxyTranslationStatusSelectTooltip = new st.A({
								target: this.proxyTranslationStatusSelectLabel.icon,
								content: le.j.get("VOTTranslateProxyStatusDefault"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							})), this.proxyTranslationStatusSelect = new rt.A({
								selectTitle: g[_],
								dialogTitle: le.j.get("VOTTranslateProxyStatus"),
								dialogParent: this.globalPortal,
								labelElement: this.proxyTranslationStatusSelectLabel.container,
								items: g.map((p, m) => ({
									label: p,
									value: m.toString(),
									selected: m === _,
									disabled: m === 0 && Ie.up
								}))
							}), this.dialog.bodyContainer.append(this.proxySettingsHeader, this.proxyM3U8HostTextfield.container, this.proxyWorkerHostTextfield.container, this.proxyTranslationStatusSelect.container), this.miscSettingsHeader = we.A.createHeader(le.j.get("miscSettings")), this.translateAPIErrorsCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTTranslateAPIErrors"),
								checked: this.data.translateAPIErrors ?? !0
							}), this.translateAPIErrorsCheckbox.hidden = le.j.lang === "ru", this.useNewAudioPlayerCheckbox = new Ke.A({
								labelHtml: le.j.get("VOTNewAudioPlayer"),
								checked: this.data.newAudioPlayer
							}), this.videoHandler?.audioContext || (this.useNewAudioPlayerCheckbox.disabled = !0, this.useNewAudioPlayerTooltip = new st.A({
								target: this.useNewAudioPlayerCheckbox.container,
								content: le.j.get("VOTNeedWebAudioAPI"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							}));
							let w = this.videoHandler?.site.needBypassCSP ? `${le.j.get("VOTOnlyBypassMediaCSP")} (${le.j.get("VOTMediaCSPEnabledOnSite")})` : le.j.get("VOTOnlyBypassMediaCSP");
							this.onlyBypassMediaCSPCheckbox = new Ke.A({
								labelHtml: w,
								checked: this.data.onlyBypassMediaCSP,
								isSubCheckbox: !0
							}), this.videoHandler?.audioContext || (this.onlyBypassMediaCSPTooltip = new st.A({
								target: this.onlyBypassMediaCSPCheckbox.container,
								content: le.j.get("VOTNeedWebAudioAPI"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							})), this.onlyBypassMediaCSPCheckbox.disabled = !this.data.newAudioPlayer && !!this.videoHandler?.audioContext, this.data.newAudioPlayer || (this.onlyBypassMediaCSPCheckbox.hidden = !0), this.translationTextServiceLabel = new nt.A({
								labelText: le.j.get("VOTTranslationTextService"),
								icon: ct.w2
							});
							let O = this.data.translationService ?? K.mE;
							this.translationTextServiceSelect = new rt.A({
								selectTitle: le.j.get(`services.${O}`),
								dialogTitle: le.j.get("VOTTranslationTextService"),
								dialogParent: this.globalPortal,
								labelElement: this.translationTextServiceLabel.container,
								items: Ve.vN.map((p) => ({
									label: le.j.get(`services.${p}`),
									value: p,
									selected: p === O
								}))
							}), this.translationTextServiceTooltip = new st.A({
								target: this.translationTextServiceLabel.icon,
								content: le.j.get("VOTNotAffectToVoice"),
								position: "bottom",
								backgroundColor: "var(--vot-helper-ondialog)",
								parentElement: this.globalPortal
							}), this.detectServiceLabel = new nt.A({ labelText: le.j.get("VOTDetectService") });
							let F = this.data.detectService ?? K.K2;
							return this.detectServiceSelect = new rt.A({
								selectTitle: le.j.get(`services.${F}`),
								dialogTitle: le.j.get("VOTDetectService"),
								dialogParent: this.globalPortal,
								labelElement: this.detectServiceLabel.container,
								items: Ve.qh.map((p) => ({
									label: le.j.get(`services.${p}`),
									value: p,
									selected: p === F
								}))
							}), this.appearanceDetails = new qe.A({ titleHtml: le.j.get("appearance") }), this.aboutExtensionDetails = new qe.A({ titleHtml: le.j.get("aboutExtension") }), this.bugReportButton = we.A.createOutlinedButton(le.j.get("VOTBugReport")), this.resetSettingsButton = we.A.createButton(le.j.get("resetSettings")), this.dialog.bodyContainer.append(this.miscSettingsHeader, this.translateAPIErrorsCheckbox.container, this.useNewAudioPlayerCheckbox.container, this.onlyBypassMediaCSPCheckbox.container, this.translationTextServiceSelect.container, this.detectServiceSelect.container, this.appearanceDetails.container, this.aboutExtensionDetails.container, this.bugReportButton, this.resetSettingsButton), this;
						}
						initUIEvents() {
							if (!this.isInitialized()) throw Error("[VOT] SettingsView isn't initialized");
							return this.accountButton.addEventListener("click", async () => {
								if (!Be.d.isSupportOnlyLS) {
									if (this.accountButton.loggedIn) return await Be.d.delete("account"), this.data.account = {}, this.updateAccountInfo();
									window.open(K.xW, "_blank")?.focus();
								}
							}), this.accountButton.addEventListener("click:secret", async () => {
								let p = new Ye.A({
									titleHtml: le.j.get("VOTLoginViaToken"),
									isTemp: !0
								});
								this.globalPortal.appendChild(p.container);
								let m = we.A.createEl("vot-block", void 0, le.j.get("VOTYandexTokenInfo")), g = new ot.A({
									labelHtml: le.j.get("VOTYandexToken"),
									value: this.data.account?.token
								});
								g.addEventListener("change", async (p) => {
									this.data.account = p ? {
										expires: Date.now() + 3153418e4,
										token: p
									} : {}, await Be.d.set("account", this.data.account), this.updateAccountInfo();
								}), p.bodyContainer.append(m, g.container);
							}), this.accountButton.addEventListener("refresh", async () => {
								Be.d.isSupportOnlyLS || (this.data.account = await Be.d.get("account", {}), this.updateAccountInfo());
							}), this.autoTranslateCheckbox.addEventListener("change", async (p) => {
								this.data.autoTranslate = p, await Be.d.set("autoTranslate", this.data.autoTranslate), je.A.log("autoTranslate value changed. New value:", p), this.onChangeAutoTranslate.dispatch(p);
							}), this.dontTranslateLanguagesCheckbox.addEventListener("change", async (p) => {
								this.data.enabledDontTranslateLanguages = p, await Be.d.set("enabledDontTranslateLanguages", this.data.enabledDontTranslateLanguages), je.A.log("enabledDontTranslateLanguages value changed. New value:", p);
							}), this.dontTranslateLanguagesSelect.addEventListener("selectItem", async (p) => {
								this.data.dontTranslateLanguages = p, await Be.d.set("dontTranslateLanguages", this.data.dontTranslateLanguages), je.A.log("dontTranslateLanguages value changed. New value:", p);
							}), this.autoSetVolumeCheckbox.addEventListener("change", async (p) => {
								this.data.enabledAutoVolume = p, await Be.d.set("enabledAutoVolume", this.data.enabledAutoVolume), je.A.log("enabledAutoVolume value changed. New value:", p);
							}), this.autoSetVolumeSlider.addEventListener("input", async (p) => {
								this.data.autoVolume = this.autoSetVolumeSliderLabel.value = p, await Be.d.set("autoVolume", this.data.autoVolume), je.A.log("autoVolume value changed. New value:", p);
							}), this.showVideoVolumeSliderCheckbox.addEventListener("change", async (p) => {
								this.data.showVideoSlider = p, await Be.d.set("showVideoSlider", this.data.showVideoSlider), je.A.log("showVideoVolumeSlider value changed. New value:", p), this.onChangeShowVideoVolume.dispatch(p);
							}), this.audioBoosterCheckbox.addEventListener("change", async (p) => {
								this.data.audioBooster = p, await Be.d.set("audioBooster", this.data.audioBooster), je.A.log("audioBooster value changed. New value:", p), this.onChangeAudioBooster.dispatch(p);
							}), this.syncVolumeCheckbox.addEventListener("change", async (p) => {
								this.data.syncVolume = p, await Be.d.set("syncVolume", this.data.syncVolume), je.A.log("syncVolume value changed. New value:", p);
							}), this.downloadWithNameCheckbox.addEventListener("change", async (p) => {
								this.data.downloadWithName = p, await Be.d.set("downloadWithName", this.data.downloadWithName), je.A.log("downloadWithName value changed. New value:", p);
							}), this.sendNotifyOnCompleteCheckbox.addEventListener("change", async (p) => {
								this.data.sendNotifyOnComplete = p, await Be.d.set("sendNotifyOnComplete", this.data.sendNotifyOnComplete), je.A.log("sendNotifyOnComplete value changed. New value:", p);
							}), this.useLivelyVoiceCheckbox.addEventListener("change", async (p) => {
								this.data.useLivelyVoice = p, await Be.d.set("useLivelyVoice", this.data.useLivelyVoice), je.A.log("useLivelyVoice value changed. New value:", p), this.onChangeUseLivelyVoice.dispatch(p);
							}), this.useAudioDownloadCheckbox.addEventListener("change", async (p) => {
								this.data.useAudioDownload = p, await Be.d.set("useAudioDownload", this.data.useAudioDownload), je.A.log("useAudioDownload value changed. New value:", p);
							}), this.subtitlesDownloadFormatSelect.addEventListener("selectItem", async (p) => {
								this.data.subtitlesDownloadFormat = p, await Be.d.set("subtitlesDownloadFormat", this.data.subtitlesDownloadFormat), je.A.log("subtitlesDownloadFormat value changed. New value:", p);
							}), this.subtitlesDesignDetails.addEventListener("click", () => {
								let p = new Ye.A({
									titleHtml: le.j.get("VOTSubtitlesDesign"),
									isTemp: !0
								});
								this.globalPortal.appendChild(p.container);
								let m = new Ke.A({
									labelHtml: le.j.get("VOTHighlightWords"),
									checked: this.data.highlightWords
								}), g = this.data.subtitlesMaxLength ?? 300, _ = new at.A({
									labelText: le.j.get("VOTSubtitlesMaxLength"),
									labelEOL: ":",
									symbol: "",
									value: g
								}), x = new it.A({
									labelHtml: _.container,
									value: g,
									min: 50,
									max: 300
								}), w = this.data.subtitlesFontSize ?? 20, D = new at.A({
									labelText: le.j.get("VOTSubtitlesFontSize"),
									labelEOL: ":",
									symbol: "px",
									value: w
								}), O = new it.A({
									labelHtml: D.container,
									value: w,
									min: 8,
									max: 50
								}), A = this.data.subtitlesOpacity ?? 20, F = new at.A({
									labelText: le.j.get("VOTSubtitlesOpacity"),
									labelEOL: ":",
									value: A
								}), U = new it.A({
									labelHtml: F.container,
									value: A
								});
								p.bodyContainer.append(m.container, x.container, O.container, U.container), m.addEventListener("change", async (p) => {
									this.data.highlightWords = p, await Be.d.set("highlightWords", this.data.highlightWords), je.A.log("highlightWords value changed. New value:", p), this.onChangeSubtitlesHighlightWords.dispatch(p);
								}), x.addEventListener("input", (p) => {
									_.value = p, this.data.subtitlesMaxLength = p, Be.d.set("subtitlesMaxLength", this.data.subtitlesMaxLength), je.A.log("highlightWords value changed. New value:", p), this.onInputSubtitlesMaxLength.dispatch(p);
								}), O.addEventListener("input", (p) => {
									D.value = p, this.data.subtitlesFontSize = p, Be.d.set("subtitlesFontSize", this.data.subtitlesFontSize), je.A.log("subtitlesFontSize value changed. New value:", p), this.onInputSubtitlesFontSize.dispatch(p);
								}), U.addEventListener("input", (p) => {
									F.value = p, this.data.subtitlesOpacity = p, Be.d.set("subtitlesOpacity", this.data.subtitlesOpacity), je.A.log("subtitlesOpacity value changed. New value:", p), this.onInputSubtitlesBackgroundOpacity.dispatch(p);
								});
							}), this.translateHotkeyButton.addEventListener("change", async (p) => {
								this.data.translationHotkey = p, await Be.d.set("translationHotkey", this.data.translationHotkey), je.A.log("translationHotkey value changed. New value:", p);
							}), this.proxyM3U8HostTextfield.addEventListener("change", async (p) => {
								this.data.m3u8ProxyHost = p || K.se, await Be.d.set("m3u8ProxyHost", this.data.m3u8ProxyHost), je.A.log("m3u8ProxyHost value changed. New value:", this.data.m3u8ProxyHost);
							}), this.proxyWorkerHostTextfield.addEventListener("change", async (p) => {
								this.data.proxyWorkerHost = p || K.Pm, await Be.d.set("proxyWorkerHost", this.data.proxyWorkerHost), je.A.log("proxyWorkerHost value changed. New value:", this.data.proxyWorkerHost), this.onChangeProxyWorkerHost.dispatch(p);
							}), this.proxyTranslationStatusSelect.addEventListener("selectItem", async (p) => {
								this.data.translateProxyEnabled = Number.parseInt(p), await Be.d.set("translateProxyEnabled", this.data.translateProxyEnabled), await Be.d.set("translateProxyEnabledDefault", !1), je.A.log("translateProxyEnabled value changed. New value:", this.data.translateProxyEnabled), this.onSelectItemProxyTranslationStatus.dispatch(p);
							}), this.translateAPIErrorsCheckbox.addEventListener("change", async (p) => {
								this.data.translateAPIErrors = p, await Be.d.set("translateAPIErrors", this.data.translateAPIErrors), je.A.log("translateAPIErrors value changed. New value:", p);
							}), this.useNewAudioPlayerCheckbox.addEventListener("change", async (p) => {
								this.data.newAudioPlayer = p, await Be.d.set("newAudioPlayer", this.data.newAudioPlayer), je.A.log("newAudioPlayer value changed. New value:", p), this.onlyBypassMediaCSPCheckbox.disabled = this.onlyBypassMediaCSPCheckbox.hidden = !p, this.onChangeUseNewAudioPlayer.dispatch(p);
							}), this.onlyBypassMediaCSPCheckbox.addEventListener("change", async (p) => {
								this.data.onlyBypassMediaCSP = p, await Be.d.set("onlyBypassMediaCSP", this.data.onlyBypassMediaCSP), je.A.log("onlyBypassMediaCSP value changed. New value:", p), this.onChangeOnlyBypassMediaCSP.dispatch(p);
							}), this.translationTextServiceSelect.addEventListener("selectItem", async (p) => {
								this.data.translationService = p, await Be.d.set("translationService", this.data.translationService), je.A.log("translationService value changed. New value:", p), this.onSelectItemTranslationTextService.dispatch(p);
							}), this.detectServiceSelect.addEventListener("selectItem", async (p) => {
								this.data.detectService = p, await Be.d.set("detectService", this.data.detectService), je.A.log("detectService value changed. New value:", p);
							}), this.appearanceDetails.addEventListener("click", () => {
								let p = new Ye.A({
									titleHtml: le.j.get("appearance"),
									isTemp: !0
								});
								this.globalPortal.appendChild(p.container);
								let m = new Ke.A({
									labelHtml: le.j.get("VOTShowPiPButton"),
									checked: this.data.showPiPButton
								});
								m.hidden = !(0, Ue.Bs)();
								let g = (this.data.autoHideButtonDelay ?? K.qU) / 1e3, _ = new at.A({
									labelText: le.j.get("autoHideButtonDelay"),
									labelEOL: ":",
									symbol: ` ${le.j.get("secs")}`,
									value: g
								}), x = new it.A({
									labelHtml: _.container,
									value: g,
									min: .1,
									max: 3,
									step: .1
								}), w = new nt.A({
									labelText: le.j.get("buttonPositionInWidePlayer"),
									icon: ct.w2
								}), D = new rt.A({
									selectTitle: le.j.get("buttonPositionInWidePlayer"),
									dialogTitle: le.j.get("buttonPositionInWidePlayer"),
									labelElement: w.container,
									dialogParent: this.globalPortal,
									items: ue.X.map((p) => ({
										label: le.j.get(`position.${p}`),
										value: p,
										selected: p === this.data.buttonPos
									}))
								}), O = new st.A({
									target: w.icon,
									content: le.j.get("minButtonPositionContainer"),
									position: "bottom",
									backgroundColor: "var(--vot-helper-ondialog)",
									parentElement: this.globalPortal
								}), A = new nt.A({ labelText: le.j.get("VOTMenuLanguage") }), F = new rt.A({
									selectTitle: le.j.get(`langs.${le.j.langOverride}`),
									dialogTitle: le.j.get("VOTMenuLanguage"),
									labelElement: A.container,
									dialogParent: this.globalPortal,
									items: rt.A.genLanguageItems(le.j.getAvailableLangs(), le.j.langOverride)
								});
								p.bodyContainer.append(m.container, x.container, D.container, F.container), p.addEventListener("close", () => {
									O.release();
								}), m.addEventListener("change", async (p) => {
									this.data.showPiPButton = p, await Be.d.set("showPiPButton", this.data.showPiPButton), je.A.log("showPiPButton value changed. New value:", p), this.onChangeShowPiPButton.dispatch(p);
								}), x.addEventListener("input", async (p) => {
									_.value = p;
									let m = Math.round(p * 1e3);
									je.A.log("autoHideButtonDelay value changed. New value:", m), this.data.autoHideButtonDelay = m, await Be.d.set("autoHideButtonDelay", this.data.autoHideButtonDelay), this.onInputAutoHideButtonDelay.dispatch(p);
								}), D.addEventListener("selectItem", async (p) => {
									je.A.log("buttonPos value changed. New value:", p), this.data.buttonPos = p, await Be.d.set("buttonPos", this.data.buttonPos), this.onSelectItemButtonPosition.dispatch(p);
								}), F.addEventListener("selectItem", async (p) => {
									let m = await le.j.changeLang(p);
									m && (this.data.localeUpdatedAt = await Be.d.get("localeUpdatedAt", 0), this.onSelectItemMenuLanguage.dispatch(p));
								});
							}), this.aboutExtensionDetails.addEventListener("click", () => {
								let p = new Ye.A({
									titleHtml: le.j.get("aboutExtension"),
									isTemp: !0
								});
								this.globalPortal.appendChild(p.container);
								let m = "color: #3ea6ff; text-decoration: none;", g = we.A.createInformation(`${le.j.get("VOTVersion")}:`, chrome.runtime.getManifest().version || le.j.get("notFound")), _ = we.A.createInformation("Based on:", (0, O.qy)`<a href="https://github.com/ilyhalight/voice-over-translation" target="_blank" style=${m}>voice-over-translation</a> by <strong>ilyhalight</strong>`), x = we.A.createInformation(`${le.j.get("VOTAuthors")}:`, "Toil, SashaXser, MrSoczekXD, mynovelhost, sodapng"), w = we.A.createInformation("Chrome Extension:", (0, O.qy)`<a href="https://github.com/AndyShaman/vot_chrome_extention" target="_blank" style=${m}>AndyShaman/vot_chrome_extention</a>`), D = we.A.createInformation("Contacts:", (0, O.qy)`<a href="https://t.me/AI_Handler" target="_blank" style=${m}>Telegram</a> &middot; <a href="https://www.youtube.com/channel/UCLkP6wuW_P2hnagdaZMBtCw" target="_blank" style=${m}>YouTube</a>`);
								p.bodyContainer.append(g.container, _.container, x.container, w.container, D.container);
							}), this.bugReportButton.addEventListener("click", () => {
								this.onClickBugReport.dispatch();
							}), this.resetSettingsButton.addEventListener("click", () => {
								this.onClickResetSettings.dispatch();
							}), this;
						}
						initDebugUI() {
							return this;
						}
						addEventListener(p, m) {
							switch (p) {
								case "click:bugReport":
									this.onClickBugReport.addListener(m);
									break;
								case "click:resetSettings":
									this.onClickResetSettings.addListener(m);
									break;
								case "update:account":
									this.onUpdateAccount.addListener(m);
									break;
								case "change:autoTranslate":
									this.onChangeAutoTranslate.addListener(m);
									break;
								case "change:showVideoVolume":
									this.onChangeShowVideoVolume.addListener(m);
									break;
								case "change:audioBuster":
									this.onChangeAudioBooster.addListener(m);
									break;
								case "change:useLivelyVoice":
									this.onChangeUseLivelyVoice.addListener(m);
									break;
								case "change:subtitlesHighlightWords":
									this.onChangeSubtitlesHighlightWords.addListener(m);
									break;
								case "change:proxyWorkerHost":
									this.onChangeProxyWorkerHost.addListener(m);
									break;
								case "change:useNewAudioPlayer":
									this.onChangeUseNewAudioPlayer.addListener(m);
									break;
								case "change:onlyBypassMediaCSP":
									this.onChangeOnlyBypassMediaCSP.addListener(m);
									break;
								case "change:showPiPButton":
									this.onChangeShowPiPButton.addListener(m);
									break;
								case "input:subtitlesMaxLength":
									this.onInputSubtitlesMaxLength.addListener(m);
									break;
								case "input:subtitlesFontSize":
									this.onInputSubtitlesFontSize.addListener(m);
									break;
								case "input:subtitlesBackgroundOpacity":
									this.onInputSubtitlesBackgroundOpacity.addListener(m);
									break;
								case "input:autoHideButtonDelay":
									this.onInputAutoHideButtonDelay.addListener(m);
									break;
								case "select:proxyTranslationStatus":
									this.onSelectItemProxyTranslationStatus.addListener(m);
									break;
								case "select:translationTextService":
									this.onSelectItemTranslationTextService.addListener(m);
									break;
								case "select:buttonPosition":
									this.onSelectItemButtonPosition.addListener(m);
									break;
								case "select:menuLanguage":
									this.onSelectItemMenuLanguage.addListener(m);
									break;
							}
							return this;
						}
						removeEventListener(p, m) {
							switch (p) {
								case "click:bugReport":
									this.onClickBugReport.removeListener(m);
									break;
								case "click:resetSettings":
									this.onClickResetSettings.removeListener(m);
									break;
								case "update:account":
									this.onUpdateAccount.removeListener(m);
									break;
								case "change:autoTranslate":
									this.onChangeAutoTranslate.removeListener(m);
									break;
								case "change:showVideoVolume":
									this.onChangeShowVideoVolume.removeListener(m);
									break;
								case "change:audioBuster":
									this.onChangeAudioBooster.removeListener(m);
									break;
								case "change:useLivelyVoice":
									this.onChangeUseLivelyVoice.removeListener(m);
									break;
								case "change:subtitlesHighlightWords":
									this.onChangeSubtitlesHighlightWords.removeListener(m);
									break;
								case "change:proxyWorkerHost":
									this.onChangeProxyWorkerHost.removeListener(m);
									break;
								case "change:useNewAudioPlayer":
									this.onChangeUseNewAudioPlayer.removeListener(m);
									break;
								case "change:onlyBypassMediaCSP":
									this.onChangeOnlyBypassMediaCSP.removeListener(m);
									break;
								case "change:showPiPButton":
									this.onChangeShowPiPButton.removeListener(m);
									break;
								case "input:subtitlesMaxLength":
									this.onInputSubtitlesMaxLength.removeListener(m);
									break;
								case "input:subtitlesFontSize":
									this.onInputSubtitlesFontSize.removeListener(m);
									break;
								case "input:subtitlesBackgroundOpacity":
									this.onInputSubtitlesBackgroundOpacity.removeListener(m);
									break;
								case "input:autoHideButtonDelay":
									this.onInputAutoHideButtonDelay.removeListener(m);
									break;
								case "select:proxyTranslationStatus":
									this.onSelectItemProxyTranslationStatus.removeListener(m);
									break;
								case "select:translationTextService":
									this.onSelectItemTranslationTextService.removeListener(m);
									break;
								case "select:buttonPosition":
									this.onSelectItemButtonPosition.removeListener(m);
									break;
								case "select:menuLanguage":
									this.onSelectItemMenuLanguage.removeListener(m);
									break;
							}
							return this;
						}
						releaseUI(p = !1) {
							if (!this.isInitialized()) throw Error("[VOT] SettingsView isn't initialized");
							return this.dialog.remove(), this.accountButtonRefreshTooltip?.release(), this.accountButtonTokenTooltip?.release(), this.audioBoosterTooltip?.release(), this.useAudioDownloadCheckboxTooltip?.release(), this.useNewAudioPlayerTooltip?.release(), this.onlyBypassMediaCSPTooltip?.release(), this.translationTextServiceTooltip?.release(), this.proxyTranslationStatusSelectTooltip?.release(), this.initialized = p, this;
						}
						releaseUIEvents(p = !1) {
							if (!this.isInitialized()) throw Error("[VOT] SettingsView isn't initialized");
							return this.onClickBugReport.clear(), this.onClickResetSettings.clear(), this.onUpdateAccount.clear(), this.onChangeAutoTranslate.clear(), this.onChangeShowVideoVolume.clear(), this.onChangeAudioBooster.clear(), this.onChangeUseLivelyVoice.clear(), this.onChangeSubtitlesHighlightWords.clear(), this.onChangeProxyWorkerHost.clear(), this.onChangeUseNewAudioPlayer.clear(), this.onChangeOnlyBypassMediaCSP.clear(), this.onChangeShowPiPButton.clear(), this.onInputSubtitlesMaxLength.clear(), this.onInputSubtitlesFontSize.clear(), this.onInputSubtitlesBackgroundOpacity.clear(), this.onInputAutoHideButtonDelay.clear(), this.onSelectItemProxyTranslationStatus.clear(), this.onSelectItemTranslationTextService.clear(), this.onSelectItemButtonPosition.clear(), this.onSelectItemMenuLanguage.clear(), this.initialized = p, this;
						}
						release() {
							return this.releaseUI(!0), this.releaseUIEvents(!1), this;
						}
						updateAccountInfo() {
							if (!this.isInitialized()) throw Error("[VOT] SettingsView isn't initialized");
							let p = !!this.data.account?.token;
							return this.accountButton.avatarId = this.data.account?.avatarId, this.useLivelyVoiceTooltip.hidden = this.accountButton.loggedIn = p, this.accountButton.username = this.data.account?.username, this.useLivelyVoiceCheckbox.disabled = !p, this.onUpdateAccount.dispatch(this.data.account), this;
						}
						open() {
							if (!this.isInitialized()) throw Error("[VOT] SettingsView isn't initialized");
							return this.dialog.open();
						}
						close() {
							if (!this.isInitialized()) throw Error("[VOT] SettingsView isn't initialized");
							return this.dialog.close();
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/VOTLocalizedError.js": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, { n: () => VOTLocalizedError });
					var x = g("./src/localization/localizationProvider.ts"), w = p([x]);
					x = (w.then ? (await w)() : w)[0];
					class VOTLocalizedError extends Error {
						constructor(p) {
							super(x.j.getDefault(p)), this.name = "VOTLocalizedError", this.unlocalizedMessage = p, this.localizedMessage = x.j.get(p);
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/VideoObserver.js": (p, m, g) => {
			"use strict";
			g.d(m, { c: () => VideoObserver });
			var _ = g("./node_modules/requestidlecallback-polyfill/index.js"), x = g("./node_modules/@vot.js/shared/dist/data/alternativeUrls.js"), w = g("./src/core/eventImpl.ts"), D = g("./src/utils/debug.ts");
			class VideoObserver {
				static adKeywords = new Set([
					"advertise",
					"advertisement",
					"promo",
					"sponsor",
					"banner",
					"commercial",
					"preroll",
					"midroll",
					"postroll",
					"ad-container",
					"sponsored"
				]);
				constructor() {
					this.videoCache = new WeakSet(), this.observedNodes = {
						added: new Set(),
						removed: new Set()
					}, this.onVideoAdded = new w.Z(), this.onVideoRemoved = new w.Z(), this.observer = new MutationObserver(this.handleMutations);
				}
				isAdRelated(p) {
					let m = [
						"class",
						"id",
						"title"
					];
					for (let g of m) {
						let m = p.getAttribute(g);
						if (m && VideoObserver.adKeywords.has(m.toLowerCase())) return !0;
					}
					return !1;
				}
				hasAudio(p) {
					return x.sx.includes(window.location.hostname) ? !p.muted : p.mozHasAudio === void 0 ? p.webkitAudioDecodedByteCount === void 0 ? "audioTracks" in p && p.audioTracks.length > 0 || !p.muted : p.webkitAudioDecodedByteCount > 0 : p.mozHasAudio;
				}
				isValidVideo(p) {
					if (this.isAdRelated(p)) return !1;
					let m = p.parentElement;
					for (; m && !this.isAdRelated(m);) m = m.parentElement;
					return m ? !1 : this.hasAudio(p) ? !0 : (D.A.log("Ignoring video without audio:", p), !1);
				}
				traverseDOM(p) {
					if (p instanceof HTMLVideoElement) {
						this.checkVideoState(p);
						return;
					}
					let m = document.createTreeWalker(p, NodeFilter.SHOW_ELEMENT, { acceptNode: (p) => p.tagName === "VIDEO" || p.shadowRoot ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP });
					for (; m.nextNode();) {
						let p = m.currentNode;
						p instanceof HTMLVideoElement && this.checkVideoState(p), p.shadowRoot && this.traverseDOM(p.shadowRoot);
					}
				}
				checkVideoState(p) {
					if (this.videoCache.has(p)) return;
					this.videoCache.add(p);
					let onLoadedData = () => {
						this.isValidVideo(p) && this.onVideoAdded.dispatch(p), p.removeEventListener("loadeddata", onLoadedData);
					}, onEmptied = () => {
						p.isConnected || (this.onVideoRemoved.dispatch(p), this.videoCache.delete(p), p.removeEventListener("emptied", onEmptied));
					};
					p.addEventListener("emptied", onEmptied), p.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? onLoadedData() : p.addEventListener("loadeddata", onLoadedData);
				}
				handleMutations = (p) => {
					for (let m of p) {
						if (m.type !== "childList") continue;
						for (let p of m.addedNodes) this.observedNodes.added.add(p);
						for (let p of m.removedNodes) this.observedNodes.removed.add(p);
					}
					window.requestIdleCallback(() => {
						for (let p of this.observedNodes.added) this.traverseDOM(p);
						for (let p of this.observedNodes.removed) if (p.querySelectorAll) {
							let m = p.querySelectorAll("video");
							for (let p of m) p.isConnected || (this.onVideoRemoved.dispatch(p), this.videoCache.delete(p));
						}
						this.observedNodes.added.clear(), this.observedNodes.removed.clear();
					}, { timeout: 1e3 });
				};
				enable() {
					this.observer.observe(document.documentElement, {
						childList: !0,
						subtree: !0
					}), this.traverseDOM(document.documentElement);
				}
				disable() {
					this.observer.disconnect(), this.videoCache = new WeakSet();
				}
			}
		},
		"./src/utils/debug.ts": (p, m, g) => {
			"use strict";
			g.d(m, { A: () => _ });
			let _ = { log: (...p) => {} };
		},
		"./src/utils/gm.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						B0: () => F,
						G3: () => GM_fetch,
						up: () => O,
						yx: () => U
					});
					var x = g("./src/utils/debug.ts"), w = g("./src/utils/utils.ts"), D = p([w]);
					w = (D.then ? (await D)() : D)[0];
					let O = !0, A = !1, F = !0, U = !0;
					async function chromeFetchProxy(p, m, g) {
						let _ = null;
						if (m.body) if (m.body instanceof Blob) {
							let p = await m.body.arrayBuffer();
							_ = Array.from(new Uint8Array(p));
						} else if (m.body instanceof ArrayBuffer) _ = Array.from(new Uint8Array(m.body));
						else if (m.body instanceof Uint8Array) _ = Array.from(m.body);
						else if (typeof m.body == "string") _ = m.body;
						else {
							let p = await new Response(m.body).arrayBuffer();
							_ = Array.from(new Uint8Array(p));
						}
						let D = (0, w.dJ)(m.headers);
						x.A.log("chromeFetchProxy sending to background:", p, m.method || "GET");
						let O = await chrome.runtime.sendMessage({
							type: "fetch_proxy",
							url: p,
							method: m.method || "GET",
							headers: D,
							body: _,
							timeout: g
						});
						if (x.A.log("chromeFetchProxy response:", O), !O) throw Error("No response from background worker");
						if (O.error) throw Error(O.error);
						let A = new Uint8Array(O.body).buffer, F = new Blob([A]), U = new Response(F, {
							status: O.status,
							headers: O.headers
						});
						return Object.defineProperty(U, "url", { value: O.url ?? "" }), U;
					}
					async function GM_fetch(p, m = {}) {
						let { timeout: g = 15e3,..._ } = m, w = new AbortController();
						try {
							if (typeof p == "string" && p.includes("api.browser.yandex.ru")) throw Error("Preventing yandex cors");
							return await fetch(p, {
								signal: w.signal,
								..._
							});
						} catch (m) {
							return x.A.log("GM_fetch preventing CORS via background proxy", m.message), await chromeFetchProxy(p.toString(), _, g);
						}
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/iframeConnector.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						IA: () => ensureServiceIframe,
						Io: () => initIframeService,
						Ok: () => generateMessageId,
						WF: () => D,
						d4: () => isIframe,
						hG: () => requestDataFromMainWorld,
						yB: () => hasServiceIframe
					});
					var x = g("./src/utils/utils.ts"), w = p([x]);
					x = (w.then ? (await w)() : w)[0];
					let D = "vot_iframe", isIframe = () => window.self !== window.top, generateMessageId = () => `main-world-bridge-${performance.now()}-${Math.random()}`, hasServiceIframe = (p) => document.getElementById(p);
					async function setupServiceIframe(p, m, g) {
						let _ = document.createElement("iframe");
						_.style.position = "absolute", _.style.zIndex = "-1", _.style.display = "none", _.id = m, _.src = `${p}#${D}`, document.body.appendChild(_);
						let w = new Promise((p) => {
							let handleMessage = ({ data: m }) => {
								m.messageType === `say-${g}-iframe-is-ready` && (window.removeEventListener("message", handleMessage), p(!0));
							};
							window.addEventListener("message", handleMessage);
						});
						return await Promise.race([w, (0, x.wR)(15e3, "Service iframe did not have time to be ready")]), _;
					}
					async function ensureServiceIframe(p, m, g, _) {
						if (m.includes("#")) throw Error("The src parameter should not contain a hash (#) character.");
						let x = hasServiceIframe(g);
						if (x) {
							if (p !== null) return p;
							x?.remove();
						}
						return p = await setupServiceIframe(m, g, _), p;
					}
					function initIframeService(p, m) {
						window.addEventListener("message", m), window.parent.postMessage({
							messageType: `say-${p}-iframe-is-ready`,
							messageDirection: "response"
						}, "*");
					}
					function requestDataFromMainWorld(p, m) {
						let g = generateMessageId();
						return new Promise((_, x) => {
							let handleMessage = ({ data: m }) => {
								m?.messageId === g && m.messageType === p && m.messageDirection === "response" && (window.removeEventListener("message", handleMessage), m.error ? x(m.error) : _(m.payload));
							};
							window.addEventListener("message", handleMessage), window.postMessage({
								messageId: g,
								messageType: p,
								messageDirection: "request",
								...m !== void 0 && { payload: m }
							}, "*");
						});
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/localization.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						o: () => secsToStrTime,
						v: () => O
					});
					var x = g("./src/localization/localizationProvider.ts"), w = p([x]);
					x = (w.then ? (await w)() : w)[0];
					let D = .66, O = navigator.language?.substring(0, 2).toLowerCase() || "en";
					function secsToStrTime(p) {
						let m = Math.floor(p / 60), g = Math.floor(p % 60), _ = g / 60;
						if (_ >= D && (m += 1, g = 0), m >= 60) return x.j.get("translationTakeMoreThanHour");
						if (m <= 1) return x.j.get("translationTakeAboutMinute");
						let w = String(m);
						return m !== 11 && m % 10 == 1 ? x.j.get("translationTakeApproximatelyMinute2").replace("{0}", w) : ![
							12,
							13,
							14
						].includes(m) && [
							2,
							3,
							4
						].includes(m % 10) ? x.j.get("translationTakeApproximatelyMinute").replace("{0}", w) : x.j.get("translationTakeApproximatelyMinutes").replace("{0}", w);
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/storage.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						_: () => updateConfig,
						d: () => F
					});
					var x = g("./src/config/config.js"), w = g("./src/localization/localizationProvider.ts"), D = g("./src/utils/debug.ts"), O = p([w]);
					w = (O.then ? (await O)() : O)[0];
					let A = {
						numToBool: [
							["autoTranslate"],
							["dontTranslateYourLang", "enabledDontTranslateLanguages"],
							["autoSetVolumeYandexStyle", "enabledAutoVolume"],
							["showVideoSlider"],
							["syncVolume"],
							["downloadWithName"],
							["sendNotifyOnComplete"],
							["highlightWords"],
							["onlyBypassMediaCSP"],
							["newAudioPlayer"],
							["showPiPButton"],
							["translateAPIErrors"],
							["audioBooster"],
							["useNewModel", "useLivelyVoice"]
						],
						number: [["autoVolume"]],
						array: [["dontTranslateLanguage", "dontTranslateLanguages"]],
						string: [
							["hotkeyButton", "translationHotkey"],
							["locale-lang-override", "localeLangOverride"],
							["locale-lang", "localeLang"]
						]
					};
					function getCompatCategory(p, m, g) {
						if (typeof m == "number") return g?.number.some((m) => m[0] === p) ? "number" : "numToBool";
						if (Array.isArray(m)) return "array";
						if (typeof m == "string" || m === null) return "string";
					}
					function convertByCompatCategory(p, m) {
						return [
							"string",
							"array",
							"number"
						].includes(p) ? m : !!m;
					}
					async function updateConfig(p) {
						if (p.compatVersion === x.r4) return p;
						let m = Object.values(A).flat().reduce((p, m) => (m[1] && (p[m[0]] = void 0), p), {}), g = await F.getValues(m), _ = Object.fromEntries(Object.entries(g).filter(([p, m]) => m !== void 0)), D = {
							...p,
							..._
						}, O = Object.keys(D).reduce((p, m) => (p[m] = void 0, p), {}), U = await F.getValues(O), K = p;
						for (let [p, m] of Object.entries(D)) {
							let g = getCompatCategory(p, m, A);
							if (!g) continue;
							let x = A[g].find((m) => m[0] === p);
							if (!x) continue;
							let D = x[1] ?? p;
							if (U[p] === void 0) continue;
							let O = convertByCompatCategory(g, m);
							p === "autoVolume" && m < 1 && (O = Math.round(m * 100)), K[D] = O, _[p] !== void 0 && await F.delete(p), D === "localeLangOverride" && await w.j.changeLang(m), await F.set(D, O);
						}
						return {
							...K,
							compatVersion: "2025-05-09"
						};
					}
					let F = new class {
						constructor() {
							D.A.log("[VOT Storage] Using chrome.storage.local");
						}
						get isSupportOnlyLS() {
							return !1;
						}
						async get(p, m) {
							let g = await (chrome.storage.local.get(p));
							return g[p] === void 0 ? m : g[p];
						}
						async getValues(p) {
							let m = (Object.keys(p)), g = await (chrome.storage.local.get(m)), _ = {};
							for (let x of m) _[x] = g[x] === void 0 ? p[x] : g[x];
							return _;
						}
						async set(p, m) {
							await chrome.storage.local.set({ [p]: m });
						}
						async delete(p) {
							await chrome.storage.local.remove(p);
						}
						async list() {
							let p = await (chrome.storage.local.get(null));
							return Object.keys(p);
						}
					}();
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/translateApis.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						Tl: () => translate,
						o0: () => detect,
						qh: () => K,
						vN: () => U
					});
					var x = g("./src/config/config.js"), w = g("./src/utils/gm.ts"), D = g("./src/utils/storage.ts"), O = p([w, D]);
					[w, D] = O.then ? (await O)() : O;
					let A = new class {
						isFOSWLYError(p) {
							return Object.hasOwn(p, "error");
						}
						async request(p, m = {}) {
							try {
								let g = await ((0, w.G3)(`${x.k$}${p}`, {
									timeout: 3e3,
									...m
								})), _ = await (g.json());
								if (this.isFOSWLYError(_)) throw _.error;
								return _;
							} catch (p) {
								console.warn(`[VOT] Failed to get data from FOSWLY Translate API, because ${p.message}`);
								return;
							}
						}
						async translateMultiple(p, m, g) {
							let _ = await (this.request("/translate", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									text: p,
									lang: m,
									service: g
								})
							}));
							return _ ? _.translations : p;
						}
						async translate(p, m, g) {
							let _ = await (this.request(`/translate?${new URLSearchParams({
								text: p,
								lang: m,
								service: g
							})}`));
							return _ ? _.translations[0] : p;
						}
						async detect(p, m) {
							let g = await (this.request(`/detect?${new URLSearchParams({
								text: p,
								service: m
							})}`));
							return g ? g.lang : "en";
						}
					}(), F = { async detect(p) {
						try {
							let m = await (0, w.G3)(x.sl, {
								method: "POST",
								body: p,
								timeout: 3e3
							});
							return await m.text();
						} catch (p) {
							return console.warn(`[VOT] Error getting lang from text, because ${p.message}`), "en";
						}
					} };
					async function translate(p, m = "", g = "ru") {
						let _ = await D.d.get("translationService", x.mE);
						switch (_) {
							case "yandexbrowser":
							case "msedge": {
								let x = m && g ? `${m}-${g}` : g;
								return Array.isArray(p) ? await A.translateMultiple(p, x, _) : await A.translate(p, x, _);
							}
							default: return p;
						}
					}
					async function detect(p) {
						let m = await D.d.get("detectService", x.K2);
						switch (m) {
							case "yandexbrowser":
							case "msedge": return await A.detect(p, m);
							case "rust-server": return await F.detect(p);
							default: return "en";
						}
					}
					let U = ["yandexbrowser", "msedge"], K = [...U, "rust-server"];
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/utils.ts": (p, m, g) => {
			"use strict";
			g.a(p, async (p, _) => {
				try {
					g.d(m, {
						Bs: () => isPiPAvailable,
						CK: () => initHls,
						Eh: () => exitFullscreen,
						GW: () => toFlatObj,
						HD: () => le,
						Le: () => clearFileName,
						MR: () => downloadTranslation,
						R5: () => ue,
						UV: () => waitForCondition,
						WN: () => downloadBlob,
						Wo: () => openDownloadTranslation,
						X5: () => cleanText,
						dJ: () => getHeaders,
						lg: () => getTimestamp,
						qE: () => clamp,
						wR: () => timeout
					});
					var x = g("./node_modules/bowser/es5.js"), w = g.n(x), D = g("./node_modules/browser-id3-writer/dist/browser-id3-writer.mjs"), O = g("./node_modules/@vot.js/shared/dist/data/consts.js"), A = g("./src/utils/localization.ts"), F = g("./node_modules/hls.js/dist/hls.light.min.js").default, U = p([A]);
					A = (U.then ? (await U)() : U)[0];
					let K = /(?:https?|www|\bhttp\s+)[^\s/]*?(?:\.\s*[a-z]{2,}|\/)\S*|#[^\s#]+|auto-generated\s+by\s+youtube|provided\s+to\s+youtube\s+by|released\s+on|paypal?|0x[\da-f]{40}|[13][1-9a-z]{25,34}|4[\dab][1-9a-z]{93}|t[1-9a-z]{33}/gi, oe = new Set([
						"uk",
						"be",
						"bg",
						"mk",
						"sr",
						"bs",
						"hr",
						"sl",
						"pl",
						"sk",
						"cs"
					]), le = (() => O.Xh.includes(A.v) ? A.v : oe.has(A.v) ? "ru" : "en")(), ue = w().getParser(window.navigator.userAgent).getResult(), isPiPAvailable = () => "pictureInPictureEnabled" in document && document.pictureInPictureEnabled;
					function initHls() {
						return F !== void 0 && F?.isSupported() ? new F({
							debug: !1,
							lowLatencyMode: !0,
							backBufferLength: 90
						}) : void 0;
					}
					function cleanText(p, m) {
						return (p + " " + (m || "")).replace(K, "").replace(/[^\p{L}]+/gu, " ").substring(0, 450).trim();
					}
					function downloadBlob(p, m) {
						let g = URL.createObjectURL(p), _ = document.createElement("a");
						_.href = g, _.download = m, _.click(), URL.revokeObjectURL(g);
					}
					function clearFileName(p) {
						return p.trim().length === 0 ? new Date().toLocaleDateString("en-us").replaceAll("/", "-") : p.replace(/^https?:\/\//, "").replace(/[\\/:*?"'<>|]/g, "-");
					}
					function getTimestamp() {
						return Math.floor(Date.now() / 1e3);
					}
					function getHeaders(p) {
						return p instanceof Headers ? Object.fromEntries(p.entries()) : Array.isArray(p) ? Object.fromEntries(p) : p || {};
					}
					function clamp(p, m = 0, g = 100) {
						return Math.min(Math.max(p, m), g);
					}
					function toFlatObj(p) {
						return Object.entries(p).reduce((m, [g, _]) => {
							if (_ === void 0) return m;
							if (typeof _ != "object") return m[g] = _, m;
							let x = Object.entries(toFlatObj(p[g])).reduce((p, [m, _]) => (p[`${g}.${m}`] = _, p), {});
							return {
								...m,
								...x
							};
						}, {});
					}
					async function exitFullscreen() {
						let p = document;
						(p.fullscreenElement || p.webkitFullscreenElement) && (p.webkitExitFullscreen && await p.webkitExitFullscreen(), p.exitFullscreen && await p.exitFullscreen());
					}
					let sleep = (p) => new Promise((m) => setTimeout(m, p));
					function timeout(p, m = "Operation timed out") {
						return new Promise((g, _) => {
							setTimeout(() => _(Error(m)), p);
						});
					}
					async function waitForCondition(p, m, g = !1) {
						let _ = !1;
						return Promise.race([(async () => {
							for (; !p() && !_;) await sleep(100);
						})(), new Promise((p, x) => {
							setTimeout(() => {
								_ = !0, g ? x(Error(`Wait for condition reached timeout of ${m}`)) : p();
							}, m);
						})]);
					}
					async function _downloadTranslationWithProgress(p, m, g = (p) => {}) {
						let _ = p.body?.getReader();
						if (!_) throw Error("Response body is not readable");
						let x = new Uint8Array(m), w = 0;
						for (;;) {
							let { done: p, value: D } = await _.read();
							if (p) break;
							x.set(D, w), w += D.length, g(Math.round(w / m * 100));
						}
						return x.buffer;
					}
					async function downloadTranslation(p, m, g = (p) => {}) {
						let _ = +(p.headers.get("Content-Length") ?? 0), x = await (_ ? _downloadTranslationWithProgress(p, _, g) : p.arrayBuffer());
						g(100);
						let w = new D.Q(x);
						return w.setFrame("TIT2", m), w.addTag(), downloadBlob(w.getBlob(), `${m}.mp3`), !0;
					}
					function openDownloadTranslation(p) {
						window.open(p, "_blank")?.focus();
					}
					_();
				} catch (p) {
					_(p);
				}
			});
		},
		"./src/utils/volume.ts": (p, m, g) => {
			"use strict";
			g.d(m, { q: () => syncVolume });
			function syncVolume(p, m, g, _) {
				let x = m;
				return m > _ ? (x = g + (m - _), x = x > 100 ? 100 : Math.max(x, 0), p.volume = x / 100) : m < _ && (x = g - (_ - m), x = x > 100 ? 100 : Math.max(x, 0), p.volume = x / 100), x;
			}
		}
	}, m = {};
	function __webpack_require__(g) {
		var _ = m[g];
		if (_ !== void 0) return _.exports;
		var x = m[g] = { exports: {} };
		return p[g].call(x.exports, x, x.exports, __webpack_require__), x.exports;
	}
	(() => {
		var p = typeof Symbol == "function" ? Symbol("webpack queues") : "__webpack_queues__", m = typeof Symbol == "function" ? Symbol("webpack exports") : "__webpack_exports__", g = typeof Symbol == "function" ? Symbol("webpack error") : "__webpack_error__", resolveQueue = (p) => {
			p && p.d < 1 && (p.d = 1, p.forEach((p) => p.r--), p.forEach((p) => p.r-- ? p.r++ : p()));
		}, wrapDeps = (_) => _.map((_) => {
			if (typeof _ == "object" && _) {
				if (_[p]) return _;
				if (_.then) {
					var x = [];
					x.d = 0, _.then((p) => {
						w[m] = p, resolveQueue(x);
					}, (p) => {
						w[g] = p, resolveQueue(x);
					});
					var w = {};
					return w[p] = (p) => p(x), w;
				}
			}
			var D = {};
			return D[p] = (p) => {}, D[m] = _, D;
		});
		__webpack_require__.a = (_, x, w) => {
			var D;
			w && ((D = []).d = -1);
			var O = new Set(), exports = _.exports, F, U, K, oe = new Promise((p, m) => {
				K = m, U = p;
			});
			oe[m] = exports, oe[p] = (p) => (D && p(D), O.forEach(p), oe.catch((p) => {})), _.exports = oe, x((_) => {
				F = wrapDeps(_);
				var fn, getResult = () => F.map((p) => {
					if (p[g]) throw p[g];
					return p[m];
				}), x = new Promise((m) => {
					fn = () => m(getResult), fn.r = 0;
					var fnQueue = (p) => p !== D && !O.has(p) && (O.add(p), p && !p.d && (fn.r++, p.push(fn)));
					F.map((m) => m[p](fnQueue));
				});
				return fn.r ? x : getResult();
			}, (p) => (p ? K(oe[g] = p) : U(exports), resolveQueue(D))), D && D.d < 0 && (D.d = 0);
		};
	})(), __webpack_require__.n = (p) => {
		var m = p && p.__esModule ? () => p.default : () => p;
		return __webpack_require__.d(m, { a: m }), m;
	}, __webpack_require__.d = (exports, m) => {
		for (var g in m) __webpack_require__.o(m, g) && !__webpack_require__.o(exports, g) && Object.defineProperty(exports, g, {
			enumerable: !0,
			get: m[g]
		});
	}, __webpack_require__.o = (p, m) => Object.prototype.hasOwnProperty.call(p, m);
	var g = __webpack_require__("./src/index.js");
})();
