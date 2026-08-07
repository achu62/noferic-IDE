import fs from "node:fs";
import path from "node:path";
import { detectPort } from "detect-port";

export const validate_details_liveserver = async (e, d, pathreal, consolelog) => {
	const aport = await detectPort(d.port);
	//console.log(aport);
	//console.log(d.port);
	const npromise = new Promise((re, rej) => {
		//console.log(path.join(pathreal, d.relativepath));

		if (!fs.existsSync(path.join(pathreal, d.relativepath))) {
			rej(new Error(`${path.join(pathreal, d.relativepath)} does not exist`));
		}

		if (aport !== parseInt(d.port)) {
			//console.log("nnooo");
			rej(
				new Error(
					`Port ${d.port} seems to be not availible \nit is recommended to try out another availible port\nit has been detected  that port ${aport} might be free`,
				),
			);
		} else {
			re(true);
		}
	});
	return npromise;
};
