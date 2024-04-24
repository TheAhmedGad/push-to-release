const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');

async function run() {
    try {
        // Read package.json to get the current version
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const version = packageJson.version;

        const token = process.env.GITHUB_TOKEN;
        const octokit = new Octokit({ auth: token });

        // Check if the tag already exists
        const tagName = `v${version}`;
        const { data: tags } = await octokit.repos.listTags({
            owner: process.env.GITHUB_REPOSITORY.split("/")[0],
            repo: process.env.GITHUB_REPOSITORY.split("/")[1]
        });

        const tagExists = tags.some(tag => tag.name === tagName);

        if (tagExists) {
            console.log(`Tag ${tagName} already exists. Skipping creation.`);
        } else {
            // Create a tag
            const createTagResponse = await octokit.git.createTag({
                owner: process.env.GITHUB_REPOSITORY.split("/")[0],
                repo: process.env.GITHUB_REPOSITORY.split("/")[1],
                tag: tagName,
                message: `Release ${tagName}`,
                object: process.env.GITHUB_SHA,
                type: 'commit'
            });

            // Create a reference to the tag
            await octokit.git.createRef({
                owner: process.env.GITHUB_REPOSITORY.split("/")[0],
                repo: process.env.GITHUB_REPOSITORY.split("/")[1],
                ref: `refs/tags/${tagName}`,
                sha: createTagResponse.data.sha
            });

            // Create a release
            const createReleaseResponse = await octokit.repos.createRelease({
                owner: process.env.GITHUB_REPOSITORY.split("/")[0],
                repo: process.env.GITHUB_REPOSITORY.split("/")[1],
                tag_name: tagName,
                name: `Release ${tagName}`,
                body: `Release ${tagName}`,
                draft: false,
                prerelease: false
            });

            // Upload a file if provided
            const binaryPath = process.env.BINARY_PATH;
            if (binaryPath) {
                const binaryData = fs.readFileSync(binaryPath);
                await octokit.repos.uploadReleaseAsset({
                    owner: process.env.GITHUB_REPOSITORY.split("/")[0],
                    repo: process.env.GITHUB_REPOSITORY.split("/")[1],
                    release_id: createReleaseResponse.data.id,
                    name: binaryPath,
                    data: binaryData
                });
            }

            console.log('Release created:', createReleaseResponse.data.html_url);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
