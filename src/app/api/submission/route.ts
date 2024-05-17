import { exec, spawn } from "child_process";
import { copyFileSync, readFileSync, rmSync, rmdirSync, unlinkSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import { wss } from "../websocket/route";

const git: SimpleGit = simpleGit().clean(CleanOptions.FORCE);

export function GET(req: NextRequest) {
    return NextResponse.json({ message: "Hello, world!" });
}

export async function POST(req: any) {
    const body = await req.json();
    const { githubUrl, entry } = body;
    const split = githubUrl.split("/");
    const dir = `./tmp/${split[2]}/${split[3]}/${split[4]}`;

    // io.emit('progress', { message: 'Cloning repository' })
    const tmp = await git.clone(body.githubUrl, dir).catch((err) => {
        console.error(err);
        return NextResponse.json({ message: "Error cloning repository" }, { status: 500 });
    })
    buildImage(dir, entry);
    return NextResponse.json({ message: "Repository cloned, building in progress" });
}

async function buildImage(dir: string, entry: string) {
    console.log('Building image...', dir)
    const dirSplit = dir.split('/');

    // read Dockerfile and replace CMD [ "node", "index.js" ] with CMD ["node", entry]
    const dockerFile = `${dir}/Dockerfile`;
    const data = readFileSync(dockerFile, 'utf8');
    const result = data.replace(/CMD \[ "node", "index.js" \]/g, `CMD ["node", "${entry}"]`);
    writeFileSync(dockerFile, result, 'utf8');
    wss?.emit('progress', { message: 'Building image' })
    // copy new dockerfile to dir
    copyFileSync(dockerFile, `${dir}/Dockerfile`);
    // go to dir
    const currentDir = process.cwd();
    process.chdir(dir);

    const imgName = `${dirSplit[2]}/${dirSplit[3]}/${dirSplit[4]}`
    console.log('Building image...', imgName)
    const buildProcess = spawn('docker', ['build', '-t', imgName, '.']);

    buildProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        wss?.emit('progress', { message: data })

    });

    buildProcess.stderr.on('data', (data) => {
        wss?.emit('progress', { message: data })
        console.error(`stderr: ${data}`);
    });

    buildProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        wss?.emit('progress', { message: 'Image built' })
        process.chdir(currentDir);
        // run detached container
        console.log('Running container...')

        wss?.emit('progress', { message: 'Running container' })
        const containerName = imgName.replaceAll('/', '_');
        exec(`docker run -d --name ${containerName} ${imgName}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
        // remove dir
        rmSync(`${dir}`, { recursive: true });
        wss?.emit('progress', { message: 'Container running at http://localhost:3000' })
    });



}
