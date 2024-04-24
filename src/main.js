const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
    try {
        // Read package.json to get the current version
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const version = packageJson.version;

        const token = process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(token);

        // Check if the tag already exists
        const tagName = `v${version}`;
        const { data: tags } = await octokit.rest.repos.listTags({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo
        });

        const tagExists = tags.some(tag => tag.name === tagName);

        if (tagExists) {
            console.log(`Tag ${tagName} already exists. Skipping creation.`);
        } else {
            // Create a tag
            const createTagResponse = await octokit.rest.git.createTag({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                tag: tagName,
                message: `Release ${tagName}`,
                object: github.context.sha,
                type: 'commit'
            });

            // Create a reference to the tag
            // await octokit.rest.git.createRef({
            //     owner: github.context.repo.owner,
            //     repo: github.context.repo.repo,
            //     ref: `refs/tags/${tagName}`,
            //     sha: createTagResponse.data.sha
            // });

            // Create a release
            // const createReleaseResponse = await octokit.rest.repos.createRelease({
            //     owner: github.context.repo.owner,
            //     repo: github.context.repo.repo,
            //     tag_name: tagName,
            //     name: `Release ${tagName}`,
            //     body: `Release ${tagName}`,
            //     draft: false,
            //     prerelease: false
            // });

            // Upload a file if provided
            // const binaryPath = core.getInput('binary_path');
            // if (binaryPath) {
            //     const binaryData = fs.readFileSync(binaryPath);
            //     await octokit.rest.repos.uploadReleaseAsset({
            //         owner: github.context.repo.owner,
            //         repo: github.context.repo.repo,
            //         release_id: createReleaseResponse.data.id,
            //         name: binaryPath,
            //         data: binaryData
            //     });
            // }

            // console.log('Release created:', createReleaseResponse.data.html_url);
            console.log('Release created');
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();