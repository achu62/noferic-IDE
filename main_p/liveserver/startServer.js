import path from "node:path";
import liveServer from "live-server";

export const start_server = async (e, obj, pathreal) => {
	//console.log(obj);

	const serverParams = {
		port: obj.port,
		host: "127.0.0.1",
		root: path.join(pathreal, obj.relativepath),
		open: obj.toOpen,
		wait: 100,
	};

	liveServer.start(serverParams);
};
