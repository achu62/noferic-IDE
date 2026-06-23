//jai sri ram.

export function isValidJSON(json) {
	try {
		JSON.parse(json);

		return true;
	} catch (e) {
		return false;
	}
}


export const getfileiconbytype = {
	html: "images/html.png",
	htm: "images/code.svg",
	css: "images/css.svg",
	js: "images/js.svg",
	jsx: "images/atom.svg",
	ts: "images/tss.svg",
	tsx: "images/jsxrelated.svg",
	mjs: "images/code.svg",
	cjs: "images/code.svg",
	vue: "images/vue.svg",
	svelte: "images/svelte.svg",
	astro: "images/code.svg",
	php: "images/code.svg",
	phtml: "images/code.svg",
	jsp: "images/code.svg",
	asp: "images/code.svg",
	aspx: "images/code.svg",
	ejs: "images/code.svg",
	hbs: "images/code.svg",
	mustache: "images/code.svg",
	pug: "images/code.svg",
	twig: "images/code.svg",
	liquid: "images/code.svg",

	// PROGRAMMING
	c: "images/code.svg",
	cpp: "images/code.svg",
	h: "images/code.svg",
	hpp: "images/code.svg",
	cs: "images/code.svg",
	java: "images/code.svg",
	kt: "images/code.svg",
	kts: "images/code.svg",
	swift: "images/code.svg",
	go: "images/code.svg",
	rs: "images/code.svg",
	py: "images/code.svg",
	rb: "images/code.svg",
	pl: "images/code.svg",
	lua: "images/code.svg",
	r: "images/code.svg",
	dart: "images/code.svg",
	scala: "images/code.svg",
	groovy: "images/code.svg",
	sh: "images/code.svg",
	bash: "images/code.svg",
	zsh: "images/code.svg",
	fish: "images/code.svg",
	ps1: "images/code.svg",
	bat: "images/code.svg",
	cmd: "images/code.svg",

	// DATABASE / QUERY
	sql: "images/code.svg",
	graphql: "images/code.svg",
	gql: "images/code.svg",

	// CONFIG
	json: "images/json.svg",
	yaml: "images/config.svg",
	yml: "images/config.svg",
	toml: "images/config.svg",
	ini: "images/config.svg",
	env: "images/config.svg",
	conf: "images/config.svg",
	config: "images/config.svg",
	properties: "images/config.svg",
	xml: "images/xml.svg",
	gradle: "images/config.svg",
	npmrc: "images/config.svg",
	editorconfig: "images/config.svg",
	gitignore: "images/commit.svg",
	gitattributes: "images/commit.svg",
	dockerfile: "images/config.svg",

	// TEXT
	txt: "images/text.svg",
	md: "images/md.svg",
	markdown: "images/md.svg",
	log: "images/text.svg",
	csv: "images/text.svg",
	tsv: "images/text.svg",

	// DOCUMENTS
	pdf: "images/text.svg",
	doc: "images/text.svg",
	docx: "images/text.svg",
	ppt: "images/text.svg",
	pptx: "images/text.svg",
	xls: "images/text.svg",
	xlsx: "images/text.svg",
	odt: "images/text.svg",
	ods: "images/text.svg",
	odp: "images/text.svg",
	rtf: "images/text.svg",

	// IMAGES
	png: "images/image.svg",
	jpg: "images/image.svg",
	jpeg: "images/image.svg",
	gif: "images/image.svg",
	bmp: "images/image.svg",
	webp: "images/image.svg",
	svg: "images/image.svg",
	ico: "images/image.svg",
	tiff: "images/image.svg",
	tif: "images/image.svg",
	avif: "images/image.svg",
	heic: "images/image.svg",
	heif: "images/image.svg",
	psd: "images/image.svg",
	ai: "images/image.svg",
	eps: "images/image.svg",
	raw: "images/image.svg",
	dng: "images/image.svg",

	// VIDEO
	mp4: "images/video.svg",
	mkv: "images/video.svg",
	avi: "images/video.svg",
	mov: "images/video.svg",
	wmv: "images/video.svg",
	flv: "images/video.svg",
	webm: "images/video.svg",
	m4v: "images/video.svg",
	mpg: "images/video.svg",
	mpeg: "images/video.svg",
	"3gp": "images/video.svg",

	// AUDIO
	mp3: "images/audio.svg",
	wav: "images/audio.svg",
	ogg: "images/audio.svg",
	flac: "images/audio.svg",
	aac: "images/audio.svg",
	m4a: "images/audio.svg",
	wma: "images/audio.svg",
	aiff: "images/audio.svg",
	opus: "images/audio.svg",
	mid: "images/audio.svg",
	midi: "images/audio.svg",

	// ARCHIVES
	zip: "images/config.svg",
	rar: "images/config.svg",
	"7z": "images/config.svg",
	tar: "images/config.svg",
	gz: "images/config.svg",
	bz2: "images/config.svg",
	xz: "images/config.svg",
	iso: "images/config.svg",

	// FONTS
	ttf: "images/text.svg",
	otf: "images/text.svg",
	woff: "images/text.svg",
	woff2: "images/text.svg",
	eot: "images/text.svg",

	// EXECUTABLES
	exe: "images/code.svg",
	dll: "images/code.svg",
	apk: "images/code.svg",
	app: "images/code.svg",
	deb: "images/code.svg",
	rpm: "images/code.svg",
	msi: "images/code.svg",
	bin: "images/code.svg",
};
export function dialogclicker(dialog, clicker) {
	let isopen = false;
	clicker.addEventListener("click", () => {
		if (!isopen) {
			dialog.show();
			isopen = true;
		} else {
			dialog.close();
			isopen = false;
		}
	});
}

export function recursiveid(count, item) {
	for (const file of item) {
		file.id = count;
		count++;
		if (file.haschildren && file.children) {
			const newCount = recursiveid(count, file.children);
			count = newCount;
		}
	}
	return count;
}
export function DeleteOldWorkspace(fileexplorer, opentabs, iframe) {
	fileexplorer.replaceChildren("");
	opentabs.replaceChildren("");
	iframe.contentWindow.postMessage({
		action:"deleteallmodels"
	})
}
export function findFolderById(rootArray, targetId) {
	for (const item of rootArray) {
		if (item.id === targetId) {
			return item;
		}
		if (item.isdirectory && item.children) {
			const found = findFolderById(item.children, targetId);
			if (found) return found;
		}
	}
	return null;
}

//
